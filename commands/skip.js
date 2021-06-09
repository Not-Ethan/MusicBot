module.exports = {
    name:"skip",
    alias: ["s"],
    syntax: "skip",
    args: [""],
    description: "skip the current song in the queue",
    execute(client,message,args) {
        let queue = client.queue.get(message.author.id);
        if(!queue) return message.channel.send("Nothing is playing in this server.");
        queue.skip();
    }
}