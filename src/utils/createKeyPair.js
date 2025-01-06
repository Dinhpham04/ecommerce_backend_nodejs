'use strict'

const crypto = require('crypto')
const createKeyPair = () => {
    const publicKey = crypto.randomBytes(64).toString('hex')
    const privateKey = crypto.randomBytes(64).toString('hex')
    return { publicKey, privateKey }
}

module.exports = createKeyPair