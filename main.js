const {app, BrowserWindow, dialog} = require("electron");
const log                  = require("electron-log");
const {autoUpdater}        = require("electron-updater");
const path                 = require("path")

function createWindow() {
    const webPreferences = {
        nodeIntegration: true,
        enableRemoteModule: true
    };
    if (app.isPackaged) {
        webPreferences.devTools = false;
    }
    // Create the browser window.
    const win = new BrowserWindow({
        backgroundColor: "#e5e5e5",
        icon          : path.join(__dirname, "/build/icons/512x512.png"),
        width         : 800,
        height        : 600,
        webPreferences: webPreferences
    });
    win.setMenuBarVisibility(false);
    // and load the index.html of the app.
    win.loadFile("index.html");

    // Open the DevTools.
    if (!app.isPackaged) {
        win.webContents.openDevTools();
    }
    win.maximize();
    if (app.isPackaged) {
        autoUpdater.checkForUpdates();
    }
}

const contextMenu = require('electron-context-menu');
contextMenu({
    showSaveImageAs: true,
    showSearchWithGoogle: false
});

autoUpdater.logger                       = log;
autoUpdater.logger.transports.file.level = "info";
log.info("App starting...");

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);
app.allowRendererProcessReuse = true;

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
autoUpdater.on("update-available", (info) => {
    log.info(`An update is available... v${info.version}`);
});
autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
    const dialogOpts = {
        type: "info",
        buttons: ["Restart", "Later"],
        title: "Pegasus Uploader Update",
        message: `Version ${event.version}`,
        detail: "A new version has been downloaded. Restart the application to apply the updates."
    }

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0) autoUpdater.quitAndInstall()
    })
})
