'use strict';
const crypto = require('crypto');
const OTP = require('../models/otp.model');
const { NotFoundError } = require('../core/error.response');

const generatorTokenRandom = () => {
    const token = crypto.randomInt(0, Math.pow(2, 32))
    return token
}

const newOtp = async ({ email }) => {
    const token = generatorTokenRandom()
    const newToken = await OTP.create({
        otp_token: token,
        otp_email: email
    })
    return newToken
}

const checkEmailToken = async ({ token }) => {
    // check token in model otp
    const tokenCheck = await OTP.findOne({
        otp_token: token
    })
    if (!tokenCheck) {
        throw new NotFoundError(`Token not found`)
    }

    //delete token from model 
    await OTP.deleteOne({
        otp_token: token
    })

    return tokenCheck; // chứa thông tin opt_email
}
module.exports = {
    newOtp,
    checkEmailToken
}