import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

import { parse as parseYaml } from 'yaml'

export interface SkillEntry {
  name: string
  description: string
  files: string[]
}

const SKILL_NAME = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/
const MAX_NAME_LENGTH = 64
const ENTRY_FILE = 'SKILL.md'

async function listFiles(dir: string, prefix = ''): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue

    const relative = prefix ? `${prefix}/${entry.name}` : entry.name

    if (entry.isDirectory()) files.push(...(await listFiles(path.join(dir, entry.name), relative)))
    else files.push(relative)
  }

  return files.sort()
}

export async function readSkills(skillsDir: string): Promise<SkillEntry[]> {
  if (!existsSync(skillsDir)) return []

  const entries = await readdir(skillsDir, { withFileTypes: true })
  const catalog: SkillEntry[] = []

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue

    const dir = path.join(skillsDir, entry.name)
    const entryFile = path.join(dir, ENTRY_FILE)
    if (!existsSync(entryFile)) continue

    const source = await readFile(entryFile, 'utf8')
    const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    if (!match?.[1]) continue

    let frontmatter: { name?: string; description?: string }
    try {
      frontmatter = (parseYaml(match[1]) ?? {}) as { name?: string; description?: string }
    } catch {
      continue
    }

    const name = frontmatter.name ?? entry.name
    if (!SKILL_NAME.test(name) || name.length > MAX_NAME_LENGTH) continue
    if (!frontmatter.description) continue

    catalog.push({ name, description: frontmatter.description, files: await listFiles(dir) })
  }

  return catalog.sort((a, b) => a.name.localeCompare(b.name))
}

export function createSkillsIndexRoute(skillsDir: string) {
  return {
    dynamic: 'force-static' as const,
    async GET() {
      return Response.json(
        { skills: await readSkills(skillsDir) },
        { headers: { 'cache-control': 'public, max-age=3600' } },
      )
    },
  }
}

export function createSkillsFileRoute(skillsDir: string) {
  return {
    dynamic: 'force-static' as const,

    async generateStaticParams() {
      const skills = await readSkills(skillsDir)

      return skills.flatMap(skill =>
        skill.files.map(file => ({ slug: [skill.name, ...file.split('/')] })),
      )
    },

    async GET(_request: Request, context: { params: Promise<{ slug: string[] }> }) {
      const { slug } = await context.params
      const [skillName, ...rest] = slug

      const skills = await readSkills(skillsDir)
      const skill = skills.find(candidate => candidate.name === skillName)
      const relative = rest.join('/')

      if (!skill || !skill.files.includes(relative)) {
        return new Response('Not found', { status: 404 })
      }

      const contents = await readFile(path.join(skillsDir, skillName!, ...rest), 'utf8')
      const type = relative.endsWith('.md') ? 'text/markdown' : 'text/plain'

      return new Response(contents, {
        headers: {
          'content-type': `${type}; charset=utf-8`,
          'cache-control': 'public, max-age=3600',
        },
      })
    },
  }
}

export function defaultSkillsDir(): string {
  return path.join(process.cwd(), 'skills')
}
