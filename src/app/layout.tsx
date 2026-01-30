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
  metadataBase: new URL("https://mlbb-market.vercel.app"),
  title: {
    template: "%s | MLBB Skins & Accounts",
    default: "MLBB Skins & Accounts Marketplace - Buy & Sell Securely",
  },
  description: "The safest marketplace to buy and sell Mobile Legends (MLBB) skins, accounts, and giftings. Verified sellers, escrow protection, and instant delivery.",
  keywords: ["MLBB", "Mobile Legends", "Skins", "Accounts", "Buy MLBB Accounts", "Sell MLBB Skins", "Mythical Glory", "MLBB Market"],
  authors: [{ name: "MLBB Market Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mlbb-market.vercel.app",
    title: "MLBB Skins & Accounts Marketplace",
    description: "Buy and sell Mobile Legends skins and accounts securely with escrow protection.",
    siteName: "MLBB Market",
  },
  twitter: {
    card: "summary_large_image",
    title: "MLBB Skins & Accounts Marketplace",
    description: "The safest place to trade MLBB digital assets.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
