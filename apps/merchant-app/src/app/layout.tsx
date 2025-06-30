/**
 * Root Layout for Merchant App
 * 
 * Sets up:
 * - HTML structure
 * - Global styles
 * - React Query provider
 * - Font configuration
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PayNXT - Merchant",
  description: "Manage your merchant payments",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

