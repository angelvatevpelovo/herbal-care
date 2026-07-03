import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "./components/Footer";
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
  title: "Herbal Care",
  description: "Образователна информация за билки, симптоми и природна грижа.",
  keywords: [
    "билки",
    "симптоми",
    "природна грижа",
    "herbal care",
    "здраве",
    "AI помощник",
  ],
  authors: [{ name: "Herbal Care" }],
  creator: "Herbal Care",
  icons: {
    icon: "/herbal-care-icon.svg",
    shortcut: "/herbal-care-icon.svg",
    apple: "/herbal-care-icon.svg",
  },
  openGraph: {
    title: "Herbal Care",
    description: "Образователна информация за билки, симптоми и природна грижа.",
    type: "website",
    locale: "bg_BG",
  },
  twitter: {
    card: "summary",
    title: "Herbal Care",
    description: "Образователна информация за билки, симптоми и природна грижа.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bg"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Footer />
      </body>
    </html>
  );
}
