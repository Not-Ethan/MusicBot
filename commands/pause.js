module.exports = {
    name: "pause",
    alias: ["stop"],
    description: "Pause the currently playing song.",
    args: [],
    syntax: "pause",
    execute(client, message, args) {
        let queue = client.queue.get(message.guild.id);
        if(!queue||!queue.current) return message.channel.send("No pausable song playing in this server.");
        if(queue.isPaused()) return message.channel.send(queue.current.name + " is already paused!");
        queue.pause();
        message.react("👍");
    }
}