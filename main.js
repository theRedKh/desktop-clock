const { app, BrowserWindow, Menu, clipboard } = require('electron');
const path = require('path');
const Store = require('electron-store').default;

const store = new Store();
let win;

function createWindow() {
    const savedPos = store.get("pos") || { x: 200, y: 200 };

    win = new BrowserWindow({
        width: 250,
        height: 80,
        x: savedPos.x,
        y: savedPos.y,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), //creating this later
        },
    });
    win.loadFile('index.html');

    win.on('move', () => {
        const [x, y] = win.getPosition();
        store.set("pos", { x, y });
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

const settingsWindow = null;

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

//Right click on clock opens the menu
win.webContents.on('context-menu', (e, params) => {
    contextMenu.popup();
});

let settingsWin;

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
            contextIsolation: false,
        },
    });

    settingsWin.loadFile('settings.html');
    settingsWin.on('closed', () => {
        settingsWin = null;
    });
}