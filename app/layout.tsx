import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

export const metadata: Metadata = {
  title: "Tata Steel - Canteen Management System | MTS Project",
  description: "Vendor Attendance Monitoring System developed by srijan sharma - MTS Team Project",
  generator: "v0.app",
  keywords: "Tata Steel, Canteen Management, Vendor Attendance, MTS Project, Punch In, Punch Out",
  authors: [{ name: "MTS Team", url: "https://tatasteel.com" }],
  creator: "Tata Steel MTS Team",
  publisher: "Tata Steel Limited",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/tata-steel-logo.png" type="image/svg+xml" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>{children}</body>
    </html>
  )
}
