interface Account {
  id: string
  name: string
}

async function getAccounts(): Promise<Account[]> {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'
  
  try {
    const response = await fetch(`${baseUrl}/api/accounts`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch accounts')
    }
    
    return response.json()
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return []
  }
}

export default async function AccountsPage() {
  const accounts = await getAccounts()

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">תיקי השקעות</h1>
      
      {accounts.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          לא נמצאו תיקים
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-900">
                {account.name}
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                ID: {account.id}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}