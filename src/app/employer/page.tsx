// Multi-token employer dashboard
'use client'

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { TokenSymbol, TOKEN_SYMBOLS, DEFAULT_TOKEN } from '@/lib/token-config';
import { formatTokenWithCommas } from '@/lib/token-utils';

// Multi-token hooks
import {
  useEmployerBalances,
  useEmployerInfo,
  useEmployeeCount,
  useTotalMonthlySalaries,
  usePayEmployees
} from '@/hooks/use-multi-token-contract';

import { useAllTokenBalances } from '@/hooks/use-token';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  CalendarClock,
  Loader2,
  PlusCircle,
  Send,
} from 'lucide-react';

import ProtectedRoute from '@/components/protected-route';
import { TokenBalanceCard } from '@/components/token-balance-card';
import { DepositDialogMultiToken } from '@/components/employer/deposit-dialog-multi-token';
import TransactionHistory from '@/components/transaction-history';
import EmployeesTable from '@/components/employer/employees-table';

export default function EmployerPage() {
  return (
    <ProtectedRoute requireEmployer redirectTo="/register">
      <EmployerDashboard />
    </ProtectedRoute>
  );
}

function EmployerDashboard() {
  const { address } = useAccount();
  const router = useRouter();
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [selectedPaymentToken, setSelectedPaymentToken] = useState<TokenSymbol>(DEFAULT_TOKEN);

  // Employer info
  const { name: employerName, isLoading: isLoadingEmployer } = useEmployerInfo();
  const { count: employeeCount, isLoading: isLoadingEmployeeCount } = useEmployeeCount();

  // Balances
  const { balances: contractBalances, isLoading: isLoadingBalances, refetchAll: refetchBalances } = useEmployerBalances();
  const { salaries: monthlySalaries, isLoading: isLoadingSalaries } = useTotalMonthlySalaries();
  const walletBalances = useAllTokenBalances();

  // Payment hook for selected token
  const {
    payEmployees,
    isPending: isPaymentPending
  } = usePayEmployees(selectedPaymentToken);

  // Handle deposit success
  const handleDepositSuccess = () => {
    refetchBalances();
    toast.success('Balances updated!');
  };

  // Handle pay employees
  const handlePayEmployees = async (token: TokenSymbol) => {
    try {
      setSelectedPaymentToken(token);
      await payEmployees();
      toast.success(`Processing ${token} payments...`);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(`Failed to process ${token} payments`);
    }
  };

  // Calculate runway for a specific token
  const calculateRunway = (balance?: bigint, salary?: bigint): number => {
    if (!salary || salary === BigInt(0)) return Infinity;
    if (!balance || balance === BigInt(0)) return 0;
    return Number(balance) / Number(salary);
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-2">Employer Dashboard</h1>
          {employerName && <p className="text-muted-foreground">Welcome back, {employerName}</p>}
        </div>
        <Button onClick={() => setDepositDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Deposit Funds
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* Employee Count */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-muted-foreground" />
              <div className="text-3xl font-bold">
                {isLoadingEmployeeCount ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  employeeCount?.toString() || '0'
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contract Balances Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Contract Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {isLoadingBalances ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                TOKEN_SYMBOLS.map((symbol) => (
                  <div key={symbol} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{symbol}:</span>
                    <span className="font-mono font-medium">
                      {formatTokenWithCommas(contractBalances[symbol], symbol, false)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Payroll Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Monthly Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {isLoadingSalaries ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                TOKEN_SYMBOLS.map((symbol) => (
                  <div key={symbol} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{symbol}:</span>
                    <span className="font-mono font-medium">
                      {formatTokenWithCommas(monthlySalaries[symbol], symbol, false)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-Token Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {TOKEN_SYMBOLS.map((symbol) => {
          const balance = contractBalances[symbol] || BigInt(0);
          const salary = monthlySalaries[symbol] || BigInt(0);
          const runway = calculateRunway(balance, salary);
          const canPay = balance >= salary && salary > BigInt(0);

          return (
            <Card key={symbol}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {symbol} Operations
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Contract Balance</p>
                    <p className="font-mono text-lg font-semibold">
                      {formatTokenWithCommas(balance, symbol, false)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Monthly Payroll</p>
                    <p className="font-mono text-lg font-semibold">
                      {formatTokenWithCommas(salary, symbol, false)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Runway</p>
                    <p className="font-medium">
                      {runway === Infinity ? '∞ months' : `${runway.toFixed(1)} months`}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handlePayEmployees(symbol)}
                  disabled={!canPay || isPaymentPending}
                  variant={canPay ? 'default' : 'outline'}
                  className="w-full"
                >
                  {isPaymentPending && selectedPaymentToken === symbol ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Pay {symbol} Employees
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="balances">
        <TabsList>
          <TabsTrigger value="balances">Balances</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="balances" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Contract Balances */}
            <TokenBalanceCard
              balances={contractBalances}
              isLoading={isLoadingBalances}
              title="Contract Balances"
              description="Funds available in the Opera contract"
            />

            {/* Wallet Balances */}
            <TokenBalanceCard
              balances={{
                USDC: walletBalances.USDC.balance,
                EURC: walletBalances.EURC.balance,
              }}
              isLoading={walletBalances.isLoading}
              title="Wallet Balances"
              description="Your personal wallet balances"
            />
          </div>
        </TabsContent>

        <TabsContent value="employees" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between md:items-center items-start space-y-4 md:space-y-0">
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
              {address && (
                <EmployeesTable
                  employerAddress={address}
                  showSearch={true}
                  onAddEmployee={() => router.push('/employer/employees/add')}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          {address && <TransactionHistory employerAddress={address} />}
        </TabsContent>
      </Tabs>

      {/* Deposit Dialog */}
      <DepositDialogMultiToken
        open={depositDialogOpen}
        onOpenChange={setDepositDialogOpen}
        onSuccess={handleDepositSuccess}
      />
    </div>
  );
}
