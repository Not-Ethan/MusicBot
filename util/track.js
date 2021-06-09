/**
 * @typedef Track
 * @property {String} url
 * @property {String} name 
 * @property {String} time 
 * @property {String} thumbnail
 */
module.exports = class Track {
    constructor(name, url, length, thumbnail){
        this.name = name;
        this.url = url;
        this.time = length;
        this.thumbnail = thumbnail;
    }
}