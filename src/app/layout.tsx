// src/app/layout.tsx
import type { Metadata } from "next";
import { Funnel_Display } from "next/font/google";
import "./globals.css";
import { headers } from "next/headers";
import ContextProvider from '@/context'
import { Toaster } from "@/components/ui/sonner"
import { Navbar } from "@/components/layout/navbar"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"

const font = Funnel_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-funnel-display'
})

export const metadata: Metadata = {
  title: 'Opera - Open Payroll Raising Automatically',
  description: 'Open Payroll Raising Automatically',
  manifest: '/manifest.json',
  icons: {
    icon: '/opera-logo.svg',
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': 'https://opera-io.vercel.app/frame-image',
    'fc:frame:button:1': 'Launch Opera',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': 'https://opera-io.vercel.app/frame',
  },
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookies = (await headers()).get('cookie')

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={font.className}>
        <ContextProvider cookies={cookies}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            <main className="flex-1 container mx-auto min-h-screen px-8">
              {children}
            </main>
            <ThemeToggle />
            <Toaster position="top-right" />
          </ThemeProvider>
        </ContextProvider>
      </body>
    </html>
  )
}
