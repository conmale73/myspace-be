const CommentController = require("../controllers/commentController");
const express = require("express");
const router = express.Router();

// POST /api/comments
router.post("/", CommentController.postComment);

// GET /api/comments/post/:post_id
router.get("/post/:post_id", CommentController.getCommentsByPostId);

// POST /api/comments/like/:comment_id
router.post("/like/:comment_id", CommentController.likeComment);

// PATCH /api/comments/unlike/:comment_id
router.patch("/unlike/:comment_id", CommentController.unlikeComment);

// GET /api/comments/:comment_id
router.get("/:comment_id", CommentController.getCommentById);

// GET /api/comments/replies/:comment_id
router.get("/replies/:comment_id", CommentController.getRepliesByCommentId);

// PUT /api/comments/:comment_id
router.put("/:comment_id", CommentController.updateCommentById);

// DELETE /api/comments/:comment_id
router.delete("/:comment_id", CommentController.deleteCommentById);

module.exports = router;
