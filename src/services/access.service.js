'use strict';

const shopModel = require("../models/shop.model");
const bcrypt = require('bcrypt')
const crypto = require('crypto');
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError, AuthFailureError, ForbiddenError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");
const createKeyPair = require("../utils/createKeyPair");
const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN',
}
class AccessService {

    static handlerRefreshTokenV2 = async ({ keyStore, user, refreshToken }) => {
        // verify token 
        const { userId, email } = user

        if (keyStore.refreshTokenUsed.includes(refreshToken)) {
            await KeyTokenService.deleteKeyById(userId);
            throw new ForbiddenError('Something wrong happened !! pls relogin')
        }

        if (keyStore.refreshToken !== refreshToken) {
            throw new AuthFailureError('Shop not registered')
        }

        // check userId 
        const foundShop = await findByEmail({ email })
        if (!foundShop) throw new AuthFailureError('Shop not registered')

        // create new token pair 
        const tokens = await createTokenPair({ userId, email }, keyStore.publicKey, keyStore.privateKey)

        // update token 
        await keyStore.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokenUsed: refreshToken // da duoc su dung de lay token moi 
            }
        })

        return {
            user,
            tokens
        }

    }
    /*
        check this token used ? 
    */
    static handlerRefreshToken = async (refreshToken) => {
        // check xem token co bi lo khong 
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)
        // neu bi lo 
        if (foundToken) {
            // decode xem user la ai 
            const { userId, email } = await verifyJWT(refreshToken, foundToken.privateKey)
            console.log({ userId, email })
            // xóa keyStore
            await KeyTokenService.deleteKeyById(userId);
            throw new ForbiddenError('Something wrong happened !! pls relogin')
        }

        // No 
        const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
        if (!holderToken) throw new AuthFailureError('Shop not registered')

        // verify token 
        const { userId, email } = await verifyJWT(refreshToken, holderToken.privateKey)
        // check userId 
        const foundShop = await findByEmail({ email })
        if (!foundShop) throw new AuthFailureError('Shop not registered')

        // create new token pair 
        const tokens = await createTokenPair({ userId, email }, holderToken.publicKey, holderToken.privateKey)

        // update token 
        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokenUsed: refreshToken // da duoc su dung de lay token moi 
            }
        })

        return {
            user: { userId, email },
            tokens
        }
    }

    static logout = async (keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore)
        console.log({ delKey })
        return delKey;
    }


    /*
        1. check email in dbs
        2. match password
        3. create AT, RT and save
        4. ganerate tokens
        5. get data return login 
    */
    static login = async ({ email, password, refreshToken = null }) => {
        // 1- check email in dbs
        const foundShop = await findByEmail({ email })
        if (!foundShop) {
            throw new BadRequestError('Error: Shop not found')
        }

        // 2- match password
        const match = await bcrypt.compare(password, foundShop.password)
        if (!match) {
            throw new AuthFailureError('Authentication error')
        }

        // 3- create AT, RT and save
        const { publicKey, privateKey } = createKeyPair()
        const { _id: userId } = foundShop
        const tokens = await createTokenPair({ userId, email }, publicKey, privateKey)

        await KeyTokenService.createKeyToken({
            userId,
            publicKey,
            privateKey,
            refreshToken: tokens.refreshToken
        })
        return {
            shop: getInfoData({ fileds: ['_id', 'name', 'email'], object: foundShop }),
            tokens
        }
    }


    static signUp = async ({ name, email, password }) => {
        const holderShop = await shopModel.findOne({ email }).lean(); // lean trả về dữ liệu dạng object thay vì dạng document
        if (holderShop) {
            throw new BadRequestError('Error: Shop already exists')
        }

        const passwordHash = await bcrypt.hash(password, 10)
        const newShop = await shopModel.create({
            name, email, password: passwordHash, roles: [RoleShop.SHOP]
        })

        if (newShop) {
            // created privateKey, publicKey using rsa
            // const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
            //     modulusLength: 4096,
            //     publicKeyEncoding: {
            //         type: 'pkcs1',
            //         format: 'pem'
            //     },
            //     privateKeyEncoding: {
            //         type: 'pkcs1',
            //         format: 'pem'
            //     }
            // })
            const { publicKey, privateKey } = createKeyPair() // nguyên tắc cái nào dùng 2 lần viết utils
            // save key to db
            //create token pair
            const tokens = await createTokenPair({ userId: newShop._id, email }, publicKey, privateKey)
            const keyStore = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey,
                refreshToken: tokens.refreshToken
            })
            if (!keyStore) {
                throw new BadRequestError('Error: Can not create key token')
            }


            return {
                shop: getInfoData({ fileds: ['_id', 'name', 'email'], object: newShop }),
                tokens
            }
        }
        return {
            metadate: null
        }
    }
}

module.exports = AccessService