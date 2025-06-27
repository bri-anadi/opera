// src/app/employer/employees/add/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAddress } from 'viem';
import { useAddEmployee } from '@/hooks/use-opera-contract';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, UserPlus } from 'lucide-react';
import ProtectedRoute from '@/components/protected-route';

export default function AddEmployeePage() {
    return (
        <ProtectedRoute requireEmployer redirectTo="/register">
            <AddEmployeeForm />
        </ProtectedRoute>
    );
}

function AddEmployeeForm() {
    const router = useRouter();
    const [employeeName, setEmployeeName] = useState('');
    const [walletAddress, setWalletAddress] = useState('');
    const [salary, setSalary] = useState('');

    // Use our centralized hook for adding employees
    const {
        addEmployee,
        isPending,
        isConfirming,
        isConfirmed,
        error
    } = useAddEmployee();

    // Handle add employee confirmation
    useEffect(() => {
        if (isConfirmed) {
            toast.success('Employee added successfully!');
            setTimeout(() => {
                router.push('/employer/employees');
            }, 2000);
        }
    }, [isConfirmed, router]);

    // Handle add employee error
    useEffect(() => {
        if (error) {
            console.error('Add employee error:', error);
            toast.error('Failed to add employee. Please try again.');
        }
    }, [error]);

    const handleAddEmployee = async () => {
        // Validation
        if (!employeeName.trim()) {
            toast.error('Please enter employee name');
            return;
        }

        if (!walletAddress.trim() || !isAddress(walletAddress)) {
            toast.error('Please enter a valid wallet address');
            return;
        }

        if (!salary.trim() || parseFloat(salary) <= 0) {
            toast.error('Please enter a valid salary amount');
            return;
        }

        try {
            await addEmployee(walletAddress, employeeName, salary);
        } catch (err) {
            console.error('Add employee error:', err);
            toast.error('Failed to add employee. Please try again.');
        }
    };

    return (
        <div className="container max-w-md mx-auto py-12 pt-24">
            <Button
                variant="ghost"
                className="mb-4"
                onClick={() => router.push('/employer/employees')}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Employees
            </Button>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <UserPlus className="h-5 w-5" />
                        <CardTitle>Add New Employee</CardTitle>
                    </div>
                    <CardDescription>
                        Add a new employee to your company&apos;s payroll
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Employee Name</Label>
                            <Input
                                id="name"
                                placeholder="Enter employee name"
                                value={employeeName}
                                onChange={(e) => setEmployeeName(e.target.value)}
                                disabled={isPending || isConfirming}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="wallet">Wallet Address</Label>
                            <Input
                                id="wallet"
                                placeholder="0x..."
                                value={walletAddress}
                                onChange={(e) => setWalletAddress(e.target.value)}
                                disabled={isPending || isConfirming}
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter the employee&apos;s Ethereum wallet address
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="salary">Monthly Salary (ETH)</Label>
                            <Input
                                id="salary"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={salary}
                                onChange={(e) => setSalary(e.target.value)}
                                disabled={isPending || isConfirming}
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full"
                        onClick={handleAddEmployee}
                        disabled={isPending || isConfirming || !employeeName.trim() || !walletAddress.trim() || !salary.trim()}
                    >
                        {isPending || isConfirming ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {isPending ? 'Confirming Transaction...' : 'Adding Employee...'}
                            </>
                        ) : (
                            'Add Employee'
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
