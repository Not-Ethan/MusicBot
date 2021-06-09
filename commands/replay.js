module.exports = {
    name: "replay",
    alias: ["again"],
    args: [],
    syntax: "replay",
    description: "Replay the current song in the queue",
    execute(client,message,args) {
        let queue = client.queue.get(message.guild.id);
        if(!queue) return message.channel.send("Nothing playing in the server.");
        queue.replay();
    }
}