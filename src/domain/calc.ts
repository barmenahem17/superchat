import type { TradeLike, CalcResult } from './types'

export function calcPnlForInstrument(trades: TradeLike[], currentPriceUSD: number): CalcResult {
  if (trades.length === 0) {
    return {
      realizedUSD: 0,
      unrealizedUSD: 0,
      totalUSD: 0,
      qtyHeld: 0
    }
  }

  // Separate buys and sells
  const buys = trades.filter(t => t.side === "BUY")
  const sells = trades.filter(t => t.side === "SELL")

  // Calculate quantities
  const totalBought = buys.reduce((sum, trade) => sum + trade.qty, 0)
  const totalSold = sells.reduce((sum, trade) => sum + trade.qty, 0)
  const qtyHeld = totalBought - totalSold

  // For v1: assume single buy price (first buy or average if multiple)
  let buyPrice = 0
  if (buys.length > 0) {
    // Use weighted average buy price
    const totalBuyValue = buys.reduce((sum, trade) => sum + (trade.qty * trade.price), 0)
    buyPrice = totalBuyValue / totalBought
  }

  // Calculate realized PnL
  let realizedUSD = 0
  if (sells.length > 0) {
    // Sum of sell proceeds minus buy cost for sold quantity
    const sellProceeds = sells.reduce((sum, trade) => sum + (trade.qty * trade.price), 0)
    const soldQtyCost = totalSold * buyPrice
    
    // Fees: all sell fees + buy fees (only once if there are sells)
    const sellFees = sells.reduce((sum, trade) => sum + trade.fee, 0)
    const buyFees = buys.reduce((sum, trade) => sum + trade.fee, 0)
    
    realizedUSD = sellProceeds - soldQtyCost - sellFees - buyFees
  }

  // Calculate unrealized PnL
  const unrealizedUSD = qtyHeld > 0 ? (currentPriceUSD - buyPrice) * qtyHeld : 0

  // Total PnL
  const totalUSD = realizedUSD + unrealizedUSD

  return {
    realizedUSD,
    unrealizedUSD,
    totalUSD,
    qtyHeld
  }
}