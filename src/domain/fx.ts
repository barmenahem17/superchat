import type { FxConversionLike } from './types'

export function calcFxImpactIls(conversions: FxConversionLike[], fxNow: number): number {
  let totalImpact = 0

  for (const conversion of conversions) {
    const fee = conversion.fee || 0

    if (conversion.from === "ILS" && conversion.to === "USD") {
      // ILS->USD: impact = (toAmount * fxNow) - fromAmount - fee
      // We got USD, now it's worth more/less in ILS terms
      const currentValueInIls = conversion.toAmount * fxNow
      const impact = currentValueInIls - conversion.fromAmount - fee
      totalImpact += impact
    } else if (conversion.from === "USD" && conversion.to === "ILS") {
      // USD->ILS: impact = toAmount - (fromAmount * fxNow) - fee
      // We spent USD that would now be worth different amount in ILS
      const currentCostInIls = conversion.fromAmount * fxNow
      const impact = conversion.toAmount - currentCostInIls - fee
      totalImpact += impact
    }
  }

  return totalImpact
}