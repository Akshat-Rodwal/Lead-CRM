const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        let uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error(
                "MONGO_URI is not defined in environment variables"
            );
        }
        if (uri.includes("<db_password>")) {
            const pw = process.env.DB_PASSWORD || "";
            uri = uri.replace("<db_password>", encodeURIComponent(pw));
        }
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
    console.error("MongoDB connection error:", error.message);
    return null;
    }
};

module.exports = connectDB;
