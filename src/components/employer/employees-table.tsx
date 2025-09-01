// src/components/employer/employees-table.tsx
'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatEther } from 'viem';
import { useReadContract, useReadContracts } from 'wagmi';
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

import {
    useUpdateSalary,
    useRemoveEmployee,
    type Employee
} from '@/hooks/use-opera-contract';
import { CONTRACT_ABI } from '@/lib/contracts';
import { useContractAddress } from '@/hooks/use-contract-address';

// Maximum number of employees to display
const MAX_EMPLOYEES = 20;

type EmployeesTableProps = {
    employerAddress: string;
    compact?: boolean;
    showSearch?: boolean;
    showActions?: boolean;
    onAddEmployee?: () => void;
    maxDisplayed?: number;
};

export default function EmployeesTable({
    employerAddress,
    compact = false,
    showSearch = true,
    showActions = true,
    onAddEmployee,
    maxDisplayed = MAX_EMPLOYEES
}: EmployeesTableProps) {
    const router = useRouter();
    const contractAddress = useContractAddress();

    // State hooks
    const [searchTerm, setSearchTerm] = useState('');
    const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
    const [newSalary, setNewSalary] = useState('');
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    // Step 1: Get the count of employees for this employer
    const {
        data: employeeCount,
        isLoading: isLoadingCount,
    } = useReadContract({
        abi: CONTRACT_ABI,
        address: contractAddress,
        functionName: 'getEmployeeCountForEmployer',
        args: [employerAddress as `0x${string}`],
        query: {
            enabled: !!employerAddress,
        }
    });

    // Step 2: Generate queries for employee addresses based on count
    const employeeIndices = [];
    const limitedCount = employeeCount ? Math.min(Number(employeeCount), maxDisplayed) : 0;

    for (let i = 0; i < limitedCount; i++) {
        employeeIndices.push(i);
    }

    // Step 3: Create queries for employee addresses
    const addressQueries = employeeIndices.map(index => ({
        abi: CONTRACT_ABI,
        address: contractAddress,
        functionName: 'employerToEmployees',
        args: [employerAddress as `0x${string}`, BigInt(index)],
    }));

    // Fetch employee addresses
    const {
        data: employeeAddressesData,
        isLoading: isLoadingAddresses,
    } = useReadContracts({
        contracts: addressQueries as any,
        query: {
            enabled: addressQueries.length > 0,
        }
    });

    // Extract employee addresses
    const employeeAddresses = [];

    if (employeeAddressesData) {
        for (const result of employeeAddressesData) {
            if (result && result.result) {
                employeeAddresses.push(result.result as string);
            }
        }
    }

    // Step 4: Create queries for employee details
    const employeeQueries = employeeAddresses.map(address => ({
        abi: CONTRACT_ABI,
        address: contractAddress,
        functionName: 'employees',
        args: [address as `0x${string}`],
    }));

    // Fetch employee details
    const {
        data: employeeDetailsData,
        isLoading: isLoadingDetails,
    } = useReadContracts({
        contracts: employeeQueries as any,
        query: {
            enabled: employeeQueries.length > 0,
        }
    });

    // Process employee data
    useEffect(() => {
        if (!employeeDetailsData) {
            setEmployees([]);
            return;
        }

        const processedEmployees: Employee[] = [];

        for (const item of employeeDetailsData) {
            if (item?.result) {
                const data = item.result as any[];
                processedEmployees.push({
                    walletAddress: data[0] || '',
                    name: data[1] || '',
                    salary: data[2] || BigInt(0),
                    lastPayment: data[3] || BigInt(0),
                    active: data[4] || false,
                    employer: data[5] || '',
                } as Employee);
            }
        }

        setEmployees(processedEmployees);
        setIsLoading(false);
        setTotalCount(employeeCount ? Number(employeeCount) : 0);
    }, [employeeDetailsData, employeeCount]);

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
    const finalIsLoading = isLoadingCount || isLoadingAddresses || isLoadingDetails || isLoading;

    // Render loading state
    if (finalIsLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    // Calculate if there are more employees than we're displaying
    const hasMore = totalCount > maxDisplayed;
    const hasNoResults = filteredEmployees.length === 0 && searchTerm.length > 0;

    return (
        <div className="space-y-4">
            {/* Search bar - Always visible */}
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

            {/* Render no employees state */}
            {(!employees || employees.length === 0) && (
                <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No employees yet</p>
                    {onAddEmployee && (
                        <Button onClick={onAddEmployee}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Your First Employee
                        </Button>
                    )}
                </div>
            )}

            {/* Table - Always render if there are employees */}
            {employees && employees.length > 0 && (
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
                            {/* Show "no results" message inside the table when search returns no results */}
                            {hasNoResults ? (
                                <TableRow>
                                    <TableCell colSpan={showActions ? 5 : 4} className="text-center py-8">
                                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground mb-2">No employees found</p>
                                        <p className="text-sm text-muted-foreground">Try a different search term</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                // Render employees normally when we have results
                                filteredEmployees.map((employee) => (
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
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* "View all" button when there are more employees than shown */}
            {hasMore && (
                <div className="text-center mt-4">
                    <Button
                        variant="outline"
                        onClick={() => router.push('/employer/employees')}
                    >
                        View All Employees ({totalCount.toString()})
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
