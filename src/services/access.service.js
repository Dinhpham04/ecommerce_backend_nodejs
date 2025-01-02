'use strict';

const shopModel = require("../models/shop.model");
const bcrypt = require('bcrypt')

class AccessService {

    static signUp = async ({ name, email, password }) => {
        try {

            const holderShop = await shopModel.findOne({ email }).lean(); // lean trả về dữ liệu dạng object thay vì dạng document
            if (holderShop) {
                return {
                    code: '40001',
                    message: 'Email đã tồn tại',
                    status: 'error',
                }
            }

            const passwordHash = bcrypt.hash(password, 10)
            const newShop = await shopModel.create({
                name, email, password, roles
            })
        } catch (error) {
            return {
                code: 'xxx',
                message: error.message,
                status: 'error',
            }

        }
    }
}

module.exports = AccessService