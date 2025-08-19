// Load environment variables configuration
if (typeof window === 'undefined') {
  // Server-side only
  require('dotenv').config();
}

// Environment variables with fallbacks
export const env = {
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  FX_NOW: process.env.FX_NOW || '3.70',
  TWELVEDATA_KEY: process.env.TWELVEDATA_KEY || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;

// Validation function
export function validateEnv() {
  const missing: string[] = [];
  
  if (!env.DATABASE_URL) missing.push('DATABASE_URL');
  if (!env.TWELVEDATA_KEY) missing.push('TWELVEDATA_KEY');
  
  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
    return false;
  }
  
  console.log('✅ All required environment variables loaded');
  return true;
}

// Auto-validate on import (server-side only)
if (typeof window === 'undefined') {
  validateEnv();
}
