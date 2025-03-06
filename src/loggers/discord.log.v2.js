'use strict'
require('dotenv').config()
const { Client, GatewayIntentBits } = require('discord.js')
const {
    DISCORD_TOKEN,
    DISCORD_CHANNEL_ID
} = process.env

class LoggerService {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.Guilds,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMessages,
                // Cap quyen hoat dong
            ]
        })
        this.channelId = DISCORD_CHANNEL_ID
        this.client.on('ready', () => {
            console.log(`Logged in as ${this.client.user.tag}`)
            // đăng nhập vào bot discord 
        })
        this.client.login(DISCORD_TOKEN)
        this.client.on('messageCreate', (msg) => {
            if (msg.author.bot) return
            if (msg.content === 'hello') {
                msg.reply('Hello! how can i help you ?')
            }
        })
    }

    sendToMessage(message = 'message') {
        const channel = this.client.channels.cache.get(this.channelId)
        if (!channel) {
            console.error('Could not find the channel', this.channelId)
            return
        }
        // message use chat gpt api call
        channel.send(message).catch(e => console.error(e))

    }

    sendToFormatCode(logData) {
        const {
            code,
            message = 'this is some additional about the code',
            title = 'Code Example'
        } = logData

        const codeMessage = {
            content: message,
            embeds: [
                {
                    color: parseInt('00ff00', 16),
                    title,
                    description: '```json\n' + JSON.stringify(code, null, 2) + '\n```'
                },
            ],
        }

        this.sendToMessage(codeMessage)
    }
}

module.exports = new LoggerService()