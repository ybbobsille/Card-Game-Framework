const { app, BrowserWindow, ipcMain, session } = require("electron");
const path = require('node:path');
const fs = require('node:fs')
const { readFile, writeFile, readdir, stat, mkdir } = require('node:fs/promises')
const { stringify , parse } = require('ini')
const fetch = require('node-fetch');

const isDev = process.env.VITE_DEV_SERVER_URL !== undefined;
const Data_Path = isDev ? path.join(process.cwd(), "dev_storage") : app.getPath("userData");
var win = null;

if (isDev) {
    //removes the check for certificate validation (VERY INSECURE FOR PRODUCTION)
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const createWindow = () => {
    console.log("Creating Electron window...");
    win = new BrowserWindow({
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
        frame: false
    })

    win.setMenu(null);
    win.maximize(); 
    win.webContents.openDevTools();

    if (isDev) {
        win.loadURL("http://localhost:5173");
    } else {
        win.loadFile(path.join(__dirname, "dist/renderer/index.html"));
    }
}

const Config = {
    Get: async (file, keys) => {
        let text = await readFile(file, {
            encoding: 'utf-8'
        })

        var config = parse(text)
        config.scope = 'local'
        data = config[keys.shift()]
        for (key of keys) {
            data = data[key]
        }
        return data
    },
    Set: async (file, keys, value) => {
        let text = await readFile(file, {
            encoding: 'utf-8'
        })

        var config = parse(text)
        config.scope = 'local'
        var data = config
        
        for (key of keys.slice(0, -1)) {
            data = data[key]
        }
        
        data[keys.slice(-1)[0]] = value
        await writeFile(
            file,
            stringify(config,{
                whitespace: true,
                align: true
            })
        )
    },
    Write_Dict: async (file, dict) => {
        let text = await readFile(file, {
            encoding: 'utf-8'
        })

        var config = parse(text)
        config.scope = 'local'
        for (const [key, value] of Object.entries(dict)) {
            config[key] = value
        }
        writeFile(
            file,
            stringify(config,{
                whitespace: true,
                align: true
            })
        )
    }
}   

const Ipc_Api = {
    games: {
        List: async () => {
            return await Promise.all((await readdir(path.join(Data_Path, "Games"))).map(async dir => {
                const data = await readFile(path.join(Data_Path, "Games", dir, "data.json"), {
                    encoding: 'utf-8'
                })
                return (await JSON.parse(data)).Meta_Data
            }))
        }
    }
}

//games
ipcMain.handle("games.list", Ipc_Api.games.List);

//window controls
ipcMain.on('window:minimize', () => {
    if (win) win.minimize();
});
ipcMain.on('window:maximize', () => {
    if (win) {
        if (win.isMaximized()) {
            win.unmaximize();
        } else {
            win.maximize();
        }
    }
});
ipcMain.on('window:close', () => {
    if (win) win.close();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.whenReady().then(() => {
    console.log("Electron app is ready");
    if (!isDev) {
        session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
            callback({
                responseHeaders: {
                    ...details.responseHeaders,
                    "Content-Security-Policy": [
                        "default-src 'self'; " +
                        "script-src 'self'; " +
                        "style-src 'self' 'unsafe-inline'; " +
                        "img-src 'self' data:; " +
                        "font-src 'self' data:;"
                    ],
                },
            });
        });
    }

    createWindow();
});