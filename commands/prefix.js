module.exports = {
    name: "prefix",
    alias: [],
    syntax: "prefix [prefix]",
    args: [{placeholder: "prefix", description: "new prefix. if omitted the bot will reply with the current prefix"}],
    description: "Change prefix/view current prefix",
    execute(client,message,args) {
        args = args.slice(1);
        if(!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send("You do not have high enough permissions to do that. (requires manage server)");
        if(!args[0]) return message.channel.send(`The prefix for ${message.guild.name} is \`${client.settings.get(message.guild.id).prefix}\``);
        const map = client.settings.set(message.guild.id, args.join(" "), "prefix");
        return message.channel.send(`The prefix was changed to \`${map.get(message.guild.id).prefix}\``);
    }
}