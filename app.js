const express=require('express');
const app = express();
const path=require("path");

const http=require("http");

const socketio=require("socket.io");
const server=http.createServer(app);
const io=socketio(server);

app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));

let connectedUsers = {}; // Store connected users and their socket IDs

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Listen for location data from a client
    socket.on('send-location', (data) => {
        io.emit('receive-location', { id: socket.id, ...data });
    });

    // Handle user disconnection
    socket.on('disconnect', function(){
        console.log('User disconnected:', socket.id);
        io.emit('user-disconnected', socket.id); // Notify clients to remove the user's marker
    });
});

app.get("/",(req,res)=>{
    res.render('index');
});

server.listen(3000);
