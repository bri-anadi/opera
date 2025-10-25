// src/app/employee/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatToken } from '@/lib/token-utils';
import { TokenSymbol } from '@/lib/token-config';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useEmployeeDetails } from '@/hooks/use-multi-token-contract';
import { useEmployeeTransactionHistory, TransactionType } from '@/hooks/use-transaction-history';
import { Loader2, Clock, CheckCircle, AlertCircle, ArrowDownCircle, Award, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

export default function EmployeeDashboard() {
    const { address, isConnected } = useAccount();
    const router = useRouter();
    const [timeUntilNextPayment, setTimeUntilNextPayment] = useState<string>('');

    // Use our centralized employee details hook
    const {
        employee,
        isLoading,
        error
    } = useEmployeeDetails(address || '');

    // Get transaction history
    const {
        transactions,
        isLoading: isLoadingTransactions,
        error: transactionsError
    } = useEmployeeTransactionHistory(address, 3); // Get just the 3 most recent transactions

    // Calculate time until next payment
    useEffect(() => {
        if (!employee || !employee.lastPayment) {
            setTimeUntilNextPayment('N/A');
            return;
        }

        const updateTimeRemaining = () => {
            try {
                const lastPaymentDate = new Date(Number(employee.lastPayment) * 1000);
                const nextPaymentDate = new Date(lastPaymentDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
                const now = new Date();

                const timeRemaining = nextPaymentDate.getTime() - now.getTime();

                if (timeRemaining <= 0) {
                    setTimeUntilNextPayment('Payment is due');
                    return;
                }

                const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

                setTimeUntilNextPayment(`${days}d ${hours}h ${minutes}m`);
            } catch (err) {
                console.error('Error calculating time until next payment:', err);
                setTimeUntilNextPayment('Error calculating time');
            }
        };

        updateTimeRemaining();
        const interval = setInterval(updateTimeRemaining, 60000);

        return () => clearInterval(interval);
    }, [employee]);

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-2xl mb-4">Please connect your wallet</h1>
                <p className="text-muted-foreground">Connect your wallet to view your employee dashboard</p>
            </div>
        );
    }

    if (isLoading || isLoadingTransactions) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin mb-4" />
                <p className="text-muted-foreground">Loading employee data...</p>
            </div>
        );
    }

    if (error || transactionsError) {
        console.error('Employee details error:', error || transactionsError);
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h1 className="text-2xl mb-2">Error Loading Data</h1>
                <p className="text-muted-foreground">There was an error loading your employee data</p>
                <Button onClick={() => router.push('/')} className='mt-8'>Back to Home</Button>
            </div>
        );
    }

    if (!employee || !employee.active || employee.walletAddress === '0x0000000000000000000000000000000000000000') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <AlertCircle className="h-12 w-12 mb-4" />
                <h1 className="text-2xl mb-2">Not Registered</h1>
                <p className="text-muted-foreground mb-4">You are not registered as an employee in the Opera system</p>
                <p className="text-center max-w-md mb-6">
                    If you believe this is an error, please contact your employer to ensure your wallet address is correctly registered.
                </p>
                <Button onClick={() => router.push('/')} className='mt-8'>Back to Home</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl mb-8">Employee Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Employee Information</CardTitle>
                        <CardDescription>Your registered employee details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Name</p>
                            <p className="font-medium">{employee.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Wallet Address</p>
                            <p className="font-medium text-sm break-all">{employee.walletAddress}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Employer</p>
                            <p className="font-medium text-sm break-all">{employee.employer}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <div className="flex items-center gap-2">
                                {employee.active ? (
                                    <>
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span className="font-medium">Active</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="h-4 w-4 text-destructive" />
                                        <span className="font-medium">Inactive</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Salary Information</CardTitle>
                        <CardDescription>Your salary and payment details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Monthly Salary</p>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{employee.salaryTokenSymbol === 'USDC' ? '💵' : '💶'}</span>
                                <p className="font-medium text-2xl">
                                    {formatToken(employee.salary, employee.salaryTokenSymbol as TokenSymbol)} {employee.salaryTokenSymbol}
                                </p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Last Payment</p>
                            <p className="font-medium">
                                {employee.lastPayment && Number(employee.lastPayment) > 0
                                    ? new Date(Number(employee.lastPayment) * 1000).toLocaleDateString()
                                    : 'No payments yet'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Next Payment</p>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <p className="font-medium">{timeUntilNextPayment}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                        <CardTitle>Payment History</CardTitle>
                        <CardDescription>Recent salary payments received</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Show recent transactions or loading state */}
                    <div className="space-y-8">
                        {/* Recent transactions list */}
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions && transactions.length > 0 ? (
                                    transactions.slice(0, 3).map(tx => (
                                        <TableRow key={tx.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {tx.type === TransactionType.PAYMENT ? (
                                                        <ArrowDownCircle className="h-4 w-4 text-green-500" />
                                                    ) : tx.type === TransactionType.BONUS ? (
                                                        <Award className="h-4 w-4 text-purple-500" />
                                                    ) : (
                                                        <DollarSign className="h-4 w-4 text-yellow-500" />
                                                    )}
                                                    <span>{tx.type}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{new Date(tx.timestamp * 1000).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                {tx.amount && employee ? (
                                                    <span className="font-medium">
                                                        {employee.salaryTokenSymbol === 'USDC' ? '💵' : '💶'} {formatToken(tx.amount, employee.salaryTokenSymbol as TokenSymbol)} {employee.salaryTokenSymbol}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                                            No payment transactions yet
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
