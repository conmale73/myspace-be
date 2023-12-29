const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    creator_id: {
        type: ObjectId,
        required: true,
    },
    privacy: {
        type: String,
        required: true,
    },
    thumbnail: {},
    description: {
        type: String,
    },
    participants: [
        {
            type: ObjectId,
        },
    ],
    chat_id: [
        {
            type: ObjectId,
        },
    ],
    createAt: {
        type: Date,
        default: Date.now,
    },
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
