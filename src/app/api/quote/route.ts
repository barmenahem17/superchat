import { NextResponse } from 'next/server'
import { getQuote, getUsdIls } from '@/lib/prices'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    const fx = searchParams.get('fx')

    if (symbol) {
      // Stock quote request
      try {
        const quote = await getQuote(symbol)
        return NextResponse.json({
          symbol: symbol.toUpperCase(),
          price: quote.price,
          prevClose: quote.prevClose,
          currency: quote.currency,
          asOf: quote.asOf
        })
      } catch (error) {
        console.error(`Quote API error for ${symbol}:`, error)
        return NextResponse.json(
          { error: `Failed to fetch quote for ${symbol}`, details: (error as Error).message },
          { status: 500 }
        )
      }
    }

    if (fx === 'USDILS') {
      // FX rate request
      try {
        const rate = await getUsdIls()
        return NextResponse.json({
          fx: 'USDILS',
          rate
        })
      } catch (error) {
        console.error('FX API error:', error)
        return NextResponse.json(
          { error: 'Failed to fetch USD/ILS rate', details: (error as Error).message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Please provide ?symbol=AAPL or ?fx=USDILS' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Quote API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
