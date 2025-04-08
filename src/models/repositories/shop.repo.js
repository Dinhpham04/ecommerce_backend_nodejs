'use strict';

const shopModel = require('../shop.model');

const selectStruct = {
    email: 1, name: 1, status: 1, roles: 1
}
const findShopByShopId = async ({ shopId }) => {
    return await shopModel.findById(shopId).select(selectStruct).lean()
}

module.exports = {
    findShopByShopId
}