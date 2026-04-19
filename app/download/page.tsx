import Link from "next/link"
import { ArrowRight, Download, MessageCircle, Package, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AetherionMark } from "@/components/launcher/aetherion-mark"
import { MOCK_MANIFEST } from "@/lib/launcher/mock-data"
import {
  AETHERION_HOSTING,
  launcherDownloadUrl,
  releasePageUrl,
} from "@/lib/launcher/github-releases"

/**
 * Esta página é o "site" simples que pedem no objetivo.
 * Quando o launcher for publicado, esta rota pode ser exportada via
 *   `next build && next export`
 * e o conteúdo de /out/download virar a home do GitHub Pages.
 */

const LAUNCHER_VERSION = "0.1.0"
const LAUNCHER_REPO = {
  owner: AETHERION_HOSTING.owner,
  repo: "aetherion-launcher",
}

const DOWNLOADS = [
  {
    os: "Windows",
    filename: `Aetherion-Launcher-Setup-${LAUNCHER_VERSION}.exe`,
    arch: "x64",
    recommended: true,
  },
  {
    os: "Linux",
    filename: `Aetherion-Launcher-${LAUNCHER_VERSION}.AppImage`,
    arch: "x64",
  },
  {
    os: "macOS",
    filename: `Aetherion-Launcher-${LAUNCHER_VERSION}.dmg`,
    arch: "arm64 / x64",
  },
]

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/40">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AetherionMark size={36} />
            <div>
              <p className="font-serif text-lg tracking-wide">Aetherion</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                Reino Etéreo
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <a
              href={MOCK_MANIFEST.endpoints?.discord}
              className="text-muted-foreground hover:text-foreground transition inline-flex items-center gap-1.5"
            >
              <MessageCircle className="size-4" />
              Discord
            </a>
            <a
              href={releasePageUrl(MOCK_MANIFEST.version)}
              className="text-muted-foreground hover:text-foreground transition"
            >
              Releases
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <Badge
          variant="outline"
          className="mb-6 text-[10px] uppercase tracking-[0.25em] border-primary/40 text-primary"
        >
          Servidor {MOCK_MANIFEST.minecraft} • Forge
        </Badge>
        <h1 className="font-serif text-5xl md:text-6xl tracking-[0.1em] text-balance">
          AETHERION
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto text-balance">
          Launcher oficial do reino etéreo. Um clique e o modpack inteiro fica atualizado,
          verificado por hash e pronto para jogar.
        </p>

        <div className="mt-10 flex items-center justify-center gap-3">
          <Button asChild size="lg" className="h-12 px-6 gap-2 aetherion-gold-glow">
            <a
              href={launcherDownloadUrl(
                LAUNCHER_VERSION,
                `Aetherion-Launcher-Setup-${LAUNCHER_VERSION}.exe`,
                LAUNCHER_REPO,
              )}
            >
              <Download className="size-4" />
              Baixar para Windows
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 px-5 gap-2 bg-transparent"
          >
            <Link href="/">
              Abrir preview da UI
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Launcher v{LAUNCHER_VERSION} • Modpack v{MOCK_MANIFEST.version} •{" "}
          {MOCK_MANIFEST.publishedAt && new Date(MOCK_MANIFEST.publishedAt).toLocaleDateString("pt-BR")}
        </p>
      </section>

      {/* Downloads por OS */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="font-serif text-2xl tracking-wide mb-6">Downloads</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {DOWNLOADS.map((d) => (
            <a
              key={d.os}
              href={launcherDownloadUrl(LAUNCHER_VERSION, d.filename, LAUNCHER_REPO)}
              className="group rounded-lg border border-border/50 bg-card/40 p-5 hover:border-primary/40 transition"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="font-serif text-lg">{d.os}</p>
                {d.recommended && (
                  <Badge className="bg-primary/15 text-primary border-primary/30 hover:bg-primary/20">
                    Recomendado
                  </Badge>
                )}
              </div>
              <p className="text-xs font-mono text-muted-foreground truncate">
                {d.filename}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">{d.arch}</p>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-primary group-hover:gap-3 transition-all">
                <Download className="size-3.5" />
                Baixar
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/40 bg-card/20">
        <div className="max-w-5xl mx-auto px-6 py-16 grid gap-8 md:grid-cols-3">
          <Feature
            icon={<Shield className="size-5" />}
            title="Integridade por SHA-256"
            description="Cada .jar é validado com hash antes de rodar. Se um arquivo é adulterado, o launcher rebaixa automaticamente."
          />
          <Feature
            icon={<Package className="size-5" />}
            title="Atualização incremental"
            description="Só baixa o que mudou entre versões. Uma atualização grande raramente passa de 20 MB."
          />
          <Feature
            icon={<Download className="size-5" />}
            title="Distribuição gratuita"
            description="Hospedagem 100% em GitHub Releases + GitHub Pages. Sem CDN paga, sem limites de tráfego."
          />
        </div>
      </section>

      {/* Changelog */}
      {MOCK_MANIFEST.changelog && (
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-serif text-2xl tracking-wide">Changelog</h2>
            <a
              href={releasePageUrl(MOCK_MANIFEST.version)}
              className="text-sm text-primary hover:underline"
            >
              Ver no GitHub →
            </a>
          </div>
          <div className="rounded-lg border border-border/50 bg-card/40 p-6">
            <p className="font-serif text-lg tracking-wide">
              v{MOCK_MANIFEST.version}{" "}
              <span className="text-muted-foreground text-sm font-sans">
                • {MOCK_MANIFEST.publishedAt && new Date(MOCK_MANIFEST.publishedAt).toLocaleDateString("pt-BR")}
              </span>
            </p>
            <pre className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
              {MOCK_MANIFEST.changelog}
            </pre>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border/40">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 Aetherion Network • Não afiliado à Mojang Studios
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <a
              href={`https://github.com/${LAUNCHER_REPO.owner}/${LAUNCHER_REPO.repo}`}
              className="hover:text-foreground"
            >
              GitHub
            </a>
            <a href={MOCK_MANIFEST.endpoints?.discord} className="hover:text-foreground">
              Discord
            </a>
            <a href={MOCK_MANIFEST.endpoints?.youtube} className="hover:text-foreground">
              YouTube
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div>
      <div className="size-10 inline-flex items-center justify-center rounded-md bg-primary/10 text-primary mb-3">
        {icon}
      </div>
      <p className="font-serif text-lg mb-1">{title}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
