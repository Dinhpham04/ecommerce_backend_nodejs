'use strict'

const { findCartByUserId, createUserCart } = require("../models/repositories/cart.repo")

/**
 * add product to cart
 * reduct product quantity by one
 * increase product quantity by user 
 * get cart 
 * delete cart
 * delete cart item 
 */

class CartService {
    static async addToCart({ userId, product = {} }) {
        const userCart = await findCartByUserId(userId)
        if (!userCart) {
            // create new cart 
            return await createUserCart({ userId, product })
        }
        // neu co gio hang nhung chua co san pham 
        if (userCart.cart_products.length === 0) {
            userCart.cart_products = [product]
        }
    }
}