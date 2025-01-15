'use strict'

const { BadRequestError } = require("../core/error.response")
const { checkDiscountInfo } = require("../helpers/check.discount.info")
const { discount } = require("../models/discount.model")
const { findDiscountByCode } = require("../models/repositories/discount.repo")
const { convertToObjectIdMongoDb } = require("../utils")

/**
 * generator discound code [shop | admin]
 * get discount amount [User]
 * get all discount codes [User | shop]
 * verify discount code 
 * delete discount code [shop | admin] 
 * cancel discount code [user]
 */

class DiscountService {

    static async createDiscountCode(payload) {
        const {
            name, description, type, value, code, start_date, end_date,
            max_uses, uses_count, users_used, max_uses_per_user,
            min_order_value, shopId, is_active, applies_to, product_ids, max_value

        } = payload

        // kiem tra 
        checkDiscountInfo(payload)
        // create index for discount code 
        const foundDiscount = findDiscountByCode({ code, shopId })

        if (foundDiscount && foundDiscount.discount_is_active) {
            throw new BadRequestError('discount is existed')
        }

        const newDiscount = createDiscount({
            name, description, type, value, code, start_date, end_date,
            max_uses, uses_count, users_used, max_uses_per_user,
            min_order_value, shopId, is_active, applies_to, product_ids, max_value
        })

        return newDiscount
    }

    static async updateDiscount(payload) {
        const {
            name, description, type, value, code, start_date, end_date,
            max_uses, uses_count, users_used, max_uses_per_user,
            min_order_value, is_active, applies_to, product_ids, max_value
        } = payload
    }
}
