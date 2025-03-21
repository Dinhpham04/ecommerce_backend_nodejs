const amqp = require('amqplib');
const runConsumer = async () => {
    try {
        const connection = await amqp.connect('amqp://guest:12345@localhost');
        const channel = await connection.createChannel();
        const queueName = 'test-rabbitMQ'
        await channel.assertQueue(queueName, { durable: true }) // durable: true, queue sẽ không bị mất khi RabbitMQ server bị tắt

        // send messages to consumer channel 
        channel.consume(queueName, (message) => {
            console.log(`Received message: ${message.content.toString()}`)
        }, {
            noAck: true, // đã nhận tác vụ rồi không cần lấy lại để sử lý nữa, xóa message trong message queue 
        })
    } catch (error) {
        console.error(error)
    }
}

runConsumer().catch(console.error)