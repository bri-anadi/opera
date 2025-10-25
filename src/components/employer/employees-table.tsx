// src/components/employer/employees-table.tsx
'use client'

import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    AlertCircle,
    Search,
    UserPlus,
    Loader2,
    Users
} from 'lucide-react';

import {
    useMultiTokenContractAddress
} from '@/hooks/use-multi-token-contract';
import { MULTI_TOKEN_CONTRACT_ABI } from '@/lib/contracts';

type EmployeesTableProps = {
    employerAddress: string;
    showSearch?: boolean;
    onAddEmployee?: () => void;
};

export default function EmployeesTable({
    employerAddress,
    showSearch = true,
    onAddEmployee,
}: EmployeesTableProps) {
    const contractAddress = useMultiTokenContractAddress();

    // State hooks
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    // Get the count of employees for this employer
    const {
        data: employeeCount,
        isLoading: isLoadingCount,
    } = useReadContract({
        abi: MULTI_TOKEN_CONTRACT_ABI,
        address: contractAddress as `0x${string}`,
        functionName: 'getEmployeeCountForEmployer',
        args: [employerAddress as `0x${string}`],
        query: {
            enabled: !!employerAddress,
        }
    });

    // Update total count when data is loaded
    useEffect(() => {
        setIsLoading(false);
        setTotalCount(employeeCount ? Number(employeeCount) : 0);
    }, [employeeCount]);

    // Render loading state
    if (isLoadingCount || isLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

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

            {/* Employee count display */}
            <div className="bg-muted/50 rounded-lg p-6 text-center">
                <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <h3 className="text-2xl font-bold mb-2">{totalCount}</h3>
                <p className="text-muted-foreground mb-4">
                    {totalCount === 0 ? 'No employees yet' : totalCount === 1 ? 'Employee' : 'Employees'}
                </p>

                {totalCount === 0 && onAddEmployee && (
                    <Button onClick={onAddEmployee}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Your First Employee
                    </Button>
                )}

                {totalCount > 0 && (
                    <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                        <AlertCircle className="h-5 w-5 mx-auto mb-2 text-yellow-600" />
                        <p className="text-sm text-muted-foreground">
                            Employee details list is currently unavailable.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            The contract ABI is missing the <code className="px-1 py-0.5 bg-muted rounded text-xs">employerToEmployees</code> mapping accessor.
                        </p>
                        {onAddEmployee && (
                            <Button onClick={onAddEmployee} className="mt-3" size="sm">
                                <UserPlus className="mr-2 h-4 w-4" />
                                Add Employee
                            </Button>
                        )}
                    </div>
                )}
            </div>

        </div>
    );
}
