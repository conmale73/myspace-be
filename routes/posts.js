const express = require("express");
const router = express.Router();
const postsController = require("../controllers/postsController");

// POST /api/posts
router.post("/", postsController.post);

// PUT /api/posts/:post_id
router.put("/:post_id", postsController.getPostById);

// GET /api/posts/:user_id
router.put("/user/:user_id", postsController.getPostsByUserID);

// GET /api/posts/group/:group_id
router.get("/group/:group_id", postsController.getPostsByGroupID);

// GET /api/posts/:user_id
router.get("/public/:user_id", postsController.getPublicPostsByUserID);

// POST /api/posts/like/:post_id
router.post("/like/:post_id", postsController.likePost);

// PATCH /api/posts/unlike/:post_id
router.patch("/unlike/:post_id", postsController.unlikePost);

// GET /api/posts/newsfeed/:user_id
router.get("/newsfeed/:user_id", postsController.getNewsfeed);

// GET /api/posts/home/:user_id
router.get("/home/:user_id", postsController.getHomePosts);

// POST /api/posts/read/:post_id
router.post("/read/:post_id", postsController.readPost);

// DELETE /api/posts/:post_id
router.delete("/:post_id/:user_id", postsController.deletePost);
module.exports = router;
