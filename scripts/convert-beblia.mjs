// Convierte XML formato Beblia (https://github.com/Beblia/Holy-Bible-XML-Format)
// al formato JSON nativo del app: [{ name, abbrev, chapters: [[v1, v2, ...]] }, ...]
//
// Formato source:
//   <bible>
//     <testament name="Old">
//       <book number="1">
//         <chapter number="1">
//           <verse number="1">...</verse>
//
// Usage:  node scripts/convert-beblia.mjs <input.xml> <output.json>

import { readFileSync, writeFileSync } from 'node:fs'
import { argv } from 'node:process'

// 66 libros canónicos en orden protestante. El XML de Beblia usa números 1-66.
const BOOKS = [
  { num: 1,  name: 'Génesis',          abbrev: 'gn'   },
  { num: 2,  name: 'Éxodo',            abbrev: 'ex'   },
  { num: 3,  name: 'Levítico',         abbrev: 'lv'   },
  { num: 4,  name: 'Números',          abbrev: 'nm'   },
  { num: 5,  name: 'Deuteronomio',     abbrev: 'dt'   },
  { num: 6,  name: 'Josué',            abbrev: 'js'   },
  { num: 7,  name: 'Jueces',           abbrev: 'jud'  },
  { num: 8,  name: 'Rut',              abbrev: 'rt'   },
  { num: 9,  name: '1 Samuel',         abbrev: '1sm'  },
  { num: 10, name: '2 Samuel',         abbrev: '2sm'  },
  { num: 11, name: '1 Reyes',          abbrev: '1kgs' },
  { num: 12, name: '2 Reyes',          abbrev: '2kgs' },
  { num: 13, name: '1 Crónicas',       abbrev: '1ch'  },
  { num: 14, name: '2 Crónicas',       abbrev: '2ch'  },
  { num: 15, name: 'Esdras',           abbrev: 'ezr'  },
  { num: 16, name: 'Nehemías',         abbrev: 'ne'   },
  { num: 17, name: 'Ester',            abbrev: 'et'   },
  { num: 18, name: 'Job',              abbrev: 'job'  },
  { num: 19, name: 'Salmos',           abbrev: 'ps'   },
  { num: 20, name: 'Proverbios',       abbrev: 'prv'  },
  { num: 21, name: 'Eclesiastés',      abbrev: 'ec'   },
  { num: 22, name: 'Cantares',         abbrev: 'so'   },
  { num: 23, name: 'Isaías',           abbrev: 'is'   },
  { num: 24, name: 'Jeremías',         abbrev: 'jr'   },
  { num: 25, name: 'Lamentaciones',    abbrev: 'lm'   },
  { num: 26, name: 'Ezequiel',         abbrev: 'ez'   },
  { num: 27, name: 'Daniel',           abbrev: 'dn'   },
  { num: 28, name: 'Oseas',            abbrev: 'ho'   },
  { num: 29, name: 'Joel',             abbrev: 'jl'   },
  { num: 30, name: 'Amós',             abbrev: 'am'   },
  { num: 31, name: 'Abdías',           abbrev: 'ob'   },
  { num: 32, name: 'Jonás',            abbrev: 'jn'   },
  { num: 33, name: 'Miqueas',          abbrev: 'mi'   },
  { num: 34, name: 'Nahúm',            abbrev: 'na'   },
  { num: 35, name: 'Habacuc',          abbrev: 'hk'   },
  { num: 36, name: 'Sofonías',         abbrev: 'zp'   },
  { num: 37, name: 'Hageo',            abbrev: 'hg'   },
  { num: 38, name: 'Zacarías',         abbrev: 'zc'   },
  { num: 39, name: 'Malaquías',        abbrev: 'ml'   },
  { num: 40, name: 'Mateo',            abbrev: 'mt'   },
  { num: 41, name: 'Marcos',           abbrev: 'mk'   },
  { num: 42, name: 'Lucas',            abbrev: 'lk'   },
  { num: 43, name: 'Juan',             abbrev: 'jo'   },
  { num: 44, name: 'Hechos',           abbrev: 'act'  },
  { num: 45, name: 'Romanos',          abbrev: 'rm'   },
  { num: 46, name: '1 Corintios',      abbrev: '1co'  },
  { num: 47, name: '2 Corintios',      abbrev: '2co'  },
  { num: 48, name: 'Gálatas',          abbrev: 'gl'   },
  { num: 49, name: 'Efesios',          abbrev: 'eph'  },
  { num: 50, name: 'Filipenses',       abbrev: 'ph'   },
  { num: 51, name: 'Colosenses',       abbrev: 'cl'   },
  { num: 52, name: '1 Tesalonicenses', abbrev: '1ts'  },
  { num: 53, name: '2 Tesalonicenses', abbrev: '2ts'  },
  { num: 54, name: '1 Timoteo',        abbrev: '1tm'  },
  { num: 55, name: '2 Timoteo',        abbrev: '2tm'  },
  { num: 56, name: 'Tito',             abbrev: 'tt'   },
  { num: 57, name: 'Filemón',          abbrev: 'phm'  },
  { num: 58, name: 'Hebreos',          abbrev: 'hb'   },
  { num: 59, name: 'Santiago',         abbrev: 'jm'   },
  { num: 60, name: '1 Pedro',          abbrev: '1pe'  },
  { num: 61, name: '2 Pedro',          abbrev: '2pe'  },
  { num: 62, name: '1 Juan',           abbrev: '1jo'  },
  { num: 63, name: '2 Juan',           abbrev: '2jo'  },
  { num: 64, name: '3 Juan',           abbrev: '3jo'  },
  { num: 65, name: 'Judas',            abbrev: 'jd'   },
  { num: 66, name: 'Apocalipsis',      abbrev: 'rv'   },
]

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
}

function cleanVerse(text) {
  return decodeEntities(text)
    .replace(/<[^>]+>/g, '')        // strip inline tags si los hay
    .replace(/\r?\n/g, ' ').replace(/\s+/g, ' ')
    .trim()
}

function parseBeblia(xml) {
  // Strip BOM y XML decl
  xml = xml.replace(/^﻿/, '').replace(/<\?xml[^?]*\?>/, '')

  const result = []

  // Inicializa array de 66 libros vacíos
  for (const meta of BOOKS) {
    result.push({ abbrev: meta.abbrev, name: meta.name, chapters: [] })
  }

  // Iterar sobre cada <book>
  const bookRe = /<book\s+number="(\d+)"\s*>([\s\S]*?)<\/book>/g
  let bMatch
  while ((bMatch = bookRe.exec(xml)) !== null) {
    const bookNum = +bMatch[1]
    const bookBody = bMatch[2]
    const bookIdx = bookNum - 1
    if (bookIdx < 0 || bookIdx >= BOOKS.length) continue

    const chapRe = /<chapter\s+number="(\d+)"\s*>([\s\S]*?)<\/chapter>/g
    let cMatch
    while ((cMatch = chapRe.exec(bookBody)) !== null) {
      const chapNum = +cMatch[1]
      const chapBody = cMatch[2]
      const verses = []

      const verseRe = /<verse\s+number="(\d+)"[^>]*>([\s\S]*?)<\/verse>/g
      let vMatch
      while ((vMatch = verseRe.exec(chapBody)) !== null) {
        verses[+vMatch[1] - 1] = cleanVerse(vMatch[2])
      }
      result[bookIdx].chapters[chapNum - 1] = verses
    }
  }

  return result
}

const [, , inFile, outFile] = argv
if (!inFile || !outFile) {
  console.error('Usage: node convert-beblia.mjs <input.xml> <output.json>')
  process.exit(1)
}

const xml = readFileSync(inFile, 'utf8')
const books = parseBeblia(xml)
const totalChapters = books.reduce((s, b) => s + b.chapters.length, 0)
const totalVerses = books.reduce((s, b) => s + b.chapters.reduce((s2, c) => s2 + (c?.length || 0), 0), 0)

writeFileSync(outFile, JSON.stringify(books))
console.log(`✓ ${inFile} → ${outFile}`)
console.log(`  ${books.length} libros · ${totalChapters} capítulos · ${totalVerses} versículos`)
