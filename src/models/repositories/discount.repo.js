'use strict'
const { unGetSelectData } = require("../../utils");
const { discount } = require("../discount.model")



const findDiscountByCode = async ({ filter }) => {
    return await discount.findOne(filter).lean();
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
        discount_product_ids: applies_to === 'all' ? [] : product_ids
    })
}

const updateDiscountByCode = async ({
    shopId, name, description, type, value, code, start_date, end_date,
    max_uses, uses_count, max_uses_per_user,
    min_order_value, is_active, applies_to, max_value, isNew = true
}) => {
    return await discount.findOneAndUpdate({
        discount_code: code,
        discount_shopId: shopId,
    },
        {
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_value: value,
            discount_max_value: max_value,
            discount_start_date: start_date ? new Date(start_date) : undefined,
            discount_end_date: end_date ? new Date(end_date) : undefined,
            discount_max_uses: max_uses,
            discount_uses_count: uses_count,
            discount_max_uses_per_user: max_uses_per_user,
            discount_min_order_value: min_order_value,
            discount_is_active: is_active,
            discount_applies_to: applies_to,
        },
        {
            new: isNew
        }
    )
}

const findAllDiscountCodesUnselect = async ({
    limit = 50, page = 1, sort = 'ctime', filter, unSelect,
}) => {
    const skip = (page - 1) * limit
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
    const discounts = await discount.find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(unGetSelectData(unSelect))
        .lean()

    return discounts
}

const findAllDiscountCodesSelect = async ({
    limit = 50, page = 1, sort = 'ctime', filter, select,
}) => {
    const skip = (page - 1) * limit
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
    const discounts = await discount.find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(unGetSelectData(select))
        .lean()

    return discounts
}

const checkDiscountExists = async ({ filter }) => {
    return await discount.findOne(filter)
}

const deleteDiscount = async ({ filter }) => {
    return await discount.findOneAndDelete(filter)
}

const findDiscountByIdAndUpdate = async ({ id, filter }) => {
    return await discount.findByIdAndUpdate(id, filter)
}

module.exports = {
    findDiscountByCode,
    createDiscount,
    findAllDiscountCodesUnselect,
    findAllDiscountCodesSelect,
    checkDiscountExists,
    deleteDiscount,
    findDiscountByIdAndUpdate,
    updateDiscountByCode
}