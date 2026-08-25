import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Verdict — Know your AdSense answer before you apply",
  description:
    "Paste your URL and run the 34 checks Google's reviewers apply. Get a score, the blockers, and the exact fix for each one.",
};

export const viewport: Viewport = {
  themeColor: "#07080f",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body className="bg-ink-950 text-cloud-50 antialiased">{children}</body>
    </html>
  );
}