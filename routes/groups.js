const GroupController = require("../controllers/groupControllers");
const express = require("express");
const router = express.Router();

// POST /api/groups
router.post("/", GroupController.createGroup);

// GET /api/groups
router.get("/", GroupController.getAllGroups);

// GET /api/groups/public
router.get("/public", GroupController.getAllPublicGroups);

// GET /api/groups/admins/:group_id
router.get("/admins/:group_id", GroupController.getAdminsInfo);

// GET /api/groups/recommend/:user_id
router.get("/recommend/:user_id", GroupController.getRecommendGroups);

// GET /api/groups/user/:user_id
router.get("/user/:user_id", GroupController.getGroupsByUserId);

// GET /api/groups/:group_id
router.get("/:group_id", GroupController.getGroupById);

// PUT /api/groups/request-join/:group_id
router.put("/request-join/:group_id", GroupController.requestJoinGroup);

// PUT /api/groups/invite-user/:group_id
router.put("/invite-user/:group_id", GroupController.inviteUserToGroup);

// PUT /api/groups/accept-invitation/:group_id
router.put(
    "/accept-invitation/:group_id",
    GroupController.acceptInvitationToGroup
);

// PUT /api/groups/decline-invitation/:group_id
router.put(
    "/decline-invitation/:group_id",
    GroupController.declineInvitationToGroup
);

// PUT /api/groups/set-admin/:group_id
router.put("/set-admin/:group_id", GroupController.setUserAsAdmin);

// PUT /api/groups/remove-admin/:group_id
router.put("/remove-admin/:group_id", GroupController.removeUserAsAdmin);

// PUT /api/groups/remove-user/:group_id
router.put("/remove-user/:group_id", GroupController.removeUserFromGroup);

// PUT /api/groups/join/:group_id
router.put("/join/:group_id", GroupController.joinPublicGroup);

// PUT /api/groups/request-join/:group_id
router.put("/request-join/:group_id", GroupController.requestJoinGroup);

// PUT /api/groups/cancel-request-join/:group_id
router.put(
    "/cancel-request-join/:group_id",
    GroupController.cancelRequestJoinGroup
);

// PUT /api/groups/pending-requests/:group_id
router.put(
    "/pending-requests/:group_id",
    GroupController.getPendingRequestsToJoinGroup
);

// PUT /api/groups/accept-request/:group_id
router.put(
    "/accept-request/:group_id",
    GroupController.acceptRequestToJoinGroup
);

// PUT /api/groups/decline-request/:group_id
router.put(
    "/decline-request/:group_id",
    GroupController.declineRequestToJoinGroup
);

// PUT /api/groups/leave/:group_id
router.put("/leave/:group_id", GroupController.leaveGroup);

// PATCH /api/groups/thumbnail/:group_id
router.patch("/thumbnail/:group_id", GroupController.updateGroupThumbnailById);

// PATCH /api/groups/:group_id
router.patch("/:group_id", GroupController.updateGroupById);

// DELETE /api/groups/:group_id
router.delete("/:group_id", GroupController.deleteGroupById);

// GET /api/groups/searchQuery/:group_name
router.get(
    "/searchRecommendation/:group_name",
    GroupController.getSearchRecommend
);

// GET /api/groups/search/:group_name
router.get("/search/:group_name", GroupController.searchGroupsByName);

// GET /api/groups/search/:group_name/:user_id
router.get(
    "/search/:group_name/:user_id",
    GroupController.searchGroupsByNameAndUserId
);

// GET /api/groups/:group_id/search-members/:member_name
router.get(
    "/:group_id/search-members/:member_name",
    GroupController.searchMembersOfGroupByName
);

module.exports = router;
