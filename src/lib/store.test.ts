import { afterEach, describe, expect, it, vi } from 'vitest'
import { emptyStored } from './rules'
import type { Stored } from './rules'
import { createStore, persist } from './store'

const KEY = 'baby-names:v1'

function fake(initial?: string): Storage & { data: Map<string, string> } {
  const data = new Map<string, string>()
  if (initial !== undefined) data.set(KEY, initial)
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  } as unknown as Storage & { data: Map<string, string> }
}

const sample: Stored = { surname: 'Smith', boys: { first: ['Noah'], middle: ['Noah'] }, girls: { first: [], middle: [] } }

describe('createStore', () => {
  it('is empty when storage is empty', () => {
    expect(createStore(fake()).getSnapshot()).toEqual(emptyStored)
  })

  it('loads valid JSON from the key', () => {
    expect(createStore(fake(JSON.stringify(sample))).getSnapshot()).toEqual(sample)
  })

  it.each(['{not json', '{"boys":1}', '[]', 'null', '{"boys":{"first":[1],"middle":[]},"girls":{"first":[],"middle":[]}}'])(
    'treats %s as empty',
    (raw) => {
      expect(createStore(fake(raw)).getSnapshot()).toEqual(emptyStored)
    },
  )

  it('is empty when getItem throws', () => {
    const s = { getItem: () => { throw new Error('denied') }, setItem: () => {} } as unknown as Storage
    expect(createStore(s).getSnapshot()).toEqual(emptyStored)
  })

  it('getServerSnapshot returns the same as getSnapshot', () => {
    const st = createStore(fake(JSON.stringify(sample)))
    expect(st.getServerSnapshot()).toBe(st.getSnapshot())
  })

  it('save updates the snapshot, notifies, writes JSON and returns true', () => {
    const storage = fake()
    const st = createStore(storage)
    const listener = vi.fn()
    st.subscribe(listener)
    expect(st.save(sample)).toBe(true)
    expect(st.getSnapshot()).toEqual(sample)
    expect(listener).toHaveBeenCalledTimes(1)
    expect(JSON.parse(storage.data.get(KEY) ?? '')).toEqual(sample)
  })

  it('save returns false when setItem throws but still updates the snapshot', () => {
    const s = { getItem: () => null, setItem: () => { throw new Error('quota') } } as unknown as Storage
    const st = createStore(s)
    expect(st.save(sample)).toBe(false)
    expect(st.getSnapshot()).toEqual(sample)
  })

  it('stops notifying after unsubscribe', () => {
    const st = createStore(fake())
    const listener = vi.fn()
    const off = st.subscribe(listener)
    off()
    st.save(sample)
    expect(listener).not.toHaveBeenCalled()
  })

  it('keeps snapshot identity stable between saves', () => {
    const st = createStore(fake())
    expect(st.getSnapshot()).toBe(st.getSnapshot())
    st.save(sample)
    expect(st.getSnapshot()).toBe(st.getSnapshot())
  })

  it('works in memory with no storage', () => {
    const st = createStore(undefined)
    expect(st.getSnapshot()).toEqual(emptyStored)
    expect(st.save(sample)).toBe(false)
    expect(st.getSnapshot()).toEqual(sample)
  })
})

describe('loading saved data', () => {
  it('sorts and dedupes saved names without losing any (FR-013, FR-002)', () => {
    const raw = JSON.stringify({
      boys: { first: ['zed', 'Amy', 'amy'], middle: ['zed', 'Amy', 'amy', 'Lee'] },
      girls: { first: [], middle: [] },
    })
    const s = createStore(fake(raw)).getSnapshot()
    expect(s.boys).toEqual({ first: ['Amy', 'zed'], middle: ['Amy', 'Lee', 'zed'] })
  })
})

describe('persist', () => {
  afterEach(() => vi.unstubAllGlobals())
  const MESSAGE = 'Saved for this visit only. Browser storage is unavailable.'

  it('alerts once when the change cannot be saved, and still applies it', () => {
    const alert = vi.fn()
    vi.stubGlobal('window', { alert })
    const failing = { getItem: () => null, setItem: () => { throw new Error('quota') } } as unknown as Storage
    const st = createStore(failing)
    persist(sample, st)
    expect(alert).toHaveBeenCalledTimes(1)
    expect(alert).toHaveBeenCalledWith(MESSAGE)
    expect(st.getSnapshot()).toEqual(sample)
  })

  it('does not alert when the change was saved', () => {
    const alert = vi.fn()
    vi.stubGlobal('window', { alert })
    const st = createStore(fake())
    persist(sample, st)
    expect(alert).not.toHaveBeenCalled()
    expect(st.getSnapshot()).toEqual(sample)
  })
})
