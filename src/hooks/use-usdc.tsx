// src/hooks/use-usdc.tsx
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ERC20_ABI } from '@/lib/contracts';
import { useUsdcAddress } from './use-usdc-address';
import { useContractAddress } from './use-contract-address';

/**
 * Hook to get USDC balance of current user
 */
export function useUsdcBalance() {
    const { address } = useAccount();
    const usdcAddress = useUsdcAddress();

    const { data, isLoading, error, refetch } = useReadContract({
        abi: ERC20_ABI,
        address: usdcAddress as `0x${string}`,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        }
    });

    return {
        balance: data || BigInt(0),
        isLoading,
        error,
        refetch,
    };
}

/**
 * Hook to get USDC allowance for Opera contract
 */
export function useUsdcAllowance() {
    const { address } = useAccount();
    const usdcAddress = useUsdcAddress();
    const contractAddress = useContractAddress();

    const { data, isLoading, error, refetch } = useReadContract({
        abi: ERC20_ABI,
        address: usdcAddress as `0x${string}`,
        functionName: 'allowance',
        args: address && contractAddress ? [address, contractAddress as `0x${string}`] : undefined,
        query: {
            enabled: !!address && !!contractAddress,
        }
    });

    return {
        allowance: data || BigInt(0),
        isLoading,
        error,
        refetch,
    };
}

/**
 * Hook to approve USDC spending by Opera contract
 */
export function useApproveUsdc() {
    const { writeContract, isPending, error, data: hash } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash
    });
    const usdcAddress = useUsdcAddress();
    const contractAddress = useContractAddress();

    const approve = async (amount: bigint) => {
        writeContract({
            abi: ERC20_ABI,
            address: usdcAddress as `0x${string}`,
            functionName: 'approve',
            args: [contractAddress as `0x${string}`, amount],
        });
    };

    return {
        approve,
        isPending,
        error,
        hash,
        isConfirming,
        isConfirmed,
    };
}

/**
 * Hook to check if user needs to approve USDC
 * @param requiredAmount - Amount of USDC needed
 * @returns true if approval is needed
 */
export function useNeedsUsdcApproval(requiredAmount: bigint) {
    const { allowance, isLoading } = useUsdcAllowance();

    const needsApproval = allowance < requiredAmount;

    return {
        needsApproval,
        currentAllowance: allowance,
        isLoading,
    };
}

/**
 * Hook to get USDC token info
 */
export function useUsdcInfo() {
    const usdcAddress = useUsdcAddress();

    const { data: symbol } = useReadContract({
        abi: ERC20_ABI,
        address: usdcAddress as `0x${string}`,
        functionName: 'symbol',
    });

    const { data: decimals } = useReadContract({
        abi: ERC20_ABI,
        address: usdcAddress as `0x${string}`,
        functionName: 'decimals',
    });

    const { data: name } = useReadContract({
        abi: ERC20_ABI,
        address: usdcAddress as `0x${string}`,
        functionName: 'name',
    });

    return {
        symbol: symbol || 'USDC',
        decimals: decimals || 6,
        name: name || 'USD Coin',
        address: usdcAddress,
    };
}
