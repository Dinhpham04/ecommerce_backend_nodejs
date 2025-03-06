const amqp = require('amqplib');

const message = 'hello, RabbitMQ for DinhPham04'

const runProducer = async () => {
    try {
        const connection = await amqp.connect('amqp://guest:12345@localhost');
        const channel = await connection.createChannel();
        const queueName = 'test-rabbitMQ'
        await channel.assertQueue(queueName, { durable: true })

        // send messages to consumer channel 
        channel.sendToQueue(queueName, Buffer.from(message))
        console.log(`messages send: ${message}`)
    } catch (error) {
        console.error(error)
    }
}

runProducer().catch(console.error)