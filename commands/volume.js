module.exports = {
    name: "volume",
    alias: ["v"],
    args: [{placeholder: "number", description: "how much to change the volume by. (source audio being 1)"}],
    syntax: "volume",
    description: "change volume",
    execute(client,message,args) {
        let queue = client.queue.get(message.guild.id);
        if(!queue) return message.channel.send("Nothing playing in this server");
        if(isNaN(parseFloat(args[1]))) return message.channel.send("You need to supply a valid number.");
        queue.setVolume(parseFloat(args[1]));
    }
}