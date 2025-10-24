// src/app/employer/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { formatUsdc, parseUsdc } from '@/lib/usdc-utils';

// Import our centralized hooks
import {
    useEmployerDetails,
    useEmployeeCount,
    useEmployerBalance,
    useTotalMonthlySalary,
    useDepositFunds,
    usePayEmployees
} from '@/hooks/use-opera-contract';

// Import USDC hooks
import {
    useApproveUsdc,
    useUsdcBalance,
    useNeedsUsdcApproval
} from '@/hooks/use-usdc';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Users,
    Wallet,
    CalendarClock,
    CircleDollarSign,
    Loader2,
    PlusCircle,
} from 'lucide-react';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProtectedRoute from '@/components/protected-route';
import EmployeesTable from '@/components/employer/employees-table';
import TransactionHistory from '@/components/transaction-history';

export default function EmployerDashboardPage() {
    return (
        <ProtectedRoute requireEmployer redirectTo="/register">
            <EmployerDashboard />
        </ProtectedRoute>
    )
}

function EmployerDashboard() {
    const { address } = useAccount();
    const router = useRouter();
    const [depositAmount, setDepositAmount] = useState('');
    const [depositDialogOpen, setDepositDialogOpen] = useState(false);
    const [isApproving, setIsApproving] = useState(false);

    // Contract hooks
    const { employer, isLoading: isLoadingEmployer, refetch: refetchEmployer } = useEmployerDetails();
    const { count: employeeCount, isLoading: isLoadingEmployeeCount } = useEmployeeCount();
    const { balance, isLoading: isLoadingBalance, refetch: refetchBalance } = useEmployerBalance();
    const { totalSalary, isLoading: isLoadingTotalSalary } = useTotalMonthlySalary();

    // USDC hooks
    const { balance: usdcBalance } = useUsdcBalance();
    const { approve, isPending: isApprovePending, isConfirmed: isApproveConfirmed } = useApproveUsdc();
    const depositAmountBigInt = depositAmount ? parseUsdc(depositAmount) : BigInt(0);
    const { needsApproval } = useNeedsUsdcApproval(depositAmountBigInt);

    // Transaction hooks
    const {
        deposit,
        isPending: isDepositPending,
        isConfirmed: isDepositConfirmed,
        isConfirming: isDepositConfirming
    } = useDepositFunds();

    const {
        payMyEmployees,
        isPending: isPaymentPending,
        isConfirmed: isPaymentConfirmed,
        isConfirming: isPaymentConfirming
    } = usePayEmployees();

    // Calculate months of runway
    const monthsOfRunway = totalSalary ? Number(balance) / Number(totalSalary) : 0;

    // Handle approval confirmation - auto proceed to deposit
    useEffect(() => {
        if (isApproveConfirmed && isApproving) {
            setIsApproving(false);
            toast.success('USDC approved! Now depositing...');
            deposit(depositAmount);
        }
    }, [isApproveConfirmed, isApproving, deposit, depositAmount]);

    // Handle deposit transaction results
    useEffect(() => {
        if (isDepositConfirmed) {
            toast.success('Funds deposited successfully');
            setDepositDialogOpen(false);
            setDepositAmount('');
            setIsApproving(false);
            refetchBalance();
            refetchEmployer();
        }
    }, [isDepositConfirmed, refetchBalance, refetchEmployer]);

    // Handle payment transaction results
    useEffect(() => {
        if (isPaymentConfirmed) {
            toast.success('Payments processed successfully');
            refetchBalance();
        }
    }, [isPaymentConfirmed, refetchBalance]);

    // Handle deposit with USDC approval flow
    const handleDeposit = async () => {
        try {
            if (!depositAmount || parseFloat(depositAmount) <= 0) {
                toast.error('Please enter a valid amount');
                return;
            }

            // Check USDC balance
            if (usdcBalance < depositAmountBigInt) {
                toast.error(`Insufficient USDC. You have ${formatUsdc(usdcBalance, 2)} USDC`);
                return;
            }

            // Step 1: Approve USDC if needed
            if (needsApproval) {
                setIsApproving(true);
                toast.info('Step 1/2: Approving USDC...');
                await approve(depositAmountBigInt);
                return; // Will auto-proceed after approval via useEffect
            }

            // Step 2: Deposit (if already approved)
            toast.info('Depositing funds...');
            await deposit(depositAmount);
        } catch (error) {
            console.error('Deposit error:', error);
            toast.error('Failed to deposit funds');
        }
    };

    // Handle pay employees
    const handlePayEmployees = async () => {
        try {
            await payMyEmployees();
        } catch (error) {
            console.error('Payment error:', error);
            toast.error('Failed to process payments');
        }
    };

    // Handle navigation to add employee page
    const handleAddEmployee = () => {
        router.push('/employer/employees/add');
    };

    if (isLoadingEmployer) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin mb-4" />
                <p className="text-muted-foreground">Loading employer details...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 pt-24">
            <h1 className="text-3xl mb-2">Employer Dashboard</h1>
            {employer && <p className="text-muted-foreground mb-8">Welcome back, {employer.name}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center">
                            <Wallet className="mr-2 h-4 w-4 text-muted-foreground" />
                            <div className="text-2xl">
                                {isLoadingBalance ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    `${formatUsdc(balance, 2)} USDC`
                                )}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            onClick={() => setDepositDialogOpen(true)}
                            disabled={isDepositPending || isDepositConfirming}
                        >
                            {isDepositPending || isDepositConfirming ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Depositing...
                                </>
                            ) : (
                                <>Deposit Funds</>
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Monthly Payroll</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center">
                            <CircleDollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                            <div className="text-2xl">
                                {isLoadingTotalSalary ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    `${formatUsdc(totalSalary, 2)} USDC`
                                )}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            onClick={handlePayEmployees}
                            disabled={isPaymentPending || isPaymentConfirming || totalSalary === BigInt(0) || balance < totalSalary}
                            variant={totalSalary > BigInt(0) && balance >= totalSalary ? "default" : "outline"}
                        >
                            {isPaymentPending || isPaymentConfirming ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing Payments...
                                </>
                            ) : (
                                <>Process Payments</>
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Employees</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                            <div className="text-2xl">
                                {isLoadingEmployeeCount ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    employeeCount
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Runway</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center">
                            <CalendarClock className="mr-2 h-4 w-4 text-muted-foreground" />
                            <div className="text-2xl">
                                {isLoadingBalance || isLoadingTotalSalary ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : totalSalary === BigInt(0) ? (
                                    "∞"
                                ) : (
                                    `${monthsOfRunway.toFixed(1)} months`
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="employees">
                <TabsList>
                    <TabsTrigger value="employees">Employees</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="employees" className="mt-2">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col md:flex-row justify-between md:items-center items-start space-y-4 md:space-y-0">
                                <div>
                                    <CardTitle>Employee Management</CardTitle>
                                    <CardDescription>Manage your employees and their salaries</CardDescription>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <Button asChild size="sm" variant="outline">
                                        <a href="/employer/employees">
                                            View All
                                        </a>
                                    </Button>
                                    <Button asChild size="sm">
                                        <a href="/employer/employees/add">
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Add Employee
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {address && (
                                <EmployeesTable
                                    employerAddress={address}
                                    compact={true}
                                    maxDisplayed={5}
                                    onAddEmployee={handleAddEmployee}
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="transactions" className="mt-2">
                    {address && <TransactionHistory employerAddress={address} />}
                </TabsContent>

                <TabsContent value="settings" className="mt-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Settings</CardTitle>
                            <CardDescription>Manage your employer account settings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">Account settings feature coming soon</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Deposit Dialog */}
            <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Deposit Funds</DialogTitle>
                        <DialogDescription>
                            Add funds to your employer account to pay your employees
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="deposit-amount">Amount (USDC)</Label>
                        <Input
                            id="deposit-amount"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            className="mt-2"
                        />
                        <div className="mt-2 space-y-1">
                            <p className="text-xs text-muted-foreground">
                                Your USDC Balance: {formatUsdc(usdcBalance, 2)} USDC
                            </p>
                            {depositAmount && needsApproval && (
                                <p className="text-xs text-amber-600">
                                    You&apos;ll need to approve USDC spending first
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={handleDeposit}
                            disabled={isApprovePending || isDepositPending || isDepositConfirming || !depositAmount}
                        >
                            {isApprovePending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Approving USDC...
                                </>
                            ) : isDepositPending || isDepositConfirming ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Depositing...
                                </>
                            ) : needsApproval ? (
                                'Approve & Deposit'
                            ) : (
                                'Deposit Funds'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
