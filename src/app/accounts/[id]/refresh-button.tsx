'use client'

import { useState } from 'react'

export function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // TODO: Implement actual refresh logic
    console.log('Refreshing data...')
    setTimeout(() => setIsRefreshing(false), 1000) // Simulate loading
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