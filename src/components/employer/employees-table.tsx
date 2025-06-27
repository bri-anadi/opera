// src/components/employer/EmployeesTable.tsx
'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatEther } from 'viem';
import {
    useEmployerToEmployees,
    useEmployeeDetails,
    useRemoveEmployee,
    useUpdateSalary
} from '@/hooks/use-opera-contract';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
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
    Pencil,
    Trash2,
    AlertCircle,
    CheckCircle,
    Search,
    UserPlus,
    Loader2
} from 'lucide-react';

type Employee = {
    walletAddress: string;
    name: string;
    salary: bigint;
    lastPayment: bigint;
    active: boolean;
    employer: string;
};

type EmployeesTableProps = {
    employerAddress: string;
    compact?: boolean;
    maxDisplayed?: number;
    showSearch?: boolean;
    showActions?: boolean;
    onAddEmployee?: () => void;
};

export default function EmployeesTable({
    employerAddress,
    compact = false,
    maxDisplayed,
    showSearch = true,
    showActions = true,
    onAddEmployee
}: EmployeesTableProps) {
    const router = useRouter();

    // State hooks
    const [searchTerm, setSearchTerm] = useState('');
    const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
    const [newSalary, setNewSalary] = useState('');
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Contract hooks for employee addresses
    const {
        data: employeeAddresses,
        isLoading: isLoadingAddresses,
        error: addressesError
    } = useEmployerToEmployees(employerAddress);

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

    // Load employee details once we have addresses
    useEffect(() => {
        const fetchEmployeeDetails = async () => {
            if (!employeeAddresses || employeeAddresses.length === 0) {
                setEmployees([]);
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const employeeDetailsPromises = employeeAddresses.map(async (address) => {
                    const { employee } = await useEmployeeDetails(address);
                    if (!employee) return null;

                    return {
                        walletAddress: employee.walletAddress,
                        name: employee.name,
                        salary: employee.salary,
                        lastPayment: employee.lastPayment,
                        active: employee.active,
                        employer: employee.employer,
                    } as Employee;
                });

                const employeeDetails = await Promise.all(employeeDetailsPromises);
                const validEmployees = employeeDetails.filter(Boolean) as Employee[];
                setEmployees(validEmployees);
            } catch (err) {
                console.error('Error fetching employee details:', err);
                toast.error('Failed to load employee details');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEmployeeDetails();
    }, [employeeAddresses]);

    // Filter employees based on search term
    useEffect(() => {
        if (!employees) {
            setFilteredEmployees([]);
            return;
        }

        const filtered = employees.filter(employee =>
            employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.walletAddress.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (maxDisplayed && filtered.length > maxDisplayed) {
            setFilteredEmployees(filtered.slice(0, maxDisplayed));
        } else {
            setFilteredEmployees(filtered);
        }
    }, [employees, searchTerm, maxDisplayed]);

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

    // Handle edit dialog
    const openEditDialog = (employee: Employee) => {
        setEditingEmployee(employee.walletAddress);
        setNewSalary(formatEther(employee.salary));
        setEditDialogOpen(true);
    };

    // Handle delete dialog
    const openDeleteDialog = (employee: Employee) => {
        setEmployeeToDelete(employee.walletAddress);
        setDeleteDialogOpen(true);
    };

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
        }
    }, [isRemoveConfirmed]);

    // Render loading state
    if (isLoading || isLoadingAddresses) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    // Render no employees state
    if (!employees || employees.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No employees yet</p>
                {onAddEmployee && (
                    <Button onClick={onAddEmployee}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Your First Employee
                    </Button>
                )}
            </div>
        );
    }

    // Render no search results
    if (filteredEmployees.length === 0 && searchTerm) {
        return (
            <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No employees found</p>
                <p className="text-sm text-muted-foreground">Try a different search term</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search bar */}
            {showSearch && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search employees..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            )}

            {/* Table */}
            <div className={compact ? "max-h-80 overflow-y-auto" : ""}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Wallet Address</TableHead>
                            <TableHead>Salary (ETH)</TableHead>
                            <TableHead>Status</TableHead>
                            {showActions && <TableHead className="text-right">Actions</TableHead>}
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
                                {showActions && (
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => openEditDialog(employee)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                                <span className="sr-only">Edit</span>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => openDeleteDialog(employee)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Delete</span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* "View all" button when displaying limited employees */}
            {maxDisplayed && employees.length > maxDisplayed && (
                <div className="text-center mt-4">
                    <Button
                        variant="outline"
                        onClick={() => router.push('/employer/employees')}
                    >
                        View All Employees ({employees.length})
                    </Button>
                </div>
            )}

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
