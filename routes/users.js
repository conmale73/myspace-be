const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

// GET /api/users
router.get("/", usersController.getUsers);

// GET /api/users/:id
router.get("/:id", usersController.getUser);

// GET /api/users/email/:email
router.get("/email/:email", usersController.getUserByEmail);

// POST /api/users
router.post("/", usersController.createUser);

// PUT /api/users/updatePassword/
router.put("/updatePassword/", usersController.updateUserPassword);

// PUT /api/users/updateInfo
router.put("/updateInfo", usersController.updateUserInfo);

// PUT /api/users/updateAvatar
router.put("/updateAvatar", usersController.updateUserAvatar);

// PUT /api/users/updateAvatar
router.put("/updateBackground", usersController.updateUserBackground);

// DELETE /api/users/:id
router.delete("/:id", usersController.deleteUser);

// POST /api/login
router.post("/login", usersController.login);

// POST /api/logout
router.post("/logout", usersController.logout);

// POST /api/users/addFriend
router.post("/addFriend", usersController.addFriend);

// POST /api/users/acceptFriendRequest
router.post("/acceptFriendRequest", usersController.acceptFriendRequest);

// POST /api/users/declineFriendRequest
router.post("/declineFriendRequest", usersController.declineFriendRequest);

// POST /api/users/cancelFriendRequest
router.post("/cancelFriendRequest", usersController.cancelFriendRequest);

// POST /api/users/removeFriend
router.post("/removeFriend", usersController.removeFriend);

// GET /api/users/friendRequests/:user_id
router.get("/friendList/:user_id", usersController.getFriendList);

// GET /api/users/friendList/:user_id
router.get("/friendRequests/:user_id", usersController.getFriendRequests);

// GET /api/users/mutualFriends/:friend_id/:user_id
router.get(
    "/mutualFriends/:friend_id/:user_id",
    usersController.getMutualFriends
);

// GET /api/users/search/:username
router.get("/search/:username", usersController.searchUsersByUsername);

// GET /api/users/searchFriends/:user_id/:username
router.get(
    "/searchFriends/:user_id/:username",
    usersController.searchFriendsByUsername
);

module.exports = router;
