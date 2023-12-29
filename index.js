require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const database = require("./config/database");
const errorHandler = require("./middlewares/errorHandler");

// Import routes
const songsRouter = require("./routes/songs");
const albumsRouter = require("./routes/albums");
const artistsRouter = require("./routes/artists");
const usersRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const CommentRoutes = require("./routes/comments");
const roomsRoutes = require("./routes/rooms");
const groupChatsRoutes = require("./routes/groupChats");
const groupsRoutes = require("./routes/groups");
const notificationsRoutes = require("./routes/notifications");
const messagesRoutes = require("./routes/messages");
const voiceChannelsRoutes = require("./routes/voiceChannels");
const playlistsRoutes = require("./routes/playlists");
const fixDataRoutes = require("./routes/fixData");

const morgan = require("morgan");
const http = require("http");

// Initialize Express app
const app = express();
const port = 3000;

// Connect to MongoDB
database.connect();

// Middlewares
app.use(morgan("dev"));
app.use(cors((origin = "http://localhost:5173"), (credentials = true)));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/songs", songsRouter);
app.use("/api/albums", albumsRouter);
app.use("/api/artists", artistsRouter);
app.use("/api/users", usersRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", CommentRoutes);
app.use("/api/rooms", roomsRoutes);
app.use("/api/groups", groupsRoutes);
app.use("/api/groupChats", groupChatsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/voiceChannels", voiceChannelsRoutes);
app.use("/api/playlists", playlistsRoutes);
app.use("/api/fixData", fixDataRoutes);

// Error Handler Middleware
app.use(errorHandler);

// Create an HTTP server and wrap it with Socket.IO
const server = http.createServer(app);

const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

let onlineUsers = [];
// Define Socket.IO logic here
io.on("connection", (socket) => {
    console.log(`connection ${socket.id} connected`);

    socket.on("addNewOnlineUser", (user_id) => {
        !onlineUsers.some((user) => user.user_id === user_id) &&
            onlineUsers.push({
                user_id: user_id,
                socket_id: socket.id,
            });
        console.log("onlineUsers: ", onlineUsers);
        io.emit("getOnlineUsers", onlineUsers);
    });
    socket.on("joinRoom", (room_id, user_id) => {
        socket.join(room_id);
        console.log(`user ${user_id} joined room ${room_id}`);
    });

    socket.on("joinChat", (user_id, chat_id) => {
        socket.join(chat_id);
        console.log(`user ${user_id} joined chat ${chat_id}`);
    });

    socket.on("sendMessage", (newMessage, user_id) => {
        socket.to(newMessage.chat_id).emit("receiveMessage", newMessage);
    });

    socket.on(
        "joinVoiceChannel",
        (voiceChannel_id, user_id, room_id, prevVoiceChannel_id) => {
            socket.leave(prevVoiceChannel_id);
            socket.join(voiceChannel_id);
            console.log(
                `user ${user_id} joined voice channel ${voiceChannel_id}`
            );
            const connectionsInRoom =
                io.sockets.adapter.rooms.get(voiceChannel_id);

            console.log(
                `connections in voice channel ${voiceChannel_id}: `,
                connectionsInRoom
            );
            socket
                .to(voiceChannel_id)
                .emit("receiveJoinVoiceChannel", voiceChannel_id);
            console.log(`send join event to ${voiceChannel_id}`);
            socket.to(room_id).emit("receiveJoinVoiceChannelRoom");

            console.log(`Current rooms for socket ${socket.id}:`, socket.rooms);
        }
    );

    socket.on("leaveVoiceChannel", (voiceChannel_id, user_id, room_id) => {
        socket.leave(voiceChannel_id);
        console.log(`user ${user_id} left voice channel ${voiceChannel_id}`);
        socket.to(voiceChannel_id).emit("receiveLeaveVoiceChannel");
        socket.to(room_id).emit("receiveLeaveVoiceChannelRoom", user_id);
        const connectionsInRoom = io.sockets.adapter.rooms.get(voiceChannel_id);
        console.log(
            `connections in voice channel ${voiceChannel_id}: `,
            connectionsInRoom
        );
        socket.leave(voiceChannel_id, (err) => {
            if (err) {
                console.error(
                    `Error leaving room ${voiceChannel_id}: ${err.message}`
                );
            } else {
                // After leaving the room, log the updated connections
                const connectionsInRoom =
                    io.sockets.adapter.rooms.get(voiceChannel_id);
                console.log(
                    `connectionssssssssss in voice channel ${voiceChannel_id}: `,
                    connectionsInRoom
                );
            }
        });
        console.log(`Current rooms for socket ${socket.id}:`, socket.rooms);
    });

    socket.on("deleteOnlineUser", (user_id) => {
        onlineUsers = onlineUsers.filter((user) => user.user_id !== user_id);
        console.log("onlineUsers: ", onlineUsers);
        socket.emit("getOnlineUsers", onlineUsers);
    });

    socket.on("disconnect", () => {
        console.log(`connection ${socket.id} disconnected`);
    });
});

// Start the server
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
