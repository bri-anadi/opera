// src/app/employer/employees/page.tsx
'use client'

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, UserPlus } from 'lucide-react';
import ProtectedRoute from '@/components/protected-route';
import EmployeesTable from '@/components/employer/employees-table';

export default function EmployeesListPage() {
    return (
        <ProtectedRoute requireEmployer redirectTo="/register">
            <EmployeesList />
        </ProtectedRoute>
    );
}

function EmployeesList() {
    const { address } = useAccount();
    const router = useRouter();

    // Handle navigation
    const handleAddEmployee = () => {
        router.push('/employer/employees/add');
    };

    return (
        <div className="container mx-auto py-8 pt-24">
            <Button
                variant="ghost"
                className="mb-4"
                onClick={() => router.push('/employer')}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Button>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl">Employees</h1>
                    <p className="text-muted-foreground">Manage your company's employees</p>
                </div>
                <Button onClick={handleAddEmployee}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Employee
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Employee List</CardTitle>
                    <CardDescription>View and manage all your employees</CardDescription>
                </CardHeader>
                <CardContent>
                    {address && (
                        <EmployeesTable
                            employerAddress={address}
                            onAddEmployee={handleAddEmployee}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
