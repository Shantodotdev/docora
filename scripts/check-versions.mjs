#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const offline = process.argv.includes('--offline') || process.env.SKIP_REGISTRY_CHECK === '1'
const publishing = process.argv.find(arg => arg.startsWith('--publishing='))?.split('=')[1]

const color = process.env.NO_COLOR === undefined && process.stdout.isTTY
const paint = (code, text) => (color ? `\u001b[${code}m${text}\u001b[0m` : text)
const bold = text => paint(1, text)
const red = text => paint(31, text)
const green = text => paint(32, text)
const yellow = text => paint(33, text)
const dim = text => paint(2, text)

const errors = []
const warnings = []
const rows = []

const at = (...segments) => path.join(root, ...segments)
const readJson = file => JSON.parse(readFileSync(file, 'utf8'))
const readText = file => readFileSync(file, 'utf8')

function row(label, value, state) {
  rows.push({ label, value, state })
}

const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/
const STARTERS = ['default', 'i18n']

const theme = readJson(at('packages/docora/package.json'))
const cli = readJson(at('packages/create-docora/package.json'))
const released = theme.version

for (const pkg of [theme, cli]) {
  if (!SEMVER.test(pkg.version)) {
    errors.push(`${pkg.name} has a version that is not semver: "${pkg.version}"`)
  }
}

if (theme.version !== cli.version) {
  errors.push(
    `docora (${theme.version}) and create-docora (${cli.version}) are meant to ship in lockstep`,
  )
}

row('docora', theme.version, SEMVER.test(theme.version) ? 'ok' : 'error')
row('create-docora', cli.version, theme.version === cli.version ? 'ok' : 'error')

const rootPkg = readJson(at('package.json'))
if (rootPkg.version !== released) {
  warnings.push(
    `package.json says ${rootPkg.version}; it mirrors the release version, so ${released} reads better in script output`,
  )
}
row('package.json', rootPkg.version, rootPkg.version === released ? 'ok' : 'warn')

const expectedPin = `^${released}`

for (const starter of STARTERS) {
  const file = at('.starters', starter, 'package.json')
  const pin = readJson(file).dependencies?.docora

  if (pin !== expectedPin) {
    errors.push(
      `.starters/${starter} pins docora at ${pin ?? '(missing)'}, expected ${expectedPin}` +
        ` — "^0.0.x" is an exact range, so this decides which theme a scaffolded site installs`,
    )
  }

  row(`.starters/${starter}`, pin ?? '(missing)', pin === expectedPin ? 'ok' : 'error')
}

for (const starter of STARTERS) {
  const file = at('packages/create-docora/templates', starter, 'package.json')
  if (!existsSync(file)) {
    row(`templates/${starter}`, '(not built)', 'skip')
    continue
  }

  const pin = readJson(file).dependencies?.docora
  if (pin !== expectedPin) {
    warnings.push(
      `templates/${starter} is stale at ${pin ?? '(missing)'} — run "pnpm run build" (prepack does this for you at publish time)`,
    )
  }
  row(`templates/${starter}`, pin ?? '(missing)', pin === expectedPin ? 'ok' : 'warn')
}

const heroFile = at('apps/docs/components/home/hero.tsx')
const announced = readText(heroFile).match(/Docora (\d+\.\d+\.\d+[0-9A-Za-z.-]*) is out/)?.[1]

if (!announced) {
  warnings.push('could not find the "Docora <version> is out" banner in hero.tsx')
  row('hero.tsx banner', '(not found)', 'warn')
} else {
  if (announced !== released) {
    errors.push(`hero.tsx still announces ${announced}, expected ${released}`)
  }
  row('hero.tsx banner', announced, announced === released ? 'ok' : 'error')
}

const registry = (process.env.npm_config_registry ?? 'https://registry.npmjs.org').replace(
  /\/+$/,
  '',
)

async function lookup(name) {
  try {
    const response = await fetch(`${registry}/${encodeURIComponent(name)}`, {
      headers: { accept: 'application/vnd.npm.install-v1+json' },
      signal: AbortSignal.timeout(10_000),
    })

    if (response.status === 404) return 'new'
    if (!response.ok) return null

    const body = await response.json()
    return {
      versions: Object.keys(body.versions ?? {}),
      latest: body['dist-tags']?.latest ?? '(none)',
    }
  } catch {
    return null
  }
}

if (offline) {
  row('npm registry', 'skipped', 'skip')
} else {
  for (const pkg of [theme, cli]) {
    const found = await lookup(pkg.name)

    if (found === null) {
      warnings.push(
        `could not reach ${registry} for ${pkg.name} — the "already published" check did NOT run`,
      )
      row(`npm ${pkg.name}`, 'unreachable', 'warn')
    } else if (found === 'new') {
      row(`npm ${pkg.name}`, `unpublished → ${pkg.version}`, 'ok')
    } else if (found.versions.includes(pkg.version)) {
      const message = `${pkg.name}@${pkg.version} is already on npm — versions are immutable, so bump before publishing`

      if (publishing === undefined || publishing === pkg.name) {
        errors.push(message)
        row(`npm ${pkg.name}`, `${found.latest} → taken`, 'error')
      } else {
        warnings.push(`${message} (not the package being published)`)
        row(`npm ${pkg.name}`, `${found.latest} → published`, 'warn')
      }
    } else {
      row(`npm ${pkg.name}`, `${found.latest} → ${pkg.version}`, 'ok')
    }
  }
}

const width = Math.max(...rows.map(entry => entry.label.length))
const marks = { ok: green('ok'), error: red('FAIL'), warn: yellow('warn'), skip: dim('skip') }

console.log(`\n${bold('Release check')}  ${dim(`target ${released}`)}\n`)
for (const entry of rows) {
  console.log(`  ${entry.label.padEnd(width)}  ${entry.value.padEnd(16)} ${marks[entry.state]}`)
}

if (warnings.length > 0) {
  console.log(`\n${yellow('Warnings')}`)
  for (const message of warnings) console.log(`  - ${message}`)
}

if (errors.length > 0) {
  console.log(`\n${red('Blocked')}`)
  for (const message of errors) console.log(`  - ${message}`)
  console.log(`\n${red(`Not safe to publish ${released}.`)}\n`)
  process.exitCode = 1
} else {
  console.log(`\n${green(`All versions line up. Safe to publish ${released}.`)}\n`)
}
