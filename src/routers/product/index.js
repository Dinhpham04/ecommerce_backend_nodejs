'use strict';

const express = require('express');
const productController = require('../../controllers/product.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');
const router = express.Router();

// authentication // 
router.use(authenticationV2)
// logout
router.post('', asyncHandler(productController.createNewProduct))

module.exports = router