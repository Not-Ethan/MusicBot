module.exports = {
    name: "leave",
    description: "Leave the channel",
    alias: ["l", "dc", "bye"],
    args: [],
    syntax: "leave",
    execute(client, message, args) {
        if(!message.guild.me.voice.channel) return message.channel.send("I'm not in a voice channel.");
        if(message.guild.me.voice.channel==message.member.voice.channel) {
            message.guild.me.voice.channel.leave();
            client.queue.delete(message.guild.id);
        } else {
            return message.channel.send("You need to be in the same voice channel as me to do this.");
        }
    }
}