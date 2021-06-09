const {MessageEmbed} = require("discord.js");
module.exports = {
    name: "queue",
    alias: ["q"],
    description: "view and manage the queue of the server",
    execute(client, message, args) {
        let queue = client.queue.get(message.author.id);
        if(!queue) return message.channel.send("Nothing is playing in this server.");
        message.channel.send(formatQueue(queue),{embed: embed(queue)});
    }
}
function formatQueue(q) {
    if(q.songs[0]) {
        return "```\n"+`${q.songs.length} songs in queue \nVolume: ${q.volume}x\n`+`${q.songs.map((e, i)=>`${q.index==i ? ">>> " : " "}${i+1}. ${e.name} | ${e.time}`).join("\n\n")}`+"```"
    } else {
        return "No songs queued right now.";
    }
}
function embed(queue) {
    if(queue.current) {
        return (new MessageEmbed().setTitle("Currently Playing: "+queue.current.name).setURL(queue.current.url).setColor("#712da2"));
    } else {return new MessageEmbed().setTitle("Nothing is playing").setURL(null).setColor("#712da2")}
}