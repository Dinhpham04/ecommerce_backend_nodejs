'use strict';
const amqp = require('amqplib');

let producerOrderedMessage = async () => {
    const connection = await amqp.connect('amqp://guest:12345@localhost')
    const channel = await connection.createChannel()
    const queueName = 'orderedQueue'

    await channel.assertQueue(queueName, {
        durable: true
    })

    channel.prefetch(1)

    for (let i = 0; i < 10; i++) {
        const message = `ordered-queue-message::${i}`
        console.log(`message: ${message}`)
        await channel.sendToQueue(queueName, Buffer.from(message), {
            persistent: true
        })
    }

    setTimeout(() => {
        connection.close()
    }, 1000)
}

producerOrderedMessage().catch(err => console.error(err))