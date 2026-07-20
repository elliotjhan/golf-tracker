import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Golf Tracker",
  description: "A clean, simple way to track your golf scores.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white">
        <nav className="border-b border-white/10 bg-black/95">
          <div className="mx-auto relative flex w-full max-w-6xl items-center px-6 py-4 text-sm sm:px-10 lg:px-12">
            <Link
              href="/"
              className="text-sm font-medium tracking-[0.25em] uppercase"
            >
              Golf Tracker
            </Link>

            <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
              <Link
                href="/"
                className="rounded-full px-4 py-2 text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                Home
              </Link>
              <Link
                href="/rounds/new"
                className="rounded-full px-4 py-2 text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                Track Score
              </Link>
            </div>
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}
