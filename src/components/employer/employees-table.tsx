// src/components/employer/employees-table.tsx
'use client'

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { formatEther } from 'viem';
import { useReadContract, useReadContracts } from 'wagmi';
import {
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
import { CONTRACT_ABI, CONTRACT_ADDRESS_BASE_SEPOLIA } from '@/lib/contracts';

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
    showSearch?: boolean;
    showActions?: boolean;
    onAddEmployee?: () => void;
};

// Maximum number of employees to display
const MAX_EMPLOYEES = 20;

export default function EmployeesTable({
    employerAddress,
    compact = false,
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
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);

    // Step 1: Get the count of employees for this employer
    const {
        data: employeeCount,
        isLoading: isLoadingCount,
    } = useReadContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS_BASE_SEPOLIA,
        functionName: 'getEmployeeCountForEmployer',
        args: [employerAddress as `0x${string}`],
        query: {
            enabled: !!employerAddress,
        }
    });

    // Calculate how many employees to fetch (up to MAX_EMPLOYEES)
    const limitedCount = useMemo(() => {
        return employeeCount ? Math.min(Number(employeeCount), MAX_EMPLOYEES) : 0;
    }, [employeeCount]);

    // Step 2: Generate queries for employee addresses
    const employeeIndices = useMemo(() => {
        if (!limitedCount) return [];
        return Array.from({ length: limitedCount }, (_, i) => i);
    }, [limitedCount]);

    // Step 3: Fetch all employee addresses using useReadContracts
    const addressQueries = useMemo(() => {
        return employeeIndices.map(index => ({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS_BASE_SEPOLIA,
            functionName: 'employerToEmployees',
            args: [employerAddress as `0x${string}`, BigInt(index)],
        }));
    }, [employerAddress, employeeIndices]);

    const {
        data: employeeAddressesData,
        isLoading: isLoadingAddresses,
    } = useReadContracts({
        contracts: addressQueries as any,
        query: {
            enabled: addressQueries.length > 0,
        }
    });

    // Extract the employee addresses from the result
    const employeeAddresses = useMemo(() => {
        if (!employeeAddressesData) return [];
        return employeeAddressesData
            .filter(Boolean)
            .map(result => result.result as string)
            .filter(address => !!address);
    }, [employeeAddressesData]);

    // Step 4: Fetch employee details for all addresses using useReadContracts
    const employeeQueries = useMemo(() => {
        return employeeAddresses.map(address => ({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS_BASE_SEPOLIA,
            functionName: 'employees',
            args: [address as `0x${string}`],
        }));
    }, [employeeAddresses]);

    const {
        data: employeeDetailsData,
        isLoading: isLoadingDetails,
    } = useReadContracts({
        contracts: employeeQueries as any,
        query: {
            enabled: employeeQueries.length > 0,
        }
    });

    // Transform employee details data into Employee objects
    const employees = useMemo(() => {
        if (!employeeDetailsData) return [];

        return employeeDetailsData
            .filter(item => item?.result)
            .map(item => {
                const data = item.result as any[];
                return {
                    walletAddress: data[0] || '',
                    name: data[1] || '',
                    salary: data[2] || BigInt(0),
                    lastPayment: data[3] || BigInt(0),
                    active: data[4] || false,
                    employer: data[5] || '',
                } as Employee;
            });
    }, [employeeDetailsData]);

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

    // Filter employees based on search term
    useEffect(() => {
        if (!employees) {
            setFilteredEmployees([]);
            return;
        }

        const filtered = employees.filter(employee =>
            employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee?.walletAddress?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilteredEmployees(filtered);
    }, [employees, searchTerm]);

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

    // Check if we're still loading data
    const isLoading = isLoadingCount || isLoadingAddresses || isLoadingDetails;

    // Render loading state
    if (isLoading) {
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

    // Calculate if there are more employees than we're displaying
    const hasMore = Number(employeeCount) > MAX_EMPLOYEES;

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

            {/* "View all" button when there are more employees than shown */}
            {hasMore && (
                <div className="text-center mt-4">
                    <Button
                        variant="outline"
                        onClick={() => router.push('/employer/employees')}
                    >
                        View All Employees ({employeeCount?.toString()})
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
