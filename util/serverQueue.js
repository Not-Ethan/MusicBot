const ytdl = require("discord-ytdl-core");
const {Readable} = require("stream");
const {MessageEmbed} = require("discord.js");
const resolve = require("../util/resolveURL");
const {MessageButton, MessageActionRow} = require("discord-buttons");
module.exports = class ServerQueue {
        constructor(client,channel, server, connection, init) {
            this.channel = channel;
            this.server = server;
            this.client = client;
            this.songs = [init];
            this.current = null;
            this.connection = connection;
            this.dispatcher = null;
            this.index = -1;
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
            if(x.thumbnail[0]?.url) x.thumbnail = x.thumbnail[0].url;
            this.songs.push(x);
            if(!this.current) this.playAudio(); else {
                this.channel.send(new MessageEmbed().setTitle(`Queued: `+x.name).setThumbnail(x.thumbnail).setURL(x.url).setTimestamp().setDescription(`Playing in approximately ` + (()=>{let minutes=0; minutes += (Math.round(parseInt(minutes+=this.current.time.split(":")[0])-Math.trunc(this.dispatcher.streamTime/1000)/60)); let seconds=0; seconds+=(Math.round(parseInt(this.current.time.split(":")[1])-Math.trunc(this.dispatcher.streamTime/1000)%60)); let songs = Array.from(this.songs.slice(this.index+1)); songs.shift(); songs.map(e=>{e.time.split(":").map(((a, i)=>{if(i==0) {minutes+=parseInt(a)} else if(i==1)seconds+=parseInt(a);}))});minutes += Math.trunc(seconds / 60); seconds %= 60; return `${minutes} minute${minutes==1 ? "" : "s"} and ${Math.round(seconds)} second${seconds==1 ? "" : "s"}`})()));
            }
        }
        async playAudio() {
            this.index += 1;
            this.current = this.songs[this.index];
            this.dispatcher = this.connection.play(Readable.from(ytdl(this.current.url, {fmt: "wav", encoderArgs: ["-af", "bass=g="+this.bass+",dynaudnorm=f=100", "-b:a", "1024k"], filter:"audioonly"})), {highWaterMark: 100});
            this.dispatcher.setVolume(this.volume);
            await this._updatePlayingMessage();
            this.dispatcher.on("finish", async ()=>{
                    if(this.songs[this.index+1]) {
                        this.playAudio();
                    } else if(!this.loop&&this.songs[0]){
                        if(!this.message.id) await this.message;
                        this.pause(true);
                        this.current = null;
                        let replay = new MessageButton().setLabel("Replay").setID(`${this.message.guild.id}_replay`).setStyle("green");
                        let loop = new MessageButton().setLabel("Loop").setID(`${this.message.guild.id}_loop`).setStyle("blurple");
                        let row = new MessageActionRow().addComponent(replay).addComponent(loop);
                        if(this.previousLoopEnded) this.previousLoopEnded.delete();
                        this.previousLoopEnded = await this.message.channel.send("",{components: [row], embed: new MessageEmbed().setTitle("Queue Empty").setDescription("There are no more songs left in queue. Replay?").setURL(null).setTimestamp()});
                    } else if (this.loop&&this.songs[0]) {
                        if(!this.message.id) await this.message;
                        this.index = -1;
                        this.playAudio();
                        let embed = new MessageEmbed()
                        .setTitle("Queue Looping")
                        .setDescription("Queue has been looped")
                        .setColor("#63003f")
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
            else if (i-1==this.index) {
                if(this.songs[this.index+1]) {
                    this.index-=1; this.playAudio();
                }
                else {
                    this.index-=1;
                    this.dispatcher.emit("finish");
                }
            }
            let embed = new MessageEmbed()
            .setTitle(`Removed: ${removed.name}`)
            .setURL(removed.url)
            if(removed.thumbnail)embed.setThumbnail(removed.thumbnail)
            this.message.channel.send(embed);
        }
        async _updatePlayingMessage() {
            if(this.message) this.message.delete({delay: 100});
            let button = new MessageButton().setLabel("❤️ \u200b\u200b").setID(`${this.server.id}_favoriteCurrent`).setStyle("green");
            let row = new MessageActionRow().addComponent(button);
            this.message = await this.channel.send({embed: new MessageEmbed().setTitle("Now Playing").setDescription(this.current.name).setURL(resolve(this.current.url)), components: [row]})
        }
}
