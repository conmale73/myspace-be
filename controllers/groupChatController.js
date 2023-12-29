const GroupChat = require("../models/groupChatModel");
const Message = require("../models/messageModel");
const fs = require("fs");
const path = require("path");

// @desc    Create a new group chat
// @route   POST /api/groupChats
// @access  Public
exports.createGroupChat = async (req, res, next) => {
    try {
        const { group_id, members } = req.body;

        const defaultGroupChatThumbnailPath = path.join(
            __dirname,
            "..",
            "assets",
            "defaultGroupChatThumbnail.png"
        );

        const groupChatThumbnailBuffer = fs.readFileSync(
            defaultGroupChatThumbnailPath
        );
        const base64GroupChatThumbnail =
            groupChatThumbnailBuffer.toString("base64");

        const newGroupChat = new GroupChat({
            group_id,
            members,
            group_thumbnail: {
                files: [
                    {
                        dataURL: base64GroupChatThumbnail,
                        fileInfo: {
                            type: "image/png",
                            name: "defaultGroupChatThumbnail.png",
                            size: groupChatThumbnailBuffer.length,
                            lastModified: new Date().getTime(),
                        },
                    },
                ],
            },
        });

        const savedGroupChat = await newGroupChat.save();
        res.status(201).json(savedGroupChat);
    } catch (error) {
        next(error);
    }
};

// @desc    Get a group chat by id
// @route   GET /api/groupChats/:group_chat_id
// @access  Public
exports.getGroupChatByID = async (req, res, next) => {
    try {
        const { group_chat_id } = req.params;

        const groupChat = await GroupChat.findOne({ _id: group_chat_id });

        res.status(200).json({
            success: true,
            data: groupChat,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all group chats by user id
// @route   GET /api/groupChats/user/:user_id
// @access  Public
exports.getGroupChatsByUserID = async (req, res, next) => {
    try {
        const { user_id } = req.params;

        // Find group chats where members include user_id and group_id is not null
        const groupChats = await GroupChat.find({
            members: user_id,
            group_id: { $ne: null },
        });

        res.status(200).json({
            success: true,
            data: groupChats,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all chats by user id
// @route   GET /api/groupChats/all/:user_id
// @access  Public
exports.getAllChatsByUserID = async (req, res, next) => {
    try {
        const { user_id } = req.params;

        // Find group chats where members include user_id
        const groupChats = await GroupChat.find({
            members: user_id,
        });

        const groupChatIDs = groupChats.map((groupChat) => groupChat._id);

        res.status(200).json({
            success: true,
            data: groupChats,
        });
    } catch (error) {
        next(error);
    }
};
// @desc    Get all chats by user id that have messages in it
// @route   GET /api/groupChats/messages/:user_id
// @access  Public
exports.getAllChatsHaveMessagesByUserID = async (req, res, next) => {
    try {
        const { user_id } = req.params;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        // Find group chats where members include user_id
        const groupChats = await GroupChat.find({
            members: user_id,
        });

        const groupChatIDs = groupChats.map((groupChat) => groupChat._id);

        const chatsWithMessages = [];
        for (let i = 0; i < groupChatIDs.length; i++) {
            const messages = await Message.find({
                chat_id: groupChatIDs[i],
            });
            if (messages.length > 0) {
                chatsWithMessages.push(groupChatIDs[i]);
            }
        }

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

        const totalResults = await GroupChat.find({
            _id: chatsWithMessages,
        }).countDocuments();
        const totalPages = Math.ceil(totalResults / limit);

        const chats = await GroupChat.find({
            _id: chatsWithMessages,
        })
            .sort({ last_message_timeStamp: -1 })
            .skip(startIndex)
            .limit(limit);

        res.status(200).json({
            success: true,
            data: chats,
            unreadChatIDs: chatsWithUnreadMessages,
            page,
            totalPages,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all chats of a user that have unread messages
// @route   GET /api/groupChats/unread/:user_id
// @access  Public
exports.getAllChatsHaveUnreadMessagesByUserID = async (req, res, next) => {
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

        res.status(200).json({
            success: true,
            data: chatsWithUnreadMessages,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get group chat of two users. If it doesn't exist, create one.
// @route   GET /api/groupChats/two/
// @access  Public
exports.getGroupChatOfTwoUsers = async (req, res, next) => {
    try {
        const { members } = req.body;
        if (members.length != 2) {
            res.status(400).json({
                success: false,
                error: "Number of members must be 2",
            });
        } else {
            const groupChats = await GroupChat.findOne({
                members: { $all: members },
                group_id: null,
            });

            if (!groupChats) {
                const defaultGroupChatThumbnailPath = path.join(
                    __dirname,
                    "..",
                    "assets",
                    "defaultGroupChatThumbnail.png"
                );
                const groupChatThumbnailBuffer = fs.readFileSync(
                    defaultGroupChatThumbnailPath
                );
                const base64GroupChatThumbnail =
                    groupChatThumbnailBuffer.toString("base64");

                const newGroupChat = new GroupChat({
                    members,
                    group_thumbnail: {
                        files: [
                            {
                                dataURL: base64GroupChatThumbnail,
                                fileInfo: {
                                    type: "image/png",
                                    name: "defaultGroupChatThumbnail.png",
                                    size: groupChatThumbnailBuffer.length,
                                    lastModified: new Date().getTime(),
                                },
                            },
                        ],
                    },
                });
                const savedGroupChat = await newGroupChat.save();
                res.status(201).json(savedGroupChat);
            } else {
                res.status(200).json(groupChats);
            }
        }
    } catch (error) {
        next(error);
    }
};
