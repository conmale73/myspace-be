const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    creator_id: {
        type: ObjectId,
        required: true,
    },
    admins: [
        {
            type: ObjectId,
        },
    ],
    privacy: {
        type: String,
        required: true,
    },
    visible: {
        type: Boolean,
        default: true,
    },
    requireVerify: {
        type: Boolean,
        default: false,
    },
    thumbnail: {},
    description: {
        type: String,
    },
    members: [
        {
            type: ObjectId,
        },
    ],
    pendingMembers: [
        {
            sender_id: {
                type: ObjectId,
            },
            receiver_id: {
                type: ObjectId,
            },
            notification_id: {
                type: ObjectId,
            },
        },
    ],
    pendingRequests: [
        {
            user_id: {
                type: ObjectId,
            },
            notification_id: {
                type: ObjectId,
            },
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
    updateAt: {
        type: Date,
        default: Date.now,
    },
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
