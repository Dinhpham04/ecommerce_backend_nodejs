'use strict';

const amqp = require('amqplib');


const receiveMail = async () => {
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

        // 4. create queue 
        const { queue } = await channel.assertQueue('', {
            exclusive: true
        })

        // 5. binding 
        const args = process.argv.slice(2)
        if (!args.length) {
            process.exit(1)
        }

        /*
            * khớp với tiền tố hoặc hậu tố hoặc cả 2
            # khớp nếu tồn tại 1 hoặc nhiều từ bất kỳ 
            vd: 'dev.test.leder' => *.test: false, #.test: true, *.test.*: true
        */

        console.log(`queue ${queue} with topic ${args}`)
        args.forEach(async key => {
            await channel.bindQueue(queue, exchangeName, key)
        })

        await channel.consume(queue, msg => {
            console.log(`Email received: ${msg.content.toString()} with routing key: ${msg.fields.routingKey}`)
        })

    } catch (error) {
        console.error(error)
    }
}


receiveMail()