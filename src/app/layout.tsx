import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IA Brain Storming | Arena de Debate Dialético Multi-Agente',
  description: 'Plataforma de diálogo e confronto reflexivo entre agentes de Inteligência Artificial sobre os grandes temas e dilemas da humanidade.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className="antialiased min-h-screen bg-[#050814] text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
