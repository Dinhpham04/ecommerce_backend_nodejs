'use strict'
const { discount } = require("../discount.model")



const findDiscountByCode = async ({ code, shopId }) => {
    return await discount.findOne({
        discount_code: code,
        discount_shopId: shopId
    }).lean();
}

const createDiscount = async ({
    name, description, type, value, code, start_date, end_date,
    max_uses, uses_count, users_used, max_uses_per_user,
    min_order_value, shopId, is_active, applies_to, product_ids, max_value
}) => {
    return await discount.create({
        discount_name: name,
        discount_description: description,
        discount_type: type,
        discount_value: value,
        discount_max_value: max_value,
        discount_code: code,
        discount_start_date: new Date(start_date),
        discount_end_date: new Date(end_date),
        discount_max_uses: max_uses,
        discount_uses_count: uses_count,
        discount_users_used: users_used,
        discount_max_uses_per_user: max_uses_per_user,
        discount_min_order_value: min_order_value || 0,
        discount_shopId: shopId,
        discount_is_active: is_active,
        discount_applies_to: applies_to,
        discoutt_product_ids: applies_to === 'all' ? [] : product_ids
    })
}

module.exports = {
    findDiscountByCode,
    createDiscount
}