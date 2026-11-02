#!/usr/bin/env node
/**
 * Browser checks: drives real headless Chrome over the DevTools protocol against the built
 * site (`dist/`), in light and dark mode. Covers behaviour that server-render unit tests
 * cannot: dialogs, focus, row menus, delete/promote flows, the back button, layout fit.
 *
 *   pnpm build && pnpm check:browser                 # run
 *   pnpm check:browser --shots /tmp/shots            # also save screenshots
 *   CHROME_PATH=/path/to/chrome pnpm check:browser   # use a specific Chrome
 *
 * No dependencies beyond Node 22 (built-in fetch/WebSocket) and Vite (for the preview server).
 */
import { spawn, execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { preview } from 'vite'

const PORT = Number(process.env.PORT ?? 4174)
const BASE = `http://localhost:${PORT}`
const KEY = 'baby-names:v1'
const shotsArg = process.argv.indexOf('--shots')
const SHOTS = shotsArg > -1 ? process.argv[shotsArg + 1] : undefined
const TIMEOUT_MS = 180_000

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---------------------------------------------------------------- setup

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH
  const mac = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  if (existsSync(mac)) return mac
  for (const name of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']) {
    try {
      return execFileSync('which', [name], { encoding: 'utf8' }).trim()
    } catch {
      // try the next name
    }
  }
  throw new Error('Chrome not found: set CHROME_PATH')
}

async function launchChrome() {
  const profile = mkdtempSync(join(tmpdir(), 'browser-check-'))
  const args = ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--hide-scrollbars']
  if (process.env.CI) args.push('--no-sandbox')
  const proc = spawn(findChrome(), [...args, 'about:blank'], { stdio: 'ignore' })
  const portFile = join(profile, 'DevToolsActivePort')
  for (let i = 0; i < 100 && !existsSync(portFile); i++) await sleep(100)
  const port = readFileSync(portFile, 'utf8').split('\n')[0]
  let targets = []
  for (let i = 0; i < 50 && !targets.some((t) => t.type === 'page'); i++) {
    targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json()
    await sleep(100)
  }
  const stop = () => {
    proc.kill()
    rmSync(profile, { recursive: true, force: true })
  }
  return { url: targets.find((t) => t.type === 'page').webSocketDebuggerUrl, stop }
}

async function connect(url) {
  const ws = new WebSocket(url)
  await new Promise((resolve, reject) => {
    ws.onopen = resolve
    ws.onerror = reject
  })
  let id = 0
  const pending = new Map()
  const page = { nativeDialogs: 0 }
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const i = ++id
      pending.set(i, resolve)
      ws.send(JSON.stringify({ id: i, method, params }))
    })
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data)
    if (d.method === 'Page.javascriptDialogOpening') {
      page.nativeDialogs++
      send('Page.handleJavaScriptDialog', { accept: false })
    }
    if (d.id && pending.has(d.id)) pending.get(d.id)(d)
  }
  return { ws, send, page }
}

// ---------------------------------------------------------------- the checks

async function suite({ send, page }, scheme) {
  const results = []
  const check = (name, ok, extra = '') => {
    results.push(ok)
    console.log(`${ok ? 'PASS' : 'FAIL'}  [${scheme}] ${name}${extra ? `  (${extra})` : ''}`)
  }

  const js = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (r.result?.exceptionDetails) throw new Error(`${expression}\n${r.result.exceptionDetails.exception?.description}`)
    return r.result?.result?.value
  }
  /** Poll until the expression is truthy (state changes settle asynchronously), up to 3 s. */
  const until = async (expression, ms = 3000) => {
    for (const end = Date.now() + ms; Date.now() < end; await sleep(50)) if (await js(expression)) return true
    return false
  }
  const viewport = (width, height) => send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 500 })
  const goto = async (path) => {
    await send('Page.navigate', { url: BASE + path })
    await until(`document.readyState === 'complete' && !!document.querySelector('header nav')`)
  }
  const seed = async (data, path) => {
    await goto('/')
    await js(data ? `localStorage.setItem('${KEY}', ${JSON.stringify(JSON.stringify(data))})` : 'localStorage.clear()')
    await goto(path)
  }
  const shot = async (name) => {
    if (!SHOTS) return
    const r = await send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(join(SHOTS, `${scheme}-${name}.png`), Buffer.from(r.result.data, 'base64'))
  }

  const centre = (expr) => js(`(() => { const r = (${expr}).getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2] })()`)
  const mouse = (type, x, y) => send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1, buttons: type === 'mouseReleased' ? 0 : 1 })
  const click = async (x, y) => {
    await mouse('mouseMoved', x, y)
    await mouse('mousePressed', x, y)
    await mouse('mouseReleased', x, y)
    await sleep(100)
  }
  const clickEl = async (expr) => click(...(await centre(expr)))
  const key = async (key, code, keyCode, modifiers = 0, text) => {
    await send('Input.dispatchKeyEvent', { type: text ? 'keyDown' : 'rawKeyDown', key, code, windowsVirtualKeyCode: keyCode, modifiers, text })
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: keyCode, modifiers })
    await sleep(60)
  }
  const escape = () => key('Escape', 'Escape', 27)
  const type = async (selector, text) => {
    await js(`(() => { const i = document.querySelector(${JSON.stringify(selector)}); i.focus(); i.select() })()`)
    await send('Input.insertText', { text })
  }
  const button = (scope, label) => `[...document.querySelectorAll(${JSON.stringify(`${scope} button`)})].find(b => b.textContent.trim() === ${JSON.stringify(label)})`

  const HEADER_BTN = `document.querySelector('header nav button[aria-haspopup]')`
  const OPEN = `!!document.querySelector('dialog[open]')`
  const CLOSED = `!document.querySelector('dialog[open]')`
  const surname = () => js(`JSON.parse(localStorage.getItem('${KEY}') || '{}').surname ?? null`)
  const focusOnHeaderButton = () => until(`document.activeElement === ${HEADER_BTN}`)
  const noHorizontalScroll = () => js('document.documentElement.scrollWidth <= document.documentElement.clientWidth')
  const openModal = async () => {
    await clickEl(HEADER_BTN)
    return until(OPEN)
  }

  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] })
  await viewport(1000, 800)
  const smith = { surname: 'Smith', boys: { first: ['Arthur'], middle: ['Arthur', 'Lee'] }, girls: { first: [], middle: [] } }

  // Last-name modal: opens in place, focus in the field, prefilled.
  await seed(smith, '/boys')
  check('modal absent before opening', await js(CLOSED))
  check('Set Last Name opens a modal', await openModal())
  check('address unchanged', (await js('location.pathname')) === '/boys')
  check('focus is on the input inside the dialog', await js(`document.activeElement.tagName === 'INPUT' && !!document.activeElement.closest('dialog')`))
  check('input prefilled with saved last name', (await js(`document.querySelector('dialog input').value`)) === 'Smith')
  await shot('modal')

  // Closing without saving: Close, Escape, outside click.
  for (const [how, close] of [
    ['Close button', () => clickEl(button('dialog', 'Close'))],
    ['Escape', escape],
    ['click outside', () => click(5, 5)],
  ]) {
    if (how !== 'Close button') await openModal()
    await type('dialog input', 'Jones')
    await close()
    check(`${how} closes`, await until(CLOSED))
    check(`${how} leaves saved name unchanged`, (await surname()) === 'Smith')
    check(`${how} returns focus to the header button`, await focusOnHeaderButton())
  }
  await openModal()
  check('reopening shows saved name, typed text gone', (await js(`document.querySelector('dialog input').value`)) === 'Smith')

  // A text-selection drag from the input onto the overlay must not close it.
  await type('dialog input', 'Drag')
  const [ix, iy] = await centre(`document.querySelector('dialog input')`)
  await mouse('mouseMoved', ix, iy)
  await mouse('mousePressed', ix, iy)
  await mouse('mouseMoved', 5, 5)
  await mouse('mouseReleased', 5, 5)
  await sleep(200)
  check('drag from input to overlay does not close', await js(OPEN))
  check('typed text intact after drag', (await js(`document.querySelector('dialog input').value`)) === 'Drag')

  // Invalid save keeps it open.
  await type('dialog input', '')
  await key('Backspace', 'Backspace', 8)
  await clickEl(button('dialog', 'Save last name'))
  check('empty save shows the message', await until(`document.querySelector('dialog [role=alert]')?.textContent === 'Enter a last name.'`))
  check('empty save keeps the modal open', await js(OPEN))
  check('empty save stores nothing', (await surname()) === 'Smith')

  // Tab never reaches the page behind (focus may visit the browser's own UI, which reads as <body>).
  const behind = `(() => { const a = document.activeElement; return a !== document.body && !a.closest('dialog') })()`
  const leaked = []
  for (let n = 0; n < 10; n++) {
    await key('Tab', 'Tab', 9)
    if (await js(behind)) leaked.push(`Tab${n}`)
  }
  for (let n = 0; n < 10; n++) {
    await key('Tab', 'Tab', 9, 8)
    if (await js(behind)) leaked.push(`Shift+Tab${n}`)
  }
  check('Tab / Shift+Tab never focus the page behind', leaked.length === 0, leaked.join(','))
  await escape()

  // Valid save.
  await openModal()
  await type('dialog input', 'Jones')
  await clickEl(button('dialog', 'Save last name'))
  check('valid save closes the modal', await until(CLOSED))
  check('valid save stores the new name', (await surname()) === 'Jones')
  check('valid save returns focus to the header button', await focusOnHeaderButton())

  for (const path of ['/nope', '/girls', '/boys/arthur']) {
    await goto(path)
    check(`modal opens on ${path}`, await openModal())
    check(`address unchanged on ${path}`, (await js('location.pathname')) === path)
    await escape()
  }
  await goto('/boys/arthur')
  check('combinations on the name page use the saved last name', await until(`document.body.innerText.includes('Arthur Lee Jones')`))

  await viewport(390, 800)
  await goto('/boys')
  await openModal()
  check('phone: no horizontal scroll with the modal open', await noHorizontalScroll())
  await shot('modal-phone')
  await escape()

  // Blocked storage: the change applies for the visit and the modal says so, staying open.
  await viewport(1000, 800)
  const block = await send('Page.addScriptToEvaluateOnNewDocument', { source: `Storage.prototype.setItem = () => { throw new Error('blocked') }` })
  await goto('/boys')
  await openModal()
  await type('dialog input', 'Blocked')
  await clickEl(button('dialog', 'Save last name'))
  check('blocked storage: notice shown', await until(`(document.querySelector('dialog [role=status]')?.textContent ?? '').startsWith('Saved for this visit only')`))
  check('blocked storage: modal stays open', await js(OPEN))
  await clickEl(button('dialog', 'Close'))
  await openModal()
  check('blocked storage: change applied for the visit', (await js(`document.querySelector('dialog input').value`)) === 'Blocked')
  await escape()
  await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: block.result.identifier })

  // In-page prompt and the modal share the value; the back button closes the modal.
  await seed(null, '/girls')
  check('no last name: in-page prompt shown', await js(`document.querySelector('main').innerText.includes('Save last name')`))
  await type('main form input', 'Pink')
  await clickEl(button('main', 'Save last name'))
  check('saving the in-page prompt shows the add form in place', await until(`document.querySelector('main').innerText.includes('Add name')`))
  await openModal()
  check('modal is prefilled from the in-page prompt', (await js(`document.querySelector('dialog input').value`)) === 'Pink')
  await escape()
  await goto('/')
  await clickEl(`[...document.querySelectorAll('header nav a')].find(a => a.textContent.trim() === 'Boys')`)
  check('header link navigates', await until(`location.pathname === '/boys'`))
  await openModal()
  await js('history.back()')
  check('back button leaves the page', await until(`location.pathname === '/'`))
  check('no modal left open after back', await until(CLOSED))

  // Lists: header shows the last name, row menus, tap targets.
  const family = {
    surname: 'Hannam',
    boys: { first: ['Arthur', 'Finn', 'Oliver'], middle: ['Arthur', 'Edward', 'Finn', 'James', 'Lee', 'Oliver'] },
    girls: { first: ['Ada', 'Zoë'], middle: ['Ada', 'Grace', 'Rose', 'Zoë'] },
  }
  await seed(family, '/boys')
  check('header button shows the saved last name', (await js(`${HEADER_BTN}.textContent.trim()`)) === 'Last name: Hannam')
  check('row menu closed by default', !(await js(`document.querySelector('details.row-menu').open`)))
  await clickEl(`document.querySelector('details.row-menu > summary')`)
  check('clicking ⋯ opens the row menu', await until(`document.querySelector('details.row-menu').open`))
  await shot('list-menu')
  await clickEl(`document.querySelector('[aria-label="Make middle only: Arthur"]')`)
  check('Make middle only moves Arthur', await until(`[...document.querySelectorAll('.name-text')].some(e => e.textContent === 'Arthur')`))
  await js(`document.querySelector('details.row-menu > summary').focus()`)
  await key('Enter', 'Enter', 13, 0, '\r')
  check('keyboard: Enter on ⋯ opens the menu', await until(`document.querySelector('details.row-menu').open`))
  const heights = await js(`[...document.querySelectorAll('details.row-menu > summary, .name-link')].map(e => Math.round(e.getBoundingClientRect().height))`)
  check('row targets are at least 44px tall', heights.every((h) => h >= 44), heights.join(','))

  await viewport(390, 860)
  await goto('/boys')
  check('phone: no horizontal scroll on a list', await noHorizontalScroll())
  await clickEl(`[...document.querySelectorAll('details.row-menu > summary')].at(-1)`)
  await js(`document.querySelector('details.row-menu[open] .row-menu-items').scrollIntoView({ block: 'end' })`)
  check(
    'phone: last row menu is not clipped by the card',
    await js(`(() => { const m = document.querySelector('details.row-menu[open] .row-menu-items'); const r = m.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.bottom - 6); return !!hit && m.contains(hit) })()`),
  )
  check('phone: open menu fits the screen', await js(`(() => { const r = document.querySelector('details.row-menu[open] .row-menu-items').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth })()`))
  await goto('/boys/oliver')
  const deleteHeight = await js(`Math.round(document.querySelector('.name-row > button').getBoundingClientRect().height)`)
  check('phone: name-page Delete is at least 44px tall', deleteHeight >= 44, String(deleteHeight))
  await seed({ ...family, surname: 'Wolfeschlegelsteinhausenbergerdorffvoralternwarengewissenhaft' }, '/')
  check('phone: a very long last name does not cause horizontal scroll', await noHorizontalScroll())

  // Row menus close on outside click and Escape.
  await viewport(1000, 800)
  await seed({ surname: 'Hannam', boys: { first: ['Arthur', 'Finn'], middle: ['Arthur', 'Finn', 'Lee'] }, girls: { first: [], middle: [] } }, '/boys')
  const menus = `[...document.querySelectorAll('details.row-menu')]`
  const openMenus = () => js(`${menus}.filter(d => d.open).length`)
  await clickEl(`${menus}[0].querySelector('summary')`)
  await clickEl(`${menus}[0].querySelector('.row-menu-items')`)
  check('click inside the menu card keeps it open', await js(`${menus}[0].open`))
  await clickEl(`document.querySelector('article h2')`)
  check('click elsewhere closes the menu', await until(`${menus}.every(d => !d.open)`))
  await clickEl(`${menus}[0].querySelector('summary')`)
  await clickEl(`${menus}.at(-1).querySelector('summary')`)
  check("opening another row's menu closes the first", await until(`!${menus}[0].open && ${menus}.at(-1).open`))
  await escape()
  check('Escape closes the open menu', (await openMenus()) === 0)
  check('Escape returns focus to its ⋯', await js(`document.activeElement === ${menus}.at(-1).querySelector('summary')`))

  // Titles, current pill, empty state, add feedback.
  const two = { surname: 'Hannam', boys: { first: ['Arthur', 'Oliver'], middle: ['Arthur', 'Edward', 'James', 'Oliver'] }, girls: { first: [], middle: [] } }
  await seed(two, '/')
  for (const [path, title] of [
    ['/', 'Baby Names'],
    ['/boys', 'Boys names · Baby Names'],
    ['/boys/oliver', 'Oliver · Baby Names'],
    ['/nope', 'Page not found · Baby Names'],
  ]) {
    await goto(path)
    check(`title on ${path}`, await until(`document.title === ${JSON.stringify(title)}`), await js('document.title'))
  }
  await goto('/boys')
  await clickEl(`[...document.querySelectorAll('header nav a')].find(a => a.textContent.trim() === 'Girls')`)
  check('title updates on in-app navigation', await until(`document.title === 'Girls names · Baby Names'`))
  check('current pill moves to Girls', await until(`document.querySelector('header nav a[aria-current]')?.textContent.trim() === 'Girls'`))
  check('friendly empty state', await js(`document.querySelector('main').innerText.includes('No girls’ names yet. Add the first one above.')`))
  await type('main form input', 'Ada')
  await clickEl(button('main', 'Add name'))
  check('add feedback shown', await until(`document.querySelector('main [role=status]')?.textContent === 'Added Ada as a first and middle name.'`))
  await js(`document.querySelector('main form input').focus()`)
  await send('Input.insertText', { text: 'R' })
  check('add feedback clears when typing again', await until(`!document.querySelector('main [role=status]')`))

  // Themed delete from a row menu.
  await goto('/boys')
  await clickEl(`document.querySelector('details.row-menu > summary')`)
  await clickEl(`document.querySelector('details.row-menu[open] [aria-label^="Delete "]')`)
  check('delete opens a themed dialog', await until(`document.querySelector('dialog[open] #delete-title')?.textContent === 'Delete Arthur?'`))
  check('Cancel has the initial focus', (await js(`document.activeElement?.textContent.trim()`)) === 'Cancel')
  await shot('delete-confirm')
  await clickEl(button('dialog[open]', 'Cancel'))
  const hasArthur = `[...document.querySelectorAll('.name-link')].some(a => a.textContent.includes('Arthur'))`
  check('Cancel keeps the name', (await until(CLOSED)) && (await js(hasArthur)))
  check('Cancel returns focus to the Delete item', await until(`document.activeElement?.getAttribute('aria-label') === 'Delete Arthur'`))
  await clickEl(`document.querySelector('details.row-menu[open] [aria-label^="Delete "]')`)
  await until(OPEN)
  await escape()
  check('Escape on the confirmation keeps the name', (await until(CLOSED)) && (await js(hasArthur)))
  check('Escape on the confirmation leaves the row menu open', await js(`!!document.querySelector('details.row-menu[open]')`))
  await clickEl(`document.querySelector('details.row-menu[open] [aria-label^="Delete "]')`)
  await until(OPEN)
  await clickEl(button('dialog[open]', 'Delete'))
  check('confirming Delete removes the name', await until(`!${hasArthur} && !JSON.parse(localStorage.getItem('${KEY}')).boys.middle.includes('Arthur')`))

  // Name page: count in the heading; deleting the page's name returns to the list.
  await goto('/boys/oliver')
  check('name page heading shows the count', await until(`document.querySelector('article > header hgroup p')?.textContent === '2 combinations'`))
  await clickEl(`document.querySelector('[aria-label="Delete Oliver"]')`)
  await until(OPEN)
  await clickEl(button('dialog[open]', 'Delete'))
  check('deleting on a name page returns to the list', await until(`location.pathname === '/boys'`))

  // Middle-name actions on each combination card.
  await seed(two, '/boys/oliver')
  const menuOf = (m) => `document.querySelector('summary[aria-label="Actions for ${m}"]').parentElement`
  await clickEl(`${menuOf('Edward')}.querySelector('summary')`)
  await shot('card-menu')
  await clickEl(`${menuOf('Edward')}.querySelector('[aria-label="Make first and middle: Edward"]')`)
  check('upgrade from a card makes Edward a first name', await until(`JSON.parse(localStorage.getItem('${KEY}')).boys.first.includes('Edward')`))
  check('upgrade keeps you on the page', (await js('location.pathname')) === '/boys/oliver')
  check("Edward stays in Oliver's combinations", await js(`document.querySelector('.combo-list').innerText.includes('Edward')`))
  check("Edward's card no longer offers an upgrade", await until(`!${menuOf('Edward')}.querySelector('[aria-label^="Make first and middle"]')`))
  check('the action closes its menu', await until(`!${menuOf('Edward')}.open`))
  check("focus returns to the card's ⋯", await until(`document.activeElement === ${menuOf('Edward')}.querySelector('summary')`))
  check('card text keeps its spaces', await js(`[...document.querySelectorAll('.combo-list .name-text')].some(e => e.innerText === 'Oliver Edward Hannam')`))
  await clickEl(`${menuOf('James')}.querySelector('summary')`)
  await clickEl(`${menuOf('James')}.querySelector('[aria-label="Delete James"]')`)
  check('delete from a card asks in the themed dialog', await until(`document.querySelector('dialog[open] #delete-title')?.textContent === 'Delete James?'`))
  await clickEl(button('dialog[open]', 'Delete'))
  check('James removed everywhere', await until(`!JSON.parse(localStorage.getItem('${KEY}')).boys.middle.includes('James')`))
  check('James card gone, still on the page', (await until(`!document.querySelector('.combo-list').innerText.includes('James')`)) && (await js('location.pathname')) === '/boys/oliver')
  check('heading count updated', await until(`document.querySelector('article > header hgroup p')?.textContent === '2 combinations'`))
  await goto('/boys')
  check('upgraded Edward has a link on the list', await js(`!!document.querySelector('a[href="/boys/edward"]')`))
  await viewport(390, 860)
  await goto('/boys/oliver')
  await clickEl(`document.querySelectorAll('.combo-list details.row-menu > summary')[1]`)
  check('phone: card menu fits the screen', await js(`(() => { const r = document.querySelector('details.row-menu[open] .row-menu-items').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth })()`))

  // A failed upgrade keeps its menu open with the error.
  await viewport(1000, 800)
  await seed({ surname: 'Hannam', boys: { first: ['Mary-Ann'], middle: ['Mary Ann', 'Mary-Ann'] }, girls: { first: [], middle: [] } }, '/boys/mary-ann')
  await clickEl(`document.querySelector('summary[aria-label="Actions for Mary Ann"]')`)
  await clickEl(`document.querySelector('[aria-label="Make first and middle: Mary Ann"]')`)
  check('failed upgrade shows the clash message', await until(`(document.querySelector('details.row-menu[open] [role=alert]')?.textContent ?? '').includes('clashes with Mary-Ann')`))
  check('failed upgrade keeps the menu open', await js(`!!document.querySelector('details.row-menu[open]')`))

  // Not-found page: offer the fix that makes the page exist, then become that page in place.
  await seed(two, '/boys/edward')
  check('middle-only address explains itself', await until(`document.querySelector('main').innerText.includes('Edward is a middle name only')`))
  await shot('not-found-middle-only')
  await clickEl(`document.querySelector('[aria-label="Make Edward a first name"]')`)
  check('making it a first name turns the page into its page', await until(`document.querySelector('article > header hgroup h2')?.textContent === 'Edward'`))
  await goto('/boys/noah')
  check('unknown name: add form prefilled from the address', await until(`document.querySelector('main form input')?.value === 'Noah'`))
  await shot('not-found-add')
  await clickEl(button('main', 'Add name'))
  check('adding it turns the page into its page', await until(`document.querySelector('article > header hgroup h2')?.textContent === 'Noah'`))
  check('the title follows', await until(`document.title === 'Noah · Baby Names'`))

  check('no native browser pop-ups were used', page.nativeDialogs === 0, String(page.nativeDialogs))
  return results
}

// ---------------------------------------------------------------- run

if (!existsSync('dist/index.html')) {
  console.error('dist/ not found: run `pnpm build` first')
  process.exit(2)
}
if (SHOTS) mkdirSync(SHOTS, { recursive: true })

const server = await preview({ preview: { port: PORT, strictPort: true }, logLevel: 'warn' })
const chrome = await launchChrome()
const timer = setTimeout(() => {
  console.error(`Timed out after ${TIMEOUT_MS / 1000}s`)
  chrome.stop()
  process.exit(1)
}, TIMEOUT_MS)

let results = []
try {
  const cdp = await connect(chrome.url)
  await cdp.send('Page.enable')
  for (const scheme of ['light', 'dark']) results = results.concat(await suite(cdp, scheme))
  cdp.ws.close()
} finally {
  clearTimeout(timer)
  chrome.stop()
  await server.close()
}

const failed = results.filter((ok) => !ok).length
console.log(`\n${results.length - failed}/${results.length} browser checks passed`)
process.exit(failed ? 1 : 0)
