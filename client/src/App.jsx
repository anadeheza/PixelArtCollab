import {useCallback, useEffect, useRef, useState } from 'react'
import { useSocket } from './hooks/useSocket'
import Chat from './components/Chat'
import Canvas from './components/Canvas'
import Toolbar from './components/Toolbar'
import ColorPicker from './components/ColorPicker'
import './App.css'

function NameModal({onSubmit}) {
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {inputRef.current?.focus()}, [])

  const handleSubmit = () => {
    const name = value.trim()
    if(!name) return
    onSubmit(name)
  }

  const handleKey = (e) => {
    if(e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl px-8 py-8 flex flex-col gap-5 w-80 shadow-2xl">
        <div>
          <h2 className="text-xl font-bold text-rose-300 tracking-widest mb-1">Welcome</h2>
          <p className="text-zinc-400 text-sm">Choose a display name to join the canvas.</p>
        </div>
        <input
          ref={inputRef}
          type="text"
          maxLength={24}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Your name..."
          className="bg-zinc-800 text-white text-sm rounded-lg px-4 py-2.5 outline-none border border-zinc-700 focus:border-rose-400 transition-colors placeholder:text-zinc-600"
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim()}
          className="bg-rose-400 hover:bg-rose-300 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold py-2 rounded-lg transition-colors"
        >
          Join
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const [pixels, setPixels] = useState({})
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [tool, setTool] = useState('draw')
  const [users, setUsers] = useState(1)
  const [username, setUsername] = useState(null)
  
  const updatePixel = useCallback((x, y, color) => {
    setPixels(prev => ({ ...prev, [`${x},${y}`]: color}))
  }, [])

  const { emitPixel, socket } = useSocket(
    ({ x, y, color }) => updatePixel(x, y, color),
    (state) => {
      Object.entries(state).forEach(([key, color]) => {
        const [x, y] = key.split(',').map(Number)
        updatePixel(x, y, color)
      })
    },
    setUsers
  )

  const handleNameSubmit = (name) => {
    setUsername(name)
    socket.current?.emit('user:setName', name)
  }

  const clearCanvas = () => setPixels({})  

  return (
    <div className='min-h-screen bg-taupe-900 text-white flex flex-col items-center justify-center gap-4 p-6 font-mono'>
      {!username && <NameModal onSubmit={handleNameSubmit} />}
 
      <div className='flex items-center gap-4'>
        <h1 className='text-2xl font-bold tracking-widest text-rose-300'>
          PixelArtCollab
        </h1>
        <span className='text-xs bg-taupe-700 px-2 py-1 rounded-full text-zinc-400'>
          ● {users} connected{users !== 1 ? '' : ''}
        </span>
        {username && (
          <span className='text-xs text-zinc-500'>
            as <span className='text-rose-300'>{username}</span>
          </span>
        )}
      </div>
 
      <Canvas
        pixels={pixels}
        selectedColor={selectedColor}
        tool={tool}
        updatePixel={updatePixel}
        emitPixel={emitPixel}
      />
 
      <div className='flex items-center gap-6 bg-zinc-900 border border-zinc-700 rounded-xl px-6 py-4'>
        <ColorPicker color={selectedColor} onChange={setSelectedColor} />
        <div className='w-px h-10 bg-zinc-700' />
        <Toolbar tool={tool} setTool={setTool} onClear={clearCanvas} />
      </div>
 
      <Chat socket={socket.current} />
    </div>
  )
}

