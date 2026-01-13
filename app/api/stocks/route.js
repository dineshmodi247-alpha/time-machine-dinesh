import { NextResponse } from 'next/server'

// This is a placeholder API route for future real stock data integration
// You can integrate with APIs like:
// - Yahoo Finance API
// - Alpha Vantage
// - IEX Cloud
// - Finnhub

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const ticker = searchParams.get('ticker')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  // For now, return simulated data
  // In production, this would fetch real historical data
  return NextResponse.json({
    ticker,
    data: generateSimulatedData(ticker, startDate, endDate),
    message: 'Using simulated data. Integrate with real API for production.'
  })
}

function generateSimulatedData(ticker, startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const months = Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 30))
  
  const data = []
  let price = 100 + Math.random() * 100
  
  const growthRates = {
    'NVDA': 0.035,
    'AAPL': 0.018,
    'MSFT': 0.020,
    'GOOGL': 0.015,
    'TSLA': 0.025,
    'SPY': 0.012,
    'AMD': 0.022,
    'QQQ': 0.015,
  }
  
  const monthlyGrowth = growthRates[ticker] || 0.015
  const volatility = 0.08
  
  for (let i = 0; i <= months; i++) {
    const date = new Date(start)
    date.setMonth(date.getMonth() + i)
    
    const trend = price * monthlyGrowth
    const randomWalk = price * volatility * (Math.random() - 0.5)
    price = Math.max(10, price + trend + randomWalk)
    
    if (Math.random() < 0.05) {
      price *= 0.92
    }
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: price,
      volume: Math.floor(Math.random() * 10000000) + 1000000
    })
  }
  
  return data
}
