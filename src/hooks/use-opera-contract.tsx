// src/hooks/use-opera-contract.tsx
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ABI } from '@/lib/contracts';
import { useState, useEffect, useMemo } from 'react';
import { useContractAddress } from './use-contract-address';
import { parseUsdc } from '@/lib/usdc-utils';

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

/**
 * Hook to check if the current connected account is registered as an employer
*/
export function useIsEmployer() {
    const { address } = useAccount();
    const CONTRACT_ADDRESS = useContractAddress();

    const { data, isLoading, error, refetch } = useReadContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'employers',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        }
    });

    const isEmployer = useMemo(() => {
        return data ? (data as any)[2] : false;
    }, [data]);

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
    const CONTRACT_ADDRESS = useContractAddress();

    const { data, isLoading, error, refetch } = useReadContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'employers',
        args: targetAddress ? [targetAddress as `0x${string}`] : undefined,
        query: {
            enabled: !!targetAddress,
        }
    });

    // Format the employer data
    const employer = useMemo(() => {
        if (!data) return undefined;

        return {
            name: (data as any)[0],
            balance: (data as any)[1],
            active: (data as any)[2],
            registrationTime: (data as any)[3],
        } as Employer;
    }, [data]);

    return {
        employer,
        isLoading,
        error,
        refetch,
    };
}

/**
 * Hook to get an employee's details
 */
export function useEmployeeDetails(employeeAddress: string) {
    const CONTRACT_ADDRESS = useContractAddress();
    const {
        data,
        isLoading,
        error
    } = useReadContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'employees',
        args: employeeAddress ? [employeeAddress as `0x${string}`] : undefined,
        query: {
            enabled: !!employeeAddress && employeeAddress !== '0x0000000000000000000000000000000000000000',
        }
    });

    // Format the employee data
    const employee = useMemo(() => {
        if (!data) return undefined;

        try {
            return {
                walletAddress: (data as any)[0] || '0x0000000000000000000000000000000000000000',
                name: (data as any)[1] || '',
                salary: (data as any)[2] || BigInt(0),
                lastPayment: (data as any)[3] || BigInt(0),
                active: (data as any)[4] || false,
                employer: (data as any)[5] || '0x0000000000000000000000000000000000000000',
            };
        } catch (err) {
            console.error('Error formatting employee data:', err);
            return undefined;
        }
    }, [data]);

    return {
        employee,
        isLoading,
        error,
    };
}

/**
 * Hook to get the total number of employees for an employer
 */
export function useEmployeeCount(employerAddress?: string) {
    const { address } = useAccount();
    const targetAddress = employerAddress || address;
    const CONTRACT_ADDRESS = useContractAddress();
    const { data, isLoading, error } = useReadContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS as `0x${string}`,
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
 * Hook to get the employer's balance
 */
export function useEmployerBalance(employerAddress?: string) {
    const { address } = useAccount();
    const targetAddress = employerAddress || address;
    const CONTRACT_ADDRESS = useContractAddress();
    const { data, isLoading, error, refetch } = useReadContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS as `0x${string}`,
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
    const CONTRACT_ADDRESS = useContractAddress();
    const { data, isLoading, error } = useReadContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS as `0x${string}`,
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
 * Hook to register as an employer
 * NOTE: Requires USDC approval first! Use useApproveUsdc before calling this.
 */
export function useRegisterAsEmployer() {
    const { writeContract, isPending, error, data: hash } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash
    });
    const CONTRACT_ADDRESS = useContractAddress();

    // Register function now takes USDC amount instead of ETH
    // Default registration fee is 10 USDC
    const register = async (name: string) => {
        writeContract({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS as `0x${string}`,
            functionName: 'registerAsEmployer',
            args: [name],
            // No value field - USDC is transferred via approval
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
 * NOTE: Requires USDC approval first! Use useApproveUsdc before calling this.
 */
export function useDepositFunds() {
    const { writeContract, isPending, error, data: hash } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash
    });
    const CONTRACT_ADDRESS = useContractAddress();

    // Deposit function now takes USDC amount (with 6 decimals)
    const deposit = async (amount: string) => {
        const usdcAmount = parseUsdc(amount);
        writeContract({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS as `0x${string}`,
            functionName: 'depositFunds',
            args: [usdcAmount],
            // No value field - USDC is transferred via approval
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
    const CONTRACT_ADDRESS = useContractAddress();

    // Add employee function now takes USDC salary (with 6 decimals)
    const addEmployee = async (walletAddress: string, name: string, salaryUsdc: string) => {
        const usdcSalary = parseUsdc(salaryUsdc);
        writeContract({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS as `0x${string}`,
            functionName: 'addEmployee',
            args: [walletAddress as `0x${string}`, name, usdcSalary],
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
    const CONTRACT_ADDRESS = useContractAddress();
    const removeEmployee = async (employeeAddress: string) => {
        writeContract({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS as `0x${string}`,
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
    const CONTRACT_ADDRESS = useContractAddress();

    // Update salary function now takes USDC amount (with 6 decimals)
    const updateSalary = async (employeeAddress: string, newSalaryUsdc: string) => {
        const usdcSalary = parseUsdc(newSalaryUsdc);
        writeContract({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS as `0x${string}`,
            functionName: 'updateSalary',
            args: [employeeAddress as `0x${string}`, usdcSalary],
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
    const CONTRACT_ADDRESS = useContractAddress();
    const payMyEmployees = async () => {
        writeContract({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS as `0x${string}`,
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
 * Custom hook for fetching employee list with efficient caching
 */
export function useEmployeeList(employerAddress?: string, limit: number = 20) {
    const { address } = useAccount();
    const targetAddress = employerAddress || address;
    const CONTRACT_ADDRESS = useContractAddress();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Get employee count
    const {
        count,
        isLoading: isLoadingCount,
        error: countError
    } = useEmployeeCount(targetAddress);

    // Get employee addresses for employer (limited by the count)
    const employeeIndices = useMemo(() => {
        if (!count) return [];
        const limitedCount = Math.min(count, limit);
        return Array.from({ length: limitedCount }, (_, i) => i);
    }, [count, limit]);

    // Generate query configs for each index
    const employeeQueries = useMemo(() => {
        if (!targetAddress || !employeeIndices.length) return [];

        return employeeIndices.map(index => ({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS as `0x${string}`,
            functionName: 'employerToEmployees',
            args: [targetAddress as `0x${string}`, BigInt(index)],
        }));
    }, [targetAddress, employeeIndices, CONTRACT_ADDRESS]);

    // Fetch employee addresses and details
    useEffect(() => {
        if (!targetAddress || isLoadingCount || !employeeQueries.length) {
            return;
        }

        const fetchEmployees = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Create a custom wagmi client for direct API calls
                // This avoids the hook rule violations
                const fetchedEmployees: Employee[] = [];

                // First get all employee addresses
                const employeeAddresses: string[] = [];

                for (const query of employeeQueries) {
                    try {
                        // We're using a direct method call here, not a hook
                        const result = await window.fetch('/api/contract/read', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                abi: query.abi,
                                address: query.address,
                                functionName: query.functionName,
                                args: query.args,
                            }),
                        }).then(res => res.json());

                        if (result && result.data) {
                            employeeAddresses.push(result.data);
                        }
                    } catch (err) {
                        console.error('Error fetching employee address:', err);
                    }
                }

                // Then get employee details for each address
                for (const empAddress of employeeAddresses) {
                    if (!empAddress) continue;

                    try {
                        const result = await window.fetch('/api/contract/read', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                abi: CONTRACT_ABI,
                                address: CONTRACT_ADDRESS,
                                functionName: 'employees',
                                args: [empAddress],
                            }),
                        }).then(res => res.json());

                        if (result && result.data) {
                            const data = result.data;
                            fetchedEmployees.push({
                                walletAddress: data[0] || '0x0000000000000000000000000000000000000000',
                                name: data[1] || '',
                                salary: BigInt(data[2] || 0),
                                lastPayment: BigInt(data[3] || 0),
                                active: data[4] || false,
                                employer: data[5] || '0x0000000000000000000000000000000000000000',
                            });
                        }
                    } catch (err) {
                        console.error('Error fetching employee details:', err);
                    }
                }

                setEmployees(fetchedEmployees);
            } catch (err) {
                console.error('Error in employee list fetch:', err);
                setError(err instanceof Error ? err : new Error('Failed to fetch employees'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchEmployees();
    }, [targetAddress, isLoadingCount, employeeQueries]);

    // Handle error from count fetching
    useEffect(() => {
        if (countError) {
            setError(countError instanceof Error ? countError : new Error('Failed to get employee count'));
        }
    }, [countError]);

    return {
        employees,
        isLoading: isLoading || isLoadingCount,
        error,
        totalCount: count,
        hasMore: count > limit
    };
}
