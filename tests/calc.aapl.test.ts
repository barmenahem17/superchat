import { expect, test } from 'vitest'
import { calcPnlForInstrument } from '../src/domain/calc'
import type { TradeLike } from '../src/domain/types'

test('AAPL PnL calculation - BUY 10 @150, SELL 3 @170, current 165', () => {
  const trades: TradeLike[] = [
    {
      side: "BUY",
      qty: 10,
      price: 150,
      fee: 2,
      date: "2025-03-01"
    },
    {
      side: "SELL", 
      qty: 3,
      price: 170,
      fee: 2,
      date: "2025-03-15"
    }
  ]

  const currentPrice = 165
  const result = calcPnlForInstrument(trades, currentPrice)

  // Expected calculations:
  // Buy: 10 @ 150 (buyPrice = 150)
  // Sell: 3 @ 170
  // Realized PnL = (170 - 150) * 3 - sellFees - buyFees = 60 - 2 - 2 = 56
  // Unrealized PnL = (165 - 150) * 7 = 15 * 7 = 105
  // Total = 56 + 105 = 161
  // Qty held = 10 - 3 = 7

  expect(result.realizedUSD).toBe(56)
  expect(result.unrealizedUSD).toBe(105)
  expect(result.totalUSD).toBe(161)
  expect(result.qtyHeld).toBe(7)
})