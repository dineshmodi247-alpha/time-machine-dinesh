export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const ticker = searchParams.get('ticker')
  const period1 = searchParams.get('period1')
  const period2 = searchParams.get('period2')
  
  if (!ticker || !period1 || !period2) {
    return Response.json({ error: 'Missing parameters' }, { status: 400 })
  }
  
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${period1}&period2=${period2}&interval=1wk`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      }
    )
    
    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    return Response.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
