const User = require("../models/userModel");
const Notification = require("../models/notificationModel");
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

// Create a user
exports.createUser = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Path to the default avatar in the "assets" folder
        const defaultAvatarPath = path.join(
            __dirname,
            "..",
            "assets",
            "defaultUserAvatar.png"
        );
        const defaultBackgroundPath = path.join(
            __dirname,
            "..",
            "assets",
            "defaultUserBackground.png"
        );
        // Read the default thumbnail image as a buffer
        const avatarBuffer = fs.readFileSync(defaultAvatarPath);
        const base64Avatar = avatarBuffer.toString("base64");

        const backgroundBuffer = fs.readFileSync(defaultBackgroundPath);
        const base64Background = backgroundBuffer.toString("base64");

        // Check if the email is already registered
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "Email is already in use" });
        }

        // Create a new user
        const newUser = new User({
            username,
            email,
            password,
            friendList: [new ObjectId("64a572c866ab977f9fc0bdd7")],
            background: {
                files: [
                    {
                        dataURL: base64Background,
                        fileInfo: {
                            type: "image/png",
                            name: "defaultUserBackground.png",
                            size: backgroundBuffer.length,
                            lastModified: new Date().getTime(),
                        },
                    },
                ],
            },
            avatar: {
                files: [
                    {
                        dataURL: base64Avatar,
                        fileInfo: {
                            type: "image/png",
                            name: "defaultUserAvatar.png",
                            size: avatarBuffer.length,
                            lastModified: new Date().getTime(),
                        },
                    },
                ],
            },
        });

        // Save the user to the database
        const userToResponse = await newUser.save();

        // res.status(201).json({ message: "User created successfully" });
        res.status(201).json({ success: true, data: userToResponse });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
// Get all users
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};

// Get a single user
exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            throw new ErrorResponse("User not found", 404);
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};
// Get a single user by email
exports.getUserByEmail = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) {
            throw new ErrorResponse("User not found", 404);
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// Update user password
exports.updateUserPassword = async (req, res, next) => {
    try {
        const { user_id, password, newPassword } = req.body;

        // Find the user by id
        const user = await User.findById(user_id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compare the entered password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
    }
};

// Update a user info
exports.updateUserInfo = async (req, res, next) => {
    try {
        const { user_id, username, description, musicType, birthday, phone } =
            req.body;

        const user = User.findById(user_id);

        if (!user) {
            return next(new ErrorResponse(`User not found`, 404));
        }

        const updateUser = await User.findByIdAndUpdate(
            user_id,
            {
                username,
                description,
                musicType,
                birthday,
                phone,
            },
            { new: true }
        );

        res.status(200).json({ success: true, data: updateUser });
    } catch (error) {
        next(error);
    }
};

//Update a user avatar
exports.updateUserAvatar = async (req, res, next) => {
    try {
        const { user_id, avatar } = req.body;

        const user = User.findById(user_id);

        if (!user) {
            return next(new ErrorResponse(`User not found`, 404));
        }
        // Create an array to hold the files with binary data
        const filesForResponse = [];
        for (const file of avatar.files) {
            // Convert the base64 data to a binary Buffer
            const base64Data = file.dataURL.split(",")[1];

            // Create an object with the binary data and other file info

            const fileForResponse = {
                dataURL: base64Data,
                fileInfo: file.fileInfo,
            };

            filesForResponse.push(fileForResponse);
        }

        // Update the avatar with the files containing binary data
        avatar.files = filesForResponse;

        const updateUser = await User.findByIdAndUpdate(
            user_id,
            {
                avatar,
            },
            { new: true }
        );
        res.status(200).json({ success: true, data: updateUser });
    } catch (error) {
        next(error);
    }
};

//Update a user background
exports.updateUserBackground = async (req, res, next) => {
    try {
        const { user_id, background } = req.body;

        const user = User.findById(user_id);

        if (!user) {
            return next(new ErrorResponse(`User not found`, 404));
        }

        const updateUser = await User.findByIdAndUpdate(
            user_id,
            {
                background,
            },
            { new: true }
        );
        res.status(200).json({ success: true, data: updateUser });
    } catch (error) {
        next(error);
    }
};

// Delete a user
exports.deleteUser = async (req, res, next) => {
    try {
        const { user_id } = req.body;
        const user = await User.findByIdAndDelete(user_id);
        if (!user) {
            throw new ErrorResponse("User not found", 404);
        }
        res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

// Login user
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compare the entered password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

        // Send the token as a response
        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Logout user
exports.logout = async (req, res, next) => {
    try {
        // Clear user token
        req.user.tokens = [];

        await req.user.save();

        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
};

// @desc    Search users by username
// @route   GET /api/users/search/:username
// @access  Public
exports.searchUsersByUsername = async (req, res, next) => {
    try {
        const username = req.params.username;

        // Validate and sanitize input
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if (page < 1 || limit < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid page or limit value.",
            });
        }

        const startIndex = (page - 1) * limit;

        const users = await User.find(
            { username: { $regex: new RegExp(username, "i") } },
            { _id: 1 }
        )
            .skip(startIndex)
            .limit(limit);

        const totalResults = await User.countDocuments({
            username: { $regex: new RegExp(username, "i") },
        });

        const totalPages = Math.ceil(totalResults / limit);

        const usersToResponse = [];

        // Use Promise.all to wait for all user promises to resolve
        await Promise.all(
            users.map(async (user) => {
                const userToResponse = await User.findById(user._id).lean();

                const data = {
                    _id: userToResponse._id,
                    email: userToResponse.email,
                    username: userToResponse.username,
                    avatar: userToResponse.avatar,
                    description: userToResponse.description,
                    musicType: userToResponse.musicType,
                    friendList: userToResponse.friendList,
                    friendRequest: userToResponse.friendRequest,
                    friendRequestSent: userToResponse.friendRequestSent,
                };

                usersToResponse.push(data);
            })
        );

        res.status(200).json({
            success: true,
            data: usersToResponse,
            page,
            limit,
            totalResults,
            totalPages,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

// @desc  Add a friend
// @route POST /api/users/addFriend
// @access Public
exports.addFriend = async (req, res, next) => {
    try {
        const { user_id, friend_id } = req.body;

        // Check if the user is already friends with the friend
        const user = await User.findById(user_id);
        const friend = await User.findById(friend_id);

        if (!user || !friend) {
            return res.status(404).json({
                success: false,
                message: "User or friend not found",
            });
        }

        if (user.friendList.includes(friend_id)) {
            return res.status(400).json({
                success: false,
                message: "You are already friends with this user",
            });
        }
        if (user.friendRequestSent.includes({ user_id: friend_id })) {
            return res.status(400).json({
                success: false,
                message: "You have already sent a friend request to this user",
            });
        }
        // Create a notification
        const notification = new Notification({
            receiver_id: new ObjectId(friend_id),
            sender: {
                user_id: new ObjectId(user_id),
                username: user.username,
                avatar: user.avatar,
            },
            type: "FRIEND_REQUEST",
            content: `sent you a friend request`,
            link: `/profile/${user_id}`,
            status: "PENDING",
        });

        const savedNotification = await notification.save();
        // Add the friend to the user's friend list
        user.friendRequestSent.push({
            user_id: friend_id,
            notification_id: savedNotification._id,
        });
        friend.friendRequest.push({
            user_id: user_id,
            notification_id: savedNotification._id,
        });

        await user.save();
        const response = await friend.save();

        res.status(200).json({
            success: true,
            data: response,
            message: "Friend request sent successfully",
        });
    } catch (error) {
        next(error);
    }
};

// @desc  Accept a friend request
// @route POST /api/users/acceptFriendRequest
// @access Public
exports.acceptFriendRequest = async (req, res, next) => {
    try {
        const { user_id, friend_id, notification_id } = req.body;

        // Check if the user is already friends with the friend
        const user = await User.findById(user_id);
        const friend = await User.findById(friend_id);

        if (!user || !friend) {
            return res.status(404).json({
                success: false,
                message: "User or friend not found",
            });
        }

        if (
            !user.friendRequest.some(
                (request) => request.user_id.toString() === friend_id
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "You have not received any friend request from this user",
            });
        }
        await Notification.findByIdAndUpdate(
            notification_id,
            {
                status: "ACCEPTED",
            },
            {
                new: true,
            }
        );
        // Add the friend to the user's friend list
        user.friendList.push(friend_id);
        friend.friendList.push(user_id);

        // Remove the friend request
        user.friendRequest = user.friendRequest.filter(
            (friend) => friend.user_id.toString() !== friend_id
        );
        friend.friendRequest = friend.friendRequestSent.filter(
            (friend) => friend.user_id.toString() !== user_id
        );

        user.friendRequestSent = user.friendRequestSent.filter(
            (friend) => friend.user_id.toString() !== friend_id
        );
        friend.friendRequestSent = friend.friendRequestSent.filter(
            (friend) => friend.user_id.toString() !== user_id
        );

        await user.save();
        const response = await friend.save();

        // Create a notification
        const notification = new Notification({
            receiver_id: new ObjectId(friend_id),
            sender: {
                user_id: new ObjectId(user_id),
                username: user.username,
                avatar: user.avatar,
            },
            type: "FRIEND_REQUEST_ACCEPTED",
            content: `accepted your friend request`,

            link: `/profile/${user_id}`,
        });

        await notification.save();

        res.status(200).json({
            success: true,
            data: response,
            message: "Friend request accepted successfully",
        });
    } catch (error) {
        next(error);
    }
};

// @desc  Cancel a friend request
// @route POST /api/users/cancelFriendRequest
// @access Public
exports.cancelFriendRequest = async (req, res, next) => {
    try {
        const { user_id, friend_id, notification_id } = req.body;

        // Check if the user is already friends with the friend
        const user = await User.findById(user_id);
        const friend = await User.findById(friend_id);

        if (!user || !friend) {
            return res.status(404).json({
                success: false,
                message: "User or friend not found",
            });
        }

        if (
            !user.friendRequestSent.some(
                (request) => request.user_id.toString() === friend_id
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "You have not sent any friend request to this user",
            });
        }

        await Notification.findByIdAndDelete(notification_id);

        // Remove the friend request
        user.friendRequestSent = user.friendRequestSent.filter(
            (request) => request.user_id.toString() !== friend_id
        );
        friend.friendRequest = friend.friendRequest.filter(
            (request) => request.user_id.toString() !== user_id
        );

        await user.save();
        const response = await friend.save();

        res.status(200).json({
            success: true,
            data: response,
            message: "Friend request cancel successfully",
        });
    } catch (error) {
        next(error);
    }
};

// @desc  Decline a friend request
// @route POST /api/users/declineFriendRequest
// @access Public
exports.declineFriendRequest = async (req, res, next) => {
    try {
        const { user_id, friend_id, notification_id } = req.body;

        // Check if the user is already friends with the friend
        const user = await User.findById(user_id);
        const friend = await User.findById(friend_id);

        if (!user || !friend) {
            return res.status(404).json({
                success: false,
                message: "User or friend not found",
            });
        }

        if (
            !user.friendRequest.some(
                (request) => request.user_id.toString() === friend_id
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "You have not received any friend request from this user",
            });
        }

        await Notification.findByIdAndDelete(notification_id);
        // Remove the friend request
        user.friendRequest = user.friendRequest.filter(
            (friend) => friend.user_id.toString() !== friend_id
        );
        friend.friendRequestSent = friend.friendRequestSent.filter(
            (friend) => friend.user_id.toString() !== user_id
        );

        await user.save();
        const response = await friend.save();

        res.status(200).json({
            success: true,
            data: response,
            message: "Friend request declined successfully",
        });
    } catch (error) {
        next(error);
    }
};

// @desc  Remove a friend
// @route POST /api/users/removeFriend
// @access Public
exports.removeFriend = async (req, res, next) => {
    try {
        const { user_id, friend_id } = req.body;

        // Check if the user is already friends with the friend
        const user = await User.findById(user_id);
        const friend = await User.findById(friend_id);

        if (!user || !friend) {
            return res.status(404).json({
                success: false,
                message: "User or friend not found",
            });
        }

        if (!user.friendList.includes(friend_id)) {
            return res.status(400).json({
                success: false,
                message: "You are not friends with this user",
            });
        }

        // Remove the friend
        user.friendList = user.friendList.filter(
            (friend) => friend.toString() !== friend_id
        );
        friend.friendList = friend.friendList.filter(
            (friend) => friend.toString() !== user_id
        );

        await user.save();
        const response = await friend.save();

        res.status(200).json({
            success: true,
            data: response,
            message: "Friend removed successfully",
        });
    } catch (error) {
        next(error);
    }
};

// @desc  Get friendList
// @route GET /api/users/friendList/:user_id
// @access Public
exports.getFriendList = async (req, res, next) => {
    try {
        const { user_id } = req.params;

        const user = await User.findById(user_id).lean();

        let friends = [];

        if (user.friendList.length > 0) {
            await Promise.all(
                user.friendList.map(async (user) => {
                    const userToResponse = await User.findById(user._id).lean();

                    const data = {
                        _id: userToResponse._id,
                        email: userToResponse.email,
                        username: userToResponse.username,
                        avatar: userToResponse.avatar,
                        description: userToResponse.description,
                        musicType: userToResponse.musicType,
                        friendList: userToResponse.friendList,
                        friendRequest: userToResponse.friendRequest,
                        friendRequestSent: userToResponse.friendRequestSent,
                    };

                    friends.push(data);
                })
            );
        }

        const page = parseInt(req.query.page) || 1; // Current page
        const limit = parseInt(req.query.limit) || 10; // Number of posts per page

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const totalResults = friends.length;
        const totalPages = Math.ceil(totalResults / limit);

        const friendsToResponse = friends.slice(startIndex, endIndex);

        res.status(200).json({
            success: true,
            data: friendsToResponse,
            page,
            totalPages,
        });
    } catch (error) {
        next(error);
    }
};

// @desc  Get friend requests
// @route GET /api/users/friendRequests/:user_id
// @access Public
exports.getFriendRequests = async (req, res, next) => {
    try {
        const { user_id } = req.params;

        const user = await User.findById(user_id).lean();

        let friendRequests = [];

        if (user.friendRequest.length > 0) {
            await Promise.all(
                user.friendRequest.map(async (user) => {
                    const userToResponse = await User.findById(
                        user.user_id
                    ).lean();

                    const data = {
                        _id: userToResponse._id,
                        email: userToResponse.email,
                        username: userToResponse.username,
                        avatar: userToResponse.avatar,
                        description: userToResponse.description,
                        musicType: userToResponse.musicType,
                        friendList: userToResponse.friendList,
                        friendRequest: userToResponse.friendRequest,
                        friendRequestSent: userToResponse.friendRequestSent,
                    };

                    friendRequests.push(data);
                })
            );
        }

        const page = parseInt(req.query.page) || 1; // Current page
        const limit = parseInt(req.query.limit) || 10; // Number of posts per page

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const totalResults = friendRequests.length;
        const totalPages = Math.ceil(totalResults / limit);

        const friendRequestsToResponse = friendRequests.slice(
            startIndex,
            endIndex
        );

        res.status(200).json({
            success: true,
            data: friendRequestsToResponse,
            page,
            totalPages,
        });
    } catch (error) {
        next(error);
    }
};

// @desc Search friends by username
// @route GET /api/users/searchFriends/:user_id/:username
// @access Public
exports.searchFriendsByUsername = async (req, res, next) => {
    const { user_id, username } = req.params;

    const user = await User.findById(user_id).lean();

    const page = parseInt(req.query.page) || 1; // Current page
    const limit = parseInt(req.query.limit) || 10; // Number of posts per page

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const totalResults = user.friendList.length;
    const totalPages = Math.ceil(totalResults / limit);

    const friendList = user.friendList;

    const friendListInfo = [];
    // Use Promise.all to wait for all friendInfo promises to resolve
    await Promise.all(
        friendList.map(async (friend) => {
            const friendInfo = await User.findById(friend);

            if (friendInfo) {
                const friendInfoToPush = {
                    _id: friendInfo._id,
                    email: friendInfo.email,
                    username: friendInfo.username,
                    avatar: friendInfo.avatar,
                    description: friendInfo.description,
                    musicType: friendInfo.musicType,
                    friendList: friendInfo.friendList,
                    friendRequest: friendInfo.friendRequest,
                };
                friendListInfo.push(friendInfoToPush);
            }
        })
    );

    // Filter the friend list by username
    const filteredFriendList = friendListInfo.filter((friend) =>
        friend.username.toLowerCase().includes(username.toLowerCase())
    );

    const filteredFriendListToResponse = filteredFriendList.slice(
        startIndex,
        endIndex
    );

    res.status(200).json({
        success: true,
        data: filteredFriendListToResponse,
        page,
        totalPages,
    });
};

// @desc Get mutual friends
// @route GET /api/users/mutualFriends/:user_id/:friend_id
// @access Public
exports.getMutualFriends = async (req, res, next) => {
    try {
        const { friend_id, user_id } = req.params;

        const user = await User.findById(user_id);
        const friend = await User.findById(friend_id);

        if (!user || !friend) {
            return res.status(404).json({
                success: false,
                message: "User or friend not found",
            });
        }

        const mutualFriends = user.friendList.filter((friendId) =>
            friend.friendList.includes(friendId)
        );

        const mutualFriendsInfo = [];
        // Use Promise.all to wait for all friendInfo promises to resolve

        await Promise.all(
            mutualFriends.map(async (friend) => {
                const friendInfo = await User.findById(friend);

                if (friendInfo) {
                    const friendInfoToPush = {
                        _id: friendInfo._id,
                        email: friendInfo.email,
                        username: friendInfo.username,
                        avatar: friendInfo.avatar,
                        description: friendInfo.description,
                        musicType: friendInfo.musicType,
                        friendList: friendInfo.friendList,
                        friendRequest: friendInfo.friendRequest,
                    };
                    mutualFriendsInfo.push(friendInfoToPush);
                }
            })
        );

        const page = parseInt(req.query.page) || 1; // Current page
        const limit = parseInt(req.query.limit) || 10; // Number of posts per page

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const totalResults = mutualFriendsInfo.length;
        const totalPages = Math.ceil(totalResults / limit);

        const mutualFriendsInfoToResponse = mutualFriendsInfo.slice(
            startIndex,
            endIndex
        );

        res.status(200).json({
            success: true,
            data: mutualFriendsInfoToResponse,
            page,
            totalPages,
            totalResults,
        });
    } catch (error) {
        next(error);
    }
};
