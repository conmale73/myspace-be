const Message = require("../models/messageModel");
const GroupChat = require("../models/groupChatModel");
const { ObjectId } = require("mongodb");

// @desc    Create a new message
// @route   POST /api/messages
// @access  Public
exports.createMessage = async (req, res, next) => {
    try {
        const { chat_id, sender_id, sender_name, content } = req.body;

        const newMessage = new Message({
            chat_id,
            sender_id,
            sender_name,
            read: [{ user_id: sender_id }],
            content,
        });

        const savedMessage = await newMessage.save();

        const groupChat = await GroupChat.findOneAndUpdate(
            { _id: chat_id },
            {
                last_message: savedMessage,
                last_message_timeStamp: savedMessage.timeStamp,
            },
            { new: true }
        );
        res.status(201).json(savedMessage);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all messages by chat id
// @route   GET /api/messages/chat/:chat_id
// @access  Public
exports.getMessagesByChatID = async (req, res, next) => {
    try {
        const { chat_id } = req.params;

        const page = parseInt(req.query.page) || 1; // Current page
        const limit = parseInt(req.query.limit) || 10; // Number of posts per page

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const totalPosts = await Message.countDocuments({ chat_id });
        const totalPages = Math.ceil(totalPosts / limit);

        const messages = await Message.find({ chat_id })
            .sort({ timeStamp: -1 })
            .skip(startIndex)
            .limit(limit);

        res.status(200).json({
            success: true,
            data: messages,
            page,
            totalPages,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get last message by chat id
// @route   GET /api/messages/last/:chat_id
// @access  Public

exports.getLastMessageByChatID = async (req, res, next) => {
    try {
        const { chat_id } = req.params;

        const lastMessage = await Message.findOne({ chat_id }).sort({
            timeStamp: -1,
        });

        res.status(200).json({
            success: true,
            data: lastMessage,
        });
    } catch (error) {
        next(error);
    }
};

// @desc  Read all messages of a chat
// @route PUT /api/messages/readAll/:chat_id
// @access Public
exports.readAllMessageOfAChat = async (req, res, next) => {
    try {
        const { chat_id } = req.params;
        const { user_id } = req.body;

        const chat = await GroupChat.findOne({ _id: chat_id });

        if (!chat.members.includes(user_id)) {
            return next({
                message: "You are not a member of this chat",
                statusCode: 400,
            });
        }

        const messages = await Message.updateMany(
            { chat_id, "read.user_id": { $ne: user_id } }, // Check if user_id is not already in the read array
            {
                $addToSet: {
                    read: {
                        user_id,
                    },
                },
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            data: messages.modifiedCount,
        });
    } catch (error) {
        next(error);
    }
};

// @desc  Get all unread messages of a chat
// @route GET /api/messages/unread/:chat_id/:user_id
// @access Public
exports.getUnreadMessagesOfAChat = async (req, res, next) => {
    try {
        const { chat_id, user_id } = req.params;

        const messages = await Message.find({
            chat_id,
            read: { $not: { $elemMatch: { user_id } } },
        });

        res.status(200).json({
            success: true,
            data: messages,
        });
    } catch (error) {
        next(error);
    }
};

// @desc  Count unread messages of a chat
// @route PUT /api/messages/countUnread/:chat_id/:user_id
// @access Public
exports.countUnreadMessagesOfChats = async (req, res, next) => {
    try {
        const { user_id } = req.params;

        // Find group chats where members include user_id
        const groupChats = await GroupChat.find({
            members: user_id,
        });

        const groupChatIDs = groupChats.map((groupChat) => groupChat._id);

        const chatsWithUnreadMessages = [];
        for (let i = 0; i < groupChatIDs.length; i++) {
            const unreadMessages = await Message.find({
                chat_id: groupChatIDs[i],
                read: { $not: { $elemMatch: { user_id } } },
            });
            if (unreadMessages.length > 0) {
                chatsWithUnreadMessages.push(groupChatIDs[i]);
            }
        }

        let unreadCount = 0;
        for (let i = 0; i < chatsWithUnreadMessages.length; i++) {
            const messages = await Message.find({
                chat_id: chatsWithUnreadMessages[i],
                read: { $not: { $elemMatch: { user_id } } },
            });
            unreadCount += messages.length;
        }

        res.status(200).json({
            success: true,
            data: unreadCount,
            highlightChats: chatsWithUnreadMessages,
            chats: groupChatIDs,
        });
    } catch (error) {
        next(error);
    }
};
