// src/app/employee/page.tsx
'use client';

import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { useEmployeeDetails } from '@/hooks/use-opera-contract';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function EmployeeDashboard() {
    const { address, isConnected } = useAccount();
    const { employee, isLoading } = useEmployeeDetails(address || '');

    if (!isConnected) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Employee Dashboard</CardTitle>
                    <CardDescription>Please connect your wallet to access the employee dashboard.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Employee Dashboard</CardTitle>
                    <CardDescription>Loading your employment details...</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (!employee || !employee.active) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Employee Dashboard</CardTitle>
                    <CardDescription>
                        You are not registered as an employee in the Opera payroll system.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const lastPaymentDate = new Date(Number(employee.lastPayment) * 1000);
    const nextPaymentDate = new Date(lastPaymentDate);
    nextPaymentDate.setDate(nextPaymentDate.getDate() + 30); // Payment interval is 30 days
    const timeUntilNextPayment = nextPaymentDate.getTime() - Date.now();
    const daysUntilNextPayment = Math.ceil(timeUntilNextPayment / (1000 * 60 * 60 * 24));

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Employee Dashboard</CardTitle>
                    <CardDescription>Welcome, {employee.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-sm font-medium">Monthly Salary</h3>
                            <p className="text-2xl font-bold">{formatEther(employee.salary)} ETH</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium">Last Payment</h3>
                            <p className="text-md">{lastPaymentDate.toLocaleDateString()}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium">Next Payment</h3>
                            <p className="text-md">{nextPaymentDate.toLocaleDateString()}</p>
                            <p className="text-sm text-muted-foreground">
                                {daysUntilNextPayment > 0
                                    ? `${daysUntilNextPayment} days remaining`
                                    : 'Payment is due'}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium">Employer</h3>
                            <p className="text-md break-all">{employee.employer}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>Your recent payments</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Payment history would be displayed here. This would require fetching blockchain events
                        to show past payments.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
