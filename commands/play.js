const search = require("youtube-search-api");
const format = require("../util/formatResults");
const {MessageButton, MessageActionRow} = require("discord-buttons");
const SongSelector = require("../util/songSelector");
module.exports = {
    name: "play",
    description: "search youtube for a video and play the audio",
    alias: ["p", "pl"],
    args: [{placeholder: "search", description: "term to search youtube for"}],
    syntax: "play <term>",
    async execute(client,message,args) {
    if(!args.slice(1)[0]) return message.channel.send("You need to specify a search term.");
    
    const searchTerm = args.slice(1).join(" ");
    
    const up = new MessageButton().setLabel("Up").setID(message.author.id + "_up").setStyle("blurple");
    const play = new MessageButton().setLabel("Play").setID(`${message.author.id}_play`).setStyle("green");
    const down = new MessageButton().setLabel("Down").setID(message.author.id + "_down").setStyle("blurple");
    const nextPage = new MessageButton().setLabel("Next Page").setID(`${message.author.id}_nextpage`).setStyle("red");
    const prevPage = new MessageButton().setLabel("Prev Page").setID(`${message.author.id}_prevpage`).setStyle("red");

    const comp = new MessageActionRow().addComponent(up).addComponent(play).addComponent(down);
    const skips = new MessageActionRow().addComponent(nextPage).addComponent(prevPage);

    let results = await search.GetListByKeyword(searchTerm, false);
    results.items = results.items.filter(e=>e.type=="video");

    const selector = new SongSelector(results, message, searchTerm);
    
    client.activeSearches.set(message.author.id, selector);

    let formated = format(selector.currentSection, selector.current);

    message.channel.send("\n"+formated+"\n", {components: [comp, skips], embed: await selector.embed()});
    
    }
}