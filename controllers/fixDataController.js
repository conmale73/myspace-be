const User = require("../models/userModel");
const Message = require("../models/messageModel");
const GroupChat = require("../models/groupChatModel");
const Post = require("../models/postModel");
const Comment = require("../models/commentModel");
exports.fixSenderName = async (req, res, next) => {
    try {
        const messages = await Message.find();

        const users = await User.find();

        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            const user = users.find(
                (user) => user._id.toString() === message.sender_id.toString()
            );
            message.sender_name = user.username;
            await message.save();
        }
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

exports.fixPostTimeStamps = async (req, res, next) => {
    try {
        const posts = await Post.find();

        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            post.createAt = post.timeStamp;
            post.updateAt = post.timeStamp;
            await post.save();
        }
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

exports.fixPostCommentsCount = async (req, res, next) => {
    try {
        const posts = await Post.find();

        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            const comments = await Comment.find({ post_id: post._id });
            post.commentCount = comments.length;
            await post.save();
        }
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

exports.refreshPost = async (req, res, next) => {
    try {
        const posts = await Post.find();

        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            post.read = [{ user_id: post.user_id, timeStamp: post.createAt }];

            await post.save();
        }
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

exports.refreshComments = async (req, res, next) => {
    try {
        const comments = await Comment.find();

        for (let i = 0; i < comments.length; i++) {
            const comment = comments[i];
            if (comment.replyTo.user_id === undefined) {
                comment.replyTo.user_id = comment.creator.user_id;
                comment.replyTo.username = null;
                comment.replyTo.comment_id = null;
                comment.updateAt = Date.now();
            }

            await comment.save();
        }
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

exports.unreadAllMessages = async (req, res, next) => {
    try {
        const messages = await Message.find();

        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            message.read = [];
            await message.save();
        }
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
};
