'use strict';

const cloudinary = require('../configs/cloudinary.config')

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


module.exports = {
    uploadImageFromUrl,
    uploadImageFromLocal,
    uploadMultiImagesFromLocal
}