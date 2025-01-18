'use strict'

const { BadRequestError, NotFoundError } = require("../core/error.response")
const { checkDiscountInfo } = require("../helpers/check.discount.info")
const { discount } = require("../models/discount.model")
const {
    findDiscountByCode,
    findAllDiscountCodesUnselect,
    checkDiscountExists,
    deleteDiscount,
    findDiscountByIdAndUpdate,
    createDiscount,
    updateDiscountByCode
} = require("../models/repositories/discount.repo")
const { findAllProducts } = require("../models/repositories/product.repo")
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
        const foundDiscount = await findDiscountByCode({
            filter: {
                discount_code: code,
                discount_shopId: shopId
            }
        })

        if (foundDiscount) {
            throw new BadRequestError('discount is existed or not active')
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
            shopId, name, description, type, value, code, start_date, end_date,
            max_uses, uses_count, users_used, max_uses_per_user,
            min_order_value, is_active, applies_to, product_ids, max_value
        } = payload
        // validate update discount info 
        // checkDiscountInfo(payload)
        const updatedDiscount = await updateDiscountByCode({
            shopId, name, description, type, value, code, start_date, end_date,
            max_uses, uses_count, max_uses_per_user,
            min_order_value, is_active, applies_to, max_value
        })

        return updatedDiscount
    }

    static async getAllProductsShopWithDiscountCode({ code, shopId, limit, page }) {
        // create index for discount_code 
        const foundDiscount = await findDiscountByCode({
            filter: {
                discount_code: code,
                discount_shopId: shopId,
            }
        })

        if (!foundDiscount || !foundDiscount.discount_is_active) {
            throw new NotFoundError(`Discount not exist!`)
        }

        const { discount_applies_to, discount_product_ids } = foundDiscount
        let products
        if (discount_applies_to === 'all') {
            // get all products
            products = await findAllProducts({
                filter: {
                    product_shop: shopId,
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name', 'product_price', 'product_thumb']
            })

        }

        if (discount_applies_to === 'specific') {
            // get the products ids
            products = await findAllProducts({
                filter: {
                    _id: { $in: discount_product_ids },
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name', 'product_price', 'product_thumb']
            })
        }

        return products
    }

    static async getAllDiscountCodesByShop({
        limit, page, shopId
    }) {
        const discounts = await findAllDiscountCodesUnselect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: convertToObjectIdMongoDb(shopId),
                discount_is_active: true
            },
            unSelect: ['__v', 'discount_shopId', 'updatedAt', 'createdAt']
        })
        return discounts
    }

    /* 
        Apply discount code 
        products = [
            {
                productId,
                shopId,
                quantity,
                name,
                price,
            }
        ]
    */

    static async getDiscountAmount({ code, userId, shopId, products }) {
        const foundDiscount = await checkDiscountExists({
            filter: {
                discount_code: code,
                discount_shopId: convertToObjectIdMongoDb(shopId),
            }
        })
        if (!foundDiscount) {
            throw new NotFoundError(`Discount not exist!`)
        }

        const {
            discount_is_active,
            discount_max_uses,
            discount_min_order_value,
            discount_start_date,
            discount_end_date,
            discount_users_used,
            discount_value,
            discount_max_value,
            discount_max_uses_per_user,
            discount_type
        } = foundDiscount

        if (!discount_is_active) throw new NotFoundError(`Discount not active`)
        if (!discount_max_uses) throw new NotFoundError(`Discount are out`)

        if (new Date() > new Date(discount_end_date)) {
            throw new NotFoundError(`Discount is expired`)
        }

        // check xem co gia tri toi thieu khong 
        let totalOrder = 0
        if (discount_min_order_value > 0) {
            totalOrder = products.reduce((acc, product) => {
                return acc + product.quantity * product.price
            }, 0)

            if (totalOrder < discount_min_order_value) {
                throw new BadRequestError(`Total order value is smaller than minimum order value`)
            }
        }

        // check xem con luot su dung khong

        if (discount_max_uses_per_user > 0) {
            const userUsedDiscount = discount_users_used.find(user => user.user_id === userId)
            if (userUsedDiscount) {
                const discountUsedCount = userUsedDiscount.usage_count
                if (discountUsedCount >= discount_max_uses_per_user) {
                    throw new BadRequestError(`This discount code has been used ${discountUsedCount} times`)
                }
            }
        }

        // check xem discount nay la fixed_amount hay percent 
        let amount = discount_type === 'fixed_amount' ? discount_value : totalOrder * (discount_value / 100)
        amount = discount_type === 'percentage' && amount > discount_max_value ? discount_max_value : amount
        return {
            totalOrder,
            discount: amount,
            totalPrice: totalOrder > amount ? totalOrder - amount : 0,
        }
    }

    /**
     * Trong database không có khái niệm là xóa vĩnh viễn dữ liệu
     * Thay vào đó sẽ có 3 cách: lưu vào db khác hoặc schema khác, hoặc thêm một trường đánh dấu là đã xóa 
     */
    static async deleteDiscountCode({ shopId, codeId }) {
        const foundDiscount = await checkDiscountExists({
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongoDb(shopId),
            }
        })

        if (!foundDiscount) {
            throw new NotFoundError(`Discount not exist!`)
        }

        // phát triển thêm chức năng kiểm tra nếu discount được sử dụng ở đâu đó thì logic sẽ khác 

        const deleted = await deleteDiscount({
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongoDb(shopId)
            }
        })

        return deleted
    }

    /* 
        cancel discount code 
    */
    static async cancelDiscountCode({ shopId, codeId, userId }) {
        const foundDiscount = await checkDiscountExists({
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongoDb(shopId),
            }
        })

        if (!foundDiscount) {
            throw new NotFoundError(`Discount not exist!`)
        }

        const result = await findDiscountByIdAndUpdate(foundDiscount._id, {
            $pull: {
                discount_users_used: userId,
            },
            $inc: {
                discount_max_uses: 1,
                discount_uses_count: -1
            }
        })

        return result
    }
}


module.exports = DiscountService
