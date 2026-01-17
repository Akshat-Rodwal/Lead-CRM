const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("../src/config/db");
const app = require("../src/serverlessApp");

let dbReady = false;

module.exports = async (req, res) => {
    if (!dbReady) {
        await connectDB();
        dbReady = true;
    }
    return app(req, res);
};
