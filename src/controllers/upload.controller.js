'use strict'

const { BadRequestError } = require("../core/error.response")
const { SuccessResponse } = require("../core/success.response")
const { uploadImageFromUrl,
    uploadImageFromLocal,
    uploadMultiImagesFromLocal } = require("../services/upload.service")

class UploadController {
    // urlImage, folderName, newFileName
    uploadImageFromUrl = async (req, res, next) => {
        new SuccessResponse({
            message: 'Upload file from URL success',
            metadata: await uploadImageFromUrl(req.body)
        }).send(res)
    }

    uploadImageFromLocal = async (req, res, next) => {
        const { file } = req
        if (!file) {
            throw new BadRequestError('file missing')
        }
        new SuccessResponse({
            message: 'Upload file from local success',
            metadata: await uploadImageFromLocal({ path: file.path, newFileName: req.body.newFileName, folderName: req.body.folderName })
        }).send(res)
    }

    uploadMultiImagesFromLocal = async (req, res, next) => {
        const { files } = req
        if (!files.length) {
            throw new BadRequestError('file missing')
        }
        new SuccessResponse({
            message: 'Upload file from local success',
            metadata: await uploadMultiImagesFromLocal({ files, folderName: req.body.folderName })
        }).send(res)
    }
}

module.exports = new UploadController()