const Comment = require("../models/commentModel");
const Post = require("../models/postModel");
const ErrorResponse = require("../utils/errorResponse");
const { ObjectId } = require("mongodb");
const Notification = require("../models/notificationModel");

// @desc    Add a new comment
// @route   POST /api/comments
// @access  Public
exports.postComment = async (req, res, next) => {
    try {
        const { post_id, creator, replyTo, content } = req.body;

        // Create an array to hold the files with binary data
        const filesWithBinary = [];
        const filesForResponse = [];
        for (const file of content.files) {
            // Convert the base64 data to a binary Buffer
            const base64Data = file.dataURL.split(",")[1];
            const buffer = Buffer.from(base64Data, "base64");

            // Create an object with the binary data and other file info
            const fileWithBinary = {
                dataURL: buffer,
                fileInfo: file.fileInfo,
            };
            const fileForResponse = {
                dataURL: base64Data,
                fileInfo: file.fileInfo,
            };

            filesWithBinary.push(fileWithBinary);
            filesForResponse.push(fileForResponse);
        }

        // Update the content with the files containing binary data
        content.files = filesForResponse;

        const newComment = new Comment({
            post_id,
            creator,
            replyTo,
            content,
        });
        const savedComment = await newComment.save();

        const post = await Post.findById(post_id);

        if (post.group_id) {
            // Create a notification
            if (replyTo.comment_id == null) {
                const notification = new Notification({
                    receiver_id: new ObjectId(replyTo.user_id),
                    sender: {
                        user_id: new ObjectId(creator.user_id),
                        username: creator.username,
                        avatar: creator.avatar,
                    },
                    type: "COMMENT",
                    content: `commented on your post`,
                    link: `/social/group/post/${post_id}?comment_id=${savedComment._id}`,
                });
                await notification.save();
            } else {
                const notification = new Notification({
                    receiver_id: new ObjectId(replyTo.user_id),
                    sender: {
                        user_id: new ObjectId(creator.user_id),
                        username: creator.username,
                        avatar: creator.avatar,
                    },
                    type: "COMMENT_REPLY",
                    content: `mentioned you in a comment`,
                    link: `/social/group/post/${post_id}?comment_id=${savedComment._id}`,
                });
                await notification.save();

                const replyToComment = await Comment.findById(
                    replyTo.comment_id
                );
                replyToComment.replyCount = replyToComment.replyCount + 1;
                await replyToComment.save();
            }
        } else {
            // Create a notification
            if (replyTo.comment_id == null) {
                const notification = new Notification({
                    receiver_id: new ObjectId(replyTo.user_id),
                    sender: {
                        user_id: new ObjectId(creator.user_id),
                        username: creator.username,
                        avatar: creator.avatar,
                    },
                    type: "COMMENT",
                    content: `commented on your post`,
                    link: `/social/post/${post_id}?comment_id=${savedComment._id}`,
                });
                await notification.save();
            } else {
                const notification = new Notification({
                    receiver_id: new ObjectId(replyTo.user_id),
                    sender: {
                        user_id: new ObjectId(creator.user_id),
                        username: creator.username,
                        avatar: creator.avatar,
                    },
                    type: "COMMENT_REPLY",
                    content: `mentioned you in a comment`,
                    link: `/social/post/${post_id}?comment_id=${savedComment._id}`,
                });
                await notification.save();

                const replyToComment = await Comment.findById(
                    replyTo.comment_id
                );
                replyToComment.replyCount = replyToComment.replyCount + 1;
                await replyToComment.save();
            }
        }

        post.commentCount = post.commentCount + 1;
        await post.save();

        res.status(201).json(savedComment);
    } catch (error) {
        next(error);
    }
};

// @desc    Get comments by post id
// @route   GET /api/comments/post/:post_id
// @access  Public
exports.getCommentsByPostId = async (req, res, next) => {
    try {
        const { post_id } = req.params;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortBy = req.query.sortBy || "createAtAsc";

        const startIndex = (page - 1) * limit;

        const totalComments = await Comment.find({
            post_id,
            "replyTo.comment_id": null,
        }).countDocuments();
        const totalPages = Math.ceil(totalComments / limit);

        let comments;

        switch (sortBy) {
            case "createAtAsc":
                comments = await Comment.find({
                    post_id,
                    "replyTo.comment_id": null,
                })
                    .sort({ createAt: -1 })
                    .skip(startIndex)
                    .limit(limit);
                break;
            case "createAtDesc":
                comments = await Comment.find({
                    post_id,
                    "replyTo.comment_id": null,
                })
                    .sort({ createAt: 1 })
                    .skip(startIndex)
                    .limit(limit);
                break;
            case "likesDesc":
                comments = await Comment.aggregate([
                    {
                        $match: {
                            post_id: new ObjectId(post_id),
                            "replyTo.comment_id": null,
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            post_id: 1,
                            creator: 1,
                            content: 1,
                            likes: 1,
                            replyTo: 1,
                            createAt: 1,
                            updateAt: 1,
                            replyCount: 1,
                            likesCount: { $size: "$likes" },
                        },
                    },
                    { $sort: { likesCount: -1 } },
                    { $skip: startIndex },
                    { $limit: limit },
                ]);
                break;
            default:
                comments = await Comment.find({
                    post_id,
                    "replyTo.comment_id": null,
                })
                    .sort({ createAt: 1 })
                    .skip(startIndex)
                    .limit(limit);
                break;
        }

        res.status(200).json({
            success: true,
            data: comments,
            page,
            totalPages,
        });
    } catch (error) {
        next(error);
    }
};

// @desc   Get replies by comment id
// @route  GET /api/comments/replies/:comment_id
// @access Public
exports.getRepliesByCommentId = async (req, res, next) => {
    try {
        const { comment_id } = req.params;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const startIndex = (page - 1) * limit;

        const totalReplies = await Comment.find({
            "replyTo.comment_id": new ObjectId(comment_id),
        }).countDocuments();

        const totalPages = Math.ceil(totalReplies / limit);

        const replies = await Comment.find({
            "replyTo.comment_id": new ObjectId(comment_id),
        })
            .sort({ createAt: 1 })
            .skip(startIndex)
            .limit(limit);

        res.status(200).json({
            success: true,
            data: replies,
            totalReplies,
            page,
            totalPages,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Like a comment
// @route   POST /api/comments/like/:comment_id
// @access  Public
exports.likeComment = async (req, res, next) => {
    try {
        const { comment_id } = req.params;
        const { user_id } = req.body;

        const comment = await Comment.findById(comment_id);

        if (!comment) {
            return next(
                new ErrorResponse(
                    `comment with id ${comment_id} not found`,
                    404
                )
            );
        }

        // Check if the comment has already been liked
        if (comment.likes.find((like) => like.user_id == user_id)) {
            return next(
                new ErrorResponse(
                    `comment with id ${comment_id} has already been liked by user with id ${user_id}`,
                    400
                )
            );
        } else {
            comment.likes.push({ user_id });

            await comment.save();

            res.status(200).json({
                success: true,
                data: comment,
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Unlike a comment
// @route   PATCH /api/comments/unlike/:comment_id
// @access  Public
exports.unlikeComment = async (req, res, next) => {
    try {
        const { comment_id } = req.params;
        const { user_id } = req.body;

        const comment = await Comment.findById(comment_id);

        if (!comment) {
            return next(
                new ErrorResponse(
                    `comment with id ${comment_id} not found`,
                    404
                )
            );
        }

        // Check if the comment has already been liked
        if (!comment.likes.find((like) => like.user_id == user_id)) {
            return next(
                new ErrorResponse(
                    `comment with id ${comment_id} has not been liked by user with id ${user_id}`,
                    400
                )
            );
        } else {
            comment.likes = comment.likes.filter(
                (like) => like.user_id != user_id
            );

            await comment.save();

            res.status(200).json({
                success: true,
                data: comment,
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get comment by id
// @route   GET /api/comments/:comment_id
// @access  Public
exports.getCommentById = async (req, res, next) => {
    try {
        const { comment_id } = req.params;

        const comment = Comment.findById(comment_id);

        if (!comment) {
            return next(
                new ErrorResponse(
                    `Comment with id ${comment_id} not found`,
                    404
                )
            );
        }

        res.status(200).json({
            success: true,
            data: comment,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update comment by id
// @route   PUT /api/comments/:comment_id
// @access  Private
exports.updateCommentById = async (req, res, next) => {
    try {
        const { comment_id } = req.params;
        const { content } = req.body;

        const comment = await Comment.findByIdAndUpdate(
            comment_id,
            { content },
            { updateAt: Date.now() },
            { new: true }
        );

        if (!comment) {
            return next(
                new ErrorResponse(
                    `Comment with id ${comment_id} not found`,
                    404
                )
            );
        }

        res.status(200).json({
            success: true,
            data: comment,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete comment by id
// @route   DELETE /api/comments/:comment_id
// @access  Private
exports.deleteCommentById = async (req, res, next) => {
    try {
        const { comment_id } = req.params;

        const comment = await Comment.findByIdAndDelete(comment_id);

        if (!comment) {
            return next(
                new ErrorResponse(
                    `Comment with id ${comment_id} not found`,
                    404
                )
            );
        }

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (error) {
        next(error);
    }
};
