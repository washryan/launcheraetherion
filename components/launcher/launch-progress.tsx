"use client"

import { CheckCircle2, Download, Hammer, Loader2, Rocket, Search, ServerCrash, Coffee } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LaunchPhase, LaunchProgress } from "@/lib/launcher/types"

interface Props {
  progress: LaunchProgress
  onCancel?: () => void
  onDismiss?: () => void
}

const PHASE_ORDER: LaunchPhase[] = [
  "fetching-manifest",
  "computing-plan",
  "checking-java",
  "downloading-java",
  "installing-forge",
  "downloading-files",
  "verifying",
  "launching",
]

const PHASE_META: Record<
  LaunchPhase,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  idle: { label: "Aguardando", icon: Loader2 },
  "fetching-manifest": { label: "Buscando manifest", icon: Search },
  "computing-plan": { label: "Calculando diferenças", icon: Search },
  "checking-java": { label: "Verificando Java", icon: Coffee },
  "downloading-java": { label: "Baixando runtime Java", icon: Download },
  "installing-forge": { label: "Instalando Forge", icon: Hammer },
  "downloading-files": { label: "Baixando mods e configs", icon: Download },
  verifying: { label: "Verificando integridade", icon: CheckCircle2 },
  launching: { label: "Iniciando Minecraft", icon: Rocket },
  running: { label: "Jogo em execução", icon: Rocket },
  error: { label: "Erro", icon: ServerCrash },
}

function formatBytes(n?: number): string {
  if (!n || n <= 0) return "0 MB"
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)} GB`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} MB`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)} KB`
  return `${n} B`
}

export function LaunchProgressOverlay({ progress, onCancel, onDismiss }: Props) {
  const { phase, message, loadedBytes, totalBytes, filesDone, filesTotal, error } = progress

  const isError = phase === "error"
  const isDone = phase === "running"
  const percent =
    totalBytes && totalBytes > 0
      ? Math.min(100, ((loadedBytes ?? 0) / totalBytes) * 100)
      : phase === "verifying" || phase === "launching"
        ? 100
        : undefined

  const activeIdx = PHASE_ORDER.indexOf(phase)

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Atualizando launcher"
      className="absolute inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-xl"
    >
      <div className="w-full max-w-xl mx-6 rounded-lg border border-border/60 bg-card/95 p-8 shadow-2xl">
        {/* Título */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className={cn(
              "size-10 rounded-md inline-flex items-center justify-center",
              isError
                ? "bg-destructive/10 text-destructive"
                : isDone
                  ? "bg-primary/10 text-primary"
                  : "bg-primary/10 text-primary",
            )}
          >
            {isError ? (
              <ServerCrash className="size-5" />
            ) : isDone ? (
              <Rocket className="size-5" />
            ) : (
              <Loader2 className="size-5 animate-spin" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-serif text-lg tracking-wide text-foreground">
              {isError
                ? "Falha na preparação"
                : isDone
                  ? "Tudo pronto"
                  : "Preparando Aetherion..."}
            </h2>
            <p className="text-xs text-muted-foreground truncate">{message}</p>
          </div>
        </div>

        {/* Barra de progresso */}
        {!isError && (
          <>
            <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
              <div
                className={cn(
                  "h-full bg-primary transition-all duration-300",
                  percent === undefined && "animate-pulse w-1/3",
                )}
                style={percent !== undefined ? { width: `${percent}%` } : undefined}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>
                {filesTotal && filesTotal > 0
                  ? `${filesDone ?? 0} / ${filesTotal} arquivos`
                  : "\u00a0"}
              </span>
              <span>
                {totalBytes
                  ? `${formatBytes(loadedBytes)} / ${formatBytes(totalBytes)}`
                  : percent !== undefined
                    ? `${percent.toFixed(0)}%`
                    : ""}
              </span>
            </div>
          </>
        )}

        {/* Erro */}
        {isError && error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive font-mono whitespace-pre-wrap break-words">
            {error}
          </div>
        )}

        {/* Etapas */}
        <ol className="mt-6 space-y-2">
          {PHASE_ORDER.map((p, i) => {
            const Icon = PHASE_META[p].icon
            const state: "done" | "active" | "pending" =
              isError && i === activeIdx
                ? "active"
                : i < activeIdx || isDone
                  ? "done"
                  : i === activeIdx
                    ? "active"
                    : "pending"

            return (
              <li key={p} className="flex items-center gap-3 text-sm">
                <span
                  className={cn(
                    "size-6 shrink-0 rounded-md inline-flex items-center justify-center border",
                    state === "done" && "border-primary/40 bg-primary/10 text-primary",
                    state === "active" &&
                      "border-primary/40 bg-primary/10 text-primary",
                    state === "pending" &&
                      "border-border/50 bg-muted/30 text-muted-foreground",
                  )}
                >
                  {state === "done" ? (
                    <CheckCircle2 className="size-3.5" />
                  ) : state === "active" ? (
                    <Icon
                      className={cn(
                        "size-3.5",
                        (p === "fetching-manifest" ||
                          p === "downloading-java" ||
                          p === "downloading-files") &&
                          "animate-pulse",
                      )}
                    />
                  ) : (
                    <Icon className="size-3.5" />
                  )}
                </span>
                <span
                  className={cn(
                    state === "pending" && "text-muted-foreground",
                    state === "active" && "text-foreground font-medium",
                    state === "done" && "text-foreground/80",
                  )}
                >
                  {PHASE_META[p].label}
                </span>
              </li>
            )
          })}
        </ol>

        {/* Ações */}
        <div className="mt-8 flex justify-end gap-2">
          {isError || isDone ? (
            <button
              type="button"
              onClick={onDismiss}
              className="h-9 px-4 rounded-md border border-border/60 text-sm text-foreground hover:bg-muted/40 transition"
            >
              Fechar
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="h-9 px-4 rounded-md border border-border/60 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
