const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    receiver_id: {
        type: ObjectId,
        required: true,
    },
    group_id: {
        type: ObjectId,
    },
    sender: {
        user_id: {
            type: ObjectId,
            required: true,
        },
        username: {
            type: String,
            required: true,
        },
        avatar: {},
    },

    content: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        required: true,
    },

    read: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
    },
    type: {
        type: String,
        required: true,
    },
    createAt: {
        type: Date,
        default: Date.now,
    },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
