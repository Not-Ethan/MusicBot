module.exports = {
    name: "ping",
    description: "check bot's ping",
    alias: ["pong"],
    args: [],
    syntax: "ping",
    execute(client, message, args) {
        message.channel.send(`Bot's ping is currently ${Date.now()-message.createdTimestamp}ms`)
    }
}