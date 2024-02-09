import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routers/userRoutes.js";
import chatRoutes from "./routers/chatRoutes.js";
import messageRoutes from "./routers/messageRoutes.js";
import bodyParser from "body-parser";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";
import { Server } from "socket.io";
import path from "path";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json({ limit: "30mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

// app.get("/", (req, res) => {
//   res.send("API is running");
// });

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// --------Deployment---------

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

// --------Deployment---------

app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });
  socket.on("join chat", (room) => {
    socket.join(room);
  });
  socket.on("new message", (newMessageReceived) => {
    console.log(newMessageReceived);
    var chat = newMessageReceived.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });
  socket.on("typing", (room) => socket.broadcast.to(room).emit("typing", room));
  socket.on("stop typing", (room) =>
    socket.broadcast.to(room).emit("stop typing", room)
  );
  socket.on("leave room", (room, callback) => {
    socket.leave(room);
    console.log(`Socket ${socket.id} left room ${room}`);
    if (callback && typeof callback === "function") {
      callback("Left the room successfully");
    }
  });
  socket.off("setup", () => {
    console.log("User disconnected");
    socket.leave(userData._id);
  });
});
