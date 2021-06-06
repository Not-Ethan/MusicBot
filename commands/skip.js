module.exports = {
    name:"skip",
    alias: ["s"],
    syntax: "skip",
    args: [""],
    execute(client,message,args) {
        let queue = client.queue.get(message.guild.id);
        if(!queue) return message.channel.send("Nothing is playing in this server.");
        queue.skip();
    }
}