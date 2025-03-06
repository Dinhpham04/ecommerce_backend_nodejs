'use strict'

require('dotenv').config()

const discordToken = process.env.DISCORD_TOKEN
const { Client, GatewayIntentBits } = require('discord.js')
const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        // Cap quyen hoat dong
    ]
})

client.on('ready', () => {
    console.log(`Logged is as ${client.user.tag}`)
})

client.login(discordToken)

client.on('messageCreate', (msg) => {
    if (msg.author.bot) return
    if (msg.content === 'hello') {
        msg.reply('How can I help you ?')
    }
})

