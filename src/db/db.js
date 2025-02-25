import mongoose from 'mongoose';
import config from '../config/config.js';

const ConnectDB = async () => {
    try {
        await mongoose.connect(config.MONGODB_URI)
        console.log("MONGODB CONNECTED SUCCESSFULLY");
    } catch (error) {
        console.log("MONGODB CONNECTION FAILED", error);
        process.exit(1)
    }
}

export default ConnectDB