
'use strict';

const express = require('express');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');
const UploadController = require('../../controllers/upload.controller');
const {
    uploadDisk,
    uploadMemory
} = require('../../configs/multer.config');
const router = express.Router();

// authentication // 
// router.use(authenticationV2)

// upload file use cloudinary and multer
router.post('/product/url', asyncHandler(UploadController.uploadImageFromUrl))
router.post('/product/thumb', uploadDisk.single('file'), asyncHandler(UploadController.uploadImageFromLocal))
router.post('/product/multi', uploadDisk.array('files'), asyncHandler(UploadController.uploadMultiImagesFromLocal))

// upload file use aws s3
router.post('/product/bucket', uploadMemory.single('file'), asyncHandler(UploadController.uploadFileFromLocalS3))

module.exports = router


// trong thực tế thì thường upload hình ảnh trước khi nhập một thông tin nào đó, điều này yêu cầu 1 service riêng biệt thực hiện