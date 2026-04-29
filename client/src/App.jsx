import {useCallback, useState } from 'react'
import Canvas from './components/Canvas'
import Toolbar from './components/Toolbar'
import ColorPicker from './components/ColorPicker'
import './App.css'

function App() {
  const [pixels, setPixels] = useState({})
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [tool, setTool] = useState('draw')
  const [users, setUsers] = useState(1)
  
  const updatePixel = useCallback((x, y, color) => {
    setPixels(prev => ({ ...prev, [`${x}, ${y}`]: color}))
  }, [])

  const clearCanvas = () => setPixels({})

  return (
    <div className='min-h-screen bg-taupe-900 text-white flex flex-col items-center justify-center gap-4 p-6 font-mono'>
      <div className='flex items-center gap-4'>
        <h1 className='text-2xl font-bold tracking-widest text-rose-300'>
          PixelArtCollab
        </h1>
        <span className='text-xs bg-taupe-700 px-2 py-1 rounded-full text-zinc-400'>
          🟢 {users} conectado{users !== 1 ? 's' : ''}
        </span>
      </div>

      <Canvas
        pixels={pixels}
        selectedColor={selectedColor}
        tool={tool}
        updatePixel={updatePixel}
        setUsers={setUsers}
      />

      <div className='flex items-center gap-6 bg-zinc-900 border border-zinc-700 rounded-xl px-6 py-4'>
        <ColorPicker color={selectedColor} onChange={setSelectedColor} />
        <div className='w-px h-10 bg-zinc-700'/>
        <Toolbar tool={tool} setTool={setTool} onClear={clearCanvas} />
      </div>
    </div>
  )

}

export default App
