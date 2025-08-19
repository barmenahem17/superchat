import { getStockPrice, getCryptoPrice, getCoinGeckoId } from './marketData'

export async function getCurrentPriceUSD(symbol: string): Promise<{ price: number; isLive: boolean; reason?: string }> {
  // Try to get live price first
  const coinId = getCoinGeckoId(symbol)
  
  if (coinId) {
    // Crypto price
    const livePrice = await getCryptoPrice(coinId)
    if (livePrice !== null) {
      return { price: livePrice, isLive: true }
    }
  } else {
    // Stock price
    const result = await getStockPrice(symbol)
    if (result.price !== null) {
      return { price: result.price, isLive: true }
    }
  }
  
  // Fallback to demo prices
  const demoPrices: Record<string, number> = { 
    AAPL: 165, 
    MSFT: 320, 
    BTC: 65000 
  }
  
  return { 
    price: demoPrices[symbol] ?? 100, 
    isLive: false,
    reason: 'Using demo price - API unavailable'
  }
}