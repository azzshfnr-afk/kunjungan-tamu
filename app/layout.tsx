import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/theme-provider";
import { cn } from "../lib/utils";

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans'
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Visitor Management - PT Pupuk Kujang",
  description: "Aplikasi Registrasi Tamu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      // 2. Class font-sans langsung ditembak di sini
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col">
        {/* 3. ThemeProvider dikembalikan agar komponen shadcn tidak error warnanya */}
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}