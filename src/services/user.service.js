'use strict';
const {
    findUserByEmail,
    createNewUser
} = require('../models/repositories/user.repo')
const { ConflictRequestError, NotFoundError } = require('../core/error.response');
const { SuccessResponse } = require('../core/success.response');
const { sendEmailToken } = require('./email.service');
const { checkEmailToken } = require('./otp.service');
const bcrypt = require('bcrypt')
const crypto = require('crypto');
const createKeyPair = require('../utils/createKeyPair');
const { createTokenPair } = require('../auth/authUtils');
const { createKeyToken } = require('./keyToken.service');
const { getInfoData } = require('../utils');


const sendEmailVerify = async ({
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
    const result = await sendEmailToken({ email })
    return {
        token: result
    }
}

const checkLoginEmailTokenService = async ({
    token
}) => {
    // 1. check token in model opt 
    const { otp_email: email } = await checkEmailToken({ token })
    if (!email) {
        throw new NotFoundError(`Token not found or expired`)
    }

    // 2. check email exist in db 
    const user = await findUserByEmail({ email })
    if (user) {
        throw new ConflictRequestError(`Email already exist`)
    }

    // password default = email
    const passwordHash = await bcrypt.hash(email, 10)
    const newUser = await createNewUser({
        usrId: 1,
        usrSlug: 'xyznnvnv',
        usrName: email,
        usrPassword: passwordHash,
        usrEmail: email,
    })

    if (!newUser) {
        throw new ConflictRequestError(`Error: Can not create new user`)
    }

    if (newUser) {
        const { publicKey, privateKey } = createKeyPair() // nguyên tắc cái nào dùng 2 lần viết utils
        // save key to db
        //create token pair
        const tokens = await createTokenPair({ userId: newUser.usr_id, email }, publicKey, privateKey)
        const keyStore = await createKeyToken({
            userId: newUser.usr_id,
            publicKey,
            privateKey,
            refreshToken: tokens.refreshToken
        })
        if (!keyStore) {
            throw new BadRequestError('Error: Can not create key token')
        }


        return {
            user: getInfoData({ fileds: ['usr_id', 'usr_name', 'usr_email'], object: newUser }),
            tokens
        }
    }


}



module.exports = {
    sendEmailVerify,
    checkLoginEmailTokenService
}