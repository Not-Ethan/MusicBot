let Menu = require("../util/menuSelector");
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
                let h = favorites.map((e, i)=>`${i+1}. ${e.name} | ${e.url}`).join("\n");
                message.channel.send("```\n"+h+"```");
                let m = new Menu(message, favorites);
                m.execute = () => {
                    let queue = client.queue.get(this.message.id);
                    
                }
                client.menus.favorites.set(message.author.id, new Menu(message, favorites));

                break;
            }
            case "remove": {
                if(!args[2]) return message.channel.send("You need to specify which song to remove.");
                let favorites = client.favorites.get(message.author.id);
                if(!favorites) return message.channel.send("No favorited songs.");

                favorites.splice(parseInt(args[2])-1, 1);
                client.favorites.set(message.author.id, favorites);
                break;
            }
            default: {
                return message.channel.send("You need to specify whether you want to remove or list.");
            }
        }

    }
}