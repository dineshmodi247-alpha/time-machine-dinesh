'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// S&P 500 and NASDAQ-100 stocks (major ones)
const STOCK_LIST = [
  // Mag 7
  { ticker: 'AAPL', name: 'Apple Inc.' },
  { ticker: 'MSFT', name: 'Microsoft Corporation' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation' },
  { ticker: 'TSLA', name: 'Tesla, Inc.' },
  { ticker: 'META', name: 'Meta Platforms Inc.' },
  // Other Tech
  { ticker: 'NFLX', name: 'Netflix Inc.' },
  { ticker: 'AMD', name: 'Advanced Micro Devices' },
  { ticker: 'INTC', name: 'Intel Corporation' },
  { ticker: 'CSCO', name: 'Cisco Systems' },
  { ticker: 'ORCL', name: 'Oracle Corporation' },
  { ticker: 'CRM', name: 'Salesforce' },
  { ticker: 'ADBE', name: 'Adobe Inc.' },
  { ticker: 'AVGO', name: 'Broadcom Inc.' },
  { ticker: 'QCOM', name: 'Qualcomm' },
  { ticker: 'TXN', name: 'Texas Instruments' },
  // Finance
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.' },
  { ticker: 'BAC', name: 'Bank of America' },
  { ticker: 'WFC', name: 'Wells Fargo' },
  { ticker: 'GS', name: 'Goldman Sachs' },
  { ticker: 'MS', name: 'Morgan Stanley' },
  { ticker: 'V', name: 'Visa Inc.' },
  { ticker: 'MA', name: 'Mastercard' },
  { ticker: 'AXP', name: 'American Express' },
  // Consumer
  { ticker: 'WMT', name: 'Walmart Inc.' },
  { ticker: 'HD', name: 'Home Depot' },
  { ticker: 'MCD', name: 'McDonald\'s' },
  { ticker: 'NKE', name: 'Nike' },
  { ticker: 'SBUX', name: 'Starbucks' },
  { ticker: 'DIS', name: 'The Walt Disney Company' },
  { ticker: 'CMCSA', name: 'Comcast' },
  { ticker: 'PEP', name: 'PepsiCo' },
  { ticker: 'KO', name: 'Coca-Cola' },
  { ticker: 'PG', name: 'Procter & Gamble' },
  // Healthcare
  { ticker: 'JNJ', name: 'Johnson & Johnson' },
  { ticker: 'UNH', name: 'UnitedHealth Group' },
  { ticker: 'PFE', name: 'Pfizer' },
  { ticker: 'ABBV', name: 'AbbVie' },
  { ticker: 'TMO', name: 'Thermo Fisher Scientific' },
  { ticker: 'LLY', name: 'Eli Lilly' },
  // ETFs
  { ticker: 'SPY', name: 'S&P 500 ETF' },
  { ticker: 'QQQ', name: 'NASDAQ-100 ETF' },
  { ticker: 'VOO', name: 'Vanguard S&P 500 ETF' },
  { ticker: 'VTI', name: 'Vanguard Total Stock Market ETF' },
  { ticker: 'IWM', name: 'Russell 2000 ETF' },
].sort((a, b) => a.ticker.localeCompare(b.ticker))

export default function Home() {
  const [stocks, setStocks] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredStocks, setFilteredStocks] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [startMonth, setStartMonth] = useState('2020-01')
  const [endMonth, setEndMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [strategy, setStrategy] = useState('dca')
  const [investmentAmount, setInvestmentAmount] = useState(100)
  const [isGenerating, setIsGenerating] = useState(false)
  const [simulationData, setSimulationData] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [logoImage, setLogoImage] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const canvasRef = useRef(null)
  const searchRef = useRef(null)

  // Load Public.com logo
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => setLogoImage(img)
    img.onerror = () => console.log('Logo failed to load')
    img.src = 'https://millennialmoney.com/wp-content/uploads/2021/06/public-logo.png'
  }, [])

  // Stock presets - Mag 7 + ETFs
  const presets = [
    { label: 'Apple', ticker: 'AAPL' },
    { label: 'Microsoft', ticker: 'MSFT' },
    { label: 'Google', ticker: 'GOOGL' },
    { label: 'Amazon', ticker: 'AMZN' },
    { label: 'NVIDIA', ticker: 'NVDA' },
    { label: 'Tesla', ticker: 'TSLA' },
    { label: 'Meta', ticker: 'META' },
    { label: 'S&P 500', ticker: 'SPY' },
    { label: 'NASDAQ-100', ticker: 'QQQ' },
  ]

  // Filter stocks
  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = STOCK_LIST.filter(stock => 
        stock.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 10)
      setFilteredStocks(filtered)
      setShowDropdown(filtered.length > 0)
    } else {
      setShowDropdown(false)
    }
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const addStock = (ticker) => {
    if (stocks.length < 3 && !stocks.includes(ticker)) {
      setStocks([...stocks, ticker])
    }
    setSearchQuery('')
    setShowDropdown(false)
  }

  const removeStock = (ticker) => {
    setStocks(stocks.filter(s => s !== ticker))
  }

  const handlePresetClick = (preset) => {
    addStock(preset.ticker)
  }

  // Fetch real stock data from Yahoo Finance
  const fetchStockData = async (ticker, startMonth, endMonth) => {
    const start = new Date(startMonth + '-01T00:00:00')
    const end = new Date(endMonth + '-01T00:00:00')
    end.setMonth(end.getMonth() + 1)
    end.setDate(0)
    
    const period1 = Math.floor(start.getTime() / 1000)
    const period2 = Math.floor(end.getTime() / 1000)
    
    try {
      // Using corsproxy.io to handle CORS
      const response = await fetch(
        `https://corsproxy.io/?${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${period1}&period2=${period2}&interval=1wk`)}`
      )
      const data = await response.json()
      
      if (data.chart?.error || !data.chart?.result) {
        throw new Error('Invalid response')
      }
      
      const quotes = data.chart.result[0]
      const timestamps = quotes.timestamp
      const prices = quotes.indicators.quote[0].close
      
      const stockData = []
      for (let i = 0; i < timestamps.length; i++) {
        if (prices[i] !== null) {
          const date = new Date(timestamps[i] * 1000)
          stockData.push({
            date: date.toISOString().split('T')[0],
            price: prices[i],
            week: i,
            monthIndex: Math.floor(i / 4.33),
          })
        }
      }
      
      // Calculate months
      const yearDiff = end.getFullYear() - start.getFullYear()
      const monthDiff = end.getMonth() - start.getMonth()
      const totalMonths = yearDiff * 12 + monthDiff + 1
      
      console.log(`✓ Fetched real data for ${ticker}: ${stockData.length} weeks`)
      return { data: stockData, totalMonths }
    } catch (error) {
      console.error(`Failed to fetch ${ticker}, using fallback:`, error)
      return generateFallbackData(ticker, startMonth, endMonth)
    }
  }
  
  // Fallback if Yahoo Finance fails
  const generateFallbackData = (ticker, startMonth, endMonth) => {
    const start = new Date(startMonth + '-01T00:00:00')
    const end = new Date(endMonth + '-01T00:00:00')
    end.setMonth(end.getMonth() + 1)
    end.setDate(0)
    
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
    const totalWeeks = Math.ceil(totalDays / 7)
    
    const yearDiff = end.getFullYear() - start.getFullYear()
    const monthDiff = end.getMonth() - start.getMonth()
    const totalMonths = yearDiff * 12 + monthDiff + 1
    
    const data = []
    let currentPrice = 100 + Math.random() * 100
    
    const growthRates = {
      'NVDA': 0.035, 'AAPL': 0.018, 'MSFT': 0.020, 'GOOGL': 0.015,
      'TSLA': 0.025, 'SPY': 0.012, 'AMD': 0.022, 'QQQ': 0.015,
      'AMZN': 0.022, 'META': 0.024, 'NFLX': 0.020,
    }
    
    const weeklyGrowth = (growthRates[ticker] || 0.015) / 4.33
    const volatility = 0.03
    
    for (let i = 0; i < totalWeeks; i++) {
      const date = new Date(start)
      date.setDate(start.getDate() + (i * 7))
      
      const trend = currentPrice * weeklyGrowth
      const randomWalk = currentPrice * volatility * (Math.random() - 0.5)
      currentPrice = Math.max(10, currentPrice + trend + randomWalk)
      
      if (Math.random() < 0.02) currentPrice *= 0.98
      
      data.push({
        date: date.toISOString().split('T')[0],
        price: currentPrice,
        week: i,
        monthIndex: Math.min(Math.floor(i / 4.33), totalMonths - 1),
      })
    }
    
    return { data, totalMonths }
  }

  // Generate stock data with WEEKLY datapoints
  const generateStockData = (ticker, startMonth, endMonth) => {
    const start = new Date(startMonth + '-01T00:00:00')
    const end = new Date(endMonth + '-01T00:00:00')
    end.setMonth(end.getMonth() + 1)
    end.setDate(0) // Last day of end month
    
    // Calculate weeks
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
    const totalWeeks = Math.ceil(totalDays / 7)
    
    // Calculate months for investment
    const yearDiff = end.getFullYear() - start.getFullYear()
    const monthDiff = end.getMonth() - start.getMonth()
    const totalMonths = yearDiff * 12 + monthDiff + 1
    
    console.log(`${ticker}: ${totalWeeks} weeks, ${totalMonths} months`)
    
    const data = []
    let currentPrice = 100 + Math.random() * 100
    
    const growthRates = {
      'NVDA': 0.035, 'AAPL': 0.018, 'MSFT': 0.020, 'GOOGL': 0.015,
      'TSLA': 0.025, 'SPY': 0.012, 'AMD': 0.022, 'QQQ': 0.015,
      'AMZN': 0.022, 'META': 0.024, 'NFLX': 0.020,
    }
    
    const weeklyGrowth = (growthRates[ticker] || 0.015) / 4.33
    const volatility = 0.03
    
    // Create weekly datapoints
    for (let i = 0; i < totalWeeks; i++) {
      const date = new Date(start)
      date.setDate(start.getDate() + (i * 7))
      
      const trend = currentPrice * weeklyGrowth
      const randomWalk = currentPrice * volatility * (Math.random() - 0.5)
      currentPrice = Math.max(10, currentPrice + trend + randomWalk)
      
      if (Math.random() < 0.02) currentPrice *= 0.98
      
      const weeksSinceStart = i
      const monthIndex = Math.floor(weeksSinceStart / 4.33)
      
      data.push({
        date: date.toISOString().split('T')[0],
        price: currentPrice,
        week: i,
        monthIndex: Math.min(monthIndex, totalMonths - 1),
      })
    }
    
    return { data, totalMonths }
  }

  const calculateInvestment = (stockData, totalMonths, strategy, investmentAmount) => {
    let totalInvested = 0
    let shares = 0
    
    if (strategy === 'lump') {
      totalInvested = investmentAmount
      shares = totalInvested / stockData[0].price
    } else {
      totalInvested = investmentAmount * totalMonths
      // DCA: invest once per month (~4.33 weeks)
      for (let i = 0; i < stockData.length; i++) {
        if (Math.floor(i / 4.33) < totalMonths && i % Math.round(4.33) === 0) {
          shares += investmentAmount / stockData[i].price
        }
      }
    }
    
    const finalValue = shares * stockData[stockData.length - 1].price
    const totalReturn = ((finalValue - totalInvested) / totalInvested) * 100
    const years = totalMonths / 12
    const cagr = years > 0 ? (Math.pow(finalValue / totalInvested, 1 / years) - 1) * 100 : 0
    
    let maxDrawdown = 0
    let peak = 0
    stockData.forEach((point, i) => {
      let sharesAtPoint = 0
      
      if (strategy === 'lump') {
        sharesAtPoint = totalInvested / stockData[0].price
      } else {
        for (let j = 0; j <= i; j++) {
          if (Math.floor(j / 4.33) < totalMonths && j % Math.round(4.33) === 0) {
            sharesAtPoint += investmentAmount / stockData[j].price
          }
        }
      }
      
      const value = sharesAtPoint * point.price
      peak = Math.max(peak, value)
      const drawdown = peak > 0 ? ((peak - value) / peak) * 100 : 0
      maxDrawdown = Math.max(maxDrawdown, drawdown)
    })
    
    return { totalInvested, finalValue, totalReturn, cagr, shares, years, maxDrawdown }
  }

  const generateSimulation = async () => {
    if (stocks.length === 0) return
    
    setIsGenerating(true)
    
    try {
      const simulations = await Promise.all(
        stocks.map(async (ticker) => {
          const { data: stockData, totalMonths } = await fetchStockData(ticker, startMonth, endMonth)
          const results = calculateInvestment(stockData, totalMonths, strategy, investmentAmount)
          return { ticker, data: stockData, totalMonths, results }
        })
      )
      
      setSimulationData(simulations)
      setIsGenerating(false)
      setCurrentFrame(0)
      setTimeout(() => setIsPlaying(true), 500)
    } catch (error) {
      console.error('Simulation failed:', error)
      setIsGenerating(false)
    }
  }

  // Animation with speed control
  useEffect(() => {
    if (!isPlaying || !simulationData || isRecording) return
    
    const maxFrames = simulationData[0]?.data.length || 0
    if (currentFrame >= maxFrames - 1) {
      setIsPlaying(false)
      return
    }
    
    const baseSpeed = 50 // 50ms base
    const interval = setInterval(() => {
      setCurrentFrame(prev => Math.min(prev + 1, maxFrames - 1))
    }, baseSpeed / playbackSpeed)
    
    return () => clearInterval(interval)
  }, [isPlaying, currentFrame, simulationData, isRecording, playbackSpeed])

  const getValueAtFrame = (sim, frameIndex) => {
    let shares = 0
    const currentWeek = sim.data[frameIndex]
    const monthsInvested = currentWeek.monthIndex + 1
    
    let invested = 0
    if (strategy === 'lump') {
      invested = investmentAmount
      shares = invested / sim.data[0].price
    } else {
      invested = investmentAmount * Math.min(monthsInvested, sim.totalMonths)
      for (let j = 0; j <= frameIndex; j++) {
        if (Math.floor(j / 4.33) < sim.totalMonths && j % Math.round(4.33) === 0) {
          shares += investmentAmount / sim.data[j].price
        }
      }
    }
    
    return {
      value: shares * currentWeek.price,
      invested: invested,
      shares: shares
    }
  }

  // Draw chart
  useEffect(() => {
    if (!simulationData || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, '#F0FDF4')
    gradient.addColorStop(0.5, '#FFFFFF')
    gradient.addColorStop(1, '#F9FAFB')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
    
    const padding = { top: 100, right: 110, bottom: 100, left: 110 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom
    
    let maxValue = 0
    let minValue = Infinity
    let maxInvested = 0
    
    if (currentFrame > 0) {
      simulationData.forEach(sim => {
        const result = getValueAtFrame(sim, currentFrame)
        maxValue = Math.max(maxValue, result.value)
        minValue = Math.min(minValue, result.invested)
        maxInvested = Math.max(maxInvested, result.invested)
      })
    } else {
      // Set initial investment as minimum
      minValue = strategy === 'lump' ? investmentAmount : investmentAmount
    }
    
    maxValue = Math.max(maxValue, maxInvested) * 1.15
    minValue = minValue * 0.95 // Add 5% padding below
    const valueRange = maxValue - minValue
    
    // Grid with alternating backgrounds
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i
      
      // Alternating row backgrounds for better readability
      if (i < 5) {
        ctx.fillStyle = i % 2 === 0 ? 'rgba(249, 250, 251, 0.5)' : 'rgba(255, 255, 255, 0.3)'
        ctx.fillRect(padding.left, y, chartWidth, chartHeight / 5)
      }
      
      // Grid line
      ctx.strokeStyle = '#E5E7EB'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()
    }
    
    // Y-axis labels - EVEN LARGER & BOLDER
    ctx.fillStyle = '#1F2937'
    ctx.font = 'bold 22px -apple-system, sans-serif'
    ctx.textAlign = 'right'
    for (let i = 0; i <= 5; i++) {
      const value = minValue + (valueRange / 5) * (5 - i)
      const y = padding.top + (chartHeight / 5) * i
      ctx.fillText(`$${(value / 1000).toFixed(1)}K`, padding.left - 25, y + 8)
    }
    
    // X-axis labels - EVEN LARGER & BOLDER
    ctx.fillStyle = '#1F2937'
    ctx.font = 'bold 22px -apple-system, sans-serif'
    ctx.textAlign = 'center'
    const startYear = parseInt(startMonth.split('-')[0])
    const endYear = parseInt(endMonth.split('-')[0])
    const yearRange = endYear - startYear + 1
    const labelsToShow = Math.min(yearRange + 1, 6)
    
    for (let i = 0; i < labelsToShow; i++) {
      const year = startYear + Math.floor((yearRange) * (i / (labelsToShow - 1)))
      const x = padding.left + (chartWidth / (labelsToShow - 1)) * i
      ctx.fillText(year.toString(), x, height - padding.bottom + 40)
    }
    
    // CTA line below X-axis
    ctx.fillStyle = '#64748B'
    ctx.font = '16px -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Get Started on Public.com - Investing for those who take it seriously', width / 2, height - padding.bottom + 70)
    
    // Contribution line - MORE VISIBLE
    if (currentFrame > 0 && strategy === 'dca') {
      ctx.strokeStyle = '#94A3B8'
      ctx.lineWidth = 3
      ctx.setLineDash([8, 6])
      ctx.lineCap = 'round'
      ctx.shadowColor = 'rgba(148, 163, 184, 0.3)'
      ctx.shadowBlur = 5
      ctx.beginPath()
      
      for (let i = 0; i <= currentFrame; i++) {
        const result = getValueAtFrame(simulationData[0], i)
        const x = padding.left + (chartWidth / (simulationData[0].data.length - 1)) * i
        const y = height - padding.bottom - ((result.invested - minValue) / valueRange) * chartHeight
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.setLineDash([])
      ctx.shadowBlur = 0
    }
    
    // Watermark - slightly more visible
    if (logoImage) {
      const logoWidth = 200
      const logoHeight = (logoImage.height / logoImage.width) * logoWidth
      const logoX = (width - logoWidth) / 2
      const logoY = (height - logoHeight) / 2
      
      ctx.globalAlpha = 0.12
      ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight)
      ctx.globalAlpha = 1
    }
    
    // Draw data lines - THICKER & MORE VIBRANT
    const colors = ['#00E676', '#9C27B0', '#FF9800']
    
    simulationData.forEach((sim, idx) => {
      const color = colors[idx % colors.length]
      ctx.strokeStyle = color
      ctx.lineWidth = 5
      ctx.shadowColor = color
      ctx.shadowBlur = 15
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      
      ctx.beginPath()
      
      for (let i = 0; i <= currentFrame; i++) {
        const result = getValueAtFrame(sim, i)
        const x = padding.left + (chartWidth / (sim.data.length - 1)) * i
        const y = height - padding.bottom - ((result.value - minValue) / valueRange) * chartHeight
        
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      
      ctx.stroke()
      ctx.shadowBlur = 0
      
      // Add pulsing circle at current position
      if (currentFrame > 0) {
        const result = getValueAtFrame(sim, currentFrame)
        const x = padding.left + (chartWidth / (sim.data.length - 1)) * currentFrame
        const y = height - padding.bottom - ((result.value - minValue) / valueRange) * chartHeight
        
        // Pulsing effect
        const pulse = Math.sin(Date.now() / 200) * 3 + 10
        
        ctx.beginPath()
        ctx.arc(x, y, pulse, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.shadowColor = color
        ctx.shadowBlur = 20
        ctx.fill()
        ctx.shadowBlur = 0
        
        // White center
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fillStyle = 'white'
        ctx.fill()
        
        // Show milestone badges for major gains
        const percentGain = ((result.value - result.invested) / result.invested) * 100
        const milestones = [50, 100, 200, 300, 500]
        const currentMilestone = milestones.find(m => percentGain >= m && percentGain < m + 10)
        
        if (currentMilestone) {
          // Milestone badge
          ctx.save()
          ctx.font = 'bold 16px -apple-system, sans-serif'
          ctx.fillStyle = color
          ctx.shadowColor = color
          ctx.shadowBlur = 15
          ctx.textAlign = 'center'
          ctx.fillText(`🎉 ${currentMilestone}%`, x, y - 30)
          ctx.restore()
        }
      }
    })
    
    // Ticker boxes - ENHANCED & DYNAMIC
    if (currentFrame > 0) {
      simulationData.forEach((sim, idx) => {
        const result = getValueAtFrame(sim, currentFrame)
        const percentGain = ((result.value - result.invested) / result.invested) * 100
        
        const boxX = width - padding.right - 200
        const boxY = padding.top + (idx * 95)
        
        // Gradient background
        const boxGradient = ctx.createLinearGradient(boxX, boxY, boxX, boxY + 85)
        boxGradient.addColorStop(0, 'rgba(255, 255, 255, 0.98)')
        boxGradient.addColorStop(1, 'rgba(240, 253, 244, 0.98)')
        
        ctx.fillStyle = boxGradient
        ctx.shadowColor = 'rgba(0,0,0,0.15)'
        ctx.shadowBlur = 20
        ctx.strokeStyle = colors[idx % colors.length]
        ctx.lineWidth = 3
        
        // Rounded rectangle
        const radius = 12
        ctx.beginPath()
        ctx.moveTo(boxX + radius, boxY)
        ctx.lineTo(boxX + 190 - radius, boxY)
        ctx.arcTo(boxX + 190, boxY, boxX + 190, boxY + radius, radius)
        ctx.lineTo(boxX + 190, boxY + 85 - radius)
        ctx.arcTo(boxX + 190, boxY + 85, boxX + 190 - radius, boxY + 85, radius)
        ctx.lineTo(boxX + radius, boxY + 85)
        ctx.arcTo(boxX, boxY + 85, boxX, boxY + 85 - radius, radius)
        ctx.lineTo(boxX, boxY + radius)
        ctx.arcTo(boxX, boxY, boxX + radius, boxY, radius)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        ctx.shadowBlur = 0
        
        // Ticker name
        ctx.fillStyle = '#1F2937'
        ctx.font = 'bold 18px -apple-system, sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(sim.ticker, boxX + 18, boxY + 30)
        
        // Current value
        ctx.fillStyle = colors[idx % colors.length]
        ctx.font = 'bold 26px -apple-system, sans-serif'
        ctx.fillText(`$${(result.value / 1000).toFixed(2)}K`, boxX + 18, boxY + 58)
        
        // Percentage gain with arrow
        const arrow = percentGain >= 0 ? '↑' : '↓'
        ctx.fillStyle = percentGain >= 0 ? '#00E676' : '#FF5252'
        ctx.font = 'bold 16px -apple-system, sans-serif'
        ctx.fillText(`${arrow} ${Math.abs(percentGain).toFixed(1)}%`, boxX + 18, boxY + 78)
      })
      
      // Total invested box - PREMIUM STYLING
      let totalInvested = 0
      let totalValue = 0
      
      simulationData.forEach(sim => {
        const result = getValueAtFrame(sim, currentFrame)
        totalInvested += result.invested
        totalValue += result.value
      })
      
      const totalGain = ((totalValue - totalInvested) / totalInvested) * 100
      
      // Gradient background
      const totalBoxGradient = ctx.createLinearGradient(padding.left, padding.top - 95, padding.left, padding.top - 10)
      totalBoxGradient.addColorStop(0, 'rgba(255, 255, 255, 0.98)')
      totalBoxGradient.addColorStop(1, 'rgba(240, 253, 244, 0.98)')
      
      ctx.fillStyle = totalBoxGradient
      ctx.shadowColor = 'rgba(0,0,0,0.15)'
      ctx.shadowBlur = 20
      ctx.strokeStyle = totalGain >= 0 ? '#00E676' : '#FF5252'
      ctx.lineWidth = 3
      
      // Rounded rectangle
      const radius = 12
      const boxX = padding.left
      const boxY = padding.top - 95
      const boxW = 220
      const boxH = 85
      
      ctx.beginPath()
      ctx.moveTo(boxX + radius, boxY)
      ctx.lineTo(boxX + boxW - radius, boxY)
      ctx.arcTo(boxX + boxW, boxY, boxX + boxW, boxY + radius, radius)
      ctx.lineTo(boxX + boxW, boxY + boxH - radius)
      ctx.arcTo(boxX + boxW, boxY + boxH, boxX + boxW - radius, boxY + boxH, radius)
      ctx.lineTo(boxX + radius, boxY + boxH)
      ctx.arcTo(boxX, boxY + boxH, boxX, boxY + boxH - radius, radius)
      ctx.lineTo(boxX, boxY + radius)
      ctx.arcTo(boxX, boxY, boxX + radius, boxY, radius)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      ctx.shadowBlur = 0
      
      // Label
      ctx.fillStyle = '#64748B'
      ctx.font = '14px -apple-system, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(strategy === 'lump' ? 'Lump Sum Invested' : 'Total Contributed', boxX + 18, boxY + 25)
      
      // Amount
      ctx.fillStyle = '#1F2937'
      ctx.font = 'bold 32px -apple-system, sans-serif'
      ctx.fillText(`$${(totalInvested / 1000).toFixed(1)}K`, boxX + 18, boxY + 55)
      
      // Growth with arrow
      const arrow = totalGain >= 0 ? '↑' : '↓'
      ctx.fillStyle = totalGain >= 0 ? '#00E676' : '#FF5252'
      ctx.font = 'bold 18px -apple-system, sans-serif'
      ctx.fillText(`${arrow} ${Math.abs(totalGain).toFixed(1)}% Growth`, boxX + 18, boxY + 78)
    }
    
    // Contributed label - ENHANCED
    if (currentFrame > 0 && strategy === 'dca') {
      const result = getValueAtFrame(simulationData[0], currentFrame)
      const lastX = padding.left + (chartWidth / (simulationData[0].data.length - 1)) * currentFrame
      const lastY = height - padding.bottom - ((result.invested - minValue) / valueRange) * chartHeight
      
      // Background badge
      ctx.fillStyle = 'rgba(100, 116, 139, 0.95)'
      ctx.shadowColor = 'rgba(0,0,0,0.2)'
      ctx.shadowBlur = 10
      
      const labelWidth = 130
      const labelHeight = 50
      const labelX = lastX - labelWidth - 25
      const labelY = lastY - 35
      
      // Rounded rectangle
      const radius = 8
      ctx.beginPath()
      ctx.moveTo(labelX + radius, labelY)
      ctx.lineTo(labelX + labelWidth - radius, labelY)
      ctx.arcTo(labelX + labelWidth, labelY, labelX + labelWidth, labelY + radius, radius)
      ctx.lineTo(labelX + labelWidth, labelY + labelHeight - radius)
      ctx.arcTo(labelX + labelWidth, labelY + labelHeight, labelX + labelWidth - radius, labelY + labelHeight, radius)
      ctx.lineTo(labelX + radius, labelY + labelHeight)
      ctx.arcTo(labelX, labelY + labelHeight, labelX, labelY + labelHeight - radius, radius)
      ctx.lineTo(labelX, labelY + radius)
      ctx.arcTo(labelX, labelY, labelX + radius, labelY, radius)
      ctx.closePath()
      ctx.fill()
      ctx.shadowBlur = 0
      
      ctx.fillStyle = 'white'
      ctx.font = 'bold 14px -apple-system, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Contributed', labelX + labelWidth / 2, labelY + 20)
      
      ctx.font = 'bold 18px -apple-system, sans-serif'
      ctx.fillText(`$${(result.invested / 1000).toFixed(2)}K`, labelX + labelWidth / 2, labelY + 40)
    }
  }, [simulationData, currentFrame, investmentAmount, strategy, logoImage, startMonth, endMonth])

  // Download video at specified speed - INSTAGRAM SIZE (1080x1920)
  const downloadVideo = async (speed = 1) => {
    if (!simulationData || !canvasRef.current || isRecording) return
    
    setIsRecording(true)
    
    // Create offscreen canvas for Instagram Story format (vertical)
    const offscreenCanvas = document.createElement('canvas')
    offscreenCanvas.width = 1080
    offscreenCanvas.height = 1920
    const offscreenCtx = offscreenCanvas.getContext('2d')
    
    const stream = offscreenCanvas.captureStream(30)
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 8000000
    })
    
    const chunks = []
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data)
    }
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `public-time-machine-${speed}x-${Date.now()}.webm`
      a.click()
      URL.revokeObjectURL(url)
      setIsRecording(false)
    }
    
    mediaRecorder.start()
    const maxFrames = simulationData[0].data.length
    
    // Helper function to draw to offscreen canvas
    const drawToCanvas = (ctx, canvas, frame) => {
      const width = canvas.width
      const height = canvas.height
      
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, '#F0FDF4')
      gradient.addColorStop(0.5, '#FFFFFF')
      gradient.addColorStop(1, '#F9FAFB')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
      
      // Scale everything for Instagram vertical format
      const padding = { top: 150, right: 80, bottom: 180, left: 120 }
      const chartWidth = width - padding.left - padding.right
      const chartHeight = height - padding.top - padding.bottom
      
      // Calculate value range
      let maxValue = 0
      let minValue = Infinity
      let maxInvested = 0
      
      if (frame > 0) {
        simulationData.forEach(sim => {
          const result = getValueAtFrame(sim, frame)
          maxValue = Math.max(maxValue, result.value)
          minValue = Math.min(minValue, result.invested)
          maxInvested = Math.max(maxInvested, result.invested)
        })
      } else {
        minValue = strategy === 'lump' ? investmentAmount : investmentAmount
      }
      
      maxValue = Math.max(maxValue, maxInvested) * 1.15
      minValue = minValue * 0.95
      const valueRange = maxValue - minValue
      
      // Grid
      for (let i = 0; i <= 5; i++) {
        const y = padding.top + (chartHeight / 5) * i
        if (i < 5) {
          ctx.fillStyle = i % 2 === 0 ? 'rgba(249, 250, 251, 0.5)' : 'rgba(255, 255, 255, 0.3)'
          ctx.fillRect(padding.left, y, chartWidth, chartHeight / 5)
        }
        ctx.strokeStyle = '#E5E7EB'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(padding.left, y)
        ctx.lineTo(width - padding.right, y)
        ctx.stroke()
      }
      
      // Y-axis labels (Instagram size)
      ctx.fillStyle = '#1F2937'
      ctx.font = 'bold 28px -apple-system, sans-serif'
      ctx.textAlign = 'right'
      for (let i = 0; i <= 5; i++) {
        const value = minValue + (valueRange / 5) * (5 - i)
        const y = padding.top + (chartHeight / 5) * i
        ctx.fillText(`$${(value / 1000).toFixed(1)}K`, padding.left - 20, y + 10)
      }
      
      // X-axis labels (Instagram size)
      ctx.font = 'bold 28px -apple-system, sans-serif'
      ctx.textAlign = 'center'
      const startYear = parseInt(startMonth.split('-')[0])
      const endYear = parseInt(endMonth.split('-')[0])
      const yearRange = endYear - startYear + 1
      const labelsToShow = Math.min(yearRange + 1, 6)
      
      for (let i = 0; i < labelsToShow; i++) {
        const year = startYear + Math.floor((yearRange) * (i / (labelsToShow - 1)))
        const x = padding.left + (chartWidth / (labelsToShow - 1)) * i
        ctx.fillText(year.toString(), x, height - padding.bottom + 50)
      }
      
      // CTA line below X-axis (Instagram size)
      ctx.fillStyle = '#64748B'
      ctx.font = '22px -apple-system, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Get Started on Public.com - Investing for those who take it seriously', width / 2, height - padding.bottom + 95)
      
      // Contribution line
      if (frame > 0 && strategy === 'dca') {
        ctx.strokeStyle = '#94A3B8'
        ctx.lineWidth = 4
        ctx.setLineDash([8, 6])
        ctx.lineCap = 'round'
        ctx.beginPath()
        
        for (let i = 0; i <= frame; i++) {
          const result = getValueAtFrame(simulationData[0], i)
          const x = padding.left + (chartWidth / (simulationData[0].data.length - 1)) * i
          const y = height - padding.bottom - ((result.invested - minValue) / valueRange) * chartHeight
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
        ctx.setLineDash([])
      }
      
      // Watermark (Instagram size)
      if (logoImage) {
        const logoWidth = 280
        const logoHeight = (logoImage.height / logoImage.width) * logoWidth
        const logoX = (width - logoWidth) / 2
        const logoY = (height - logoHeight) / 2
        ctx.globalAlpha = 0.12
        ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight)
        ctx.globalAlpha = 1
      }
      
      // Data lines
      const colors = ['#00E676', '#9C27B0', '#FF9800']
      simulationData.forEach((sim, idx) => {
        const color = colors[idx % colors.length]
        ctx.strokeStyle = color
        ctx.lineWidth = 6
        ctx.shadowColor = color
        ctx.shadowBlur = 15
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.beginPath()
        
        for (let i = 0; i <= frame; i++) {
          const result = getValueAtFrame(sim, i)
          const x = padding.left + (chartWidth / (sim.data.length - 1)) * i
          const y = height - padding.bottom - ((result.value - minValue) / valueRange) * chartHeight
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
        ctx.shadowBlur = 0
        
        // Pulsing circle
        if (frame > 0) {
          const result = getValueAtFrame(sim, frame)
          const x = padding.left + (chartWidth / (sim.data.length - 1)) * frame
          const y = height - padding.bottom - ((result.value - minValue) / valueRange) * chartHeight
          
          ctx.beginPath()
          ctx.arc(x, y, 12, 0, Math.PI * 2)
          ctx.fillStyle = color
          ctx.fill()
          
          ctx.beginPath()
          ctx.arc(x, y, 5, 0, Math.PI * 2)
          ctx.fillStyle = 'white'
          ctx.fill()
        }
      })
      
      // Info boxes (Instagram size - bigger and repositioned)
      if (frame > 0) {
        simulationData.forEach((sim, idx) => {
          const result = getValueAtFrame(sim, frame)
          const percentGain = ((result.value - result.invested) / result.invested) * 100
          
          const boxX = width - padding.right - 280
          const boxY = padding.top + (idx * 140)
          
          const boxGradient = ctx.createLinearGradient(boxX, boxY, boxX, boxY + 120)
          boxGradient.addColorStop(0, 'rgba(255, 255, 255, 0.98)')
          boxGradient.addColorStop(1, 'rgba(240, 253, 244, 0.98)')
          
          ctx.fillStyle = boxGradient
          ctx.shadowColor = 'rgba(0,0,0,0.15)'
          ctx.shadowBlur = 20
          ctx.strokeStyle = colors[idx % colors.length]
          ctx.lineWidth = 4
          
          const radius = 15
          ctx.beginPath()
          ctx.moveTo(boxX + radius, boxY)
          ctx.lineTo(boxX + 270 - radius, boxY)
          ctx.arcTo(boxX + 270, boxY, boxX + 270, boxY + radius, radius)
          ctx.lineTo(boxX + 270, boxY + 120 - radius)
          ctx.arcTo(boxX + 270, boxY + 120, boxX + 270 - radius, boxY + 120, radius)
          ctx.lineTo(boxX + radius, boxY + 120)
          ctx.arcTo(boxX, boxY + 120, boxX, boxY + 120 - radius, radius)
          ctx.lineTo(boxX, boxY + radius)
          ctx.arcTo(boxX, boxY, boxX + radius, boxY, radius)
          ctx.closePath()
          ctx.fill()
          ctx.stroke()
          ctx.shadowBlur = 0
          
          ctx.fillStyle = '#1F2937'
          ctx.font = 'bold 28px -apple-system, sans-serif'
          ctx.textAlign = 'left'
          ctx.fillText(sim.ticker, boxX + 25, boxY + 45)
          
          ctx.fillStyle = colors[idx % colors.length]
          ctx.font = 'bold 36px -apple-system, sans-serif'
          ctx.fillText(`$${(result.value / 1000).toFixed(2)}K`, boxX + 25, boxY + 85)
          
          const arrow = percentGain >= 0 ? '↑' : '↓'
          ctx.fillStyle = percentGain >= 0 ? '#00E676' : '#FF5252'
          ctx.font = 'bold 24px -apple-system, sans-serif'
          ctx.fillText(`${arrow} ${Math.abs(percentGain).toFixed(1)}%`, boxX + 25, boxY + 110)
        })
        
        // Total invested box
        let totalInvested = 0
        let totalValue = 0
        simulationData.forEach(sim => {
          const result = getValueAtFrame(sim, frame)
          totalInvested += result.invested
          totalValue += result.value
        })
        const totalGain = ((totalValue - totalInvested) / totalInvested) * 100
        
        const totalBoxGradient = ctx.createLinearGradient(padding.left, padding.top - 140, padding.left, padding.top - 20)
        totalBoxGradient.addColorStop(0, 'rgba(255, 255, 255, 0.98)')
        totalBoxGradient.addColorStop(1, 'rgba(240, 253, 244, 0.98)')
        
        ctx.fillStyle = totalBoxGradient
        ctx.shadowColor = 'rgba(0,0,0,0.15)'
        ctx.shadowBlur = 20
        ctx.strokeStyle = totalGain >= 0 ? '#00E676' : '#FF5252'
        ctx.lineWidth = 4
        
        const boxX = padding.left
        const boxY = padding.top - 140
        const boxW = 320
        const boxH = 120
        const radius = 15
        
        ctx.beginPath()
        ctx.moveTo(boxX + radius, boxY)
        ctx.lineTo(boxX + boxW - radius, boxY)
        ctx.arcTo(boxX + boxW, boxY, boxX + boxW, boxY + radius, radius)
        ctx.lineTo(boxX + boxW, boxY + boxH - radius)
        ctx.arcTo(boxX + boxW, boxY + boxH, boxX + boxW - radius, boxY + boxH, radius)
        ctx.lineTo(boxX + radius, boxY + boxH)
        ctx.arcTo(boxX, boxY + boxH, boxX, boxY + boxH - radius, radius)
        ctx.lineTo(boxX, boxY + radius)
        ctx.arcTo(boxX, boxY, boxX + radius, boxY, radius)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        ctx.shadowBlur = 0
        
        ctx.fillStyle = '#64748B'
        ctx.font = '20px -apple-system, sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(strategy === 'lump' ? 'Lump Sum Invested' : 'Total Contributed', boxX + 25, boxY + 35)
        
        ctx.fillStyle = '#1F2937'
        ctx.font = 'bold 46px -apple-system, sans-serif'
        ctx.fillText(`$${(totalInvested / 1000).toFixed(1)}K`, boxX + 25, boxY + 80)
        
        const arrow = totalGain >= 0 ? '↑' : '↓'
        ctx.fillStyle = totalGain >= 0 ? '#00E676' : '#FF5252'
        ctx.font = 'bold 26px -apple-system, sans-serif'
        ctx.fillText(`${arrow} ${Math.abs(totalGain).toFixed(1)}% Growth`, boxX + 25, boxY + 110)
      }
    }
    
    // Record frames
    let frame = 0
    const recordInterval = setInterval(() => {
      drawToCanvas(offscreenCtx, offscreenCanvas, frame)
      setCurrentFrame(frame) // Update display
      frame++
      
      if (frame >= maxFrames) {
        clearInterval(recordInterval)
        setTimeout(() => {
          mediaRecorder.stop()
        }, 100)
      }
    }, (50 / speed))
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            <span className="text-[#2952CC]">Public.com</span> - Stock Time Machine
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Time travel to see what would have happened if you invested years ago
          </p>
        </motion.div>

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Public's Time Machine</h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            See what would have happened if you started investing years ago
          </p>

          {/* Stock Selection */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-3 text-sm sm:text-base">
              Stock Tickers (add 1-3 stocks)
            </label>
            
            <div className="relative" ref={searchRef}>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowDropdown(true)}
                  placeholder="Search by ticker or company name..."
                  className="flex-1 px-4 py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-[#2952CC] focus:outline-none transition-colors"
                />
                <button
                  onClick={() => searchQuery && addStock(searchQuery.toUpperCase())}
                  disabled={stocks.length >= 3}
                  className="px-4 sm:px-6 py-3 bg-[#2952CC] text-white font-semibold rounded-lg hover:bg-[#1D3FD7] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                >
                  Add
                </button>
              </div>

              {/* Autocomplete */}
              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                  >
                    {filteredStocks.map((stock) => (
                      <button
                        key={stock.ticker}
                        onClick={() => addStock(stock.ticker)}
                        disabled={stocks.includes(stock.ticker)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="font-semibold text-gray-900 text-sm sm:text-base">{stock.ticker}</div>
                        <div className="text-xs sm:text-sm text-gray-600">{stock.name}</div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Presets */}
            <div className="mt-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-2">Quick Presets:</p>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePresetClick(preset)}
                    disabled={stocks.length >= 3}
                    className="text-xs sm:text-sm px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected */}
            {stocks.length > 0 && (
              <div className="flex flex-wrap gap-2 sm:gap-3 mt-4">
                {stocks.map((stock) => (
                  <div key={stock} className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#2952CC] text-white font-semibold rounded-lg text-sm sm:text-base">
                    <span>{stock}</span>
                    <button onClick={() => removeStock(stock)} className="hover:text-red-200 font-bold">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Start Month</label>
              <input
                type="month"
                value={startMonth}
                onChange={(e) => setStartMonth(e.target.value)}
                min="2015-01"
                max={endMonth}
                className="w-full px-4 py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-[#2952CC] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">End Month</label>
              <input
                type="month"
                value={endMonth}
                onChange={(e) => setEndMonth(e.target.value)}
                min={startMonth}
                max={new Date().toISOString().slice(0, 7)}
                className="w-full px-4 py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-[#2952CC] focus:outline-none"
              />
            </div>
          </div>

          {/* Strategy */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-3 text-sm sm:text-base">Investment Strategy</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => { setStrategy('dca'); setInvestmentAmount(100); }}
                className={`p-4 sm:p-5 rounded-xl border-2 transition-all ${
                  strategy === 'dca' ? 'border-[#2952CC] bg-blue-50' : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <div className="font-bold text-gray-900 mb-1 text-sm sm:text-base">Dollar Cost Averaging</div>
                <div className="text-xs sm:text-sm text-gray-600">Invest monthly</div>
              </button>
              <button
                onClick={() => { setStrategy('lump'); setInvestmentAmount(10000); }}
                className={`p-4 sm:p-5 rounded-xl border-2 transition-all ${
                  strategy === 'lump' ? 'border-[#7C3AED] bg-purple-50' : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <div className="font-bold text-gray-900 mb-1 text-sm sm:text-base">Lump Sum</div>
                <div className="text-xs sm:text-sm text-gray-600">One-time investment</div>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
              {strategy === 'lump' ? 'One-time Lump Sum Investment' : 'Monthly Amount'}
            </label>
            <input
              type="number"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(parseInt(e.target.value) || 0)}
              min="10"
              step="10"
              className="w-full px-4 py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-[#2952CC] focus:outline-none mb-3"
            />
            {strategy === 'dca' && (
              <div className="flex flex-wrap gap-2">
                {[50, 100, 250, 500, 1000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setInvestmentAmount(amount)}
                    className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-xs sm:text-sm font-medium"
                  >
                    ${amount}/mo
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Generate */}
          <button
            onClick={generateSimulation}
            disabled={stocks.length === 0 || isGenerating}
            className="w-full py-3 sm:py-4 bg-[#2952CC] text-white font-bold text-base sm:text-lg rounded-xl hover:bg-[#1D3FD7] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? 'Generating Simulation...' : 'Generate Simulation'}
          </button>
        </motion.div>

        {/* Results */}
        {simulationData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Your Time Machine Results</h2>
            
            {/* Canvas */}
            <div className="mb-6 bg-gradient-to-br from-green-50 to-white p-4 rounded-xl">
              <canvas
                ref={canvasRef}
                width={1920}
                height={1080}
                className="w-full border border-gray-200 rounded-lg bg-white"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>

            {/* Speed Controls */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
              <button
                onClick={() => setPlaybackSpeed(0.5)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                  playbackSpeed === 0.5 ? 'bg-[#2952CC] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                0.5x
              </button>
              <button
                onClick={() => setPlaybackSpeed(1)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                  playbackSpeed === 1 ? 'bg-[#2952CC] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                1x
              </button>
              <button
                onClick={() => setPlaybackSpeed(2)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                  playbackSpeed === 2 ? 'bg-[#2952CC] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                2x
              </button>
            </div>

            {/* Playback Controls */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
              <button
                onClick={() => { setCurrentFrame(0); setIsPlaying(false); }}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 text-sm sm:text-base"
              >
                ⏮ Reset
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={isRecording}
                className="px-6 sm:px-8 py-2 sm:py-3 bg-[#2952CC] text-white font-semibold rounded-lg hover:bg-[#1D3FD7] disabled:bg-gray-400 text-sm sm:text-base"
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
              <button
                onClick={() => { setCurrentFrame(simulationData[0].data.length - 1); setIsPlaying(false); }}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 text-sm sm:text-base"
              >
                ⏭ End
              </button>
            </div>

            {/* Progress */}
            <div className="h-2 sm:h-3 bg-gray-200 rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-[#2952CC] transition-all duration-100"
                style={{ width: `${(currentFrame / (simulationData[0].data.length - 1)) * 100}%` }}
              />
            </div>

            {/* Download Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <button
                onClick={() => downloadVideo(0.5)}
                disabled={isRecording}
                className="py-3 bg-[#2952CC] text-white font-semibold rounded-lg hover:bg-[#1D3FD7] disabled:bg-gray-400 transition-colors"
              >
                📥 Download 0.5x
              </button>
              <button
                onClick={() => downloadVideo(1)}
                disabled={isRecording}
                className="py-3 bg-[#2952CC] text-white font-semibold rounded-lg hover:bg-[#1D3FD7] disabled:bg-gray-400 transition-colors"
              >
                📥 Download 1x
              </button>
              <button
                onClick={() => downloadVideo(2)}
                disabled={isRecording}
                className="py-3 bg-[#2952CC] text-white font-semibold rounded-lg hover:bg-[#1D3FD7] disabled:bg-gray-400 transition-colors"
              >
                📥 Download 2x
              </button>
            </div>

            {/* Summary */}
            <div className="grid gap-4 sm:gap-6">
              {simulationData.map((sim) => (
                <div key={sim.ticker} className="p-4 sm:p-6 bg-gray-50 rounded-xl">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{sim.ticker} Simulation Results</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4">
                    {strategy === 'lump' ? `Invested $${investmentAmount.toFixed(0)}` : `Investing $${investmentAmount}.00 monthly`} from {startMonth} to {endMonth}
                  </p>
                  
                  <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">{strategy === 'lump' ? 'Invested' : 'Contributed'}</div>
                      <div className="text-base sm:text-xl font-bold text-gray-900">${sim.results.totalInvested.toFixed(0)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Final Value</div>
                      <div className="text-base sm:text-xl font-bold text-[#00C853]">${sim.results.finalValue.toFixed(0)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Return</div>
                      <div className={`text-base sm:text-xl font-bold ${sim.results.totalReturn >= 0 ? 'text-[#00C853]' : 'text-red-500'}`}>
                        {sim.results.totalReturn >= 0 ? '+' : ''}{sim.results.totalReturn.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">CAGR</div>
                      <div className="text-sm sm:text-base font-bold text-gray-900">{sim.results.cagr.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Years</div>
                      <div className="text-sm sm:text-base font-bold text-gray-900">{sim.results.years.toFixed(1)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Max Drawdown</div>
                      <div className="text-sm sm:text-base font-bold text-gray-900">{sim.results.maxDrawdown.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 text-xs sm:text-sm mt-8">
          <p>⚠️ Past performance is not indicative of future results. This is for educational purposes only.</p>
        </div>
      </div>
    </main>
  )
}
