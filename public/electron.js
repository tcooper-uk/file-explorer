const path = require('path');
const electron = require('electron');
const isDev = require('electron-is-dev');

const dm = require('../server/modules/data.js');

const app = electron.app;
const ipcMain = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

/*
* Create the main browser window for the app
*/
function createWindow() {

  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize
  mainWindow = new BrowserWindow({
    width: width, 
    height: height,   
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, '/preload.js')
    },
    frame: false
  });
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
  mainWindow.on('closed', () => mainWindow = null);

  if(isDev)
    mainWindow.webContents.openDevTools();
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

/*
* Consume event from renderer process
* This will listen for a requst for data.
*/
ipcMain.on("event-request-data", (event, args) => {

  let folder = args.startsWith('..') ? path.join(__dirname, args) : args;

  dm.init();

  let res = dm.getData(folder);

  // check for errors
  if(res.hasErrors) {
    event.reply('event-bad-data', res.errors);
    return;
  }

  // send event back to renderer
  event.reply('event-data', {
    data: res,
  });

});