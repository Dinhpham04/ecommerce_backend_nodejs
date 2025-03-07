const amqp = require('amqplib');


const receiveNoti = async () => {
    try {
        // 1. create connection
        const connection = await amqp.connect('amqp://guest:12345@localhost')
        // 2. create channel
        const channel = await connection.createChannel()
        // 3. create exchange
        const exchangeName = 'video'  // cùng name exchange post

        await channel.assertExchange(exchangeName, 'fanout', {
            durable: true
        })

        // 4. create queue 
        const { queue } = await channel.assertQueue('', {
            exclusive: true // chỉ có consumer nào tạo ra queue mới có thể listen được, consumer khác không thể listen được
            // khi không subscribe nữa thì tự động xóa queue
        }) // tự động sinh ra queue 
        console.log(`queue: ${queue}`)
        // 5. bind queue with exchange
        await channel.bindQueue(queue, exchangeName, '')
        await channel.consume(queue, msg => {
            console.log(`Notification received: ${msg.content.toString()}`)
        })
    } catch (error) {
        console.error(error)
    }
}

receiveNoti().catch(console.error)