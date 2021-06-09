module.exports = class Track {
    constructor(name, url, length, thumbnail, type){
        this.name = name;
        this.url = url;
        this.length = length;
        this.thumbnail = thumbnail;
        this.type = type;
    }
}