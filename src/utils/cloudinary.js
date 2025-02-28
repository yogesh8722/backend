import dotenv from 'dotenv'
dotenv.config()
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';


// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const UploadOnCloudinary=async(localFilePath)=>{
    try {
        if(!localFilePath) return null
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        console.log("file is uploaded on cloudinary",response.url);
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        console.log("Cloudinary Error",error);
        fs.unlinkSync(localFilePath)
        return null
    }
}

export default UploadOnCloudinary