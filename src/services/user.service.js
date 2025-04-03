'use strict';
const {
    findUserByEmail
} = require('../models/repositories/user.repo')
const { ConflictRequestError } = require('../core/error.response');
const { SuccessResponse } = require('../core/success.response');
const newUser = async ({
    email = null,
    capcha = null
}) => {
    // 1. check email exist in db
    const user = await findUserByEmail({ email }) // Hệ thống lớn sẽ sử dụng redis 

    // 2.if exist 
    if (user) {
        throw new ConflictRequestError(`Email already exist`)
    }

    // 3. send token via email 

    return new SuccessResponse({
        message: 'verify email user',
        metadata: {
            token
        }
    })
}