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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${dmSans.variable} ${dmSerif.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
