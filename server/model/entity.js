module.exports = class Entity {

    constructor(path, name) {
        this.path = path;
        this.name = name
        this.id = this.__generateHashCode(path).toString();
    }

    __generateHashCode(s) {
        var hash = 0, i, chr;
        for (i = 0; i < s.length; i++) {
          chr   = s.charCodeAt(i);
          hash  = ((hash << 5) - hash) + chr;
          hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }
}