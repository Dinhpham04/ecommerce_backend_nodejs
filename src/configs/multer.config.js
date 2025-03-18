'use strict';

const multer = require('multer');

const storageDisk = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './src/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
})

const uploadDisk = multer({ storage: storageDisk })

const storageMemory = multer.memoryStorage()
const uploadMemory = multer({ storage: storageMemory })

module.exports = {
    uploadDisk,
    uploadMemory
}