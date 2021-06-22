const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require("fs-extra");
const commandFiles = fs.readdirSync("./commands").filter(e=>e.endsWith(".js"));
const {TOKEN, SAPI_SECRET} = require("./config.json");
const Enmap = require("enmap");
const sAPI = require("spotify-web-api-node");
require("discord-buttons")(client);
const {MessageActionRow, MessageButton} = require("discord-buttons");
client.commands = new Discord.Collection();
client.settings = new Enmap("settings");
client.favorites = new Enmap("favorites");
client.menus = {}
client.menus.favorites = new Discord.Collection();

client.spotifyAPI = new sAPI({clientId:"508f5b431c8b4ebd993e380b9178be1e",
    clientSecret: SAPI_SECRET});
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
    message.content = message.content.toLowerCase();
    if(!message.guild) return;
    let prefix = client.settings.ensure(message.guild.id, defaultSettings).prefix;
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
    if(client.commands.get(args[0])||client.commands.filter(e=>e.alias.includes(args[0]))) {
        if(client.commands.find(e=>e.name==args[0]||e.alias.includes(args[0]))) {
            let command = client.commands.find(e=>e.name==args[0]||e.alias.includes(args[0]));
            if(command.disabled&&message.author.id!="402639792552017920") return;
            client.commands.find(e=>e.name==args[0]||e.alias.includes(args[0])).execute(client,message,args);
        }
    }
});
const Queue = require("./util/serverQueue");
const resolve = require("./util/resolveURL");
client.on("clickButton", async button=>{
    let decoded = button.id.split("_");
    if(decoded[1]=="favoriteCurrent") {
        let queue = client.queue.get(decoded[0]);
        if(!queue) return button.defer();
        await button.clicker.fetch();
        let f = client.favorites.ensure(button.clicker.user.id, []);
        if(!queue.current) return button.defer();
        if(f.length>=20) return button.defer();
        f.push(queue.current);
        client.favorites.set(button.clicker.user.id, f);
        return button.defer();
    }
    let selector = client.activeSearches.get(decoded[0]);
        let menu = client.menus[decoded[2]]?.get(decoded[0]);
        if(menu) {
            switch(decoded[1]) {
            case "menuUp": {
                menu.up(button);
                break;
            }
            case "menuDown": {
                menu.down(button);
                break;
            }
            case "menuSelect": {
                console.log("select");
                menu.execute(button);
                break;
            }
        }
    }
        let queue = client.queue.get(decoded[0]);
        if(queue) {
            await button.clicker.fetch()
            if(!button.clicker.member.voice.channel?.id==queue.connection.channel?.id) {button.defer();}
            switch(decoded[1]) {
            case "replay": {
                console.log("j")
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
        }
    }
    if(selector) {
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
                    let queue = new Queue(client, button.message.channel, member.guild, con, {url: resolve(selector.current.id), name: selector.current.title, time: selector.current.length.simpleText, thumbnail: selector.current.thumbnail.thumbnails[0]?.url});
                    client.queue.set(member.guild.id, queue);
                } else {
                    let queue = client.queue.get(member.guild.id);
                    queue.addSong({url: resolve(selector.current.id), name: selector.current.title, time: selector.current.length.simpleText, thumbnail: selector.current.thumbnail.thumbnails[0]?.url});
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
            default: {
                return button.defer();
            }
        }
    }
})

function clean(array) {
    return array.filter(e=>Boolean(e));
}




client.login(TOKEN);

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const CookieParser = require("cookie-parser");
const session = require("express-session");

passport.use(new DiscordStrategy({
    clientID: require("./config.json").CLIENT_ID,
    clientSecret: require("./config.json").CLIENT_SECRET,
    callbackURL: "/auth/discord/cb",
    scope: ["guilds", "identify"]
},(a,b,c,f)=>{
    f(null, c);
}));
passport.serializeUser(function(u, d) {
    if(u.avatar.startsWith("a_")) u.avatarURL = `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.gif`;
    else u.avatarURL = `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png`;
    d(null, u);
});
passport.deserializeUser(function(u, d) {
    if(u.avatar.startsWith("a_")) u.avatarURL = `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.gif`;
    else u.avatarURL = `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png`;
    d(null, u);
});
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(CookieParser("secret"));
app.use(session({
    key:"key",
    secret: "secret",
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session())
app.use(express.static("public"));
app.get("/", async (req, res) => {
    return res.render("index", {user: req.session?.user});
});
app.get("/login", passport.authenticate("discord"));
app.get("/auth/discord/cb", passport.authenticate("discord", {failureRedirect:"/"}), (req,res)=>{
    req.session.user = req.user;
    req.session.save();
    res.redirect("/");
});
app.get("/logout", (req, res)=>{
    req.session.destroy();
    res.redirect("/");
});
app.get("/dashboard", (req,res)=>{
    if(!req.session||!req.session.user) {
        return res.redirect("/login");
    }
    req.session.user.guilds = req.session?.user.guilds.map(e=>{    
        let {id, icon} = e;  
        if (!icon) iconURL = "https://discordapp.com/assets/1cbd08c76f8af6dddce02c5138971129.png";
    else if(icon.startsWith("a_")) iconURL = `https://cdn.discordapp.com/icons/${id}/${icon}.gif`;
    else iconURL = `https://cdn.discordapp.com/icons/${id}/${icon}.png`;
    e.iconURL = iconURL
    return e;
});
        let guilds = req.session.user.guilds.filter(e=>new Discord.Permissions(e.permissions).serialize().MANAGE_GUILD);
        let toJoin = guilds.filter(e=>!client.guilds.cache.get(e.id));
        let joined = guilds.filter(e=>client.guilds.cache.get(e.id));
        res.render("dashboard",
        {user: req.session.user, guilds, toJoin, joined})
});
app.listen(3000);