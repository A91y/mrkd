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
  title: "mrkd - Simple Markdown Sharing",
  description: "Create beautiful markdown, share instantly. Built for writers, developers, and everyone in between. No signup required.",
  keywords: ["markdown", "sharing", "pastebin", "gist", "notes", "markdown editor", "live preview"],
  authors: [{ name: "Ayush", url: "https://ayushagr.me" }],
  openGraph: {
    title: "mrkd - Simple Markdown Sharing",
    description: "Create beautiful markdown, share instantly. Built for writers, developers, and everyone in between.",
    type: "website",
    siteName: "mrkd",
  },
  twitter: {
    card: "summary_large_image",
    title: "mrkd - Simple Markdown Sharing",
    description: "Create beautiful markdown, share instantly. No signup required.",
  },
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
