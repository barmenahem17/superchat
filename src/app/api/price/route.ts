import { NextResponse } from 'next/server'
import { getStockPrice, getCryptoPrice, getUsdIlsRate, getCoinGeckoId } from '@/lib/marketData'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    const coin = searchParams.get('coin')
    const fx = searchParams.get('fx')

    if (symbol) {
      // Stock price
      const result = await getStockPrice(symbol)
      return NextResponse.json({
        ok: result.price !== null,
        kind: 'stock',
        value: result.price,
        reason: result.reason,
        symbol
      })
    }

    if (coin) {
      // Crypto price
      const coinId = getCoinGeckoId(coin) || coin as 'bitcoin' | 'ethereum' | 'ripple' | 'solana'
      const price = await getCryptoPrice(coinId)
      return NextResponse.json({
        ok: price !== null,
        kind: 'crypto',
        value: price,
        coin: coinId
      })
    }

    if (fx === 'USDILS') {
      // FX rate
      const rate = await getUsdIlsRate()
      return NextResponse.json({
        ok: rate !== null,
        kind: 'fx',
        value: rate,
        pair: 'USD/ILS'
      })
    }

    return NextResponse.json(
      { error: 'Please provide ?symbol=MSFT or ?coin=bitcoin or ?fx=USDILS' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Price API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch price data' },
      { status: 500 }
    )
  }
}