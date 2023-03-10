import express from 'express'
import http from 'http'
import createGame from './public/game.js'
import {Server} from 'socket.io'

const app = express()
const server = http.createServer(app)
const sockets = new Server(server)

app.use(express.static('public'))

const game = createGame();
game.start(2000)
game.updateState(500)

game.subscribe((command) => {
    sockets.emit(command.type, command)
})

sockets.on('connection', (socket) => {
    const playerId = socket.id

    game.addPlayer({playerId: playerId});

    socket.emit('setup', game.state)

    socket.on('disconnect', () => {
        game.removePlayer({playerId: playerId})
    })

    socket.on('move-player', (command) => {
        command.playerId = playerId
        command.type = 'move-player'
        game.movePlayer(command)
    })

    socket.on('add-nickname', (command) => {
        const player = game.state.players[playerId];
        game.addNickname(command.playerId, command.nickName);
        player.color = command.color
    })

    socket.on('remove-all-fruits', () => {
        game.removeAllFruits()
    })

    socket.on('add-fruit', (command) => {
        game.addFruit({fruitX: command.fruitX, fruitY: command.fruitY})
    })
})

server.listen(3000, () => {
    console.log(`>> Server listening on port: http://localhost:3000`)
})