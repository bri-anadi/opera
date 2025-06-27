// src/components/protected-route.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { useIsEmployer } from '@/hooks/use-opera-contract'
import { Loader2 } from 'lucide-react'

type ProtectedRouteProps = {
    children: React.ReactNode
    requireEmployer?: boolean
    requireNotEmployer?: boolean
    redirectTo?: string
}

/**
 * A component that protects routes based on employer status
 * @param children The content to render if conditions are met
 * @param requireEmployer If true, only allows employers to access
 * @param requireNotEmployer If true, only allows non-employers to access
 * @param redirectTo The path to redirect to if conditions aren't met
 */
export default function ProtectedRoute({
    children,
    requireEmployer = false,
    requireNotEmployer = false,
    redirectTo = '/'
}: ProtectedRouteProps) {
    const router = useRouter()
    const { isConnected } = useAccount()
    const { isEmployer, isLoading } = useIsEmployer()

    useEffect(() => {
        if (!isLoading) {
            if (!isConnected) {
                router.push('/')
                return
            }

            if (requireEmployer && !isEmployer) {
                router.push(redirectTo)
                return
            }

            if (requireNotEmployer && isEmployer) {
                router.push(redirectTo)
                return
            }
        }
    }, [isEmployer, isConnected, isLoading, requireEmployer, requireNotEmployer, router, redirectTo])

    if (isLoading || (requireEmployer && !isEmployer && isConnected) || (requireNotEmployer && isEmployer && isConnected)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin mb-4" />
                <p className="text-muted-foreground">Checking access...</p>
            </div>
        )
    }

    return <>{children}</>
}
