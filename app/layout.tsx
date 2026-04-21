import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistem Manajemen Pengunjung",
  description: "Aplikasi Manajemen Tamu PT Pupuk Kujang",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning> 
      <body className={`${inter.className} antialiased bg-gray-50 text-gray-900`}>
          {children}
      </body>
    </html>
  );
}