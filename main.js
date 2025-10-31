// Menu / right-click context menu handling disabled (commented out below).
// Original: const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store').default;

const store = new Store();

let win;
let settingsWin;

function createWindow() {
    const savedPos = store.get("pos") || { x: 200, y: 200 };
    const isAlwaysOnTop = store.get("alwaysOnTop", true);

    win = new BrowserWindow({
        width: 500,
        height: 260,
        x: savedPos.x,
        y: savedPos.y,
        frame: false,
        transparent: true,
        alwaysOnTop: isAlwaysOnTop,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    win.loadFile('index.html');

    win.on('move', () => {
        const [x, y] = win.getPosition();
        store.set("pos", { x, y });
    });

    // Context menu building and popup are intentionally disabled to remove
    // right-click menu functionality while keeping the clock running.
    // (Original code left here as comments for easy re-enable.)
    /*
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Settings',
            click: () => openSettingsWindow(),
        },
        {
            label: 'Quit',
            click: () => app.quit(),
        },
    ]);

    win.webContents.on('context-menu', () => {
        contextMenu.popup({ window: win });
    });
    */
}

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

// IPC — main process handles store + alwaysOnTop
ipcMain.on('toggle-always-on-top', (event, isOnTop) => {
    console.log('Received toggle from renderer:', isOnTop);
    if (win) {
        win.setAlwaysOnTop(isOnTop);
        console.log('Always on Top set:', win.isAlwaysOnTop());
    }
    store.set('alwaysOnTop', isOnTop);

    // Optional: send back confirmation to settings window
    if (settingsWin) {
        settingsWin.webContents.send('always-on-top-updated', isOnTop);
    }
});

app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
