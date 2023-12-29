const Group = require("../models/groupModel");
const GroupChat = require("../models/groupChatModel");
const ErrorResponse = require("../utils/errorResponse");
const Notification = require("../models/notificationModel");

const fs = require("fs");
const path = require("path");
const { admin } = require("googleapis/build/src/apis/admin");
const User = require("../models/userModel");
const { ObjectId } = require("mongodb");

// @desc    Create a new group
// @route   POST /api/groups
// @access  Public
exports.createGroup = async (req, res, next) => {
    try {
        const {
            name,
            creator_id,
            privacy,
            description,
            requireVerify,
            visible,
        } = req.body;

        // Path to the default thumbnail image in the "assets" folder
        const defaultGroupThumbnailPath = path.join(
            __dirname,
            "..",
            "assets",
            "defaultGroupThumbnail.jpg"
        );

        // Read the default thumbnail image as a buffer
        const groupThumbnailBuffer = fs.readFileSync(defaultGroupThumbnailPath);
        const base64GroupThumbnail = groupThumbnailBuffer.toString("base64");

        const newGroup = new Group({
            name,
            creator_id,
            privacy,
            admins: [creator_id],
            members: [creator_id],
            requireVerify,
            visible,
            thumbnail: {
                files: [
                    {
                        dataURL: base64GroupThumbnail,
                        fileInfo: {
                            type: "image/jpg",
                            name: "defaultGroupThumbnail.jpg",
                            size: groupThumbnailBuffer.length,
                            lastModified: new Date().getTime(),
                        },
                    },
                ],
            },
            description,
        });

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
            group_id: newGroup._id,
            group_name: "Group Chat for " + name,
            group_thumbnail: {
                files: [
                    {
                        dataURL: base64GroupChatThumbnail,
                        fileInfo: {
                            type: "image/png",
                            name: "defaultGroupChatThumbnail.jpg",
                            size: groupChatThumbnailBuffer.length,
                            lastModified: new Date().getTime(),
                        },
                    },
                ],
            },
            members: [creator_id],
        });

        const savedGroup = await newGroup.save();
        const savedGroupChat = await newGroupChat.save();

        const updatedGroup = await Group.findOneAndUpdate(
            { _id: newGroup._id },
            { chat_id: savedGroupChat._id },
            { new: true }
        );

        res.status(201).json(updatedGroup);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all groups
// @route   GET /api/groups
// @access  Public
exports.getAllGroups = async (req, res, next) => {
    try {
        const groups = await Group.find();

        res.status(200).json({
            success: true,
            data: groups,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all public groups
// @route   GET /api/groups/public
// @access  Public
exports.getAllPublicGroups = async (req, res, next) => {
    try {
        const groups = await Group.find({ privacy: "PUBLIC" });

        const page = parseInt(req.query.page) || 1; // Current page
        const limit = parseInt(req.query.limit) || 10; // Number of posts per page

        const startIndex = (page - 1) * limit;

        const totalResults = await Group.find({
            privacy: "PUBLIC",
        }).countDocuments();

        const totalPages = Math.ceil(totalResults / limit);

        const publicGroups = await Group.find({ privacy: "PUBLIC" })
            .skip(startIndex)
            .limit(limit);

        res.status(200).json({
            success: true,
            data: publicGroups,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get admins info
// @route   GET /api/groups/admins/:group_id
// @access  Public
exports.getAdminsInfo = async (req, res, next) => {
    try {
        const { group_id } = req.params;

        const group = await Group.findById(group_id);

        const admins = group.admins;

        const adminsInfo = [];
        await Promise.all(
            admins.map(async (admin) => {
                const userInfo = await User.findById(admin);
                if (userInfo) {
                    const data = {
                        _id: userInfo._id,
                        email: userInfo.email,
                        username: userInfo.username,
                        avatar: userInfo.avatar,
                        musicType: userInfo.musicType,
                        description: userInfo.description,
                    };

                    adminsInfo.push(data);
                }
            })
        );

        res.status(200).json({
            success: true,
            data: adminsInfo,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all recommend groups that user is not a member of
// @route   GET /api/groups/recommend/:user_id
// @access  Public
exports.getRecommendGroups = async (req, res, next) => {
    try {
        const { user_id } = req.params;

        const page = parseInt(req.query.page) || 1; // Current page
        const limit = parseInt(req.query.limit) || 10; // Number of posts per page

        const startIndex = (page - 1) * limit;

        const totalResults = await Group.find({
            visible: true,
            members: { $ne: user_id },
        }).countDocuments();

        const totalPages = Math.ceil(totalResults / limit);

        const publicGroups = await Group.find({
            visible: true,
            members: { $ne: user_id },
        })
            .skip(startIndex)
            .limit(limit);

        res.status(200).json({
            success: true,
            data: publicGroups,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all groups by user id
// @route   GET /api/groups/user/:user_id
// @access  Public
exports.getGroupsByUserId = async (req, res, next) => {
    try {
        const { user_id } = req.params;

        const page = parseInt(req.query.page) || 1; // Current page
        const limit = parseInt(req.query.limit) || 10; // Number of posts per page

        const startIndex = (page - 1) * limit;

        const totalResults = await Group.find({
            members: user_id,
        }).countDocuments();

        const totalPages = Math.ceil(totalResults / limit);

        const groups = await Group.find({ members: user_id })
            .skip(startIndex)
            .limit(limit);

        res.status(200).json({
            success: true,
            data: groups,
            page,
            totalPages,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get group by id
// @route   GET /api/groups/:group_id
// @access  Public
exports.getGroupById = async (req, res, next) => {
    try {
        const { group_id } = req.params;
        const { user_id } = req.body;

        const group = await Group.findById(group_id);

        if (!group) {
            return next(
                new ErrorResponse(`Group with id ${group_id} not found`, 404)
            );
        }
        if (group.privacy === "PUBLIC") {
            res.status(200).json({
                success: true,
                data: group,
            });
        } else if (group.privacy === "PRIVATE") {
            if (group.visible == true) {
                res.status(200).json({
                    success: true,
                    data: group,
                });
            } else {
                if (group.members.includes(user_id)) {
                    res.status(200).json({
                        success: true,
                        data: group,
                    });
                } else {
                    const allowedData = {
                        _id: group._id,
                        name: group.name,
                        creator_id: group.creator_id,
                        admins: group.admins,
                        privacy: group.privacy,
                        thumbnail: group.thumbnail,
                        description: group.description,
                        requireVerify: group.requireVerify,
                        visible: group.visible,
                        pendingMembers: group.pendingMembers,
                        pendingRequests: group.pendingRequests,
                    };
                    res.status(200).json({
                        success: false,
                        data: allowedData,
                    });
                }
            }
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Request to join group
// @route   PUT /api/groups/request-join/:group_id
// @access  Public
exports.requestJoinGroup = async (req, res, next) => {
    try {
        const { group_id } = req.params;
        const { user_id } = req.body;

        const group = await Group.findById(group_id);
        const user = await User.findById(user_id);
        if (!group) {
            return next(
                new ErrorResponse(`Group with id ${group_id} not found`, 404)
            );
        }

        if (group.members.includes(user_id)) {
            return next(
                new ErrorResponse(
                    `User with id ${user_id} is already a member of group with id ${group_id}`,
                    400
                )
            );
        }

        if (group.requireVerify == true) {
            if (
                group.pendingRequests.some(
                    (request) => request.user_id.toString() == user_id
                )
            ) {
                return next(
                    new ErrorResponse(
                        `User with id ${user_id} has already sent a request to join group with id ${group_id}`,
                        400
                    )
                );
            }

            const notification = new Notification({
                type: "GROUP_REQUEST",
                sender: {
                    user_id: new ObjectId(user_id),
                    username: user.username,
                    avatar: user.avatar,
                },
                receiver_id: new ObjectId(group.creator_id),
                group_id: new ObjectId(group_id),
                status: "PENDING",
                content: `has requested to join group ${group.name}`,
                link: `/social/groups/${group_id}`,
            });

            const savedNotification = await notification.save(); // Await the save operation

            group.pendingRequests.push({
                user_id: new ObjectId(user_id),
                notification_id: savedNotification._id, // Now access _id property
            });

            const updatedGroup = await group.save();

            res.status(200).json({
                success: true,
                data: updatedGroup,
            });
        } else {
            const updatedGroup = await Group.findOneAndUpdate(
                { _id: group_id },
                { $addToSet: { members: user_id } }, // $addToSet prevents duplicate members
                { new: true }
            );

            res.status(200).json({
                success: true,
                data: updatedGroup,
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Cancel request to join group
// @route   PUT /api/groups/cancel-request-join/:group_id
// @access  Public
exports.cancelRequestJoinGroup = async (req, res, next) => {
    try {
        const { group_id } = req.params;
        const { user_id, notification_id } = req.body;

        const group = await Group.findById(group_id);
        const user = await User.findById(user_id);
        if (!group) {
            return next(
                new ErrorResponse(`Group with id ${group_id} not found`, 404)
            );
        }

        if (group.members.includes(user_id)) {
            return next(
                new ErrorResponse(
                    `User with id ${user_id} is already a member of group with id ${group_id}`,
                    400
                )
            );
        }

        if (
            !group.pendingRequests.some(
                (request) => request.user_id.toString() == user_id
            )
        ) {
            return next(
                new ErrorResponse(
                    `User with id ${user_id} has not sent a request to join group with id ${group_id}`,
                    400
                )
            );
        }

        const notification = await Notification.findOneAndDelete(
            { _id: notification_id },
            { new: true }
        );

        const updatedGroup = await Group.findOneAndUpdate(
            { _id: group_id },
            {
                $pull: {
                    pendingRequests: {
                        user_id: user_id,
                    },
                },
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            data: updatedGroup,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get pending requests to join group
// @route   PUT /api/groups/pending-requests/:group_id
// @access  Public
exports.getPendingRequestsToJoinGroup = async (req, res, next) => {
    try {
        const { group_id } = req.params;
        const { user_id } = req.body;

        const group = await Group.findById(group_id);

        const page = parseInt(req.query.page) || 1; // Current page
        const limit = parseInt(req.query.limit) || 10; // Number of posts per page

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        let resData = [];
        await Promise.all(
            group.pendingRequests.map(async (request) => {
                const userInfo = await User.findById(request.user_id);

                if (userInfo) {
                    const data = {
                        notification_id: request.notification_id,
                        _id: userInfo._id,
                        email: userInfo.email,
                        username: userInfo.username,
                        avatar: userInfo.avatar,
                        musicType: userInfo.musicType,
                        description: userInfo.description,
                    };

                    resData.push(data);
                }
            })
        );

        const totalResults = resData.length;

        const totalPages = Math.ceil(totalResults / limit);

        const pendingRequests = resData.slice(startIndex, endIndex);

        res.status(200).json({
            success: true,
            data: pendingRequests,
            page,
            totalPages,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Accept request to join group
// @route   PUT /api/groups/accept-request/:group_id
// @access  Public
exports.acceptRequestToJoinGroup = async (req, res, next) => {
    try {
        const { group_id } = req.params;
        const { user_id, sender_id, notification_id } = req.body;

        const group = await Group.findById(group_id);
        const user = await User.findById(user_id);

        if (!group) {
            return next(
                new ErrorResponse(`Group with id ${group_id} not found`, 404)
            );
        }

        if (group.members.includes(sender_id)) {
            return next(
                new ErrorResponse(
                    `User with id ${sender_id} is already a member of group with id ${group_id}`,
                    400
                )
            );
        }

        if (!group.admins.includes(user_id)) {
            return next(
                new ErrorResponse(
                    `User with id ${user_id} is not authorized to accept the request to join group with id ${group_id}`,
                    400
                )
            );
        }

        const updatedGroup = await Group.findOneAndUpdate(
            { _id: group_id },
            {
                $addToSet: { members: sender_id },
                $pull: {
                    pendingRequests: {
                        user_id: sender_id,
                    },
                },
            }, // $addToSet prevents duplicate members
            { new: true }
        );

        const notification = await Notification.findOneAndUpdate(
            {
                _id: notification_id,
            },
            { status: "ACCEPTED" },
            { new: true }
        );

        const newNotification = new Notification({
            type: "GROUP_ACCEPT",
            sender: {
                user_id: new ObjectId(user_id),
                username: user.username,
                avatar: user.avatar,
            },
            receiver_id: new ObjectId(sender_id),
            group_id: new ObjectId(group_id),
            status: "ACCEPTED",
            content: `has accepted your request to join group ${group.name}`,
            link: `/social/groups/${group_id}`,
        });

        res.status(200).json({
            success: true,
            data: updatedGroup,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Decline request to join group
// @route   PUT /api/groups/decline-request/:group_id
// @access  Public
exports.declineRequestToJoinGroup = async (req, res, next) => {
    try {
        const { group_id } = req.params;
        const { user_id, sender_id, notification_id } = req.body;

        const group = await Group.findById(group_id);

        if (!group) {
            return next(
                new ErrorResponse(`Group with id ${group_id} not found`, 404)
            );
        }

        if (group.members.includes(sender_id)) {
            return next(
                new ErrorResponse(
                    `User with id ${sender_id} is already a member of group with id ${group_id}`,
                    400
                )
            );
        }

        if (!group.admins.includes(user_id)) {
            return next(
                new ErrorResponse(
                    `User with id ${user_id} is not authorized to accept the request to join group with id ${group_id}`,
                    400
                )
            );
        }

        const updatedGroup = await Group.findOneAndUpdate(
            { _id: group_id },
            {
                $pull: {
                    pendingRequests: {
                        user_id: sender_id,
                    },
                },
            }, // $addToSet prevents duplicate members
            { new: true }
        );

        const notification = await Notification.findOneAndUpdate(
            {
                _id: notification_id,
            },
            { status: "DECLINED" },
            { new: true }
        );
        res.status(200).json({
            success: true,
            data: updatedGroup,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    invite user to group
// @route   PUT /api/groups/invite-user/:group_id
// @access  Public
exports.inviteUserToGroup = async (req, res, next) => {
    try {
        const { group_id } = req.params;
        const { user_id, friend_id } = req.body;

        const group = await Group.findById(group_id);
        const user = await User.findById(user_id);

        if (!group) {
            return next(
                new ErrorResponse(`Group with id ${group_id} not found`, 404)
            );
        }

        if (group.privacy == "PRIVATE") {
            if (group.members.includes(friend_id)) {
                return next(
                    new ErrorResponse(
                        `User with id ${friend_id} is already a member of group with id ${group_id}`,
                        400
                    )
                );
            } else {
                if (group.requireVerify == true) {
                    if (
                        group.pendingMembers.some(
                            (invitation) =>
                                invitation.sender_id.toString() == user_id &&
                                invitation.receiver_id.toString() == friend_id
                        )
                    ) {
                        return next(
                            new ErrorResponse(
                                `User with id ${friend_id} has already received an invitation to join group with id ${group_id} from user with id ${user_id}`,
                                400
                            )
                        );
                    }

                    const notification = new Notification({
                        type: "GROUP_INVITE",
                        sender: {
                            user_id: new ObjectId(user_id),
                            username: user.username,
                            avatar: user.avatar,
                        },
                        receiver_id: new ObjectId(friend_id),
                        status: "PENDING",
                        content: `has invited you to join group ${group.name}`,
                        link: `/social/groups/${group_id}`,
                    });

                    const savedNotification = await notification.save(); // Await the save operation

                    group.pendingMembers.push({
                        sender_id: new ObjectId(user_id),
                        receiver_id: new ObjectId(friend_id),
                        notification_id: savedNotification._id, // Now access _id property
                    });

                    await group.save();

                    res.status(200).json({
                        success: true,
                        data: group,
                    });
                }
            }
        } else if (group.privacy == "PUBLIC") {
            if (group.members.includes(friend_id)) {
                return next(
                    new ErrorResponse(
                        `User with id ${friend_id} is already a member of group with id ${group_id}`,
                        400
                    )
                );
            } else {
                if (
                    group.pendingMembers.some(
                        (invitation) =>
                            invitation.sender_id.toString() == user_id &&
                            invitation.receiver_id.toString() == friend_id
                    )
                ) {
                    return next(
                        new ErrorResponse(
                            `User with id ${friend_id} has already received an invitation to join group with id ${group_id} from user with id ${user_id}`,
                            400
                        )
                    );
                }

                //TODO: Send notification to user_id
                const notification = new Notification({
                    type: "GROUP_INVITE",
                    sender: {
                        user_id: new ObjectId(user_id),
                        username: user.username,
                        avatar: user.avatar,
                    },
                    receiver_id: new ObjectId(friend_id),
                    status: "PENDING",
                    content: `has invited you to join group ${group.name}`,
                    link: `/social/groups/${group_id}`,
                });
                const savedNotification = await notification.save();

                group.pendingMembers.push({
                    sender_id: new ObjectId(user_id),
                    receiver_id: new ObjectId(friend_id),
                    notification_id: savedNotification._id,
                });

                await group.save();
                res.status(200).json({
                    success: true,
                    data: group,
                });
            }
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Accept invitation to join group
// @route   PUT /api/groups/accept-invitation/:group_id
// @access  Public
exports.acceptInvitationToGroup = async (req, res, next) => {
    try {
        const { group_id } = req.params;
        const { user_id, notification_id } = req.body;

        const group = await Group.findById(group_id);

        const invitation = group.pendingMembers.find(
            (invitation) => invitation.receiver_id.toString() == user_id
        );
        if (!group) {
            return next(
                new ErrorResponse(`Group with id ${group_id} not found`, 404)
            );
        }

        if (group.members.includes(user_id)) {
            return next(
                new ErrorResponse(
                    `User with id ${user_id} is already a member of group with id ${group_id}`,
                    400
                )
            );
        }

        if (group.privacy == "PUBLIC") {
            const updatedGroup = await Group.findOneAndUpdate(
                { _id: group_id },
                {
                    $addToSet: { members: user_id },
                    $pull: {
                        pendingMembers: {
                            receiver_id: user_id,
                        },
                    },
                }, // $addToSet prevents duplicate members
                { new: true }
            );

            res.status(200).json({
                success: true,
                data: updatedGroup,
            });
        } else {
            if (
                group.admins.some(
                    (admin) =>
                        admin.toString() == invitation.sender_id.toString()
                ) ||
                group.creator_id.toString() == invitation.sender_id.toString()
            ) {
                const updatedGroup = await Group.findOneAndUpdate(
                    { _id: group_id },
                    {
                        $addToSet: { members: user_id },
                        $pull: {
                            pendingMembers: {
                                receiver_id: user_id,
                            },
                        },
                    }, // $addToSet prevents duplicate members
                    { new: true }
                );

                res.status(200).json({
                    success: true,
                    data: updatedGroup,
                });
            } else {
                if (group.requireVerify == false) {
                    const updatedGroup = await Group.findOneAndUpdate(
                        { _id: group_id },
                        {
                            $addToSet: { members: user_id },
                            $pull: {
                                pendingMembers: {
                                    receiver_id: user_id,
                                },
                            },
                        }, // $addToSet prevents duplicate members
                        { new: true }
                    );
                    res.status(200).json({
                        success: true,
                        data: updatedGroup,
                    });
                } else {
                    const updatedGroup = await Group.findOneAndUpdate(
                        { _id: group_id },
                        {
                            $push: {
                                pendingRequests: {
                                    user_id: user_id,
                                    notification_id: notification_id,
                                },
                            },
                            $pull: {
                                pendingMembers: {
                                    receiver_id: user_id,
                                },
                            },
                        }, // $addToSet prevents duplicate members
                        { new: true }
                    );
                    res.status(200).json({
                        success: true,
                        data: updatedGroup,
                    });
                }
            }
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Decline invitation to join group
// @route   PUT /api/groups/decline-invitation/:group_id
// @access  Public
exports.declineInvitationToGroup = async (req, res, next) => {
    try {
        const { group_id } = req.params;
        const { user_id, notification_id } = req.body;

        const group = await Group.findById(group_id);
        const user = await User.findById(user_id);

        if (!group) {
            return next(
                new ErrorResponse(`Group with id ${group_id} not found`, 404)
            );
        }

        if (
            !group.pendingMembers.some(
                (invitation) => invitation.receiver_id.toString() == user_id
            )
        ) {
            return next(
                new ErrorResponse(
                    `User with id ${user_id} has not received an invitation to join group with id ${group_id}`,
                    400
                )
            );
        }
        const notification = await Notification.findOneAndUpdate(
            {
                _id: notification_id,
            },
            { status: "DECLINED" },
            { new: true }
        );

        const updatedGroup = await Group.findOneAndUpdate(
            { _id: group_id },
            {
                $pull: {
                    pendingMembers: {
                        receiver_id: user_id,
                    },
                },
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            data: updatedGroup,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Set user as admin
// @route   PUT /api/groups/set-admin/:group_id
// @access  Public
exports.setUserAsAdmin = async (req, res, next) => {
    try {
        const { group_id } = req.params;
        const { setter_id, user_id } = req.body;

        const group = await Group.findById(group_id);

        if (!group) {
            return next(
                new ErrorResponse(`Group with id ${group_id} not found`, 404)
            );
        }

        if (!group.members.includes(user_id)) {
            return next(
                new ErrorResponse(
                    `User with id ${user_id} is not a member of group with id ${group_id}`,
                    400
                )
            );
        } else {
            if (group.creator_id != setter_id) {
                return next(
                    new ErrorResponse(
                        `User with id ${setter_id} is not authorized to set admins for group with id ${group_id}`,
                        401
                    )
                );
            }
            const updatedGroup = await Group.findOneAndUpdate(
                { _id: group_id },
                { $addToSet: { admins: user_id } }, // $addToSet prevents duplicate admins
                { new: true }
            );

            res.status(200).json({
                success: true,
                data: updatedGroup,
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Remove user as admin
// @route   PUT /api/groups/remove-admin/:group_id
// @access  Public
exports.removeUserAsAdmin = async (req, res, next) => {
    try {
        const { group_id } = req.params;
        const { setter_id, user_id } = req.body;

        const group = await Group.findById(group_id);

        if (!group) {
            return next(
                new ErrorResponse(`Group with id ${group_id} not found`, 404)
            );
        }

        if (!group.members.includes(user_id)) {
            return next(
                new ErrorResponse(
                    `User with id ${user_id} is not a member of group with id ${group_id}`,
                    400
                )
            );
        } else {
            if (group.creator_id != setter_id) {
                return next(
                    new ErrorResponse(
                        `User with id ${setter_id} is not authorized to remove admins for group with id ${group_id}`,
                        401
                    )
                );
            }
            const updatedGroup = await Group.findOneAndUpdate(
                { _id: group_id },
                { $pull: { admins: user_id } },
                { new: true }
            );

            res.status(200).json({
                success: true,
                data: updatedGroup,
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Remove user from group
// @route   PUT /api/groups/remove-user/:group_id
// @access  Public
exports.removeUserFromGroup = async (req, res, next) => {
    try {
        const { group_id } = req.params;
        const { setter_id, user_id } = req.body;

        const group = await Group.findById(group_id);

        if (!group) {
            return next(
                new ErrorResponse(`Group with id ${group_id} not found`, 404)
            );
        }

        if (!group.members.includes(user_id)) {
            return next(
                new ErrorResponse(
                    `User with id ${user_id} is not a member of group with id ${group_id}`,
                    400
                )
            );
        } else {
            if (group.creator_id != setter_id) {
                return next(
                    new ErrorResponse(
                        `User with id ${setter_id} is not authorized to remove users from group with id ${group_id}`,
                        401
                    )
                );
            }
            const updatedGroup = await Group.findOneAndUpdate(
                { _id: group_id },
                { $pull: { members: user_id, admins: user_id } },
                { new: true }
            );

            res.status(200).json({
                success: true,
                data: updatedGroup,
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Join PUBLIC group
// @route   PUT /api/groups/join/:group_id
// @access  Public
exports.joinPublicGroup = async (req, res, next) => {
    try {
        const { group_id } = req.params;
        const { user_id } = req.body;

        const group = await Group.findById(group_id);

        if (!group) {
            return next(
                new ErrorResponse(`Group with id ${group_id} not found`, 404)
            );
        }

        if (group.privacy != "PUBLIC") {
            return next(
                new ErrorResponse(
                    `Group with id ${group_id} is not a PUBLIC group`,
                    400
                )
            );
        }

        if (group.members.includes(user_id)) {
            return next(
                new ErrorResponse(
                    `User with id ${user_id} is already a member of group with id ${group_id}`,
                    400
                )
            );
        } else {
            const updatedGroup = await Group.findOneAndUpdate(
                { _id: group_id },
                { $addToSet: { members: user_id } }, // $addToSet prevents duplicate members
                { new: true }
            );

            res.status(200).json({
                success: true,
                data: updatedGroup,
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Leave group
// @route   PUT /api/groups/leave/:group_id
// @access  Public
exports.leaveGroup = async (req, res, next) => {
    try {
        const { group_id } = req.params;
        const { user_id } = req.body;

        const group = await Group.findById(group_id);

        if (!group) {
            return next(
                new ErrorResponse(`Group with id ${group_id} not found`, 404)
            );
        }

        if (!group.members.includes(user_id)) {
            return next(
                new ErrorResponse(
                    `User with id ${user_id} is not a member of group with id ${group_id}`,
                    400
                )
            );
        } else {
            const updatedGroup = await Group.findOneAndUpdate(
                { _id: group_id },
                { $pull: { members: user_id, admins: user_id } },
                { new: true }
            );

            res.status(200).json({
                success: true,
                data: updatedGroup,
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update group thumbnail by id
// @route   PATCH /api/groups/thumbnail/:group_id
// @access  Public
exports.updateGroupThumbnailById = async (req, res, next) => {
    try {
        const { group_id } = req.params;
        const { user_id, files } = req.body;

        const group = await Group.findById(group_id);

        if (!group) {
            return next(
                new ErrorResponse(`Group with id ${group_id} not found`, 404)
            );
        }

        if (group.creator_id != user_id) {
            return next(
                new ErrorResponse(
                    `User with id ${user_id} is not authorized to update thumbnail of group with id ${group_id}`,
                    401
                )
            );
        }

        const updatedGroup = await Group.findOneAndUpdate(
            { _id: group_id },
            { thumbnail: { files } },
            { new: true }
        );

        res.status(200).json({
            success: true,
            data: updatedGroup,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update group by id
// @route   PATCH /api/groups/:group_id
// @access  Public
exports.updateGroupById = async (req, res, next) => {
    try {
        const { group_id } = req.params;
        const { user_id, name, privacy, description } = req.body;

        const group = await Group.findById(group_id);

        if (!group) {
            return next(
                new ErrorResponse(`Group with id ${group_id} not found`, 404)
            );
        }

        if (group.creator_id != user_id) {
            return next(
                new ErrorResponse(
                    `User with id ${user_id} is not authorized to update group with id ${group_id}`,
                    401
                )
            );
        }

        const updatedGroup = await Group.findOneAndUpdate(
            { _id: group_id },
            { name, privacy, description },
            { new: true }
        );

        res.status(200).json({
            success: true,
            data: updatedGroup,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete group by id
// @route   DELETE /api/groups/:group_id
// @access  Public
exports.deleteGroupById = async (req, res, next) => {
    try {
        const { group_id } = req.params;
        const { user_id } = req.body;

        const group = await Group.findById(group_id);

        if (!group) {
            return next(
                new ErrorResponse(`Group with id ${group_id} not found`, 404)
            );
        }

        if (group.creator_id != user_id) {
            return next(
                new ErrorResponse(
                    `User with id ${user_id} is not authorized to delete group with id ${group_id}`,
                    401
                )
            );
        }

        await Group.findByIdAndDelete(group_id);

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (error) {
        next(error);
    }
};

// @desc  Search for groups by name
// @route GET /api/groups/search/:group_name
// @access Public
exports.searchGroupsByName = async (req, res, next) => {
    try {
        const { group_name } = req.params;

        const groups = await Group.find({
            name: { $regex: group_name, $options: "i" },
            visible: true,
        });

        res.status(200).json({
            success: true,
            data: groups,
        });
    } catch (error) {
        next(error);
    }
};

// @desc  Search for groups by name
// @route GET /api/groups/search/:group_name
// @access Public
exports.getSearchRecommend = async (req, res, next) => {
    try {
        const { group_name } = req.params;

        const groups = await Group.find({
            name: { $regex: group_name, $options: "i" },
            visible: true,
        });
        // return only group names and ids
        const allowedData = groups.map((group) => {
            return {
                _id: group._id,
                name: group.name,
            };
        });

        res.status(200).json({
            success: true,
            data: allowedData,
        });
    } catch (error) {
        next(error);
    }
};

// @desc  Search for groups by name that user is a member of
// @route GET /api/groups/search/:group_name/:user_id
// @access Public
exports.searchGroupsByNameAndUserId = async (req, res, next) => {
    try {
        const { group_name, user_id } = req.params;

        const groups = await Group.find({
            name: { $regex: group_name, $options: "i" },
            members: user_id,
        });

        res.status(200).json({
            success: true,
            data: groups,
        });
    } catch (error) {
        next(error);
    }
};

// @desc Search members of a group by name
// @route GET /api/groups/:group_id/search-members/:member_name
// @access Public
exports.searchMembersOfGroupByName = async (req, res, next) => {
    try {
        const { group_id, member_name } = req.params;

        const group = await Group.findById(group_id);

        if (!group) {
            return next(
                new ErrorResponse(`Group with id ${group_id} not found`, 404)
            );
        }

        const members = await User.find({
            _id: { $in: group.members },
            username: { $regex: new RegExp(member_name, "i") },
        });

        res.status(200).json({
            success: true,
            data: members,
        });
    } catch (error) {
        next(error);
    }
};
