let Menu = require("../util/menuSelector");
let Track = require("../util/track");
let {MessageEmbed} = require("discord.js");
module.exports = {
    name: "favorites",
    args: [{placeholder: "remove|list", description: "Must be remove or list"}, {placeholder: "index", description: "Index of the song to remove"}],
    alias: ["f", "like", "favorite"],
    description: "Remove a song from favorites or view favorites",
    execute(client,message,args) {
        switch (args[1]) {
            case "list": {
                let favorites = client.favorites.get(message.author.id);
                if(!favorites||!favorites.length) return message.channel.send("No favorited songs.");
                async function execute(button) {
                    await button.clicker.fetch();
                    let queue = client.queue.get(message.guild.id);
                    if(!queue) {
                        let Queue = require("../util/serverQueue");
                        if(!button.clicker.member.voice.channel) {button.message.channel.send("You need to be in a voice channel."); return button.defer();}
                        let con = await button.clicker.member.voice.channel.join();
                        client.queue.set(message.guild.id, new Queue(client, button.message.channel, button.clicker.member.guild, con, new Track(this.current.name, this.current.url, this.current.time, this.current.thumbnail)));
                        button.defer();
                    } else {
                        queue.addSong(new Track(this.current.name, this.current.url, this.current.time, this.current.thumbnail));
                        button.defer();
                    }
                }
                function format (msg) {
                    let {MessageActionRow, MessageButton} = require("discord-buttons");
                    let components;
                    if(!msg?.components) {components = new MessageActionRow().addComponents([new MessageButton().setLabel("Up").setID(`${message.author.id}_menuUp_favorites`).setStyle("blurple"),new MessageButton().setLabel("Down").setID(`${message.author.id}_menuDown_favorites`).setStyle("blurple"),new MessageButton().setLabel("Play").setID(`${message.author.id}_menuSelect_favorites`).setStyle("green")]);}
                    else components = msg.components;
                    let embed = new MessageEmbed().setThumbnail(this.current.thumbnail).setTitle(this.current.name).setURL(this.current.url);
                    let content = this.items.map((e, i)=>`${this.index==i ? ">>> " : ""}${i+1}. ${e.name} | ${e.url}`).join("\n");
                    return {content, embed, components}
                }
                let m = new Menu(message, favorites, format, execute);
                client.menus.favorites.set(message.author.id, m);
                break;
            }
            case "remove": {
                if(!args[2]) return message.channel.send("You need to specify which song to remove.");
                let favorites = client.favorites.get(message.author.id);
                if(!favorites) return message.channel.send("No favorited songs.");

                let r = favorites.splice(parseInt(args[2])-1, 1);
                let embed = new MessageEmbed().setThumbnail(r.thumbnail).setTitle("Removed: "+r.name).setURL(r.url).setColor("red");
                client.favorites.set(message.author.id, favorites);
                message.channel.send(embed);
                break;
            }
            default: {
                return message.channel.send("You need to specify whether you want to remove or list.");
            }
        }

    }
}