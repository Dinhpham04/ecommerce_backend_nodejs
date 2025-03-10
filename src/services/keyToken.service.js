'use strict'

const keytokenModel = require("../models/keytoken.model");
const { Types } = require('mongoose')
class KeyTokenService {

    static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
        try {
            // const token = await keytokenModel.create({
            //     user: userId,
            //     publicKey,
            //     privateKey,
            // })

            //return token ? { publicKey: token.publicKey, privateKey: token.privateKey } : null
            const filter = { user: userId },
                update = { publicKey, privateKey, refreshTokenUsed: [], refreshToken },
                options = { upsert: true, new: true }

            const tokens = await keytokenModel.findOneAndUpdate(filter, update, options)

            return tokens ? tokens.publicKey : null
        } catch (error) {
            return error
        }
    }

    static findByUserId = async (userId) => {
        return await keytokenModel.findOne({ user: new Types.ObjectId(userId) })
    }

    static removeKeyById = async (keyStore) => {
        return await keytokenModel.deleteOne(keyStore)
    }

    static findByRefreshTokenUsed = async (refreshToken) => {
        return await keytokenModel.findOne({ refreshTokenUsed: refreshToken }).lean()
    }

    static findByRefreshToken = async (refreshToken) => {
        return await keytokenModel.findOne({ refreshToken })
    }

    static deleteKeyById = async (userId) => {
        return await keytokenModel.deleteMany({ user: new Types.ObjectId(userId) }).lean()
    }
}

module.exports = KeyTokenService