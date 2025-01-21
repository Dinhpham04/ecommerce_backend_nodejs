'use strict';

const express = require('express');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');
const cartController = require('../../controllers/cart.controller');
const router = express.Router();



// authentication // 
router.use(authenticationV2)
router.post('', asyncHandler(cartController.addToCart))
router.delete('', asyncHandler(cartController.deleteCart))
router.patch('/update', asyncHandler(cartController.updateCart))
router.get('', asyncHandler(cartController.getListCart))


module.exports = router