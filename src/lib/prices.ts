import axios from 'axios'
import { env } from './env'

// TwelveData API response interfaces
interface TwelveDataQuote {
  symbol: string
  name: string
  exchange: string
  mic_code: string
  currency: string
  datetime: string
  timestamp: number
  open: string
  high: string
  low: string
  close: string
  volume: string
  previous_close: string
  change: string
  percent_change: string
  average_volume: string
  is_market_open: boolean
  fifty_two_week: {
    low: string
    high: string
    low_change: string
    high_change: string
    low_change_percent: string
    high_change_percent: string
    range: string
  }
}

interface QuoteResult {
  price: number
  prevClose?: number
  currency?: string
  asOf?: string
}

// In-memory cache with 60-second TTL
interface CacheEntry<T> {
  data: T
  timestamp: number
}

const cache = new Map<string, CacheEntry<any>>()
const CACHE_TTL = 60 * 1000 // 60 seconds

// Cache helper functions
function getCachedData<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  
  const now = Date.now()
  if (now - entry.timestamp > CACHE_TTL) {
    // Cache expired, remove entry
    cache.delete(key)
    return null
  }
  
  return entry.data
}

function setCachedData<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now()
  })
}

/**
 * Get stock quote from TwelveData API with 60-second caching
 * Uses TWELVEDATA_KEY from environment variables
 */
export async function getQuote(symbol: string): Promise<QuoteResult> {
  console.log(`🔍 [TwelveData] Fetching quote for ${symbol}`)
  
  // Check cache first
  const cacheKey = `quote_${symbol}`
  const cached = getCachedData<QuoteResult>(cacheKey)
  if (cached) {
    console.log(`💾 [TwelveData] Using cached quote for ${symbol}: $${cached.price}`)
    return cached
  }

  const apiKey = env.TWELVEDATA_KEY
  
  if (!apiKey) {
    console.warn('⚠️  [TwelveData] TWELVEDATA_KEY not found, using fallback')
    throw new Error('Missing TWELVEDATA_KEY')
  }

  try {
    const response = await axios.get<TwelveDataQuote>(
      `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${apiKey}`,
      { timeout: 15000 }
    )
    
    const data = response.data
    
    // Check for API error response
    if ('code' in data || 'message' in data) {
      throw new Error(`TwelveData API error: ${(data as any).message || 'Unknown error'}`)
    }
    
    if (!data.close || !data.symbol) {
      throw new Error('Invalid response format from TwelveData')
    }
    
    const price = parseFloat(data.close)
    const prevClose = data.previous_close ? parseFloat(data.previous_close) : undefined
    
    if (isNaN(price)) {
      throw new Error('Invalid price format')
    }
    
    const result: QuoteResult = {
      price,
      prevClose,
      currency: data.currency,
      asOf: data.datetime
    }
    
    // Cache the result for 60 seconds
    setCachedData(cacheKey, result)
    
    console.log(`✅ [TwelveData] Live quote for ${symbol}: $${price} (cached for 60s)`)
    return result
    
  } catch (error) {
    console.error(`❌ [TwelveData] Failed to fetch quote for ${symbol}:`, error)
    throw error
  }
}

/**
 * Get USD/ILS exchange rate from TwelveData API with 60-second caching
 * Falls back to FX_NOW environment variable if API fails
 */
export async function getUsdIls(): Promise<number> {
  console.log(`🔍 [TwelveData] Fetching USD/ILS rate`)
  
  // Check cache first
  const cacheKey = 'fx_usdils'
  const cached = getCachedData<number>(cacheKey)
  if (cached) {
    console.log(`💾 [TwelveData] Using cached USD/ILS rate: ${cached}`)
    return cached
  }

  const apiKey = env.TWELVEDATA_KEY
  
  if (!apiKey) {
    console.warn('⚠️  [TwelveData] TWELVEDATA_KEY not found, using FX_NOW fallback')
    const fallback = parseFloat(env.FX_NOW)
    console.log(`📊 [TwelveData] Using FX_NOW fallback: ${fallback}`)
    return fallback
  }

  try {
    // Use TwelveData forex quote endpoint for USD/ILS
    const response = await axios.get<TwelveDataQuote>(
      `https://api.twelvedata.com/quote?symbol=USD/ILS&apikey=${apiKey}`,
      { timeout: 15000 }
    )
    
    const data = response.data
    
    // Check for API error response
    if ('code' in data || 'message' in data) {
      throw new Error(`TwelveData API error: ${(data as any).message || 'Unknown error'}`)
    }
    
    if (!data.close) {
      throw new Error('Invalid USD/ILS response format from TwelveData')
    }
    
    const rate = parseFloat(data.close)
    
    if (isNaN(rate)) {
      throw new Error('Invalid USD/ILS rate format')
    }
    
    // Cache the result for 60 seconds
    setCachedData(cacheKey, rate)
    
    console.log(`✅ [TwelveData] Live USD/ILS rate: ${rate} (cached for 60s)`)
    return rate
    
  } catch (error) {
    console.error(`❌ [TwelveData] Failed to fetch USD/ILS rate:`, error)
    
    // Fallback to FX_NOW environment variable
    const fallback = parseFloat(env.FX_NOW)
    console.log(`📊 [TwelveData] Using FX_NOW fallback: ${fallback}`)
    return fallback
  }
}

/**
 * Clear all cached data (useful for testing or manual refresh)
 */
export function clearCache(): void {
  cache.clear()
  console.log('🧹 [TwelveData] Cache cleared')
}
