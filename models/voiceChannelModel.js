const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const voiceChannelSchema = new mongoose.Schema({
    room_id: {
        type: ObjectId,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    currentMembers: [
        {
            type: ObjectId,
        },
    ],
});

const VoiceChannel = mongoose.model("VoiceChannel", voiceChannelSchema);

module.exports = VoiceChannel;
