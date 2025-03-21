'use strict';

const { GetObjectCommand } = require('@aws-sdk/client-s3');
const cloudinary = require('../configs/cloudinary.config')

const {
    s3,
    PutObjectCommand
} = require('../configs/s3.config')

// get public url using s3
// const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')

// get signed url using cloudfront-signer
const { getSignedUrl } = require("@aws-sdk/cloudfront-signer")

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
        ContentType: 'image/jpeg', // that is what your need 
    })
    const result = await s3.send(command)

    // export url public using getSignedUrl s3
    // const signedUrl = new GetObjectCommand({
    //     Bucket: process.env.AWS_BUCKET_NAME,
    //     Key: fileName,
    // })
    // const urlS3 = await getSignedUrl(s3, signedUrl, { expiresIn: 3600 });

    // export url public using cloudfront-signer
    const signedUrl = getSignedUrl({
        url: `${process.env.CLOUDFRONT_IMAGE_PUBLIC_URL}/${fileName}`, // url cần ký
        keyPairId: process.env.AWS_BUCKET_PUBLIC_KEY_ID, // id của public key
        dateLessThan: new Date(Date.now() + 1000 * 60),
        privateKey: process.env.AWS_BUCKET_PRIVATE_KEY,
    });
    return {
        signedUrl,
        result,
    }
}



module.exports = {
    uploadImageFromUrl,
    uploadImageFromLocal,
    uploadMultiImagesFromLocal,
    uploadFileFromLocalS3
}