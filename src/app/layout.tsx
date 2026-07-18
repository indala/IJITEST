import type { Metadata, Viewport } from "next";
import { Inter, Crimson_Pro } from "next/font/google";
import { MotionProvider } from "@/providers/MotionProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const crimsonPro = Crimson_Pro({
  variable: "--font-crimson",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env['NEXT_PUBLIC_APP_URL'] || 'https://ijitest.org'),
  title: {
    default: "IJITEST | International Journal of Innovative Trends in Engineering Science and Technology",
    template: "%s | IJITEST"
  },
  description: "Elite International Peer-Reviewed Journal for High-Quality Research in Engineering, Science, and Technology. Fast Track Publication & Global Indexing.",
  keywords: [
    "Academic Journal",
    "Engineering Research",
    "Scientific Publication",
    "Innovative Trends",
    "Technology Journal",
    "Peer Reviewed",
    "IJITEST",
    "International Journal"
  ],
  authors: [{ name: "IJITEST Editorial Board" }],
  creator: "IJITEST",
  publisher: "IJITEST",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "IJITEST | International Journal of Innovative Trends in Engineering Science and Technology",
    description: "Global platform for breakthrough research in engineering and technology.",
    url: 'https://ijitest.org',
    siteName: 'IJITEST',
    images: [
      {
        url: '/open_graph_img.png',
        width: 1200,
        height: 630,
        alt: 'IJITEST - Scholarly Excellence',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IJITEST | Academic Excellence',
    description: 'Leading international journal for innovative engineering research.',
    images: ['/open_graph_img.png'],
  },
  icons: {
    icon: [
      { url: '/favicon_io/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon_io/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/favicon_io/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "IJITEST",
  },
};

export const viewport: Viewport = {
  themeColor: "#000066",
  width: "device-width",
  initialScale: 1,
};

import { Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { QueryProvider } from "@/lib/query-provider";
import ServiceWorkerRegister from "@/components/common/ServiceWorkerRegister";

import { NuqsAdapter } from "nuqs/adapters/next";

import { JsonLd } from "@/components/shared/JsonLd";
import { getSettingsData } from "@/actions/settings";
import { SettingsProvider } from "@/components/providers/SettingsContext";
import type { JournalSettings } from "@/db/types";

async function SettingsLayer({ children }: { children: React.ReactNode }) {
  const dynamicSettings = await getSettingsData() as JournalSettings;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": dynamicSettings.journalName,
    "alternateName": dynamicSettings.journalShortName,
    "url": "https://ijitest.org",
    "logo": "https://ijitest.org/favicon_io/apple-touch-icon.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": dynamicSettings.supportPhone,
      "contactType": "customer service",
      "availableLanguage": "English"
    }
  };

  const journalSchema = {
    "@context": "https://schema.org",
    "@type": "ScholarlyJournal",
    "name": dynamicSettings.journalName,
    "alternateName": dynamicSettings.journalShortName,
    "url": "https://ijitest.org",
    "publisher": {
      "@type": "Organization",
      "name": `${dynamicSettings.journalShortName} Publishing`
    }
  };

  return (
    <>
      <JsonLd data={organizationSchema} id="global-org" />
      <JsonLd data={journalSchema} id="global-journal" />
      <MotionProvider>
        <NuqsAdapter>
          <QueryProvider>
            <SettingsProvider settings={dynamicSettings}>
              <TooltipProvider>
                {children}
                <Toaster position="top-right" offset={50} richColors closeButton />
              </TooltipProvider>
            </SettingsProvider>
          </QueryProvider>
        </NuqsAdapter>
      </MotionProvider>
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${crimsonPro.variable} antialiased font-sans`}>
        <Suspense fallback={null}>
          <ServiceWorkerRegister />
        </Suspense>
        <SettingsLayer>{children}</SettingsLayer>
      </body>
    </html>
  );
}
