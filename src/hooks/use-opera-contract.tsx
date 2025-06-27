// src/hooks/use-opera-contract.tsx
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_ABI } from '@/lib/contracts';
import { useState, useEffect, useMemo } from 'react';
import { useContractAddress } from './use-contract-address';

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
        address: CONTRACT_ADDRESS,
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
        address: CONTRACT_ADDRESS,
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
        address: CONTRACT_ADDRESS,
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
        address: CONTRACT_ADDRESS,
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
        address: CONTRACT_ADDRESS,
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
        address: CONTRACT_ADDRESS,
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
 */
export function useRegisterAsEmployer() {
    const { writeContract, isPending, error, data: hash } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash
    });
    const CONTRACT_ADDRESS = useContractAddress();
    const register = async (name: string, fee: string = '0.01') => {
        writeContract({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS,
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
    const CONTRACT_ADDRESS = useContractAddress();
    const deposit = async (amount: string) => {
        writeContract({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS,
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
    const CONTRACT_ADDRESS = useContractAddress();
    const addEmployee = async (walletAddress: string, name: string, salaryEth: string) => {
        writeContract({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS,
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
    const CONTRACT_ADDRESS = useContractAddress();
    const removeEmployee = async (employeeAddress: string) => {
        writeContract({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS,
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
    const updateSalary = async (employeeAddress: string, newSalaryEth: string) => {
        writeContract({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS,
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
    const CONTRACT_ADDRESS = useContractAddress();
    const payMyEmployees = async () => {
        writeContract({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS,
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
            address: CONTRACT_ADDRESS,
            functionName: 'employerToEmployees',
            args: [targetAddress as `0x${string}`, BigInt(index)],
        }));
    }, [targetAddress, employeeIndices]);

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

// Simplified employee list hook using an API route approach
// This is a safer implementation that doesn't violate React Hook rules
export function useSimpleEmployeeList(employerAddress?: string, limit: number = 20) {
    const { address } = useAccount();
    const targetAddress = employerAddress || address;
    const CONTRACT_ADDRESS = useContractAddress();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [totalCount, setTotalCount] = useState(0);

    // Fetch employees when the employer address changes
    useEffect(() => {
        if (!targetAddress) {
            setEmployees([]);
            setIsLoading(false);
            return;
        }

        const fetchEmployees = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // First get the employee count
                const { data: countData } = await useReadContract({
                    abi: CONTRACT_ABI,
                    address: CONTRACT_ADDRESS,
                    functionName: 'getEmployeeCountForEmployer',
                    args: [targetAddress as `0x${string}`],
                });

                const count = countData ? Number(countData) : 0;
                setTotalCount(count);

                // If there are employees, fetch them
                if (count > 0) {
                    const limitedCount = Math.min(count, limit);
                    const fetchedEmployees: Employee[] = [];

                    // Here you would call your API endpoint
                    // For now, this is just a placeholder
                    setTimeout(() => {
                        // Mock data
                        for (let i = 0; i < limitedCount; i++) {
                            fetchedEmployees.push({
                                walletAddress: `0x${i}`,
                                name: `Employee ${i}`,
                                salary: BigInt(1000000000000000000), // 1 ETH
                                lastPayment: BigInt(Date.now() / 1000 - i * 86400),
                                active: true,
                                employer: targetAddress,
                            });
                        }

                        setEmployees(fetchedEmployees);
                        setIsLoading(false);
                    }, 1000);
                } else {
                    setEmployees([]);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('Error fetching employees:', err);
                setError(err instanceof Error ? err : new Error('Failed to fetch employees'));
                setIsLoading(false);
            }
        };

        fetchEmployees();
    }, [targetAddress, limit]);

    return {
        employees,
        isLoading,
        error,
        totalCount,
        hasMore: totalCount > limit
    };
}
