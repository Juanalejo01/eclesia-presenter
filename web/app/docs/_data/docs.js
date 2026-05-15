// Contenido de las páginas de documentación.
// Cada doc tiene: slug, title, section, lastUpdated, content (array de bloques).
//
// Tipos de bloque soportados:
//   { type: 'p',    text: '...' }              párrafo
//   { type: 'h2',   text: '...' }              subtítulo
//   { type: 'h3',   text: '...' }              sub-subtítulo
//   { type: 'list', items: [...] }             lista con viñetas
//   { type: 'ol',   items: [...] }             lista numerada
//   { type: 'code', text: '...', lang: 'js' }  bloque de código
//   { type: 'kbd',  keys: ['Ctrl','B'], desc: '...' }   atajo
//   { type: 'note',  text: '...' }             info azul
//   { type: 'tip',   text: '...' }             tip verde
//   { type: 'warn',  text: '...' }             advertencia ámbar
//   { type: 'table', cols: [...], rows: [[...]] }
//   { type: 'link',  href: '...', label: '...' }

export const SECTIONS = [
  'Primeros pasos',
  'Proyección y streaming',
  'Configuración',
  'Cuenta y pagos',
]

export const DOCS = [
  // ====================================================================
  // PRIMEROS PASOS
  // ====================================================================
  {
    slug: 'instalacion',
    title: 'Instalación y primer arranque',
    section: 'Primeros pasos',
    lastUpdated: '2026-05',
    summary: 'Descarga, instala y abre EclesiaPresenter por primera vez.',
    content: [
      { type: 'p', text: 'EclesiaPresenter está disponible para Windows 10 y 11 (64 bits). El soporte para macOS está en preparación.' },

      { type: 'h2', text: 'Descargar' },
      { type: 'p', text: 'Tienes dos formatos en la página de descargas:' },
      { type: 'list', items: [
        ['Instalador (recomendado)', 'crea acceso directo en el escritorio + Menú Inicio. Updates más fáciles.'],
        ['Versión portable', 'no requiere instalación. Ideal para llevar en USB o para PCs corporativos sin permisos de admin.'],
      ]},
      { type: 'link', href: '/download', label: 'Ir a la página de descargas →' },

      { type: 'h2', text: 'Si Windows bloquea la instalación' },
      { type: 'p', text: 'Como aún no firmamos el .exe con un certificado comercial, Windows puede mostrar uno de dos avisos:' },
      { type: 'h3', text: 'Caso 1 · SmartScreen ("Windows protegió tu equipo")' },
      { type: 'ol', items: [
        'Click en "Más información".',
        'Click en "Ejecutar de todas formas".',
      ]},
      { type: 'h3', text: 'Caso 2 · Control inteligente de aplicaciones (Windows 11)' },
      { type: 'p', text: 'Si tienes Smart App Control activado, el sistema no permitirá ni siquiera ejecutar el .exe. Tendrás que desactivarlo:' },
      { type: 'ol', items: [
        'Abre Configuración → Privacidad y seguridad → Seguridad de Windows.',
        'Control de aplicaciones y navegador → Configuración de Control inteligente de aplicaciones.',
        'Cámbialo a "Desactivado" o "Evaluación".',
      ]},
      { type: 'warn', text: 'Smart App Control solo se reactiva reinstalando Windows. La mayoría de PCs ya lo tienen desactivado por defecto.' },

      { type: 'h2', text: 'Primer arranque' },
      { type: 'p', text: 'Al abrir la app verás una breve animación de bienvenida (≈1.6 segundos), seguida del panel principal con la sección Biblia activa por defecto.' },
      { type: 'p', text: 'El layout tiene 4 zonas:' },
      { type: 'list', items: [
        ['Sidebar izquierda', 'lista de paneles (Biblia, Canciones, Lista, Imágenes, Videos, Texto, Proyección, Transmisión).'],
        ['Panel principal', 'la sección activa.'],
        ['Slide preview', 'a la derecha, muestra qué se está proyectando ahora.'],
        ['Topbar', 'logo, reloj, botones de Ajustes y Abrir proyector.'],
      ]},

      { type: 'tip', text: 'Pulsa Ctrl+M en cualquier momento para abrir el Command Palette y navegar rápido a cualquier sección.' },
    ],
  },

  {
    slug: 'atajos',
    title: 'Atajos de teclado',
    section: 'Primeros pasos',
    lastUpdated: '2026-05',
    summary: 'Lista completa de shortcuts para moverte rápido.',
    content: [
      { type: 'p', text: 'EclesiaPresenter está diseñado para usarse sin tocar el ratón durante un servicio. Estos son todos los atajos:' },

      { type: 'h2', text: 'Navegación entre paneles' },
      { type: 'kbd', keys: ['Ctrl', 'B'], desc: 'Panel Biblia' },
      { type: 'kbd', keys: ['Ctrl', 'N'], desc: 'Panel Canciones' },
      { type: 'kbd', keys: ['Ctrl', '3'], desc: 'Lista del día (Schedule)' },
      { type: 'kbd', keys: ['Ctrl', 'I'], desc: 'Panel Imágenes' },
      { type: 'kbd', keys: ['Ctrl', 'H'], desc: 'Panel Videos' },
      { type: 'kbd', keys: ['Ctrl', '6'], desc: 'Texto libre' },
      { type: 'kbd', keys: ['Ctrl', 'Q'], desc: 'Proyección (ajustes de tema)' },
      { type: 'kbd', keys: ['Ctrl', '8'], desc: 'Transmisión' },
      { type: 'note', text: 'Las teclas Ctrl+1..8 siguen funcionando como alternativa al orden de la sidebar.' },

      { type: 'h2', text: 'Acciones globales' },
      { type: 'kbd', keys: ['Ctrl', 'M'], desc: 'Abrir Menú / Command Palette (busca cualquier acción)' },
      { type: 'kbd', keys: ['Ctrl', 'K'], desc: 'Alias del menú (cómoda si vienes de VS Code o Notion)' },
      { type: 'kbd', keys: ['Ctrl', 'A'], desc: 'Abrir Ajustes' },
      { type: 'kbd', keys: ['Ctrl', 'P'], desc: 'Abrir / cerrar ventana de proyector a pantalla completa' },

      { type: 'h2', text: 'Slide en vivo' },
      { type: 'kbd', keys: ['→'], desc: 'Siguiente slide / versículo / sección' },
      { type: 'kbd', keys: ['←'], desc: 'Slide anterior' },
      { type: 'kbd', keys: ['Espacio'], desc: 'Pantalla en blanco (mantiene fondo del tema, sin texto)' },
      { type: 'kbd', keys: ['B'], desc: 'Blackout (pantalla totalmente negra)' },
      { type: 'kbd', keys: ['F9'], desc: 'Limpiar el slide proyectado' },
      { type: 'kbd', keys: ['ESC'], desc: 'Limpiar selección · salir de input · retroceder breadcrumb' },

      { type: 'h2', text: 'Selección múltiple de versículos' },
      { type: 'kbd', keys: ['Shift', '+ Click'], desc: 'Selecciona rango entre el versículo actual y el clicado' },
      { type: 'kbd', keys: ['Ctrl', '+ Click'], desc: 'Añadir / quitar versículo de la selección' },

      { type: 'tip', text: 'Si tienes un mando o pulsador inalámbrico que envía teclas →/← (como un clicker de presentación), funcionará automáticamente.' },
    ],
  },

  {
    slug: 'biblia',
    title: 'Cómo usar el panel Biblia',
    section: 'Primeros pasos',
    lastUpdated: '2026-05',
    summary: 'Buscar, navegar y proyectar versículos rápidamente.',
    content: [
      { type: 'p', text: 'El panel Biblia tiene un buscador inteligente que entiende referencias completas: libro, capítulo y versículo todo en una línea.' },

      { type: 'h2', text: 'Buscador inteligente' },
      { type: 'p', text: 'Al entrar al panel (Ctrl+B), el cursor está YA dentro del buscador. Puedes escribir:' },
      { type: 'table', cols: ['Escribes', 'Resultado'], rows: [
        ['salmos',           'filtra libros que contengan "salmos"'],
        ['salmos 22',        'va directo al capítulo 22 de Salmos'],
        ['salmos 22:1',      'va al capítulo 22, versículo 1 seleccionado'],
        ['salmos 22 1',      'igual (espacio en vez de ":")'],
        ['1 corintios 13:1-7', 'rango de versículos seleccionado'],
        ['juan 3 16',        'va a Juan 3:16'],
      ]},
      { type: 'p', text: 'Mientras escribes verás flotando a la derecha del input el match exacto que se aplicaría al pulsar Enter (ej: "↵ Salmos 22:1").' },

      { type: 'h2', text: 'Navegación' },
      { type: 'p', text: 'El flujo natural es: Libros → Capítulo → Versículo. En la parte superior verás el breadcrumb (migas de pan):' },
      { type: 'code', text: 'Libros → Génesis → Capítulo 1', lang: 'text' },
      { type: 'list', items: [
        ['Click en "Libros"', 'vuelves al grid de libros.'],
        ['Click en el nombre del libro', 'vuelves al grid de capítulos.'],
        ['Botón "← Atrás" o tecla ESC', 'retrocede un nivel.'],
      ]},

      { type: 'h2', text: 'Seleccionar versículos' },
      { type: 'p', text: 'En la vista de un capítulo verás dos secciones:' },
      { type: 'list', items: [
        ['Grid numérico', 'para saltar entre versículos rápidamente (1, 2, 3, ...).'],
        ['Lista completa', 'todos los versículos con su texto, scrollable y clickable.'],
      ]},
      { type: 'p', text: 'Selección múltiple:' },
      { type: 'list', items: [
        ['Click', 'selecciona un solo versículo.'],
        ['Shift + Click', 'selecciona un rango contiguo.'],
        ['Ctrl + Click', 'añade o quita un versículo aislado.'],
      ]},
      { type: 'p', text: 'Al seleccionar versículos, se proyectan automáticamente al live.' },

      { type: 'h2', text: 'Versículos largos' },
      { type: 'p', text: 'Si un versículo (o conjunto de versículos seleccionados) tiene más de 280 caracteres, se divide automáticamente en 2 o 3 partes para que entre cómodamente en pantalla:' },
      { type: 'list', items: [
        ['La referencia mostrará "(1/3)", "(2/3)", "(3/3)"', 'para que sepas en qué parte vas.'],
        ['Las flechas →/← navegan entre las partes', 'antes de pasar al siguiente versículo.'],
        ['Los cortes son inteligentes', 'priorizan punto > punto y coma > coma > espacio.'],
      ]},

      { type: 'h2', text: 'Versiones disponibles' },
      { type: 'p', text: 'En el desplegable arriba a la derecha puedes cambiar de versión bíblica:' },
      { type: 'list', items: [
        ['Plan Free', '3 biblias incluidas: RVR 1960, NVI, RVR 1909.'],
        ['Plan Pro', '10 biblias modernas: las anteriores más RV 2020, NBV, DHH, LBLA, NTV y otras.'],
        ['Biblias importadas', 'cualquier biblia que importes manualmente (XMM, JSON) está disponible en todos los planes.'],
      ]},
      { type: 'link', href: '/docs/biblias-custom', label: 'Cómo importar tus propias biblias →' },
    ],
  },

  {
    slug: 'canciones',
    title: 'Crear y editar canciones',
    section: 'Primeros pasos',
    lastUpdated: '2026-05',
    summary: 'Estructura tus canciones por secciones para proyectarlas slide a slide.',
    content: [
      { type: 'p', text: 'Las canciones se almacenan en una base de datos local (SQLite) y se proyectan slide a slide, organizadas por secciones (intro, estrofa, coro, puente, etc.).' },

      { type: 'h2', text: 'Crear una nueva canción' },
      { type: 'ol', items: [
        'Pulsa Ctrl+N o ve a la sidebar → Canciones.',
        'Click en "+ Nueva canción" arriba a la derecha.',
        'Rellena el título (obligatorio), autor y etiquetas (opcionales).',
        'Añade secciones con el botón "+ Sección". Por defecto se crea una "Estrofa 1".',
        'En cada sección, elige el tipo (Estrofa, Coro, Puente, Intro, Final, Tag) y pega la letra.',
        'Cada salto de línea se respeta como una línea del slide.',
        'Click en "Guardar" cuando termines.',
      ]},
      { type: 'tip', text: 'Para reordenar secciones, usa las flechas ↑ ↓ junto a cada una.' },

      { type: 'h2', text: 'Auto-split de slides largos' },
      { type: 'p', text: 'Una sección puede tener muchas líneas, pero proyectarlas todas a la vez sería ilegible. EclesiaPresenter divide automáticamente las secciones largas en sub-slides.' },
      { type: 'p', text: 'El control deslizante "Auto-split de slides largos" define cuántas líneas como máximo por slide (entre 2 y 8, por defecto 4).' },
      { type: 'p', text: 'Si una sección excede ese límite, se divide en N sub-slides. Por ejemplo, una estrofa de 8 líneas con máximo 4 → 2 sub-slides de 4 líneas cada uno.' },
      { type: 'p', text: 'En la pestaña "Presentación · X" del editor puedes ver exactamente cómo quedará la canción slide a slide antes de proyectarla.' },

      { type: 'h2', text: 'Proyectar una canción' },
      { type: 'ol', items: [
        'Desde la lista de canciones, haz click en el título.',
        'A la derecha verás las secciones y la barra de slides.',
        'Click en cualquier sección para enviar su primer slide al live.',
        'Avanza con → o ← entre slides.',
        'Cuando una sección termina, → pasa al siguiente sección automáticamente.',
      ]},

      { type: 'h2', text: 'Mayúsculas / minúsculas masivas' },
      { type: 'p', text: 'En el editor hay dos botones rápidos:' },
      { type: 'list', items: [
        ['AA · MAYÚS', 'convierte toda la letra a mayúsculas.'],
        ['aa · minús', 'convierte toda la letra a minúsculas.'],
      ]},

      { type: 'h2', text: 'Backups' },
      { type: 'p', text: 'Tus canciones nunca desaparecen, pero conviene hacer backup periódicamente:' },
      { type: 'link', href: '/docs/backups', label: 'Cómo hacer backup de canciones →' },
    ],
  },

  // ====================================================================
  // PROYECCIÓN Y STREAMING
  // ====================================================================
  {
    slug: 'obs',
    title: 'Captura OBS con lower-third',
    section: 'Proyección y streaming',
    lastUpdated: '2026-05',
    summary: 'Integra EclesiaPresenter con OBS Studio para transmisión en vivo.',
    content: [
      { type: 'p', text: 'El "Lower-Third" es una banda transparente en la parte inferior con el texto del slide actual. Es ideal para transmisiones por YouTube/Facebook Live: la cámara muestra al pastor y abajo aparece el versículo.' },
      { type: 'warn', text: 'Función Pro: requiere plan Pro Mensual, Pro Anual o Lifetime.' },

      { type: 'h2', text: 'Opción A · Browser Source (recomendado)' },
      { type: 'p', text: 'OBS captura una URL web. Es la opción más estable.' },
      { type: 'ol', items: [
        'En OBS → Sources → + → "Browser".',
        'Marca "Local file" desmarcado.',
        'En URL pega la siguiente dirección:',
      ]},
      { type: 'code', text: 'http://localhost:3434/overlay', lang: 'text' },
      { type: 'ol', items: [
        'Width: 1920 · Height: 1080.',
        'Marca "Use custom frame rate" y pon 30 FPS.',
        'Marca "Shutdown source when not visible" para liberar memoria.',
        'OK.',
      ]},
      { type: 'note', text: 'El puerto del servidor local es 3434 (cambiado del antiguo 3000 en v0.2.0). Si tenías una versión vieja configurada con 3000, actualiza la URL.' },

      { type: 'h2', text: 'Opción B · Window Capture' },
      { type: 'p', text: 'OBS captura una ventana de Electron en lugar de una URL web.' },
      { type: 'ol', items: [
        'En EclesiaPresenter → Transmisión → "Overlay (Lower-Third)" → Abrir.',
        'Esto crea una ventana transparente.',
        'En OBS → Sources → + → "Window Capture".',
        'Selecciona la ventana llamada "EclesiaPresenter — Lower-Third (OBS)".',
        'Crop la zona inferior si solo quieres la banda.',
      ]},

      { type: 'h2', text: 'Tip · personalizar el estilo' },
      { type: 'p', text: 'En el panel Proyección (Ctrl+Q) → tab "Overlay (OBS)" puedes:' },
      { type: 'list', items: [
        ['Cambiar el fondo de la banda', '(transparente, gradiente, color, imagen).'],
        ['Ajustar la altura y posición Y', 'desde el slider "Posición vertical".'],
        ['Cambiar la fuente y el tamaño', '24-96px para el texto principal.'],
        ['Activar contorno', 'para mayor legibilidad sobre cualquier video.'],
      ]},
      { type: 'tip', text: 'Cambia el preset a "Negro elegante" o "Borde dorado" para empezar — son combinaciones probadas que se ven bien.' },
    ],
  },

  {
    slug: 'dos-pantallas',
    title: 'Configurar 2 monitores',
    section: 'Proyección y streaming',
    lastUpdated: '2026-05',
    summary: 'PC con extensión a un proyector secundario.',
    content: [
      { type: 'p', text: 'El uso típico: un monitor primario donde manejas EclesiaPresenter y un proyector secundario donde se ven los slides para la congregación.' },

      { type: 'h2', text: 'Configurar Windows' },
      { type: 'ol', items: [
        'Conecta el proyector / TV / segundo monitor por HDMI / DisplayPort.',
        'Click derecho en el escritorio → "Configuración de pantalla".',
        'Verifica que aparezcan 2 pantallas.',
        'Selecciona la pantalla 2 y elige "Extender pantalla" (no duplicar).',
        'Define cuál es la principal (normalmente la del operador).',
      ]},

      { type: 'h2', text: 'Abrir el proyector en EclesiaPresenter' },
      { type: 'ol', items: [
        'Pulsa Ctrl+P o click en "Abrir proyector" en la topbar.',
        'La ventana de proyección se abrirá automáticamente en el monitor secundario.',
        'Si tienes 3+ monitores, ve a Transmisión y elige el display destino en "Pantalla completa".',
      ]},

      { type: 'h2', text: 'Verificar que va bien' },
      { type: 'list', items: [
        ['Mueve el ratón al monitor 2', 'deberías ver el cursor saltar a la pantalla del proyector.'],
        ['En el panel principal selecciona un versículo o canción', 'aparece en el monitor 2.'],
        ['Pulsa Espacio', 'el monitor 2 se queda en blanco (con el fondo del tema).'],
        ['Pulsa B', 'el monitor 2 se queda en negro absoluto.'],
      ]},

      { type: 'h2', text: 'Problemas frecuentes' },
      { type: 'h3', text: 'La ventana se abre en el monitor equivocado' },
      { type: 'p', text: 'Ve a Transmisión → cierra la ventana actual → en el selector de "Pantalla destino" elige la correcta → abre de nuevo.' },

      { type: 'h3', text: 'El proyector se ve borroso o con bordes negros' },
      { type: 'p', text: 'En Windows → Configuración de pantalla → selecciona el monitor 2 → "Escala" debe ser 100% y "Resolución" debe coincidir con la nativa del proyector (típicamente 1920×1080).' },

      { type: 'h3', text: 'La ventana se ve negra' },
      { type: 'p', text: 'En v0.2.0+ esto está corregido. Si te pasa: Ajustes → Proyección → Reset al preset por defecto.' },
    ],
  },

  {
    slug: 'stage-display',
    title: 'Stage Display para el músico',
    section: 'Proyección y streaming',
    lastUpdated: '2026-05',
    summary: 'Pantalla del músico con slide actual + reloj + próximo slide.',
    content: [
      { type: 'p', text: 'El Stage Display es una ventana opaca diseñada para que la vea solamente el músico o predicador desde el escenario. Muestra el slide actual con la próxima vista previa, hora actual y tiempo en aire.' },
      { type: 'warn', text: 'Función Pro: requiere plan Pro Mensual, Pro Anual o Lifetime.' },

      { type: 'h2', text: 'Casos de uso' },
      { type: 'list', items: [
        ['Vocalista', 've la letra de la canción + el versículo que viene después.'],
        ['Predicador', 've el versículo actual + el reloj para controlar el tiempo.'],
        ['Operador de audio', 'sabe qué viene para preparar el siguiente fade.'],
      ]},

      { type: 'h2', text: 'Configuración de pantallas' },
      { type: 'p', text: 'El Stage Display se sirve mejor en una pantalla secundaria distinta a la del proyector principal. Idealmente:' },
      { type: 'list', items: [
        ['1 monitor', 'Operador (tu PC).'],
        ['1 proyector', 'Congregación (pantalla completa).'],
        ['1 monitor adicional', 'Stage Display para el músico.'],
      ]},
      { type: 'p', text: 'Si tienes solo 2 pantallas, el Stage Display se abre como ventana flotante a 1280×720 que puedes mover manualmente.' },

      { type: 'h2', text: 'Abrir el Stage Display' },
      { type: 'ol', items: [
        'Ve a Transmisión (Ctrl+8).',
        'En la sección "Ventanas de proyección", click en "Stage Display" → Abrir.',
        'La ventana aparece en el tercer monitor (o como ventana movible si solo tienes 2).',
      ]},

      { type: 'tip', text: 'Personaliza el Stage Display desde Ajustes → Aspecto → "Stage Display". Puedes activar/desactivar el reloj, las notas y la vista previa del próximo slide.' },
    ],
  },

  {
    slug: 'control-remoto',
    title: 'Control remoto desde el móvil',
    section: 'Proyección y streaming',
    lastUpdated: '2026-05',
    summary: 'Maneja la app desde tu teléfono usando el WiFi local.',
    content: [
      { type: 'p', text: 'Puedes controlar EclesiaPresenter desde cualquier móvil o tablet conectado al mismo WiFi que el PC. No requiere instalar ninguna app — funciona en el navegador.' },

      { type: 'h2', text: 'Cómo conectar' },
      { type: 'ol', items: [
        'En el PC ve a Transmisión (Ctrl+8).',
        'Baja hasta la sección "Control remoto desde el móvil".',
        'Verás un código QR y la URL (ej: http://192.168.1.42:3434/remote).',
        'En el móvil, asegúrate de estar conectado al mismo WiFi que el PC.',
        'Escanea el QR con la cámara, o escribe la URL en el navegador.',
      ]},
      { type: 'note', text: 'Si la cámara del móvil no escanea el QR (algunos modelos antiguos), copia la URL desde el botón "Copiar" y pégala en el navegador.' },

      { type: 'h2', text: 'Pestañas del mando' },
      { type: 'h3', text: 'Mando' },
      { type: 'p', text: 'Botones de control en vivo:' },
      { type: 'list', items: [
        ['◀ Anterior · ▶ Siguiente', 'navega entre slides.'],
        ['Blanco', 'pantalla en blanco (fondo del tema sin texto).'],
        ['Negro', 'blackout total.'],
        ['Limpiar', 'sin slide proyectado.'],
      ]},

      { type: 'h3', text: 'Biblia' },
      { type: 'p', text: 'Busca cualquier referencia bíblica y proyéctala directo desde el móvil:' },
      { type: 'list', items: [
        ['Input libre', 'escribe "salmos 22:1", "juan 3 16", "1 corintios 13:1-7" — el parser entiende todos los formatos.'],
        ['8 chips de accesos rápidos', 'Juan 3:16, Salmo 23, 1 Cor 13, Mateo 5:3, Gn 1:1, Pr 3:5, Fil 4:13, Ro 8:28.'],
      ]},

      { type: 'h3', text: 'Canciones' },
      { type: 'p', text: 'Buscador instantáneo + lista de todas las canciones de tu PC:' },
      { type: 'list', items: [
        ['Filtra por título o autor', 'mientras escribes.'],
        ['Tap en una canción', 'la selecciona y proyecta su primera diapositiva en el PC.'],
        ['La lista se sincroniza automáticamente', 'cuando creas/editas/borras canciones en el PC.'],
      ]},

      { type: 'h2', text: 'Problemas frecuentes' },
      { type: 'h3', text: 'El móvil no se conecta' },
      { type: 'list', items: [
        ['Verifica que el móvil esté en el MISMO WiFi que el PC', '(no en datos móviles).'],
        ['Algunos routers de invitados aíslan dispositivos entre sí', 'desactiva "AP Isolation" o conecta al WiFi principal.'],
        ['El firewall del PC puede bloquear el puerto 3434', 'añade EclesiaPresenter como excepción en Windows Defender.'],
      ]},
      { type: 'h3', text: 'Funciona pero va lento' },
      { type: 'p', text: 'El WiFi de la iglesia suele estar saturado por la transmisión. Considera un router dedicado para el sistema de audio/video.' },

      { type: 'tip', text: 'Mantén la pantalla del móvil encendida durante el servicio (Ajustes → Pantalla → Tiempo de espera nunca). Si se bloquea, el socket se desconecta y tendrás que reconectar.' },
    ],
  },

  {
    slug: 'transiciones',
    title: 'Transiciones entre slides',
    section: 'Proyección y streaming',
    lastUpdated: '2026-05',
    summary: 'Configura el efecto visual al cambiar de slide.',
    content: [
      { type: 'p', text: 'Por defecto los slides usan un crossfade suave de 500ms. Puedes ajustar el efecto, duración y curva desde el panel Proyección.' },

      { type: 'h2', text: 'Cómo configurar' },
      { type: 'ol', items: [
        'Ve a Proyección (Ctrl+Q).',
        'Scroll hasta "Personalización avanzada".',
        'En "Transición" elige el tipo:',
      ]},
      { type: 'list', items: [
        ['fade (default)', 'crossfade suave, ideal para textos.'],
        ['slide', 'el nuevo slide entra deslizándose desde la derecha.'],
        ['zoom', 'el nuevo slide entra con un zoom-in sutil.'],
        ['none', 'cambio instantáneo, sin animación.'],
      ]},

      { type: 'h2', text: 'Duración' },
      { type: 'p', text: 'El slider "Duración" va de 100ms a 2000ms (2 segundos):' },
      { type: 'list', items: [
        ['100-300ms', 'rápido, ideal para canciones con muchas líneas que pasan rápido.'],
        ['400-700ms (recomendado)', 'punto dulce para versículos y predicación.'],
        ['1000ms+', 'efecto cinematográfico, solo para slides puntuales (intro, salida).'],
      ]},

      { type: 'h2', text: 'Curva de aceleración' },
      { type: 'p', text: 'Define cómo se distribuye el tiempo:' },
      { type: 'list', items: [
        ['linear', 'velocidad constante.'],
        ['ease-out', 'arranca rápido, frena suave (default).'],
        ['ease-in-out', 'arranca lento, va rápido, frena suave (más natural).'],
      ]},

      { type: 'tip', text: 'Si tu proyector es viejo y tiene latencia de respuesta alta, usa "none" o duración muy corta (<200ms) para evitar artefactos visuales.' },
    ],
  },

  // ====================================================================
  // CONFIGURACIÓN
  // ====================================================================
  {
    slug: 'temas',
    title: 'Personalizar el tema visual',
    section: 'Configuración',
    lastUpdated: '2026-05',
    summary: 'Fondos, colores, tipografías y plantillas.',
    content: [
      { type: 'p', text: 'EclesiaPresenter trae 6 plantillas predefinidas (Azul cielo, Sepia clásico, Bosque, Negro absoluto, Cobre, Mixto) y un panel completo para personalizar cada aspecto del slide proyectado.' },

      { type: 'h2', text: 'Cambiar de plantilla' },
      { type: 'p', text: 'Ve a Proyección (Ctrl+Q) → click en cualquier plantilla bajo "Estilos predefinidos". El cambio se aplica al instante en la ventana del proyector.' },
      { type: 'note', text: 'Al cambiar de plantilla SOLO se actualiza el fondo y el color del texto. El tamaño de letra, la alineación y la fuente que tú elegiste se MANTIENEN — no se resetean.' },

      { type: 'h2', text: 'Personalización avanzada' },
      { type: 'h3', text: 'Fondo' },
      { type: 'list', items: [
        ['Sólido', 'un solo color.'],
        ['Gradiente', 'dos colores con transición lineal a 135°.'],
        ['Imagen', 'tu propia imagen (jpg, png, webp).'],
        ['Video', 'fondo en bucle (mp4, webm).'],
      ]},
      { type: 'h3', text: 'Modo de encaje' },
      { type: 'p', text: 'Para imágenes y videos:' },
      { type: 'list', items: [
        ['Contener (default)', 'muestra la imagen entera, deja barras si la proporción no encaja.'],
        ['Cubrir', 'rellena toda la pantalla, recorta lo que sobra.'],
        ['Estirar', 'rellena sin recortar pero distorsiona.'],
      ]},
      { type: 'h3', text: 'Blur del fondo' },
      { type: 'p', text: 'Cuando el modo es "Contener" y queda barras laterales, puedes activar un blur que rellena esas barras con una versión borrosa de la imagen — queda mucho más profesional.' },

      { type: 'h2', text: 'Tipografía' },
      { type: 'list', items: [
        ['Fuente', 'elige entre las fuentes instaladas en tu sistema (default: Cormorant Garamond para elegancia).'],
        ['Tamaño', '32-120px. 64px es buen punto de partida para 1920×1080.'],
        ['Color', 'cualquier hex.'],
        ['Peso', 'normal, semibold, bold.'],
        ['Sombra de texto', 'activa para mejor legibilidad sobre cualquier fondo.'],
      ]},

      { type: 'h2', text: 'Plantillas guardadas (próximamente)' },
      { type: 'p', text: 'En próximas versiones podrás guardar tus configuraciones personalizadas como plantillas propias para cambiar entre ellas con un click.' },
    ],
  },

  {
    slug: 'idiomas',
    title: 'Cambiar idioma de la app',
    section: 'Configuración',
    lastUpdated: '2026-05',
    summary: 'Cambia entre español, inglés y portugués.',
    content: [
      { type: 'p', text: 'EclesiaPresenter detecta el idioma de tu sistema operativo al primer arranque. Puedes cambiarlo manualmente desde Ajustes.' },

      { type: 'h2', text: 'Idiomas disponibles' },
      { type: 'list', items: [
        ['Español (es)', 'idioma principal, completo al 100%.'],
        ['English (en)', 'completo al 100%.'],
        ['Português (pt-BR)', 'completo al 100%.'],
      ]},

      { type: 'h2', text: 'Cómo cambiar' },
      { type: 'ol', items: [
        'Abre Ajustes con Ctrl+A o desde la topbar.',
        'Ve a la sección "Aspecto".',
        'En "Idioma de la app", elige el deseado.',
        'El cambio es instantáneo, no requiere reiniciar.',
      ]},

      { type: 'note', text: 'El idioma de la app no afecta a las biblias proyectadas — esas siguen siendo las versiones que tú elijas en el panel Biblia (RVR, NVI, KJV, etc.).' },

      { type: 'h2', text: '¿Falta tu idioma?' },
      { type: 'p', text: 'Si traduces voluntariamente y quieres aportar tu traducción, escríbenos a:' },
      { type: 'code', text: 'hola@eclesiapresenter.com', lang: 'text' },
    ],
  },

  {
    slug: 'almacenamiento',
    title: 'Carpetas y rutas de archivos',
    section: 'Configuración',
    lastUpdated: '2026-05',
    summary: 'Dónde guarda EclesiaPresenter tus canciones, biblias, imágenes y temas.',
    content: [
      { type: 'p', text: 'Toda la información de tu app (canciones, biblias importadas, imágenes, videos, tema visual y licencia) se guarda en una carpeta dedicada en tu perfil de usuario de Windows.' },

      { type: 'h2', text: 'Carpeta principal' },
      { type: 'p', text: 'En Windows, la ruta es:' },
      { type: 'code', text: '%APPDATA%\\EclesiaPresenter\\', lang: 'text' },
      { type: 'p', text: 'O traducido a la ruta completa:' },
      { type: 'code', text: 'C:\\Users\\<tu-usuario>\\AppData\\Roaming\\EclesiaPresenter\\', lang: 'text' },
      { type: 'tip', text: 'Para ver la ruta exacta en tu sistema, ve a Ajustes → "Acerca de" — verás "Datos del usuario" con la ruta completa.' },

      { type: 'h2', text: 'Subcarpetas y archivos' },
      { type: 'table', cols: ['Archivo / carpeta', 'Contenido'], rows: [
        ['database.sqlite',        'tus canciones (título, autor, secciones, etiquetas, favoritos).'],
        ['bibles/',                'biblias importadas manualmente (XMM, JSON).'],
        ['bibles/registry.json',   'índice de biblias importadas.'],
        ['media/',                 'imágenes y videos del panel Imágenes/Videos.'],
        ['projection-theme.json',  'configuración del tema visual proyectado.'],
        ['license.json',           'tu licencia Pro activada en este PC.'],
        ['device-id.txt',          'identificador único de este PC (16 caracteres aleatorios).'],
      ]},

      { type: 'h2', text: 'Backups' },
      { type: 'p', text: 'Para hacer un backup completo de tu instalación:' },
      { type: 'ol', items: [
        'Cierra EclesiaPresenter.',
        'Copia toda la carpeta %APPDATA%\\EclesiaPresenter\\ a tu USB o disco externo.',
        'Para restaurar, basta con copiar la carpeta de vuelta en otro PC.',
      ]},
      { type: 'warn', text: 'Si copias `license.json` y `device-id.txt` a otro PC, ambos PCs aparecerán como "el mismo" en tu /cuenta. Es preferible exportar canciones por separado y activar la licencia limpia en el PC nuevo. Ver "Activar / mover licencias entre PCs".' },

      { type: 'h2', text: 'Cambiar la carpeta' },
      { type: 'p', text: 'Actualmente la carpeta está fija en %APPDATA%. En próximas versiones podrás moverla a Documentos o una unidad externa desde Ajustes → Almacenamiento.' },
    ],
  },

  {
    slug: 'biblias-custom',
    title: 'Importar biblias propias',
    section: 'Configuración',
    lastUpdated: '2026-05',
    summary: 'Añade biblias en otros idiomas o versiones que tengas en XMM o JSON.',
    content: [
      { type: 'p', text: 'Aparte de las biblias incluidas, puedes importar tus propias biblias en formato XMM (compatible con MyBible / OpenSong) o JSON.' },

      { type: 'h2', text: 'Formatos soportados' },
      { type: 'list', items: [
        ['XMM', 'formato estándar de MyBible, OpenSong y otras apps de presentación.'],
        ['XML / BIB', 'mismo schema que XMM (etiquetas <b>, <c>, <v>).'],
        ['JSON', 'array de libros con estructura { name, abbrev, chapters: [[verses]] }.'],
      ]},

      { type: 'h2', text: 'Cómo importar' },
      { type: 'ol', items: [
        'Ve a Ajustes (Ctrl+A) → sección "Biblias".',
        'Click en "Importar biblia".',
        'Selecciona el archivo .xmm, .xml, .bib o .json en tu PC.',
        'La biblia se procesa y aparece en la lista de versiones disponibles dentro del panel Biblia.',
      ]},

      { type: 'h2', text: 'Dónde encontrar biblias XMM' },
      { type: 'list', items: [
        ['MyBible store', 'mybible.zone — base de datos con miles de versiones.'],
        ['OpenSong', 'opensong.org — versiones en muchos idiomas, gratis.'],
        ['Olive Tree Bible', 'algunos paquetes son exportables como XMM.'],
      ]},

      { type: 'h2', text: 'Eliminar una biblia importada' },
      { type: 'ol', items: [
        'Ajustes → Biblias.',
        'En la lista de "Biblias importadas", click en el icono de papelera junto a la versión que quieras quitar.',
        'Se borra inmediatamente, sin papelera intermedia.',
      ]},
      { type: 'note', text: 'Las biblias importadas siguen disponibles para todos los planes (Free y Pro) porque son TUYAS. Solo las versiones que distribuimos comercialmente requieren plan Pro.' },

      { type: 'h2', text: 'Tip · separar idiomas' },
      { type: 'p', text: 'Si presentas en una iglesia multicultural, puedes importar la KJV en inglés + RVR en español + ARC en portugués, y cambiar entre ellas desde el selector del panel Biblia en mitad del servicio.' },
    ],
  },

  // ====================================================================
  // CUENTA Y PAGOS
  // ====================================================================
  {
    slug: 'cuenta',
    title: 'Gestionar tu cuenta',
    section: 'Cuenta y pagos',
    lastUpdated: '2026-05',
    summary: 'Tu panel de cuenta en eclesia-presenter.vercel.app/cuenta.',
    content: [
      { type: 'p', text: 'En tu panel web puedes ver tu plan actual, tu clave de licencia, los PCs activados y gestionar tu facturación con Stripe.' },
      { type: 'link', href: 'https://eclesia-presenter.vercel.app/cuenta', label: 'Ir a mi cuenta →' },

      { type: 'h2', text: 'Crear cuenta' },
      { type: 'ol', items: [
        'Ve a /register o /login.',
        'Introduce tu email.',
        'Te llegará un enlace mágico (magic link) — no usamos contraseñas.',
        'Click en el enlace desde el mismo navegador donde lo solicitaste y entras directo.',
      ]},
      { type: 'note', text: 'Si no encuentras el email, revisa la carpeta de spam. El remitente es Supabase Auth.' },

      { type: 'h2', text: 'Información que verás en /cuenta' },
      { type: 'list', items: [
        ['Plan actual', 'Free, Pro Mensual, Pro Anual o Lifetime — con badge de estado (Activa, Cancelada, Pago atrasado).'],
        ['Fecha de renovación', 'cuándo se cobra el próximo pago (solo para suscripciones).'],
        ['Clave de licencia', 'formato EP-XXXX-XXXX-XXXX-XXXX. Pégala en EclesiaPresenter para activar Pro.'],
        ['Dispositivos activados', 'lista de PCs donde está activa la licencia con botón "Desactivar" para liberar slot.'],
        ['Botón "Gestionar facturación"', 'abre el Customer Portal de Stripe para cambiar tarjeta, cancelar o ver facturas.'],
      ]},

      { type: 'h2', text: 'Cambiar tu email' },
      { type: 'p', text: 'Actualmente no se puede cambiar el email asociado a la cuenta. Escribe a soporte y lo gestionamos manualmente.' },

      { type: 'h2', text: 'Borrar tu cuenta' },
      { type: 'p', text: 'Para borrar tu cuenta y todos los datos asociados (perfil, licencia, historial de pagos), escribe a hola@eclesiapresenter.com solicitándolo. La eliminación es definitiva e irreversible (cumplimiento GDPR).' },
    ],
  },

  {
    slug: 'licencias',
    title: 'Activar / mover licencias entre PCs',
    section: 'Cuenta y pagos',
    lastUpdated: '2026-05',
    summary: 'Cómo activar tu Pro en un PC y cómo cambiar de equipo.',
    content: [
      { type: 'p', text: 'Tu clave de licencia es una cadena con formato EP-XXXX-XXXX-XXXX-XXXX que se genera automáticamente cuando completas el pago en Stripe. La encuentras siempre en eclesia-presenter.vercel.app/cuenta.' },

      { type: 'h2', text: 'Activar Pro en un PC' },
      { type: 'ol', items: [
        'Abre EclesiaPresenter.',
        'Pulsa Ctrl+A o ve a Ajustes → Licencia (icono de llave).',
        'Pega tu clave en el campo (la app reconoce el formato y la convierte a mayúsculas).',
        'Click en "Activar".',
        'Si todo va bien, verás un badge verde "Activa" + tu plan + la fecha de renovación.',
      ]},
      { type: 'tip', text: 'La activación se propaga al instante a toda la app: las 10 biblias completas se desbloquean, los botones de OBS lower-third y Stage Display dejan de mostrar el modal "Función Pro".' },

      { type: 'h2', text: 'Límite de dispositivos por plan' },
      { type: 'table', cols: ['Plan', 'Max PCs'], rows: [
        ['Free',         '1'],
        ['Pro Mensual',  '1'],
        ['Pro Anual',    '3'],
        ['Lifetime',     '3'],
      ]},
      { type: 'p', text: 'Si intentas activar más PCs de los permitidos, la app te dirá "Has alcanzado el máximo de PCs activos (3/3)". Tendrás que desactivar uno primero.' },

      { type: 'h2', text: 'Mover la licencia a otro PC' },
      { type: 'ol', items: [
        'En el PC viejo: Ajustes → Licencia → "Desactivar este PC" → confirmar.',
        'O alternativamente: desde /cuenta en la web, click en "Desactivar" junto al PC que quieras liberar.',
        'En el PC nuevo: instala EclesiaPresenter, abre Ajustes → Licencia → pega la clave → Activar.',
      ]},
      { type: 'note', text: 'No hay un "límite de cambios al mes" como otras apps. Puedes mover tu licencia tantas veces como necesites.' },

      { type: 'h2', text: '¿Qué pasa si pierdo el PC?' },
      { type: 'p', text: 'Desde /cuenta puedes desactivar cualquier PC remotamente. Si tu PC fue robado o se rompió, abre /cuenta desde otro dispositivo y desactiva ese device. Inmediatamente liberará el slot para activar uno nuevo.' },

      { type: 'h2', text: 'Errores comunes' },
      { type: 'table', cols: ['Mensaje', 'Significado'], rows: [
        ['Formato inválido',     'la clave no tiene la forma EP-XXXX-XXXX-XXXX-XXXX. Verifica que no falten guiones.'],
        ['No encontramos esa clave', 'la clave está bien escrita pero no existe en la base de datos. Asegúrate de copiarla EXACTA desde /cuenta.'],
        ['Licencia inactiva',    'tu suscripción fue cancelada o no se procesó el pago. Renuévala desde /cuenta → Gestionar facturación.'],
        ['Expirada',             'la suscripción venció. Renueva el pago.'],
        ['Límite de devices',    'ya tienes el máximo de PCs activos. Desactiva uno primero.'],
        ['Error de red',         'el PC no tiene internet. La activación necesita conectarse a nuestros servidores una sola vez.'],
      ]},
    ],
  },

  {
    slug: 'facturacion',
    title: 'Facturación y pagos',
    section: 'Cuenta y pagos',
    lastUpdated: '2026-05',
    summary: 'Cambiar tarjeta, descargar facturas, cancelar y reactivar.',
    content: [
      { type: 'p', text: 'Toda la facturación se gestiona con Stripe a través del Customer Portal — el mismo sistema que usan Netflix, Spotify y otros servicios de suscripción.' },

      { type: 'h2', text: 'Abrir el Customer Portal' },
      { type: 'ol', items: [
        'Ve a /cuenta en la web.',
        'Click en "Gestionar facturación".',
        'Te redirige al portal seguro de Stripe (sigue siendo TU cuenta — no creas otra).',
      ]},

      { type: 'h2', text: 'Qué puedes hacer ahí' },
      { type: 'list', items: [
        ['Ver historial de pagos', 'todas las facturas con fecha y monto.'],
        ['Descargar PDFs de facturas', 'útiles para deducciones fiscales o reportes de iglesia.'],
        ['Cambiar tarjeta de crédito', 'sin perder la suscripción ni resetear el ciclo.'],
        ['Actualizar email de facturación', 'separado del email de login.'],
        ['Cancelar la suscripción', 'sin penalización — mantiene el acceso hasta el final del periodo pagado.'],
        ['Reactivar una suscripción cancelada', 'antes del fin del periodo, vuelve a estar activa.'],
      ]},

      { type: 'h2', text: 'Métodos de pago' },
      { type: 'list', items: [
        ['Tarjetas Visa, Mastercard, American Express', '(crédito y débito).'],
        ['Apple Pay · Google Pay', 'desde dispositivos compatibles.'],
        ['SEPA Direct Debit', '(transferencia europea, para iglesias en zona euro).'],
        ['Klarna · Affirm', 'pago aplazado en algunos países.'],
      ]},
      { type: 'note', text: 'PayPal está en evaluación. Si lo necesitas urgente, escríbenos.' },

      { type: 'h2', text: 'Lifetime · pago único' },
      { type: 'p', text: 'El plan Lifetime se paga una vez (249€) y no tiene renovación. No aparecerá en el Customer Portal como "suscripción activa" porque técnicamente no lo es — pero sigue siendo válido para siempre.' },

      { type: 'h2', text: 'Refund / devolución' },
      { type: 'p', text: 'Ofrecemos 30 días de garantía: si la app no es lo que esperabas, escríbenos en los primeros 30 días desde la compra y te devolvemos el dinero sin preguntas.' },
      { type: 'code', text: 'hola@eclesiapresenter.com', lang: 'text' },

      { type: 'h2', text: 'Cambiar de Mensual a Anual (o viceversa)' },
      { type: 'p', text: 'Desde el Customer Portal puedes cambiar entre planes. Stripe prorratea el cobro: te devuelve la parte no usada del plan viejo y cobra solo la diferencia del plan nuevo.' },
    ],
  },

  {
    slug: 'backups',
    title: 'Hacer backup de canciones',
    section: 'Cuenta y pagos',
    lastUpdated: '2026-05',
    summary: 'Exporta tus canciones a JSON para no perderlas nunca.',
    content: [
      { type: 'p', text: 'Tus canciones se guardan localmente en una base de datos SQLite. Es importante hacer backup periódicamente, sobre todo antes de cambiar de PC o reinstalar Windows.' },

      { type: 'h2', text: 'Exportar' },
      { type: 'ol', items: [
        'Abre Ajustes (Ctrl+A).',
        'Ve a la sección "Canciones".',
        'Click en "Exportar canciones".',
        'Elige dónde guardar el archivo .json (recomendado: tu Drive, OneDrive o un USB).',
      ]},
      { type: 'p', text: 'El archivo se llama por defecto:' },
      { type: 'code', text: 'eclesia-canciones-AAAA-MM-DD.json', lang: 'text' },
      { type: 'p', text: 'Contiene TODAS tus canciones con título, autor, etiquetas, secciones y configuración de auto-split.' },

      { type: 'h2', text: 'Importar' },
      { type: 'ol', items: [
        'En el PC destino, abre EclesiaPresenter.',
        'Ajustes → Canciones → "Importar canciones".',
        'Selecciona el archivo .json exportado anteriormente.',
        'Verás un resumen tipo "Importadas 47 de 50 canciones" (las 3 saltadas suelen ser duplicados).',
      ]},
      { type: 'tip', text: 'La importación NO borra las canciones existentes — añade las nuevas. Si quieres una migración limpia, primero exporta las del PC viejo, luego desinstala EclesiaPresenter en el PC nuevo (borrando %APPDATA%\\EclesiaPresenter), reinstala y luego importa.' },

      { type: 'h2', text: 'Backup automático en la nube (próximamente)' },
      { type: 'p', text: 'En v0.4+ vas a poder sincronizar tus canciones automáticamente con tu cuenta cloud (Supabase) — accesible desde cualquier PC con tu licencia, sin exportar/importar.' },

      { type: 'h2', text: 'Backup completo (incluyendo biblias y temas)' },
      { type: 'p', text: 'El JSON de canciones solo cubre canciones. Para un backup completo de TODA tu instalación (biblias importadas, imágenes, videos, tema visual, licencia), copia la carpeta:' },
      { type: 'code', text: '%APPDATA%\\EclesiaPresenter\\', lang: 'text' },
      { type: 'link', href: '/docs/almacenamiento', label: 'Ver más sobre rutas de archivos →' },
    ],
  },
]

export function getDoc(slug) {
  return DOCS.find(d => d.slug === slug)
}

export function getDocsBySection() {
  const map = new Map(SECTIONS.map(s => [s, []]))
  for (const d of DOCS) {
    if (!map.has(d.section)) map.set(d.section, [])
    map.get(d.section).push(d)
  }
  return Array.from(map.entries()).map(([title, items]) => ({ title, items }))
}

export function getNextPrev(slug) {
  const idx = DOCS.findIndex(d => d.slug === slug)
  return {
    prev: idx > 0 ? DOCS[idx - 1] : null,
    next: idx < DOCS.length - 1 ? DOCS[idx + 1] : null,
  }
}
