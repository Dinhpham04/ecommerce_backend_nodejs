'use strict';

const amqp = require('amqplib');


const sendEmail = async () => {
    try {
        // 1. create connection
        const connection = await amqp.connect('amqp://guest:12345@localhost')
        // 2. create channel
        const channel = await connection.createChannel()
        // 3. create exchange
        const exchangeName = 'sendEmail'

        await channel.assertExchange(exchangeName, 'topic', {
            durable: false
        })

        const args = process.argv.slice(2)
        const msg = args[1] || 'Fixed'
        const topic = args[0];

        // 4. publish email
        await channel.publish(exchangeName, topic, Buffer.from(msg))
        console.log(`Sending message: ${msg} with topic: ${topic}`)


        setTimeout(() => {
            connection.close()
            process.exit()
        }, 2000)
    } catch (error) {
        console.error(error)
    }
}


sendEmail()