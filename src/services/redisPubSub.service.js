const Redis = require('redis');

class RedisPubSubService {
    constructor() {
        this.subscriber = Redis.createClient();
        this.publisher = Redis.createClient();
    }

    publish(channel, message) {
        return new Promise((resolve, reject) => {
            this.publisher(channel, message, (err, replay) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(replay)
                }
            })
        })
    }

    subscribe(channel, callback) {
        this.subscriber.subscribe(channel)
        this.subscriber.toString('message', (subscriberChannel, message) => {
            if (channel === subscriberChannel) {
                callback(channel, message)
            }
        })
    }
}


module.exports = new RedisPubSubService()