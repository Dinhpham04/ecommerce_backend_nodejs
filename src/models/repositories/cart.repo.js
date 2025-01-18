const { cart } = require("../cart.model")


const findCartByUserId = async (userId) => {
    return await cart.findOne({
        cart_userId: userId,
    })
}

const createUserCart = async ({ userId, product }) => {
    const query = { cart_userId: userId, cart_state: 'active' }
    const updateOrInsert = {
        $addToSet: {
            cart_products: product
        }
    }
    const options = { upsert: true, new: true }
    return await cart.findOneAndUpdate(query, updateOrInsert, options)
}

module.exports = {
    findCartByUserId,
    createUserCart
}