'use strict';

const express = require('express');
const discountController = require('../../controllers/discount.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');
const router = express.Router();

// get amount a discount 
router.post('/amount', asyncHandler(discountController.getDiscountAmount))
router.get('/list-products-by-code', asyncHandler(discountController.getAllProductsWithDiscountCode))

// authentication // 
router.use(authenticationV2)

router.post('', asyncHandler(discountController.createDiscountCode))
router.patch('/update', asyncHandler(discountController.updateDiscountCode))
router.get('/shop', asyncHandler(discountController.getAllDiscountCodesByShop))


module.exports = router