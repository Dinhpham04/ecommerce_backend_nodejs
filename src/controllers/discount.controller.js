'use strict'

const { SuccessResponse } = require("../core/success.response")
const DiscountService = require("../services/discount.service")




class DiscountController {
    createDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create Discount Code Success',
            metadata: await DiscountService.createDiscountCode({
                ...req.body,
                shopId: req.user.userId
            })
        }).send(res)
    }


    updateDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: 'update discount Code Success',
            metadata: await DiscountService.updateDiscount({
                ...req.body,
                shopId: req.user.userId
            })
        }).send(res)
    }

    getDiscountAmount = async (req, res, next) => {
        new SuccessResponse({
            message: 'get discount amount successfully',
            metadata: await DiscountService.getDiscountAmount({
                ...req.body
            })
        }).send(res)
    }

    getAllProductsWithDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get All Discount Code With Product Success',
            metadata: await DiscountService.getAllProductsShopWithDiscountCode({
                ...req.query,
            })
        }).send(res)
    }

    getAllDiscountCodesByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get All Discount Code By Shop Success',
            metadata: await DiscountService.getAllDiscountCodesByShop({
                ...req.query,
                shopId: req.user.userId
            })
        }).send(res)
    }
}

module.exports = new DiscountController()