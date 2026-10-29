/**
 * Class names utility supporting strings, booleans, objects, and nested arrays.
 */
export type ClassValue =
  | ClassArray
  | ClassDictionary
  | string
  | number
  | null
  | boolean
  | undefined

export interface ClassDictionary {
  [id: string]: boolean | null | undefined
}

export type ClassArray = ClassValue[]

function toVal(mix: ClassValue): string {
  let str = ''

  if (typeof mix === 'string' || typeof mix === 'number') {
    str += mix
  } else if (typeof mix === 'object') {
    if (Array.isArray(mix)) {
      for (let k = 0; k < mix.length; k++) {
        if (mix[k]) {
          const y = toVal(mix[k])
          if (y) {
            if (str) str += ' '
            str += y
          }
        }
      }
    } else if (mix !== null) {
      for (const k in mix) {
        if (mix[k]) {
          if (str) str += ' '
          str += k
        }
      }
    }
  }

  return str
}

export function cn(...inputs: ClassValue[]): string {
  let i = 0
  let tmp: ClassValue
  let str = ''
  while (i < inputs.length) {
    tmp = inputs[i++]
    if (tmp) {
      const x = toVal(tmp)
      if (x) {
        if (str) str += ' '
        str += x
      }
    }
  }
  return str
}

/** Demo identifiers must never be converted into real backend resource IDs. */
export function parseBackendId(id: string): number {
  const value = /^\d+$/.test(id) ? Number(id) : NaN
  return Number.isSafeInteger(value) && value > 0 ? value : NaN
}
