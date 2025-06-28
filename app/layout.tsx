import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ChatBot } from '@/components/chatbot/ChatBot';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DORA - Digital Online Resource for Adventurers',
  description: 'Votre guide digital pour simplifier les démarches de visa et découvrir le monde.',
  keywords: 'visa, voyage, démarches, documents, conseils, assistant',
  authors: [{ name: 'DORA Team' }],
  openGraph: {
    title: 'DORA - Digital Online Resource for Adventurers',
    description: 'Simplifiez vos démarches de visa avec DORA',
    url: 'https://dora.travel',
    siteName: 'DORA',
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen flex flex-col bg-background text-foreground">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
        <ChatBot />
        <Toaster 
          position="bottom-right" 
          toastOptions={{
            style: {
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />
      </body>
    </html>
  );
}