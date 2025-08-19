export interface TradeLike {
  side: "BUY" | "SELL"
  qty: number
  price: number
  fee: number
  date: string
}

export interface CalcResult {
  realizedUSD: number
  unrealizedUSD: number
  totalUSD: number
  qtyHeld: number
}

export interface FxConversionLike {
  from: "ILS" | "USD"
  fromAmount: number
  to: "ILS" | "USD"
  toAmount: number
  rate: number
  fee?: number
  date: string
}