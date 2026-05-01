import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Pak Ji Farm — Sistem Monitoring Kambing",
  description: "Sistem ERP mini untuk memusatkan aktivitas operasional peternakan kambing mandiri. Monitoring real-time bobot, harga, reproduksi, dan pakan.",
};

import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${dmSans.variable} ${dmSerif.variable} antialiased`}>
        {children}
        <Toaster position="bottom-center" toastOptions={{ className: 'font-[family-name:var(--font-sans)] text-sm shadow-[0_4px_16px_rgba(0,0,0,0.1)] rounded-[12px]' }} />
      </body>
    </html>
  );
}
