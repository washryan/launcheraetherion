/**
 * Aetherion Launcher — SHA-256 (Fase 3 / hash service)
 *
 * Funciona em DOIS ambientes:
 *   1) Browser / preview Next.js  → usa `crypto.subtle.digest`
 *   2) Main process do Electron   → usa `node:crypto.createHash`
 *
 * A detecção é automática. O Electron tem ambos, mas `node:crypto` é mais
 * rápido em arquivos grandes porque lê em stream sem carregar tudo em memória.
 *
 * IMPORTANTE: compare hashes em lower-case sempre.
 */

/* -------------------------------------------------------------------------- */
/*  sha256 de um buffer (universal)                                           */
/* -------------------------------------------------------------------------- */

/**
 * Hash de um ArrayBuffer / Uint8Array. Usa Web Crypto — funciona em qualquer
 * runtime moderno (browser, Electron renderer, Node 19+, Deno, Bun).
 */
export async function sha256Bytes(
  data: ArrayBuffer | Uint8Array,
): Promise<string> {
  const bytes =
    data instanceof Uint8Array
      ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
      : new Uint8Array(data)
  const buf = new Uint8Array(bytes).buffer
  const digest = await crypto.subtle.digest("SHA-256", buf)
  return bufferToHex(digest)
}

/**
 * Hash de uma string (UTF-8).
 */
export async function sha256String(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text)
  return sha256Bytes(bytes)
}

/* -------------------------------------------------------------------------- */
/*  sha256 de um Blob/File (browser-first)                                    */
/* -------------------------------------------------------------------------- */

/**
 * Hash incremental de um Blob — lê em chunks para não estourar memória.
 * Útil no preview/renderer quando queremos verificar um arquivo antes de
 * mandar para o main process gravar.
 */
export async function sha256Blob(
  blob: Blob,
  onProgress?: (loaded: number, total: number) => void,
): Promise<string> {
  // Browser moderno: Blob.stream() é padrão desde 2022
  const stream = blob.stream()
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let loaded = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    loaded += value.byteLength
    onProgress?.(loaded, blob.size)
  }

  // Concatena e hasheia. Para arquivos > 100 MB o ideal seria usar
  // `crypto.subtle.digest` por chunk, mas Web Crypto não tem API incremental.
  // Essa implementação serve para arquivos de mod (≤ 50 MB cada).
  const merged = new Uint8Array(loaded)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.byteLength
  }
  return sha256Bytes(merged)
}

/* -------------------------------------------------------------------------- */
/*  sha256 de arquivo em disco (só Node / Electron main)                      */
/* -------------------------------------------------------------------------- */

/**
 * Hash streaming de um arquivo local. SÓ funciona no main process do Electron
 * ou em Node.js — `node:fs` e `node:crypto` não existem no renderer.
 *
 * Importado dinamicamente para que este arquivo continue bundle-safe no
 * Next.js (o bundler só carrega quando a função é chamada).
 */
export async function sha256File(absolutePath: string): Promise<string> {
  const [{ createHash }, { createReadStream }] = await Promise.all([
    import("node:crypto"),
    import("node:fs"),
  ])

  return new Promise((resolve, reject) => {
    const hash = createHash("sha256")
    const stream = createReadStream(absolutePath, { highWaterMark: 1024 * 1024 })
    stream.on("data", (chunk) => hash.update(chunk))
    stream.on("end", () => resolve(hash.digest("hex")))
    stream.on("error", reject)
  })
}

/* -------------------------------------------------------------------------- */
/*  Utils                                                                      */
/* -------------------------------------------------------------------------- */

export function verifyHash(expected: string, actual: string): boolean {
  return expected.toLowerCase() === actual.toLowerCase()
}

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let hex = ""
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0")
  }
  return hex
}
