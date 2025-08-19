import { NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { fetchAlphaVantageGlobalQuote, getDemoPrice } from '@/lib/prices'
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

      // Try to fetch from Alpha Vantage
      const alphaPrice = await fetchAlphaVantageGlobalQuote(symbol)
      
      if (alphaPrice !== null) {
        price = alphaPrice
        source = 'alpha'
      } else {
        price = getDemoPrice(symbol)
        source = 'demo'
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