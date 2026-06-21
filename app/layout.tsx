import { ThemeProvider } from "@/components/theme-provider";
import ThemeScript from "@/components/theme-script";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";
import { SITE_INFO } from "@/lib/data/SITE";
import Providers from "@/components/provider";
import { TooltipProvider } from "@/components/ui/tooltip";

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
    template: `%s | ${SITE_INFO.name}`,
    default: `CUI portal Vehari Campus`,
  },
  description: SITE_INFO.description,
  authors: [
    {
      name: "Ali Raza",
      url: SITE_INFO.url,
    },
    {
      name: "Syed Ahmar Hussain",
      url: SITE_INFO.url,
    },
  ],
  creator: "Ali Raza",
  openGraph: {
    siteName: SITE_INFO.name,
    url: "/",
    type: "website",
    locale: "en_US",
    images: [
      { url: "/og-default.png", width: 1200, height: 630, alt: SITE_INFO.name },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ali1razdev",
    creator: "@ali1razdev",
    description: SITE_INFO.description,
    images: ["/og-default.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NuqsAdapter
            defaultOptions={{
              clearOnDefault: true,
              limitUrlUpdates: { method: "throttle", timeMs: 1000 },
            }}
          >
            <Providers>
              <TooltipProvider>{children}</TooltipProvider>
            </Providers>
          </NuqsAdapter>
          <Toaster
            richColors
            position="top-center"
            duration={4000}
            swipeDirections={["top", "left"]}
            closeButton
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
