// src/lib/contracts.ts

// Multi-Token Opera Contract Addresses (USDC + EURC Support)
export const MULTI_TOKEN_CONTRACT_ADDRESS = {
  8453: "0x0000000000000000000000000000000000000000", // TODO: Deploy to Base Mainnet
  84532: "0x85230c7d80bA6D535BdFD83999F395Afa1e3ee44" // TODO: Deploy to Base Sepolia
} as const;

// ERC20 ABI (for token interactions - approve, transfer, balanceOf, allowance)
export const ERC20_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Multi-Token Opera Contract ABI (USDC + EURC)
export const MULTI_TOKEN_CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "_usdcToken", "type": "address"},
      {"internalType": "address", "name": "_eurcToken", "type": "address"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "employerAddress", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "name", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "tokenSymbol", "type": "string"}
    ],
    "name": "EmployerRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "employerAddress", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "tokenSymbol", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "EmployerFundsDeposited",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "employerAddress", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "employeeAddress", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "name", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "tokenSymbol", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "salary", "type": "uint256"}
    ],
    "name": "EmployeeAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "employerAddress", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "employeeAddress", "type": "address"}
    ],
    "name": "EmployeeRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "employerAddress", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "employeeAddress", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "tokenSymbol", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "newSalary", "type": "uint256"}
    ],
    "name": "SalaryUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "employerAddress", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "employeeAddress", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "tokenSymbol", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "PaymentSent",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "winner", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "tokenSymbol", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "BonusWinnerSelected",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "string", "name": "tokenSymbol", "type": "string"},
      {"indexed": false, "internalType": "address", "name": "tokenAddress", "type": "address"}
    ],
    "name": "TokenAdded",
    "type": "event"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_name", "type": "string"},
      {"internalType": "string", "name": "_tokenSymbol", "type": "string"}
    ],
    "name": "registerAsEmployer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_tokenSymbol", "type": "string"},
      {"internalType": "uint256", "name": "_amount", "type": "uint256"}
    ],
    "name": "depositFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_walletAddress", "type": "address"},
      {"internalType": "string", "name": "_name", "type": "string"},
      {"internalType": "string", "name": "_tokenSymbol", "type": "string"},
      {"internalType": "uint256", "name": "_salary", "type": "uint256"}
    ],
    "name": "addEmployee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_employeeAddress", "type": "address"}
    ],
    "name": "removeEmployee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_employeeAddress", "type": "address"},
      {"internalType": "string", "name": "_tokenSymbol", "type": "string"},
      {"internalType": "uint256", "name": "_newSalary", "type": "uint256"}
    ],
    "name": "updateSalary",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_tokenSymbol", "type": "string"}
    ],
    "name": "payMyEmployees",
    "outputs": [
      {"internalType": "bool", "name": "", "type": "bool"}
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "payAllEmployees",
    "outputs": [
      {"internalType": "bool", "name": "", "type": "bool"}
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_employerAddress", "type": "address"},
      {"internalType": "string", "name": "_tokenSymbol", "type": "string"}
    ],
    "name": "getEmployerBalance",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_employerAddress", "type": "address"}
    ],
    "name": "getEmployerInfo",
    "outputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "bool", "name": "active", "type": "bool"},
      {"internalType": "uint256", "name": "registrationTime", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_employerAddress", "type": "address"},
      {"internalType": "string", "name": "_tokenSymbol", "type": "string"}
    ],
    "name": "getTotalMonthlySalaryForEmployer",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_tokenSymbol", "type": "string"}
    ],
    "name": "getContractBalance",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_tokenSymbol", "type": "string"}
    ],
    "name": "getTokenAddress",
    "outputs": [
      {"internalType": "address", "name": "", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSupportedTokensCount",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "name": "tokenSymbols",
    "outputs": [
      {"internalType": "string", "name": "", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "", "type": "address"}
    ],
    "name": "employees",
    "outputs": [
      {"internalType": "address", "name": "walletAddress", "type": "address"},
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "salaryTokenSymbol", "type": "string"},
      {"internalType": "uint256", "name": "salary", "type": "uint256"},
      {"internalType": "uint256", "name": "lastPayment", "type": "uint256"},
      {"internalType": "bool", "name": "active", "type": "bool"},
      {"internalType": "address", "name": "employer", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "", "type": "string"}
    ],
    "name": "supportedTokens",
    "outputs": [
      {"internalType": "address", "name": "contractAddress", "type": "address"},
      {"internalType": "uint8", "name": "decimals", "type": "uint8"},
      {"internalType": "bool", "name": "isActive", "type": "bool"},
      {"internalType": "uint256", "name": "registrationFee", "type": "uint256"},
      {"internalType": "uint256", "name": "bonusAmount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getEmployeeCount",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_employerAddress", "type": "address"}
    ],
    "name": "getEmployeeCountForEmployer",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PAYMENT_INTERVAL",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "bonusLotteryEnabled",
    "outputs": [
      {"internalType": "bool", "name": "", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_tokenSymbol", "type": "string"}
    ],
    "name": "emergencyWithdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
