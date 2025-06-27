// src/app/layout.tsx
import type { Metadata } from "next";
import { Funnel_Display } from "next/font/google";
import "./globals.css";
import { headers } from "next/headers";
import ContextProvider from '@/context'

const font = Funnel_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-funnel-display'
})

export const metadata: Metadata = {
  title: 'Opera - Open Payroll Raising Automatically',
  description: 'Open Payroll Raising Automatically',
  icons: {
    icon: '/opera-logo.svg',
  },
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookies = (await headers()).get('cookie')

  return (
    <html lang="en">
      <body className={font.className}>
        <ContextProvider cookies={cookies}>{children}</ContextProvider>
      </body>
    </html>
  )
}
