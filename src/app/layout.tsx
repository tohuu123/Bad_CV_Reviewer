import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import ParticlesBackground from "@/components/ParticlesBackground";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Bad CV Reviewer – Improve Your Resume",
  description: "Professional AI tool to review, analyze, and improve your CV.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} ${poppins.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <ParticlesBackground />

        <div className="relative z-10">

          {/* Navigation */}
          <nav className="relative w-full px-6 py-4 border-b border-white/10 backdrop-blur-md">
            
            {/* Logo / Title on the left (does not affect centering) */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-lg font-bold text-white/90">
              Bad CV Reviewer
            </div>
          </nav>

          <div className="p-6">
            {children}
          </div>

        </div>
      </body>
    </html>
  );
}
