const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");
const express = require("express");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const { ObjectId } = require("mongodb");

// Sign up
exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Path to the default avatar in the "assets" folder
        const defaultAvatarPath = path.join(
            __dirname,
            "..",
            "assets",
            "defaultUserAvatar.png"
        );
        const defaultBackgroundPath = path.join(
            __dirname,
            "..",
            "assets",
            "defaultUserBackground.png"
        );
        // Read the default thumbnail image as a buffer
        const avatarBuffer = fs.readFileSync(defaultAvatarPath);
        const base64Avatar = avatarBuffer.toString("base64");

        const backgroundBuffer = fs.readFileSync(defaultBackgroundPath);
        const base64Background = backgroundBuffer.toString("base64");

        // Check if the email is already registered
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "Email is already in use" });
        }

        // Create a new user
        const newUser = new User({
            username,
            email,
            password,
            friendList: [new ObjectId("64a572c866ab977f9fc0bdd7")],
            background: {
                files: [
                    {
                        dataURL: base64Background,
                        fileInfo: {
                            type: "image/png",
                            name: "defaultUserBackground.png",
                            size: backgroundBuffer.length,
                            lastModified: new Date().getTime(),
                        },
                    },
                ],
            },
            avatar: {
                files: [
                    {
                        dataURL: base64Avatar,
                        fileInfo: {
                            type: "image/png",
                            name: "defaultUserAvatar.png",
                            size: avatarBuffer.length,
                            lastModified: new Date().getTime(),
                        },
                    },
                ],
            },
        });

        // Save the user to the database
        const userToResponse = await newUser.save();

        // res.status(201).json({ message: "User created successfully" });
        res.status(201).json({ success: true, data: userToResponse });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Log in
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compare the entered password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

        // Send the token as a response
        res.status(200).json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                description: user.description,
                musicType: user.musicType,
                friendList: user.friendList,
                avatar: user.avatar,
                registration_date: user.registration_date,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
    }
};

// Log out
exports.logout = async (req, res, next) => {
    try {
        // Clear the token from the user's tokens array
        req.user.tokens = [];
        await req.user.save();

        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        next(error);
    }
};
