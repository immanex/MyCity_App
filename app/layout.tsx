import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "MyCity | Premium Real Estate & City Discovery",
  description: "Discover premium properties and neighborhoods in Lagos, Abuja, and Port Harcourt.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="font-sans bg-slate-50 text-slate-900 antialiased min-h-screen selection:bg-emerald-100 selection:text-emerald-900">
        <div className="fixed inset-0 bg-grid opacity-[0.03] pointer-events-none z-0" />
        <div className="relative z-10">
          {children}
        </div>
        <Toaster position="top-center" richColors expand={true} />
      </body>
    </html>
  );
}
