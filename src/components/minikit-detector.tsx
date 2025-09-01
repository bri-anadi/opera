'use client'

import { useEffect, useState } from 'react'
import { useMiniKit } from '@/hooks/use-minikit'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink, Smartphone } from 'lucide-react'

interface MiniKitDetectorProps {
  children: React.ReactNode
}

export function MiniKitDetector({ children }: MiniKitDetectorProps) {
  const { isInMiniKit, isMobile } = useMiniKit()
  const [showMiniKitPrompt, setShowMiniKitPrompt] = useState(false)

  useEffect(() => {
    // Show mini app prompt on mobile if not already in MiniKit
    if (isMobile && !isInMiniKit) {
      setShowMiniKitPrompt(true)
    }
  }, [isMobile, isInMiniKit])

  if (showMiniKitPrompt && !isInMiniKit) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Better Experience Available</CardTitle>
            <CardDescription>
              Try Opera as a Mini App for the best mobile experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => window.open('/frame', '_blank')} 
              className="w-full"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Mini App
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowMiniKitPrompt(false)}
              className="w-full"
            >
              Continue Here
            </Button>
            <div className="text-xs text-center text-muted-foreground">
              Mini Apps provide a faster, more streamlined experience
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}