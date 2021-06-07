module.exports = class MenuSelector {
    constructor(message, menuItems) {
        this.items = menuItems;
        this.message = message;
        this.index = 0;
    }
    up() {
        if(this.index!==(this.items.length-1)) {
            this.index +=1;
        } else {
            this.index = 0;
        }
        this._update();
    }
    down() {
        if(!(this.index<=0)) this.index -= 1;
        else this.index = this.items.length-1;
        this._update();
    }
    execute() {
        
    }
    _update() {
        this.current = this.items(this.index);
    }
}