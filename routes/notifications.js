const notificationController = require("../controllers/notificationController");
const express = require("express");
const router = express.Router();

// Create a notification
router.post("/", notificationController.createNotification);

// Get all notifications by user_id
router.get("/:user_id", notificationController.getAllNotificationsByUserID);

// Get all unread notifications by user_id
router.get(
    "/unread/:user_id",
    notificationController.getUnreadNotificationsByUserID
);

// Count all unread notifications by user_id
router.get(
    "/unread/count/:user_id",
    notificationController.countUnreadNotificationsByUserID
);

// Mark a notification as read
router.put(
    "/markAsRead/:notification_id",
    notificationController.markNotificationAsRead
);

// Mark all notifications as read
router.put(
    "/markAllAsRead/:user_id",
    notificationController.markAllNotificationsAsRead
);

// Delete a notification
router.delete("/:notification_id", notificationController.deleteNotification);

module.exports = router;
