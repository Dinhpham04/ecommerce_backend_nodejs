'use strict';
const amqp = require('amqplib');
let consumerOrderedMessage = async () => {
    const connection = await amqp.connect('amqp://guest:12345@localhost')
    const channel = await connection.createChannel()
    const queueName = 'orderedQueue'

    await channel.assertQueue(queueName, {
        durable: true,
    })

    // set prefetch
    // 1 consumer sẽ xử lý tuần tự 
    channel.prefetch(1)

    channel.consume(queueName, msg => {
        const message = msg.content.toString()
        setTimeout(() => {
            console.log(`processed ${message}`)
            channel.ack(msg) // xác nhận tin nhắn đã được xử lý
        }, Math.random() * 1000)
    })
}

consumerOrderedMessage().catch(err => console.error(err))