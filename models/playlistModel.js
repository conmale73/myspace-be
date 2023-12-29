const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    creator: {
        _id: {
            type: ObjectId,
            required: true,
        },
        username: {
            type: String,
            required: true,
        },
        avatar: {},
    },
    saved: [
        {
            type: ObjectId,
        },
    ],
    songs: [],
    description: {
        type: String,
    },
    createAt: {
        type: Date,
        default: Date.now,
    },
    updateAt: {
        type: Date,
        default: Date.now,
    },
    privacy: {
        type: String,
        default: "PUBLIC",
        required: true,
    },
});

const Playlist = mongoose.model("Playlist", playlistSchema);

module.exports = Playlist;
