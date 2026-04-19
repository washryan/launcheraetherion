export function publicAssetPath(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
  return `${basePath}${path}`
}
