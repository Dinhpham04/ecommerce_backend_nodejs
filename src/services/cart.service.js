'use strict'

const { NotFoundError } = require("../core/error.response")
const { findCartByUserId, createUserCart, deleteCart, checkProductInCart, updateQuantity, insertProductToCart, updateCart } = require("../models/repositories/cart.repo")
const { getProductById } = require("../models/repositories/product.repo")

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
        if (!userId || product.length === 0) {
            throw new NotFoundError(`Missing userId or product`)
        }
        const userCart = await findCartByUserId(userId)
        if (!userCart) {
            // create new cart 
            return await createUserCart({ userId, product })
        }
        // neu co gio hang nhung chua co san pham 
        if (userCart.cart_products.length === 0) {
            userCart.cart_products = [product]
            userCart.cart_count_product += 1
            return await userCart.save()
        }

        // gio hang nay da ton tai va co san pham => neu san pham da ton tai thi cap nhap so luong 
        const foundProduct = await checkProductInCart(product.productId)
        if (foundProduct) {
            // update quantity
            return await updateQuantity({ userId, product })
        } // neu san pham chua ton tai thi them san pham
        else {
            return await insertProductToCart({ userId, product })
        }
    }

    /* 
    Update cart
    shop_order_ids: [
        {
            shopId,
            item_products: [
            {quantity,
            price,
            shopId,
            old_quantity:
            quantity,
            productId}
            ]  , version
        }
    ]
    
    */

    static async addToCartV2({ userId, shopOrderIds }) {
        const { productId, quantity, oldQuantity } = shopOrderIds[0]?.itemProducts[0]
        // check product 
        const foundProduct = await getProductById(productId)
        if (!foundProduct) throw new NotFoundError('Not found product to add to cart')
        // compare 
        if (foundProduct.product_shop.toString() !== shopOrderIds[0]?.shopId) {
            throw new NotFoundError('Product do not belong to the shop')
        }

        if (quantity === 0) {
            // delete
        }

        return await updateQuantity({
            userId,
            product: {
                productId,
                quantity: quantity - oldQuantity // increase or decrease based on the amount of change
            }
        })
    }

    // xoa di nhung phai luu vao dao do de backup

    static async deleteUserCart({ userId, productId }) {
        const query = { cart_userId: userId, cart_state: 'active' }
        const updateSet = {
            $pull: {
                cart_products: {
                    productId
                }
            },
            $inc: {
                cart_count_product: -1
            }
        }
        return await deleteCart({ query, update: updateSet })
    }

    static async getListCart({ userId, }) {
        return await findCartByUserId(userId)
    }
}

module.exports = CartService