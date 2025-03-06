'use strict';

const express = require('express');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');
const notificationController = require('../../controllers/notification.controller')
const router = express.Router();

// here not login


// authentication // 

router.get('', notificationController.listNotiByUser)
module.exports = router