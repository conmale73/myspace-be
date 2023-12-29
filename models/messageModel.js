const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    chat_id: {
        type: ObjectId,
        required: true,
    },
    sender_id: {
        type: ObjectId,
        required: true,
    },
    sender_name: {
        type: String,
        required: true,
    },
    read: [
        {
            user_id: {
                type: ObjectId,
            },
            read_at: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    content: {
        type: String,
        required: true,
    },
    timeStamp: {
        type: Date,
        default: Date.now,
    },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
