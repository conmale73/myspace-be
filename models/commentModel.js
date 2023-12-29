const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    post_id: {
        type: ObjectId,
        required: true,
    },
    creator: {
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
    replyTo: {
        user_id: {
            type: ObjectId,
            required: true,
        },
        username: {
            type: String,
        },
        comment_id: {
            type: ObjectId || null,
        },
    },
    replyCount: {
        type: Number,
        default: 0,
    },
    content: {
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
    createAt: {
        type: Date,
        default: Date.now,
    },
    updateAt: {
        type: Date,
        default: Date.now,
    },
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
