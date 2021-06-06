module.exports = {
    name:"clear",
    alias: ["c"],
    args: [],
    syntax: "clear",
    execute(client,message,args){
        let queue = client.queue.get(message.guild.id);
        if(!queue) return message.channel.send("Nothing is playing in this server");
        queue.clear();
    }
}