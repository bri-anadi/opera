// Multi-token deposit dialog component
'use client'

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { TokenSymbol, DEFAULT_TOKEN } from '@/lib/token-config';
import { parseToken, formatTokenWithCommas, isValidTokenAmount } from '@/lib/token-utils';
import { useTokenBalance, useApproveToken, useNeedsTokenApproval } from '@/hooks/use-token';
import { useDepositFunds, useMultiTokenContractAddress } from '@/hooks/use-multi-token-contract';
import { TokenSelector } from '@/components/ui/token-selector';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle } from 'lucide-react';
import { useWaitForTransactionReceipt } from 'wagmi';

interface DepositDialogMultiTokenProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DepositDialogMultiToken({
  open,
  onOpenChange,
  onSuccess
}: DepositDialogMultiTokenProps) {
  const [selectedToken, setSelectedToken] = useState<TokenSymbol>(DEFAULT_TOKEN);
  const [amount, setAmount] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  const contractAddress = useMultiTokenContractAddress();
  const parsedAmount = amount ? parseToken(amount, selectedToken) : BigInt(0);

  // Token hooks
  const { balance: tokenBalance, refetch: refetchTokenBalance } = useTokenBalance(selectedToken);
  const { needsApproval, currentAllowance } = useNeedsTokenApproval(
    selectedToken,
    contractAddress,
    parsedAmount
  );

  // Approve hooks
  const { approve, hash: approveHash, isPending: isApprovePending } = useApproveToken(selectedToken);
  const { isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

  // Deposit hooks
  const { deposit, hash: depositHash, isPending: isDepositPending } = useDepositFunds(selectedToken);
  const { isLoading: isDepositConfirming, isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({
    hash: depositHash
  });

  // Handle approval success - auto proceed to deposit
  useEffect(() => {
    if (isApproveSuccess && isApproving) {
      setIsApproving(false);
      toast.success(`${selectedToken} approved! Now depositing...`);
      handleActualDeposit();
    }
  }, [isApproveSuccess, isApproving, selectedToken]);

  // Handle deposit success
  useEffect(() => {
    if (isDepositSuccess) {
      toast.success('Funds deposited successfully!');
      setAmount('');
      setIsApproving(false);
      onOpenChange(false);
      if (onSuccess) onSuccess();
      refetchTokenBalance();
    }
  }, [isDepositSuccess, onOpenChange, onSuccess, refetchTokenBalance]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setAmount('');
      setIsApproving(false);
      setSelectedToken(DEFAULT_TOKEN);
    }
  }, [open]);

  const handleActualDeposit = () => {
    try {
      deposit(parsedAmount);
    } catch (error) {
      console.error('Deposit error:', error);
      toast.error('Failed to deposit funds');
    }
  };

  const handleDeposit = async () => {
    try {
      if (!amount || parseFloat(amount) <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }

      if (!isValidTokenAmount(amount, selectedToken)) {
        toast.error('Invalid amount format');
        return;
      }

      // Check token balance
      if (!tokenBalance || tokenBalance < parsedAmount) {
        toast.error(
          `Insufficient ${selectedToken}. You have ${formatTokenWithCommas(tokenBalance, selectedToken, true)}`
        );
        return;
      }

      // Step 1: Approve token if needed
      if (needsApproval) {
        setIsApproving(true);
        toast.info(`Step 1/2: Approving ${selectedToken}...`);
        approve(contractAddress, parsedAmount);
        return; // Will auto-proceed after approval via useEffect
      }

      // Step 2: Deposit (if already approved)
      toast.info('Depositing funds...');
      handleActualDeposit();
    } catch (error) {
      console.error('Deposit error:', error);
      toast.error('Failed to deposit funds');
      setIsApproving(false);
    }
  };

  const isProcessing = isApprovePending || isDepositPending || isDepositConfirming;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deposit Funds</DialogTitle>
          <DialogDescription>
            Add funds to your employer account to pay your employees
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Token Selector */}
          <TokenSelector
            value={selectedToken}
            onValueChange={(token) => {
              setSelectedToken(token);
              setAmount(''); // Reset amount when changing token
            }}
            label="Select Token"
            showIcon={true}
            disabled={isProcessing}
          />

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="deposit-amount">Amount</Label>
            <Input
              id="deposit-amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isProcessing}
              className="font-mono"
            />
          </div>

          {/* Info Section */}
          <div className="space-y-2 p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Your Wallet Balance:</span>
              <span className="font-mono font-medium">
                {formatTokenWithCommas(tokenBalance, selectedToken, true)}
              </span>
            </div>

            {amount && parsedAmount > BigInt(0) && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">You will deposit:</span>
                  <span className="font-mono font-semibold">
                    {formatTokenWithCommas(parsedAmount, selectedToken, true)}
                  </span>
                </div>

                {needsApproval && (
                  <div className="flex items-start gap-2 mt-2 p-2 rounded bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      You&apos;ll need to approve {selectedToken} spending first (Step 1/2)
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeposit}
            disabled={isProcessing || !amount || parseFloat(amount) <= 0}
          >
            {isApprovePending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Approving {selectedToken}...
              </>
            ) : isDepositPending || isDepositConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Depositing...
              </>
            ) : needsApproval ? (
              `Approve & Deposit`
            ) : (
              `Deposit ${selectedToken}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
