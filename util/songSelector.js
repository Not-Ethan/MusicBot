/**
 * @typedef SongSelector
 * @property {Number} id
 * @property {Array<Video>} currentSection
 * @property {Array<Video>} next

* @function down
* @description move down one in the page

 * @typedef Video
 * @property {String} id
 * @property {String} title
 * @property {Object} length
 */
const {SnowflakeUtil, MessageEmbed} = require("discord.js");
const search = require("youtube-search-api");
const format = require("../util/formatResults");
const suggest = require("youtube-suggest");
module.exports = class SongSelector {
    constructor(resp, message, term) {
        this.id = SnowflakeUtil.generate();
        this.message = message;
        this.previous = null;
        this.loadedPages = [];
        this.rawResponse = resp;
        this.currentPage = resp;
        this.partition();
        this.sectionNum = 1;
        this.term = term;
    }
    /**
     * @function nextPage
     * @description sets the page to the next page
     */
    async nextPage() {
        if((this.loadedPages.indexOf(this.currentPage)+1)==this.loadedPages.length) {
        this.previous = this.currentPage;
        let resp = await search.NextPage(this.rawResponse.nextPage);
        resp.items = resp.items.filter(e=>e.type=="video");
        this.currentPage = resp;
        this.loadedPages.push(resp);
        this.partition();
        } else {
            this.currentPage = this.loadedPages[this.loadedPages.indexOf(this.currentPage)+1];
            this.partition();
        }
    }
    /**
     * @function prevPage
     * @description sets the page to the previous page
     */
    prevPage() {
        if(this.loadedPages.indexOf(this.currentPage)==0) return;
        this.currentPage = this.previous;
        this.previous = this.loadedPages[this.loadedPages.indexOf(this.currentPage)-1];
        this.partition();
    }
    /**
     * @function partition
     * @description splits the current page into two parts to comply with discord 2000 character limit
     */
    partition() {
        let resp = this.currentPage;
        let half = Math.round(resp.items.length/2);
        this.currentSection = resp.items.slice(0, half);
        this.current = this.currentSection[0];
        this.next = resp.items.slice(half, resp.items.length);
    }
    /**
     * @function up
     * @description move up one in the page
     */
    up() {
        let a = this.currentSection.indexOf(this.current);
        if(a==0) {
            this.switch();
            this.current = this.currentSection[this.currentSection.length-1];
        } else {
            this.current = this.currentSection[a-1];
        }
    }

    down() {
        let a = this.currentSection.indexOf(this.current);
        if(a == (this.currentSection.length-1)) {
            this.switch();
            this.current = this.currentSection[0];
        } else {
            this.current = this.currentSection[a+1];
        }
    }
    format() {
        return format(this.currentSection, this.current);
    }
    async embed() {
        this.suggestions = await suggest(this.term);
            return new MessageEmbed()
            .setTitle(this.current.title)
            .setURL(`https://youtube.com/watch?v=${this.current.id}`)
            .setThumbnail(this.current.thumbnail.thumbnails[0].url)
            .setColor("#2d65fc")
            .setDescription(`Section ${this.sectionNum} / 2  of page ${(()=>{if(!(this.loadedPages.indexOf(this.currentPage)+1))return 1; else return this.loadedPages.indexOf(this.currentPage)+1})()}`)
            .addField("Suggestions", (()=>this.suggestions.join("\n")||"N/A")());
    }
    switch() {
        switch (this.sectionNum) {case 1: {this.sectionNum = 2; break;} case 2: {this.sectionNum = 1; break;}}
        let b = this.currentSection;
        this.currentSection = this.next;
        this.next = b;
    }
}
