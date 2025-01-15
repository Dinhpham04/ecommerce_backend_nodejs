'use strict'

const _ = require('lodash')
const { Types } = require('mongoose')

const convertToObjectIdMongoDb = id => Types.ObjectId(id)
const getInfoData = ({ fileds = [], object = {} }) => {
    return _.pick(object, fileds)
}

const getSelectData = (select = []) => {
    return Object.fromEntries(select.map(el => [el, 1]))
}

const unGetSelectData = (select = []) => {
    return Object.fromEntries(select.map(el => [el, 0]))
}

const removeUndefinedObject = obj => {
    Object.keys(obj).forEach(key => {
        if (obj[key] === null || undefined) {
            delete obj[key]
        }
    })
    return obj
}

const updateNestedObjectParser = obj => {
    const final = {}
    Object.keys(obj).forEach(k => {
        if (typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
            if (obj[k] !== null && obj[k] !== undefined) {
                const response = updateNestedObjectParser(obj[k])
                Object.keys(response).forEach(a => {
                    final[`${k}.${a}`] = response[a]
                })
            } else {
                delete obj[k]
            }
        } else {
            final[k] = obj[k]
        }
    })
    console.log(final)
    return final
}
module.exports = {
    getInfoData,
    getSelectData,
    unGetSelectData,
    removeUndefinedObject,
    updateNestedObjectParser,
    convertToObjectIdMongoDb
}