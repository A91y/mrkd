import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    default: "mrkd - Simple Markdown Sharing",
    template: "%s | mrkd"
  },
  description: "Create beautiful markdown, share instantly. Built for writers, developers, and everyone in between. No signup required. Free markdown pastebin with live preview, syntax highlighting, and secure sharing.",
  keywords: [
    "markdown",
    "sharing",
    "pastebin",
    "gist",
    "notes",
    "markdown editor",
    "live preview",
    "code sharing",
    "text sharing",
    "github gist alternative",
    "paste markdown",
    "markdown viewer",
    "markdown preview",
    "secure sharing",
    "encrypted notes",
    "free pastebin",
    "markdown playground"
  ],
  authors: [{ name: "Ayush", url: "https://ayushagr.me" }],
  creator: "Ayush",
  publisher: "mrkd",
  icons: {
    icon: [
      { url: '/logo.png', sizes: '1024x1024', type: 'image/png' },
    ],
    apple: [
      { url: '/logo.png', sizes: '1024x1024', type: 'image/png' },
    ],
    shortcut: '/logo.png',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "mrkd",
    title: "mrkd - Simple Markdown Sharing",
    description: "Create beautiful markdown, share instantly. Built for writers, developers, and everyone in between.",
    images: [
      {
        url: "/api/og?title=mrkd&author=Share%20Markdown%20Instantly&preview=Create%20beautiful%20markdown%2C%20share%20instantly.%20No%20signup%20required.%20Free%20markdown%20pastebin%20with%20live%20preview%20and%20syntax%20highlighting.",
        width: 1200,
        height: 630,
        alt: "mrkd - Simple Markdown Sharing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "mrkd - Simple Markdown Sharing",
    description: "Create beautiful markdown, share instantly. No signup required.",
    creator: "@A91y",
    images: ["/api/og?title=mrkd&author=Share%20Markdown%20Instantly&preview=Create%20beautiful%20markdown%2C%20share%20instantly.%20No%20signup%20required."],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('mrkd_theme');
                // Default to dark mode for new users
                const shouldBeDark = theme !== 'light';
                if (shouldBeDark) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
