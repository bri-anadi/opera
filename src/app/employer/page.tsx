// src/app/employer/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { formatEther } from 'viem';
import { toast } from 'sonner';
import {
    useEmployerDetails,
    useEmployeeCount,
    useEmployerBalance,
    useTotalMonthlySalary,
    useDepositFunds,
    usePayEmployees
} from '@/hooks/use-opera-contract';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Users,
    Wallet,
    CalendarClock,
    CircleDollarSign,
    ArrowRight,
    Loader2,
    PlusCircle,
    RefreshCw
} from 'lucide-react';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProtectedRoute from '@/components/protected-route';

export default function EmployerDashboardPage() {
    return (
        <ProtectedRoute requireEmployer redirectTo="/register">
            <EmployerDashboard />
        </ProtectedRoute>
    )
}

function EmployerDashboard() {
    const [depositAmount, setDepositAmount] = useState('');
    const [depositDialogOpen, setDepositDialogOpen] = useState(false);

    // Contract hooks
    const { employer, isLoading: isLoadingEmployer, refetch: refetchEmployer } = useEmployerDetails();
    const { count: employeeCount, isLoading: isLoadingEmployeeCount } = useEmployeeCount();
    const { balance, isLoading: isLoadingBalance, refetch: refetchBalance } = useEmployerBalance();
    const { totalSalary, isLoading: isLoadingTotalSalary } = useTotalMonthlySalary();

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

    // Handle deposit transaction results
    useEffect(() => {
        if (isDepositConfirmed) {
            toast.success('Funds deposited successfully');
            setDepositDialogOpen(false);
            setDepositAmount('');
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

    // Handle deposit
    const handleDeposit = async () => {
        try {
            if (!depositAmount || parseFloat(depositAmount) <= 0) {
                toast.error('Please enter a valid amount');
                return;
            }

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

    if (isLoadingEmployer) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin mb-4" />
                <p className="text-muted-foreground">Loading employer details...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-2">Employer Dashboard</h1>
            {employer && <p className="text-muted-foreground mb-8">Welcome back, {employer.name}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center">
                            <Wallet className="mr-2 h-4 w-4 text-muted-foreground" />
                            <div className="text-2xl font-bold">
                                {isLoadingBalance ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    `${formatEther(balance)} ETH`
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Payroll</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center">
                            <CircleDollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                            <div className="text-2xl font-bold">
                                {isLoadingTotalSalary ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    `${formatEther(totalSalary)} ETH`
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Employees</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                            <div className="text-2xl font-bold">
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
                        <CardTitle className="text-sm font-medium text-muted-foreground">Runway</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center">
                            <CalendarClock className="mr-2 h-4 w-4 text-muted-foreground" />
                            <div className="text-2xl font-bold">
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

            <div className="flex flex-wrap gap-4 mb-8">
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

                <Button asChild variant="outline">
                    <a href="/employer/employees">
                        Manage Employees
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                </Button>
            </div>

            <Tabs defaultValue="employees">
                <TabsList>
                    <TabsTrigger value="employees">Employees</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="employees" className="mt-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Employee Management</CardTitle>
                                    <CardDescription>Manage your employees and their salaries</CardDescription>
                                </div>
                                <Button asChild size="sm">
                                    <a href="/employer/employees/add">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Employee
                                    </a>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {employeeCount === 0 ? (
                                <div className="text-center py-8">
                                    <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                                    <p className="text-muted-foreground mb-2">No employees yet</p>
                                    <Button asChild variant="outline" size="sm">
                                        <a href="/employer/employees/add">
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Add Your First Employee
                                        </a>
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Button asChild variant="outline" size="sm">
                                        <a href="/employer/employees">
                                            View All Employees ({employeeCount})
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="transactions" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>View your recent deposit and payment transactions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">Transaction history feature coming soon</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="mt-6">
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
                        <Label htmlFor="deposit-amount">Amount (ETH)</Label>
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
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={handleDeposit}
                            disabled={isDepositPending || isDepositConfirming || !depositAmount}
                        >
                            {isDepositPending || isDepositConfirming ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Depositing...
                                </>
                            ) : (
                                'Deposit'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
