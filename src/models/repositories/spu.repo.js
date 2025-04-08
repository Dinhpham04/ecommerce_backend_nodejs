'use strict'

const spuModel = require('../product.model')

const createNewSpu = async (spuObj) => {
    return await spuModel.create(spuObj)
}


const findSpu = async (query) => {
    return await spuModel.findOne(query).lean()
}


module.exports = {
    createNewSpu,
    findSpu
}