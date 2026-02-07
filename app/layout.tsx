import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";
import { SITE_INFO } from "@/lib/data/SITE";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_INFO.url),
  alternates: {
    canonical: "/",
  },
  title: {
    template: `%s – ${SITE_INFO.name}`,
    default: `CUI portal Vehari Campus`,
  },
  description: SITE_INFO.description,
  authors: [
    {
      name: "Ali Raza",
      url: SITE_INFO.url,
    },
    {
      name: "Ali Raza",
      url: SITE_INFO.url,
    },
  ],
  creator: "Ali Raza",
  openGraph: {
    siteName: SITE_INFO.name,
    url: "/",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NuqsAdapter>{children}</NuqsAdapter>
          <Toaster
            richColors
            position="top-center"
            duration={2000}
            swipeDirections={["top", "left"]}
            closeButton
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
