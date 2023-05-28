const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const port = 3000;

let rooms = [
  {
    name: "defaultRoom",
    creator: "Admin",
  },
];
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {
    console.log(data);
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send(rooms);
});

app.post("/add", (req, res) => {
  rooms.map((r) => {
    if (req.query.name === r.name) {
      res.send("room name cannot be created");
    }
  });
  let newRoom = {
    name: req.query.name,
    creator: req.query.creator,
  };
  rooms.push(newRoom);
  res.send(rooms);
});

server.listen(port, () => {
  console.log(`SERVER RUNNING on port ${port}`);
});
