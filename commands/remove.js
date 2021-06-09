module.exports = {
    name: "remove",
    args: [{placeholder: "number", description: "item number in the queue"}],
    syntax: "remove",
    alias: [],
    description: "remove a song from the queue",
    execute(client,message,args) {
        let queue = client.queue.get(message.author.id);
        if(!queue) return message.channel.send("Nothing playing in server.");
        if(!parseInt(args[1])) return message.channel.send("Please supply valid number");
        if(!queue.songs[parseInt(args[1])-1]) return message.channel.send("No song with that number in the queue");
        queue.remove(parseInt(args[1]));
    }
}