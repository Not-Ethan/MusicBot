const ytdl = require("discord-ytdl-core");
const {Readable} = require("stream");
const {MessageEmbed} = require("discord.js");
const resolve = require("../util/resolveURL");
const {MessageButton, MessageActionRow} = require("discord-buttons");
module.exports = class ServerQueue {
        constructor(client,channel, server, connection, init, message) {
            this.channel = channel;
            this.server = server;
            this.client = client;
            this.songs = [init];
            this.current = null;
            this.connection = connection;
            this.dispatcher = null;
            this.index = -1;
            this.message = message;
            this.loop = false;
            this.bass = 0;
            this.volume = 1;
            this.connection.on("disconnect", ()=>{
                client.queue.delete(this.server.id);
            });
            this.playAudio();
        }
        play() {
            this.dispatcher.resume();
        }
        pause() {
            this.dispatcher.pause(true);
        }
        setVolume(x) {
            this.dispatcher.setVolume(x);
            this.volume = x;
        }
        addSong(x) {
            this.songs.push(x);
            if(!this.current) this.playAudio(); else {
                this.channel.send(new MessageEmbed().setTitle(`Queued: `+x.name).setThumbnail(x.thumbnail[0].url).setURL(x.url).setTimestamp().setDescription(`Playing in approximately ` + (()=>{let minutes=0; minutes += (Math.round(parseInt(minutes+=this.current.time.split(":")[0])-Math.trunc(this.dispatcher.streamTime/1000)/60)); let seconds=0; seconds+=(Math.round(parseInt(this.current.time.split(":")[1])-Math.trunc(this.dispatcher.streamTime/1000)%60)); let songs = Array.from(this.songs.slice(this.index+1)); songs.shift(); songs.map(e=>{e.time.split(":").map(((a, i)=>{if(i==0) {minutes+=parseInt(a)} else if(i==1)seconds+=parseInt(a);}))});minutes += Math.trunc(seconds / 60); seconds %= 60; return `${minutes} minute${minutes==1 ? "" : "s"} and ${Math.round(seconds)} second${seconds==1 ? "" : "s"}`})()));
            }
        }
        async playAudio() {
            this.index += 1;
            this.current = this.songs[this.index];
            this.dispatcher = this.connection.play(Readable.from(ytdl(this.current.url, {fmt: "mp3", encoderArgs: ["-af", "bass=g="+this.bass], filter:"audioonly", highWaterMark: 1024*32})));
            this.dispatcher.setVolume(this.volume);
            this.dispatcher.on("finish", async ()=>{
                    if(this.songs[this.index+1]) {
                        this.playAudio();
                        this.message.channel.send(new MessageEmbed().setTitle("Now Playing").setDescription(this.current.name).setURL(resolve(this.current.url)).setTimestamp());
                    } else if(!this.loop&&this.songs[0]){
                        this.pause(true);
                        this.current = null;
                        let replay = new MessageButton().setLabel("Replay").setID(`${this.message.guild.id}_replay`).setStyle("green");
                        let loop = new MessageButton().setLabel("Loop").setID(`${this.message.guild.id}_loop`).setStyle("blurple");
                        let row = new MessageActionRow().addComponent(replay).addComponent(loop);
                        if(this.previousLoopEnded) this.previousLoopEnded.delete();
                        this.previousLoopEnded = await this.message.channel.send("",{components: [row], embed: new MessageEmbed().setTitle("Queue Empty").setDescription("There are no more songs left in queue. Replay?").setURL(null).setTimestamp()});
                    } else if (this.loop&&this.songs[0]) {
                        this.index = -1;
                        this.playAudio();
                        let embed = new MessageEmbed()
                        .setTitle("Queue Looping")
                        .setDescription("Queue has been looped")
                        .setColor("#63003f")
                        .setThumbnail(this.message.guild.iconURL());
                        if(this.previousLoopAnnouncement) this.previousLoopAnnouncement.delete();
                        this.previousLoopAnnouncement = await this.channel.send(embed);
                    } else if(!this.songs[0]) {
                        this.current = null;
                    }
                
            })
        }
        isPaused() {
            return Boolean(this.dispatcher.pausedSince);
        }
        skip() {
                this.dispatcher.end();
        }
        replay() {
            this.index -= 1
            this.playAudio();
        }
        clear() {
            this.index = -1;
            this.songs = [];
            this.skip();
        }
        remove(i) {
            let removed = this.songs.splice(i-1, 1)[0];
            if(this.index>i) this.index -= 1;
            else if (i==this.index) {
                if(this.songs[this.index+1]) this.playAudio();
                else this.dispatcher.end();
            }
            let embed = new MessageEmbed()
            .setTitle(`Removed: ${removed.name}`)
            .setURL(removed.url)
            if(removed.thumbnail)embed.setThumbnail(removed.thumbnail[0].url)
            this.message.channel.send(embed);
        }
}
