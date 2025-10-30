const { app, BrowserWindow, Menu, ipcMain } = require('electron'); //import electron modules
const path = require('path'); //import path module
const Store = require('electron-store').default; // main process needs .default

const store = new Store(); // create a new store instance. store is local storage for electron

let win; // main window
let settingsWin; // settings window

// Create the main application window
function createWindow() {
    const savedPos = store.get("pos") || { x: 200, y: 200 };
    const isAlwaysOnTop = store.get("alwaysOnTop", true);

    win = new BrowserWindow({
        width: 250,
        height: 80,
        x: savedPos.x,
        y: savedPos.y,
        frame: false,
        transparent: true,
        alwaysOnTop: isAlwaysOnTop,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // empty placeholder
        },
    });

    win.loadFile('index.html');

    win.on('move', () => {
        const [x, y] = win.getPosition();
        store.set("pos", { x, y });
    });

    // Context menu after win is created
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Settings',
            click: () => openSettingsWindow(),
        },
        {
            label: "Quit",
            click: () => app.quit(),
        },
    ]);

    win.webContents.on('context-menu', (e, params) => {
        contextMenu.popup();
    });
}

// IPC for Always on Top toggle
ipcMain.on('toggle-always-on-top', (event, isOnTop) => {
    if (win) win.setAlwaysOnTop(isOnTop);
    store.set("alwaysOnTop", isOnTop);
});

function openSettingsWindow() {
    if (settingsWin) {
        settingsWin.focus();
        return;
    }

    settingsWin = new BrowserWindow({
        width: 300,
        height: 200,
        resizable: false,
        title: "Clock Settings",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // allows require in renderer
        },
    });

    settingsWin.loadFile('settings.html');

    settingsWin.on('closed', () => {
        settingsWin = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
