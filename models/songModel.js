const mongoose = require("mongoose");

const songSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    artist: [
        {
            name: {
                type: String,
                required: true,
            },
            id: {
                type: String,
                required: true,
            },
        },
    ],
    lyrics: {
        type: String,
        required: false,
    },
    thumbnails: [
        {
            url: {
                type: String,
                required: true,
            },
            width: {
                type: Number,
                required: true,
            },
            height: {
                type: Number,
                required: true,
            },
        },
    ],
    genre: [
        {
            type: String,
            required: true,
        },
    ],
    likes: {
        type: Number,
        default: 0,
    },
    createAt: {
        type: Date,
        default: Date.now,
    },
    updateAt: {
        type: Date,
        default: Date.now,
    },
    // Additional properties...
});

const Song = mongoose.model("Song", songSchema);

module.exports = Song;
