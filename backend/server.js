const express = require("express");
const dotenv = require("dotenv");
const { chats } = require("./data/data");
const connectDB = require("./config/db");
const colors = require("colors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");

dotenv.config();

connectDB();
const app = express();

app.use(express.json()); // to accept JSON Data

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// -------------- Deployment --------------

const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is Running Successfully");
  });
}

// -------------- Deployment --------------

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () =>
  console.log(`Server is running on port ${PORT}`.yellow.bold)
);

// Socket.io Implementation
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("connected to socket.io");

  let currentRoom = null;

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log(`User ${userData._id} is online`);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    if (currentRoom) {
      socket.leave(currentRoom);
      console.log(`User left room: ${room}`);
    }
    socket.join(room);
    currentRoom = room;
    console.log(`User joined room: ${room}`);
  });

  socket.on("typing", (room, userData) => {
    socket.in(room).emit("typing", userData);
  });
  socket.on("stop typing", (room, userData) =>
    socket.in(room).emit("stop typing", userData)
  );

  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });
});
