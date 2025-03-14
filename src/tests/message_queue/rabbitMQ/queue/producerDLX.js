const amqp = require('amqplib');

const message = 'hello, test dlx exchange'

const runProducer = async () => {
    try {
        const connection = await amqp.connect('amqp://guest:12345@localhost');
        const channel = await connection.createChannel();

        const notificationExchange = 'notificationEx' // direct exchange sử lý khi thành công
        const notiQueue = 'notificationQueue' // assertQueue 
        const notificationRoutingKey = 'notificationRoutingKey'
        const notificationExchangeDLX = 'notificationExDLX' // assert sử lý khi thất bại
        const notificationRoutingKeyDLX = 'notificationRoutingKeyDLX'
        // 1 create exchange
        await channel.assertExchange(notificationExchange, 'direct', {
            durable: true,
        })
        //2. create queue
        const queueResult = await channel.assertQueue(notiQueue, {
            exclusive: false, // exclusive = true, chỉ cho kết nối đã bind kết nối tới, tự xóa khi kết nối đóng lại
            deadLetterExchange: notificationExchangeDLX, // nếu bị lỗi thì sẽ đẩy sang exchange này
            deadLetterRoutingKey: notificationRoutingKeyDLX, // routingKey để đẩy message đến deadLetterExchange
        })
        // 3. bind queue with exchange
        await channel.bindQueue(queueResult.queue, notificationExchange, notificationRoutingKey)

        // 4. send message
        await channel.sendToQueue(queueResult.queue, Buffer.from(message), {
            expiration: 10000 // tin nhắn hết hạn trong 10s
        })

        console.log(`send message: ${message}`)

        // setTimeout(() => {
        //     connection.close()
        //     process.exit(0)
        // }, 5000)
    } catch (error) {
        console.error(error)
    }
}

runProducer().catch(console.error)