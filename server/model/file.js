const Entity = require('./entity.js')

module.exports = class File extends Entity {
    constructor(path, name){

        super(path, name);
        
        this.type = "file";
        this.attributes = {};
        this.children = [];
        this._collapsed = true;
    }
}