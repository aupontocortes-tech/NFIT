import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "nfit — Fase 1",
  description: "Gestão de personal trainer e alunos. Fase 1: login, alunos, agenda, treinos e pagamentos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
