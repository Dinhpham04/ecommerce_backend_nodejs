'use strict';

const USER = require('../user.model')

const findUserByEmail = async ({ email }) => {
    return await USER.findOne({ email }).lean()
}

module.exports = {
    findUserByEmail
}