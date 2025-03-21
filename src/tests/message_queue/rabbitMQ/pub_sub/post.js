const amqp = require('amqplib');


const postVideo = async ({ message }) => {
    try {
        // 1. create connection
        const connection = await amqp.connect('amqp://guest:12345@localhost')
        // 2. create channel
        const channel = await connection.createChannel()
        // 3. create exchange
        const exchangeName = 'video'

        await channel.assertExchange(exchangeName, 'fanout', {
            durable: true
        })

        // 4. publish video 
        await channel.publish(exchangeName, '', Buffer.from(message))

        console.log(`Video sent: ${message}`)

        setTimeout(() => {
            connection.close()
            process.exit()
        }, 2000)
    } catch (error) {
        console.error(error)
    }
}


// [
//     '/usr/bin/node',      // process.argv[0]
//     '/path/to/script.js', // process.argv[1]
//     'hello',              // process.argv[2]
//     'world',              // process.argv[3]
//     '123'                 // process.argv[4]
// ]

const message = process.argv.slice(2).join(' ') || 'Hello, RabbitMQ for DinhPham04'
postVideo({ message }).catch(console.error)