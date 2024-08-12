import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (filePath) => {
    try {
        if (!filePath) return null
        // Upload file to cloudinary
        const response = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto",
        })
        //file uploaded successfully
        console.log("File is uploaded on cloudinary successfully !!! url : ", response.url);
        return response
    } catch (error) {
        fs.unlinkSync(filePath) // removes the locally saved temporary file as the upload failed
        console.log("File upload failed : ", error)
        return null
    }
}

export { uploadToCloudinary }