'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// ── Config ──────────────────────────────────────────────────
const GA4_ID = 'G-RNHNF423CW';       // GA4 property (same as WordPress for now — link both sites)
const ADS_ID = 'AW-16713550918';      // Google Ads — already in layout, centralised here

export const CONVERSIONS = {
  BOOK_APPOINTMENT: `${ADS_ID}/book_appointment`,
  PHONE_CALL:       `${ADS_ID}/phone_call`,
  WCB_INQUIRY:      `${ADS_ID}/wcb_inquiry`,
  MVA_INQUIRY:      `${ADS_ID}/mva_inquiry`,
  INTAKE_FORM:      `${ADS_ID}/intake_form`,
  EMPLOYER_INQUIRY: `${ADS_ID}/employer_inquiry`,
} as const;
// ────────────────────────────────────────────────────────────

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

// ── Public conversion helpers ────────────────────────────────

export function trackBookingClick(source = 'unknown') {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'conversion', {
    send_to: CONVERSIONS.BOOK_APPOINTMENT,
    value: 150,
    currency: 'CAD',
  });
  window.gtag('event', 'book_appointment_click', {
    event_category: 'booking',
    event_label: source,
  });
}

export function trackPhoneClick(source = 'unknown') {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'conversion', {
    send_to: CONVERSIONS.PHONE_CALL,
    value: 100,
    currency: 'CAD',
  });
  window.gtag('event', 'phone_call_click', {
    event_category: 'contact',
    event_label: source,
  });
}

export function trackWCBInquiry() {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'conversion', {
    send_to: CONVERSIONS.WCB_INQUIRY,
    value: 250,
    currency: 'CAD',
  });
  window.gtag('event', 'wcb_inquiry_click', { event_category: 'high_value_lead' });
}

export function trackMVAInquiry() {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'conversion', {
    send_to: CONVERSIONS.MVA_INQUIRY,
    value: 250,
    currency: 'CAD',
  });
  window.gtag('event', 'mva_inquiry_click', { event_category: 'high_value_lead' });
}

export function trackEmployerInquiry() {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'conversion', {
    send_to: CONVERSIONS.EMPLOYER_INQUIRY,
    value: 500,
    currency: 'CAD',
  });
  window.gtag('event', 'employer_inquiry_click', { event_category: 'b2b_lead' });
}

// ── Route-change tracker ─────────────────────────────────────
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined' || !window.gtag) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    window.gtag('config', GA4_ID, { page_path: url });

    // Auto-fire booking conversion on confirmation page
    if (
      pathname === '/book/confirmed' ||
      pathname === '/booking-confirmed' ||
      pathname === '/book/success'
    ) {
      window.gtag('event', 'conversion', {
        send_to: CONVERSIONS.BOOK_APPOINTMENT,
        value: 150,
        currency: 'CAD',
      });
    }
  }, [pathname, searchParams]);

  return null;
}

// ── Main component ───────────────────────────────────────────
export default function GoogleAnalytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
        strategy="afterInteractive"
      />
      <Script id="aim-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA4_ID}', {
            send_page_view: false,
            linker: { domains: ['aimphysiotherapy.ca', 'albertainjurymanagement.ca'] }
          });
          gtag('config', '${ADS_ID}');
        `}
      </Script>
      <PageViewTracker />
    </>
  );
}
