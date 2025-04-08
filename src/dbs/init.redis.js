'use strict';

const redis = require('redis');
const { RedisErrorResponse } = require('../core/error.response');

let client = {}, statusConnectRedis = {
    CONNECT: 'connect',
    END: 'end',
    RECONNECT: 'reconnecting',
    ERROR: 'error'
}

const REDIS_CONNECT_TIMEOUT = 10000 // 10s
const REDIS_CONNECT_MESSAGE = {
    code: -99,
    message: {
        vn: 'Redis không kết nối được',
        en: 'Redis connection failed'
    },
    code: 504
}

let connectionTimeout

const handleTimeoutError = () => {
    connectionTimeout = setTimeout(() => {
        // throw new RedisErrorResponse({
        //     message: REDIS_CONNECT_MESSAGE.message.vn,
        //     statusCode: REDIS_CONNECT_MESSAGE.code,
        // })
        console.log('Redis connection timeout')
    }, REDIS_CONNECT_TIMEOUT)
}
const handleEventConnection = ({
    connectionRedis
}) => {
    // check if connection is null
    connectionRedis.on(statusConnectRedis.CONNECT, () => {
        console.log(`connectionRedis - Connection status: connected`)
        clearTimeout(connectionTimeout) // clear timeout when connected
    })

    connectionRedis.on(statusConnectRedis.END, () => {
        console.log(`connectionRedis - Connection status: disconnected`)
        // connect retry 
        handleTimeoutError()
    })

    connectionRedis.on(statusConnectRedis.RECONNECT, () => {
        console.log(`connectionRedis - Connection status: Reconnecting`)
        clearTimeout(connectionTimeout) // clear timeout when connected
    })

    connectionRedis.on(statusConnectRedis.ERROR, (err) => {
        console.log(`connectionRedis - Connection status: error ${err}`)
        handleTimeoutError()
    })
}
const initRedis = async () => {
    const instanceRedis = redis.createClient()
    client.instanceConnect = instanceRedis
    handleEventConnection({ connectionRedis: instanceRedis })
    await instanceRedis.connect()
    return client
}

const getRedis = () => client

// close redis connection 
const closeRedis = async () => {
    if (client.instanceConnect) {
        await client.instanceConnect.quit()
    }
}

module.exports = {
    initRedis,
    getRedis,
    closeRedis
}
