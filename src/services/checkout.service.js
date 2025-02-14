'use strict'

const { NotFoundError } = require("../core/error.response")
const { findCartByCartId } = require("../models/repositories/cart.repo")
const { checkProductInDB } = require("../models/repositories/product.repo")
const { getDiscountAmount } = require("./discount.service")

/* 
{
    cartId, 
    userId,
    shop_order_ids: [
    {
        shopId,
        shopDicount: [{
            {
               shopId,
               code
            }
        }],
        itemProducts: [
            price,
            quantity,
            productId,
        ]
    }, 
    
    ]
}
*/

class CheckoutService {

    static async checkoutReview({ cartId, userId, shopOrderIds }) {
        // check cartId ton tai khong ? 
        const foundCart = await findCartByCartId({ cartId })
        if (!foundCart) throw new NotFoundError('cart not found')

        const checkoutOrder = {
            totalPrice: 0,
            feeShip: 0,
            totalDiscount: 0,
            totalCheckout: 0, //Tổng thanh toán 
        }

        const shopOrderIdsNew = []

        // tinh tong tien bill 
        for (let i = 0; i < shopOrderIds.length; i++) {
            const { shopId, shopDiscounts = [], itemProducts = [] } = shopOrderIds[i] // trường hợp có nhiều đơn hàng của nhiều shop khác nhau 
            // check product available 
            const checkProduct = await checkProductInDB({ products: itemProducts })
            if (!checkProduct) throw new BadRequestError('order have some wrong ')

            // tong tien hang 
            const checkoutPrice = checkProduct.reduce((acc, product) => {
                return acc + product.price * product.quantity
            }, 0)

            // tong tien truoc khi xu ly 
            checkoutOrder.totalPrice += checkoutPrice

            const itemCheckout = {
                shopId,
                shopDiscounts,
                priceRaw: checkoutPrice,
                priceApplyDiscount: checkoutPrice,
                itemProducts,
            }

            // neu discount ton tai => check discount (trường hợp này là discount của shop)
            // vấn đề đặt ra là cần kiểm tra thêm discount của toàn sàn => thêm 1 trường trong db là apply to shop or all
            // đối với shopee được apply 1 voucher của shop, 1 voucher miễn phí vận chuyển, 1 voucher của sàn 
            if (shopDiscounts.length > 0) {
                const { totalOrder, discount } = await getDiscountAmount({
                    code: shopDiscounts[0].code,
                    userId,
                    shopId,
                    products: checkProduct
                })
                // tong discount giam gia 
                checkoutOrder.totalDiscount += discount
                // neu tien giam gia lon hon 0 
                if (discount > 0) {
                    itemCheckout.priceApplyDiscount = checkoutPrice - discount
                }
            }
            // tong tien thanh toan cuoi cung 
            checkoutOrder.totalCheckout += itemCheckout.priceApplyDiscount
            shopOrderIdsNew.push(itemCheckout)
        }

        // có thể lưu trữ dàng user đễ checkout rồi trong một collection nào đó 
        return {
            shopOrderIds,
            shopOrderIdsNew,
            checkoutOrder
        }
    }

    static orderByUser({
        shopOrderIds,
        cartId,
        userId,
        userAddress = {},
        userPayment = {},
    }) {
        // check xem có thay đổi gì không
        const { shopOrderIdsNew, checkoutOrder } = CheckoutService.checkoutReview({
            cartId,
            userId,
            shopOrderIds
        })

        // check lai xem co vuot ton kho khong 
        // tạo ra một array của item product 
        const products = shopOrderIdsNew.flatMap(order => order.itemProducts)
        console.log(`[1]: ${products}`)
        
        for (let i = 0; i < products.length; i++) {
            const { productId, quantity } = products[i]
        }
    }
}

module.exports = CheckoutService