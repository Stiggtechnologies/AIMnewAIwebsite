import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header } from '@/components/navigation/header';
import { Footer } from '@/components/navigation/footer';
import { SkipToContent } from '@/components/layout/skip-to-content';
import { Toaster } from '@/components/ui/toaster';
import { ClientTrackingWrapper } from '@/components/providers/client-tracking-wrapper';
import Script from 'next/script';
import GoogleAnalytics from '@/components/providers/google-analytics';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://aimphysiotherapy.ca'),
  title: 'AIM Physiotherapy | Physiotherapy in Edmonton',
  description: 'AIM Physiotherapy provides expert physiotherapy, injury rehab, and recovery programs in Edmonton. Same‑day appointments and evidence‑based care.',
  keywords: 'physiotherapy Edmonton, physiotherapist Edmonton, sports physiotherapy, back pain treatment, orthotics Edmonton, concussion rehab, vestibular therapy',
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: 'https://aimphysiotherapy.ca',
    siteName: 'AIM Physiotherapy',
    title: 'AIM Physiotherapy | Physiotherapy in Edmonton',
    description: 'Expert physiotherapy in Edmonton for pain relief, injury recovery, and performance rehab. Book your assessment today.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIM Physiotherapy',
    description: 'Expert physiotherapy in Edmonton for pain relief and recovery',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GoogleAnalytics />
        <Script src="/call-tracking.js" strategy="afterInteractive" />
        <ClientTrackingWrapper>
          <SkipToContent />
          <Header />
          <main id="main-content" className="min-h-screen">
            {children}
          </main>
          <Footer />
          <Toaster />
        </ClientTrackingWrapper>
      </body>
    </html>
  );
}
