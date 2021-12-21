const express = require('express')
const http = require('http')
const { Server } = require('socket.io')

const app = express()

const PORT = 3000

/**
 * Utilities
 */
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}

function getRandomColor() {
    return `rgb(${getRandomNumber(0, 255)}, ${getRandomNumber(0, 255)}, ${getRandomNumber(0, 255)})`
}

const server = http.createServer(app)
const io = new Server(server)
/**
 * Setup templating engine
 */
app.set('views', __dirname + '/views')
app.engine('.html', require('ejs').__express)
app.set('view engine', 'ejs')


/**
 * Add middleware to serve static assets
 */
app.use('/', express.static(__dirname + '/dist'))

/**
 * Dummy Central Database
 */
const users = {}

/**
 * Setup Web Socket events
 */
io.on('connection', function handleConnection (socket) {
    console.log(`User - ${socket.id} - connected`)
    console.log(`# of clients: ${io.engine.clientsCount}`)

    /**
     * Assign co-ordinates to new user
     */
    users[socket.id] = {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        color: getRandomColor()
    }

    /**
     * Notify new user about other users
     */
    socket.emit('renderOtherUsers', socket.id, users)

    /**
     * Notify other users about new user
     */
    socket.broadcast.emit('renderNewUser', socket.id, users)

    socket.on('disconnect', function handleDisconnect() {
        console.log(`User - ${socket.id} - disconnected`)
        console.log(`# of clients: ${io.engine.clientsCount}`)

        /**
         * Clean up database
         */
        delete users[socket.id]

        /**
         * Notify other users
         */
        socket.broadcast.emit('userLeaving', socket.id)
    })
})


/**
 * Setup controllers
 */
app.get('/', (req, res) => {
    res.render('index.html')
})

/**
 * Listen for requests
 */
 server.listen(PORT, () => {
    console.log(`Listening on Port: ${PORT}`)
})