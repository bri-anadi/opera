'use client'

import { ReactNode, useEffect } from 'react'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { base, baseSepolia } from 'wagmi/chains'
import { useChainId } from 'wagmi'

interface MiniKitProviderProps {
  children: ReactNode
}

export function MiniKitProvider({ children }: MiniKitProviderProps) {
  const chainId = useChainId()
  
  // Determine which chain to use based on current chainId
  const chain = chainId === base.id ? base : baseSepolia
  
  useEffect(() => {
    // Signal that the frame is ready for MiniKit
    if (typeof window !== 'undefined' && window.parent !== window) {
      // We're in a frame/iframe context
      window.parent.postMessage({ type: 'frame-ready' }, '*')
    }
  }, [])

  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_COINBASE_API_KEY}
      chain={chain}
      config={{
        appearance: {
          name: 'Opera Payroll',
          logo: '/opera-logo.svg',
          mode: 'auto',
          theme: 'default',
        },
      }}
    >
      {children}
    </OnchainKitProvider>
  )
}