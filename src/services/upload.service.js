'use strict';

const { GetObjectCommand } = require('@aws-sdk/client-s3');
const cloudinary = require('../configs/cloudinary.config')

const {
    s3,
    PutObjectCommand
} = require('../configs/s3.config')

const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')

// UPLOAD FILE USING CLOUDINARY AND MULTER

// 1. upload from url image 
const uploadImageFromUrl = async ({ urlImage, folderName, newFileName }) => {
    const result = await cloudinary.uploader.upload(urlImage, {
        folder: folderName,
        public_id: newFileName
    })
    return result
}

// 2. upload image from local 
const uploadImageFromLocal = async ({ path, folderName, newFileName }) => {
    const result = await cloudinary.uploader.upload(path, {
        folder: folderName,
        public_id: newFileName,
    })
    return {
        imageUrl: result.secure_url,
        thumb_url: await cloudinary.url(result.public_id, {
            width: 200,
            height: 300,
            format: 'jpg'
        })
    }
}

// 3. upload multiple images from local
const uploadMultiImagesFromLocal = async ({ files, folderName }) => {
    if (!files.length) return
    const uploadedUrls = []
    for (let file of files) {
        const result = await cloudinary.uploader.upload(file.path, {
            folder: folderName,
            public_id: file.filename
        })
        uploadedUrls.push({
            imageUrl: result.secure_url,
            thumb_url: await cloudinary.url(result.public_id, {
                width: 200,
                height: 300,
                format: 'jpg'
            })
        })
    }
    return uploadedUrls
}


// UPLOAD FILE USING AWS S3 array

// 1. upload file from local 
const uploadFileFromLocalS3 = async ({ file }) => {
    const fileName = `${Date.now()}-${file.originalname}`
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName || 'unknown', // ten cua file
        Body: file.buffer,
        ContentType: 'image/jpeg/jpg', // that is what your need 
    })

    // export url public
    await s3.send(command)
    const signedUrl = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
    })
    const url = await getSignedUrl(s3, signedUrl, { expiresIn: 3600 });
    return {
        fileName, url
    }
}



module.exports = {
    uploadImageFromUrl,
    uploadImageFromLocal,
    uploadMultiImagesFromLocal,
    uploadFileFromLocalS3
}