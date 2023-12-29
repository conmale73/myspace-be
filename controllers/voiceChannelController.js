const VoiceChannel = require("../models/voiceChannelModel");
const ErrorResponse = require("../utils/errorResponse");

// @desc    Get all voiceChannels of a room
// @route   GET /api/voiceChannels/?room_id=:room_id
// @access  Public

exports.getRoomVoiceChannels = async (req, res, next) => {
    try {
        const { room_id } = req.params;

        const voiceChannels = await VoiceChannel.find({ room_id });

        res.json(voiceChannels);
    } catch (error) {
        next(error);
    }
};

// @desc    Get a voiceChannel by ID
// @route   GET /api/voiceChannels/?id=:id
// @access  Public

exports.getVoiceChannelById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const voiceChannel = await VoiceChannel.findById(id);

        if (!voiceChannel) {
            throw new ErrorResponse("Voice Channel not found", 404);
        }

        res.json(voiceChannel);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new voiceChannel
// @route   POST /api/voiceChannels/create
// @access  Public

exports.createVoiceChannel = async (req, res, next) => {
    try {
        const { room_id, name, currentMembers } = req.body;

        const voiceChannel = await VoiceChannel.create({
            room_id,
            name,
            currentMembers,
        });

        res.status(201).json(voiceChannel);
    } catch (error) {
        next(error);
    }
};

// @desc    Join a voiceChannel
// @route   POST /api/voiceChannels/join/:id
// @access  Public

exports.joinVoiceChannel = async (req, res, next) => {
    try {
        const { id } = req.params;

        const joinedChannels = await VoiceChannel.find({
            currentMembers: req.body.user_id,
        });
        const voiceChannel = await VoiceChannel.findById(id);

        if (joinedChannels.length > 0) {
            joinedChannels.forEach((joinedChannel) => {
                if (joinedChannel.currentMembers.includes(req.body.user_id)) {
                    joinedChannel.currentMembers.splice(
                        joinedChannel.currentMembers.indexOf(req.body.user_id),
                        1
                    );
                    joinedChannel.save();
                }
            });
        }
        if (!voiceChannel) {
            throw new ErrorResponse("Voice Channel not found", 404);
        } else {
            const { currentMembers } = voiceChannel;

            if (currentMembers.includes(req.body.user_id)) {
                return res.status(201).json(voiceChannel);
            } else {
                currentMembers.push(req.body.user_id);

                const updatedVoiceChannel = await VoiceChannel.findOneAndUpdate(
                    { _id: id },
                    { currentMembers },
                    { new: true }
                );

                res.status(201).json(updatedVoiceChannel);
            }
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Leave a voiceChannel
// @route   POST /api/voiceChannels/leave/:id
// @access  Public

exports.leaveVoiceChannel = async (req, res, next) => {
    try {
        const { id } = req.params;

        const voiceChannel = await VoiceChannel.findById(id);

        if (!voiceChannel) {
            throw new ErrorResponse("Voice Channel not found", 404);
        } else {
            const { currentMembers } = voiceChannel;

            if (!currentMembers.includes(req.body.user_id)) {
                return res.status(201).json(voiceChannel);
            } else {
                currentMembers.splice(
                    currentMembers.indexOf(req.body.user_id),
                    1
                );

                const updatedVoiceChannel = await VoiceChannel.findOneAndUpdate(
                    { _id: id },
                    { currentMembers },
                    { new: true }
                );

                res.status(201).json(updatedVoiceChannel);
            }
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Leave all voiceChannels
// @route   PUT /api/voiceChannels/leaveAll/:user_id
// @access  Public
exports.leaveAllVoiceChannel = async (req, res, next) => {
    try {
        const joinedChannels = await VoiceChannel.find({
            currentMembers: req.body.user_id,
        });

        if (joinedChannels.length > 0) {
            joinedChannels.forEach((joinedChannel) => {
                if (joinedChannel.currentMembers.includes(req.body.user_id)) {
                    joinedChannel.currentMembers.splice(
                        joinedChannel.currentMembers.indexOf(req.body.user_id),
                        1
                    );
                    joinedChannel.save();
                }
            });
        }
        res.status(201).json("Leave all voice channels successfully");
    } catch (error) {
        next(error);
    }
};
