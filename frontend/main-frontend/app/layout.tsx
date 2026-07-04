import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/custom-toaster"
import { AuthProvider } from "@/lib/auth-context"
import { WorkspaceProvider } from "@/lib/workspace-context"
import { ReduxProvider } from "@/lib/redux/ReduxProvider"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mailvex — All-in-One Customer Engagement & Growth Automation",
  description:
    "Replace Loops, Customer.io, Resend, Segment, and HubSpot-lite with a single unified developer-first customer engagement operating system.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.png",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0B0C0F",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-[#0B0C0F]">
      <body className={`font-sans antialiased bg-[#0B0C0F]`}>
        <ReduxProvider>
          <AuthProvider>
            <WorkspaceProvider>
              {children}
              <Toaster />
              <Analytics />
            </WorkspaceProvider>
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  )
}
