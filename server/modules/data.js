const File = require('../model/file.js');
const Container = require('../model/container.js');

const fs = require('fs');
const path = require('path');

const item_limit = 1000;

let count = 0;
let errors = [];

function _recursiveReadData(root) {

    console.log(root);

    let stats = {};
    let data = {};

    try {

        stats = fs.lstatSync(root)

    } catch (error) {

        _addError(root, 'Unable to read object');
        return {};
    }
    
    let name = path.basename(root);

    if (stats.isDirectory()) {

        let containerSize = 0;

        data = new Container(root, name);
        data.nodeSvgShape = {
            shape: 'circle',
            shapeProps:{
            r: 10,
            fill: '#20639B'
            }
        };
        count ++;

        if(count < item_limit) {

            var entities = fs.readdirSync(root);

            entities.forEach((e) => {
                
                if(count < item_limit){
                    var child = _recursiveReadData(path.join(root, e));

                    if(child.size > 0)
                        containerSize += child.size;

                    data.children.push(child);
                }
            });
        }

        data.size = containerSize;

    } else {

        try{

            data = new File(root, name);
            data.nodeSvgShape = {
                shape: 'rect',
                shapeProps:{
                    width: 18,
                    height: 20,
                    y: -20,
                    x: -10,
                    fill: '#F6D55C'
                }
            };

            data.size = stats["size"];
            
            count++;

        } catch {
            _addError(root, 'Unable to read configuration.');
        }   
    }

    data.attributes.size = _bytesToSize(data.size);
    return data;
}

function _addError(fullPath, message){
    errors.push({
        path: fullPath,
        err: message
    });
    return errors;
}

function _bytesToSize(bytes) {
    var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
 }

module.exports.init = () => {
    errors = [];
};

module.exports.getData = function getDataFromPath(fullPath) {

    count = 0;
    let data = _recursiveReadData(fullPath);

    if(errors.length > 0) {
        data.hasErrors = true;
        data.errors = errors
    }

    return data;
};