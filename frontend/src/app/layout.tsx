import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NextHire - AI-Powered Job Application Agent",
  description: "Analyze job postings, evaluate CV compatibility, and generate personalized cover letters",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <ErrorBoundary>
          <div className="flex h-screen">
            <Sidebar />
            <main className="relative flex-1 overflow-auto bg-gradient-to-br from-background via-background to-muted/40">
              <div className="container mx-auto p-6 pt-16 lg:pt-6 animate-fade-in">
                {children}
              </div>
            </main>
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}
