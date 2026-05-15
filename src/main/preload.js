const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  // Enviar slide al sistema de proyección
  // (alias conservado para slideStore.syncToMain)
  sendSlide: (slideData) => ipcRenderer.send('slide:send', slideData),

  // Biblioteca de medios (imágenes/videos)
  media: {
    pick:     (kind)  => ipcRenderer.invoke('media:pick',     kind),
    list:     (opts)  => ipcRenderer.invoke('media:list',     opts),
    delete:   (id)    => ipcRenderer.invoke('media:delete',   id),
    addFiles: (paths) => ipcRenderer.invoke('media:addFiles', paths),
  },

  // Proyección externa (overlay / background — capturable por OBS, sin red)
  projection: {
    open:  (opts)  => ipcRenderer.invoke('projection:open', opts),
    close: (mode)  => ipcRenderer.invoke('projection:close', mode),
    theme: (patch) => ipcRenderer.invoke('projection:theme', patch),
    state: ()      => ipcRenderer.invoke('projection:state'),
    toggleOverlayVisible: (visible) => ipcRenderer.invoke('projection:toggleOverlayVisible', visible),
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
    export:   ()           => ipcRenderer.invoke('songs:export'),
    import:   (opts)       => ipcRenderer.invoke('songs:import', opts),
  },

  // Utilidades de la app (settings)
  app: {
    pickDirectory: (title) => ipcRenderer.invoke('app:pickDirectory', title),
    info:          ()      => ipcRenderer.invoke('app:info'),
  },

  // Servidor local embebido (mobile remote + OBS overlay)
  server: {
    info:    ()    => ipcRenderer.invoke('server:info'),
    onRemoteEvent: (cb) => {
      const handler = (_e, name, payload) => cb(name, payload)
      ipcRenderer.on('remote:event', handler)
      return () => ipcRenderer.removeListener('remote:event', handler)
    },
  },

  // Importación de biblias
  bibles: {
    import:         ()    => ipcRenderer.invoke('bibles:import'),
    listImported:   ()    => ipcRenderer.invoke('bibles:listImported'),
    readImported:   (id)  => ipcRenderer.invoke('bibles:readImported', id),
    deleteImported: (id)  => ipcRenderer.invoke('bibles:deleteImported', id),
  },

  // Licencia (Free / Pro). El renderer lee el plan para feature gates,
  // y la pantalla de Ajustes → Licencia llama a activate/deactivate.
  license: {
    state:      ()    => ipcRenderer.invoke('license:state'),
    activate:   (key) => ipcRenderer.invoke('license:activate', key),
    deactivate: ()    => ipcRenderer.invoke('license:deactivate'),
    validate:   ()    => ipcRenderer.invoke('license:validate'),
  },
})
