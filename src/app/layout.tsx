import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter_Tight } from "next/font/google";
import "./globals.css";
import SmoothScrolling from "@/components/SmoothScrolling";

const geistSans = localFont({
  src: "../../public/font/local/Geist-VariableFont_wght.ttf",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "../../public/font/local/GeistMono-VariableFont_wght.ttf",
  variable: "--font-geist-mono",
});

const dancingScript = localFont({
  src: "../../public/font/local/DancingScript-VariableFont_wght.ttf",
  variable: "--font-dancing-script",
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Customer 2H Info Session | The New Era",
  description: "Join us for the Customer 2H Info Session - The New Era of Customer Experience",
  icons: {
    icon: "/customer-2h-logo.svg",
    shortcut: "/customer-2h-logo.svg",
    apple: "/customer-2h-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dancingScript.variable} ${interTight.variable} antialiased`}
      >
        <SmoothScrolling>
          {children}
        </SmoothScrolling>
      </body>
    </html>
  );
}
