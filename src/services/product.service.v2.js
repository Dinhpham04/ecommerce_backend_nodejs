'use strict'

const { BadRequestError } = require('../core/error.response')
const { product, clothing, electronic, furniture } = require('../models/product.model')
const { insertInventory } = require('../models/repositories/inventory.repo')
const {
    publishProductByShop,
    findAllDraftsForShop,
    findAllPublishForShop,
    unPublishProductByShop,
    searchProductsByUser,
    findAllProducts,
    findProduct,
    updateProductById,
} = require('../models/repositories/product.repo')
const { updateNestedObjectParser, removeUndefinedObject } = require('../utils')

// define factory class to create product
class ProductFactory {

    static productRegistry = {}

    static registerProductType(type, classRef) {
        ProductFactory.productRegistry[type] = classRef
    }
    static async createProduct(type, payload) {
        const productClass = ProductFactory.productRegistry[type]
        if (!productClass) throw new BadRequestError(`invalid type ${type}`)

        return new productClass(payload).createProduct()
    }

    static async updateProduct({ productId, payload }) {
        const product = await findProduct({ product_id: productId })
        const type = product.product_type
        const productClass = ProductFactory.productRegistry[type]
        if (!productClass) throw new BadRequestError(`invalid type ${type}`)
        return new productClass(payload).updateProduct(productId)
    }

    // PUT //
    static async publishProductByShop({ product_shop, product_id }) {
        return await publishProductByShop({ product_shop, product_id })
    }

    static async unPublishProductByShop({ product_shop, product_id }) {
        return await unPublishProductByShop({ product_shop, product_id })
    }
    // PUT END //

    // query //

    static async findAllDraftForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isDraft: true }
        return await findAllDraftsForShop({ query, limit, skip })
    }

    static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isDraft: false, isPublished: true }
        return await findAllPublishForShop({ query, limit, skip })
    }

    static async searchProducts({ keySearch }) {
        return await searchProductsByUser({ keySearch })
    }

    static async findAllProducts({ limit = 50, sort = 'ctime', page = 1, filter = { isPublished: true },
        select = ['product_name', 'product_price', 'product_thumb'] }) {
        return await findAllProducts({ limit, sort, filter, page, select })
    }

    static async findProduct({ product_id, unSelect = ['__v'] }) {
        return await findProduct({ product_id, unSelect })
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
        const newProduct = await product.create({ ...this, _id: product_id })
        if (newProduct) {
            // add product_stock in inventory collection 
            await insertInventory({
                productId: newProduct._id,
                shopId: this.product_shop,
                stock: this.product_quantity
            })
        }
        return newProduct
    }

    async updateProduct(productId, bodyUpdate) {
        return await updateProductById({ productId, bodyUpdate, model: product, isNew: true })
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

    async updateProduct(productId, bodyUpdate) {
        // 1. remove attributes null or undefined 
        let objectParams = this
        //2. 
        if (objectParams.product_attributes) {
            await updateProductById({
                productId,
                bodyUpdate: updateNestedObjectParser(objectParams.product_attributes),
                model: clothing
            })
        }

        const updateProduct = await super.updateProduct(productId, updateNestedObjectParser(objectParams))
        return updateProduct
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

    async updateProduct(productId, bodyUpdate) {
        // 1. remove attributes null or undefined 
        let objectParams = this
        //2. 
        if (objectParams.product_attributes) {
            await updateProductById({
                productId,
                bodyUpdate: updateNestedObjectParser(objectParams.product_attributes),
                model: electronic
            })
        }

        const updateProduct = await super.updateProduct(productId, updateNestedObjectParser(objectParams))
        return updateProduct
    }
}

class Furniture extends Product {
    async createProduct() {
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if (!newFurniture) throw new BadRequestError('Error create new clothing')

        const newProduct = await super.createProduct(newFurniture._id)
        if (!newProduct) throw new BadRequestError('Error create new product')

        return newProduct

    }
}

// register product type 
ProductFactory.registerProductType('Electronic', Electronic)
ProductFactory.registerProductType('Clothing', Clothing)
ProductFactory.registerProductType('Furniture', Furniture)


module.exports = ProductFactory