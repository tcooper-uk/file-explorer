const Entity = require('./entity.js')

module.exports = class Feature extends Entity {

    constructor(path, type, {name, count = 1, distinct = 1}){

        super(path, name)

        this.name = name;
        this.attributes = {
            Type: type,
            Count: count,
            DistinctCount: distinct
        };
        this.nodeSvgShape = {
            shape: "none"
        }
    }
}