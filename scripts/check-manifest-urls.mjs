#!/usr/bin/env node

import { readFile } from "node:fs/promises"
import { basename } from "node:path"

const manifestPath = process.argv[2] ?? "./public/manifest.json"
const concurrency = Number.parseInt(process.env.AETHERION_CHECK_CONCURRENCY ?? "6", 10)

async function main() {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"))
  const entries = []

  if (manifest.forge?.url) {
    entries.push({
      label: `forge/${basename(new URL(manifest.forge.url).pathname)}`,
      url: manifest.forge.url,
    })
  }

  for (const file of manifest.files ?? []) {
    if (!file?.url) continue
    entries.push({ label: file.path ?? file.url, url: file.url })
  }

  const failures = []
  let checked = 0
  await runWithConcurrency(entries, Math.max(1, concurrency), async (entry) => {
    const result = await checkUrl(entry.url)
    checked++
    if (!result.ok) {
      failures.push({ ...entry, ...result })
      console.error(`404/erro: ${entry.label} -> ${entry.url} (${result.status})`)
      return
    }
    console.log(`ok: ${entry.label}`)
  })

  if (failures.length) {
    throw new Error(
      `Manifest com ${failures.length}/${checked} URL(s) indisponiveis. Publique os assets ou ajuste os nomes antes de distribuir.`,
    )
  }

  console.log(`Manifest OK: ${checked} URL(s) acessiveis.`)
}

async function checkUrl(url) {
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        Range: "bytes=0-0",
        "User-Agent": "AetherionManifestChecker/1.0",
      },
    })
    return { ok: response.ok || response.status === 206, status: response.status }
  } catch (error) {
    return { ok: false, status: error?.message ?? "request failed" }
  }
}

async function runWithConcurrency(items, limit, task) {
  let index = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const item = items[index++]
      await task(item)
    }
  })
  await Promise.all(workers)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
