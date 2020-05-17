const Entity = require('./entity.js')

module.exports = class Container extends Entity {
    constructor(path, name) {
        super(path, name);
        
        this.type = "folder";
        this.children = [];
        this.attributes = {};
    }
}