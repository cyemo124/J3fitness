import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "j3fitness" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    stream.end(fileBuffer);
  });
};

// Helper to generate face-focused Cloudinary URL
const getFaceFocusedUrl = (publicId, width = 600, height = 750) => {
  return cloudinary.url(publicId, {
    width,
    height,
    crop: "fill", // Changed from "thumb" to "fill"
    gravity: "face", // Face at top, fills rest with body
    quality: "auto:best",
    dpr: "auto",
    fetch_format: "auto",
  });
};
