const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = 0;

app.use(express.static(__dirname + '/public')); // Serve static files from 'public' directory

io.on('connection', (socket) => {
    console.log('A player connected:', socket.id);
    players++;

    // When we reach 4 players, start the game
    if (players === 4) {
        io.emit('startGame'); // Broadcast to all clients
    }

    socket.on('disconnect', () => {
        console.log('A player disconnected:', socket.id);
        players--;
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
