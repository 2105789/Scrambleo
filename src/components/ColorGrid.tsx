'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { io, Socket } from 'socket.io-client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const ROWS = 100000
const COLUMNS = 10000
const CELL_SIZE = 15

interface CellProps {
  x: number
  y: number
  color: string
  isHighlighted: boolean
  onClick: (x: number, y: number) => void
  onHover: (x: number, y: number, color: string) => void
}

const Cell: React.FC<CellProps> = React.memo(({ x, y, color, isHighlighted, onClick, onHover }) => (
  <div
    style={{
      position: 'absolute',
      left: x * CELL_SIZE,
      top: y * CELL_SIZE,
      width: CELL_SIZE,
      height: CELL_SIZE,
      backgroundColor: color,
      border: isHighlighted ? '2px solid #ff0000' : '1px solid rgb(240, 240, 240)',
      boxShadow: isHighlighted ? '0 0 10px #ff0000' : 'none',
    }}
    onClick={() => onClick(x, y)}
    onMouseEnter={() => onHover(x, y, color)}
  />
))

Cell.displayName = 'Cell'

export default function ColorGrid() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [grid, setGrid] = useState<{ [key: string]: string }>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const [viewportWidth, setViewportWidth] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)
  const [jumpToCell, setJumpToCell] = useState('')
  const [highlightedCell, setHighlightedCell] = useState<[number, number] | null>(null)
  const [hoveredCell, setHoveredCell] = useState<{ x: number, y: number, color: string } | null>(null)

  useEffect(() => {
    const socketInitializer = async () => {
      await fetch('/api/socketio')
      const newSocket = io()

      newSocket.on('connect', () => {
        console.log('Connected to Socket.IO server')
      })

      newSocket.on('initialData', (data: { [key: string]: string }) => {
        setGrid(data)
      })

      newSocket.on('colorChange', ({ x, y, color }) => {
        setGrid((prevGrid) => ({ ...prevGrid, [`${x}:${y}`]: color }))
      })

      setSocket(newSocket)
    }

    socketInitializer()

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    const updateViewport = () => {
      if (containerRef.current) {
        setViewportWidth(containerRef.current.clientWidth)
        setViewportHeight(containerRef.current.clientHeight)
      }
    }

    updateViewport()
    window.addEventListener('resize', updateViewport)

    return () => {
      window.removeEventListener('resize', updateViewport)
    }
  }, [])

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollLeft(containerRef.current.scrollLeft)
      setScrollTop(containerRef.current.scrollTop)
    }
  }, [])

  const handleCellClick = useCallback((x: number, y: number) => {
    const newColor = `#${Math.floor(Math.random()*16777215).toString(16)}`
    setGrid((prevGrid) => ({ ...prevGrid, [`${x}:${y}`]: newColor }))
    socket?.emit('colorChange', { x, y, color: newColor })
  }, [socket])

  const handleCellHover = useCallback((x: number, y: number, color: string) => {
    setHoveredCell({ x, y, color })
  }, [])

  const visibleCells = useMemo(() => {
    const cells = []
    const startX = Math.floor(scrollLeft / CELL_SIZE)
    const startY = Math.floor(scrollTop / CELL_SIZE)
    const endX = Math.min(startX + Math.ceil(viewportWidth / CELL_SIZE) + 1, COLUMNS)
    const endY = Math.min(startY + Math.ceil(viewportHeight / CELL_SIZE) + 1, ROWS)

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const key = `${x}:${y}`
        cells.push(
          <Cell
            key={key}
            x={x}
            y={y}
            color={grid[key] || '#FFFFFF'}
            isHighlighted={highlightedCell?.[0] === x && highlightedCell?.[1] === y}
            onClick={handleCellClick}
            onHover={handleCellHover}
          />
        )
      }
    }
    return cells
  }, [scrollLeft, scrollTop, viewportWidth, viewportHeight, grid, handleCellClick, highlightedCell, handleCellHover])

  const handleJumpToCell = useCallback(() => {
    const [rowStr, colStr] = jumpToCell.split(',')
    const row = parseInt(rowStr, 10) - 1 
    const col = parseInt(colStr, 10) - 1 

    if (isNaN(row) || isNaN(col) || row < 0 || row >= ROWS || col < 0 || col >= COLUMNS) {
      alert('Invalid cell coordinates. Please enter row,column (e.g., 1,1)')
      return
    }

    if (containerRef.current) {
      containerRef.current.scrollTo({
        left: col * CELL_SIZE,
        top: row * CELL_SIZE,
        behavior: 'smooth'
      })
    }

    setHighlightedCell([col, row])
    setTimeout(() => setHighlightedCell(null), 3000) // Remove highlight after 3 seconds
  }, [jumpToCell])

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen bg-gray-100">
        <div className="bg-white shadow-sm p-4">
          <h1 className="text-3xl font-bold text-gray-800">Scrambleo: Paint A Billion Cells</h1>
          <p className="text-gray-600">Click on cells to change their colors</p>
        </div>
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={containerRef}
            className="absolute inset-0 overflow-auto"
            onScroll={handleScroll}
          >
            <div style={{ width: COLUMNS * CELL_SIZE, height: ROWS * CELL_SIZE, position: 'relative' }}>
              {visibleCells}
            </div>
          </div>
          {hoveredCell && (
            <div className="absolute bottom-4 right-4 bg-white p-2 rounded-md shadow-md">
              Row: {hoveredCell.y + 1}, Column: {hoveredCell.x + 1}, Color: {hoveredCell.color}
            </div>
          )}
        </div>
        <div className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Row,Column"
              value={jumpToCell}
              onChange={(e) => setJumpToCell(e.target.value)}
              className="w-40"
            />
            <Button onClick={handleJumpToCell} size="sm">
              <ArrowRight className="w-4 h-4 mr-2" />
              Jump
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-600">
              Total: {ROWS.toLocaleString()} rows x {COLUMNS.toLocaleString()} columns
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-5 h-5 text-gray-400 cursor-help" aria-label="Usage information" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Click on a cell to change its color. Hover over a cell to see its details.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}