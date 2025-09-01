import type { Metadata } from "next"
import { headers } from "next/headers"
import ContextProvider from '@/context'
import { MiniKitProvider } from '@/components/minikit-provider'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

// Frame-specific metadata
export const metadata: Metadata = {
  title: 'Opera Payroll - Mini App',
  description: 'Decentralized payroll management on Base',
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': 'https://opera-io.vercel.app/frame-image.png',
    'fc:frame:button:1': 'Open Opera',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': 'https://opera-io.vercel.app/frame',
    'of:version': '1.0',
    'of:accepts:xmtp': '2024-02-01',
    'of:image': 'https://opera-io.vercel.app/frame-image.png',
    'of:button:1': 'Launch Opera',
    'of:button:1:action': 'link',
    'of:button:1:target': 'https://opera-io.vercel.app/frame',
  },
}

export default async function FrameLayout({
  children
}: {
  children: React.ReactNode
}) {
  const cookies = (await headers()).get('cookie')

  return (
    <ContextProvider cookies={cookies}>
      <MiniKitProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
      </MiniKitProvider>
    </ContextProvider>
  )
}