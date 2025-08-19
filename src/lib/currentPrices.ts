import { getQuote } from './prices'
import { getCryptoPrice, getCoinGeckoId } from './marketData'

export async function getCurrentPriceUSD(symbol: string): Promise<{ price: number; isLive: boolean; reason?: string }> {
  console.log(`🔍 [Price Service] Fetching price for symbol: ${symbol}`)
  
  // Check if it's a crypto symbol first
  const coinId = getCoinGeckoId(symbol)
  
  if (coinId) {
    // Crypto price - still use CoinGecko for crypto
    console.log(`📈 [Price Service] ${symbol} identified as crypto (${coinId}), fetching from CoinGecko...`)
    try {
      const livePrice = await getCryptoPrice(coinId)
      if (livePrice !== null) {
        console.log(`✅ [Price Service] Live crypto price for ${symbol}: $${livePrice}`)
        return { price: livePrice, isLive: true }
      }
    } catch (error) {
      console.log(`❌ [Price Service] Failed to get crypto price for ${symbol}:`, error)
    }
  } else {
    // Stock price - use TwelveData
    console.log(`📊 [Price Service] ${symbol} identified as stock, fetching from TwelveData...`)
    try {
      const quote = await getQuote(symbol)
      console.log(`✅ [Price Service] Live stock price for ${symbol}: $${quote.price}`)
      return { price: quote.price, isLive: true }
    } catch (error) {
      console.log(`❌ [Price Service] Failed to get stock price for ${symbol}:`, (error as Error).message)
    }
  }
  
  // Fallback to demo prices
  const demoPrices: Record<string, number> = { 
    AAPL: 165, 
    MSFT: 320, 
    BTC: 65000 
  }
  
  const demoPrice = demoPrices[symbol] ?? 100
  console.log(`⚠️  [Price Service] Using DEMO price for ${symbol}: $${demoPrice}`)
  
  return { 
    price: demoPrice, 
    isLive: false,
    reason: 'Using demo price - API unavailable'
  }
}
