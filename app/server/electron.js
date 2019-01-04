const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const isDev = require('electron-is-dev');
const {ipcMain} = require('electron')

var storage = require('./storage.js')


if (!(isDev)) {
  require('./server.js');
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // Create the browser window.
  if (isDev){
    console.log('IS DEV...');
    mainWindow = new BrowserWindow({width: 1080, height: 1920});
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  }
  else{
    console.log('NOT DEV...');
    const size = electron.screen.getPrimaryDisplay().workAreaSize;
    mainWindow = new BrowserWindow({
      width: 1080,
      height: 1920,
      useContentSize: true,
      frame: true,
      fullscreen: false,
      alwaysOnTop: false,
      webPreferences: {webSecurity: false}
    })
  }

  // and load the index.html of the app.
  mainWindow.loadURL('http://localhost:5000');
  // console.log('~~~~~~~~~~  open pdf ~~~~~~~~~~~')
  // mainWindow.loadURL(`file://${__dirname}/../build/print.pdf`);
  // Emitted when the window is closed.
  mainWindow.allowRunningInsecureContent;
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

// Event handler for asynchronous incoming messages
ipcMain.on('asynchronous-message', (event, arg) => {
   console.log(arg)

   // Event emitter for sending asynchronous messages
   event.sender.send('asynchronous-reply', 'async pong')
})


// Event handler for synchronous incoming messages
ipcMain.on('synchronous-message', (event, arg) => {
   console.log(arg)

   // Synchronous event emmision
   event.returnValue = 'sync pong'
})

app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
