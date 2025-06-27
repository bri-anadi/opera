// src/app/employer/employees/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { formatEther } from 'viem';
import {
    useEmployeeCount,
    useEmployerEmployees,
    useRemoveEmployee,
    useUpdateSalary
} from '@/hooks/use-opera-contract';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    ArrowLeft,
    Loader2,
    UserPlus,
    Pencil,
    Trash2,
    AlertCircle,
    CheckCircle,
    Search,
    Users
} from 'lucide-react';
import ProtectedRoute from '@/components/protected-route';

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
    const [searchTerm, setSearchTerm] = useState('');
    const [employeeAddresses, setEmployeeAddresses] = useState<string[]>([]);
    const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
    const [newSalary, setNewSalary] = useState('');
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);

    // Contract hooks
    const { count: employeeCount, isLoading: isLoadingCount } = useEmployeeCount();
    const {
        employees,
        isLoading: isLoadingEmployees
    } = useEmployerEmployees(address, employeeAddresses);

    // Transaction hooks
    const {
        updateSalary,
        isPending: isUpdatePending,
        isConfirming: isUpdateConfirming,
        isConfirmed: isUpdateConfirmed
    } = useUpdateSalary();

    const {
        removeEmployee,
        isPending: isRemovePending,
        isConfirming: isRemoveConfirming,
        isConfirmed: isRemoveConfirmed
    } = useRemoveEmployee();

    // For demo purposes, set some mock employee addresses
    // In a real implementation, we would fetch these from the contract
    useEffect(() => {
        if (employeeCount > 0) {
            // This is just a placeholder. In a real implementation, we would fetch
            // the actual employee addresses from the contract.
            setEmployeeAddresses([
                '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
                '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
                '0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec'
            ].slice(0, employeeCount));
        }
    }, [employeeCount]);

    // Handle update salary confirmation
    useEffect(() => {
        if (isUpdateConfirmed) {
            toast.success('Salary updated successfully');
            setEditDialogOpen(false);
            setEditingEmployee(null);
            setNewSalary('');
        }
    }, [isUpdateConfirmed]);

    // Handle remove employee confirmation
    useEffect(() => {
        if (isRemoveConfirmed) {
            toast.success('Employee removed successfully');
            setDeleteDialogOpen(false);
            setEmployeeToDelete(null);
            // In a real implementation, we would update the employee list here
        }
    }, [isRemoveConfirmed]);

    // Handle update salary
    const handleUpdateSalary = async () => {
        if (!editingEmployee) return;

        if (!newSalary || parseFloat(newSalary) <= 0) {
            toast.error('Please enter a valid salary amount');
            return;
        }

        try {
            await updateSalary(editingEmployee, newSalary);
        } catch (error) {
            console.error('Update salary error:', error);
            toast.error('Failed to update salary');
        }
    };

    // Handle remove employee
    const handleRemoveEmployee = async () => {
        if (!employeeToDelete) return;

        try {
            await removeEmployee(employeeToDelete);
        } catch (error) {
            console.error('Remove employee error:', error);
            toast.error('Failed to remove employee');
        }
    };

    // Filter employees based on search term
    const filteredEmployees = employees.filter(employee =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.walletAddress.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto py-8">
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
                    <h1 className="text-3xl font-bold">Employees</h1>
                    <p className="text-muted-foreground">Manage your company's employees</p>
                </div>
                <Button onClick={() => router.push('/employer/employees/add')}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Employee
                </Button>
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search employees..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Employee List</CardTitle>
                    <CardDescription>View and manage all your employees</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingEmployees || isLoadingCount ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : employeeCount === 0 ? (
                        <div className="text-center py-8">
                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">No employees yet</p>
                            <Button onClick={() => router.push('/employer/employees/add')}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Add Your First Employee
                            </Button>
                        </div>
                    ) : filteredEmployees.length === 0 ? (
                        <div className="text-center py-8">
                            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-2">No employees found</p>
                            <p className="text-sm text-muted-foreground">Try a different search term</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Wallet Address</TableHead>
                                    <TableHead>Salary (ETH)</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEmployees.map((employee) => (
                                    <TableRow key={employee.walletAddress}>
                                        <TableCell className="font-medium">{employee.name}</TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {employee.walletAddress.substring(0, 6)}...{employee.walletAddress.substring(employee.walletAddress.length - 4)}
                                        </TableCell>
                                        <TableCell>{formatEther(employee.salary)}</TableCell>
                                        <TableCell>
                                            {employee.active ? (
                                                <div className="flex items-center gap-1">
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                    <span>Active</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1">
                                                    <AlertCircle className="h-4 w-4 text-destructive" />
                                                    <span>Inactive</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => {
                                                        setEditingEmployee(employee.walletAddress);
                                                        setNewSalary(formatEther(employee.salary));
                                                        setEditDialogOpen(true);
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    <span className="sr-only">Edit</span>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => {
                                                        setEmployeeToDelete(employee.walletAddress);
                                                        setDeleteDialogOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Delete</span>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Edit Salary Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Salary</DialogTitle>
                        <DialogDescription>
                            Update the monthly salary for this employee
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="new-salary">New Monthly Salary (ETH)</Label>
                        <Input
                            id="new-salary"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={newSalary}
                            onChange={(e) => setNewSalary(e.target.value)}
                            className="mt-2"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditDialogOpen(false)}
                            disabled={isUpdatePending || isUpdateConfirming}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateSalary}
                            disabled={isUpdatePending || isUpdateConfirming || !newSalary}
                        >
                            {isUpdatePending || isUpdateConfirming ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Salary'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Employee Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove Employee</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove this employee? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={isRemovePending || isRemoveConfirming}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRemoveEmployee}
                            disabled={isRemovePending || isRemoveConfirming}
                        >
                            {isRemovePending || isRemoveConfirming ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Removing...
                                </>
                            ) : (
                                'Remove Employee'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
