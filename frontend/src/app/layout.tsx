import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Alerts from '@/components/Alerts';
import { GlobalProvider } from '@/context/GlobalContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FinSight',
  description: 'Control Financiero Personal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen bg-gray-50 text-gray-900 p-6`}>
        <GlobalProvider>
          <div className="max-w-6xl mx-auto">
            <header className="text-center mb-8">
              <h1 className="text-4xl font-extrabold text-primary tracking-wide">FinSight</h1>
              <p className="text-sm text-secondary">Control Financiero Personal</p>
            </header>
            <Navbar />
            <Alerts />
            <main className="mt-4">{children}</main>
          </div>
        </GlobalProvider>
      </body>
    </html>
  );
}