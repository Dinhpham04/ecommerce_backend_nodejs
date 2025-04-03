'use strict';

const nodemailer = require('nodemailer')

const transport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'shopdev.dinhpham@gmail.com',         // Thay bằng email miễn phí của bạn
        pass: 'ejpw xuyj czpx ylas',
    }
})

module.exports = transport