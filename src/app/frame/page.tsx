'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useIsEmployer, useEmployerDetails } from '@/hooks/use-opera-contract'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ConnectButton from '@/components/connect-button'
import { 
  Users, 
  DollarSign, 
  Building, 
  ArrowRight,
  Loader2,
  PiggyBank,
  UserPlus
} from 'lucide-react'
import Link from 'next/link'
import { formatEther } from 'viem'
import { MiniKitSocial } from '@/components/minikit-social'

export default function MiniAppFrame() {
  const { isConnected } = useAccount()
  const { isEmployer, isLoading: isLoadingEmployer } = useIsEmployer()
  const { employer, isLoading: isLoadingDetails } = useEmployerDetails()
  const [isFrameReady, setIsFrameReady] = useState(false)

  useEffect(() => {
    // Signal frame readiness to parent
    setIsFrameReady(true)
    if (typeof window !== 'undefined') {
      // Post message to parent frame that we're ready
      window.parent.postMessage({ 
        type: 'minikit-frame-ready',
        data: { ready: true }
      }, '*')
    }
  }, [])

  // Loading state
  if (!isFrameReady || isLoadingEmployer || isLoadingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Not connected state
  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-primary/10">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to Opera</CardTitle>
            <CardDescription>
              Connect your wallet to access the decentralized payroll system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <ConnectButton />
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Opera - Open Payroll Raising Automatically
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Employer dashboard
  if (isEmployer && employer) {
    return (
      <div className="min-h-screen p-4 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                {employer.name}
              </CardTitle>
              <CardDescription>Employer Dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <PiggyBank className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="text-sm font-medium">Balance</div>
                    <div className="text-lg">{formatEther(employer.balance)} ETH</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="text-sm font-medium">Status</div>
                    <div className={`text-sm ${employer.active ? 'text-green-500' : 'text-red-500'}`}>
                      {employer.active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-yellow-500" />
                  <div>
                    <div className="text-sm font-medium">Registered</div>
                    <div className="text-sm">
                      {new Date(Number(employer.registrationTime) * 1000).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-8 w-8 text-primary" />
                    <div>
                      <div className="font-medium">Manage Employees</div>
                      <div className="text-sm text-muted-foreground">
                        Add, remove, or update employee details
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <PiggyBank className="h-8 w-8 text-primary" />
                    <div>
                      <div className="font-medium">Fund Management</div>
                      <div className="text-sm text-muted-foreground">
                        Deposit funds and manage payroll
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4">
            <Button asChild className="flex-1">
              <Link href="/employer">
                Open Full Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <MiniKitSocial 
            title="Opera Payroll Dashboard"
            description="Managing payroll on Base blockchain - transparent, automated, and secure!"
          />
        </div>
      </div>
    )
  }

  // Not an employer - registration prompt
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-primary/10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Join Opera</CardTitle>
          <CardDescription>
            Register as an employer to start managing payroll
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <UserPlus className="h-12 w-12 mx-auto text-primary mb-4" />
            <p className="text-sm text-muted-foreground">
              You&apos;re not registered as an employer yet. Register now to access the full Opera payroll system.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/register">
                Register as Employer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/employee">
                Employee Dashboard
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                Learn More About Opera
              </Link>
            </Button>
          </div>

          <MiniKitSocial 
            title="Join Opera Payroll"
            description="Decentralized payroll system on Base - register as an employer today!"
          />
        </CardContent>
      </Card>
    </div>
  )
}