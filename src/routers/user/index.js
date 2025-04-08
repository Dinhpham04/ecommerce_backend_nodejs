'use strict';

const express = require('express');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');
const { sendEmailVerifyToUser, checkLoginEmailToken } = require('../../controllers/user.controller');
const router = express.Router();


// authentication // 
// router.use(authenticationV2)

router.post('/new-user', asyncHandler(sendEmailVerifyToUser))
router.get('/verify-email', asyncHandler(checkLoginEmailToken))

module.exports = router