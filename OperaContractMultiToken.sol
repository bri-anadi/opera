// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
    @title Opera - Open Payroll Raising Automatically (Multi-Token Version)
    @notice Payroll system supporting multiple stablecoins (USDC, EURC) on Base network
*/
contract OperaContractMultiToken is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct TokenConfig {
        address contractAddress;
        uint8 decimals;
        bool isActive;
        uint256 registrationFee;
        uint256 bonusAmount;
    }

    struct Employer {
        string name;
        mapping(string => uint256) balances; // tokenSymbol => balance
        bool active;
        uint256 registrationTime;
    }

    struct Employee {
        address walletAddress;
        string name;
        string salaryTokenSymbol;
        uint256 salary;
        uint256 lastPayment;
        bool active;
        address employer;
    }

    // Token configurations
    mapping(string => TokenConfig) public supportedTokens;
    string[] public tokenSymbols;

    mapping(address => Employee) public employees;
    mapping(address => Employer) private employers;

    mapping(address => address[]) public employerToEmployees;
    address[] public employerAddresses;
    address[] public employeeAddresses;

    uint256 public constant PAYMENT_INTERVAL = 30 days;
    bool public bonusLotteryEnabled = true;
    address public lastBonusWinner;

    modifier onlyEmployer() {
        require(employers[msg.sender].active, "Not an active employer");
        _;
    }

    modifier validToken(string memory _tokenSymbol) {
        require(supportedTokens[_tokenSymbol].isActive, "Token not supported");
        _;
    }

    event EmployerRegistered(address indexed employerAddress, string name, string tokenSymbol);
    event EmployerDeactivated(address indexed employerAddress);
    event EmployerFundsDeposited(address indexed employerAddress, string tokenSymbol, uint256 amount);
    event EmployeeAdded(address indexed employerAddress, address indexed employeeAddress, string name, string tokenSymbol, uint256 salary);
    event EmployeeRemoved(address indexed employerAddress, address indexed employeeAddress);
    event SalaryUpdated(address indexed employerAddress, address indexed employeeAddress, string tokenSymbol, uint256 newSalary);
    event PaymentSent(address indexed employerAddress, address indexed employeeAddress, string tokenSymbol, uint256 amount);
    event BonusWinnerSelected(address indexed winner, string tokenSymbol, uint256 amount);
    event TokenAdded(string tokenSymbol, address tokenAddress);
    event TokenToggled(string tokenSymbol, bool isActive);
    event TokenConfigUpdated(string tokenSymbol);

    /**
     * @notice Constructor to initialize the contract with USDC and EURC support
     * @param _usdcToken Address of USDC token contract on Base network
     * @param _eurcToken Address of EURC token contract on Base network
     */
    constructor(address _usdcToken, address _eurcToken) Ownable(msg.sender) {
        require(_usdcToken != address(0), "Invalid USDC token address");
        require(_eurcToken != address(0), "Invalid EURC token address");

        // Add USDC
        supportedTokens["USDC"] = TokenConfig({
            contractAddress: _usdcToken,
            decimals: 6,
            isActive: true,
            registrationFee: 10 * 10**6, // 10 USDC
            bonusAmount: 100 * 10**6 // 100 USDC
        });
        tokenSymbols.push("USDC");
        emit TokenAdded("USDC", _usdcToken);

        // Add EURC
        supportedTokens["EURC"] = TokenConfig({
            contractAddress: _eurcToken,
            decimals: 6,
            isActive: true,
            registrationFee: 10 * 10**6, // 10 EURC
            bonusAmount: 100 * 10**6 // 100 EURC
        });
        tokenSymbols.push("EURC");
        emit TokenAdded("EURC", _eurcToken);

        // Register owner as system admin
        _registerEmployer(msg.sender, "System Admin");
    }

    /**
     * @notice Register as an employer by paying registration fee in selected token
     * @param _name Name of the employer
     * @param _tokenSymbol Token to use for registration fee (USDC or EURC)
     */
    function registerAsEmployer(string memory _name, string memory _tokenSymbol)
        external
        validToken(_tokenSymbol)
    {
        require(!employers[msg.sender].active, "Already registered as employer");

        TokenConfig memory tokenConfig = supportedTokens[_tokenSymbol];
        IERC20 token = IERC20(tokenConfig.contractAddress);

        // Transfer registration fee from employer to contract owner
        token.safeTransferFrom(msg.sender, owner(), tokenConfig.registrationFee);

        _registerEmployer(msg.sender, _name);
        emit EmployerRegistered(msg.sender, _name, _tokenSymbol);
    }

    function _registerEmployer(address _employerAddress, string memory _name) internal {
        Employer storage employer = employers[_employerAddress];
        employer.name = _name;
        employer.active = true;
        employer.registrationTime = block.timestamp;

        employerAddresses.push(_employerAddress);
    }

    /**
     * @notice Deposit funds to employer balance in selected token
     * @param _tokenSymbol Token to deposit (USDC or EURC)
     * @param _amount Amount to deposit (with token decimals)
     */
    function depositFunds(string memory _tokenSymbol, uint256 _amount)
        external
        onlyEmployer
        validToken(_tokenSymbol)
    {
        require(_amount > 0, "Deposit amount must be greater than 0");

        TokenConfig memory tokenConfig = supportedTokens[_tokenSymbol];
        IERC20 token = IERC20(tokenConfig.contractAddress);

        // Transfer tokens from employer to contract
        token.safeTransferFrom(msg.sender, address(this), _amount);

        employers[msg.sender].balances[_tokenSymbol] += _amount;
        emit EmployerFundsDeposited(msg.sender, _tokenSymbol, _amount);
    }

    /**
     * @notice Add a new employee with salary in selected token
     * @param _walletAddress Employee's wallet address
     * @param _name Employee's name
     * @param _tokenSymbol Token for salary payment (USDC or EURC)
     * @param _salary Monthly salary in selected token (with token decimals)
     */
    function addEmployee(
        address _walletAddress,
        string memory _name,
        string memory _tokenSymbol,
        uint256 _salary
    ) external onlyEmployer validToken(_tokenSymbol) {
        require(_walletAddress != address(0), "Invalid address");
        require(employees[_walletAddress].walletAddress == address(0), "Employee already exists");

        employees[_walletAddress] = Employee({
            walletAddress: _walletAddress,
            name: _name,
            salaryTokenSymbol: _tokenSymbol,
            salary: _salary,
            lastPayment: block.timestamp,
            active: true,
            employer: msg.sender
        });

        employeeAddresses.push(_walletAddress);
        employerToEmployees[msg.sender].push(_walletAddress);
        emit EmployeeAdded(msg.sender, _walletAddress, _name, _tokenSymbol, _salary);
    }

    /**
     * @notice Remove an employee
     */
    function removeEmployee(address _employeeAddress) external {
        require(employees[_employeeAddress].walletAddress != address(0), "Employee doesn't exist");

        require(
            employees[_employeeAddress].employer == msg.sender || msg.sender == owner(),
            "Not authorized to remove this employee"
        );

        employees[_employeeAddress].active = false;

        // Remove from employeeAddresses array
        for (uint256 i = 0; i < employeeAddresses.length; i++) {
            if (employeeAddresses[i] == _employeeAddress) {
                employeeAddresses[i] = employeeAddresses[employeeAddresses.length - 1];
                employeeAddresses.pop();
                break;
            }
        }

        // Remove from employerToEmployees mapping
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

    /**
     * @notice Update employee salary (can change amount and/or token)
     */
    function updateSalary(
        address _employeeAddress,
        string memory _tokenSymbol,
        uint256 _newSalary
    ) external validToken(_tokenSymbol) {
        require(employees[_employeeAddress].walletAddress != address(0), "Employee doesn't exist");
        require(employees[_employeeAddress].active, "Employee is not active");

        require(
            employees[_employeeAddress].employer == msg.sender || msg.sender == owner(),
            "Not authorized to update salary for this employee"
        );

        employees[_employeeAddress].salaryTokenSymbol = _tokenSymbol;
        employees[_employeeAddress].salary = _newSalary;

        emit SalaryUpdated(employees[_employeeAddress].employer, _employeeAddress, _tokenSymbol, _newSalary);
    }

    /**
     * @notice Pay a single employee
     */
    function payEmployee(address _employeeAddress) internal returns (bool) {
        Employee storage employee = employees[_employeeAddress];

        if (!employee.active || employee.walletAddress == address(0)) {
            return false;
        }

        if (block.timestamp < employee.lastPayment + PAYMENT_INTERVAL) {
            return false;
        }

        address employerAddr = employee.employer;
        string memory tokenSymbol = employee.salaryTokenSymbol;

        if (employers[employerAddr].balances[tokenSymbol] < employee.salary) {
            return false;
        }

        employee.lastPayment = block.timestamp;
        employers[employerAddr].balances[tokenSymbol] -= employee.salary;

        // Transfer tokens to employee
        TokenConfig memory tokenConfig = supportedTokens[tokenSymbol];
        IERC20 token = IERC20(tokenConfig.contractAddress);
        token.safeTransfer(employee.walletAddress, employee.salary);

        emit PaymentSent(employerAddr, employee.walletAddress, tokenSymbol, employee.salary);

        return true;
    }

    /**
     * @notice Pay all employees for a specific employer and token
     * @param _tokenSymbol Token to use for payments
     */
    function payMyEmployees(string memory _tokenSymbol)
        external
        onlyEmployer
        validToken(_tokenSymbol)
        nonReentrant
        returns (bool)
    {
        bool allSuccessful = true;

        for (uint256 i = 0; i < employerToEmployees[msg.sender].length; i++) {
            address employeeAddress = employerToEmployees[msg.sender][i];
            Employee storage employee = employees[employeeAddress];

            // Only pay employees with matching token
            if (employee.active &&
                keccak256(bytes(employee.salaryTokenSymbol)) == keccak256(bytes(_tokenSymbol))) {
                bool success = payEmployee(employeeAddress);

                if (!success) {
                    allSuccessful = false;
                }
            }
        }

        return allSuccessful;
    }

    /**
     * @notice Pay all employees (all tokens) - only owner
     */
    function payAllEmployees() external nonReentrant returns (bool) {
        require(msg.sender == owner() || msg.sender == address(this), "Not authorized");

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

    /**
     * @notice Select random bonus winner (uses USDC by default)
     */
    function _selectRandomBonusWinner() internal {
        string memory bonusToken = "USDC";
        TokenConfig memory tokenConfig = supportedTokens[bonusToken];
        IERC20 token = IERC20(tokenConfig.contractAddress);

        require(token.balanceOf(address(this)) >= tokenConfig.bonusAmount, "Insufficient balance for bonus");

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

        // Transfer bonus
        token.safeTransfer(winnerAddress, tokenConfig.bonusAmount);
        lastBonusWinner = winnerAddress;
        emit BonusWinnerSelected(winnerAddress, bonusToken, tokenConfig.bonusAmount);
    }

    // ===== VIEW FUNCTIONS =====

    function getEmployerBalance(address _employerAddress, string memory _tokenSymbol)
        external
        view
        returns (uint256)
    {
        return employers[_employerAddress].balances[_tokenSymbol];
    }

    function getEmployerInfo(address _employerAddress)
        external
        view
        returns (string memory name, bool active, uint256 registrationTime)
    {
        Employer storage employer = employers[_employerAddress];
        return (employer.name, employer.active, employer.registrationTime);
    }

    function getTotalMonthlySalaryForEmployer(address _employerAddress, string memory _tokenSymbol)
        external
        view
        returns (uint256)
    {
        uint256 totalSalary = 0;

        for (uint256 i = 0; i < employerToEmployees[_employerAddress].length; i++) {
            address employeeAddress = employerToEmployees[_employerAddress][i];
            Employee storage employee = employees[employeeAddress];

            if (employee.active &&
                keccak256(bytes(employee.salaryTokenSymbol)) == keccak256(bytes(_tokenSymbol))) {
                totalSalary += employee.salary;
            }
        }

        return totalSalary;
    }

    function getContractBalance(string memory _tokenSymbol)
        external
        view
        validToken(_tokenSymbol)
        returns (uint256)
    {
        TokenConfig memory tokenConfig = supportedTokens[_tokenSymbol];
        IERC20 token = IERC20(tokenConfig.contractAddress);
        return token.balanceOf(address(this));
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

    function getSupportedTokensCount() external view returns (uint256) {
        return tokenSymbols.length;
    }

    function getTokenAddress(string memory _tokenSymbol) external view returns (address) {
        return supportedTokens[_tokenSymbol].contractAddress;
    }

    // ===== ADMIN FUNCTIONS =====

    function setEmployerStatus(address _employerAddress, bool _active) external onlyOwner {
        require(employers[_employerAddress].registrationTime > 0, "Employer does not exist");
        employers[_employerAddress].active = _active;

        if (!_active) {
            emit EmployerDeactivated(_employerAddress);
        }
    }

    function toggleToken(string memory _tokenSymbol, bool _active) external onlyOwner {
        require(supportedTokens[_tokenSymbol].contractAddress != address(0), "Token does not exist");
        supportedTokens[_tokenSymbol].isActive = _active;
        emit TokenToggled(_tokenSymbol, _active);
    }

    function updateTokenFee(string memory _tokenSymbol, uint256 _newFee) external onlyOwner {
        require(supportedTokens[_tokenSymbol].contractAddress != address(0), "Token does not exist");
        supportedTokens[_tokenSymbol].registrationFee = _newFee;
        emit TokenConfigUpdated(_tokenSymbol);
    }

    function updateTokenBonus(string memory _tokenSymbol, uint256 _newBonus) external onlyOwner {
        require(supportedTokens[_tokenSymbol].contractAddress != address(0), "Token does not exist");
        supportedTokens[_tokenSymbol].bonusAmount = _newBonus;
        emit TokenConfigUpdated(_tokenSymbol);
    }

    function toggleBonusLottery(bool _enabled) external onlyOwner {
        bonusLotteryEnabled = _enabled;
    }

    function runBonusLotteryManually() external onlyOwner {
        require(bonusLotteryEnabled, "Bonus lottery is disabled");
        _selectRandomBonusWinner();
    }

    /**
     * @notice Emergency withdraw tokens (only owner)
     */
    function emergencyWithdraw(string memory _tokenSymbol) external onlyOwner validToken(_tokenSymbol) {
        TokenConfig memory tokenConfig = supportedTokens[_tokenSymbol];
        IERC20 token = IERC20(tokenConfig.contractAddress);
        uint256 balance = token.balanceOf(address(this));
        token.safeTransfer(owner(), balance);
    }
}
