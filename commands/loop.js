module.exports = {
    name: "loop",
    alias: ["repeat"],
    args: [],
    syntax: "repeat",
    description: "toggle looping the current queue",
    execute(client,message,args){
        let queue = client.queue.get(message.guild.id);
        if(!queue) return message.channel.send("Nothing playing in this server.");
        queue.loop = !queue.loop;
        message.channel.send(`Queue loop is now \`${queue.loop ? "on" : "off"}\``);
    }
}