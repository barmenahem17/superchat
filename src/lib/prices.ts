interface AlphaVantageResponse {
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

export async function fetchAlphaVantageGlobalQuote(symbol: string): Promise<number | null> {
  const apiKey = process.env.ALPHA_VANTAGE_KEY
  
  if (!apiKey) {
    console.warn('ALPHA_VANTAGE_KEY not found, using demo price')
    return null
  }

  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data: AlphaVantageResponse = await response.json()
    
    if (!data['Global Quote'] || !data['Global Quote']['05. price']) {
      throw new Error('Invalid response format from Alpha Vantage')
    }
    
    const price = parseFloat(data['Global Quote']['05. price'])
    
    if (isNaN(price)) {
      throw new Error('Invalid price format')
    }
    
    return price
  } catch (error) {
    console.error(`Failed to fetch price for ${symbol}:`, error)
    return null
  }
}

export function getDemoPrice(symbol: string): number {
  // Fallback demo prices
  const demoPrices: Record<string, number> = {
    AAPL: 165.50,
    MSFT: 320.75,
    BTC: 65000.00
  }
  return demoPrices[symbol] ?? 100.00
}