'use strict'

const ProductService = require('../services/product.service')
const ProductServiceV2 = require('../services/product.service.v2')

const { SuccessResponse } = require('../core/success.response')

class ProductController {

    createNewProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Product created successfully',
            metadata: await ProductServiceV2.createProduct(req.body.product_type, {
                ...req.body,
                product_shop: req.user.userId
            }),
        }).send(res);
    }

    updateProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Product updated successfully',
            metadata: await ProductServiceV2.updateProduct({
                productId: req.params.productId,
                payload: req.body,
            }),
        }).send(res);
    }

    publishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Product published successfully',
            metadata: await ProductServiceV2.publishProductByShop({
                product_shop: req.user.userId,
                product_id: req.params.id
            })
        }).send(res);
    }

    unPublishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Product unpublished successfully',
            metadata: await ProductServiceV2.unPublishProductByShop({
                product_shop: req.user.userId,
                product_id: req.params.id
            })
        }).send(res);
    }
    // QUERY //
    getAllDraftForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list draft success!',
            metadata: await ProductServiceV2.findAllDraftForShop({
                product_shop: req.user.userId
            }),
        }).send(res);
    }

    getAllPublishForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'get list publish success!',
            metadata: await ProductServiceV2.findAllPublishForShop({
                product_shop: req.user.userId
            })
        }).send(res);
    }

    getListSearchProducts = async (req, res, next) => {
        new SuccessResponse({
            message: 'get list search product success!',
            metadata: await ProductServiceV2.searchProducts(req.params)
        }).send(res);
    }

    getAllProducts = async (req, res, next) => {
        new SuccessResponse({
            message: 'get list all product success!',
            metadata: await ProductServiceV2.findAllProducts(req.query)
        }).send(res);
    }

    getProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'get product success!',
            metadata: await ProductServiceV2.findProduct({
                product_id: req.params.product_id,
                // unSelect: req.params.unSelect
            })
        }).send(res);
    }
    // END QUERY //


}

module.exports = new ProductController()