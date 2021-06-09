module.exports = {
    name: "resume",
    alias: ["res"],
    description: "Resume current song in queue",
    args: [],
    syntax: "resume",
    execute(client,message,args) {
        let queue = client.queue.get(message.author.id);
        if(!queue||!queue.current) return message.channel.send("No song is currently playing");
        if(!queue.isPaused()) {
            return message.channel.send(queue.current.name + " is not paused.");
        }
        queue.play();
        message.react("👍");
    }
}