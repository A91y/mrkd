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
  description: "Share your markdown content with a simple, shareable link. Built with Next.js and AWS S3.",
  keywords: ["markdown", "sharing", "pastebin", "gist", "notes"],
  authors: [{ name: "mrkd" }],
  openGraph: {
    title: "mrkd - Simple Markdown Sharing",
    description: "Share your markdown content with a simple, shareable link",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
