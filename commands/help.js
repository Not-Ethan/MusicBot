const {MessageEmbed} = require("discord.js");

module.exports = {
    name:"help",
    description: "Information about the bot's commands.",
    alias: ["h"],
    args: [{placeholder: "command", description: "Command to get more info about"}],
    syntax: "help [command]",
    execute(client,message,args) {
        let embed = new MessageEmbed()
        let command = null;
        if(!args.slice(1).length){ 
        embed.setTitle("Help");
        client.commands.forEach(cmd=>{embed.addField(cmd.name, cmd.description)});
        } else if(args.slice(1)[0]) {
        if(client.commands.get(args.slice(1)[0].toLowerCase())) {
            command = client.commands.get(args.slice(1)[0].toLowerCase());
        } else if (client.commands.filter(e=>e.alias.includes(args.slice(1)[0].toLowerCase()))) {
            command = client.commands.filter(e=>e.alias.inclues(args.slice(1)[0].toLowerCase()));
        }   else {
            return message.channel.send("No such command "+args.slice(1)[0]);
        }
        } 
        if(command) {
            embed.setTitle(`Help for ${command.name}`)
            .setDescription(command.description)
            .addField("Syntax", command.syntax||"N/A")
            .addField("Args: ", "\u200b");
            if(command.args) {
                for(let i of command.args) {
                embed.addField(i.placeholder, i.description);
            }
            } else {
                embed.addField("Argument", "None");
            }
        }
        message.channel.send("",{embed: embed});
    }
}