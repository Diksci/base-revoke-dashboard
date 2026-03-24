import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers"; // Import file yang baru Anda buat

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Base Guard Revoke",
  description: "Secure your wallet on Base Network",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {/* BUNGKUS DI SINI */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}