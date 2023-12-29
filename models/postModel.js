const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    user_id: {
        type: ObjectId,
        required: true,
    },
    content: {
        type: Object,
        required: true,

        text: {
            type: String,
        },
        files: [
            {
                dataURL: {
                    type: Buffer,
                },
                fileInfo: {
                    type: Object,
                },
            },
        ],
    },
    commentCount: {
        type: Number,
        default: 0,
    },
    likes: [
        {
            user_id: {
                type: ObjectId,
            },
            timeStamp: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    read: [
        {
            user_id: {
                type: ObjectId,
            },
            timeStamp: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    group_id: {
        type: ObjectId,
    },
    privacy: {
        type: String,
        required: true,
    },
    createAt: {
        type: Date,
        default: Date.now,
    },
    updateAt: {
        type: Date,
        default: Date.now,
    },
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
