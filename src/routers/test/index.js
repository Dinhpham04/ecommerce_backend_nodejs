
'use strict';

const express = require('express');
const { asyncHandler } = require('../../helpers/asyncHandler');

const router = express.Router();

router.get('/status', asyncHandler(() => {
    return { message: 'Hello, World!', status: 'success' };
}))

module.exports = router


// trong thực tế thì thường upload hình ảnh trước khi nhập một thông tin nào đó, điều này yêu cầu 1 service riêng biệt thực hiện