'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
  const [stocks, setStocks] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [startYear, setStartYear] = useState(2021)
  const [endYear, setEndYear] = useState(2026)
  const [strategy, setStrategy] = useState('dca') // 'dca' or 'lump'
  const [monthlyAmount, setMonthlyAmount] = useState(100)
  const [isGenerating, setIsGenerating] = useState(false)
  const [simulationData, setSimulationData] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const canvasRef = useRef(null)

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

  const addStock = (ticker) => {
    if (stocks.length < 3 && !stocks.includes(ticker)) {
      setStocks([...stocks, ticker])
    }
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

  const handleSearchAdd = () => {
    if (searchQuery.trim()) {
      addStock(searchQuery.toUpperCase())
      setSearchQuery('')
    }
  }

  // Generate realistic stock data with volatility
  const generateStockData = (ticker, startYear, endYear, seed = 0) => {
    const months = (endYear - startYear) * 12
    const data = []
    let currentPrice = 100 + Math.random() * 100
    
    // Define growth rates for different stocks
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
      const date = new Date(startYear, i, 1)
      const trend = currentPrice * monthlyGrowth
      const randomWalk = currentPrice * volatility * (Math.random() - 0.5)
      currentPrice = Math.max(10, currentPrice + trend + randomWalk)
      
      // Add occasional drawdowns
      if (Math.random() < 0.05) {
        currentPrice *= 0.92
      }
      
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
      // Lump sum at start
      totalInvested = monthlyAmount * stockData.length
      shares = totalInvested / stockData[0].price
    } else {
      // Dollar cost averaging
      stockData.forEach(point => {
        totalInvested += monthlyAmount
        shares += monthlyAmount / point.price
      })
    }
    
    const finalValue = shares * stockData[stockData.length - 1].price
    const totalReturn = ((finalValue - totalInvested) / totalInvested) * 100
    const years = stockData.length / 12
    const cagr = (Math.pow(finalValue / totalInvested, 1 / years) - 1) * 100
    
    return {
      totalInvested,
      finalValue,
      totalReturn,
      cagr,
      shares,
      years,
    }
  }

  const generateSimulation = () => {
    if (stocks.length === 0) return
    
    setIsGenerating(true)
    
    // Simulate API delay
    setTimeout(() => {
      const simulations = stocks.map(ticker => {
        const stockData = generateStockData(ticker, startYear, endYear)
        const results = calculateInvestment(stockData, strategy, monthlyAmount)
        
        return {
          ticker,
          data: stockData,
          results,
        }
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
    }, 50) // 50ms per frame = 20 fps
    
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
    ctx.fillStyle = '#0a0e0f'
    ctx.fillRect(0, 0, width, height)
    
    // Find max value for scaling
    let maxValue = 0
    simulationData.forEach(sim => {
      sim.data.slice(0, currentFrame + 1).forEach(point => {
        const invested = strategy === 'lump' 
          ? monthlyAmount * sim.data.length 
          : monthlyAmount * (point.month + 1)
        const shares = strategy === 'lump'
          ? (monthlyAmount * sim.data.length) / sim.data[0].price
          : sim.data.slice(0, point.month + 1).reduce((sum, p, i) => sum + monthlyAmount / p.price, 0)
        const value = shares * point.price
        maxValue = Math.max(maxValue, value)
      })
    })
    
    maxValue = maxValue * 1.1 // Add 10% padding
    
    const padding = 60
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2
    
    // Draw grid
    ctx.strokeStyle = '#00ff41'
    ctx.globalAlpha = 0.1
    ctx.lineWidth = 1
    
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }
    
    ctx.globalAlpha = 1
    
    // Draw axes
    ctx.strokeStyle = '#00ff41'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.stroke()
    
    // Draw labels
    ctx.fillStyle = '#00ff41'
    ctx.font = '12px Courier New'
    ctx.textAlign = 'right'
    
    for (let i = 0; i <= 5; i++) {
      const value = (maxValue / 5) * (5 - i)
      const y = padding + (chartHeight / 5) * i
      ctx.fillText(`$${value.toFixed(0)}`, padding - 10, y + 4)
    }
    
    // Draw data lines
    const colors = ['#00ff41', '#ffb000', '#00ffff']
    
    simulationData.forEach((sim, idx) => {
      const color = colors[idx % colors.length]
      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.globalAlpha = 0.8
      
      ctx.beginPath()
      
      sim.data.slice(0, currentFrame + 1).forEach((point, i) => {
        const invested = strategy === 'lump' 
          ? monthlyAmount * sim.data.length 
          : monthlyAmount * (point.month + 1)
        const shares = strategy === 'lump'
          ? (monthlyAmount * sim.data.length) / sim.data[0].price
          : sim.data.slice(0, point.month + 1).reduce((sum, p, idx) => sum + monthlyAmount / p.price, 0)
        const value = shares * point.price
        
        const x = padding + (chartWidth / (sim.data.length - 1)) * i
        const y = height - padding - (value / maxValue) * chartHeight
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      
      ctx.stroke()
      ctx.globalAlpha = 1
      
      // Draw current point
      if (currentFrame > 0) {
        const point = sim.data[currentFrame]
        const invested = strategy === 'lump' 
          ? monthlyAmount * sim.data.length 
          : monthlyAmount * (point.month + 1)
        const shares = strategy === 'lump'
          ? (monthlyAmount * sim.data.length) / sim.data[0].price
          : sim.data.slice(0, currentFrame + 1).reduce((sum, p, i) => sum + monthlyAmount / p.price, 0)
        const value = shares * point.price
        
        const x = padding + (chartWidth / (sim.data.length - 1)) * currentFrame
        const y = height - padding - (value / maxValue) * chartHeight
        
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(x, y, 5, 0, Math.PI * 2)
        ctx.fill()
        
        // Draw value label
        ctx.font = 'bold 14px Courier New'
        ctx.fillText(`${sim.ticker}: $${value.toFixed(0)}`, x + 10, y - 10)
      }
    })
    
    // Draw date
    if (currentFrame > 0) {
      const currentDate = simulationData[0].data[currentFrame].date
      ctx.fillStyle = '#00ff41'
      ctx.font = 'bold 16px Courier New'
      ctx.textAlign = 'center'
      ctx.fillText(currentDate, width / 2, height - 20)
    }
  }, [simulationData, currentFrame, monthlyAmount, strategy])

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold glow-text text-terminal-green mb-3">
            Bucko.ai <span className="text-terminal-cyan">- The Time Machine</span>
          </h1>
          <p className="text-terminal-green/70 text-lg">
            Time travel to see what would have happened if you invested years ago
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="terminal-panel"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 rounded-full bg-terminal-green animate-pulse-glow"></div>
              <h2 className="text-2xl font-bold text-terminal-green">
                Bucko's Time Machine
              </h2>
            </div>

            <p className="text-terminal-green/80 mb-6 text-sm">
              See what would have happened if you started investing years ago
            </p>

            {/* Stock Selection */}
            <div className="mb-6">
              <label className="block text-terminal-green mb-2 font-bold flex items-center gap-2">
                <span className="text-terminal-cyan">●</span>
                Stock Tickers (add 1-3 stocks)
              </label>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchAdd()}
                  placeholder="Search by ticker or company name..."
                  className="terminal-input flex-1"
                />
                <button
                  onClick={handleSearchAdd}
                  disabled={stocks.length >= 3}
                  className="terminal-button px-4"
                >
                  +
                </button>
              </div>

              {/* Quick Presets */}
              <div className="mb-3">
                <p className="text-terminal-green/60 text-xs mb-2">Quick Presets:</p>
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePresetClick(preset)}
                      disabled={stocks.length >= 3}
                      className="text-xs px-3 py-1 rounded bg-terminal-green/5 border border-terminal-green/30 
                               text-terminal-green hover:bg-terminal-green/10 transition-all disabled:opacity-30"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Stocks */}
              {stocks.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {stocks.map((stock) => (
                    <div key={stock} className="stock-chip">
                      <span>{stock}</span>
                      <button
                        onClick={() => removeStock(stock)}
                        className="text-terminal-green hover:text-red-400"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Year Range */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-terminal-green mb-2 font-bold flex items-center gap-2">
                  <span className="text-terminal-cyan">📅</span>
                  Start Year
                </label>
                <input
                  type="number"
                  value={startYear}
                  onChange={(e) => setStartYear(parseInt(e.target.value))}
                  min="2000"
                  max={endYear - 1}
                  className="terminal-input w-full"
                />
              </div>
              <div>
                <label className="block text-terminal-green mb-2 font-bold">
                  End Year
                </label>
                <input
                  type="number"
                  value={endYear}
                  onChange={(e) => setEndYear(parseInt(e.target.value))}
                  min={startYear + 1}
                  max="2030"
                  className="terminal-input w-full"
                />
              </div>
            </div>

            {/* Investment Strategy */}
            <div className="mb-6">
              <label className="block text-terminal-green mb-3 font-bold flex items-center gap-2">
                <span className="text-terminal-cyan">📈</span>
                Investment Strategy
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setStrategy('dca')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    strategy === 'dca'
                      ? 'border-terminal-green bg-terminal-green/20 shadow-[0_0_20px_rgba(0,255,65,0.3)]'
                      : 'border-terminal-green/30 bg-terminal-green/5 hover:bg-terminal-green/10'
                  }`}
                >
                  <div className="font-bold text-terminal-green mb-1">Dollar Cost Averaging</div>
                  <div className="text-xs text-terminal-green/70">Invest monthly</div>
                </button>
                <button
                  onClick={() => setStrategy('lump')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    strategy === 'lump'
                      ? 'border-terminal-amber bg-terminal-amber/20 shadow-[0_0_20px_rgba(255,176,0,0.3)]'
                      : 'border-terminal-green/30 bg-terminal-green/5 hover:bg-terminal-green/10'
                  }`}
                >
                  <div className="font-bold text-terminal-green mb-1">Lump Sum</div>
                  <div className="text-xs text-terminal-green/70">One-time investment</div>
                </button>
              </div>
            </div>

            {/* Monthly Amount */}
            <div className="mb-6">
              <label className="block text-terminal-green mb-2 font-bold flex items-center gap-2">
                <span className="text-terminal-cyan">$</span>
                Monthly Amount
              </label>
              <input
                type="number"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(parseInt(e.target.value))}
                min="10"
                step="10"
                className="terminal-input w-full"
              />
              <div className="flex gap-2 mt-2">
                {[50, 100, 250, 500, 1000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setMonthlyAmount(amount)}
                    className="text-xs px-3 py-1 rounded bg-terminal-green/5 border border-terminal-green/30 
                             text-terminal-green hover:bg-terminal-green/10 transition-all"
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
              className="terminal-button w-full py-4 text-lg disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚡</span>
                  Generating Simulation...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>⏰</span>
                  Generate Simulation
                </span>
              )}
            </button>
          </motion.div>

          {/* Right Panel - Results & Animation */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="terminal-panel"
          >
            {!simulationData ? (
              <div className="h-full flex items-center justify-center text-terminal-green/40">
                <div className="text-center">
                  <div className="text-6xl mb-4">⏰</div>
                  <p>Configure your time machine settings and click Generate</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Animation Canvas */}
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={500}
                    className="w-full border-2 border-terminal-green/30 rounded-lg bg-terminal-bg"
                  />
                  
                  {/* Playback Controls */}
                  <div className="mt-4 flex items-center justify-center gap-4">
                    <button
                      onClick={() => setCurrentFrame(0)}
                      className="terminal-button px-4 py-2"
                    >
                      ⏮ Reset
                    </button>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="terminal-button px-6 py-2"
                    >
                      {isPlaying ? '⏸ Pause' : '▶ Play'}
                    </button>
                    <button
                      onClick={() => setCurrentFrame(simulationData[0].data.length - 1)}
                      className="terminal-button px-4 py-2"
                    >
                      ⏭ End
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 h-2 bg-terminal-green/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-terminal-green transition-all duration-100"
                      style={{
                        width: `${(currentFrame / (simulationData[0].data.length - 1)) * 100}%`
                      }}
                    />
                  </div>
                </div>

                {/* Results Summary */}
                <div className="grid gap-4">
                  {simulationData.map((sim, idx) => (
                    <div key={sim.ticker} className="p-4 rounded-lg bg-terminal-bg border border-terminal-green/30">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-terminal-green">{sim.ticker} Simulation Results</h3>
                          <p className="text-sm text-terminal-green/60">
                            Investing ${monthlyAmount}.00 monthly from {startYear} to {endYear}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-terminal-green/60 text-xs mb-1">Total Contributed</div>
                          <div className="text-2xl font-bold text-terminal-green">
                            ${sim.results.totalInvested.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-terminal-green/60 text-xs mb-1">Final Value</div>
                          <div className="text-2xl font-bold text-terminal-amber">
                            ${sim.results.finalValue.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-terminal-green/60 text-xs mb-1">Total Return</div>
                          <div className={`text-2xl font-bold ${sim.results.totalReturn >= 0 ? 'text-terminal-green' : 'text-red-400'}`}>
                            {sim.results.totalReturn >= 0 ? '+' : ''}{sim.results.totalReturn.toFixed(2)}%
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-terminal-green/20">
                        <div>
                          <div className="text-terminal-green/60 text-xs mb-1">CAGR</div>
                          <div className="font-bold text-terminal-cyan">
                            {sim.results.cagr.toFixed(2)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-terminal-green/60 text-xs mb-1">Years Invested</div>
                          <div className="font-bold text-terminal-green">
                            {sim.results.years.toFixed(1)}
                          </div>
                        </div>
                        <div>
                          <div className="text-terminal-green/60 text-xs mb-1">Shares</div>
                          <div className="font-bold text-terminal-green">
                            {sim.results.shares.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 p-3 bg-terminal-green/5 rounded border border-terminal-green/20">
                        <div className="text-xs text-terminal-green/80">
                          💡 By consistently investing ${monthlyAmount}.00 every month for {sim.results.years.toFixed(1)} years, 
                          your portfolio would have grown to <span className="text-terminal-amber font-bold">
                          ${sim.results.finalValue.toFixed(2)}</span>, a gain of{' '}
                          <span className="text-terminal-green font-bold">
                          ${(sim.results.finalValue - sim.results.totalInvested).toFixed(2)}</span>.
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Download Button */}
                <button className="terminal-button w-full py-3">
                  📥 Download Video (Coming Soon)
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center text-terminal-green/40 text-sm"
        >
          <p>⚠️ Past performance is not indicative of future results. This is for educational purposes only.</p>
        </motion.div>
      </div>
    </main>
  )
}
