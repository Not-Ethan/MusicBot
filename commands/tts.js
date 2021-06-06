const nodeTts = require("node-google-tts-api");
const fs = require("fs")
const { Readable } = require("stream");
module.exports = {
    name: 'tts',
    description: "Play your tts message in vc.",
    alias: ["texttospeech"],
    args: [{placeholder: "text", description: "text to read"}],
    syntax: "tts <message>",
    execute(client, message, args){
        if(message.channel.type!="text") return message.reply("This command can only be used in a server.")
        const vc = message.member.voice.channel
        if(!vc) return message.channel.send("You need to be in a voice channel to run this command.")
        vc.join().then(con=>{
            try {
                let toSpeech = args.slice(1);
                let lang = args.find(e=>e.startsWith("-"));
                let language;
                if(lang) {
                    let code = lang.substring(1);
                    let codes = require("../languages.json");
                    if(codes.indexOf(code)!=-1) {
                        language = code;
                    } else {
                        language = "en"
                    }
                    toSpeech.splice(toSpeech.indexOf(lang),1);
                } else {
                    language = "en";
                }
                toSpeech = toSpeech.map(s=>{
                    let newString = s.replace(/[!@#&<>]/g, "");
                    if(client.users.cache.get(newString)) {
                        return message.guild.members.resolve(client.users.cache.get(newString)).displayName;
                    }else if(message.guild.channels.cache.get(newString)){
                        return message.guild.channels.cache.get(newString).name + " channel";
                    } else if(message.guild.roles.cache.get(newString)) {
                        return message.guild.roles.cache.get(newString).name + " role";
                    } else {return s}});
                toSpeech.join(" ");
                let tts = new nodeTts();
                tts.get({
                    text: `${message.member.displayName} says: ${toSpeech}`,
                    lang: language,
                    limit_bypass: true
                }).then(audio=>{
                    let stream = Readable.from(audio);
                    con.play(stream);
                });
            }
            catch(e) {
                console.log(e);
                console.log(new Date(Date.now()));
            }
        })
    }
}