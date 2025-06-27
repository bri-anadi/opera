// src/hooks/use-transaction-history.tsx
import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { formatEther } from 'viem';
import { useContractAddress } from './use-contract-address';

// Transaction types
export enum TransactionType {
    DEPOSIT = 'Deposit',
    PAYMENT = 'Payment',
    EMPLOYEE_ADDED = 'Employee Added',
    EMPLOYEE_REMOVED = 'Employee Removed',
    SALARY_UPDATED = 'Salary Updated',
    BONUS = 'Bonus Payment',
}

// Transaction interface
export interface Transaction {
    id: string;
    type: TransactionType;
    timestamp: number;
    amount?: bigint;
    from?: string;
    to?: string;
    details?: string;
    blockNumber: number;
    transactionHash: string;
}

/**
 * Hook to fetch transaction history for an employer
 */
export function useTransactionHistory(employerAddress?: string, limit: number = 50) {
    const { address } = useAccount();
    const targetAddress = employerAddress || address;
    const publicClient = usePublicClient();
    const CONTRACT_ADDRESS = useContractAddress();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!targetAddress || !publicClient) {
            setIsLoading(false);
            return;
        }

        const fetchTransactionHistory = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Get current block
                const currentBlock = await publicClient.getBlockNumber();

                // Calculate starting block (approximately last 3 days)
                // This can be adjusted as needed for performance
                const blocksPerDay = 7200; // ~12s block time
                const startingBlock = currentBlock - BigInt(blocksPerDay * 3); // 3 days

                // Fetch deposit events
                const depositEvents = await publicClient.getLogs({
                    address: CONTRACT_ADDRESS,
                    event: {
                        type: 'event',
                        name: 'EmployerFundsDeposited',
                        inputs: [
                            { type: 'address', name: 'employerAddress', indexed: true },
                            { type: 'uint256', name: 'amount', indexed: false },
                        ],
                    },
                    fromBlock: startingBlock,
                    toBlock: currentBlock,
                    args: {
                        employerAddress: targetAddress as `0x${string}`,
                    },
                });

                // Fetch payment events
                const paymentEvents = await publicClient.getLogs({
                    address: CONTRACT_ADDRESS,
                    event: {
                        type: 'event',
                        name: 'PaymentSent',
                        inputs: [
                            { type: 'address', name: 'employerAddress', indexed: true },
                            { type: 'address', name: 'employeeAddress', indexed: true },
                            { type: 'uint256', name: 'amount', indexed: false },
                        ],
                    },
                    fromBlock: startingBlock,
                    toBlock: currentBlock,
                    args: {
                        employerAddress: targetAddress as `0x${string}`,
                    },
                });

                // Fetch employee added events
                const employeeAddedEvents = await publicClient.getLogs({
                    address: CONTRACT_ADDRESS,
                    event: {
                        type: 'event',
                        name: 'EmployeeAdded',
                        inputs: [
                            { type: 'address', name: 'employerAddress', indexed: true },
                            { type: 'address', name: 'employeeAddress', indexed: true },
                            { type: 'string', name: 'name', indexed: false },
                            { type: 'uint256', name: 'salaryEth', indexed: false },
                        ],
                    },
                    fromBlock: startingBlock,
                    toBlock: currentBlock,
                    args: {
                        employerAddress: targetAddress as `0x${string}`,
                    },
                });

                // Fetch employee removed events
                const employeeRemovedEvents = await publicClient.getLogs({
                    address: CONTRACT_ADDRESS,
                    event: {
                        type: 'event',
                        name: 'EmployeeRemoved',
                        inputs: [
                            { type: 'address', name: 'employerAddress', indexed: true },
                            { type: 'address', name: 'employeeAddress', indexed: true },
                        ],
                    },
                    fromBlock: startingBlock,
                    toBlock: currentBlock,
                    args: {
                        employerAddress: targetAddress as `0x${string}`,
                    },
                });

                // Fetch salary updated events
                const salaryUpdatedEvents = await publicClient.getLogs({
                    address: CONTRACT_ADDRESS,
                    event: {
                        type: 'event',
                        name: 'SalaryUpdated',
                        inputs: [
                            { type: 'address', name: 'employerAddress', indexed: true },
                            { type: 'address', name: 'employeeAddress', indexed: true },
                            { type: 'uint256', name: 'newSalaryEth', indexed: false },
                        ],
                    },
                    fromBlock: startingBlock,
                    toBlock: currentBlock,
                    args: {
                        employerAddress: targetAddress as `0x${string}`,
                    },
                });

                // Fetch bonus winner events
                const bonusEvents = await publicClient.getLogs({
                    address: CONTRACT_ADDRESS,
                    event: {
                        type: 'event',
                        name: 'BonusWinnerSelected',
                        inputs: [
                            { type: 'address', name: 'winner', indexed: true },
                            { type: 'uint256', name: 'amount', indexed: false },
                        ],
                    },
                    fromBlock: startingBlock,
                    toBlock: currentBlock,
                });

                // Process and combine all events
                const allTransactions: Transaction[] = [];

                // Get blocks for all events to get timestamps
                const blockNumbers = new Set<bigint>();

                [...depositEvents, ...paymentEvents, ...employeeAddedEvents,
                ...employeeRemovedEvents, ...salaryUpdatedEvents, ...bonusEvents].forEach(event => {
                    blockNumbers.add(event.blockNumber);
                });

                const blocks = await Promise.all(
                    Array.from(blockNumbers).map(blockNumber =>
                        publicClient.getBlock({ blockNumber })
                    )
                );

                // Create a map of block numbers to timestamps
                const blockTimestamps = new Map<bigint, number>();
                blocks.forEach(block => {
                    blockTimestamps.set(block.number, Number(block.timestamp));
                });

                // Process deposit events
                for (const event of depositEvents) {
                    const amount = event.args.amount as bigint;
                    const timestamp = blockTimestamps.get(event.blockNumber) || 0;

                    allTransactions.push({
                        id: `${event.transactionHash}-${event.logIndex}`,
                        type: TransactionType.DEPOSIT,
                        timestamp,
                        amount,
                        from: targetAddress as string,
                        details: `Deposited ${formatEther(amount)} ETH`,
                        blockNumber: Number(event.blockNumber),
                        transactionHash: event.transactionHash,
                    });
                }

                // Process payment events
                for (const event of paymentEvents) {
                    const amount = event.args.amount as bigint;
                    const employeeAddress = event.args.employeeAddress as string;
                    const timestamp = blockTimestamps.get(event.blockNumber) || 0;

                    allTransactions.push({
                        id: `${event.transactionHash}-${event.logIndex}`,
                        type: TransactionType.PAYMENT,
                        timestamp,
                        amount,
                        from: targetAddress as string,
                        to: employeeAddress,
                        details: `Paid ${formatEther(amount)} ETH to employee`,
                        blockNumber: Number(event.blockNumber),
                        transactionHash: event.transactionHash,
                    });
                }

                // Process employee added events
                for (const event of employeeAddedEvents) {
                    const name = event.args.name as string;
                    const employeeAddress = event.args.employeeAddress as string;
                    const salary = event.args.salaryEth as bigint;
                    const timestamp = blockTimestamps.get(event.blockNumber) || 0;

                    allTransactions.push({
                        id: `${event.transactionHash}-${event.logIndex}`,
                        type: TransactionType.EMPLOYEE_ADDED,
                        timestamp,
                        from: targetAddress as string,
                        to: employeeAddress,
                        details: `Added employee ${name} with salary ${formatEther(salary)} ETH`,
                        blockNumber: Number(event.blockNumber),
                        transactionHash: event.transactionHash,
                    });
                }

                // Process employee removed events
                for (const event of employeeRemovedEvents) {
                    const employeeAddress = event.args.employeeAddress as string;
                    const timestamp = blockTimestamps.get(event.blockNumber) || 0;

                    allTransactions.push({
                        id: `${event.transactionHash}-${event.logIndex}`,
                        type: TransactionType.EMPLOYEE_REMOVED,
                        timestamp,
                        from: targetAddress as string,
                        to: employeeAddress,
                        details: `Removed employee`,
                        blockNumber: Number(event.blockNumber),
                        transactionHash: event.transactionHash,
                    });
                }

                // Process salary updated events
                for (const event of salaryUpdatedEvents) {
                    const employeeAddress = event.args.employeeAddress as string;
                    const newSalary = event.args.newSalaryEth as bigint;
                    const timestamp = blockTimestamps.get(event.blockNumber) || 0;

                    allTransactions.push({
                        id: `${event.transactionHash}-${event.logIndex}`,
                        type: TransactionType.SALARY_UPDATED,
                        timestamp,
                        from: targetAddress as string,
                        to: employeeAddress,
                        details: `Updated salary to ${formatEther(newSalary)} ETH`,
                        blockNumber: Number(event.blockNumber),
                        transactionHash: event.transactionHash,
                    });
                }

                // Process bonus events where the employer is relevant
                for (const event of bonusEvents) {
                    const winner = event.args.winner as string;
                    const amount = event.args.amount as bigint;
                    const timestamp = blockTimestamps.get(event.blockNumber) || 0;

                    // Check if this bonus is relevant to any of our employees
                    // This is a simplification - in a real app, you'd want to check if the winner
                    // is an employee of this employer
                    allTransactions.push({
                        id: `${event.transactionHash}-${event.logIndex}`,
                        type: TransactionType.BONUS,
                        timestamp,
                        amount,
                        to: winner,
                        details: `Bonus of ${formatEther(amount)} ETH awarded`,
                        blockNumber: Number(event.blockNumber),
                        transactionHash: event.transactionHash,
                    });
                }

                // Sort by timestamp (newest first) and limit the number of transactions
                const sortedTransactions = allTransactions
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, limit);

                setTransactions(sortedTransactions);
            } catch (err) {
                console.error('Error fetching transaction history:', err);
                setError(err instanceof Error ? err : new Error('Failed to fetch transaction history'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactionHistory();
    }, [targetAddress, limit, publicClient]);

    return {
        transactions,
        isLoading,
        error
    };
}

/**
 * Hook to fetch transaction history for an employee
 */
export function useEmployeeTransactionHistory(employeeAddress?: string, limit: number = 50) {
    const { address } = useAccount();
    const targetAddress = employeeAddress || address;
    const publicClient = usePublicClient();
    const CONTRACT_ADDRESS = useContractAddress();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!targetAddress || !publicClient) {
            setIsLoading(false);
            return;
        }

        const fetchTransactionHistory = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Get current block
                const currentBlock = await publicClient.getBlockNumber();

                // Calculate starting block (approximately last 3 days)
                const blocksPerDay = 7200; // ~12s block time
                const startingBlock = currentBlock - BigInt(blocksPerDay * 3); // 3 days

                // Fetch payment events for this employee
                const paymentEvents = await publicClient.getLogs({
                    address: CONTRACT_ADDRESS,
                    event: {
                        type: 'event',
                        name: 'PaymentSent',
                        inputs: [
                            { type: 'address', name: 'employerAddress', indexed: true },
                            { type: 'address', name: 'employeeAddress', indexed: true },
                            { type: 'uint256', name: 'amount', indexed: false },
                        ],
                    },
                    fromBlock: startingBlock,
                    toBlock: currentBlock,
                    args: {
                        employeeAddress: targetAddress as `0x${string}`,
                    },
                });

                // Fetch bonus winner events
                const bonusEvents = await publicClient.getLogs({
                    address: CONTRACT_ADDRESS,
                    event: {
                        type: 'event',
                        name: 'BonusWinnerSelected',
                        inputs: [
                            { type: 'address', name: 'winner', indexed: true },
                            { type: 'uint256', name: 'amount', indexed: false },
                        ],
                    },
                    fromBlock: startingBlock,
                    toBlock: currentBlock,
                    args: {
                        winner: targetAddress as `0x${string}`,
                    },
                });

                // Fetch salary updated events
                const salaryUpdatedEvents = await publicClient.getLogs({
                    address: CONTRACT_ADDRESS,
                    event: {
                        type: 'event',
                        name: 'SalaryUpdated',
                        inputs: [
                            { type: 'address', name: 'employerAddress', indexed: true },
                            { type: 'address', name: 'employeeAddress', indexed: true },
                            { type: 'uint256', name: 'newSalaryEth', indexed: false },
                        ],
                    },
                    fromBlock: startingBlock,
                    toBlock: currentBlock,
                    args: {
                        employeeAddress: targetAddress as `0x${string}`,
                    },
                });

                // Process and combine all events
                const allTransactions: Transaction[] = [];

                // Get blocks for all events to get timestamps
                const blockNumbers = new Set<bigint>();

                [...paymentEvents, ...bonusEvents, ...salaryUpdatedEvents].forEach(event => {
                    blockNumbers.add(event.blockNumber);
                });

                const blocks = await Promise.all(
                    Array.from(blockNumbers).map(blockNumber =>
                        publicClient.getBlock({ blockNumber })
                    )
                );

                // Create a map of block numbers to timestamps
                const blockTimestamps = new Map<bigint, number>();
                blocks.forEach(block => {
                    blockTimestamps.set(block.number, Number(block.timestamp));
                });

                // Process payment events
                for (const event of paymentEvents) {
                    const amount = event.args.amount as bigint;
                    const employerAddress = event.args.employerAddress as string;
                    const timestamp = blockTimestamps.get(event.blockNumber) || 0;

                    allTransactions.push({
                        id: `${event.transactionHash}-${event.logIndex}`,
                        type: TransactionType.PAYMENT,
                        timestamp,
                        amount,
                        from: employerAddress,
                        to: targetAddress as string,
                        details: `Received salary payment of ${formatEther(amount)} ETH`,
                        blockNumber: Number(event.blockNumber),
                        transactionHash: event.transactionHash,
                    });
                }

                // Process bonus events
                for (const event of bonusEvents) {
                    const amount = event.args.amount as bigint;
                    const timestamp = blockTimestamps.get(event.blockNumber) || 0;

                    allTransactions.push({
                        id: `${event.transactionHash}-${event.logIndex}`,
                        type: TransactionType.BONUS,
                        timestamp,
                        amount,
                        to: targetAddress as string,
                        details: `Received bonus of ${formatEther(amount)} ETH`,
                        blockNumber: Number(event.blockNumber),
                        transactionHash: event.transactionHash,
                    });
                }

                // Process salary updated events
                for (const event of salaryUpdatedEvents) {
                    const employerAddress = event.args.employerAddress as string;
                    const newSalary = event.args.newSalaryEth as bigint;
                    const timestamp = blockTimestamps.get(event.blockNumber) || 0;

                    allTransactions.push({
                        id: `${event.transactionHash}-${event.logIndex}`,
                        type: TransactionType.SALARY_UPDATED,
                        timestamp,
                        from: employerAddress,
                        to: targetAddress as string,
                        details: `Salary updated to ${formatEther(newSalary)} ETH`,
                        blockNumber: Number(event.blockNumber),
                        transactionHash: event.transactionHash,
                    });
                }

                // Sort by timestamp (newest first) and limit the number of transactions
                const sortedTransactions = allTransactions
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, limit);

                setTransactions(sortedTransactions);
            } catch (err) {
                console.error('Error fetching employee transaction history:', err);
                setError(err instanceof Error ? err : new Error('Failed to fetch transaction history'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactionHistory();
    }, [targetAddress, limit, publicClient]);

    return {
        transactions,
        isLoading,
        error
    };
}
