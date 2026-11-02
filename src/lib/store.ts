import { useMemo, useSyncExternalStore } from 'react'
import { config } from '../data/config'
import { emptyStored, merge } from './rules'
import type { Names, Stored } from './rules'

const KEY = 'baby-names:v1'

const isStrings = (x: unknown): x is string[] => Array.isArray(x) && x.every((i) => typeof i === 'string')
const isAdded = (x: unknown): boolean =>
  typeof x === 'object' && x !== null && isStrings((x as Record<string, unknown>).first) && isStrings((x as Record<string, unknown>).middle)

function parse(raw: string | null): Stored {
  try {
    const v: unknown = JSON.parse(raw ?? 'null')
    if (typeof v !== 'object' || v === null) return emptyStored
    const o = v as Record<string, unknown>
    if (!isAdded(o.boys) || !isAdded(o.girls)) return emptyStored
    if (o.surname !== undefined && typeof o.surname !== 'string') return emptyStored
    return v as Stored
  } catch {
    return emptyStored
  }
}

export function createStore(storage: Storage | undefined) {
  let snapshot: Stored | undefined
  const listeners = new Set<() => void>()

  const load = (): Stored => {
    try {
      return parse(storage?.getItem(KEY) ?? null)
    } catch {
      return emptyStored
    }
  }

  const getSnapshot = () => (snapshot ??= load())

  return {
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => void listeners.delete(listener)
    },
    getSnapshot,
    getServerSnapshot: getSnapshot, // client-only app: no real SSR
    /** Returns whether the value was persisted; the in-memory state updates either way. */
    save(next: Stored): boolean {
      snapshot = next
      listeners.forEach((l) => l())
      try {
        if (!storage) return false
        storage.setItem(KEY, JSON.stringify(next))
        return true
      } catch {
        return false
      }
    },
  }
}

function browserStorage(): Storage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage
  } catch {
    return undefined
  }
}

export const store = createStore(browserStorage())

export function useNames(): Names {
  const stored = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot)
  return useMemo(() => merge(config, stored), [stored])
}
