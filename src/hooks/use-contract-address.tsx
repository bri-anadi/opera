// src/hooks/use-contract-address.tsx
import { useAppKitNetwork } from '@reown/appkit/react';
import { useMemo } from 'react';
import { CONTRACT_ADDRESS_BASE_SEPOLIA, CONTRACT_ADDRESS_BASE_MAINNET } from '@/lib/contracts';

/**
 * Hook to get the appropriate contract address based on current network
 */
export function useContractAddress() {
    const { caipNetwork } = useAppKitNetwork();

    const contractAddress = useMemo(() => {
        if (!caipNetwork?.id) return CONTRACT_ADDRESS_BASE_MAINNET; // Default fallback

        // Extract chain ID from CAIP network ID (format: "eip155:chainId")
        const chainId = caipNetwork.id.toString();

        switch (chainId) {
            case '8453': // Base Mainnet
                return CONTRACT_ADDRESS_BASE_MAINNET;
            case '84532': // Base Sepolia
                return CONTRACT_ADDRESS_BASE_SEPOLIA;
            default:
                console.warn(`Unsupported network: ${chainId}, falling back to Base mainnet`);
                return CONTRACT_ADDRESS_BASE_MAINNET;
        }
    }, [caipNetwork?.id]);

    return contractAddress;
}
