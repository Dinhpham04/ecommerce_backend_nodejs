const { BadRequestError } = require("../core/error.response")


const checkDiscountInfo = ({
    name, description, type, value, code, start_date, end_date,
    max_uses, uses_count, users_used, max_uses_per_user,
    min_order_value, is_active, applies_to, product_ids, max_value
}) => {
    if (typeof name !== 'string') {
        throw new BadRequestError('Name must be a string');
    }

    if (typeof description !== 'string') {
        throw new BadRequestError('Description must be a string');
    }

    if (typeof type !== 'string') {
        throw new BadRequestError('Type must be a string');
    }

    if (typeof value !== 'number' || value < 0) {
        throw new BadRequestError('Value must be a non-negative number');
    }

    if (typeof code !== 'string') {
        throw new BadRequestError('Code must be a string');
    }

    if (typeof start_date !== 'string' || isNaN(Date.parse(start_date))) {
        throw new BadRequestError('Start date must be a valid date string');
    }

    if (typeof end_date !== 'string' || isNaN(Date.parse(end_date))) {
        throw new BadRequestError('End date must be a valid date string');
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    if (startDate > endDate) {
        throw new BadRequestError('Start date must be earlier than end date');
    }

    const currentDate = new Date();
    if (startDate < currentDate) {
        throw new BadRequestError('Start date must not be in the past');
    }

    if (endDate < currentDate) {
        throw new BadRequestError('End date must not be in the past');
    }

    if (typeof max_uses !== 'number' || max_uses < 0) {
        throw new BadRequestError('Max uses must be a non-negative number');
    }

    if (typeof uses_count !== 'number' || uses_count < 0) {
        throw new BadRequestError('Uses count must be a non-negative number');
    }

    if (!Array.isArray(users_used)) {
        throw new BadRequestError('Users used must be an array');
    }

    if (typeof max_uses_per_user !== 'number' || max_uses_per_user < 0) {
        throw new BadRequestError('Max uses per user must be a non-negative number');
    }

    if (typeof min_order_value !== 'number' || min_order_value < 0) {
        throw new BadRequestError('Min order value must be a non-negative number');
    }

    if (typeof is_active !== 'boolean') {
        throw new BadRequestError('Is active must be a boolean');
    }

    if (typeof applies_to !== 'string' || (applies_to !== 'all' && applies_to !== 'specific')) {
        throw new BadRequestError('Applies to must be "all" or "specific"');
    }

    if (!Array.isArray(product_ids) || product_ids.some(id => typeof id !== 'string')) {
        throw new BadRequestError('Product IDs must be an array of strings');
    }

    if (typeof max_value !== 'number' || max_value < 0) {
        throw new BadRequestError('Max value must be a non-negative number');
    }
}




module.exports = {
    checkDiscountInfo
}