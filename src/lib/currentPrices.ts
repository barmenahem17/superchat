export function getCurrentPriceUSD(symbol: string): number {
  const map: Record<string, number> = { 
    AAPL: 165, 
    MSFT: 320, 
    BTC: 65000 
  }
  return map[symbol] ?? 0
}