#!/usr/bin/env node

import { createHash } from "node:crypto"
import { createReadStream } from "node:fs"
import { existsSync } from "node:fs"
import { cp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises"
import { basename, join, resolve } from "node:path"

const args = parseArgs(process.argv.slice(2))
const manifestPath = resolve(args.manifest ?? "./manifest.json")
const packPath = resolve(args.pack ?? "./pack-v0.4")
const outDir = resolve(args.out ?? "./release-v0.4-upload")
const assetsDir = join(outDir, "assets")

async function main() {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"))
  await rm(outDir, { recursive: true, force: true })
  await mkdir(assetsDir, { recursive: true })

  const checklist = []
  const shaLines = []
  const entries = [
    {
      filename: basename(new URL(manifest.forge.url).pathname),
      source: join(packPath, basename(new URL(manifest.forge.url).pathname)),
      sha256: manifest.forge.sha256,
      size: manifest.forge.size,
    },
    ...(manifest.files ?? []).map((file) => ({
      filename: basename(file.path),
      source: resolveSourceFile(packPath, file.path),
      sha256: file.sha256,
      size: file.size,
    })),
  ]

  const seen = new Set()
  for (const entry of entries) {
    if (seen.has(entry.filename)) {
      throw new Error(`asset duplicado no stage: ${entry.filename}`)
    }
    seen.add(entry.filename)

    const info = await stat(entry.source).catch(() => null)
    if (!info?.isFile()) {
      throw new Error(`arquivo do pack nao encontrado: ${entry.source}`)
    }

    const target = join(assetsDir, entry.filename)
    await cp(entry.source, target)
    const actualSha = await sha256File(target)
    if (actualSha.toLowerCase() !== String(entry.sha256).toLowerCase()) {
      throw new Error(
        `sha256 divergente para ${entry.filename}\n  esperado: ${entry.sha256}\n  atual:    ${actualSha}`,
      )
    }

    checklist.push({
      file: entry.filename,
      bytes: info.size,
      sha256: actualSha,
    })
    shaLines.push(`${actualSha}  ${entry.filename}`)
  }

  await writeFile(join(outDir, "upload-checklist.json"), `${JSON.stringify(checklist, null, 2)}\n`)
  await writeFile(join(outDir, "sha256.txt"), `${shaLines.join("\n")}\n`)

  console.log(`[aetherion] staged ${entries.length} asset(s) in ${assetsDir}`)
}

function resolveSourceFile(packRoot, relativePath) {
  const normalized = String(relativePath || "").replace(/\\/g, "/")
  const filename = basename(normalized)
  if (normalized.startsWith("mods/")) {
    return findFirstExisting([
      join(packRoot, "mods", "required", filename),
      join(packRoot, "mods", "optional", filename),
      join(packRoot, "mods", filename),
    ])
  }
  return join(packRoot, ...normalized.split("/"))
}

function findFirstExisting(candidates) {
  return candidates.find((candidate) => existsSync(candidate)) || candidates[0]
}

function parseArgs(values) {
  const parsed = {}
  for (let index = 0; index < values.length; index++) {
    const current = values[index]
    if (!current.startsWith("--")) continue
    const key = current.slice(2)
    const next = values[index + 1]
    if (!next || next.startsWith("--")) parsed[key] = true
    else {
      parsed[key] = next
      index++
    }
  }
  return parsed
}

async function sha256File(filePath) {
  const hash = createHash("sha256")
  const stream = createReadStream(filePath, { highWaterMark: 1024 * 1024 })
  for await (const chunk of stream) hash.update(chunk)
  return hash.digest("hex")
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
