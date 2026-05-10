const Database = require('better-sqlite3')
const path = require('path')
const { app } = require('electron')

let db = null

function getDbPath() {
  return path.join(app.getPath('userData'), 'eclesia.db')
}

function init() {
  if (db) return db

  db = new Database(getDbPath())
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  // Esquema: canciones con secciones (JSON array)
  db.exec(`
    CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT,
      key_signature TEXT,
      tempo INTEGER,
      tags TEXT,
      sections TEXT NOT NULL DEFAULT '[]',
      is_favorite INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
    );

    CREATE INDEX IF NOT EXISTS idx_songs_title ON songs(title);
    CREATE INDEX IF NOT EXISTS idx_songs_favorite ON songs(is_favorite);

    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,             -- 'image' | 'video'
      path TEXT NOT NULL,             -- ruta absoluta (ya copiada al userData)
      mime TEXT,
      size INTEGER,
      added_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
    );
    CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
    CREATE INDEX IF NOT EXISTS idx_media_added ON media(added_at DESC);
  `)

  seedIfEmpty()
  return db
}

// Seed inicial: solo himnos en dominio público (sin riesgo de copyright).
// Se inserta UNA SOLA VEZ al primer arranque cuando la tabla songs está vacía.
// El usuario puede editar / eliminar / reemplazar libremente.
function seedIfEmpty() {
  const { count } = db.prepare('SELECT COUNT(*) as count FROM songs').get()
  if (count > 0) return

  const seedData = [
    {
      title: 'Sublime Gracia',
      author: 'John Newton (1779) · Trad. tradicional',
      tags: 'himno,clásica,dominio público',
      sections: [
        { type: 'verse',  label: 'Estrofa 1', text: 'Sublime gracia del Señor\nque a un infeliz salvó;\nFui ciego, mas hoy veo yo,\nperdido y Él me halló.' },
        { type: 'verse',  label: 'Estrofa 2', text: 'Su gracia me enseñó a temer,\nmis dudas ahuyentó;\n¡Oh, cuán precioso fue a mi ser\ncuando Él me transformó!' },
        { type: 'verse',  label: 'Estrofa 3', text: 'En los peligros o aflicción\nque yo he tenido aquí,\nsu gracia siempre me libró\ny me guiará feliz.' },
        { type: 'verse',  label: 'Estrofa 4', text: 'Y cuando en Sion por siglos mil,\nbrillando esté cual sol,\nyo cantaré por siempre allí\nsu amor que me salvó.' },
      ],
    },
    {
      title: 'Castillo Fuerte es Nuestro Dios',
      author: 'Martín Lutero (1529) · Trad. tradicional',
      tags: 'himno,clásica,dominio público,reforma',
      sections: [
        { type: 'verse',  label: 'Estrofa 1', text: 'Castillo fuerte es nuestro Dios,\ndefensa y buen escudo;\ncon su poder nos librará\nen este trance agudo.' },
        { type: 'verse',  label: 'Estrofa 2', text: 'Con furia y con afán\nacósanos Satán;\npor armas deja ver\nastucia y gran poder;\ncual él no hay en la tierra.' },
        { type: 'verse',  label: 'Estrofa 3', text: 'Nuestro valor es nada aquí,\ncon él todo es perdido;\nmas por nosotros pugnará\nde Dios el Escogido.' },
      ],
    },
    {
      title: 'A Dios Sea la Gloria',
      author: 'Fanny J. Crosby (1875) · Trad. tradicional',
      tags: 'himno,alabanza,dominio público',
      sections: [
        { type: 'verse',  label: 'Estrofa 1', text: 'A Dios sea gloria, grandes cosas Él hizo,\ntanto nos amó que a su Hijo nos dio,\nquien dio su vida nuestro ser redimiendo,\ny las puertas del cielo nos abrió.' },
        { type: 'chorus', label: 'Coro',      text: 'Alabadle, alabadle, oh tierra al Señor;\nAlabadle, alabadle, grande es su amor.\nVenid, oh familias del mundo, venid,\ny por Cristo a nuestro Padre acudid;\npor Él gloria a Dios cantad.' },
      ],
    },
    {
      title: 'Cuán Glorioso es Mi Cristo',
      author: 'Edmond L. Budry (1884) · Trad. tradicional',
      tags: 'himno,resurrección,dominio público',
      sections: [
        { type: 'verse',  label: 'Estrofa 1', text: 'Cuán glorioso es mi Cristo,\nEl Cordero inmaculado,\nQuien por mí fue crucificado;\nMi alma proclamará el amor\ndel Señor y Salvador.' },
        { type: 'chorus', label: 'Coro',      text: '¡Aleluya, aleluya, aleluya!\nEs Jesús el vencedor.\n¡Aleluya, aleluya, aleluya!\nGloria a Cristo el Salvador.' },
      ],
    },
    {
      title: 'Santo, Santo, Santo',
      author: 'Reginald Heber (1826) · Trad. tradicional',
      tags: 'himno,adoración,dominio público,trinidad',
      sections: [
        { type: 'verse',  label: 'Estrofa 1', text: 'Santo, santo, santo, Señor omnipotente,\nsiempre el labio mío loores te dará.\nSanto, santo, santo, te adoro reverente,\nDios en tres personas, bendita Trinidad.' },
        { type: 'verse',  label: 'Estrofa 2', text: 'Santo, santo, santo, en numeroso coro\nsantos escogidos te adoran sin cesar.\nDe alegría llenos, y sus coronas de oro\nrinden ante el trono y el cristalino mar.' },
      ],
    },
  ]

  const insert = db.prepare(`
    INSERT INTO songs (title, author, tags, sections)
    VALUES (@title, @author, @tags, @sections)
  `)

  // Transacción para insertar todas atómicamente
  const insertMany = db.transaction((songs) => {
    for (const song of songs) {
      insert.run({ ...song, sections: JSON.stringify(song.sections) })
    }
  })
  insertMany(seedData)

  console.log(`[db] Seeded ${seedData.length} canciones de inicio (himnos en dominio público)`)
}

// Parsear filas desde SQLite (sections viene como string JSON)
function parseRow(row) {
  if (!row) return null
  return {
    ...row,
    sections: JSON.parse(row.sections || '[]'),
    is_favorite: !!row.is_favorite,
  }
}

function listSongs({ search = '', onlyFavorites = false } = {}) {
  let sql = 'SELECT * FROM songs WHERE 1=1'
  const params = {}

  if (search) {
    sql += ' AND (title LIKE @q OR author LIKE @q OR tags LIKE @q)'
    params.q = `%${search}%`
  }
  if (onlyFavorites) sql += ' AND is_favorite = 1'

  sql += ' ORDER BY is_favorite DESC, title ASC'
  return db.prepare(sql).all(params).map(parseRow)
}

function getSong(id) {
  return parseRow(db.prepare('SELECT * FROM songs WHERE id = ?').get(id))
}

function createSong(data) {
  const now = Date.now()
  const result = db.prepare(`
    INSERT INTO songs (title, author, key_signature, tempo, tags, sections, created_at, updated_at)
    VALUES (@title, @author, @key_signature, @tempo, @tags, @sections, @created_at, @updated_at)
  `).run({
    title: data.title,
    author: data.author || null,
    key_signature: data.key_signature || null,
    tempo: data.tempo || null,
    tags: data.tags || null,
    sections: JSON.stringify(data.sections || []),
    created_at: now,
    updated_at: now,
  })
  return getSong(result.lastInsertRowid)
}

function updateSong(id, data) {
  db.prepare(`
    UPDATE songs
    SET title = @title, author = @author, key_signature = @key_signature,
        tempo = @tempo, tags = @tags, sections = @sections, updated_at = @updated_at
    WHERE id = @id
  `).run({
    id,
    title: data.title,
    author: data.author || null,
    key_signature: data.key_signature || null,
    tempo: data.tempo || null,
    tags: data.tags || null,
    sections: JSON.stringify(data.sections || []),
    updated_at: Date.now(),
  })
  return getSong(id)
}

function deleteSong(id) {
  db.prepare('DELETE FROM songs WHERE id = ?').run(id)
  return { deleted: true, id }
}

function toggleFavorite(id) {
  db.prepare('UPDATE songs SET is_favorite = 1 - is_favorite WHERE id = ?').run(id)
  return getSong(id)
}

// --------- Media ---------

function listMedia({ type } = {}) {
  let sql = 'SELECT * FROM media'
  const params = {}
  if (type) { sql += ' WHERE type = @type'; params.type = type }
  sql += ' ORDER BY added_at DESC'
  return db.prepare(sql).all(params)
}

function addMedia({ name, type, path, mime, size }) {
  const result = db.prepare(`
    INSERT INTO media (name, type, path, mime, size) VALUES (?, ?, ?, ?, ?)
  `).run(name, type, path, mime || null, size || null)
  return db.prepare('SELECT * FROM media WHERE id = ?').get(result.lastInsertRowid)
}

function deleteMedia(id) {
  const item = db.prepare('SELECT * FROM media WHERE id = ?').get(id)
  if (item) {
    // Borrar el archivo físico también
    try { require('fs').unlinkSync(item.path) } catch {}
  }
  db.prepare('DELETE FROM media WHERE id = ?').run(id)
  return { deleted: true, id }
}

module.exports = {
  init,
  listSongs, getSong, createSong, updateSong, deleteSong, toggleFavorite,
  listMedia, addMedia, deleteMedia,
}
