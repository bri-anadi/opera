'use client'

import { useMiniKitActions, useMiniKit } from '@/hooks/use-minikit'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Share2, ExternalLink, MessageSquare, Bell } from 'lucide-react'
import { useState } from 'react'

interface MiniKitSocialProps {
  title?: string
  description?: string
  url?: string
}

export function MiniKitSocial({ 
  title = "Opera Payroll", 
  description = "Check out this decentralized payroll system on Base!",
  url = "/frame"
}: MiniKitSocialProps) {
  const { isInMiniKit } = useMiniKit()
  const { composeCast, openUrl, showNotification } = useMiniKitActions()
  const [isSharing, setIsSharing] = useState(false)

  const handleShareCast = async () => {
    setIsSharing(true)
    try {
      const castText = `🎵 ${title}\n\n${description}\n\nTry it out on Base! 👇`
      const embeds = [window.location.origin + url]
      
      composeCast(castText, embeds)
      showNotification('Cast Composed', 'Your cast about Opera is ready to share!')
    } catch (error) {
      console.error('Error composing cast:', error)
      showNotification('Error', 'Failed to compose cast')
    } finally {
      setIsSharing(false)
    }
  }

  const handleOpenInBrowser = () => {
    openUrl(window.location.origin)
  }

  if (!isInMiniKit) {
    return null // Only show in MiniKit context
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share Opera
        </CardTitle>
        <CardDescription>
          Spread the word about decentralized payroll
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={handleShareCast}
          disabled={isSharing}
          className="w-full"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          {isSharing ? 'Composing...' : 'Share as Cast'}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleOpenInBrowser}
          className="w-full"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Open in Browser
        </Button>
        
        <div className="text-xs text-center text-muted-foreground">
          Help others discover Opera&apos;s automated payroll system
        </div>
      </CardContent>
    </Card>
  )
}

export function MiniKitNotifications() {
  const { isInMiniKit } = useMiniKit()
  const { showNotification } = useMiniKitActions()

  const sendTestNotification = () => {
    showNotification(
      'Opera Payroll', 
      'Your employees have been paid successfully! 💰'
    )
  }

  if (!isInMiniKit) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={sendTestNotification}
      className="gap-2"
    >
      <Bell className="h-4 w-4" />
      Test Notification
    </Button>
  )
}