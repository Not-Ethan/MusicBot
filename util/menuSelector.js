/**
 * @typedef Track
 * @property {String} url
 * @property {String} name 
 * @property {String} time 
 * @property {String} thumbnail
 */

module.exports = class MenuSelector {
    constructor(uMessage, menuItems, format, execute) {
        this.items = menuItems;
        this.uMessage = uMessage;
        this.index = 0;
        this.format = format.bind(this);
        this.execute = execute.bind(this);
        this._update();
        this.pages = [];
    }
    up(button) {
        if(this.index!==(this.items.length-1)) {
            this.index +=1;
        } else {
            this.index = 0;
        }
        this._update();
        button.defer();
    }
    down(button) {
        if(!(this.index<=0)) this.index -= 1;
        else this.index = this.items.length-1;
        this._update();
        button.defer();
    }
    /**
     * @description Redefine this
     */
    execute(button) {
        
    }
    format(message) {
        return {content: "N/A"};
    }
    async _update() {
        this.current = this.items[this.index];
        let {content, embed , components} = this.format(this.message);
        if(!this.message) {
            this.message = await this.uMessage.channel.send(content, {embed: embed, components: [components], code: "diff"});
        } else {
            this.message.edit(content, {embed, components, code: "diff"});
        }
    }
}