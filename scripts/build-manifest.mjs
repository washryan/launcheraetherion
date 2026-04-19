#!/usr/bin/env node
/**
 * Aetherion — Build Manifest
 *
 * Gera o manifest.json a partir de uma pasta local com mods, configs e forge,
 * preenchendo URL (GitHub Releases), SHA-256 e size para cada arquivo.
 *
 * Uso:
 *   node scripts/build-manifest.mjs \
 *     --version 0.3 \
 *     --mc 1.19.2 \
 *     --forge 43.3.13 \
 *     --in ./pack-v0.3 \
 *     --out ./manifest.json
 *
 * Layout esperado dentro de --in:
 *   pack-v0.3/
 *     forge-1.19.2-43.3.13-installer.jar
 *     mods/
 *       required/    <-- vão como type: "required"
 *       optional/    <-- vão como type: "optional"
 *     config/        <-- vão como type: "config"
 *
 * Depois de gerar: faça upload da pasta inteira (exceto manifest.json, que
 * vai pro Pages) como assets do Release `v0.3` no GitHub.
 *
 * Este script só usa node:crypto + node:fs, sem dependências externas.
 */

import { createHash } from "node:crypto"
import { readFile, readdir, stat, writeFile } from "node:fs/promises"
import { join, posix, relative } from "node:path"
import { createReadStream } from "node:fs"

/* ------------------------- parse args ------------------------- */
const args = Object.fromEntries(
  process.argv
    .slice(2)
    .reduce((acc, cur, i, arr) => {
      if (cur.startsWith("--")) acc.push([cur.slice(2), arr[i + 1]])
      return acc
    }, []),
)

const version = args.version ?? "0.1"
const mcVersion = args.mc ?? "1.19.2"
const forgeVersion = args.forge ?? "43.3.13"
const inDir = args.in ?? "./pack"
const outFile = args.out ?? "./manifest.json"
const ghOwner = args.owner ?? "aetherion-network"
const ghRepo = args.repo ?? "aetherion-launcher-assets"

const BASE = `https://github.com/${ghOwner}/${ghRepo}/releases/download/v${version}`

/* ------------------------- helpers ------------------------- */

async function sha256File(path) {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256")
    const stream = createReadStream(path, { highWaterMark: 1024 * 1024 })
    stream.on("data", (c) => hash.update(c))
    stream.on("end", () => resolve(hash.digest("hex")))
    stream.on("error", reject)
  })
}

async function walk(dir, acc = []) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = join(dir, e.name)
    if (e.isDirectory()) await walk(full, acc)
    else acc.push(full)
  }
  return acc
}

async function entryFor(absPath, rootDir, type) {
  const rel = relative(rootDir, absPath).split("\\").join("/")
  const basename = posix.basename(rel)
  const size = (await stat(absPath)).size
  const sha256 = await sha256File(absPath)
  return {
    path: `${typeToFolder(type)}/${basename}`,
    url: `${BASE}/${encodeURIComponent(basename)}`,
    sha256,
    size,
    type,
    name: basename.replace(/\.jar$/i, "").replace(/-[\d.]+$/, ""),
  }
}

function typeToFolder(type) {
  if (type === "config") return "config"
  return "mods"
}

/* ------------------------- main ------------------------- */

async function main() {
  console.log(`[aetherion] building manifest v${version} (${mcVersion} / forge ${forgeVersion})`)
  console.log(`[aetherion] scanning: ${inDir}`)

  const files = []

  // Required mods
  try {
    const required = await walk(join(inDir, "mods", "required"))
    for (const p of required) {
      files.push(await entryFor(p, inDir, "required"))
    }
    console.log(`  required: ${required.length}`)
  } catch {
    console.warn(`  (pasta mods/required não encontrada)`)
  }

  // Optional mods
  try {
    const optional = await walk(join(inDir, "mods", "optional"))
    for (const p of optional) {
      const entry = await entryFor(p, inDir, "optional")
      entry.defaultEnabled = true
      files.push(entry)
    }
    console.log(`  optional: ${optional.length}`)
  } catch {
    console.warn(`  (pasta mods/optional não encontrada)`)
  }

  // Configs
  try {
    const configs = await walk(join(inDir, "config"))
    for (const p of configs) {
      files.push(await entryFor(p, inDir, "config"))
    }
    console.log(`  configs: ${configs.length}`)
  } catch {
    console.warn(`  (pasta config não encontrada)`)
  }

  // Forge installer
  const forgeFilename = `forge-${mcVersion}-${forgeVersion}-installer.jar`
  const forgePath = join(inDir, forgeFilename)
  const forgeStat = await stat(forgePath).catch(() => null)
  if (!forgeStat) {
    throw new Error(`Forge installer não encontrado: ${forgePath}`)
  }
  const forgeSha = await sha256File(forgePath)

  const manifest = {
    $schema: `https://${ghOwner}.github.io/${ghRepo}/manifest.schema.json`,
    version,
    minecraft: mcVersion,
    name: "Aetherion Main",
    instanceId: "aetherion-main",
    publishedAt: new Date().toISOString(),
    requiredLauncherVersion: "0.1.0",
    forge: {
      version: forgeVersion,
      url: `${BASE}/${encodeURIComponent(forgeFilename)}`,
      sha256: forgeSha,
      size: forgeStat.size,
      installedProfile: `${mcVersion}-forge-${forgeVersion}`,
    },
    files,
    java: { recommendedMajor: 17, minMajor: 17 },
    endpoints: {
      serverHost: "play.aetherion.gg",
      serverPort: 25565,
      site: `https://${ghOwner}.github.io/${ghRepo}/`,
    },
    protectedPatterns: ["mods/*-SERVER.jar", "config/custom-*.toml"],
  }

  await writeFile(outFile, JSON.stringify(manifest, null, 2) + "\n", "utf8")
  console.log(`[aetherion] wrote ${outFile}`)
  console.log(`[aetherion] upload estes arquivos como assets de v${version}:`)
  console.log(`  - ${forgeFilename}`)
  for (const f of files) console.log(`  - ${posix.basename(f.path)}`)
  console.log(`[aetherion] e envie ${outFile} para a branch gh-pages ou pasta /docs`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
