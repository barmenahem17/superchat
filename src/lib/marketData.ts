import axios from 'axios'

interface ExchangeRateResponse {
  success: boolean
  base: string
  date: string
  rates: {
    ILS: number
  }
}

interface AlphaVantageGlobalQuote {
  'Global Quote': {
    '01. symbol': string
    '02. open': string
    '03. high': string
    '04. low': string
    '05. price': string
    '06. volume': string
    '07. latest trading day': string
    '08. previous close': string
    '09. change': string
    '10. change percent': string
  }
}

interface CoinGeckoResponse {
  [coinId: string]: {
    usd: number
  }
}

export async function getUsdIlsRate(): Promise<number | null> {
  try {
    const response = await axios.get<ExchangeRateResponse>(
      'https://api.exchangerate.host/latest?base=USD&symbols=ILS',
      { timeout: 10000 }
    )
    
    if (response.data.success && response.data.rates?.ILS) {
      return response.data.rates.ILS
    }
    
    console.warn('Invalid USD/ILS rate response')
    return null
  } catch (error) {
    console.error('Failed to fetch USD/ILS rate:', error)
    return null
  }
}

export async function getStockPrice(symbol: string): Promise<{ price: number | null; reason?: string }> {
  const apiKey = process.env.ALPHA_VANTAGE_KEY
  
  if (!apiKey) {
    return { price: null, reason: 'Missing ALPHA_VANTAGE_KEY' }
  }

  try {
    const response = await axios.get<AlphaVantageGlobalQuote>(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`,
      { timeout: 15000 }
    )
    
    const globalQuote = response.data['Global Quote']
    
    if (!globalQuote || !globalQuote['05. price']) {
      // Check for API limit message
      const dataStr = JSON.stringify(response.data)
      if (dataStr.includes('API call frequency') || dataStr.includes('Thank you for using Alpha Vantage')) {
        return { price: null, reason: 'API limit reached' }
      }
      return { price: null, reason: 'Invalid response format' }
    }
    
    const price = parseFloat(globalQuote['05. price'])
    
    if (isNaN(price)) {
      return { price: null, reason: 'Invalid price format' }
    }
    
    return { price }
  } catch (error) {
    console.error(`Failed to fetch stock price for ${symbol}:`, error)
    return { price: null, reason: 'Network error' }
  }
}

export async function getCryptoPrice(coinId: 'bitcoin' | 'ethereum' | 'ripple' | 'solana'): Promise<number | null> {
  try {
    const response = await axios.get<CoinGeckoResponse>(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
      { timeout: 10000 }
    )
    
    const price = response.data[coinId]?.usd
    
    if (typeof price !== 'number' || isNaN(price)) {
      console.warn(`Invalid crypto price for ${coinId}`)
      return null
    }
    
    return price
  } catch (error) {
    console.error(`Failed to fetch crypto price for ${coinId}:`, error)
    return null
  }
}

// Helper to map common crypto symbols to CoinGecko IDs
export function getCoinGeckoId(symbol: string): 'bitcoin' | 'ethereum' | 'ripple' | 'solana' | null {
  const mapping: Record<string, 'bitcoin' | 'ethereum' | 'ripple' | 'solana'> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum', 
    'XRP': 'ripple',
    'SOL': 'solana'
  }
  
  return mapping[symbol.toUpperCase()] || null
}