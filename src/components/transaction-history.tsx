// src/components/transaction-history.tsx
'use client'

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useTransactionHistory, TransactionType } from '@/hooks/use-transaction-history';
import { formatDistanceToNow } from 'date-fns';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ArrowUpCircle,
    ArrowDownCircle,
    UserPlus,
    UserMinus,
    DollarSign,
    Award,
    Loader2,
    ExternalLink,
} from 'lucide-react';

type TransactionHistoryProps = {
    employerAddress?: string;
    compact?: boolean;
    maxTransactions?: number;
};

export default function TransactionHistory({
    employerAddress,
    compact = false,
    maxTransactions = 10
}: TransactionHistoryProps) {
    const { address } = useAccount();
    const targetAddress = employerAddress || address;
    const [filter, setFilter] = useState<string>('all');

    const {
        transactions,
        isLoading,
        error
    } = useTransactionHistory(targetAddress, maxTransactions * 2);

    // Apply filters
    const filteredTransactions = transactions.filter(tx => {
        if (filter === 'all') return true;
        return tx.type.toLowerCase() === filter.toLowerCase();
    }).slice(0, maxTransactions);

    // Transaction type to icon mapping
    const getTransactionIcon = (type: TransactionType) => {
        switch (type) {
            case TransactionType.DEPOSIT:
                return <ArrowUpCircle className="h-5 w-5 text-green-500" />;
            case TransactionType.PAYMENT:
                return <ArrowDownCircle className="h-5 w-5 text-blue-500" />;
            case TransactionType.EMPLOYEE_ADDED:
                return <UserPlus className="h-5 w-5 text-indigo-500" />;
            case TransactionType.EMPLOYEE_REMOVED:
                return <UserMinus className="h-5 w-5 text-red-500" />;
            case TransactionType.SALARY_UPDATED:
                return <DollarSign className="h-5 w-5 text-yellow-500" />;
            case TransactionType.BONUS:
                return <Award className="h-5 w-5 text-purple-500" />;
            default:
                return <ArrowUpCircle className="h-5 w-5 text-gray-500" />;
        }
    };

    // Format address for display
    const formatAddress = (address: string) => {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-destructive">Error loading transaction history</p>
                <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">No transactions found</p>
                <p className="text-sm text-muted-foreground mt-2">
                    Transactions will appear here once you start using the platform
                </p>
            </div>
        );
    }

    // Get explorer URL based on chain
    const getExplorerUrl = (txHash: string) => {
        return `https://sepolia.basescan.org/tx/${txHash}`;
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center items-start space-y-4 sm:space-y-0">
                    <div>
                        <CardTitle>Transaction History</CardTitle>
                        <CardDescription>
                            Recent transactions on the Opera platform
                        </CardDescription>
                    </div>
                    <div>
                        <Select
                            value={filter}
                            onValueChange={setFilter}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter transactions" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Transactions</SelectItem>
                                <SelectItem value="deposit">Deposits</SelectItem>
                                <SelectItem value="payment">Payments</SelectItem>
                                <SelectItem value="employee added">Employee Additions</SelectItem>
                                <SelectItem value="employee removed">Employee Removals</SelectItem>
                                <SelectItem value="salary updated">Salary Updates</SelectItem>
                                <SelectItem value="bonus">Bonuses</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className={compact ? "max-h-80 overflow-y-auto" : ""}>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Details</TableHead>
                                {!compact && <TableHead>Transaction</TableHead>}
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTransactions.map(tx => (
                                <TableRow key={tx.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getTransactionIcon(tx.type)}
                                            <span>{tx.type}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">
                                                {new Date(tx.timestamp * 1000).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(tx.timestamp * 1000), { addSuffix: true })}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{tx.details}</div>
                                            {tx.to && (
                                                <div className="text-xs text-muted-foreground font-mono">
                                                    {tx.type === TransactionType.PAYMENT ||
                                                        tx.type === TransactionType.EMPLOYEE_ADDED ||
                                                        tx.type === TransactionType.EMPLOYEE_REMOVED ||
                                                        tx.type === TransactionType.SALARY_UPDATED
                                                        ? `To: ${formatAddress(tx.to)}`
                                                        : tx.type === TransactionType.BONUS
                                                            ? `Winner: ${formatAddress(tx.to)}`
                                                            : ''}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    {!compact && (
                                        <TableCell>
                                            <div className="font-mono text-xs">
                                                {formatAddress(tx.transactionHash)}
                                            </div>
                                        </TableCell>
                                    )}
                                    <TableCell className="text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <a
                                                href={getExplorerUrl(tx.transactionHash)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <ExternalLink className="h-4 w-4 mr-1" />
                                                View
                                            </a>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
