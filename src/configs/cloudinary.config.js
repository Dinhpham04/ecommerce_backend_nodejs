'use strict';

const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: 'cloudshopdev',
    api_key: '637694883369659',
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

module.exports = cloudinary