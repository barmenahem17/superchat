import Link from 'next/link'

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

function formatCurrency(amount: number, currency: string = '₪', decimals: number = 2): string {
  return `${currency}${amount.toLocaleString('he-IL', { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  })}`
}

export default async function AccountDetailPage({ params }: { params: { id: string } }) {
  const summary = await getAccountSummary(params.id)

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
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/accounts" className="text-blue-600 hover:underline mb-4 inline-block">
          ← חזרה לרשימת חשבונות
        </Link>
        <h1 className="text-3xl font-bold">{summary.account.name}</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Total Value */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">שווי כולל</h2>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(summary.totals.totalValueILS)}
          </p>
        </div>

        {/* Cash */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">מזומן</h2>
          <p className="text-sm text-gray-600">
            {formatCurrency(summary.cash.ILS)} + ${summary.cash.USD.toFixed(2)}
          </p>
          <p className="text-lg font-bold">
            סה״כ {formatCurrency(totalCashILS)}
          </p>
        </div>

        {/* Performance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">ביצועים</h2>
          <p className="text-lg font-bold mb-2">
            {formatCurrency(summary.holdings.totalUSD * summary.fxNow)}
          </p>
          <details className="text-sm">
            <summary className="cursor-pointer text-blue-600 hover:underline">
              עוד פירוט
            </summary>
            <div className="mt-2 space-y-1">
              <p>ממומש: {formatCurrency(summary.holdings.realizedUSD * summary.fxNow)}</p>
              <p>לא ממומש: {formatCurrency(summary.holdings.unrealizedUSD * summary.fxNow)}</p>
            </div>
          </details>
        </div>

        {/* FX Impact */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">רווח מהמרות</h2>
          <p className={`text-lg font-bold ${summary.fxImpactILS >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(summary.fxImpactILS)}
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
                {summary.instruments.map((instrument) => (
                  <tr key={instrument.symbol}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {instrument.symbol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {instrument.qtyHeld.toFixed(6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${instrument.currentPriceUSD.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${instrument.valueUSD.toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      instrument.totalUSD >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${instrument.totalUSD.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}