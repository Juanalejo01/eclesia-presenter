// Utilidades de texto compartidas — normalización para búsquedas tolerantes.

/**
 * Normaliza un texto para búsqueda: minúsculas, sin tildes/diacríticos,
 * sin signos de puntuación. Permite buscar "genesis" y encontrar "Génesis",
 * o "como esta" y encontrar "¿cómo está?".
 */
export function normalizeText(s) {
  if (!s) return ''
  return String(s)
    .toLowerCase()
    .normalize('NFD')                // descompone á → a + ́
    .replace(/[̀-ͯ]/g, '') // elimina los diacríticos
    .replace(/[¿¡?!.,;:"'`´]/g, '')  // elimina signos comunes
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * ¿El texto contiene la query (normalizado)?
 */
export function matches(haystack, needle) {
  if (!needle) return true
  return normalizeText(haystack).includes(normalizeText(needle))
}

/**
 * Convierte texto a mayúsculas preservando saltos de línea.
 */
export function toUpper(text) {
  return (text || '').toUpperCase()
}
