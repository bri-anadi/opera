'use client'

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useEmployeeDetails } from '@/hooks/use-opera-contract';
import { Loader2, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function EmployeeDashboard() {
    const { address, isConnected } = useAccount();
    const [timeUntilNextPayment, setTimeUntilNextPayment] = useState<string>('');

    const {
        employee,
        isLoading,
        error
    } = useEmployeeDetails(address as string);

    // Calculate time until next payment
    useEffect(() => {
        if (!employee) return;

        const updateTimeRemaining = () => {
            if (!employee.lastPayment) return;

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
        };

        updateTimeRemaining();
        const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [employee]);

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h1 className="text-2xl font-bold mb-4">Please connect your wallet</h1>
                <p className="text-muted-foreground">Connect your wallet to view your employee dashboard</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-12 w-12 animate-spin mb-4" />
                <p className="text-muted-foreground">Loading employee data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h1 className="text-2xl font-bold mb-2">Error Loading Data</h1>
                <p className="text-muted-foreground">There was an error loading your employee data</p>
            </div>
        );
    }

    if (!employee || !employee.active || employee.walletAddress === '0x0000000000000000000000000000000000000000') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <AlertCircle className="h-12 w-12 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Not Registered</h1>
                <p className="text-muted-foreground mb-4">You are not registered as an employee in the Opera system</p>
                <p className="text-center max-w-md mb-6">
                    If you believe this is an error, please contact your employer to ensure your wallet address is correctly registered.
                </p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">Employee Dashboard</h1>

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
                            <p className="font-medium text-2xl">{formatEther(employee.salary)} ETH</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Last Payment</p>
                            <p className="font-medium">
                                {employee.lastPayment ? new Date(Number(employee.lastPayment) * 1000).toLocaleDateString() : 'No payments yet'}
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
                <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>Recent salary payments received</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground py-8">
                        <p>Payment history feature coming soon</p>
                        <p className="text-sm">This feature will display your recent payment transactions</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
