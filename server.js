const express = require('express')

const app = express();
const server = require('http').Server(app);
const { v4: uuidV4 } = require('uuid')
const io = require("socket.io")(server);
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');

const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true,
})

// HERE
app.use(express.static('public'))
app.use("/public", express.static(__dirname + "/public"));
app.use("/peerjs", peerServer);


// Passport config
require('./routes/passport')(passport);

// EJS
app.set('view engine', 'ejs');

// Bodyparser
app.use(express.urlencoded({ extended: false }));

// Express Session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// handle errors when user tries to log in
app.use((req, res, next) => {
    res.locals.error = req.flash('error');
    next();
})

// ROUTER
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users.js'));
app.use('/', require('./routes/rooms.js'));
// curren user's name
//var user = '';

app.get('/:room', (req, res) => {
    console.log("roomID ", req.params.room)
    res.render('room.ejs', { roomId: req.params.room, name: user })
})

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId) => {
        // joing room and broadcating for other users
        socket.join(roomId);
        // new user has joined
        socket.to(roomId).broadcast.emit('user-connected', userId);
        
        // handle when user leaves
        socket.on('disconnect', ()=>{
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        });

        //handle chat messages
        socket.on('chatMessage', async (msg) => {
            let json = JSON.parse(msg);
            io.to(roomId).emit('message', json.message, json.name, json.time) // sending for the right room
        });

        // handle that user has raised their hand
        socket.on('raiseHand', async (msg) => {
            let json = JSON.parse(msg);
            let package = json.name.toUpperCase() + "&emsp;" + json.hand + "&emsp;&emsp;&emsp;" + json.time; // spaces between user and message
            io.to(roomId).emit('hand', package) // sending raised hand
        });

    })
})

// Running server
const port = process.env.PORT || 3000;
server.listen(port);
console.log(`Listening on ${port}.`)