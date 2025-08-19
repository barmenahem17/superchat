import Link from 'next/link'
import { formatIls, formatUsd } from '@/lib/format'
import { RefreshButton } from './refresh-button'

interface AccountSummary {
  account: { id: string; name: string }
  fxNow: number
  cash: { USD: number; ILS: number }
  holdings: {
    valueUSD: number
    realizedUSD: number
    unrealizedUSD: number
    totalUSD: number
  }
  fxImpactILS: number
  totals: {
    totalValueILS: number
    totalValueUSD: number
  }
  instruments: Array<{
    symbol: string
    qtyHeld: number
    currentPriceUSD: number
    realizedUSD: number
    unrealizedUSD: number
    totalUSD: number
    valueUSD: number
  }>
}

async function getAccountSummary(id: string): Promise<AccountSummary | null> {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'
  
  try {
    const response = await fetch(`${baseUrl}/api/accounts/${id}/summary`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return null
    }
    
    return response.json()
  } catch (error) {
    console.error('Error fetching account summary:', error)
    return null
  }
}

async function getLastPriceUpdate(accountId: string): Promise<string | null> {
  const { PrismaClient } = await import('@/generated/prisma')
  const prisma = new PrismaClient()
  
  try {
    const latestSnapshot = await prisma.priceSnapshot.findFirst({
      where: { accountId },
      orderBy: { createdAt: 'desc' }
    })
    
    if (!latestSnapshot) {
      return null
    }
    
    return latestSnapshot.createdAt.toLocaleString('he-IL', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Error fetching last price update:', error)
    return null
  } finally {
    await prisma.$disconnect()
  }
}

async function getPriceSnapshots(accountId: string): Promise<Record<string, { price: number; source: string }>> {
  const { PrismaClient } = await import('@/generated/prisma')
  const prisma = new PrismaClient()
  
  try {
    const snapshots = await prisma.priceSnapshot.findMany({
      where: { accountId },
      orderBy: { createdAt: 'desc' },
      distinct: ['symbol'],
      take: 10
    })
    
    const result: Record<string, { price: number; source: string }> = {}
    
    for (const snapshot of snapshots) {
      result[snapshot.symbol] = {
        price: parseFloat(snapshot.priceUsd.toString()),
        source: snapshot.source
      }
    }
    
    return result
  } catch (error) {
    console.error('Error fetching price snapshots:', error)
    return {}
  } finally {
    await prisma.$disconnect()
  }
}



export default async function AccountDetailPage({ params }: { params: { id: string } }) {
  const [summary, lastUpdate, priceSnapshots] = await Promise.all([
    getAccountSummary(params.id),
    getLastPriceUpdate(params.id),
    getPriceSnapshots(params.id)
  ])

  if (!summary) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">חשבון לא נמצא</h1>
          <Link href="/accounts" className="text-blue-600 hover:underline">
            חזרה לרשימת חשבונות
          </Link>
        </div>
      </div>
    )
  }

  const totalCashILS = summary.cash.ILS + (summary.cash.USD * summary.fxNow)

  return (
    <div className="container mx-auto py-8 px-4" dir="rtl">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Link href="/accounts" className="text-blue-600 hover:underline mb-4 inline-block">
              ← חזרה לרשימת חשבונות
            </Link>
            <h1 className="text-4xl font-bold mb-2">{summary.account.name}</h1>
            <p className="text-sm text-gray-500">
              עודכן לאחרונה: {lastUpdate || '—'}
            </p>
          </div>
          <RefreshButton accountId={params.id} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Total Value */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm min-h-[120px] flex flex-col">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">שווי כולל</h2>
          <p className="text-3xl font-bold text-green-600 mt-auto">
            {formatIls(summary.totals.totalValueILS)}
          </p>
        </div>

        {/* Cash */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm min-h-[120px] flex flex-col">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">מזומן</h2>
          <div className="mt-auto">
            <p className="text-sm text-gray-600 mb-1">
              {formatIls(summary.cash.ILS)} + {formatUsd(summary.cash.USD)}
            </p>
            <p className="text-xl font-bold">
              סה״כ {formatIls(totalCashILS)}
            </p>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm min-h-[120px] flex flex-col">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">ביצועים</h2>
          <div className="mt-auto">
            <p className="text-xl font-bold mb-2">
              {formatIls(summary.holdings.totalUSD * summary.fxNow)}
            </p>
            <details className="text-sm">
              <summary className="cursor-pointer text-blue-600 hover:underline">
                עוד פירוט
              </summary>
              <div className="mt-2 space-y-1">
                <p>ממומש: {formatIls(summary.holdings.realizedUSD * summary.fxNow)}</p>
                <p>לא ממומש: {formatIls(summary.holdings.unrealizedUSD * summary.fxNow)}</p>
              </div>
            </details>
          </div>
        </div>

        {/* FX Impact */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm min-h-[120px] flex flex-col">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">רווח מהמרות</h2>
          <p className={`text-xl font-bold mt-auto ${summary.fxImpactILS >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatIls(summary.fxImpactILS)}
          </p>
        </div>
      </div>

      {/* Instruments Table */}
      {summary.instruments.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">ניירות ערך</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    סימול
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    כמות
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    מחיר נוכחי
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    שווי
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    רווח
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {summary.instruments.map((instrument) => {
                  const snapshot = priceSnapshots[instrument.symbol]
                  return (
                    <tr key={instrument.symbol}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div>
                          <div>{instrument.symbol}</div>
                          {snapshot && (
                            <div className="text-xs text-gray-400 mt-1">
                              מחיר אחרון: {formatUsd(snapshot.price)} (מקור: {snapshot.source === 'alpha' ? 'אלפא' : 'דמו'})
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {instrument.qtyHeld.toFixed(6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatUsd(instrument.currentPriceUSD)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatUsd(instrument.valueUSD)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        instrument.totalUSD >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatUsd(instrument.totalUSD)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}