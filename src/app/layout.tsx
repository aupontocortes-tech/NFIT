import { InstallBanner } from "@/components/pwa/InstallBanner";
import { ToastProvider } from "@/components/ui/Toast";
import { themeBootScript } from "@/lib/theme";
import type { Metadata, Viewport } from "next";
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
  title: "NFIT",
  description: "App de gestão para personal trainers e alunos",
  applicationName: "NFIT",
  appleWebApp: {
    capable: true,
    title: "NFIT",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#e50914",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <ToastProvider>
          {children}
          <InstallBanner />
        </ToastProvider>
      </body>
    </html>
  );
}
