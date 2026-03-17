/**
 * AIM Performance - Dynamic Number Insertion (DNI) & Call Tracking
 * 
 * This script:
 * 1. Captures UTM parameters and attribution from URL
 * 2. Creates a session in AIMOS call_tracking_sessions
 * 3. Dynamically swaps phone numbers on page based on traffic source
 * 4. Links website visits to phone calls for Google Ads conversion tracking
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    supabaseUrl: 'https://optlghedswctsklcxlkn.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wdGxnaGVkc3djdHNrbGN4bGtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDcwNzc0OTUsImV4cCI6MjAyMjY1MzQ5NX0.', // AIMOS anon key (partial - get full key from Supabase)
    sessionExpireMinutes: 120,
    defaultPhone: '+1 (780) 250-8188', // Default AIM phone number
    
    // Tracking numbers for each campaign (Calgary Twilio numbers)
    trackingNumbers: {
      'google_ads': {
        e164: '+18259044875',
        display: '+1 (825) 904-4875',
        trackingNumberId: null // Will be fetched from DB
      },
      'meta_ads': {
        e164: '+18253608188',
        display: '+1 (825) 360-8188',
        trackingNumberId: null
      },
      'bing_ads': {
        e164: '+18254652893',
        display: '+1 (825) 465-2893',
        trackingNumberId: null
      },
      'organic': {
        e164: '+18257934814',
        display: '+1 (825) 793-4814',
        trackingNumberId: null
      },
      'referral': {
        e164: '+18257934814',
        display: '+1 (825) 793-4814',
        trackingNumberId: null
      },
      'direct': {
        e164: '+17802508188',
        display: '+1 (780) 250-8188',
        trackingNumberId: null
      }
    }
  };

  /**
   * Extract UTM parameters and attribution from URL
   */
  function getAttributionData() {
    const urlParams = new URLSearchParams(window.location.search);
    const referrer = document.referrer;
    
    return {
      utm_source: urlParams.get('utm_source'),
      utm_medium: urlParams.get('utm_medium'),
      utm_campaign: urlParams.get('utm_campaign'),
      utm_content: urlParams.get('utm_content'),
      utm_term: urlParams.get('utm_term'),
      gclid: urlParams.get('gclid'),
      fbclid: urlParams.get('fbclid'),
      referrer: referrer || null,
      landing_page_url: window.location.href,
      user_agent: navigator.userAgent
    };
  }

  /**
   * Determine traffic source type from attribution
   */
  function getSourceType(attribution) {
    // Google Ads (highest priority - uses GCLID)
    if (attribution.gclid || attribution.utm_source?.toLowerCase().includes('google')) {
      return 'google_ads';
    }
    
    // Meta Ads (Facebook/Instagram)
    if (attribution.fbclid || 
        attribution.utm_source?.toLowerCase().includes('facebook') ||
        attribution.utm_source?.toLowerCase().includes('instagram')) {
      return 'meta_ads';
    }
    
    // Bing Ads
    if (attribution.utm_source?.toLowerCase().includes('bing')) {
      return 'bing_ads';
    }
    
    // Organic search
    if (attribution.referrer) {
      const ref = attribution.referrer.toLowerCase();
      if (ref.includes('google') || ref.includes('bing') || ref.includes('yahoo')) {
        return 'organic';
      }
      // External referral
      if (!ref.includes(window.location.hostname)) {
        return 'referral';
      }
    }
    
    // Direct traffic (no referrer, no UTM)
    return 'direct';
  }

  /**
   * Get or create session ID (stored in sessionStorage for this visit)
   */
  function getSessionId() {
    let sessionId = sessionStorage.getItem('aim_call_tracking_session');
    if (!sessionId) {
      sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('aim_call_tracking_session', sessionId);
    }
    return sessionId;
  }

  /**
   * Fetch tracking number ID from database based on E.164 format
   */
  async function getTrackingNumberId(e164) {
    try {
      const response = await fetch(
        `${CONFIG.supabaseUrl}/rest/v1/call_tracking_numbers?e164=eq.${encodeURIComponent(e164)}&select=id&limit=1`,
        {
          headers: {
            'apikey': CONFIG.supabaseAnonKey,
            'Authorization': `Bearer ${CONFIG.supabaseAnonKey}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        return data[0]?.id || null;
      }
    } catch (error) {
      console.error('Error fetching tracking number ID:', error);
    }
    return null;
  }

  /**
   * Create session in AIMOS database
   */
  async function createSession(attribution, sourceType) {
    const sessionId = getSessionId();
    const expiresAt = new Date(Date.now() + CONFIG.sessionExpireMinutes * 60 * 1000).toISOString();
    
    // Get tracking number for this source
    const trackingConfig = CONFIG.trackingNumbers[sourceType];
    
    // Fetch tracking number ID if not cached
    if (!trackingConfig.trackingNumberId) {
      trackingConfig.trackingNumberId = await getTrackingNumberId(trackingConfig.e164);
    }
    
    const sessionData = {
      session_id: sessionId,
      tracking_number_id: trackingConfig.trackingNumberId,
      source_type: sourceType,
      source_detail: attribution.utm_campaign || null,
      utm_source: attribution.utm_source,
      utm_medium: attribution.utm_medium,
      utm_campaign: attribution.utm_campaign,
      utm_content: attribution.utm_content,
      utm_term: attribution.utm_term,
      gclid: attribution.gclid,
      fbclid: attribution.fbclid,
      referrer: attribution.referrer,
      landing_page_url: attribution.landing_page_url,
      last_page_url: attribution.landing_page_url,
      user_agent: attribution.user_agent,
      ip_address: null, // Will be populated by Edge Function if needed
      expires_at: expiresAt
    };

    try {
      const response = await fetch(
        `${CONFIG.supabaseUrl}/rest/v1/call_tracking_sessions`,
        {
          method: 'POST',
          headers: {
            'apikey': CONFIG.supabaseAnonKey,
            'Authorization': `Bearer ${CONFIG.supabaseAnonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(sessionData)
        }
      );

      if (response.ok) {
        console.log('[AIM Call Tracking] Session created:', sessionId);
        return true;
      } else {
        console.error('[AIM Call Tracking] Failed to create session:', await response.text());
      }
    } catch (error) {
      console.error('[AIM Call Tracking] Error creating session:', error);
    }
    
    return false;
  }

  /**
   * Replace all phone numbers on the page with tracking number
   */
  function replacePhoneNumbers(displayNumber) {
    // Find all phone number elements (customize selectors as needed)
    const phoneSelectors = [
      'a[href^="tel:"]',
      '.phone-number',
      '[data-phone]',
      '.contact-phone'
    ];

    const elements = document.querySelectorAll(phoneSelectors.join(', '));
    
    elements.forEach(el => {
      // Update href for tel: links
      if (el.tagName === 'A' && el.href.startsWith('tel:')) {
        const trackingConfig = Object.values(CONFIG.trackingNumbers)
          .find(c => c.display === displayNumber);
        if (trackingConfig) {
          el.href = `tel:${trackingConfig.e164}`;
        }
      }
      
      // Update text content
      if (el.textContent.includes('780-250-8188') || 
          el.textContent.includes('(780) 250-8188')) {
        el.textContent = el.textContent.replace(
          /\+?1?\s*\(?780\)?\s*250[-\s]?8188/gi,
          displayNumber
        );
      }
    });

    console.log(`[AIM Call Tracking] Replaced phone numbers with: ${displayNumber}`);
  }

  /**
   * Initialize call tracking
   */
  async function init() {
    console.log('[AIM Call Tracking] Initializing...');
    
    // Get attribution data
    const attribution = getAttributionData();
    const sourceType = getSourceType(attribution);
    
    console.log('[AIM Call Tracking] Source type:', sourceType);
    console.log('[AIM Call Tracking] Attribution:', attribution);
    
    // Get tracking number for this source
    const trackingConfig = CONFIG.trackingNumbers[sourceType];
    if (!trackingConfig) {
      console.error('[AIM Call Tracking] No tracking number configured for:', sourceType);
      return;
    }
    
    // Create session in database
    await createSession(attribution, sourceType);
    
    // Replace phone numbers on page
    replacePhoneNumbers(trackingConfig.display);
    
    // Store source type for potential later use
    sessionStorage.setItem('aim_traffic_source', sourceType);
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
