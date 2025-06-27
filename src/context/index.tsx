// context/index.tsx
'use client'

import { wagmiAdapter, projectId } from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { baseSepolia, sepolia } from '@reown/appkit/networks'
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

// Create the modal
export const appkit = createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: [baseSepolia, sepolia],
    defaultNetwork: baseSepolia,
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
        '--w3m-font-family': 'var(--font-funnel-display)',
        "--w3m-accent": "var(--primary)"
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
