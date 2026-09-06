import type { Metadata } from 'next'
import { Inter_Tight, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'
import { NavBar } from '@/components/NavBar'
import { Footer } from '@/components/Footer'

const interTight = Inter_Tight({
  variable: '--font-inter-tight',
  subsets: ['latin'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  display: 'swap',
})

const SITE_URL = 'https://stephanmaready.vercel.app'
const DESCRIPTION =
  'Stephan Maready builds real-time systems — a modular VR interaction toolkit for Unreal Engine 5, an OpenGL renderer in C++, and gameplay and simulation work. CS at Cal State Fullerton, 2027.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Stephan Maready — Graphics & Gameplay Engineer',
    template: '%s — Stephan Maready',
  },
  description: DESCRIPTION,
  keywords: [
    'Stephan Maready',
    'graphics programming',
    'Unreal Engine 5',
    'OpenGL',
    'C++',
    'VR',
    'OpenXR',
    'game development',
    'Cal State Fullerton',
  ],
  authors: [{ name: 'Stephan Maready', url: SITE_URL }],
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'Stephan Maready',
    title: 'Stephan Maready — Graphics & Gameplay Engineer',
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stephan Maready — Graphics & Gameplay Engineer',
    description: DESCRIPTION,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${interTight.variable} ${jetbrainsMono.variable}`}>
      <body>
        <a
          href="#work"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-accent focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:text-bg-sink"
        >
          Skip to content
        </a>
        <NavBar />
        <main>{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
