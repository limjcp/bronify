import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bronify - Modern Music Player",
  description: "Upload, play, and track your music with Bronify",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-b from-gray-900 to-black text-white`}
      >
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/50 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link
                  href="/"
                  className="flex-shrink-0 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 font-bold text-xl"
                >
                  Bronify
                </Link>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <Link
                    href="/"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
                  >
                    Leaderboard
                  </Link>
                  {/* <Link
                    href="/admin"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
                  >
                    Admin
                  </Link> */}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu, show/hide based on menu state. */}
          <div className="md:hidden border-t border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex justify-center">
              <Link
                href="/"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
              >
                Leaderboard
              </Link>
              {/* <Link
                href="/admin"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
              >
                Admin
              </Link> */}
            </div>
          </div>
        </nav>

        <div className="pt-16">{children}</div>
      </body>
    </html>
  );
}
