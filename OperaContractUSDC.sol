// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
    @title Opera - Open Payroll Raising Automatically (USDC Version)
    @notice Payroll system using USDC stablecoin on Base network
*/
contract OperaContractUSDC is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // USDC token address (must be set in constructor based on network)
    IERC20 public immutable usdcToken;

    struct Employer {
        string name;
        uint256 balance;
        bool active;
        uint256 registrationTime;
    }

    struct Employee {
        address walletAddress;
        string name;
        uint256 salary; // In USDC (6 decimals)
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

    // Bonus amount in USDC (with 6 decimals, e.g., 100 USDC)
    uint256 public bonusAmount = 100 * 10**6;

    bool public bonusLotteryEnabled = true;

    address public lastBonusWinner;

    // Registration fee in USDC (with 6 decimals, e.g., 10 USDC)
    uint256 public employerRegistrationFee = 10 * 10**6;

    modifier onlyEmployer() {
        require(employers[msg.sender].active, "Not an active employer");
        _;
    }

    event EmployerRegistered(address indexed employerAddress, string name);
    event EmployerDeactivated(address indexed employerAddress);
    event EmployerFundsDeposited(address indexed employerAddress, uint256 amount);
    event EmployeeAdded(address indexed employerAddress, address indexed employeeAddress, string name, uint256 salaryUsdc);
    event EmployeeRemoved(address indexed employerAddress, address indexed employeeAddress);
    event SalaryUpdated(address indexed employerAddress, address indexed employeeAddress, uint256 newSalaryUsdc);
    event PaymentSent(address indexed employerAddress, address indexed employeeAddress, uint256 amount);
    event BonusWinnerSelected(address indexed winner, uint256 amount);
    event BonusAmountUpdated(uint256 newAmount);
    event BonusLotteryToggled(bool enabled);
    event EmployerRegistrationFeeUpdated(uint256 newFee);

    /**
     * @notice Constructor to initialize the contract with USDC token address
     * @param _usdcToken Address of USDC token contract on Base network
     */
    constructor(address _usdcToken) Ownable(msg.sender) {
        require(_usdcToken != address(0), "Invalid USDC token address");
        usdcToken = IERC20(_usdcToken);
        _registerEmployer(msg.sender, "System Admin", true);
    }

    /**
     * @notice Register as an employer by paying registration fee in USDC
     * @param _name Name of the employer
     */
    function registerAsEmployer(string memory _name) external {
        require(!employers[msg.sender].active, "Already registered as employer");

        // Transfer registration fee from employer to contract owner
        usdcToken.safeTransferFrom(msg.sender, owner(), employerRegistrationFee);

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

    /**
     * @notice Deposit USDC funds to employer balance
     * @param _amount Amount of USDC to deposit (with 6 decimals)
     */
    function depositFunds(uint256 _amount) external onlyEmployer {
        require(_amount > 0, "Deposit amount must be greater than 0");

        // Transfer USDC from employer to contract
        usdcToken.safeTransferFrom(msg.sender, address(this), _amount);

        employers[msg.sender].balance += _amount;
        emit EmployerFundsDeposited(msg.sender, _amount);
    }

    /**
     * @notice Add a new employee
     * @param _walletAddress Employee's wallet address
     * @param _name Employee's name
     * @param _salaryUsdc Monthly salary in USDC (with 6 decimals)
     */
    function addEmployee(
        address _walletAddress,
        string memory _name,
        uint256 _salaryUsdc
    ) external onlyEmployer {
        require(_walletAddress != address(0), "Invalid address");
        require(employees[_walletAddress].walletAddress == address(0), "Employee already exists");

        employees[_walletAddress] = Employee({
            walletAddress: _walletAddress,
            name: _name,
            salary: _salaryUsdc,
            lastPayment: block.timestamp,
            active: true,
            employer: msg.sender
        });

        employeeAddresses.push(_walletAddress);
        employerToEmployees[msg.sender].push(_walletAddress);
        emit EmployeeAdded(msg.sender, _walletAddress, _name, _salaryUsdc);
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

    function updateSalary(address _employeeAddress, uint256 _newSalaryUsdc) external {
        require(employees[_employeeAddress].walletAddress != address(0), "Employee doesn't exist");
        require(employees[_employeeAddress].active, "Employee is not active");

        require(
            employees[_employeeAddress].employer == msg.sender || msg.sender == owner(),
            "Not authorized to update salary for this employee"
        );

        employees[_employeeAddress].salary = _newSalaryUsdc;

        emit SalaryUpdated(employees[_employeeAddress].employer, _employeeAddress, _newSalaryUsdc);
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

        // Transfer USDC to employee
        usdcToken.safeTransfer(employee.walletAddress, employee.salary);

        emit PaymentSent(employerAddr, employee.walletAddress, employee.salary);

        return true;
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
            _selectRandomBonusWinner();
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

    // Simple pseudorandom bonus selection
    function _selectRandomBonusWinner() internal {
        require(usdcToken.balanceOf(address(this)) >= bonusAmount, "Insufficient USDC balance for bonus");

        uint256 activeEmployees = 0;
        for (uint256 i = 0; i < employeeAddresses.length; i++) {
            if (employees[employeeAddresses[i]].active) {
                activeEmployees++;
            }
        }
        require(activeEmployees > 0, "No active employees");

        // Simple pseudorandom selection
        uint256 randomIndex = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            block.number,
            employeeAddresses
        ))) % activeEmployees;

        address winnerAddress;
        uint256 activeCount = 0;

        for (uint256 i = 0; i < employeeAddresses.length; i++) {
            if (employees[employeeAddresses[i]].active) {
                if (activeCount == randomIndex) {
                    winnerAddress = employees[employeeAddresses[i]].walletAddress;
                    break;
                }
                activeCount++;
            }
        }

        require(winnerAddress != address(0), "Invalid winner address");

        if (usdcToken.balanceOf(address(this)) < bonusAmount) {
            return;
        }

        // Transfer bonus in USDC
        usdcToken.safeTransfer(winnerAddress, bonusAmount);
        lastBonusWinner = winnerAddress;
        emit BonusWinnerSelected(winnerAddress, bonusAmount);
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
        return usdcToken.balanceOf(address(this));
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

    /**
     * @notice Emergency withdraw USDC tokens (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = usdcToken.balanceOf(address(this));
        usdcToken.safeTransfer(owner(), balance);
    }

    function runBonusLotteryManually() external onlyOwner {
        require(bonusLotteryEnabled, "Bonus lottery is disabled");
        _selectRandomBonusWinner();
    }

    /**
     * @notice Get USDC token address
     */
    function getUsdcAddress() external view returns (address) {
        return address(usdcToken);
    }
}
