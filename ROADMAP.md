# EclesiaPresenter — Roadmap de Features

> Análisis competitivo + plan de implementación de las utilidades pedidas y otras
> que el mercado usa frecuentemente.

## 📊 Estado actual vs ProPresenter / EasyWorship

ProPresenter (Renewed Vision) es el estándar de facto en iglesias grandes en
inglés. EasyWorship es su competencia barata. Esto es lo que tenemos y lo que
nos falta:

### Núcleo de presentación

| Feature | EclesiaPresenter | ProPresenter | EasyWorship | Notas |
|---|---|---|---|---|
| Biblia multi-versión | ✅ 3 Free + 10 Pro | ✅ Cientos | ✅ ~30 | OK |
| Búsqueda inteligente (libro cap:ver) | ✅ | ✅ | ✅ | OK |
| Auto-split versículos largos | ✅ | ✅ | ⚠️ Manual | Ventaja |
| Editor de canciones por secciones | ✅ | ✅ | ✅ | OK |
| Auto-split slides de canción | ✅ | ✅ | ⚠️ Limitado | OK |
| Import XMM bibles | ✅ | ✅ | ❌ | Ventaja |
| Lower-third para OBS | ✅ Pro | ✅ | ⚠️ Plugin | OK |
| Stage Display (monitor del músico) | ⚠️ Básico | ✅ Avanzado | ✅ | **MEJORAR** |
| Transiciones entre slides | ✅ 4 tipos | ✅ 20+ tipos | ✅ ~10 | Ampliar |
| Plantillas visuales | ✅ 6 presets | ✅ Editor completo | ✅ Editor | **MEJORAR** |
| Multi-monitor | ✅ | ✅ | ✅ | OK |

### Multimedia

| Feature | Nuestro estado | PP | EW |
|---|---|---|---|
| Imágenes | ✅ | ✅ | ✅ |
| Videos en bucle | ✅ | ✅ | ✅ |
| Videos con audio (worship video) | ⚠️ Básico | ✅ Editor | ✅ | **AÑADIR** |
| Streaming desde YouTube embed | ❌ | ✅ | ⚠️ | Bajo |
| Capa de fondo + capa de letra (composing) | ❌ | ✅ | ❌ | **AÑADIR** |
| Foto de fondo automática para verso | ❌ | ✅ (Pixabay) | ❌ | **AÑADIR** Pro |

### Live production

| Feature | Nuestro | PP | EW |
|---|---|---|---|
| Control remoto WiFi (móvil) | ✅ 3 tabs + PIN | ✅ App nativa | ⚠️ Web básico | **VENTAJA** |
| Multiple displays | ✅ | ✅ | ✅ | OK |
| Schedule / Lista del día | ✅ | ✅ | ✅ | OK |
| Drag & drop entre paneles | ✅ | ✅ | ✅ | OK |
| **Reloj / Countdown / Cronómetro** | ❌ | ✅ | ✅ | **AÑADIR** (este round) |
| **Verso aleatorio para dinámicas** | ❌ | ❌ | ❌ | **VENTAJA original** |
| **Ruleta / Sorteo** | ❌ | ❌ | ❌ | **VENTAJA original** |
| **NDI output** (transmite a OBS sin captura) | ❌ | ✅ | ✅ | Roadmap v0.6 |
| Triggers MIDI / OSC | ❌ | ✅ | ⚠️ | Solo iglesias muy grandes |

### Cuenta y comercial

| Feature | Nuestro | PP | EW |
|---|---|---|---|
| Web de cuenta + pricing | ✅ | ✅ | ✅ | OK |
| Stripe Checkout | ✅ | ✅ | ✅ | OK |
| Customer Portal (gestión facturación) | ✅ | ✅ | ✅ | OK |
| Plan Lifetime | ✅ 249€ | ❌ Solo suscripción | ❌ | **VENTAJA** |
| Free tier funcional | ✅ | ❌ Solo trial | ❌ | **VENTAJA** |
| Backup cloud automático | ❌ | ✅ | ⚠️ | Roadmap v0.5 |
| Multi-device sync | ❌ | ✅ | ⚠️ | Roadmap v0.5 |

### Donde GANAMOS claramente

1. **Control remoto móvil sin instalar app** (Web App con PIN) — PP requiere app nativa por App Store
2. **Plan Lifetime** — PP/EW solo tienen suscripción
3. **Auto-split de versículos largos** — funciona out-of-the-box
4. **Documentación 100% en español** — PP/EW priorizan inglés
5. **Free tier real con 3 biblias** — el resto solo dan trial
6. **Precio**: 9€/mes vs PP 17€/mes vs EW 11€/mes
7. **Soporte 100% LATAM/España** — atención en horario hispano

### Donde NOS FALTA blindarnos

1. **Stage Display avanzado** (el que mencionas tú)
2. **Editor de temas avanzado** (más allá de los 6 presets)
3. **Backup cloud + sync multi-PC** (esto es **CRÍTICO** para iglesias)
4. **NDI** (importante para iglesias con producción media-alta)
5. **Biblioteca de fondos preset incluidos** (PP trae 50+ videos worship)
6. **Plantillas listas para predicación** (vs editar el tema cada vez)

---

# 🛠️ Plan de implementación

Voy a agrupar las features en sprints. Cada sprint = ~1-2 semanas de trabajo.

## Sprint A — UTILIDADES (lo que pides ahora)

**Objetivo**: nuevo panel "Herramientas" en la sidebar con 4 widgets útiles.

| # | Feature | Esfuerzo | Tipo |
|---|---|---|---|
| 1 | Countdown / Cuenta atrás proyectable | Bajo | Free |
| 2 | Cronómetro / Stopwatch para dinámicas | Bajo | Free |
| 3 | Selector de versículo aleatorio | Bajo | Free |
| 4 | Ruleta personalizable (nombres) | Medio | Free |
| 5 | Stage Display v2 (controlable + monitorizable) | Medio | Pro |

### Diseño del panel "Herramientas"

```
┌────────────────────────────────────────────────┐
│ Herramientas                                    │
├────────────────────────────────────────────────┤
│ [⏱ Countdown] [⏲ Cronómetro] [🎲 Ruleta]      │
│ [📖 Verso al azar] [🖥 Stage Display]          │
├────────────────────────────────────────────────┤
│ (Contenido del widget seleccionado)             │
│                                                 │
│ Botón principal: "Proyectar al live"           │
└────────────────────────────────────────────────┘
```

### Widget 1: Countdown / Cuenta atrás

- Input "Tiempo: [HH] [MM] [SS]" o "Hora destino: [datetime-local]"
- Mensaje personalizable: "El servicio inicia en..."
- Estilo configurable (tamaño, color, fuente — usa el theme actual)
- Botones: **Empezar** / **Pausar** / **Reiniciar** / **Proyectar al live**
- Cuando se proyecta: una nueva ventana o el slide live muestra:
  ```
  El servicio inicia en
   1:26:43
  ```
- Al llegar a 00:00 → muestra mensaje "¡Empezamos!" + sonido opcional

### Widget 2: Cronómetro

- 00:00:00.00 con precisión de centésimas
- Botones: **Start / Stop / Lap / Reset**
- Sin proyección por defecto (uso interno del operador) pero con botón
  "Proyectar al live" si lo necesitas (ej. dinámica de tiempo)
- Hotkey opcional: F8 = Start/Stop

### Widget 3: Verso aleatorio

- Dropdown: ¿De qué? → "Toda la Biblia" / "Solo NT" / "Solo AT" /
  "Salmos" / "Proverbios" / "Evangelios" / "Mis favoritos"
- Botón **Sortear** → muestra un verso al azar
- Botón **Otro** → re-sortea
- Botón **Proyectar al live**
- Historial de los últimos 5 sorteados (por si te gustó uno anterior)
- Tip: ideal para dinámicas tipo "te toca a ti leer el verso de hoy"

### Widget 4: Ruleta

- Lista editable de nombres / opciones (tipo "Juan, María, Pedro, ...")
- Modo:
  - **Animación** (la ruleta gira físicamente con SVG, 3-5 segundos)
  - **Instantáneo** (selecciona y ya)
- Sonido opcional (tic-tac mientras gira)
- Botón **Girar** → resalta el ganador
- "Quitar al ganador de la lista" toggle para sorteos sin repetir
- Botón **Proyectar al live** muestra el ganador en grande

### Widget 5: Stage Display v2

(Es una ampliación del actual, no widget nuevo)
- Vista del slide actual + próximo slide pre-renderizado
- Reloj grande
- Tiempo en aire (uptime de la transmisión)
- **Notas del predicador** (campo de texto que solo aparece en stage, no en proyector)
- **Cuenta atrás integrada** si hay countdown activo
- Modo "letra grande" para vocalistas

---

## Sprint B — POLISH PROYECCIÓN (próximo después de Sprint A)

Cosas que el mercado tiene y nos faltan:

1. **Más transiciones**: zoom, flip, cube, slide (4 direcciones)
2. **Editor de temas avanzado**: guardar tus propios presets con nombre
3. **Biblioteca de fondos preset** — 20-30 videos / imágenes worship gratis
   incluidos en la app (CC0 desde Pexels / Pixabay)
4. **Plantillas de predicación**: layouts especiales (sermón con título + punto
   principal + 3 sub-puntos como bullets)

## Sprint C — CLOUD & SYNC (el feature que más nos pide diferenciar)

1. **Backup automático** de canciones a tu cuenta cloud (Supabase Storage)
2. **Multi-device sync**: tus canciones aparecen en cualquier PC tras login
3. **Biblioteca de canciones compartida** entre iglesias (opt-in)

## Sprint D — PROFESSIONAL OUTPUT (para iglesias grandes)

1. **NDI output** (vMix, OBS, ATEM lo capturan sin pantalla compartida)
2. **WebRTC streaming**: la app emite el slide a un servidor que cualquier
   broadcasting captura
3. **Triggers MIDI/OSC**: control desde mesa de audio o pedales
4. **API REST** para integraciones de terceros (CCLI, Planning Center, etc.)

## Sprint E — POLISH MARKETING Y CRECIMIENTO

1. **Centro de plantillas comunitario** — usuarios suben sus presets y otros los descargan
2. **Marketplace de fondos premium** — videos worship pro a 1-3€ cada uno (revenue extra)
3. **Programa de afiliados** — pastores que recomienden ganan 20% del primer año

---

# 🎯 Prioridades inmediatas (mi recomendación)

| Orden | Item | Por qué |
|---|---|---|
| 1 | Sprint A · Utilidades (las que pides) | Diferenciación inmediata, cero competidores lo tienen |
| 2 | Sprint C · Cloud backup + sync | El feature #1 que pide el mercado iglesia |
| 3 | Sprint B · Polish proyección | Cierra brecha visual con PP |
| 4 | Sprint D · NDI + API | Solo cuando tengas clientes grandes pidiéndolo |

Si haces Sprint A + Sprint C en los próximos 2 meses, tienes un producto que
compite directamente con ProPresenter a un tercio del precio y con MÁS features
que el mercado hispano valora.
