'use strict';

const express = require('express');
const productController = require('../../controllers/product.controller');
const commentController = require('../../controllers/comment.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');
const router = express.Router();

router.get('/search/select_variation', asyncHandler(productController.findOneSku))
router.get('/search/:keySearch', asyncHandler(productController.getListSearchProducts))
router.get('', asyncHandler(productController.getAllProducts))
router.get('/:product_id', asyncHandler(productController.getProduct))
router.get('/spu/get-spu-info', asyncHandler(productController.oneSpu))
// :product_id => định nghĩ 1 param là product_id truy cập thông qua req.params.product_id
// query khác với param đó là dùng để lọc dữ liệu

// authentication // 
router.use(authenticationV2)


router.post('/spu/new', asyncHandler(productController.createSpu))
router.post('', asyncHandler(productController.createNewProduct))
router.patch('/:productId', asyncHandler(productController.updateProduct))

router.post('/publish/:id', asyncHandler(productController.publishProductByShop))
router.post('/unpublish/:id', asyncHandler(productController.unPublishProductByShop))

// query //
/**
 * @description get all draft for shop 
 * @param {Number} limit
 * @param {Number} skip
 * @returns {JSON} */
router.get('/drafts/all', asyncHandler(productController.getAllDraftForShop))


router.get('/published/all', asyncHandler(productController.getAllPublishForShop))


module.exports = router