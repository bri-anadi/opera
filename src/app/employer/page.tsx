// src/app/employer/page.tsx
'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import {
    useIsEmployer,
    useEmployerDetails,
    useEmployeeCount,
    useTotalMonthlySalary,
    useEmployerBalance,
    useDepositFunds,
    useAddEmployee,
    usePayEmployees
} from '@/hooks/use-opera-contract';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function EmployerDashboard() {
    const { isConnected } = useAccount();
    const { isEmployer, isLoading: isLoadingEmployerStatus } = useIsEmployer();
    const { employer, isLoading: isLoadingEmployerDetails } = useEmployerDetails();
    const { count: employeeCount, isLoading: isLoadingEmployeeCount } = useEmployeeCount();
    const { totalSalary, isLoading: isLoadingTotalSalary } = useTotalMonthlySalary();
    const { balance: employerBalance, isLoading: isLoadingBalance, refetch: refetchBalance } = useEmployerBalance();

    const [newEmployeeAddress, setNewEmployeeAddress] = useState('');
    const [newEmployeeName, setNewEmployeeName] = useState('');
    const [newEmployeeSalary, setNewEmployeeSalary] = useState('');

    const [depositAmount, setDepositAmount] = useState('');

    const { deposit, isPending: isDepositPending, isConfirmed: isDepositConfirmed } = useDepositFunds();
    const { addEmployee, isPending: isAddEmployeePending, isConfirmed: isAddEmployeeConfirmed } = useAddEmployee();
    const { payMyEmployees, isPending: isPayingEmployees, isConfirmed: isPaymentConfirmed } = usePayEmployees();

    const isLoading =
        isLoadingEmployerStatus ||
        isLoadingEmployerDetails ||
        isLoadingEmployeeCount ||
        isLoadingTotalSalary ||
        isLoadingBalance;

    if (!isConnected) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Employer Dashboard</CardTitle>
                    <CardDescription>Please connect your wallet to access the employer dashboard.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Employer Dashboard</CardTitle>
                    <CardDescription>Loading...</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (!isEmployer) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Employer Dashboard</CardTitle>
                    <CardDescription>You are not registered as an employer.</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button>Register as Employer</Button>
                </CardFooter>
            </Card>
        );
    }

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!depositAmount) return;

        try {
            await deposit(depositAmount);
            setDepositAmount('');

            if (isDepositConfirmed) {
                refetchBalance();
            }
        } catch (error) {
            console.error('Deposit failed:', error);
        }
    };

    const handleAddEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmployeeAddress || !newEmployeeName || !newEmployeeSalary) return;

        try {
            await addEmployee(newEmployeeAddress, newEmployeeName, newEmployeeSalary);

            if (isAddEmployeeConfirmed) {
                setNewEmployeeAddress('');
                setNewEmployeeName('');
                setNewEmployeeSalary('');
            }
        } catch (error) {
            console.error('Add employee failed:', error);
        }
    };

    const handlePayEmployees = async () => {
        try {
            await payMyEmployees();

            if (isPaymentConfirmed) {
                refetchBalance();
            }
        } catch (error) {
            console.error('Payment failed:', error);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Employer Dashboard</CardTitle>
                    <CardDescription>{employer?.name || 'Your Company'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-sm font-medium">Account Balance</h3>
                            <p className="text-2xl font-bold">{formatEther(employerBalance)} ETH</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium">Monthly Payroll</h3>
                            <p className="text-2xl font-bold">{formatEther(totalSalary)} ETH</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium">Employees</h3>
                            <p className="text-2xl font-bold">{employeeCount}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium">Account Status</h3>
                            <p className="text-2xl font-bold">{employer?.active ? 'Active' : 'Inactive'}</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="justify-end">
                    <Button
                        variant="default"
                        onClick={handlePayEmployees}
                        disabled={isPayingEmployees || employeeCount === 0 || employerBalance < totalSalary}
                    >
                        {isPayingEmployees ? 'Processing...' : 'Pay All Employees'}
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Deposit Funds</CardTitle>
                    <CardDescription>Add funds to your employer account to pay your employees</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleDeposit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="depositAmount">Amount (ETH)</Label>
                            <Input
                                id="depositAmount"
                                type="text"
                                placeholder="0.1"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={isDepositPending || !depositAmount}
                        >
                            {isDepositPending ? 'Processing...' : 'Deposit'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Add Employee</CardTitle>
                    <CardDescription>Add a new employee to your payroll</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddEmployee} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="employeeAddress">Wallet Address</Label>
                            <Input
                                id="employeeAddress"
                                type="text"
                                placeholder="0x..."
                                value={newEmployeeAddress}
                                onChange={(e) => setNewEmployeeAddress(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="employeeName">Name</Label>
                            <Input
                                id="employeeName"
                                type="text"
                                placeholder="John Doe"
                                value={newEmployeeName}
                                onChange={(e) => setNewEmployeeName(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="employeeSalary">Monthly Salary (ETH)</Label>
                            <Input
                                id="employeeSalary"
                                type="text"
                                placeholder="0.05"
                                value={newEmployeeSalary}
                                onChange={(e) => setNewEmployeeSalary(e.target.value)}
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={isAddEmployeePending || !newEmployeeAddress || !newEmployeeName || !newEmployeeSalary}
                        >
                            {isAddEmployeePending ? 'Processing...' : 'Add Employee'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Employees</CardTitle>
                    <CardDescription>Manage your employees and their salaries</CardDescription>
                </CardHeader>
                <CardContent>
                    {employeeCount === 0 ? (
                        <p className="text-muted-foreground">You don't have any employees yet.</p>
                    ) : (
                        <p className="text-muted-foreground">You have {employeeCount} employees. Employee list would be displayed here.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
