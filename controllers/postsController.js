const Post = require("../models/postModel");
const Comment = require("../models/commentModel");
const express = require("express");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/userModel");
const Group = require("../models/groupModel");
const { ObjectId } = require("mongodb");

// @desc    Add a new post
// @route   POST /api/posts
// @access  Public
exports.post = async (req, res, next) => {
    try {
        const { user_id, content, privacy, group_id } = req.body;

        // Create an array to hold the files with binary data
        const filesForResponse = [];
        for (const file of content.files) {
            // Convert the base64 data to a binary Buffer
            const base64Data = file.dataURL.split(",")[1];

            // Create an object with the binary data and other file info

            const fileForResponse = {
                dataURL: base64Data,
                fileInfo: file.fileInfo,
            };

            filesForResponse.push(fileForResponse);
        }

        // Update the content with the files containing binary data
        content.files = filesForResponse;

        const newPost = new Post({ user_id, content, privacy, group_id });

        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (error) {
        next(error);
    }
};

// @desc    Get post by id
// @route   PUT /api/posts/:post_id
exports.getPostById = async (req, res, next) => {
    try {
        const { post_id } = req.params;
        const { user_id, group_id } = req.body;

        const post = await Post.findById(post_id);

        if (!post) {
            return next(
                new ErrorResponse(`Post with id ${post_id} not found`, 404)
            );
        }

        let authorized = false;

        switch (post.privacy) {
            case "PUBLIC":
                authorized = true;
                break;
            case "FRIEND":
                if (post.user_id.toString() === user_id) {
                    authorized = true;
                } else {
                    const user = await User.findById(post.user_id);
                    const friendList = user.friendList;
                    const friendIDs = friendList.map((friend) =>
                        friend._id.toString()
                    );
                    authorized = friendIDs.includes(user_id);
                }
                break;
            case "PRIVATE":
                authorized = post.user_id.toString() === user_id;
                break;
            case "GROUP":
                const group = await Group.findById(group_id);

                if (group.privacy === "PUBLIC") {
                    authorized = true;
                } else {
                    const members = group.members.map((member) =>
                        member.toString()
                    );

                    authorized = members.includes(user_id);
                }

                break;
            default:
                authorized = false;
        }

        if (authorized) {
            console.log("Authorized");
            res.status(200).json({
                success: true,
                data: post,
            });
        } else {
            console.log("Not authorized");
            res.status(200).json({
                success: true,
                data: null,
                message: "You are not authorized to view this post",
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get all posts of a user
// @route   POST /api/posts/user/:user_id
exports.getPostsByUserID = async (req, res, next) => {
    try {
        const { user_id } = req.params;
        const { viewer_id } = req.body;

        const user = await User.findById(user_id);

        if (!user) {
            res.status(200).json({
                success: true,
                data: null,
                message: `User with id ${user_id} not found`,
            });
            return next(
                new ErrorResponse(`User with id ${user_id} not found`, 404)
            );
        }
        if (user_id === viewer_id) {
            const page = parseInt(req.query.page) || 1; // Current page
            const limit = parseInt(req.query.limit) || 10; // Number of posts per page

            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;

            const totalPosts = await Post.find({ user_id }).countDocuments();
            const totalPages = Math.ceil(totalPosts / limit);

            const posts = await Post.find({ user_id }) // Filter by user_id
                .sort({ createAt: -1 }) // Sort by createAt in ascending order
                .skip(startIndex)
                .limit(limit);

            res.status(200).json({
                success: true,
                data: posts,
                page,
                totalPages,
            });
        }

        if (user.friendList.some((friend) => friend._id == viewer_id)) {
            const page = parseInt(req.query.page) || 1; // Current page
            const limit = parseInt(req.query.limit) || 10; // Number of posts per page

            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;

            const totalPosts = await Post.find({
                user_id,
                privacy: { $in: ["PUBLIC", "FRIEND"] },
            }).countDocuments();
            const totalPages = Math.ceil(totalPosts / limit);

            const posts = await Post.find({
                user_id,
                privacy: { $in: ["PUBLIC", "FRIEND"] },
            })
                .sort({ createAt: -1 }) // Sort by createAt in ascending order
                .skip(startIndex)
                .limit(limit);

            console.log("Friend");
            res.status(200).json({
                success: true,
                data: posts,
                page,
                totalPages,
            });
        } else {
            const page = parseInt(req.query.page) || 1; // Current page
            const limit = parseInt(req.query.limit) || 10; // Number of posts per page

            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;

            const totalPosts = await Post.find({
                user_id,
                privacy: "PUBLIC",
            }).countDocuments();
            const totalPages = Math.ceil(totalPosts / limit);

            const posts = await Post.find({
                user_id,
                privacy: "PUBLIC",
            })
                .sort({ createAt: -1 }) // Sort by createAt in ascending order
                .skip(startIndex)
                .limit(limit);

            console.log("Not friend");
            res.status(200).json({
                success: true,
                data: posts,
                page,
                totalPages,
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get public posts of a user
// @route   POST /api/posts/:user_id
exports.getPublicPostsByUserID = async (req, res, next) => {
    try {
        const { user_id } = req.params;

        const page = parseInt(req.query.page) || 1; // Current page
        const limit = parseInt(req.query.limit) || 10; // Number of posts per page

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const totalPosts = await Post.find({
            user_id,
            privacy: "PUBLIC",
        }).countDocuments();
        const totalPages = Math.ceil(totalPosts / limit);

        const posts = await Post.find({ user_id, privacy: "PUBLIC" }) // Filter by user_id and privacy
            .sort({ createAt: -1 }) // Sort by createAt in ascending order
            .skip(startIndex)
            .limit(limit);

        posts.forEach((post) => {
            const commentCount = Comment.find({
                post_id: post._id,
            }).countDocuments();
            post.commentCount = commentCount;
        });
        res.status(200).json({
            success: true,
            data: posts,
            page,
            totalPages,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get posts of a group
// @route   POST /api/posts/group/:group_id
exports.getPostsByGroupID = async (req, res, next) => {
    try {
        const { group_id } = req.params;

        const page = parseInt(req.query.page) || 1; // Current page
        const limit = parseInt(req.query.limit) || 10; // Number of posts per page
        const sortBy = req.query.sortBy || "NEW"; // Sort by createAt in descending order

        const startIndex = (page - 1) * limit;

        let totalPosts;
        let posts;

        switch (sortBy) {
            case "NEW":
                totalPosts = await Post.find({ group_id }).countDocuments();
                posts = await Post.find({ group_id })
                    .sort({ createAt: -1 })
                    .skip(startIndex)
                    .limit(limit);
                break;
            case "ACTIVITY":
                const postsWithLastComment = await Post.aggregate([
                    {
                        $match: { group_id },
                    },
                    {
                        $lookup: {
                            from: "comments",
                            localField: "_id",
                            foreignField: "post_id",
                            as: "comments",
                        },
                    },
                    {
                        $match: { comments: { $ne: [] } },
                    },
                    {
                        $unwind: "$comments",
                    },
                    {
                        $sort: { "comments.createAt": -1 },
                    },
                    {
                        $group: {
                            _id: "$_id",
                            data: { $first: "$$ROOT" },
                        },
                    },
                    {
                        $replaceRoot: { newRoot: "$data" },
                    },
                    {
                        $skip: startIndex,
                    },
                    {
                        $limit: limit,
                    },
                ]);

                // Extract only the post data from the aggregation result
                posts = postsWithLastComment.map((post) => post.data);

                // Calculate total posts separately
                totalPosts = postsWithLastComment.length;

                break;
            default:
                posts = await Post.find({ group_id })
                    .sort({ createAt: -1 })
                    .skip(startIndex)
                    .limit(limit);
                break;
        }

        const totalPages = Math.ceil(totalPosts / limit);

        res.status(200).json({
            success: true,
            data: posts,
            page,
            totalPages,
        });
    } catch (error) {
        next(error);
    }
};

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
// @desc Get home posts
// @route GET /api/posts/home/:user_id
exports.getHomePosts = async (req, res, next) => {
    try {
        const { user_id } = req.params;

        const page = parseInt(req.query.page) || 1; // Current page
        const limit = parseInt(req.query.limit) || 10; // Number of posts per page

        const startIndex = (page - 1) * limit;

        const user = await User.findById(user_id);
        const groupList = await Group.find({
            members: { $in: [user_id] },
        });

        const groupPosts = await Post.find({
            group_id: { $in: groupList },
            read: { $nin: { user_id: [user_id] } },
        });

        const friendList = user.friendList;

        const friendIDs = friendList.map((friend) => friend._id.toString());
        friendIDs.push(user_id);

        const friendPosts = await Post.find({
            user_id: { $in: friendIDs },
            privacy: { $in: ["PUBLIC", "FRIEND"] },
            read: { $nin: { user_id: [user_id] } },
        });

        const totalPosts = groupPosts.length + friendPosts.length;

        if (totalPosts <= limit) {
            const groupPosts = await Post.find({
                group_id: { $in: groupList },
            });

            const friendPosts = await Post.find({
                user_id: { $in: friendIDs },
                privacy: { $in: ["PUBLIC", "FRIEND"] },
            });

            const totalPosts = groupPosts.length + friendPosts.length;

            const totalPages = Math.ceil(totalPosts / limit);

            // Sort posts by createAt in descending order
            const posts = [...groupPosts, ...friendPosts].sort(
                (a, b) => b.createAt - a.createAt
            );

            res.status(200).json({
                success: true,
                data: posts,
                page,
                totalPages: totalPages,
            });
        } else {
            const totalPages = Math.ceil(totalPosts / limit);

            // Shuffle the posts
            const shuffledPosts = shuffleArray([...groupPosts, ...friendPosts]);

            const posts = shuffledPosts.slice(startIndex, startIndex + limit);

            res.status(200).json({
                success: true,
                data: posts,
                page,
                totalPages: totalPages,
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get newsfeed
// @route   GET /api/posts/newsfeed/:user_id
// @access  Public
exports.getNewsfeed = async (req, res, next) => {
    try {
        const { user_id } = req.params;

        const user = await User.findById(user_id);
        const page = parseInt(req.query.page) || 1; // Current page
        const limit = parseInt(req.query.limit) || 10; // Number of posts per page

        const startIndex = (page - 1) * limit;

        const friendList = user.friendList; // Change with real friendlist later
        const friendIDs = friendList.map((friend) => friend._id.toString());
        friendIDs.push(user_id);

        const totalPosts = await Post.find({
            user_id: { $in: friendIDs },
            privacy: { $in: ["PUBLIC", "FRIEND"] },
        }).countDocuments();

        const totalPages = Math.ceil(totalPosts / limit);

        const posts = await Post.find({
            user_id: { $in: friendIDs },
            privacy: { $in: ["PUBLIC", "FRIEND"] },
        })
            .sort({ createAt: -1 })
            .skip(startIndex)
            .limit(limit);

        res.status(200).json({
            success: true,
            data: posts,
            page,
            totalPages: totalPages,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Like a post
// @route   POST /api/posts/like/:post_id
exports.likePost = async (req, res, next) => {
    try {
        const { post_id } = req.params;
        const { user_id } = req.body;

        const post = await Post.findById(post_id);

        if (!post) {
            return next(
                new ErrorResponse(`Post with id ${post_id} not found`, 404)
            );
        }

        // Check if the post has already been liked
        if (post.likes.find((like) => like.user_id == user_id)) {
            return next(
                new ErrorResponse(
                    `Post with id ${post_id} has already been liked by user with id ${user_id}`,
                    400
                )
            );
        } else {
            post.likes.push({ user_id });

            await post.save();

            res.status(200).json({
                success: true,
                data: post,
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Unlike a post
// @route   PATCH /api/posts/unlike/:post_id
exports.unlikePost = async (req, res, next) => {
    try {
        const { post_id } = req.params;
        const { user_id } = req.body;

        const post = await Post.findById(post_id);

        if (!post) {
            return next(
                new ErrorResponse(`Post with id ${post_id} not found`, 404)
            );
        }

        // Check if the post has already been liked
        if (!post.likes.find((like) => like.user_id == user_id)) {
            return next(
                new ErrorResponse(
                    `Post with id ${post_id} has not been liked by user with id ${user_id}`,
                    400
                )
            );
        } else {
            post.likes = post.likes.filter((like) => like.user_id != user_id);

            await post.save();

            res.status(200).json({
                success: true,
                data: post,
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Add user to read list
// @route   POST /api/posts/read/:post_id
exports.readPost = async (req, res, next) => {
    try {
        const { post_id } = req.params;
        const { user_id } = req.body;

        const post = await Post.findById(post_id);

        if (!post) {
            return next(
                new ErrorResponse(`Post with id ${post_id} not found`, 404)
            );
        }

        // Check if the post has already been read
        if (post.read.some((read) => read.user_id.toString() == user_id)) {
            return next(
                new ErrorResponse(
                    `Post with id ${post_id} has already been read by user with id ${user_id}`,
                    400
                )
            );
        } else {
            post.read.push({ user_id: new ObjectId(user_id) });

            await post.save();

            res.status(200).json({
                success: true,
                data: post,
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:post_id/:user_id
exports.deletePost = async (req, res, next) => {
    try {
        const { post_id, user_id } = req.params;

        const post = await Post.findById(post_id);

        if (!post) {
            return next(
                new ErrorResponse(`Post with id ${post_id} not found`, 404)
            );
        }

        if (post.user_id.toString() !== user_id) {
            return next(
                new ErrorResponse(
                    `User with id ${user_id} is not authorized to delete this post`,
                    401
                )
            );
        }

        // Only reach this point if everything is okay
        await Post.findByIdAndDelete(post_id);

        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
};
