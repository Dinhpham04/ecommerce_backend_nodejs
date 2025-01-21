const { cart } = require("../cart.model")


const findCartByUserId = async (userId) => {
    return await cart.findOne({
        cart_userId: userId,
    }).lean()
}

const createUserCart = async ({ userId, product }) => {
    const query = { cart_userId: userId, cart_state: 'active' }
    const updateOrInsert = {
        $addToSet: {
            cart_products: product
        },
        $inc: {
            cart_count_product: 1
        }
    }
    const options = { upsert: true, new: true }
    return await cart.findOneAndUpdate(query, updateOrInsert, options)
}

const updateQuantity = async ({ userId, product }) => {
    const { productId, quantity } = product
    const query = {
        cart_userId: userId,
        'cart_products.productId': productId,
        cart_state: 'active',
    }
    const updateOrInsert = {
        $inc: {
            'cart_products.$.quantity': quantity
        }
    }
    const options = { upsert: true, new: true }

    return await cart.findOneAndUpdate(query, updateOrInsert, options)

}

const updateCart = async ({ userId, product }) => {
    const { productId, quantity } = product
    const query = {
        cart_userId: userId,
        'cart_products.productId': productId,
        cart_state: 'active',
    }
    const updateOrInsert = {
        $set: {
            'cart_products.$[product]': product
        }
    }
    const options = { arrayFilters: [{ 'product.productId': productId }] }

    return await cart.findOneAndUpdate(query, updateOrInsert, options)
}

const checkProductInCart = async (productId) => {
    return await cart.findOne({
        'cart_products.productId': productId,
        cart_state: 'active',
    }).lean()
}

const insertProductToCart = async ({ userId, product = {} }) => {
    const query = { cart_userId: userId, cart_state: 'active' }
    const updateOrInsert = {
        $addToSet: {
            cart_products: product
        },
        $inc: {
            cart_count_product: 1
        }
    }
    const options = { upsert: true, new: true }
    return await cart.findOneAndUpdate(query, updateOrInsert, options)
}

const deleteCart = async ({ query, update, options = { new: true } }) => {
    return await cart.updateOne(query, update, options).lean()
}

const findCartByCartId = async ({ cartId }) => {
    return await cart.findOne({
        _id: cartId,
        cart_state: 'active',
    }).lean()
}


module.exports = {
    findCartByUserId,
    createUserCart,
    updateQuantity,
    deleteCart,
    checkProductInCart,
    insertProductToCart,
    findCartByCartId
    // updateCart
}