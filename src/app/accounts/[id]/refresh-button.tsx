'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface RefreshButtonProps {
  accountId: string
}

export function RefreshButton({ accountId }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    
    try {
      const response = await fetch('/api/refresh-prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountId }),
      })

      if (response.ok) {
        // Refresh the page data
        router.refresh()
      } else {
        console.error('Failed to refresh prices')
      }
    } catch (error) {
      console.error('Error refreshing prices:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isRefreshing ? 'מעדכן...' : 'עדכן נתונים'}
    </button>
  )
}