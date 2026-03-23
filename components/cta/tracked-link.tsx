'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { useTracking } from '@/components/providers/tracking-provider';
import {
  trackBookingClick,
  trackWCBInquiry,
  trackMVAInquiry,
  trackEmployerInquiry,
  trackPhoneClick,
  CONVERSIONS,
} from '@/components/providers/google-analytics';

interface TrackedLinkProps {
  href: string;
  ctaId: string;
  ctaText: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  'data-cta-id'?: string;
}

// Map CTA IDs → Google Ads conversion actions
function fireGoogleAdsConversion(ctaId: string, href: string) {
  if (typeof window === 'undefined' || !window.gtag) return;

  if (href.includes('/programs/wcb') || ctaId.includes('wcb')) {
    trackWCBInquiry();
  } else if (href.includes('/programs/mva') || ctaId.includes('mva')) {
    trackMVAInquiry();
  } else if (href.includes('/employers') || ctaId.includes('employer')) {
    trackEmployerInquiry();
  } else if (
    href.includes('/book') ||
    href.includes('/intake') ||
    ctaId.includes('book') ||
    ctaId.includes('appointment')
  ) {
    trackBookingClick(ctaId);
  }
}

export function TrackedLink({ href, ctaId, ctaText, onClick, children, className }: TrackedLinkProps) {
  const { trackCTAClick } = useTracking();

  const handleClick = () => {
    trackCTAClick(ctaId, ctaText, href);
    fireGoogleAdsConversion(ctaId, href);
    onClick?.();
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
