const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    description: {
        type: String,
    },
    musicType: [],
    birthday: {
        date: {
            type: Date,
            default: Date.now,
        },
        visible: {
            type: String,
            default: "PUBLIC",
        },
    },
    phone: {
        number: {
            type: String,
        },
        visible: {
            type: String,
            default: "PUBLIC",
        },
    },
    background: {},
    avatar: {},
    friendList: [
        {
            type: ObjectId,
        },
    ],
    friendRequest: [
        {
            user_id: {
                type: ObjectId,
            },
            notification_id: {
                type: ObjectId,
            },
        },
    ],
    friendRequestSent: [
        {
            user_id: {
                type: ObjectId,
            },
            notification_id: {
                type: ObjectId,
            },
        },
    ],
    registration_date: {
        type: Date,
        default: Date.now,
    },
});

// Hash the user's password before saving it to the database
userSchema.pre("save", function (next) {
    const user = this;
    if (!user.isModified("password")) return next();

    bcrypt.genSalt(10, (err, salt) => {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});
// Generate JWT token
userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
    return token;
};

// Method to match entered password with the hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
