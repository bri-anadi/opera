'use client'

import { useEffect, useState } from 'react'

export interface MiniKitContext {
  isInMiniKit: boolean
  isMobile: boolean
  canClose: boolean
  canOpenUrl: boolean
  canAuthenticate: boolean
}

export function useMiniKit(): MiniKitContext {
  const [context, setContext] = useState<MiniKitContext>({
    isInMiniKit: false,
    isMobile: false,
    canClose: false,
    canOpenUrl: false,
    canAuthenticate: false,
  })

  useEffect(() => {
    // Check if we're running in MiniKit context
    const isInMiniKit = typeof window !== 'undefined' && (
      window.parent !== window ||
      window.location !== window.parent.location ||
      navigator.userAgent.includes('MiniKit') ||
      navigator.userAgent.includes('FarcasterEmbed')
    )

    // Check if mobile
    const isMobile = typeof window !== 'undefined' && (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth <= 768
    )

    setContext({
      isInMiniKit,
      isMobile,
      canClose: isInMiniKit,
      canOpenUrl: isInMiniKit,
      canAuthenticate: isInMiniKit,
    })
  }, [])

  return context
}

// MiniKit actions
export function useMiniKitActions() {
  const { isInMiniKit } = useMiniKit()

  const closeFrame = () => {
    if (isInMiniKit && typeof window !== 'undefined') {
      window.parent.postMessage({ type: 'minikit-close' }, '*')
    }
  }

  const openUrl = (url: string, target: '_blank' | '_self' = '_blank') => {
    if (isInMiniKit && typeof window !== 'undefined') {
      window.parent.postMessage({ 
        type: 'minikit-open-url', 
        data: { url, target }
      }, '*')
    } else {
      window.open(url, target)
    }
  }

  const authenticate = () => {
    if (isInMiniKit && typeof window !== 'undefined') {
      window.parent.postMessage({ type: 'minikit-authenticate' }, '*')
    }
  }

  const composeCast = (text: string, embeds?: string[]) => {
    if (isInMiniKit && typeof window !== 'undefined') {
      window.parent.postMessage({ 
        type: 'minikit-compose-cast',
        data: { text, embeds }
      }, '*')
    }
  }

  const showNotification = (title: string, message: string) => {
    if (isInMiniKit && typeof window !== 'undefined') {
      window.parent.postMessage({ 
        type: 'minikit-notification',
        data: { title, message }
      }, '*')
    } else if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message })
    }
  }

  return {
    closeFrame,
    openUrl,
    authenticate,
    composeCast,
    showNotification,
  }
}