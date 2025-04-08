'use strict'

const { reservationInventory } = require('../models/repositories/inventory.repo')
const redis = require('redis')
const { promisify } = require('util')
const { getRedis } = require('../dbs/init.redis')
const {
    instanceConnect: redisClient // lấy thuộc tính instanceConnect và gán cho redisClient
} = getRedis()

const pexpire = promisify(redisClient.pExpire).bind(redisClient) // hàm đặt thời gian hết hạn cho một key
const setnxAsync = promisify(redisClient.setNX).bind(redisClient) // hàm set giá trị cho Key chỉ khi key chưa tồn tại

const acquireLock = async ({ productId, quantity, cartId }) => {
    const key = `lock_v2025_${productId}`
    const retryTimes = 10;
    const expireTime = 3000; // 3 seconds tam lock

    // Hàm này cố khóa một tài nguyên đảm bảo chỉ có 1 thao tác duy nhất tại một thơi điểm
    for (let i = 0; i < retryTimes; i++) {
        // tao mot key, thang nao nam giu duoc vao thanh thoan
        const result = await setnxAsync(key, expireTime) // setnx key trong thời gian expire
        console.log(`result:: ${result}`)
        if (result === 1) {
            // thao tac voi inventory
            const isReservation = await reservationInventory({ productId, quantity, cartId })
            if (isReservation.modifiedCount) {
                await pexpire(key, expireTime) // dat thoi gian het han cho key 
            }
            return key // de xoa
        } else {
            // thử lấy khóa lại 
            await new Promise((resolve) => setTimeout(resolve, 50)) // gọi hàm resolve() sau 50 giây, resolve chạy chuyển promise sang hoàn thành
        }
    }
}

const releaseLock = async keyLock => { // giải phóng key khỏi redis
    const delAsyncKey = promisify(redisClient.del).bind(redisClient)
    return await delAsyncKey(keyLock)
}

module.exports = {
    acquireLock,
    releaseLock,
}