const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("Api", {
  games: {
    List: async () => {
      return await ipcRenderer.invoke("games.list");
    }
  }
});