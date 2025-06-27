// src/hooks/use-opera-contract.tsx
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_ABI, CONTRACT_ADDRESS_BASE_SEPOLIA } from '@/lib/contracts';
import { useState, useEffect } from 'react';

// Types for Employee and Employer data structures
export type Employee = {
    walletAddress: string;
    name: string;
    salary: bigint;
    lastPayment: bigint;
    active: boolean;
    employer: string;
};

export type Employer = {
    name: string;
    balance: bigint;
    active: boolean;
    registrationTime: bigint;
};

// ----------------- READ HOOKS -----------------

/**
 * Hook to check if the current connected account is registered as an employer
 */
export function useIsEmployer() {
    const { address } = useAccount();

    const { data, isLoading, error, refetch } = useReadContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS_BASE_SEPOLIA,
        functionName: 'employers',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        }
    });

    const isEmployer = data ? (data as any)[2] : false;

    return {
        isEmployer,
        isLoading,
        error,
        refetch,
    };
}

/**
 * Hook to get the current employer's details
 */
export function useEmployerDetails(employerAddress?: string) {
    const { address } = useAccount();
    const targetAddress = employerAddress || address;

    const { data, isLoading, error, refetch } = useReadContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS_BASE_SEPOLIA,
        functionName: 'employers',
        args: targetAddress ? [targetAddress as `0x${string}`] : undefined,
        query: {
            enabled: !!targetAddress,
        }
    });

    // Format the employer data
    const employer = data ? {
        name: (data as any)[0],
        balance: (data as any)[1],
        active: (data as any)[2],
        registrationTime: (data as any)[3],
    } as Employer : undefined;

    return {
        employer,
        isLoading,
        error,
        refetch,
    };
}

/**
 * Hook to get the total number of employees for an employer
 */
export function useEmployeeCount(employerAddress?: string) {
    const { address } = useAccount();
    const targetAddress = employerAddress || address;

    const { data, isLoading, error } = useReadContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS_BASE_SEPOLIA,
        functionName: 'getEmployeeCountForEmployer',
        args: targetAddress ? [targetAddress as `0x${string}`] : undefined,
        query: {
            enabled: !!targetAddress,
        }
    });

    return {
        count: data ? Number(data) : 0,
        isLoading,
        error,
    };
}

/**
 * Hook to get employee addresses for an employer
 */
export function useEmployeeAddresses(employerAddress?: string) {
    const { address } = useAccount();
    const targetAddress = employerAddress || address;
    const { count, isLoading: isLoadingCount } = useEmployeeCount(targetAddress);

    const [addresses, setAddresses] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!targetAddress || count === 0) {
            setAddresses([]);
            return;
        }

        const fetchAddresses = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const fetchedAddresses: string[] = [];

                for (let i = 0; i < count; i++) {
                    const result = await useReadContract({
                        abi: CONTRACT_ABI,
                        address: CONTRACT_ADDRESS_BASE_SEPOLIA,
                        functionName: 'employerToEmployees',
                        args: [targetAddress as `0x${string}`, BigInt(i)],
                    });

                    if (result) {
                        fetchedAddresses.push((result as any)[0] as string);
                    }
                }

                setAddresses(fetchedAddresses);
            } catch (err) {
                console.error('Error fetching employee addresses:', err);
                setError(err instanceof Error ? err : new Error('Failed to fetch employee addresses'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchAddresses();
    }, [targetAddress, count]);

    return {
        addresses,
        isLoading: isLoading || isLoadingCount,
        error,
    };
}

/**
 * Hook to get an employee's details
 */
export function useEmployeeDetails(employeeAddress: string) {
    const { data, isLoading, error } = useReadContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS_BASE_SEPOLIA,
        functionName: 'employees',
        args: [employeeAddress as `0x${string}`],
        query: {
            enabled: !!employeeAddress,
        }
    });

    // Format the employee data
    const employee = data ? {
        walletAddress: (data as any)[0],
        name: (data as any)[1],
        salary: (data as any)[2],
        lastPayment: (data as any)[3],
        active: (data as any)[4],
        employer: (data as any)[5],
    } as Employee : undefined;

    return {
        employee,
        isLoading,
        error,
    };
}

/**
 * Hook to get the employer's balance
 */
export function useEmployerBalance(employerAddress?: string) {
    const { address } = useAccount();
    const targetAddress = employerAddress || address;

    const { data, isLoading, error, refetch } = useReadContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS_BASE_SEPOLIA,
        functionName: 'getEmployerBalance',
        args: targetAddress ? [targetAddress as `0x${string}`] : undefined,
        query: {
            enabled: !!targetAddress,
        }
    });

    return {
        balance: data || BigInt(0),
        isLoading,
        error,
        refetch,
    };
}

/**
 * Hook to get the total monthly salary for an employer
 */
export function useTotalMonthlySalary(employerAddress?: string) {
    const { address } = useAccount();
    const targetAddress = employerAddress || address;

    const { data, isLoading, error } = useReadContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS_BASE_SEPOLIA,
        functionName: 'getTotalMonthlySalaryForEmployer',
        args: targetAddress ? [targetAddress as `0x${string}`] : undefined,
        query: {
            enabled: !!targetAddress,
        }
    });

    return {
        totalSalary: data || BigInt(0),
        isLoading,
        error,
    };
}

/**
 * Hook to get all employee addresses for an employer
 */
export function useEmployerToEmployees(employerAddress?: string) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [data, setData] = useState<string[]>([]);

    // First, get the count of employees for this employer
    const {
        data: countData,
        isLoading: isCountLoading,
        error: countError
    } = useReadContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS_BASE_SEPOLIA,
        functionName: 'getEmployeeCountForEmployer',
        args: employerAddress ? [employerAddress as `0x${string}`] : undefined,
        query: {
            enabled: !!employerAddress,
        }
    });

    // Then, fetch all employee addresses based on the count
    useEffect(() => {
        const fetchEmployeeAddresses = async () => {
            if (!employerAddress || !countData || countData === BigInt(0)) {
                setData([]);
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const employeeCount = Number(countData);
                const addresses: string[] = [];

                for (let i = 0; i < employeeCount; i++) {
                    const result = await useReadContract({
                        abi: CONTRACT_ABI,
                        address: CONTRACT_ADDRESS_BASE_SEPOLIA,
                        functionName: 'employerToEmployees',
                        args: [employerAddress as `0x${string}`, BigInt(i)],
                    });

                    if (result) {
                        addresses.push((result as any)[0] as string);
                    }
                }

                setData(addresses);
            } catch (err) {
                console.error('Error fetching employee addresses:', err);
                setError(err instanceof Error ? err : new Error('Failed to fetch employee addresses'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchEmployeeAddresses();
    }, [employerAddress, countData]);

    return {
        data,
        isLoading: isLoading || isCountLoading,
        error: error || countError
    };
}

/**
 * Hook to get all employees for a specific employer
 * Note: This is a simplified implementation that assumes we know the employee addresses
 */
export function useEmployerEmployees(employerAddress?: string, employeeAddresses: string[] = []) {
    const { address } = useAccount();
    const targetAddress = employerAddress || address;

    // Create individual queries for each employee
    const employeeQueries = employeeAddresses.map(employeeAddress => {
        const { data, isLoading, error } = useReadContract({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS_BASE_SEPOLIA,
            functionName: 'employees',
            args: [employeeAddress as `0x${string}`],
            query: {
                enabled: !!targetAddress && !!employeeAddress,
            }
        });

        return {
            address: employeeAddress,
            data,
            isLoading,
            error
        };
    });

    // Process the results
    const employees = employeeQueries.map(query => {
        if (!query.data) return null;

        return {
            walletAddress: (query.data as any)[0],
            name: (query.data as any)[1],
            salary: (query.data as any)[2],
            lastPayment: (query.data as any)[3],
            active: (query.data as any)[4],
            employer: (query.data as any)[5],
        } as Employee;
    }).filter(Boolean) as Employee[];

    const isLoading = employeeQueries.some(query => query.isLoading);
    const error = employeeQueries.find(query => query.error)?.error;

    return {
        employees,
        isLoading,
        error,
    };
}

/**
 * Hook to get contract stats
 */
export function useContractStats() {
    // Total employee count
    const { data: employeeCount, isLoading: isLoadingEmployeeCount } = useReadContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS_BASE_SEPOLIA,
        functionName: 'getEmployeeCount',
    });

    // Total employer count
    const { data: employerCount, isLoading: isLoadingEmployerCount } = useReadContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS_BASE_SEPOLIA,
        functionName: 'getEmployerCount',
    });

    // Active employee count
    const { data: activeEmployeeCount, isLoading: isLoadingActiveEmployeeCount } = useReadContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS_BASE_SEPOLIA,
        functionName: 'getActiveEmployeeCount',
    });

    // Active employer count
    const { data: activeEmployerCount, isLoading: isLoadingActiveEmployerCount } = useReadContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS_BASE_SEPOLIA,
        functionName: 'getActiveEmployerCount',
    });

    // Total monthly salary
    const { data: totalMonthlySalary, isLoading: isLoadingTotalSalary } = useReadContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS_BASE_SEPOLIA,
        functionName: 'getTotalMonthlySalary',
    });

    // Contract balance
    const { data: contractBalance, isLoading: isLoadingContractBalance } = useReadContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS_BASE_SEPOLIA,
        functionName: 'getContractBalance',
    });

    // Bonus amount
    const { data: bonusAmount, isLoading: isLoadingBonusAmount } = useReadContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS_BASE_SEPOLIA,
        functionName: 'bonusAmount',
    });

    // Last bonus winner
    const { data: lastBonusWinner, isLoading: isLoadingLastBonusWinner } = useReadContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS_BASE_SEPOLIA,
        functionName: 'lastBonusWinner',
    });

    const isLoading =
        isLoadingEmployeeCount ||
        isLoadingEmployerCount ||
        isLoadingActiveEmployeeCount ||
        isLoadingActiveEmployerCount ||
        isLoadingTotalSalary ||
        isLoadingContractBalance ||
        isLoadingBonusAmount ||
        isLoadingLastBonusWinner;

    return {
        stats: {
            employeeCount: employeeCount ? Number(employeeCount) : 0,
            employerCount: employerCount ? Number(employerCount) : 0,
            activeEmployeeCount: activeEmployeeCount ? Number(activeEmployeeCount) : 0,
            activeEmployerCount: activeEmployerCount ? Number(activeEmployerCount) : 0,
            totalMonthlySalary: totalMonthlySalary || BigInt(0),
            contractBalance: contractBalance || BigInt(0),
            bonusAmount: bonusAmount || BigInt(0),
            lastBonusWinner: lastBonusWinner || '',
        },
        isLoading,
    };
}

// ----------------- WRITE HOOKS -----------------

/**
 * Hook to register as an employer
 */
export function useRegisterAsEmployer() {
    const { writeContract, isPending, error, data: hash } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash
    });

    const register = async (name: string, fee: string = '0.01') => {
        writeContract({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS_BASE_SEPOLIA,
            functionName: 'registerAsEmployer',
            args: [name],
            value: parseEther(fee),
        });
    };

    return {
        register,
        isPending,
        error,
        hash,
        isConfirming,
        isConfirmed,
    };
}

/**
 * Hook to deposit funds to the employer's account
 */
export function useDepositFunds() {
    const { writeContract, isPending, error, data: hash } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash
    });

    const deposit = async (amount: string) => {
        writeContract({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS_BASE_SEPOLIA,
            functionName: 'depositFunds',
            value: parseEther(amount),
        });
    };

    return {
        deposit,
        isPending,
        error,
        hash,
        isConfirming,
        isConfirmed,
    };
}

/**
 * Hook to add an employee
 */
export function useAddEmployee() {
    const { writeContract, isPending, error, data: hash } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash
    });

    const addEmployee = async (walletAddress: string, name: string, salaryEth: string) => {
        writeContract({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS_BASE_SEPOLIA,
            functionName: 'addEmployee',
            args: [walletAddress as `0x${string}`, name, parseEther(salaryEth)],
        });
    };

    return {
        addEmployee,
        isPending,
        error,
        hash,
        isConfirming,
        isConfirmed,
    };
}

/**
 * Hook to remove an employee
 */
export function useRemoveEmployee() {
    const { writeContract, isPending, error, data: hash } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash
    });

    const removeEmployee = async (employeeAddress: string) => {
        writeContract({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS_BASE_SEPOLIA,
            functionName: 'removeEmployee',
            args: [employeeAddress as `0x${string}`],
        });
    };

    return {
        removeEmployee,
        isPending,
        error,
        hash,
        isConfirming,
        isConfirmed,
    };
}

/**
 * Hook to update an employee's salary
 */
export function useUpdateSalary() {
    const { writeContract, isPending, error, data: hash } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash
    });

    const updateSalary = async (employeeAddress: string, newSalaryEth: string) => {
        writeContract({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS_BASE_SEPOLIA,
            functionName: 'updateSalary',
            args: [employeeAddress as `0x${string}`, parseEther(newSalaryEth)],
        });
    };

    return {
        updateSalary,
        isPending,
        error,
        hash,
        isConfirming,
        isConfirmed,
    };
}

/**
 * Hook to pay employees
 */
export function usePayEmployees() {
    const { writeContract, isPending, error, data: hash } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash
    });

    const payMyEmployees = async () => {
        writeContract({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS_BASE_SEPOLIA,
            functionName: 'payMyEmployees',
        });
    };

    return {
        payMyEmployees,
        isPending,
        error,
        hash,
        isConfirming,
        isConfirmed,
    };
}

/**
 * Hook for an admin to pay all employees in the system
 */
export function usePayAllEmployees() {
    const { writeContract, isPending, error, data: hash } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash
    });

    const payAllEmployees = async () => {
        writeContract({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS_BASE_SEPOLIA,
            functionName: 'payAllEmployees',
        });
    };

    return {
        payAllEmployees,
        isPending,
        error,
        hash,
        isConfirming,
        isConfirmed,
    };
}

/**
 * Hook for an admin to run the bonus lottery manually
 */
export function useRunBonusLottery() {
    const { writeContract, isPending, error, data: hash } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash
    });

    const runLottery = async () => {
        writeContract({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS_BASE_SEPOLIA,
            functionName: 'runBonusLotteryManually',
        });
    };

    return {
        runLottery,
        isPending,
        error,
        hash,
        isConfirming,
        isConfirmed,
    };
}

// ----------------- ADMIN HOOKS -----------------

/**
 * Hook for admin to set employer status (active/inactive)
 */
export function useSetEmployerStatus() {
    const { writeContract, isPending, error, data: hash } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash
    });

    const setStatus = async (employerAddress: string, active: boolean) => {
        writeContract({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS_BASE_SEPOLIA,
            functionName: 'setEmployerStatus',
            args: [employerAddress as `0x${string}`, active],
        });
    };

    return {
        setStatus,
        isPending,
        error,
        hash,
        isConfirming,
        isConfirmed,
    };
}

/**
 * Hook for admin to set the bonus amount
 */
export function useSetBonusAmount() {
    const { writeContract, isPending, error, data: hash } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash
    });

    const setBonusAmount = async (amountEth: string) => {
        writeContract({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS_BASE_SEPOLIA,
            functionName: 'setBonusAmount',
            args: [parseEther(amountEth)],
        });
    };

    return {
        setBonusAmount,
        isPending,
        error,
        hash,
        isConfirming,
        isConfirmed,
    };
}

/**
 * Hook for admin to toggle the bonus lottery
 */
export function useToggleBonusLottery() {
    const { writeContract, isPending, error, data: hash } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash
    });

    const toggleLottery = async (enabled: boolean) => {
        writeContract({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS_BASE_SEPOLIA,
            functionName: 'toggleBonusLottery',
            args: [enabled],
        });
    };

    return {
        toggleLottery,
        isPending,
        error,
        hash,
        isConfirming,
        isConfirmed,
    };
}

/**
 * Hook for admin to set the employer registration fee
 */
export function useSetEmployerRegistrationFee() {
    const { writeContract, isPending, error, data: hash } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash
    });

    const setFee = async (amountEth: string) => {
        writeContract({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS_BASE_SEPOLIA,
            functionName: 'setEmployerRegistrationFee',
            args: [parseEther(amountEth)],
        });
    };

    return {
        setFee,
        isPending,
        error,
        hash,
        isConfirming,
        isConfirmed,
    };
}

/**
 * Hook for admin to withdraw funds in case of emergency
 */
export function useEmergencyWithdraw() {
    const { writeContract, isPending, error, data: hash } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash
    });

    const withdraw = async () => {
        writeContract({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS_BASE_SEPOLIA,
            functionName: 'emergencyWithdraw',
        });
    };

    return {
        withdraw,
        isPending,
        error,
        hash,
        isConfirming,
        isConfirmed,
    };
}
