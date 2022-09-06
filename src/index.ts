import express from "express";
import http from 'http';
import cors from 'cors';
import { Server as IOServer } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new IOServer(server, { cors: { origin: '*' }});
const DEFAULT_PORT = 3000;
const PORT = process.env.port || DEFAULT_PORT;

app.use(cors);

io.on('connection', socket => {
    // get active or connected socket
    socket.emit('activeUsers');
    // get socket id of connected socket
    socket.emit('getId', socket.id);

    // when a chat event is emitted 
    socket.on('chat', (id, chat) => {
      console.log('chat received', JSON.stringify(id, chat))
      io.emit('sendChat', id, chat, socket.id);
    });

    // when a user changes their username
    socket.on('usernameChange', (username, socketid) => {
      socket.broadcast.emit('resetChat', username, socketid);
    });

    // when a user is Typing
    socket.on('userTyping', (socketid, type) => {
      socket.broadcast.emit('someoneTyping', socketid, type);
    });

    // get all connected sockets
    socket.on('activeUsers', () => {
      // gets all connected sockets
      const onlineUsers = io.engine.clientsCount;
      io.emit('countUsers', onlineUsers);
    });

    // when a socket gets disconnected
    socket.on('disconnect', () => {
      socket.broadcast.emit('disconnectNotification', socket.id);
      const onlineUsers = io.engine.clientsCount;
      socket.broadcast.emit('countUsers', onlineUsers);
    });
})

server.listen(PORT, () => {
    console.log(`Running application on port: ${ PORT }`)
})
