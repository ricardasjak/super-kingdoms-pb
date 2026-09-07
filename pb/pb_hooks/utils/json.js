/// <reference path="../../../pb_data/types.d.ts" />

// Shared JSON field parsing for PocketBase JSVM (GOJA) record reads.
//
// `record.get()` on a JSON column does NOT reliably return a parsed object:
// depending on the field it may come back as a raw UTF-8 byte array
// (e.g. `[123, 34, ...]` for `{"...`), a JSON string, or an object.
// Routes that read-modify-write JSON columns (buildings, military, queues)
// MUST parse through these helpers first — otherwise counts read back as
// zero ("Cannot raze more than owned") and saves corrupt or reject the field.
//
// Load inside the handler (scope isolation):
//   const jsonUtils = require(`${__hooks}/utils/json.js`)

function bytesToString(bytes) {
  let str = ""
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i])
  return str
}

// Raw JSON bytes start with `{` (123) for objects or `[` (91) for arrays.
function isByteArray(val) {
  return Array.isArray(val) &&
    val.length > 0 &&
    typeof val[0] === "number" &&
    (val[0] === 91 || val[0] === 123)
}

function tryParse(str) {
  try {
    return JSON.parse(str)
  } catch {
    return undefined
  }
}

// Resolve every representation to its JSON text, or null.
function toJsonText(val, rec, key) {
  if (rec && key && typeof rec.getString === "function") {
    try {
      const s = rec.getString(key)
      if (s) return s
    } catch {
      // fall through to val-based parsing
    }
  }
  if (typeof val === "string") return val
  if (isByteArray(val)) return bytesToString(val)
  return null
}

module.exports.parseJsonObject = function (val, rec, key) {
  const text = toJsonText(val, rec, key)
  if (text) {
    const parsed = tryParse(text)
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed
    }
  }
  if (val && typeof val === "object" && !Array.isArray(val)) return val
  return {}
}

module.exports.parseJsonArray = function (val, rec, key) {
  const text = toJsonText(val, rec, key)
  if (text) {
    const parsed = tryParse(text)
    if (Array.isArray(parsed)) {
      // Guard against a nested byte-array that survived stringification.
      if (isByteArray(parsed)) {
        const inner = tryParse(bytesToString(parsed))
        if (Array.isArray(inner)) return inner
      }
      return parsed
    }
  }
  if (Array.isArray(val) && !isByteArray(val)) return val
  return []
}
