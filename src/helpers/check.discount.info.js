const { BadRequestError } = require("../core/error.response")


const checkDiscountInfo = ({
    name, description, type, value, code, start_date, end_date,
    max_uses, uses_count, users_used, max_uses_per_user,
    min_order_value, is_active, applies_to, product_ids, max_value
}) => {
    if (typeof name !== 'string' ||
        typeof description !== 'string' ||
        typeof type !== 'string' ||
        typeof value !== 'number' || value < 0 ||
        typeof code !== 'string' ||
        typeof start_date !== 'string' || isNaN(Date.parse(start_date)) ||
        typeof end_date !== 'string' || isNaN(Date.parse(end_date)) ||
        start_date > end_date ||
        start_date < new Date() || end_date < new Date() ||
        start_date > end_date ||
        typeof max_uses !== 'number' || max_uses < 0 ||
        typeof uses_count !== 'number' || uses_count < 0 ||
        typeof users_used !== 'number' || users_used < 0 ||
        typeof max_uses_per_user !== 'number' || max_uses_per_user < 0 ||
        typeof min_order_value !== 'number' || min_order_value < 0 ||
        typeof is_active !== 'boolean' ||
        typeof applies_to !== 'string' || (applies_to !== 'all' && !applies_to !== 'specific') ||
        typeof product_ids !== 'object' || !Array.isArray(product_ids) || product_ids.some(id => typeof id !== 'string') ||
        typeof max_value !== 'number' || max_value < 0
    ) {
        throw new BadRequestError('Invalid discount info type of value')
    }
}



module.exports = {
    checkDiscountInfo
}