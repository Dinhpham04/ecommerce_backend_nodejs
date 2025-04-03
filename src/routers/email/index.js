'use strict';

const express = require('express');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');
const { newTemplate } = require('../../controllers/email.controller');

const router = express.Router();


// authentication // 
// router.use(authenticationV2)

// new template
router.post('/new-template', asyncHandler(newTemplate))


module.exports = router