const express = require('express')
const http = require('http')
const { Server } = require('socket.io')

const app = express()

const PORT = 3000

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
 * Central Database
 */
const userData = {}

/**
 * Setup Web Socket events
 * Communication protocol - JSON
 */
io.on('connection', function handleConnection (socket) {
    console.log(`User - ${socket.id} - connected`)
    console.log(`# of clients: ${io.engine.clientsCount}`)

    /**
     * Provide user their ID
     */
    socket.emit('setId', {
        id: socket.id
    })

    /**
     * Client initial setup completed
     * Record client information
     */
    socket.on('init', function handleInit(params) {
        userData[socket.id] = {
            model: params.model,
            x: params.x,
            y: params.y,
            z: params.z,
            h: params.h,
            pb: params.pb
        }
    })

    /**
     * Update information about user on client animate()
     */
    socket.on('update', function handleUpdate(params) {
        userData[socket.id] = {
            model: params.model,
            x: params.x,
            y: params.y,
            z: params.z,
            h: params.h,
            pb: params.pb
        }
    })

    /**
     * Notify users about a user disconnecting
     */
    socket.on('disconnect', function handleDisconnect() {
        console.log(`User - ${socket.id} - disconnected`)
        console.log(`# of clients: ${io.engine.clientsCount}`)

        /**
         * Clean up database
         */
        delete userData[socket.id]

        /**
         * Notify others
         */
        socket.broadcast.emit('deleteUser', {
            id: socket.id
        })
    })
})


/**
 * Setup controllers to handle requests
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

/**
 * Payload drop broadcast function - Every 40ms
 * Replace with a database serving fresh data periodically
 */
setInterval(function payloadDropBroadcaster() {
    // Payload to be broadcasted
    const payload = []

    Object.keys(userData).forEach((id) => {
        // Use 
        if (userData[id].model != undefined) {
            payload.push({
                id: id,
                ...userData[id]
            })
        }
    })

    /**
     * Dispatch payload
     */
    if (payload.length) {
        io.emit('payloadDrop', {
            payload: payload
        })
    }
}, 40)