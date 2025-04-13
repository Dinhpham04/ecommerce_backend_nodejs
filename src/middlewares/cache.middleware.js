'use strict'

const { CACHE_PRODUCT } = require('../configs/constant')
const { getCacheIO } = require('../models/repositories/cache.repo')


const readCache = async (req, res, next) => {
    const { skuId } = req.query;
    const skuKeyCache = `${CACHE_PRODUCT.SKU}${skuId}`
    let skuCache = await getCacheIO({ key: skuKeyCache })
    if (!skuCache) return next();
    else {
        return res.status(200).json({
            status: 200,
            metadata: {
                ...JSON.parse(skuCache), // chuyển json thành object 
                toLoad: 'cache middleware'
            }
        })
    }

}

module.exports = {
    readCache
}