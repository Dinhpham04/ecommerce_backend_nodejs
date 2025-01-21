const { SuccessResponse } = require("../core/success.response")
const CartService = require("../services/cart.service")



class CardController {

    addToCart = async (req, res, next) => {
        new SuccessResponse({
            message: 'Add to cart success',
            metadata: await CartService.addToCart(req.body)
        }).send(res)
    }

    updateCart = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update cart success',
            metadata: await CartService.addToCartV2(req.body)
        }).send(res)
    }

    deleteCart = async (req, res, next) => {
        new SuccessResponse({
            message: 'delete cart success',
            metadata: await CartService.deleteUserCart(req.body)
        }).send(res)
    }

    getListCart = async (req, res, next) => {
        console.log(req.query)
        new SuccessResponse({
            message: 'get list cart success',
            metadata: await CartService.getListCart(req.query)
        }).send(res)
    }
}

module.exports = new CardController()