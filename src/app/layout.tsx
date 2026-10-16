import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ILLUMINATE 2026 | E-Cell, IIT Bombay',
  description:
    'Official website for ILLUMINATE — the flagship entrepreneurship workshop initiative by The Entrepreneurship Cell, IIT Bombay. Empowering the next generation of Changemakers.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full dark antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-black text-white selection:bg-red-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
