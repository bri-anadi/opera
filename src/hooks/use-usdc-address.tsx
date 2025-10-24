// src/hooks/use-usdc-address.tsx
import { useAppKitNetwork } from '@reown/appkit/react';
import { useMemo } from 'react';
import { USDC_ADDRESS_BASE_MAINNET, USDC_ADDRESS_BASE_SEPOLIA } from '@/lib/contracts';

/**
 * Hook to get the appropriate USDC token address based on current network
 */
export function useUsdcAddress() {
    const { caipNetwork } = useAppKitNetwork();

    const usdcAddress = useMemo(() => {
        if (!caipNetwork?.id) return USDC_ADDRESS_BASE_MAINNET; // Default fallback

        // Extract chain ID from CAIP network ID (format: "eip155:chainId")
        const chainId = caipNetwork.id.toString();

        switch (chainId) {
            case '8453': // Base Mainnet
                return USDC_ADDRESS_BASE_MAINNET;
            case '84532': // Base Sepolia
                return USDC_ADDRESS_BASE_SEPOLIA;
            default:
                console.warn(`Unsupported network: ${chainId}, falling back to Base mainnet USDC`);
                return USDC_ADDRESS_BASE_MAINNET;
        }
    }, [caipNetwork?.id]);

    return usdcAddress;
}
