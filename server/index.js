import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { randomUUID } from 'crypto'


const app = express()
app.use(cors())

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'https://anadeheza.github.io'],
    methods: ['GET', 'POST']
  }

})

let canvasState = {}
const userNames = {}

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id)
  userNames[socket.id] = socket.id.slice(0, 5)

  socket.emit('canvas:init', canvasState)
  io.emit('users:count', io.engine.clientsCount)

  socket.on('user:setName', (name) => {
    const trimmed = String(name).trim().slice(0, 24)
    userNames[socket.id] = trimmed || socket.id.slice(0, 5)
  })

  socket.on('chat:message', (text) => {
    const msg = {
      id: randomUUID(),
      userId: userNames[socket.id],
      text,
      self: false,
    }
    socket.broadcast.emit('chat:message', msg)
    socket.emit('chat:message', {...msg, self:true})
  })

  socket.on('chat:delete', (id) => {
    io.emit('chat:delete', id)
  })

  socket.on('pixel:draw', ({ x, y, color }) => {
    canvasState[`${x},${y}`] = color
    socket.broadcast.emit('pixel:draw', { x, y, color })
  })

  socket.on('disconnect', () => {
    delete userNames[socket.id]
    const remaining = io.engine.clientsCount
    if(!remaining) canvasState = {}

    io.emit('users:count', remaining)
    console.log('Usuario desconectado:', socket.id)
  })

  socket.on('canvas:fill', (color) => {
    for (let x = 0; x < 60; x++) {
      for (let y = 0; y < 32; i++) {
        canvasState[`${x},${y}`] = color
      }
    }
    socket.broadcast.emit('canvas:fill', color)
  })

  socket.on('canvas:clear', () => {
    canvasState = {}
    socket.broadcast.emit('canvas:clear')
  })
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => console.log(`Server on port ${PORT}`))