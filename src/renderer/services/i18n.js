// Internacionalización mínima — sin dependencias externas.
// Diccionario por idioma con `t(key)` y `useT()` hook.
// El idioma se persiste en appSettings.locale.

import { useEffect, useState } from 'react'

const DICT = {
  // ========== ESPAÑOL ==========
  es: {
    // Sidebar
    'nav.bible':       'Biblia',
    'nav.songs':       'Canciones',
    'nav.schedule':    'Lista',
    'nav.image':       'Imagen',
    'nav.video':       'Video',
    'nav.text':        'Texto',
    'nav.projection':  'Proyección',
    'nav.transmision': 'Transmisión',

    // Topbar
    'topbar.connected':    'Proyector conectado',
    'topbar.disconnected': 'Proyector desconectado',
    'topbar.settings':     'Ajustes',
    'topbar.openProjector': 'Abrir proyector',

    // Common
    'common.search':   'Buscar',
    'common.cancel':   'Cancelar',
    'common.save':     'Guardar',
    'common.close':    'Cerrar',
    'common.delete':   'Eliminar',
    'common.edit':     'Editar',
    'common.add':      'Añadir',
    'common.import':   'Importar',
    'common.export':   'Exportar',
    'common.loading':  'Cargando…',
    'common.empty':    'Sin resultados',
    'common.confirm':  '¿Estás seguro?',

    // Settings
    'settings.title':           'Ajustes',
    'settings.aspecto':         'Aspecto',
    'settings.monitores':       'Monitores',
    'settings.almacenamiento':  'Almacenamiento',
    'settings.audio':           'Audio',
    'settings.video':           'Video',
    'settings.biblias':         'Biblias',
    'settings.canciones':       'Canciones',
    'settings.apibible':        'API Bible',
    'settings.acerca':          'Acerca de',
    'settings.idioma':          'Idioma',
    'settings.savedAuto':       'Los cambios se guardan automáticamente',

    // Bible
    'bible.books':            'Libros',
    'bible.chapters':         'capítulos',
    'bible.verses':           'versículos',
    'bible.back':             'Volver',
    'bible.searchPlaceholder': 'Buscar texto, versículo o referencia',
    'bible.searchBookPlaceholder': 'Buscar libro (sin tildes)…',
    'bible.addToList':        'Añadir a lista',
    'bible.clear':            'Limpiar',
    'bible.all':              'Todos',

    // Slide preview / monitor
    'monitor.live':       'En vivo',
    'monitor.preview':    'Próximo',
    'monitor.takeOnAir':  'Tomar al aire',
    'monitor.clearScreen': 'Limpiar pantalla',

    // Command palette
    'palette.placeholder': 'Buscar canciones, versículos, ajustes…',
    'palette.songs':       'Canciones',
    'palette.bible':       'Versículos',
    'palette.actions':     'Acciones',
    'palette.panels':      'Paneles',
    'palette.noResults':   'Sin resultados para',
  },

  // ========== ENGLISH ==========
  en: {
    'nav.bible':       'Bible',
    'nav.songs':       'Songs',
    'nav.schedule':    'List',
    'nav.image':       'Image',
    'nav.video':       'Video',
    'nav.text':        'Text',
    'nav.projection':  'Projection',
    'nav.transmision': 'Broadcast',

    'topbar.connected':    'Projector connected',
    'topbar.disconnected': 'Projector disconnected',
    'topbar.settings':     'Settings',
    'topbar.openProjector': 'Open projector',

    'common.search':   'Search',
    'common.cancel':   'Cancel',
    'common.save':     'Save',
    'common.close':    'Close',
    'common.delete':   'Delete',
    'common.edit':     'Edit',
    'common.add':      'Add',
    'common.import':   'Import',
    'common.export':   'Export',
    'common.loading':  'Loading…',
    'common.empty':    'No results',
    'common.confirm':  'Are you sure?',

    'settings.title':           'Settings',
    'settings.aspecto':         'Appearance',
    'settings.monitores':       'Monitors',
    'settings.almacenamiento':  'Storage',
    'settings.audio':           'Audio',
    'settings.video':           'Video',
    'settings.biblias':         'Bibles',
    'settings.canciones':       'Songs',
    'settings.apibible':        'API Bible',
    'settings.acerca':          'About',
    'settings.idioma':          'Language',
    'settings.savedAuto':       'Changes are saved automatically',

    'bible.books':            'Books',
    'bible.chapters':         'chapters',
    'bible.verses':           'verses',
    'bible.back':             'Back',
    'bible.searchPlaceholder': 'Search text, verse or reference',
    'bible.searchBookPlaceholder': 'Search book…',
    'bible.addToList':        'Add to list',
    'bible.clear':            'Clear',
    'bible.all':              'All',

    'monitor.live':       'Live',
    'monitor.preview':    'Next',
    'monitor.takeOnAir':  'Take on air',
    'monitor.clearScreen': 'Clear screen',

    'palette.placeholder': 'Search songs, verses, settings…',
    'palette.songs':       'Songs',
    'palette.bible':       'Verses',
    'palette.actions':     'Actions',
    'palette.panels':      'Panels',
    'palette.noResults':   'No results for',
  },

  // ========== PORTUGUÊS ==========
  pt: {
    'nav.bible':       'Bíblia',
    'nav.songs':       'Cânticos',
    'nav.schedule':    'Lista',
    'nav.image':       'Imagem',
    'nav.video':       'Vídeo',
    'nav.text':        'Texto',
    'nav.projection':  'Projeção',
    'nav.transmision': 'Transmissão',

    'topbar.connected':    'Projetor conectado',
    'topbar.disconnected': 'Projetor desconectado',
    'topbar.settings':     'Configurações',
    'topbar.openProjector': 'Abrir projetor',

    'common.search':   'Buscar',
    'common.cancel':   'Cancelar',
    'common.save':     'Salvar',
    'common.close':    'Fechar',
    'common.delete':   'Excluir',
    'common.edit':     'Editar',
    'common.add':      'Adicionar',
    'common.import':   'Importar',
    'common.export':   'Exportar',
    'common.loading':  'Carregando…',
    'common.empty':    'Sem resultados',
    'common.confirm':  'Tem certeza?',

    'settings.title':           'Configurações',
    'settings.aspecto':         'Aparência',
    'settings.monitores':       'Monitores',
    'settings.almacenamiento':  'Armazenamento',
    'settings.audio':           'Áudio',
    'settings.video':           'Vídeo',
    'settings.biblias':         'Bíblias',
    'settings.canciones':       'Cânticos',
    'settings.apibible':        'API Bible',
    'settings.acerca':          'Sobre',
    'settings.idioma':          'Idioma',
    'settings.savedAuto':       'As alterações são salvas automaticamente',

    'bible.books':            'Livros',
    'bible.chapters':         'capítulos',
    'bible.verses':           'versículos',
    'bible.back':             'Voltar',
    'bible.searchPlaceholder': 'Buscar texto, versículo ou referência',
    'bible.searchBookPlaceholder': 'Buscar livro…',
    'bible.addToList':        'Adicionar à lista',
    'bible.clear':            'Limpar',
    'bible.all':              'Todos',

    'monitor.live':       'Ao vivo',
    'monitor.preview':    'Próximo',
    'monitor.takeOnAir':  'Levar ao ar',
    'monitor.clearScreen': 'Limpar tela',

    'palette.placeholder': 'Buscar cânticos, versículos, configurações…',
    'palette.songs':       'Cânticos',
    'palette.bible':       'Versículos',
    'palette.actions':     'Ações',
    'palette.panels':      'Painéis',
    'palette.noResults':   'Sem resultados para',
  },
}

export const AVAILABLE_LOCALES = [
  { id: 'es', label: 'Español',    flag: 'ES' },
  { id: 'en', label: 'English',    flag: 'EN' },
  { id: 'pt', label: 'Português',  flag: 'PT' },
]

let currentLocale = 'es'
const listeners = new Set()

export function setLocale(locale) {
  if (!DICT[locale]) return
  currentLocale = locale
  document.documentElement.setAttribute('lang', locale)
  for (const fn of listeners) try { fn(currentLocale) } catch {}
}

export function getLocale() { return currentLocale }

export function t(key, params) {
  const dict = DICT[currentLocale] || DICT.es
  let str = dict[key] ?? DICT.es[key] ?? key
  if (params) {
    for (const k in params) str = str.replace(`{${k}}`, params[k])
  }
  return str
}

export function useT() {
  const [, setN] = useState(0)
  useEffect(() => {
    const fn = () => setN(n => n + 1)
    listeners.add(fn)
    return () => listeners.delete(fn)
  }, [])
  return t
}
