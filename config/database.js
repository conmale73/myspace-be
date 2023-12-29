const mongoose = require("mongoose");

const connect = async () => {
    try {
        const conn = await mongoose.connect(
            "mongodb+srv://admin:admin@myspace.09mrbha.mongodb.net/MySPACE?retryWrites=true&w=majority",
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            }
        );

        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
        process.exit(1);
    }
};

module.exports = { connect };
