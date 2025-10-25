// Generic token hooks for multi-token support
import { useAccount, useReadContract, useWriteContract, useChainId } from 'wagmi';
import { ERC20_ABI } from '@/lib/contracts';
import { getTokenConfig, TokenSymbol, SUPPORTED_TOKENS } from '@/lib/token-config';
import { useMemo } from 'react';

/**
 * Get token address for current chain
 */
export function useTokenAddress(symbol: TokenSymbol) {
  const chainId = useChainId();
  return useMemo(() => {
    const config = getTokenConfig(symbol, chainId);
    return config.address as `0x${string}`;
  }, [symbol, chainId]);
}

/**
 * Get token balance for connected wallet
 */
export function useTokenBalance(symbol: TokenSymbol) {
  const { address } = useAccount();
  const tokenAddress = useTokenAddress(symbol);

  const { data, isLoading, error, refetch } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  return {
    balance: data as bigint | undefined,
    isLoading,
    error,
    refetch
  };
}

/**
 * Get token allowance for a spender
 */
export function useTokenAllowance(symbol: TokenSymbol, spenderAddress?: `0x${string}`) {
  const { address } = useAccount();
  const tokenAddress = useTokenAddress(symbol);

  const { data, isLoading, error, refetch } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && spenderAddress ? [address, spenderAddress] : undefined,
    query: {
      enabled: !!address && !!spenderAddress,
    }
  });

  return {
    allowance: data as bigint | undefined,
    isLoading,
    error,
    refetch
  };
}

/**
 * Approve token spending
 */
export function useApproveToken(symbol: TokenSymbol) {
  const tokenAddress = useTokenAddress(symbol);

  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const approve = (spenderAddress: `0x${string}`, amount: bigint) => {
    writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spenderAddress, amount],
    });
  };

  return {
    approve,
    hash,
    isPending,
    error
  };
}

/**
 * Check if approval is needed for a specific amount
 */
export function useNeedsTokenApproval(
  symbol: TokenSymbol,
  spenderAddress?: `0x${string}`,
  requiredAmount?: bigint
) {
  const { allowance, isLoading } = useTokenAllowance(symbol, spenderAddress);

  const needsApproval = useMemo(() => {
    if (!allowance || !requiredAmount) return true;
    return allowance < requiredAmount;
  }, [allowance, requiredAmount]);

  return {
    needsApproval,
    currentAllowance: allowance,
    isLoading
  };
}

/**
 * Get token info (symbol, decimals, name)
 */
export function useTokenInfo(symbol: TokenSymbol) {
  const tokenAddress = useTokenAddress(symbol);
  const config = SUPPORTED_TOKENS[symbol];

  const { data: tokenSymbol } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'symbol',
  });

  const { data: decimals } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'decimals',
  });

  const { data: name } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'name',
  });

  return {
    symbol: tokenSymbol || config.symbol,
    decimals: decimals || config.decimals,
    name: name || config.name,
    address: tokenAddress,
    color: config.color
  };
}

/**
 * Get balances for all supported tokens
 */
export function useAllTokenBalances() {
  const usdcBalance = useTokenBalance('USDC');
  const eurcBalance = useTokenBalance('EURC');

  return {
    USDC: usdcBalance,
    EURC: eurcBalance,
    isLoading: usdcBalance.isLoading || eurcBalance.isLoading,
    refetchAll: () => {
      usdcBalance.refetch();
      eurcBalance.refetch();
    }
  };
}
