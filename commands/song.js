const {MessageEmbed} = require("discord.js");
module.exports = {
    name: "song",
    alias: ["this", "wtf"],
    args: [],
    description: "Information about the current song",
    execute(client,message,args) {
        let queue = client.queue.get(message.author.id);
        if(!queue||!queue.current) return message.channel.send("Nothing playing in this server");
        let played = Math.trunc(queue.dispatcher.streamTime/1000);
        let total = 0;
        queue.current.time.split(":").forEach((v,i)=>{
            if(i==0) total += parseInt(v)*60;
            if(i==1) total += parseInt(v);
        });
        let percent = parseFloat((played/total).toFixed(1));
        const embed = new MessageEmbed();
        embed.setColor("#005aba")
        .setTitle(queue.current.name)
        .setURL(queue.current.url)
        .setTimestamp()
        .setThumbnail(queue.current.thumbnail[0].url)
        .setDescription(`${Math.trunc(queue.dispatcher.streamTime/1000/60)}:${(Math.trunc(queue.dispatcher.streamTime/1000%60)<10) ? "0" : ""}${Math.trunc(queue.dispatcher.streamTime/1000%60)}/${queue.current.time} |   `+this._parseLength(percent))

        return message.channel.send("", {embed: embed});
    },
    _parseLength(percent) {
        let adjusted = percent * 10;
        let toReturn = [];
        for(let i = 0; i < 10; i++) {
            if(i<=adjusted-1) toReturn[i] = ">>>";
            else
            toReturn[i]= "---";
        }
        return toReturn.join("");
    }
}