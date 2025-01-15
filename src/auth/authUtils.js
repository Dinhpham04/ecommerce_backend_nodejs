'use strict';

const JWT = require('jsonwebtoken');
const { asyncHandler } = require('../helpers/asyncHandler');
const { AuthFailureError, NotFoundError } = require('../core/error.response');
const { findByUserId } = require('../services/keyToken.service');

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
    REFRESHTOKEN: 'x-rtoken-id'
}

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        // access token 
        const accessToken = await JWT.sign(payload, privateKey, {
            // algorithm: 'RS256',
            expiresIn: '2 days'
        })

        const refreshToken = await JWT.sign(payload, privateKey, {
            // algorithm: 'RS256',
            expiresIn: '7 days'
        })


        //

        JWT.verify(accessToken, privateKey, (err, decode) => { // nếu sử dụng rsa thì dùng publicKey còn random thì sử dụng key để sign 
            if (err) {
                console.log(`Error verify::`, err)
            } else {
                console.log(`Decode verify::`, decode)
            }
        })

        return { accessToken, refreshToken }
    } catch (error) {
        console.log(error)
    }
}

const authentication = asyncHandler(async (req, res, next) => {
    /*
        1. Check userId messing 
        2. get access token
        3. verify token
        4. check user in dbs
        5. check keystore with this userId?
        6. Ok all => return next()
    */

    const userId = req.headers[HEADER.CLIENT_ID]
    if (!userId) throw new AuthFailureError('Invalid Request')

    // 2 
    const keyStore = await findByUserId(userId)
    if (!keyStore) throw new NotFoundError('Keystore not found')

    // 3 
    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if (!accessToken) throw new AuthFailureError('Invalid request access token')

    try {
        const decodeUser = JWT.verify(accessToken, keyStore.privateKey)
        if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid user');
        req.keyStore = keyStore
        return next();
    } catch (error) {
        throw error
    }
})

const authenticationV2 = asyncHandler(async (req, res, next) => {
    /*
        1. Check userId messing 
        2. get access token
        3. verify token
        4. check user in dbs
        5. check keystore with this userId?
        6. Ok all => return next()
    */

    const userId = req.headers[HEADER.CLIENT_ID]
    if (!userId) throw new AuthFailureError('Invalid Request')

    // 2 
    const keyStore = await findByUserId(userId)
    if (!keyStore) throw new NotFoundError('Keystore not found')

    // 3 
    if (req.headers[HEADER.REFRESHTOKEN]) {
        try {
            const refreshToken = req.headers[HEADER.REFRESHTOKEN]
            const decodeUser = JWT.verify(refreshToken, keyStore.privateKey)
            if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid user');
            req.user = decodeUser
            req.keyStore = keyStore
            req.refreshToken = refreshToken
            return next();
        } catch (error) {
            throw error
        }
    }

    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if (!accessToken) throw new AuthFailureError('Invalid request access token')
    try {
        const decodeUser = JWT.verify(accessToken, keyStore.privateKey)
        if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid user');
        req.user = decodeUser
        req.keyStore = keyStore
        req.accessToken = accessToken
        return next()
    } catch (error) {
        throw new AuthFailureError(error.message)
    }


})
const verifyJWT = async (token, keySecret) => {
    return await JWT.verify(token, keySecret)
}

module.exports = {
    createTokenPair,
    authentication,
    authenticationV2,
    verifyJWT
}