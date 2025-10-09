// config/index.tsx
import { cookieStorage, createStorage } from 'wagmi'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { baseSepolia, base } from '@reown/appkit/networks'
import { http } from 'wagmi'

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

// Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID

if (!projectId) {
    throw new Error('Project ID is not defined')
}

export const networks = [base, baseSepolia, U2UNetworkNebulas]

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
    storage: createStorage({
        storage: cookieStorage
    }),
    ssr: true,
    transports: {
        [base.id]: http(`https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
        [baseSepolia.id]: http(`https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
        [U2UNetworkNebulas.id]: http(`https://rpc-nebulas-testnet.u2u.xyz`),
    },
    projectId,
    networks
})

export const config = wagmiAdapter.wagmiConfig
