const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  // Enviar slide al sistema de proyección
  // (alias conservado para slideStore.syncToMain)
  sendSlide: (slideData) => ipcRenderer.send('slide:send', slideData),

  // Biblioteca de medios (imágenes/videos)
  media: {
    pick:   (kind) => ipcRenderer.invoke('media:pick',   kind),
    list:   (opts) => ipcRenderer.invoke('media:list',   opts),
    delete: (id)   => ipcRenderer.invoke('media:delete', id),
  },

  // Proyección externa (overlay / background — capturable por OBS, sin red)
  projection: {
    open:  (opts)  => ipcRenderer.invoke('projection:open', opts),
    close: (mode)  => ipcRenderer.invoke('projection:close', mode),
    theme: (patch) => ipcRenderer.invoke('projection:theme', patch),
    state: ()      => ipcRenderer.invoke('projection:state'),
    onInit:  (cb)  => { ipcRenderer.on('projection:init',  (_e, d) => cb(d));  return () => ipcRenderer.removeAllListeners('projection:init') },
    onSlide: (cb)  => { ipcRenderer.on('projection:slide', (_e, d) => cb(d));  return () => ipcRenderer.removeAllListeners('projection:slide') },
    onTheme: (cb)  => { ipcRenderer.on('projection:theme', (_e, d) => cb(d));  return () => ipcRenderer.removeAllListeners('projection:theme') },
  },

  // Songs CRUD (SQLite vía main process)
  songs: {
    list:     (opts)       => ipcRenderer.invoke('songs:list', opts),
    get:      (id)         => ipcRenderer.invoke('songs:get', id),
    create:   (data)       => ipcRenderer.invoke('songs:create', data),
    update:   (id, data)   => ipcRenderer.invoke('songs:update', id, data),
    delete:   (id)         => ipcRenderer.invoke('songs:delete', id),
    favorite: (id)         => ipcRenderer.invoke('songs:favorite', id),
  },
})
