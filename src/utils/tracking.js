// Influencer Tracking System
import { db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';

// Extract UTM parameters and referral codes from URL
export const getTrackingData = () => {
  const urlParams = new URLSearchParams(window.location.search);
  
  return {
    utm_source: urlParams.get('utm_source'),
    utm_medium: urlParams.get('utm_medium'), 
    utm_campaign: urlParams.get('utm_campaign'),
    ref: urlParams.get('ref'),
    timestamp: new Date().toISOString()
  };
};

// Store tracking data in localStorage for attribution
export const storeTrackingData = () => {
  const trackingData = getTrackingData();
  
  // Only store if we have tracking parameters
  if (trackingData.utm_source || trackingData.ref) {
    localStorage.setItem('attribution', JSON.stringify(trackingData));
    
    // Track the click in Firebase
    trackInfluencerClick(trackingData);
  }
};

// Track influencer clicks
export const trackInfluencerClick = async (trackingData) => {
  try {
    const clickRef = doc(db, 'influencer_clicks', `${Date.now()}_${Math.random()}`);
    await setDoc(clickRef, {
      ...trackingData,
      type: 'click',
      created_at: new Date()
    });
  } catch (error) {
    console.error('Error tracking click:', error);
  }
};

// Track conversions (sales)
export const trackConversion = async (saleData) => {
  try {
    // Get stored attribution data
    const attribution = JSON.parse(localStorage.getItem('attribution') || '{}');
    
    const conversionData = {
      ...saleData,
      attribution: attribution,
      type: 'conversion',
      created_at: new Date()
    };
    
    // Store conversion
    const conversionRef = doc(db, 'conversions', `${Date.now()}_${Math.random()}`);
    await setDoc(conversionRef, conversionData);
    
    // Update influencer stats if attributed
    if (attribution.utm_source || attribution.ref) {
      await updateInfluencerStats(attribution, saleData.amount);
    }
    
    // Clear attribution after conversion
    localStorage.removeItem('attribution');
    
  } catch (error) {
    console.error('Error tracking conversion:', error);
  }
};

// Update influencer statistics
export const updateInfluencerStats = async (attribution, saleAmount) => {
  try {
    const influencerId = attribution.utm_source || attribution.ref;
    const statsRef = doc(db, 'influencer_stats', influencerId);
    
    // Get current stats or create new
    const statsDoc = await getDoc(statsRef);
    
    if (statsDoc.exists()) {
      await updateDoc(statsRef, {
        total_sales: increment(1),
        total_revenue: increment(saleAmount),
        last_sale: new Date()
      });
    } else {
      await setDoc(statsRef, {
        influencer_id: influencerId,
        total_sales: 1,
        total_revenue: saleAmount,
        first_sale: new Date(),
        last_sale: new Date()
      });
    }
  } catch (error) {
    console.error('Error updating influencer stats:', error);
  }
};

// Promo code validation and tracking
export const validatePromoCode = (code) => {
  const promoCodes = {
    'NOMAD1': { 
      discount: 50, 
      influencer: 'Influencer A',
      utm_source: 'influencerA',
      active: true 
    },
    'NOMAD2': { 
      discount: 50, 
      influencer: 'Influencer B',
      utm_source: 'influencerB',
      active: true 
    },
    'BIRTHDAY': { 
      discount: 50, 
      influencer: 'Birthday Launch',
      utm_source: 'birthday_launch',
      active: true 
    }
  };
  
  const promoData = promoCodes[code.toUpperCase()];
  
  if (promoData && promoData.active) {
    // Store promo attribution
    const attribution = {
      utm_source: promoData.utm_source,
      utm_medium: 'promo_code',
      utm_campaign: 'birthday_launch',
      promo_code: code.toUpperCase(),
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('attribution', JSON.stringify(attribution));
    
    return {
      valid: true,
      discount: promoData.discount,
      influencer: promoData.influencer
    };
  }
  
  return { valid: false };
};

// Calculate commission for influencer
export const calculateCommission = (saleAmount, influencerId) => {
  const commissionRates = {
    'influencerA': 0.35, // 35%
    'influencerB': 0.35, // 35%
    'birthday_launch': 0.00 // No commission for general promo
  };
  
  const rate = commissionRates[influencerId] || 0;
  return saleAmount * rate;
};