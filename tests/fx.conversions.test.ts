import { expect, test } from 'vitest'
import { calcFxImpactIls } from '../src/domain/fx'
import type { FxConversionLike } from '../src/domain/types'

test('FX conversions impact - ILS->USD conversions with rate changes', () => {
  const conversions: FxConversionLike[] = [
    {
      from: "ILS",
      fromAmount: 7000,
      to: "USD", 
      toAmount: 2000,
      rate: 3.50,
      fee: 0,
      date: "2025-03-03"
    },
    {
      from: "ILS",
      fromAmount: 3750,
      to: "USD",
      toAmount: 1000, 
      rate: 3.75,
      fee: 0,
      date: "2025-03-05"
    }
  ]

  const fxNow = 3.70
  const impact = calcFxImpactIls(conversions, fxNow)

  // Expected calculations:
  // Conversion 1: ILS->USD 7000->2000@3.50, now @3.70
  //   Current value: 2000 * 3.70 = 7400 ILS
  //   Impact: 7400 - 7000 - 0 = 400 ILS
  // 
  // Conversion 2: ILS->USD 3750->1000@3.75, now @3.70  
  //   Current value: 1000 * 3.70 = 3700 ILS
  //   Impact: 3700 - 3750 - 0 = -50 ILS
  //
  // Total impact: 400 + (-50) = 350 ILS

  expect(impact).toBe(350)
})