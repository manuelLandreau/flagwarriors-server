// Setup basic express server
const Express = require('express')
const Http = require('http')
const SocketIO = require('socket.io')

const app = Express()

// launching the server
const port = process.env.PORT || 9000
const server = Http.createServer(app)

server.listen(port, () => {
  const {address} = server.address()
  console.log(`App listening at http://${address}:${port}`)
})

// Socket.io
const io = SocketIO(server)

let gameId = 0
let flag = true
const games = []

io.on('connection', socket => {
  console.log(socket.id)

  // Create game systemq
  socket.on('created_game', gameName => {
    if (games[gameName] === undefined) {
      games[gameName] = true
      console.log('waiting for a game')
      socket.join(gameName)
      socket.emit('game_id', {for: socket.id, gameId: gameName, gameOn: false})
    } else {
      socket.emit('game_exists', {for: socket.id});
    }
    console.log(games)
  })

  // Join game system
  socket.on('join_game', gameName => {
    if (games[gameName]) {
      delete games[gameName]
      console.log('game on !')
      socket.join(gameName)
      socket.emit('game_id', {for: socket.id, gameId: gameName, gameOn: true})
      socket.broadcast.to(gameName).emit('game_on')
    } else {
      socket.emit('game_not_exists', {for: socket.id});
    }
  })

  socket.on('avalable_player', () => {
    if (flag) {
      console.log('waiting for a game')
      socket.join(gameId)
      socket.emit('game_id', {for: socket.id, gameId, gameOn: false})
      flag = !flag
    } else {
      console.log('game on !')
      socket.join(gameId)
      socket.emit('game_id', {for: socket.id, gameId, gameOn: true})
      socket.broadcast.to(gameId).emit('game_on')
      flag = !flag
      gameId++
    }
  })

  // Chat system
  socket.on('ally_message', ({gameId, message}) => socket.to(gameId).emit('ennemy_message', message))

  socket.on('ready', data => socket.broadcast.to(data.gameId).emit('ready', data))

  socket.on('game_on_last', data => socket.broadcast.to(data.gameId).emit('game_on_last'))

  socket.on('walls', data => socket.broadcast.to(data.gameId).emit('walls', data))

  socket.on('is_moving', data => socket.broadcast.to(data.gameId).emit('is_moving', data))

  socket.on('attack', data => socket.broadcast.to(data.gameId).emit('attack', data))

  socket.on('got_flag', data => socket.broadcast.to(data.gameId).emit('got_flag', data))

  socket.on('we_have_a_winner', data => socket.broadcast.to(data.gameId).emit('we_have_a_winner'))

  socket.on('we_have_a_looser', data => socket.broadcast.to(data.gameId).emit('we_have_a_winner'))

  socket.on('death', data => socket.broadcast.to(data.gameId).emit('death', data))

  socket.on('disconnect', () => {
    // socket.broadcast.to(data.gameId).emit('disconnect');
  })
})

