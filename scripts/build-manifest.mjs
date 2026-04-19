#!/usr/bin/env node
/**
 * Aetherion - Build Manifest
 *
 * Gera manifest.json a partir de uma pasta local com Forge, mods e configs.
 * O manifest gerado e o contrato que o Electron usa na Fase 3:
 * baixar, validar SHA-256, aplicar opcionais e preservar drop-ins.
 *
 * Uso real:
 *   node scripts/build-manifest.mjs --in ./pack-v0.3 --out ./manifest.json
 *
 * Uso sem arquivos, para atualizar public/manifest.example.json:
 *   node scripts/build-manifest.mjs --template --out ./public/manifest.example.json
 */

import { createHash } from "node:crypto"
import { createReadStream } from "node:fs"
import { readdir, stat, writeFile } from "node:fs/promises"
import { join, posix, relative } from "node:path"

const REQUIRED_MOD_FILENAMES = [
  "AdvancementPlaques-1.19.2-1.4.7.jar",
  "aeroblender-1.19.2-1.0.1.jar",
  "aether-1.19.2-1.4.2-forge.jar",
  "AI-Improvements-1.19.2-0.5.2.jar",
  "alexsdelight-1.4.1.jar",
  "alexsmobs-1.21.1.jar",
  "AlltheCompatibility-1.19.2-(v.2.1.1b).jar",
  "allthemodium-2.1.8-1.19.2-43.1.1.jar",
  "alltheores-2.0.2-1.19.2-43.1.3.jar",
  "Apotheosis-1.19.2-6.5.2.jar",
  "apotheotic_additions1.0.4.jar",
  "ApothicCurios-1.19.2-1.0.3c.jar",
  "appleskin-forge-mc1.19-2.4.2.jar",
  "Aquaculture-1.19.2-2.4.17.jar",
  "aquamirae-6.API15.jar",
  "architectury-6.6.92-forge.jar",
  "ArmorDamageLimit-1.19.2-1.0.0.jar",
  "ars_additions-1.19.2-1.4.0.jar",
  "ars_elemental-1.19.2-0.5.9.4.1.jar",
  "ars_nouveau-1.19.2-3.23.0.jar",
  "atmospheric-1.19.2-5.1.2.jar",
  "AttributeFix-Forge-1.19.2-17.2.8.jar",
  "blueprint-1.19.2-6.2.0.jar",
  "buildinggadgets-3.16.3-build.26+mc1.19.2.jar",
  "citadel-2.1.4-1.19.jar",
  "create-1.19.2-0.5.1.i.jar",
  "Cucumber-1.19.2-6.0.11.jar",
  "curios-forge-1.19.2-5.1.6.4.jar",
  "easy-villagers-forge-1.19.2-1.1.23.jar",
  "FarmersDelight-1.19.2-1.2.4.jar",
  "ftb-library-forge-1902.4.1-build.236.jar",
  "ftb-ultimine-forge-1902.4.2-build.14.jar",
  "geckolib-forge-1.19-3.1.40.jar",
  "Iceberg-1.19.2-forge-1.1.4.jar",
  "L_Enders_Cataclysm-2.46-1.19.2.jar",
  "lionfishapi-1.8.jar",
  "Mekanism-1.19.2-10.3.9.13.jar",
  "MysticalAgriculture-1.19.2-6.0.17.jar",
  "obscure_api-15.jar",
  "Patchouli-1.19.2-77.jar",
  "Placebo-1.19.2-7.4.1.jar",
  "sophisticatedbackpacks-1.19.2-3.20.2.1035.jar",
  "sophisticatedcore-1.19.2-0.6.4.730.jar",
  "sophisticatedstorage-1.19.2-0.9.8.1573.jar",
  "TerraBlender-forge-1.19.2-2.0.1.166.jar",
]

const OPTIONAL_MOD_FILENAMES = [
  "jei-1.19.2-forge-11.8.1.1034.jar",
  "OptiFine_1.19.2_HD_U_I2.jar",
]

const DEFAULT_FORGE_SHA256 =
  "4869e60456321e99eb5120ae39171c382c27a05858cdfd4b90ff123e3750e681"
const DEFAULT_FORGE_SIZE = 7_180_192

const args = parseArgs(process.argv.slice(2))
const version = args.version ?? "0.3"
const mcVersion = args.mc ?? "1.19.2"
const forgeVersion = args.forge ?? "43.5.0"
const inDir = args.in ?? `./pack-v${version}`
const outFile = args.out ?? "./manifest.json"
const ghOwner = args.owner ?? "washryan"
const ghRepo = args.repo ?? "launcheraetherion"
const serverHost = args.server ?? "left-fcc.gl.joinmc.link"
const siteUrl = args.site ?? `https://${ghOwner}.github.io/${ghRepo}/`
const templateMode = Boolean(args.template)
const strict = Boolean(args.strict)
const baseUrl = `https://github.com/${ghOwner}/${ghRepo}/releases/download/v${version}`

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

async function walk(dir, acc = []) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) await walk(full, acc)
    else if (entry.isFile()) acc.push(full)
  }
  return acc
}

async function safeWalk(dir) {
  return walk(dir).catch(() => [])
}

async function modEntry(absPath, filename, type, index) {
  const fileStat = absPath ? await stat(absPath) : null
  return {
    path: `mods/${filename}`,
    url: releaseAssetUrl(filename),
    sha256: absPath ? await sha256File(absPath) : placeholderSha(index),
    size: fileStat?.size ?? 0,
    type,
    id: slugFor(filename),
    name: filename.replace(/\.jar$/i, ""),
    tag: type === "optional" ? "Opcional" : "Obrigatorio",
    defaultEnabled: type === "optional" ? optionalDefault(filename) : undefined,
  }
}

async function configEntry(absPath, rootDir, index) {
  const filename = posix.basename(absPath.split("\\").join("/"))
  const rel = relative(rootDir, absPath).split("\\").join("/")
  const fileStat = await stat(absPath)
  return {
    path: rel,
    url: releaseAssetUrl(filename),
    sha256: await sha256File(absPath),
    size: fileStat.size,
    type: "config",
  }
}

function releaseAssetUrl(filename) {
  return `${baseUrl}/${encodeURIComponent(filename)}`
}

function placeholderSha(index) {
  return (index + 1).toString(16).padStart(2, "0").repeat(32)
}

function slugFor(filename) {
  return filename
    .replace(/\.jar$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function optionalDefault(filename) {
  return filename.toLowerCase().startsWith("jei-")
}

function fileMap(files) {
  return new Map(files.map((file) => [posix.basename(file.split("\\").join("/")), file]))
}

async function officialModEntries(type, expectedFilenames, folder, startIndex) {
  const found = templateMode ? new Map() : fileMap(await safeWalk(folder))
  const entries = []

  for (const [offset, filename] of expectedFilenames.entries()) {
    const absPath = found.get(filename)
    if (!absPath && !templateMode) {
      const message = `faltando ${type}: ${filename}`
      if (strict) throw new Error(message)
      console.warn(`  (${message})`)
    }
    entries.push(await modEntry(absPath, filename, type, startIndex + offset))
  }

  if (!templateMode) {
    const expected = new Set(expectedFilenames)
    for (const [filename, absPath] of found.entries()) {
      if (expected.has(filename)) continue
      console.warn(`  (extra em ${folder}: ${filename})`)
      entries.push(await modEntry(absPath, filename, type, startIndex + entries.length))
    }
  }

  return entries
}

async function buildFiles() {
  const required = await officialModEntries(
    "required",
    REQUIRED_MOD_FILENAMES,
    join(inDir, "mods", "required"),
    0,
  )
  const optional = await officialModEntries(
    "optional",
    OPTIONAL_MOD_FILENAMES,
    join(inDir, "mods", "optional"),
    required.length,
  )
  const configRoot = join(inDir, "config")
  const configs = templateMode
    ? []
    : await Promise.all(
        (await safeWalk(configRoot)).map((file, index) =>
          configEntry(file, inDir, required.length + optional.length + index),
        ),
      )

  return [...required, ...optional, ...configs]
}

async function buildForgeEntry() {
  const forgeFilename = `forge-${mcVersion}-${forgeVersion}-installer.jar`
  const forgePath = join(inDir, forgeFilename)
  const forgeStat = templateMode ? null : await stat(forgePath).catch(() => null)
  if (!templateMode && !forgeStat) {
    throw new Error(`Forge installer nao encontrado: ${forgePath}`)
  }

  return {
    version: forgeVersion,
    url: releaseAssetUrl(forgeFilename),
    sha256: templateMode ? DEFAULT_FORGE_SHA256 : await sha256File(forgePath),
    size: forgeStat?.size ?? DEFAULT_FORGE_SIZE,
    installedProfile: `${mcVersion}-forge-${forgeVersion}`,
  }
}

async function main() {
  console.log(
    `[aetherion] building manifest v${version} (${mcVersion} / forge ${forgeVersion})`,
  )
  if (templateMode) console.log("[aetherion] template mode: usando hashes placeholders")
  else console.log(`[aetherion] scanning: ${inDir}`)

  const files = await buildFiles()
  const manifest = {
    $schema: `https://${ghOwner}.github.io/${ghRepo}/manifest.schema.json`,
    version,
    minecraft: mcVersion,
    name: "Aetherion Main",
    instanceId: "aetherion-main",
    publishedAt:
      args.publishedAt ?? (templateMode ? "2026-04-19T00:00:00.000Z" : new Date().toISOString()),
    changelog:
      "- Launcher Electron inicia Minecraft/Forge 1.19.2\n- Forge, libraries, assets e mods sao preparados automaticamente\n- JEI e OptiFine ficam como opcionais selecionaveis\n- Configuracoes de Java, Minecraft, armazenamento, logs, cache e integridade persistentes",
    requiredLauncherVersion: "0.2.0",
    forge: await buildForgeEntry(),
    files,
    java: { recommendedMajor: 17, minMajor: 17 },
    endpoints: {
      serverHost,
      serverPort: 25565,
      site: siteUrl,
      discord: "https://discord.gg/aetherion",
      youtube: "https://youtube.com/@aetherion",
    },
    protectedPatterns: ["mods/dropin/*", "shaderpacks/*", "config/custom-*.toml"],
  }

  await writeFile(outFile, `${JSON.stringify(manifest, null, 2)}\n`, "utf8")
  console.log(`[aetherion] wrote ${outFile}`)
  console.log(
    `[aetherion] files: ${files.filter((file) => file.type === "required").length} required, ${
      files.filter((file) => file.type === "optional").length
    } optional, ${files.filter((file) => file.type === "config").length} config`,
  )

  if (!templateMode) {
    console.log("[aetherion] upload como assets do release:")
    console.log(`  - forge-${mcVersion}-${forgeVersion}-installer.jar`)
    for (const file of files) console.log(`  - ${posix.basename(file.path)}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
