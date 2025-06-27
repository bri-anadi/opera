// src/hooks/use-contract-address.tsx
import { useAppKitNetwork } from '@reown/appkit/react';
import { useMemo } from 'react';
import { CONTRACT_ADDRESS_SEPOLIA, CONTRACT_ADDRESS_BASE_SEPOLIA } from '@/lib/contracts';

/**
 * Hook to get the appropriate contract address based on current network
 */
export function useContractAddress() {
    const { caipNetwork } = useAppKitNetwork();

    const contractAddress = useMemo(() => {
        if (!caipNetwork?.id) return CONTRACT_ADDRESS_BASE_SEPOLIA; // Default fallback

        // Extract chain ID from CAIP network ID (format: "eip155:chainId")
        const chainId = caipNetwork.id.toString().split(':')[1];

        switch (chainId) {
            case '11155111': // Sepolia
                return CONTRACT_ADDRESS_SEPOLIA;
            case '84532': // Base Sepolia
                return CONTRACT_ADDRESS_BASE_SEPOLIA;
            default:
                console.warn(`Unsupported network: ${chainId}, falling back to Base Sepolia`);
                return CONTRACT_ADDRESS_BASE_SEPOLIA;
        }
    }, [caipNetwork?.id]);

    return contractAddress;
}
