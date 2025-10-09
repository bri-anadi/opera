// context/index.tsx
'use client'

import { wagmiAdapter, projectId } from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { baseSepolia, base } from '@reown/appkit/networks'
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'

// Set up queryClient
const queryClient = new QueryClient()

if (!projectId) {
    throw new Error('Project ID is not defined')
}

// Set up metadata
const metadata = {
    name: 'Opera',
    description: 'Open Payroll Raising Automatically',
    url: 'https://reown.com/appkit',
    icons: ['https://assets.reown.com/reown-profile-pic.png']
}


const U2UNetworkNebulas = {
    id: 2484,
    name: 'U2U Network Nebulas',
    nativeCurrency: {
        name: 'U2U Token',
        symbol: 'U2U',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ['https://rpc-nebulas-testnet.u2u.xyz'],
        },
    },
    blockExplorers: {
        default: { name: 'U2U Network Explorer', url: 'https://testnet.u2uscan.xyz' },
    },
    testnet: true,
}


const U2UNetworkMainnet = {
    id: 39,
    name: 'U2U Network Mainnet',
    nativeCurrency: {
        name: 'U2U Token',
        symbol: 'U2U',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ['https://rpc.u2u.xyz'],
        },
    },
    blockExplorers: {
        default: { name: 'U2U Network Explorer', url: 'https://u2uscan.xyz' },
    },
}

// Create the modal
export const appkit = createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: [base, baseSepolia, U2UNetworkNebulas, U2UNetworkMainnet],
    defaultNetwork: base,
    metadata: metadata,
    features: {
        analytics: true,
        socials: [],
        email: false,
        swaps: false,
        history: true,
        onramp: true,
    },
    themeVariables: {
        '--w3m-font-family': 'var(--font-funnel-display)'
    },
})

function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
    const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </WagmiProvider>
    )
}

export default ContextProvider
