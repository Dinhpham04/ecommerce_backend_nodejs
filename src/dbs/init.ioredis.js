'use strict';

const Redis = require('ioredis');
const { RedisErrorResponse } = require('../core/error.response');

let clients = {}, statusConnectRedis = {
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
        console.log(`connectionIORedis - Connection status: connected`)
        clearTimeout(connectionTimeout) // clear timeout when connected
    })

    connectionRedis.on(statusConnectRedis.END, () => {
        console.log(`connectionIORedis - Connection status: disconnected`)
        // connect retry 
        handleTimeoutError()
    })

    connectionRedis.on(statusConnectRedis.RECONNECT, () => {
        console.log(`connectionIORedis - Connection status: Reconnecting`)
        clearTimeout(connectionTimeout) // clear timeout when connected
    })

    connectionRedis.on(statusConnectRedis.ERROR, (err) => {
        console.log(`connectionIORedis - Connection status: error ${err}`)
        handleTimeoutError()
    })
}

const init = async ({
    IOREDIS_IS_ENABLE,
    IOREDIS_HOST = process.env.REDIS_CACHE_HOST || "localhost",
    IOREDIS_PORT = 6379
}) => {
    if (IOREDIS_IS_ENABLE) {
        const instanceRedis = new Redis({
            host: IOREDIS_HOST,
            post: IOREDIS_PORT
        })
        clients.instanceConnect = instanceRedis
        handleEventConnection({ connectionRedis: instanceRedis })
    }
}

const getIORedis = () => clients

// close redis connection 
const closeIORedis = async () => {
    if (clients.instanceConnect) {
        await clients.instanceConnect.quit()
    }
}

module.exports = {
    init,
    getIORedis,
    closeIORedis
}
