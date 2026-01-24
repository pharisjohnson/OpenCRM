import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpenCRM",
  description: "A simple, powerful, open-source CRM for small teams. Features lead management, deal pipelines, document vaults, and AI-powered insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} antialiased h-full font-sans`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

