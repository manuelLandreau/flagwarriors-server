// Setup basic express server
const Express = require('express')
const Http = require('http')
const SocketIO = require('socket.io')
const BodyParser = require('body-parser')
const Cors = require('cors')
// const MainRouter = require('./MainRouter');

const app = Express()

// launching the server
const port = process.env.PORT || 9000
const server = Http.createServer(app)

server.listen(port, () => {
  const {address} = server.address()
  console.log(`App listening at http://${address}:${port}`)
})

app.use(Cors())
app.use(BodyParser.urlencoded({extended: true}))
app.use(BodyParser.json())

// First routing steps
// app.use(MainRouter);

// Socket.io
const io = SocketIO(server)
let gameId = 0
let flag = true

io.on('connection', (socket) => {
  console.log(socket.id)

  socket.on('avalable_player', (player) => {
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

  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    // socket.broadcast.to(data.gameId).emit('disconnect');
  })
})

// module.exports = app;
