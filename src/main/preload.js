const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("Api", {
  games: {
    List: async () => {
      return await ipcRenderer.invoke("games.list");
    }
  }
});

contextBridge.exposeInMainWorld('App_Managment', {
    windowControls: {
        minimize: () => ipcRenderer.send('window:minimize'),
        maximize: () => ipcRenderer.send('window:maximize'),
        close: () => ipcRenderer.send('window:close'),
    }
});