const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require("fs-extra");
const commandFiles = fs.readdirSync("./commands").filter(e=>e.endsWith(".js"));
const {TOKEN} = require("./config.json");
const Enmap = require("enmap");
require("discord-buttons")(client);
client.commands = new Discord.Collection();
client.settings = new Enmap("settings");
const defaultSettings = {
    prefix: "$"
}
for (let file of commandFiles) {
    const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}
client.queue = new Discord.Collection();
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.activeSearches = new Discord.Collection();
function startsWithPrefix(message, prefix) {
    if(message.content.startsWith(prefix)) return true;
    if(message.content.split(" ")[0].includes(client.user.id)) return true;
    return false;
}
client.on('message', message => {
    if(!client.settings.get(message.guild.id)) client.settings.set(message.guild.id, defaultSettings);
    let prefix = client.settings.get(message.guild.id).prefix;
    if(!startsWithPrefix(message, prefix)|| message.author.bot) {
        return;
    }

    var banned = ['']

    if(banned.includes(message.author.id)) {
        return;
    }
    let args;
    if(message.content.startsWith(prefix)) args = message.content.substring(prefix.length).split(" ");
    else if (message.content.startsWith(`<@!${client.user.id}>`)||message.content.startsWith(`<@${client.user.id}>`)){let c = message.content.split(" "); c.shift(); args = c;}
    args = clean(args);
    if(client.commands.get(args[0].toLowerCase())||client.commands.filter(e=>e.alias.includes(args[0]))) {
        if(client.commands.find(e=>e.name==args[0].toLowerCase()||e.alias.includes(args[0].toLowerCase()))) {
            client.commands.find(e=>e.name==args[0].toLowerCase()||e.alias.includes(args[0].toLowerCase())).execute(client,message,args);
        }
    }
});
const ytdl = require("discord-ytdl-core");
const Queue = require("./util/serverQueue");
const resolve = require("./util/resolveURL");
const {MessageEmbed} = require("discord.js");
const {Readable} = require("stream");
client.on("clickButton", async button=>{
    let decoded = button.id.split("_");
    let selector = client.activeSearches.get(decoded[0]);
    if(!selector) {             
        let queue = client.queue.get(decoded[0]);
        if(!queue) {
            button.defer(); return;
        }
        await button.clicker.fetch()
        if(!button.clicker.member.voice.channel==queue.connection.channel.id) button.defer();
        switch(decoded[1]) {
        case "replay": {
            queue.index = -1;
            queue.dispatcher.emit("finish");
            button.defer();
            break;
        }
        case "loop": {
            let queue = client.queue.get(decoded[0]);
            if(!queue) return button.message.channel.send("Nothing playing in this server.");
            queue.loop = !queue.loop;
            button.message.channel.send(`Queue loop is now \`${queue.loop ? "on" : "off"}\``);
            button.defer();
            queue.index = -1;
            queue.dispatcher.emit("finish");
            break;
        }
        default: {
            button.defer();

        }
    }
    return;
    }
    if(!selector.message.id==button.message.id) return button.defer();
    switch (decoded[1]) {
        case "up": {
            selector.up();
            button.message.edit(selector.format(), {components: button.message.components, embed: (await selector.embed())});
            button.defer();
            break;
        }
        case "down": {
            selector.down();
            button.message.edit(selector.format(), {components: button.message.components, embed: (await selector.embed())});
            button.defer();
            break;
        }
        case "play": {
            let member = await button.message.guild.members.fetch(decoded[0]);
            if(!member.voice.channel) return button.message.channel.send("You need to be in a voice channel to play music!");
            if((button.message.guild.me.voice.channel!=null)&&button.message.guild.me.voice.channel!=member.voice.channel) return button.message.channel.send("I am in use in another channel right now!");
            await button.defer();
            let vc = member.voice.channel;
            let con = await vc.join();
            if(!client.queue.get(member.guild.id)) {
                let queue = new Queue(client, button.message.channel, member.guild, con, {url: resolve(selector.current.id), name: selector.current.title, time: selector.current.length.simpleText, thumbnail: selector.current.thumbnail.thumbnails}, await button.channel.send({embed: new MessageEmbed().setTitle("Now Playing").setDescription(selector.current.title).setURL(resolve(selector.current.id))}));
                client.queue.set(member.guild.id, queue);
            } else {
                let queue = client.queue.get(member.guild.id);
                queue.addSong({url: resolve(selector.current.id), name: selector.current.title, time: selector.current.length.simpleText, thumbnail: selector.current.thumbnail.thumbnails});
            }

            break;
        }
        case "nextpage": {
            await selector.nextPage();
            button.message.edit(selector.format(), {components: button.message.components, embed: (await selector.embed())});
            button.defer();
            break;
        }
        case "prevpage": {
            selector.prevPage();
            button.message.edit(selector.format(), {components: button.message.components, embed: (await selector.embed())});
            button.defer();
            break;
        }
    }

})

client.on('guildCreate', (guild) => {

});

function clean(array) {
    return array.filter(e=>Boolean(e));
}




client.login(TOKEN);