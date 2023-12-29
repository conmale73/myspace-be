const Notification = require("../models/notificationModel");
const ErrorResponse = require("../utils/errorResponse");

// @desc    Create a new notification
// @route   GET /api/notifications/
// @access  Public
exports.createNotification = async (req, res, next) => {
    try {
        const { receiver_id, sender_id, content, link, type, status } =
            req.body;

        const newNotification = new Notification({
            receiver_id,
            sender_id,
            content,
            link,
            type,
            status,
        });

        const savedNotification = await newNotification.save();
        res.status(201).json({
            success: true,
            data: savedNotification,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all notifications by user_id
// @route   GET /api/notifications/:user_id
// @access  Public
exports.getAllNotificationsByUserID = async (req, res, next) => {
    try {
        const { user_id } = req.params;

        const page = parseInt(req.query.page) || 1; // Current page
        const limit = parseInt(req.query.limit) || 10; // Number of posts per page

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const totalPosts = await Notification.find({
            receiver_id: user_id,
        }).countDocuments();
        const totalPages = Math.ceil(totalPosts / limit);

        const notifications = await Notification.find({ receiver_id: user_id })
            .sort({ createAt: -1 })
            .skip(startIndex)
            .limit(limit);

        res.status(200).json({
            success: true,
            data: notifications,
            page,
            totalPages,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get unread notifications by user_id
// @route   GET /api/notifications/unread/:user_id
// @access  Public
exports.getUnreadNotificationsByUserID = async (req, res, next) => {
    try {
        const { user_id } = req.params;

        const page = parseInt(req.query.page) || 1; // Current page
        const limit = parseInt(req.query.limit) || 10; // Number of posts per page

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const totalPosts = await Notification.find({
            receiver_id: user_id,
            read: false,
        }).countDocuments();
        const totalPages = Math.ceil(totalPosts / limit);

        const notifications = await Notification.find(
            { receiver_id: user_id, read: false },
            null,
            { sort: { createAt: -1 } },
            { skip: startIndex, limit: limit }
        );
        res.status(200).json({
            success: true,
            data: notifications,
            page,
            totalPages,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Count unread notifications by user_id
// @route   GET /api/notifications/unread/count/:user_id
// @access  Public
exports.countUnreadNotificationsByUserID = async (req, res, next) => {
    try {
        const { user_id } = req.params;

        const totalUnreadNotifications = await Notification.find({
            receiver_id: user_id,
            read: false,
        }).countDocuments();

        res.status(200).json(totalUnreadNotifications);
    } catch (error) {
        next(error);
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/:user_id
// @access  Public
exports.markAllNotificationsAsRead = async (req, res, next) => {
    try {
        const { user_id } = req.params;

        const notifications = await Notification.updateMany(
            { receiver_id: user_id },
            { read: true }
        );

        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:notification_id
// @access  Public

exports.markNotificationAsRead = async (req, res, next) => {
    try {
        const { notification_id } = req.params;

        const notification = await Notification.findByIdAndUpdate(
            notification_id,
            { read: true },
            { new: true }
        );

        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:notification_id
// @access  Public
exports.deleteNotification = async (req, res, next) => {
    try {
        const { notification_id } = req.params;

        const notification = await Notification.findByIdAndDelete(
            notification_id
        );

        res.status(200).json({ success: true, data: null });
    } catch (error) {
        next(error);
    }
};
