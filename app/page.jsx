'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Common stocks for autocomplete
const STOCK_LIST = [
  { ticker: 'AAPL', name: 'Apple Inc.' },
  { ticker: 'MSFT', name: 'Microsoft Corporation' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation' },
  { ticker: 'TSLA', name: 'Tesla, Inc.' },
  { ticker: 'META', name: 'Meta Platforms Inc.' },
  { ticker: 'SPY', name: 'S&P 500 ETF' },
  { ticker: 'QQQ', name: 'NASDAQ-100 ETF' },
  { ticker: 'AMD', name: 'Advanced Micro Devices' },
  { ticker: 'NFLX', name: 'Netflix Inc.' },
  { ticker: 'DIS', name: 'The Walt Disney Company' },
  { ticker: 'V', name: 'Visa Inc.' },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.' },
  { ticker: 'WMT', name: 'Walmart Inc.' },
]

export default function Home() {
  const [stocks, setStocks] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredStocks, setFilteredStocks] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [startYear, setStartYear] = useState(2021)
  const [endYear, setEndYear] = useState(2026)
  const [strategy, setStrategy] = useState('dca')
  const [monthlyAmount, setMonthlyAmount] = useState(100)
  const [isGenerating, setIsGenerating] = useState(false)
  const [simulationData, setSimulationData] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const canvasRef = useRef(null)
  const searchRef = useRef(null)

  // Stock presets
  const presets = [
    { label: 'Apple', ticker: 'AAPL' },
    { label: 'NVIDIA', ticker: 'NVDA' },
    { label: 'Tesla', ticker: 'TSLA' },
    { label: 'S&P 500', ticker: 'SPY' },
    { label: 'Apple vs Microsoft', tickers: ['AAPL', 'MSFT'] },
    { label: 'NVIDIA vs AMD', tickers: ['NVDA', 'AMD'] },
    { label: 'S&P 500 vs NASDAQ', tickers: ['SPY', 'QQQ'] },
  ]

  // Filter stocks based on search
  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = STOCK_LIST.filter(stock => 
        stock.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
      setFilteredStocks(filtered)
      setShowDropdown(filtered.length > 0)
    } else {
      setShowDropdown(false)
    }
  }, [searchQuery])

  // Close dropdown when clicking outside
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
    if (preset.tickers) {
      setStocks(preset.tickers.slice(0, 3))
    } else {
      addStock(preset.ticker)
    }
  }

  // Generate realistic stock data
  const generateStockData = (ticker, startYear, endYear) => {
    const months = (endYear - startYear) * 12
    const data = []
    let currentPrice = 100 + Math.random() * 100
    
    const growthRates = {
      'NVDA': 0.035, 'AAPL': 0.018, 'MSFT': 0.020, 'GOOGL': 0.015,
      'TSLA': 0.025, 'SPY': 0.012, 'AMD': 0.022, 'QQQ': 0.015,
    }
    
    const monthlyGrowth = growthRates[ticker] || 0.015
    const volatility = 0.08
    
    for (let i = 0; i <= months; i++) {
      const date = new Date(startYear, i, 1)
      const trend = currentPrice * monthlyGrowth
      const randomWalk = currentPrice * volatility * (Math.random() - 0.5)
      currentPrice = Math.max(10, currentPrice + trend + randomWalk)
      
      if (Math.random() < 0.05) currentPrice *= 0.92
      
      data.push({
        date: date.toISOString().split('T')[0],
        price: currentPrice,
        month: i,
      })
    }
    
    return data
  }

  // Calculate investment results
  const calculateInvestment = (stockData, strategy, monthlyAmount) => {
    let totalInvested = 0
    let shares = 0
    
    if (strategy === 'lump') {
      totalInvested = monthlyAmount * stockData.length
      shares = totalInvested / stockData[0].price
    } else {
      stockData.forEach(point => {
        totalInvested += monthlyAmount
        shares += monthlyAmount / point.price
      })
    }
    
    const finalValue = shares * stockData[stockData.length - 1].price
    const totalReturn = ((finalValue - totalInvested) / totalInvested) * 100
    const years = stockData.length / 12
    const cagr = (Math.pow(finalValue / totalInvested, 1 / years) - 1) * 100
    
    return { totalInvested, finalValue, totalReturn, cagr, shares, years }
  }

  const generateSimulation = () => {
    if (stocks.length === 0) return
    
    setIsGenerating(true)
    setTimeout(() => {
      const simulations = stocks.map(ticker => {
        const stockData = generateStockData(ticker, startYear, endYear)
        const results = calculateInvestment(stockData, strategy, monthlyAmount)
        return { ticker, data: stockData, results }
      })
      
      setSimulationData(simulations)
      setIsGenerating(false)
      setCurrentFrame(0)
      setIsPlaying(false)
    }, 1500)
  }

  // Animation playback
  useEffect(() => {
    if (!isPlaying || !simulationData) return
    
    const maxFrames = simulationData[0]?.data.length || 0
    if (currentFrame >= maxFrames - 1) {
      setIsPlaying(false)
      return
    }
    
    const interval = setInterval(() => {
      setCurrentFrame(prev => Math.min(prev + 1, maxFrames - 1))
    }, 50)
    
    return () => clearInterval(interval)
  }, [isPlaying, currentFrame, simulationData])

  // Draw chart on canvas
  useEffect(() => {
    if (!simulationData || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    
    // Clear canvas
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, height)
    
    // Find max value
    let maxValue = 0
    simulationData.forEach(sim => {
      sim.data.slice(0, currentFrame + 1).forEach(point => {
        const invested = strategy === 'lump' 
          ? monthlyAmount * sim.data.length 
          : monthlyAmount * (point.month + 1)
        const shares = strategy === 'lump'
          ? (monthlyAmount * sim.data.length) / sim.data[0].price
          : sim.data.slice(0, point.month + 1).reduce((sum, p) => sum + monthlyAmount / p.price, 0)
        const value = shares * point.price
        maxValue = Math.max(maxValue, value)
      })
    })
    
    maxValue = maxValue * 1.1
    
    const padding = 80
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2
    
    // Draw grid
    ctx.strokeStyle = '#E5E7EB'
    ctx.lineWidth = 2
    
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }
    
    // Draw axes
    ctx.strokeStyle = '#9CA3AF'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.stroke()
    
    // Y-axis labels
    ctx.fillStyle = '#6B7280'
    ctx.font = 'bold 28px -apple-system, sans-serif'
    ctx.textAlign = 'right'
    
    for (let i = 0; i <= 5; i++) {
      const value = (maxValue / 5) * (5 - i)
      const y = padding + (chartHeight / 5) * i
      ctx.fillText(`$${value.toFixed(0)}`, padding - 15, y + 10)
    }
    
    // Draw data lines
    const colors = ['#00C853', '#7C3AED', '#F59E0B']
    
    simulationData.forEach((sim, idx) => {
      const color = colors[idx % colors.length]
      ctx.strokeStyle = color
      ctx.lineWidth = 8
      
      ctx.beginPath()
      
      sim.data.slice(0, currentFrame + 1).forEach((point, i) => {
        const shares = strategy === 'lump'
          ? (monthlyAmount * sim.data.length) / sim.data[0].price
          : sim.data.slice(0, point.month + 1).reduce((sum, p) => sum + monthlyAmount / p.price, 0)
        const value = shares * point.price
        
        const x = padding + (chartWidth / (sim.data.length - 1)) * i
        const y = height - padding - (value / maxValue) * chartHeight
        
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      
      ctx.stroke()
      
      // Current point
      if (currentFrame > 0) {
        const point = sim.data[currentFrame]
        const shares = strategy === 'lump'
          ? (monthlyAmount * sim.data.length) / sim.data[0].price
          : sim.data.slice(0, currentFrame + 1).reduce((sum, p) => sum + monthlyAmount / p.price, 0)
        const value = shares * point.price
        
        const x = padding + (chartWidth / (sim.data.length - 1)) * currentFrame
        const y = height - padding - (value / maxValue) * chartHeight
        
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(x, y, 12, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.font = 'bold 32px -apple-system, sans-serif'
        ctx.fillText(`${sim.ticker}: $${value.toFixed(0)}`, x + 25, y - 20)
      }
    })
    
    // Draw date
    if (currentFrame > 0) {
      const currentDate = new Date(simulationData[0].data[currentFrame].date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      ctx.fillStyle = '#1F2937'
      ctx.font = 'bold 36px -apple-system, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(currentDate, width / 2, height - 50)
    }
    
    // Public.com logo/watermark - PROMINENT
    ctx.fillStyle = '#00C853'
    ctx.font = 'bold 48px -apple-system, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText('Public.com', width - padding - 20, height - padding - 30)
    
    // Tagline
    ctx.font = 'bold 24px -apple-system, sans-serif'
    ctx.fillStyle = '#6B7280'
    ctx.fillText('Invest in stocks & crypto', width - padding - 20, height - padding + 10)
  }, [simulationData, currentFrame, monthlyAmount, strategy])

  // Download video function
  const downloadVideo = async () => {
    if (!simulationData || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const stream = canvas.captureStream(30)
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 5000000
    })
    
    const chunks = []
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `public-time-machine-${Date.now()}.webm`
      a.click()
      URL.revokeObjectURL(url)
    }
    
    mediaRecorder.start()
    
    // Play through animation
    setIsPlaying(true)
    setCurrentFrame(0)
    
    // Stop recording after animation completes
    const maxFrames = simulationData[0].data.length
    setTimeout(() => {
      mediaRecorder.stop()
      setIsPlaying(false)
    }, maxFrames * 50 + 500)
  }

  return (
    <main className="min-h-screen bg-[#F5F7FA] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            <span className="text-[#00C853]">Public.com</span> - The Time Machine
          </h1>
          <p className="text-gray-600 text-lg">
            Time travel to see what would have happened if you invested years ago
          </p>
        </motion.div>

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Public's Time Machine</h2>
          <p className="text-gray-600 mb-6">
            See what would have happened if you started investing years ago
          </p>

          {/* Stock Selection with Autocomplete */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-3">
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
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#00C853] focus:outline-none transition-colors"
                />
                <button
                  onClick={() => searchQuery && addStock(searchQuery.toUpperCase())}
                  disabled={stocks.length >= 3}
                  className="px-6 py-3 bg-[#00C853] text-white font-semibold rounded-lg hover:bg-[#00A843] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Autocomplete Dropdown */}
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
                        <div className="font-semibold text-gray-900">{stock.ticker}</div>
                        <div className="text-sm text-gray-600">{stock.name}</div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Presets */}
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Quick Presets:</p>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePresetClick(preset)}
                    disabled={stocks.length >= 3}
                    className="text-sm px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Stocks */}
            {stocks.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {stocks.map((stock) => (
                  <div key={stock} className="inline-flex items-center gap-2 px-4 py-2 bg-[#00C853] text-white font-semibold rounded-lg">
                    <span>{stock}</span>
                    <button
                      onClick={() => removeStock(stock)}
                      className="hover:text-red-200 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Year Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Start Year</label>
              <input
                type="number"
                value={startYear}
                onChange={(e) => setStartYear(parseInt(e.target.value))}
                min="2000"
                max={endYear - 1}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#00C853] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">End Year</label>
              <input
                type="number"
                value={endYear}
                onChange={(e) => setEndYear(parseInt(e.target.value))}
                min={startYear + 1}
                max="2030"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#00C853] focus:outline-none"
              />
            </div>
          </div>

          {/* Investment Strategy */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-3">Investment Strategy</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setStrategy('dca')}
                className={`p-5 rounded-xl border-2 transition-all ${
                  strategy === 'dca'
                    ? 'border-[#00C853] bg-green-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <div className="font-bold text-gray-900 mb-1">Dollar Cost Averaging</div>
                <div className="text-sm text-gray-600">Invest monthly</div>
              </button>
              <button
                onClick={() => setStrategy('lump')}
                className={`p-5 rounded-xl border-2 transition-all ${
                  strategy === 'lump'
                    ? 'border-[#7C3AED] bg-purple-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <div className="font-bold text-gray-900 mb-1">Lump Sum</div>
                <div className="text-sm text-gray-600">One-time investment</div>
              </button>
            </div>
          </div>

          {/* Monthly Amount */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Monthly Amount</label>
            <input
              type="number"
              value={monthlyAmount}
              onChange={(e) => setMonthlyAmount(parseInt(e.target.value))}
              min="10"
              step="10"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#00C853] focus:outline-none mb-3"
            />
            <div className="flex flex-wrap gap-2">
              {[50, 100, 250, 500, 1000].map(amount => (
                <button
                  key={amount}
                  onClick={() => setMonthlyAmount(amount)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                >
                  ${amount}/mo
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateSimulation}
            disabled={stocks.length === 0 || isGenerating}
            className="w-full py-4 bg-[#00C853] text-white font-bold text-lg rounded-xl hover:bg-[#00A843] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? 'Generating Simulation...' : 'Generate Simulation'}
          </button>
        </motion.div>

        {/* Full Width Video Player */}
        {simulationData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Time Machine Results</h2>
            
            {/* Canvas */}
            <div className="mb-6 flex justify-center">
              <canvas
                ref={canvasRef}
                width={1080}
                height={1920}
                className="border-2 border-gray-200 rounded-xl bg-white"
                style={{ maxWidth: '100%', height: 'auto', aspectRatio: '9/16' }}
              />
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={() => setCurrentFrame(0)}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200"
              >
                ⏮ Reset
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-8 py-3 bg-[#00C853] text-white font-semibold rounded-lg hover:bg-[#00A843]"
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
              <button
                onClick={() => setCurrentFrame(simulationData[0].data.length - 1)}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200"
              >
                ⏭ End
              </button>
            </div>

            {/* Progress Bar */}
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-[#00C853] transition-all duration-100"
                style={{ width: `${(currentFrame / (simulationData[0].data.length - 1)) * 100}%` }}
              />
            </div>

            {/* Download Button */}
            <button
              onClick={downloadVideo}
              className="w-full py-4 bg-[#7C3AED] text-white font-bold text-lg rounded-xl hover:bg-[#6D28D9] transition-colors"
            >
              📥 Download Instagram Story Video
            </button>

            {/* Results Summary */}
            <div className="grid gap-6 mt-8">
              {simulationData.map((sim) => (
                <div key={sim.ticker} className="p-6 bg-gray-50 rounded-xl">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{sim.ticker} Simulation Results</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Investing ${monthlyAmount}.00 monthly from {startYear} to {endYear}
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Total Contributed</div>
                      <div className="text-xl font-bold text-gray-900">${sim.results.totalInvested.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Final Value</div>
                      <div className="text-xl font-bold text-[#00C853]">${sim.results.finalValue.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Total Return</div>
                      <div className={`text-xl font-bold ${sim.results.totalReturn >= 0 ? 'text-[#00C853]' : 'text-red-500'}`}>
                        {sim.results.totalReturn >= 0 ? '+' : ''}{sim.results.totalReturn.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">CAGR</div>
                      <div className="font-bold text-gray-900">{sim.results.cagr.toFixed(2)}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Years</div>
                      <div className="font-bold text-gray-900">{sim.results.years.toFixed(1)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Shares</div>
                      <div className="font-bold text-gray-900">{sim.results.shares.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-700">
                      💡 By consistently investing ${monthlyAmount}.00 every month for {sim.results.years.toFixed(1)} years, 
                      your portfolio would have grown to <span className="font-bold text-[#00C853]">${sim.results.finalValue.toFixed(2)}</span>, 
                      a gain of <span className="font-bold text-[#00C853]">${(sim.results.finalValue - sim.results.totalInvested).toFixed(2)}</span>.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-8">
          <p>⚠️ Past performance is not indicative of future results. This is for educational purposes only.</p>
        </div>
      </div>
    </main>
  )
}
