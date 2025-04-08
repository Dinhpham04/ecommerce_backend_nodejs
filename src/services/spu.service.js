'use strict';

const _ = require('lodash')
const { findShopByShopId } = require("../models/repositories/shop.repo");
const { NotFoundError } = require('../core/error.response');
const { createNewSpu, findSpuById, findSpu } = require("../models/repositories/spu.repo");
const { randomProductId } = require("../utils");
const { newSku, allSkuByProductId } = require("./sku.service");

const newSpu = async ({
    product_id, // chỉ làm việc trong proxy để không bị lộ 
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_category,
    product_shop,
    product_attributes,
    product_quantity,
    product_variations,
    sku_list = [], // add nhiều sản phẩm con 
}) => {
    try {
        // 1. check if shop exists 
        const foundShop = await findShopByShopId({ shopId: product_shop })
        if (!foundShop) {
            throw new Error('Shop not found')
        }
        if (!foundShop) {
            throw new NotFoundError('Shop not found')
        }

        // 2. create new spu 
        const spu = await createNewSpu({
            product_id: randomProductId(),
            product_name,
            product_thumb,
            product_description,
            product_price,
            product_category,
            product_shop,
            product_attributes,
            product_quantity,
            product_variations
        })
        // 3. get spu_id add to sku.service
        if (spu && sku_list.length) {
            // 3. create new sku
            await newSku({ sku_list, spu_id: spu.product_id })
        }

        // 4. sync data via elastic search 

        // 5. reponse result object

        return !!spu
    } catch (error) {
        throw error
    }
}

const getOneSpu = async ({ productId }) => {
    try {
        const spu = await findSpu({
            product_id: productId,
            isPublished: false,
        })

        if (!spu) throw new NotFoundError('Product not found')

        const skus = await allSkuByProductId({ productId })
        return {
            spu_info: _.omit(spu, ['__v', 'createdAt', 'updatedAt', 'isDeleted']),
            sku_list: skus
        }

    } catch (error) {
        throw error
    }
}


module.exports = {
    newSpu,
    getOneSpu
}

