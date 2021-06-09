module.exports = {
    name: "bassboost",
    description: "bass boost music played by the bot",
    alias: ["bb", "boost", "bass"],
    args: [{placeholder: "amount", description: "Amount to boost by."}],
    syntax: "bassboost <amount>",
    execute(client,message,args) {
        let queue = client.queue.get(message.author.id);
        if(!queue) return message.channel.send("Nothing is playing in this server.");
        if(args[1]&&isNaN(parseInt(args[1]))) return message.channel.send("Please supply a valid number for bass boost");
        queue.bass=parseInt(args[1]);
    }
}