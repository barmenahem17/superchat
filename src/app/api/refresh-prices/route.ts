import { NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { getQuote } from '@/lib/prices'
import { getCryptoPrice, getCoinGeckoId } from '@/lib/marketData'
import { Decimal } from '@prisma/client/runtime/library'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { accountId } = await request.json()
    
    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 })
    }

    // Get unique symbols from account's instruments
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: {
        instruments: {
          select: { symbol: true }
        }
      }
    })

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const symbols = [...new Set(account.instruments.map(i => i.symbol))]
    
    // If no symbols, default to MSFT
    if (symbols.length === 0) {
      symbols.push('MSFT')
    }

    const results = []

    for (const symbol of symbols) {
      let price: number
      let source: string

      console.log(`🔄 [Refresh] Processing ${symbol}...`)

      // Check if it's crypto
      const coinId = getCoinGeckoId(symbol)
      
      if (coinId) {
        // Crypto price via CoinGecko
        try {
          const cryptoPrice = await getCryptoPrice(coinId)
          if (cryptoPrice !== null) {
            price = cryptoPrice
            source = 'coingecko'
            console.log(`✅ [Refresh] Got crypto price for ${symbol}: $${price}`)
          } else {
            throw new Error('CoinGecko returned null')
          }
        } catch (error) {
          console.log(`❌ [Refresh] Crypto price failed for ${symbol}, using demo`)
          price = symbol === 'BTC' ? 65000 : 100
          source = 'demo'
        }
      } else {
        // Stock price via TwelveData
        try {
          const quote = await getQuote(symbol)
          price = quote.price
          source = 'twelve'
          console.log(`✅ [Refresh] Got stock price for ${symbol}: $${price}`)
        } catch (error) {
          console.log(`❌ [Refresh] TwelveData failed for ${symbol}, using demo:`, (error as Error).message)
          // Demo prices
          const demoPrices: Record<string, number> = { 
            AAPL: 165, 
            MSFT: 320, 
            BTC: 65000 
          }
          price = demoPrices[symbol] ?? 100
          source = 'demo'
        }
      }

      // Store price snapshot
      const snapshot = await prisma.priceSnapshot.create({
        data: {
          accountId,
          symbol,
          priceUsd: new Decimal(price),
          source
        }
      })

      results.push({
        symbol,
        price,
        source,
        timestamp: snapshot.createdAt
      })
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Updated ${results.length} price(s)`
    })

  } catch (error) {
    console.error('Failed to refresh prices:', error)
    return NextResponse.json(
      { error: 'Failed to refresh prices' },
      { status: 500 }
    )
  }
}