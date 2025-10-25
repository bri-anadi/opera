// Hooks for multi-token Opera contract
import { useAccount, useReadContract, useWriteContract, useChainId } from 'wagmi';
import { MULTI_TOKEN_CONTRACT_ABI, MULTI_TOKEN_CONTRACT_ADDRESS } from '@/lib/contracts';
import { TokenSymbol } from '@/lib/token-config';
/**
 * Get multi-token contract address for current chain
 */
export function useMultiTokenContractAddress() {
  const chainId = useChainId();
  return (MULTI_TOKEN_CONTRACT_ADDRESS[chainId as keyof typeof MULTI_TOKEN_CONTRACT_ADDRESS] ||
    MULTI_TOKEN_CONTRACT_ADDRESS[8453]) as `0x${string}`;
}

/**
 * Check if connected address is an employer
 */
export function useIsEmployer() {
  const { address } = useAccount();
  const contractAddress = useMultiTokenContractAddress();

  const { data, isLoading, error } = useReadContract({
    address: contractAddress,
    abi: MULTI_TOKEN_CONTRACT_ABI,
    functionName: 'getEmployerInfo',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  return {
    isEmployer: data?.[1] as boolean | undefined, // active field
    isLoading,
    error
  };
}

/**
 * Get employee details for a specific address
 */
export function useEmployeeDetails(employeeAddress?: string) {
  const contractAddress = useMultiTokenContractAddress();
  const { address } = useAccount();
  const targetAddress = employeeAddress || address;

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: MULTI_TOKEN_CONTRACT_ABI,
    functionName: 'employees',
    args: targetAddress ? [targetAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!targetAddress,
    }
  });

  return {
    employee: data ? {
      walletAddress: data[0] as string,
      name: data[1] as string,
      salaryTokenSymbol: data[2] as string,
      salary: data[3] as bigint,
      lastPayment: data[4] as bigint,
      active: data[5] as boolean,
      employer: data[6] as string,
    } : undefined,
    isLoading,
    error,
    refetch
  };
}

/**
 * Register as employer with selected token for fee
 */
export function useRegisterEmployer() {
  const contractAddress = useMultiTokenContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const register = (name: string, tokenSymbol: TokenSymbol) => {
    writeContract({
      address: contractAddress,
      abi: MULTI_TOKEN_CONTRACT_ABI,
      functionName: 'registerAsEmployer',
      args: [name, tokenSymbol],
    });
  };

  return {
    register,
    hash,
    isPending,
    error
  };
}

/**
 * Deposit funds in selected token
 */
export function useDepositFunds(tokenSymbol: TokenSymbol) {
  const contractAddress = useMultiTokenContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const deposit = (amount: bigint) => {
    writeContract({
      address: contractAddress,
      abi: MULTI_TOKEN_CONTRACT_ABI,
      functionName: 'depositFunds',
      args: [tokenSymbol, amount],
    });
  };

  return {
    deposit,
    hash,
    isPending,
    error
  };
}

/**
 * Add employee with salary in selected token
 */
export function useAddEmployee(tokenSymbol: TokenSymbol) {
  const contractAddress = useMultiTokenContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const addEmployee = (walletAddress: `0x${string}`, name: string, salary: bigint) => {
    writeContract({
      address: contractAddress,
      abi: MULTI_TOKEN_CONTRACT_ABI,
      functionName: 'addEmployee',
      args: [walletAddress, name, tokenSymbol, salary],
    });
  };

  return {
    addEmployee,
    hash,
    isPending,
    error
  };
}

/**
 * Remove employee
 */
export function useRemoveEmployee() {
  const contractAddress = useMultiTokenContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const removeEmployee = (employeeAddress: `0x${string}`) => {
    writeContract({
      address: contractAddress,
      abi: MULTI_TOKEN_CONTRACT_ABI,
      functionName: 'removeEmployee',
      args: [employeeAddress],
    });
  };

  return {
    removeEmployee,
    hash,
    isPending,
    error
  };
}

/**
 * Update employee salary
 */
export function useUpdateSalary(tokenSymbol: TokenSymbol) {
  const contractAddress = useMultiTokenContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const updateSalary = (employeeAddress: `0x${string}`, newSalary: bigint) => {
    writeContract({
      address: contractAddress,
      abi: MULTI_TOKEN_CONTRACT_ABI,
      functionName: 'updateSalary',
      args: [employeeAddress, tokenSymbol, newSalary],
    });
  };

  return {
    updateSalary,
    hash,
    isPending,
    error
  };
}

/**
 * Pay employees with specific token
 */
export function usePayEmployees(tokenSymbol: TokenSymbol) {
  const contractAddress = useMultiTokenContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const payEmployees = () => {
    writeContract({
      address: contractAddress,
      abi: MULTI_TOKEN_CONTRACT_ABI,
      functionName: 'payMyEmployees',
      args: [tokenSymbol],
    });
  };

  return {
    payEmployees,
    hash,
    isPending,
    error
  };
}

/**
 * Get employer balance for specific token
 */
export function useEmployerBalance(employerAddress?: `0x${string}`, tokenSymbol?: TokenSymbol) {
  const contractAddress = useMultiTokenContractAddress();
  const { address } = useAccount();
  const targetAddress = employerAddress || address;

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: MULTI_TOKEN_CONTRACT_ABI,
    functionName: 'getEmployerBalance',
    args: targetAddress && tokenSymbol ? [targetAddress, tokenSymbol] : undefined,
    query: {
      enabled: !!targetAddress && !!tokenSymbol,
    }
  });

  return {
    balance: data as bigint | undefined,
    isLoading,
    error,
    refetch
  };
}

/**
 * Get employer balances for all tokens
 */
export function useEmployerBalances(employerAddress?: `0x${string}`) {
  const { address } = useAccount();
  const targetAddress = employerAddress || address;

  const usdcBalance = useEmployerBalance(targetAddress, 'USDC');
  const eurcBalance = useEmployerBalance(targetAddress, 'EURC');

  return {
    balances: {
      USDC: usdcBalance.balance,
      EURC: eurcBalance.balance,
    },
    isLoading: usdcBalance.isLoading || eurcBalance.isLoading,
    refetchAll: () => {
      usdcBalance.refetch();
      eurcBalance.refetch();
    }
  };
}

/**
 * Get employer info
 */
export function useEmployerInfo(employerAddress?: `0x${string}`) {
  const contractAddress = useMultiTokenContractAddress();
  const { address } = useAccount();
  const targetAddress = employerAddress || address;

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: MULTI_TOKEN_CONTRACT_ABI,
    functionName: 'getEmployerInfo',
    args: targetAddress ? [targetAddress] : undefined,
    query: {
      enabled: !!targetAddress,
    }
  });

  return {
    name: data?.[0] as string | undefined,
    active: data?.[1] as boolean | undefined,
    registrationTime: data?.[2] as bigint | undefined,
    isLoading,
    error,
    refetch
  };
}

/**
 * Get total monthly salary for employer by token
 */
export function useTotalMonthlySalary(employerAddress?: `0x${string}`, tokenSymbol?: TokenSymbol) {
  const contractAddress = useMultiTokenContractAddress();
  const { address } = useAccount();
  const targetAddress = employerAddress || address;

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: MULTI_TOKEN_CONTRACT_ABI,
    functionName: 'getTotalMonthlySalaryForEmployer',
    args: targetAddress && tokenSymbol ? [targetAddress, tokenSymbol] : undefined,
    query: {
      enabled: !!targetAddress && !!tokenSymbol,
    }
  });

  return {
    totalSalary: data as bigint | undefined,
    isLoading,
    error,
    refetch
  };
}

/**
 * Get total monthly salaries for all tokens
 */
export function useTotalMonthlySalaries(employerAddress?: `0x${string}`) {
  const { address } = useAccount();
  const targetAddress = employerAddress || address;

  const usdcSalary = useTotalMonthlySalary(targetAddress, 'USDC');
  const eurcSalary = useTotalMonthlySalary(targetAddress, 'EURC');

  return {
    salaries: {
      USDC: usdcSalary.totalSalary,
      EURC: eurcSalary.totalSalary,
    },
    isLoading: usdcSalary.isLoading || eurcSalary.isLoading,
    refetchAll: () => {
      usdcSalary.refetch();
      eurcSalary.refetch();
    }
  };
}

/**
 * Get employee details
 */
export function useEmployee(employeeAddress: `0x${string}`) {
  const contractAddress = useMultiTokenContractAddress();

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: MULTI_TOKEN_CONTRACT_ABI,
    functionName: 'employees',
    args: [employeeAddress],
  });

  return {
    walletAddress: data?.[0] as `0x${string}` | undefined,
    name: data?.[1] as string | undefined,
    salaryTokenSymbol: data?.[2] as TokenSymbol | undefined,
    salary: data?.[3] as bigint | undefined,
    lastPayment: data?.[4] as bigint | undefined,
    active: data?.[5] as boolean | undefined,
    employer: data?.[6] as `0x${string}` | undefined,
    isLoading,
    error,
    refetch
  };
}

/**
 * Get employee count for employer
 */
export function useEmployeeCount(employerAddress?: `0x${string}`) {
  const contractAddress = useMultiTokenContractAddress();
  const { address } = useAccount();
  const targetAddress = employerAddress || address;

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: MULTI_TOKEN_CONTRACT_ABI,
    functionName: 'getEmployeeCountForEmployer',
    args: targetAddress ? [targetAddress] : undefined,
    query: {
      enabled: !!targetAddress,
    }
  });

  return {
    count: data as bigint | undefined,
    isLoading,
    error,
    refetch
  };
}

/**
 * Get contract balance for specific token
 */
export function useContractBalance(tokenSymbol: TokenSymbol) {
  const contractAddress = useMultiTokenContractAddress();

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: MULTI_TOKEN_CONTRACT_ABI,
    functionName: 'getContractBalance',
    args: [tokenSymbol],
  });

  return {
    balance: data as bigint | undefined,
    isLoading,
    error,
    refetch
  };
}

/**
 * Get supported token config from contract
 */
export function useSupportedToken(tokenSymbol: TokenSymbol) {
  const contractAddress = useMultiTokenContractAddress();

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: MULTI_TOKEN_CONTRACT_ABI,
    functionName: 'supportedTokens',
    args: [tokenSymbol],
  });

  return {
    contractAddress: data?.[0] as `0x${string}` | undefined,
    decimals: data?.[1] as number | undefined,
    isActive: data?.[2] as boolean | undefined,
    registrationFee: data?.[3] as bigint | undefined,
    bonusAmount: data?.[4] as bigint | undefined,
    isLoading,
    error,
    refetch
  };
}
