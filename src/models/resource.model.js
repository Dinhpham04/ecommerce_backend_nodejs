'use strict'

const { model, Schema } = require('mongoose')

const DOCUMENT_NAME = 'Resource'
const COLLECTION_NAME = 'Resources'

const resourceSchema = new Schema({
    src_name: { type: String, required: true },  // profile
    src_slug: { type: String, required: true }, // 00001
    src_description: { type: String, default: '' } // mo ta
}, {
    collection: COLLECTION_NAME,
    timestamps: true,
})

module.exports = {
    cart: model(DOCUMENT_NAME, resourceSchema)
}