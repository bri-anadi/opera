// Multi-token add employee page
'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAddress } from 'viem';
import { toast } from 'sonner';

import { TokenSymbol, DEFAULT_TOKEN, SUPPORTED_TOKENS } from '@/lib/token-config';
import { parseToken, formatTokenWithCommas, isValidTokenAmount } from '@/lib/token-utils';
import { useAddEmployee } from '@/hooks/use-multi-token-contract';
import { useEmployerBalance } from '@/hooks/use-multi-token-contract';
import { useWaitForTransactionReceipt } from 'wagmi';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, UserPlus, AlertCircle } from 'lucide-react';
import ProtectedRoute from '@/components/protected-route';
import { TokenSelector } from '@/components/ui/token-selector';

export default function AddEmployeeMultiTokenPage() {
  return (
    <ProtectedRoute requireEmployer redirectTo="/register">
      <AddEmployeeMultiTokenForm />
    </ProtectedRoute>
  );
}

function AddEmployeeMultiTokenForm() {
  const router = useRouter();
  const [employeeName, setEmployeeName] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [salary, setSalary] = useState('');
  const [selectedToken, setSelectedToken] = useState<TokenSymbol>(DEFAULT_TOKEN);

  const parsedSalary = salary ? parseToken(salary, selectedToken) : BigInt(0);

  // Get employer balance for selected token
  const { balance: employerBalance } = useEmployerBalance(undefined, selectedToken);

  // Add employee hook
  const { addEmployee, hash, isPending, error } = useAddEmployee(selectedToken);
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // Handle add employee confirmation
  useEffect(() => {
    if (isConfirmed) {
      toast.success('Employee added successfully!');
      setTimeout(() => {
        router.push('/employer');
      }, 2000);
    }
  }, [isConfirmed, router]);

  // Handle add employee error
  useEffect(() => {
    if (error) {
      console.error('Add employee error:', error);
      toast.error('Failed to add employee. Please try again.');
    }
  }, [error]);

  const handleAddEmployee = async () => {
    // Validation
    if (!employeeName.trim()) {
      toast.error('Please enter employee name');
      return;
    }

    if (!walletAddress.trim() || !isAddress(walletAddress)) {
      toast.error('Please enter a valid wallet address');
      return;
    }

    if (!salary.trim() || parseFloat(salary) <= 0) {
      toast.error('Please enter a valid salary amount');
      return;
    }

    if (!isValidTokenAmount(salary, selectedToken)) {
      toast.error('Invalid salary amount format');
      return;
    }

    try {
      addEmployee(walletAddress as `0x${string}`, employeeName, parsedSalary);
    } catch (err) {
      console.error('Add employee error:', err);
      toast.error('Failed to add employee. Please try again.');
    }
  };

  const token = SUPPORTED_TOKENS[selectedToken];
  const monthsOfRunway = employerBalance && parsedSalary > BigInt(0)
    ? Number(employerBalance) / Number(parsedSalary)
    : Infinity;

  return (
    <div className="container max-w-2xl mx-auto py-12 pt-24">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.push('/employer')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <UserPlus className="h-5 w-5" />
            <CardTitle>Add New Employee</CardTitle>
          </div>
          <CardDescription>
            Add a new employee to your company&apos;s payroll with multi-token support
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {/* Employee Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Employee Name</Label>
              <Input
                id="name"
                placeholder="Enter employee name"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                disabled={isPending || isConfirming}
              />
            </div>

            {/* Wallet Address */}
            <div className="space-y-2">
              <Label htmlFor="wallet">Wallet Address</Label>
              <Input
                id="wallet"
                placeholder="0x..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                disabled={isPending || isConfirming}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Enter the employee&apos;s Ethereum wallet address
              </p>
            </div>

            {/* Token Selector */}
            <TokenSelector
              value={selectedToken}
              onValueChange={(token) => {
                setSelectedToken(token);
                setSalary(''); // Reset salary when changing token
              }}
              label="Salary Token"
              showIcon={true}
              showDescription={true}
              disabled={isPending || isConfirming}
            />

            {/* Salary Amount */}
            <div className="space-y-2">
              <Label htmlFor="salary">Monthly Salary</Label>
              <div className="relative">
                <Input
                  id="salary"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  disabled={isPending || isConfirming}
                  className="font-mono pr-20"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground pointer-events-none">
                  {selectedToken}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the monthly salary in {selectedToken} (e.g., 5000 for {token.icon} 5,000/month)
              </p>
            </div>

            {/* Salary Preview */}
            {salary && parsedSalary > BigInt(0) && (
              <div className="p-4 rounded-lg border bg-muted/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Monthly Salary:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{token.icon}</span>
                    <span className="font-mono font-bold text-lg">
                      {formatTokenWithCommas(parsedSalary, selectedToken, false)}
                    </span>
                    <span className="text-sm text-muted-foreground">{selectedToken}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Your {selectedToken} Balance:</span>
                  <span className="font-mono font-medium">
                    {formatTokenWithCommas(employerBalance, selectedToken, true)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Runway (after adding):</span>
                  <span className="font-medium">
                    {monthsOfRunway === Infinity ? '∞' : monthsOfRunway.toFixed(1)} months
                  </span>
                </div>

                {employerBalance && parsedSalary > employerBalance && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-amber-700 dark:text-amber-300">
                      <p className="font-medium mb-1">Warning: Insufficient Balance</p>
                      <p>
                        Your current {selectedToken} balance ({formatTokenWithCommas(employerBalance, selectedToken, true)})
                        is less than the monthly salary. You&apos;ll need to deposit more funds before the first payment.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleAddEmployee}
            disabled={
              isPending ||
              isConfirming ||
              !employeeName.trim() ||
              !walletAddress.trim() ||
              !salary.trim() ||
              parseFloat(salary) <= 0
            }
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isPending ? 'Confirming Transaction...' : 'Adding Employee...'}
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Employee with {selectedToken} Salary
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Info Card */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Multi-Token Salary Info</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            • Each employee can have their salary in a different token (USDC or EURC)
          </p>
          <p>
            • You can change the salary token later if needed
          </p>
          <p>
            • Payments are processed separately per token
          </p>
          <p>
            • Make sure you have enough balance in the selected token before payroll dates
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
