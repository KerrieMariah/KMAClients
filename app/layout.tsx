import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const _playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: 'Client Portal',
  description: 'Your secure project management portal. View projects, manage subscriptions, book calls, and access documents.',
  icons: {
    icon: [
      {
        url: '/favicon.PNG',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/favicon.PNG',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/favicon.PNG',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${_inter.variable} ${_playfair.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
