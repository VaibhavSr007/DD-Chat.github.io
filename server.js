const http = require('http')
const express = require('express')
const path = require('path')
const app = express()

const server = http.createServer(app)
const port = process.env.PORT || 3000 // port provided by host, if not provided any use 3000

app.use(express.static(path.join(__dirname, '/public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
})

// socket.io setup
const io = require('socket.io')(server);

var  users = {};  // to store socket_id or user_id and username in object format


io.on("connection", (socket)=>{ // wehn a user/socket connects/comes to the chat
        socket.on("new-user-joined",(username)=>{ // when any user/socket calls an event (new-user-joined) than we call back the written function. {this is recieved from client js socket.emit}
            users[socket.id] = username; // here {in user_id: username} in this format userdata is stored
            // console.log(users);
            socket.broadcast.emit('user-connected',username) // this helps to broadcast the info. that new-user named username has joined to all the other people in chat except the user itself
                                                             // here we send an event named user-connected and username in the broadcast
            io.emit("user-list",users); // update the users list whenver a new user connects userlist named event will be called and emit is used to show this to all sockets/users
        });

        socket.on("disconnect",()=>{
            socket.broadcast.emit('user-disconnected', user=users[socket.id]);
            delete users[socket.id];
            io.emit("user-list",users);
        })

        socket.on('message',(data)=>{  // whn an event named message is called than we sent this data to all the sockets
            socket.broadcast.emit("message", data)
        })
});


server.listen(port, () => {
    console.log(`Example app listening http://localhost:${port}`)
});