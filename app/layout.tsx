import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DA Cashflow & Savings Tracker",
  description: "Track your income, expenses, and saving goals easily.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        suppressHydrationWarning
        className={geistSans.variable + " " + geistMono.variable + " font-sans antialiased min-h-screen bg-slate-50"}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
