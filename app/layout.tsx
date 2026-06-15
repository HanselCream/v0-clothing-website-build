import type { Metadata } from 'next'

import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Lexend } from 'next/font/google'

const lexend = Lexend({ 
  subsets: ["latin"],
  weight: ["300", "500"],
  variable: "--font-lexend"
})

export const metadata: Metadata = {
  title: 'Jopesh',
  description: 'Premium auctions and fixed-price items',
  generator: 'v0.app',
icons: {
  icon: '/app-logo.jpeg',
  apple: '/app-logo.jpeg',
},
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${lexend.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
