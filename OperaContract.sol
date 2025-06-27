// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

/**
    @title Opera - Open Payroll Raising Automatically
*/
contract OperaContract is Ownable, AutomationCompatibleInterface, ReentrancyGuard, VRFConsumerBaseV2 {
    struct Employer {
        string name;
        uint256 balance;
        bool active;
        uint256 registrationTime;
    }

    struct Employee {
        address payable walletAddress;
        string name;
        uint256 salary;
        uint256 lastPayment;
        bool active;
        address employer;
    }

    mapping(address => Employee) public employees;
    mapping(address => Employer) public employers;

    mapping(address => address[]) public employerToEmployees;
    address[] public employerAddresses;
    address[] public employeeAddresses;

    uint256 public constant PAYMENT_INTERVAL = 30 days;

    uint256 public bonusAmount = 0.1 ether;

    bool public bonusLotteryEnabled = true;

    address public lastBonusWinner;

    uint256 public lastRequestId;

    uint256 public employerRegistrationFee = 0.01 ether;

    VRFCoordinatorV2Interface private immutable COORDINATOR;
    bytes32 private immutable s_keyHash;
    uint256 private s_subscriptionId;
    uint32 private constant CALLBACK_GAS_LIMIT = 200000;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    modifier onlyEmployer() {
        require(employers[msg.sender].active, "Not an active employer");
        _;
    }

    event EmployerRegistered(address indexed employerAddress, string name);
    event EmployerDeactivated(address indexed employerAddress);
    event EmployerFundsDeposited(address indexed employerAddress, uint256 amount);
    event EmployeeAdded(address indexed employerAddress, address indexed employeeAddress, string name, uint256 salaryEth);
    event EmployeeRemoved(address indexed employerAddress, address indexed employeeAddress);
    event SalaryUpdated(address indexed employerAddress, address indexed employeeAddress, uint256 newSalaryEth);
    event PaymentSent(address indexed employerAddress, address indexed employeeAddress, uint256 amount);
    event BonusWinnerSelected(address indexed winner, uint256 amount);
    event RandomnessRequested(uint256 requestId);
    event BonusAmountUpdated(uint256 newAmount);
    event BonusLotteryToggled(bool enabled);
    event EmployerRegistrationFeeUpdated(uint256 newFee);

    constructor(
        address _vrfCoordinator,
        uint256 _subscriptionId,
        bytes32 _keyHash
    ) Ownable(msg.sender) VRFConsumerBaseV2(_vrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
        s_subscriptionId = _subscriptionId;
        s_keyHash = _keyHash;

        _registerEmployer(msg.sender, "System Admin", true);
    }

    function registerAsEmployer(string memory _name) external payable {
        require(msg.value >= employerRegistrationFee, "Insufficient registration fee");
        require(!employers[msg.sender].active, "Already registered as employer");

        payable(owner()).transfer(employerRegistrationFee);

        if (msg.value > employerRegistrationFee) {
            payable(msg.sender).transfer(msg.value - employerRegistrationFee);
        }

        _registerEmployer(msg.sender, _name, true);
    }

    function _registerEmployer(address _employerAddress, string memory _name, bool) internal {
        employers[_employerAddress] = Employer({
            name: _name,
            balance: 0,
            active: true,
            registrationTime: block.timestamp
        });

        employerAddresses.push(_employerAddress);
        emit EmployerRegistered(_employerAddress, _name);
    }

    function setEmployerStatus(address _employerAddress, bool _active) external onlyOwner {
        require(employers[_employerAddress].registrationTime > 0, "Employer does not exist");
        employers[_employerAddress].active = _active;

        if (!_active) {
            emit EmployerDeactivated(_employerAddress);
        }
    }

    function setEmployerRegistrationFee(uint256 _newFee) external onlyOwner {
        employerRegistrationFee = _newFee;
        emit EmployerRegistrationFeeUpdated(_newFee);
    }

    function depositFunds() external payable onlyEmployer {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        employers[msg.sender].balance += msg.value;
        emit EmployerFundsDeposited(msg.sender, msg.value);
    }

    function addEmployee(
        address payable _walletAddress,
        string memory _name,
        uint256 _salaryEth
    ) external onlyEmployer {
        require(_walletAddress != address(0), "Invalid address");
        require(employees[_walletAddress].walletAddress == address(0), "Employee already exists");

        employees[_walletAddress] = Employee({
            walletAddress: _walletAddress,
            name: _name,
            salary: _salaryEth,
            lastPayment: block.timestamp,
            active: true,
            employer: msg.sender
        });

        employeeAddresses.push(_walletAddress);
        employerToEmployees[msg.sender].push(_walletAddress);
        emit EmployeeAdded(msg.sender, _walletAddress, _name, _salaryEth);
    }

    function removeEmployee(address _employeeAddress) external {
        require(employees[_employeeAddress].walletAddress != address(0), "Employee doesn't exist");

        require(
            employees[_employeeAddress].employer == msg.sender || msg.sender == owner(),
            "Not authorized to remove this employee"
        );

        employees[_employeeAddress].active = false;

        for (uint256 i = 0; i < employeeAddresses.length; i++) {
            if (employeeAddresses[i] == _employeeAddress) {
                employeeAddresses[i] = employeeAddresses[employeeAddresses.length - 1];
                employeeAddresses.pop();
                break;
            }
        }

        address employerAddr = employees[_employeeAddress].employer;
        for (uint256 i = 0; i < employerToEmployees[employerAddr].length; i++) {
            if (employerToEmployees[employerAddr][i] == _employeeAddress) {
                employerToEmployees[employerAddr][i] = employerToEmployees[employerAddr][employerToEmployees[employerAddr].length - 1];
                employerToEmployees[employerAddr].pop();
                break;
            }
        }

        emit EmployeeRemoved(employees[_employeeAddress].employer, _employeeAddress);
    }

    function updateSalary(address _employeeAddress, uint256 _newSalaryEth) external {
        require(employees[_employeeAddress].walletAddress != address(0), "Employee doesn't exist");
        require(employees[_employeeAddress].active, "Employee is not active");

        require(
            employees[_employeeAddress].employer == msg.sender || msg.sender == owner(),
            "Not authorized to update salary for this employee"
        );

        employees[_employeeAddress].salary = _newSalaryEth;

        emit SalaryUpdated(employees[_employeeAddress].employer, _employeeAddress, _newSalaryEth);
    }

    function payEmployee(address _employeeAddress) internal returns (bool) {
        Employee storage employee = employees[_employeeAddress];

        if (!employee.active || employee.walletAddress == address(0)) {
            return false;
        }

        if (block.timestamp < employee.lastPayment + PAYMENT_INTERVAL) {
            return false;
        }

        address employerAddr = employee.employer;
        if (employers[employerAddr].balance < employee.salary) {
            return false;
        }

        employee.lastPayment = block.timestamp;

        employers[employerAddr].balance -= employee.salary;

        (bool success, ) = employee.walletAddress.call{value: employee.salary}("");

        if (success) {
            emit PaymentSent(employerAddr, employee.walletAddress, employee.salary);
        }

        return success;
    }

    function _payEmployeesForEmployer(address _employerAddress) internal returns (bool) {
        bool allSuccessful = true;

        for (uint256 i = 0; i < employerToEmployees[_employerAddress].length; i++) {
            address employeeAddress = employerToEmployees[_employerAddress][i];
            if (employees[employeeAddress].active) {
                bool success = payEmployee(employeeAddress);

                if (!success) {
                    allSuccessful = false;
                }
            }
        }

        return allSuccessful;
    }

    function _payAllEmployees() internal returns (bool) {
        bool allSuccessful = true;

        for (uint256 i = 0; i < employeeAddresses.length; i++) {
            address employeeAddress = employeeAddresses[i];
            bool success = payEmployee(employeeAddress);

            if (!success) {
                allSuccessful = false;
            }
        }

        if (allSuccessful && bonusLotteryEnabled && employeeAddresses.length > 0) {
            _requestRandomness();
        }

        return allSuccessful;
    }

    function payMyEmployees() external onlyEmployer nonReentrant returns (bool) {
        return _payEmployeesForEmployer(msg.sender);
    }

    function payAllEmployees() external nonReentrant returns (bool) {
        require(msg.sender == owner() || msg.sender == address(this), "Not authorized");
        return _payAllEmployees();
    }

    function checkUpkeep(bytes calldata /* checkData */) external view override returns (bool upkeepNeeded, bytes memory /* performData */) {
        upkeepNeeded = false;

        for (uint256 i = 0; i < employeeAddresses.length; i++) {
            address employeeAddress = employeeAddresses[i];
            Employee storage employee = employees[employeeAddress];

            if (employee.active &&
                block.timestamp >= employee.lastPayment + PAYMENT_INTERVAL &&
                employers[employee.employer].balance >= employee.salary) {
                upkeepNeeded = true;
                break;
            }
        }

        return (upkeepNeeded, "");
    }

    function performUpkeep(bytes calldata /* performData */) external override {
        _payAllEmployees();
    }

    function _requestRandomness() internal {
        require(address(this).balance >= bonusAmount, "Insufficient balance for bonus");

        uint256 activeEmployees = 0;
        for (uint256 i = 0; i < employeeAddresses.length; i++) {
            if (employees[employeeAddresses[i]].active) {
                activeEmployees++;
            }
        }
        require(activeEmployees > 0, "No active employees");

        lastRequestId = COORDINATOR.requestRandomWords(
            s_keyHash,
            uint64(s_subscriptionId),
            REQUEST_CONFIRMATIONS,
            CALLBACK_GAS_LIMIT,
            NUM_WORDS
        );

        emit RandomnessRequested(lastRequestId);
    }

    function fulfillRandomWords(
        uint256,
        uint256[] memory _randomWords
    ) internal override {
        uint256 activeEmployeesCount = 0;
        for (uint256 i = 0; i < employeeAddresses.length; i++) {
            if (employees[employeeAddresses[i]].active) {
                activeEmployeesCount++;
            }
        }

        if (activeEmployeesCount == 0) {
            return;
        }

        uint256 winnerIndex = _randomWords[0] % activeEmployeesCount;

        address payable winnerAddress;
        uint256 activeCount = 0;

        for (uint256 i = 0; i < employeeAddresses.length; i++) {
            if (employees[employeeAddresses[i]].active) {
                if (activeCount == winnerIndex) {
                    winnerAddress = employees[employeeAddresses[i]].walletAddress;
                    break;
                }
                activeCount++;
            }
        }

        require(winnerAddress != address(0), "Invalid winner address");

        if (address(this).balance < bonusAmount) {
            return;
        }

        (bool success, ) = winnerAddress.call{value: bonusAmount}("");

        if (success) {
            lastBonusWinner = winnerAddress;
            emit BonusWinnerSelected(winnerAddress, bonusAmount);
        }
    }

    function setBonusAmount(uint256 _newBonusAmount) external onlyOwner {
        bonusAmount = _newBonusAmount;
        emit BonusAmountUpdated(_newBonusAmount);
    }

    function toggleBonusLottery(bool _enabled) external onlyOwner {
        bonusLotteryEnabled = _enabled;
        emit BonusLotteryToggled(_enabled);
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getEmployerBalance(address _employerAddress) external view returns (uint256) {
        return employers[_employerAddress].balance;
    }

    function getEmployeeCount() external view returns (uint256) {
        return employeeAddresses.length;
    }

    function getEmployerCount() external view returns (uint256) {
        return employerAddresses.length;
    }

    function getEmployeeCountForEmployer(address _employerAddress) external view returns (uint256) {
        return employerToEmployees[_employerAddress].length;
    }

    function getTotalMonthlySalaryForEmployer(address _employerAddress) external view returns (uint256) {
        uint256 totalSalary = 0;

        for (uint256 i = 0; i < employerToEmployees[_employerAddress].length; i++) {
            address employeeAddress = employerToEmployees[_employerAddress][i];
            Employee storage employee = employees[employeeAddress];

            if (employee.active) {
                totalSalary += employee.salary;
            }
        }

        return totalSalary;
    }

    function getTotalMonthlySalary() external view returns (uint256) {
        uint256 totalSalary = 0;

        for (uint256 i = 0; i < employeeAddresses.length; i++) {
            address employeeAddress = employeeAddresses[i];
            Employee storage employee = employees[employeeAddress];

            if (employee.active) {
                totalSalary += employee.salary;
            }
        }

        return totalSalary;
    }

    function getActiveEmployeeCount() external view returns (uint256) {
        uint256 activeCount = 0;

        for (uint256 i = 0; i < employeeAddresses.length; i++) {
            if (employees[employeeAddresses[i]].active) {
                activeCount++;
            }
        }

        return activeCount;
    }

    function getActiveEmployerCount() external view returns (uint256) {
        uint256 activeCount = 0;

        for (uint256 i = 0; i < employerAddresses.length; i++) {
            if (employers[employerAddresses[i]].active) {
                activeCount++;
            }
        }

        return activeCount;
    }

    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function updateSubscriptionId(uint256 _newSubscriptionId) external onlyOwner {
        s_subscriptionId = _newSubscriptionId;
    }

    function runBonusLotteryManually() external onlyOwner {
        require(bonusLotteryEnabled, "Bonus lottery is disabled");
        _requestRandomness();
    }

    receive() external payable {
        if (employers[msg.sender].active) {
            employers[msg.sender].balance += msg.value;
            emit EmployerFundsDeposited(msg.sender, msg.value);
        }
    }
}
