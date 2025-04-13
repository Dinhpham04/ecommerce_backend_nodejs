'use strict';
const _ = require('lodash');
const skuModel = require('../models/sku.model');
const { randomProductId } = require('../utils');
const { findSpu } = require('../models/repositories/spu.repo');
const { NotFoundError } = require('../core/error.response');
const { CACHE_PRODUCT } = require('../configs/constant');
const { setCacheIOExpiration } = require('../models/repositories/cache.repo');

const newSku = async ({
    spu_id,
    sku_list
}) => {
    const convert_sku_list = sku_list.map(sku => {
        return {
            ...sku,
            product_id: spu_id,
            sku_id: `${spu_id}.${randomProductId()}` // tam thoi 
        }
    })
    const skus = await skuModel.create(convert_sku_list)
    return skus
}

const oneSku = async ({ skuId, productId }) => {
    try {
        // 1. check params 
        if (skuId < 0 || productId < 0) return null;
        // 3 read from db if cache not exists
        const skuKeyCache = `${CACHE_PRODUCT.SKU}${skuId}`

        // read from dbs 
        const skuCache = await skuModel.findOne({
            sku_id: skuId,
            product_id: productId
        }).lean()

        const valueCache = skuCache ? skuCache : null
        setCacheIOExpiration({
            key: skuKeyCache,
            value: JSON.stringify(valueCache),
            expirationInSeconds: 3600
        }).then()

        // return _.omit(sku, ['__v', 'updatedAt', 'createdAt', 'isDeleted'])
        return {
            ...skuCache,
            toLoad: 'dbs'
        }
    } catch (error) {
        console.log(error.message);
        throw error
    }
}

const allSkuByProductId = async ({ productId }) => {
    try {
        // 1. check spu id 
        const foundSpu = await findSpu({ product_id: productId })
        if (!foundSpu) throw new NotFoundError('Product not found')
        const skus = await skuModel.find({ product_id: productId }).lean()
        return skus.map(sku => _.omit(sku, ['__v', 'updatedAt', 'createdAt', 'isDeleted']))
    } catch (error) {
        throw error
    }
}

module.exports = {
    newSku,
    oneSku,
    allSkuByProductId
}