'use strict'

const { BadRequestError } = require('../core/error.response')
const { product, clothing, electronic } = require('../models/product.model')

// define factory class to create product
class ProductFactory {
    static async createProduct(type, payload) {
        switch (type) {
            case 'Electronic':
                return new Electronic(payload).createProduct();
            case 'Clothing':
                return new Clothing(payload).createProduct();
            default:
                throw new BadRequestError('Invalid product type')
        }
    }
}

// define base product 
class Product {
    constructor({ product_name, product_thumb, product_decription, product_price, product_quantity, product_type, product_shop, product_attributes }) {
        this.product_name = product_name
        this.product_thumb = product_thumb
        this.product_description = product_decription
        this.product_price = product_price
        this.product_quantity = product_quantity
        this.product_type = product_type
        this.product_shop = product_shop
        this.product_attributes = product_attributes
    }

    // Create a new product 
    async createProduct(product_id) {
        return await product.create({ ...this, _id: product_id })
    }
}

// define sub-class for different product types clothing
class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if (!newClothing) throw new BadRequestError('Error create new clothing')

        const newProduct = await super.createProduct(newClothing._id)
        if (!newProduct) throw new BadRequestError('Error create new product')

        return newProduct
    }
}

// define sub-class for different product types clothing
class Electronic extends Product {
    async createProduct() {
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if (!newElectronic) throw new BadRequestError('Error create new clothing')

        const newProduct = await super.createProduct(newElectronic._id)
        if (!newProduct) throw new BadRequestError('Error create new product')

        return newProduct

    }
}

module.exports = ProductFactory