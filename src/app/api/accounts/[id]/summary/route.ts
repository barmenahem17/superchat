import { NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { calcPnlForInstrument } from '@/domain/calc'
import { calcFxImpactIls } from '@/domain/fx'
import { getCurrentPriceUSD } from '@/lib/currentPrices'
import type { TradeLike, FxConversionLike } from '@/domain/types'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const accountId = params.id
    
    // Fetch account with all related data
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: {
        instruments: {
          include: {
            trades: true
          }
        },
        cashMoves: true,
        fxConversions: true
      }
    })

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const fxNow = parseFloat(process.env.FX_NOW || '3.70')

    // Calculate cash balances
    let cashUSD = 0
    let cashILS = 0

    // From cash moves
    for (const move of account.cashMoves) {
      const amount = parseFloat(move.amount.toString())
      if (move.type === 'DEPOSIT') {
        if (move.currency === 'USD') cashUSD += amount
        else if (move.currency === 'ILS') cashILS += amount
      } else if (move.type === 'WITHDRAWAL') {
        if (move.currency === 'USD') cashUSD -= amount
        else if (move.currency === 'ILS') cashILS -= amount
      }
    }

    // Adjust for FX conversions
    for (const fx of account.fxConversions) {
      const fromAmount = parseFloat(fx.fromAmount.toString())
      const toAmount = parseFloat(fx.toAmount.toString())
      
      if (fx.fromCurrency === 'USD') cashUSD -= fromAmount
      if (fx.toCurrency === 'USD') cashUSD += toAmount
      if (fx.fromCurrency === 'ILS') cashILS -= fromAmount
      if (fx.toCurrency === 'ILS') cashILS += toAmount
    }

    // Calculate FX impact
    const fxConversions: FxConversionLike[] = account.fxConversions.map(fx => ({
      from: fx.fromCurrency as "ILS" | "USD",
      fromAmount: parseFloat(fx.fromAmount.toString()),
      to: fx.toCurrency as "ILS" | "USD", 
      toAmount: parseFloat(fx.toAmount.toString()),
      rate: parseFloat(fx.rate.toString()),
      fee: parseFloat(fx.fee.toString()),
      date: fx.date.toISOString()
    }))
    
    const fxImpactILS = calcFxImpactIls(fxConversions, fxNow)

    // Calculate holdings
    let totalHoldingValueUSD = 0
    let totalRealizedUSD = 0
    let totalUnrealizedUSD = 0
    let totalPnlUSD = 0

    const instruments = []

    for (const instrument of account.instruments) {
      const currentPriceUSD = getCurrentPriceUSD(instrument.symbol)
      
      const trades: TradeLike[] = instrument.trades.map(trade => ({
        side: trade.side as "BUY" | "SELL",
        qty: parseFloat(trade.qty.toString()),
        price: parseFloat(trade.price.toString()),
        fee: parseFloat(trade.fee.toString()),
        date: trade.date.toISOString()
      }))

      const pnl = calcPnlForInstrument(trades, currentPriceUSD)
      const valueUSD = pnl.qtyHeld * currentPriceUSD

      totalHoldingValueUSD += valueUSD
      totalRealizedUSD += pnl.realizedUSD
      totalUnrealizedUSD += pnl.unrealizedUSD
      totalPnlUSD += pnl.totalUSD

      instruments.push({
        symbol: instrument.symbol,
        qtyHeld: pnl.qtyHeld,
        currentPriceUSD,
        realizedUSD: pnl.realizedUSD,
        unrealizedUSD: pnl.unrealizedUSD,
        totalUSD: pnl.totalUSD,
        valueUSD
      })
    }

    // Calculate totals
    const totalValueILS = cashILS + (cashUSD * fxNow) + (totalHoldingValueUSD * fxNow)
    const totalValueUSD = cashUSD + totalHoldingValueUSD

    return NextResponse.json({
      account: {
        id: account.id,
        name: account.name
      },
      fxNow,
      cash: {
        USD: cashUSD,
        ILS: cashILS
      },
      holdings: {
        valueUSD: totalHoldingValueUSD,
        realizedUSD: totalRealizedUSD,
        unrealizedUSD: totalUnrealizedUSD,
        totalUSD: totalPnlUSD
      },
      fxImpactILS,
      totals: {
        totalValueILS,
        totalValueUSD
      },
      instruments
    })
  } catch (error) {
    console.error('Failed to fetch account summary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch account summary' },
      { status: 500 }
    )
  }
}