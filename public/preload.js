const electron = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
const process = require('process');


window.ipcRenderer = electron.ipcRenderer;
window.dataDirectory = isDev ? 
    path.resolve(process.execPath, '../data') : 
    'Enter path to data directory';