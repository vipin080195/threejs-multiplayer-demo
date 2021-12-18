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
 * Setup Web Socket events
 */
io.on('connection', (socket) => {
    console.log(`User - ${socket.id} - connected`)

    socket.on('disconnect', () => {
        console.log(`User - ${socket.id} - disconnected`)
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