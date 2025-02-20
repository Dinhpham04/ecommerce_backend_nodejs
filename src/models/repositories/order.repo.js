const { order } = require('../order.model')

const createOrder = async ({
    userId, checkoutOrder, userAddress, userPayment, shopOrderIdsNew
}) => {
    const newOrder = await order.create({
        order_userId: userId,
        order_checkout: checkoutOrder,
        order_shipping: userAddress,
        order_payment: userPayment,
        order_product: shopOrderIdsNew,
    })
    return newOrder
}

module.exports = {
    createOrder,
}