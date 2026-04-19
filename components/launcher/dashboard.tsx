"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Cog, Disc, Globe, LogIn, Play, Youtube } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  MOCK_ACCOUNTS,
  MOCK_MANIFEST,
  MOCK_MOJANG_STATUS,
  MOCK_SERVER_STATUS,
} from "@/lib/launcher/mock-data"
import { simulateLaunch } from "@/lib/launcher/launch-simulator"
import type { Account, LaunchProgress } from "@/lib/launcher/types"
import { publicAssetPath } from "@/lib/public-path"
import { AetherionMark } from "./aetherion-mark"
import { LaunchProgressOverlay } from "./launch-progress"

export function Dashboard() {
  const [activeAccount, setActiveAccount] = useState<Account>(MOCK_ACCOUNTS[0])
  const [progress, setProgress] = useState<LaunchProgress | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!window.aetherion?.accounts) return

    window.aetherion.accounts
      .list()
      .then((state) => {
        const active =
          state.accounts.find((account: Account) => account.id === state.activeId) ??
          state.accounts[0]
        if (active) setActiveAccount(active)
      })
      .catch((err) => console.warn("[aetherion] failed to load account", err))
  }, [])

  // Fase 5 (Electron): esse handler chama window.aetherion.launch({ ... })
  // e escuta os mesmos eventos `LaunchProgress`. Aqui usamos o simulador
  // que percorre TODAS as fases reais do pipeline.
  async function handleLaunch() {
    const controller = new AbortController()
    abortRef.current = controller
    setProgress({ phase: "fetching-manifest", message: "Iniciando..." })

    try {
      await simulateLaunch({
        signal: controller.signal,
        onProgress: (p) => setProgress(p),
      })
    } catch (err) {
      if (controller.signal.aborted) {
        setProgress(null)
        return
      }
      setProgress({
        phase: "error",
        message: "Falha na preparação",
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }

  function cancel() {
    abortRef.current?.abort()
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Arte de fundo */}
      <div className="absolute inset-0">
        <Image src={publicAssetPath("/aetherion-bg.jpg")} alt="" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
      </div>

      {/* Conteúdo */}
      <div className="relative h-full flex flex-col">
        <div className="flex items-start justify-between p-8">
          <div className="flex items-center gap-3">
            <AetherionMark size={48} />
            <div>
              <h1 className="font-serif text-2xl tracking-wide text-foreground">Aetherion</h1>
              <p className="text-xs text-muted-foreground tracking-[0.2em] uppercase">
                Reino Etéreo
              </p>
            </div>
          </div>

          <AccountBadge
            username={activeAccount.username}
            avatarUrl={activeAccount.avatarUrl}
            type={activeAccount.type}
          />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="font-serif text-6xl tracking-[0.15em] text-foreground/90 drop-shadow-2xl">
              AETHERION
            </p>
            <p className="mt-2 text-sm text-primary/80 tracking-[0.4em] uppercase font-medium">
              Main Realm
            </p>
          </div>
        </div>

        <footer className="border-t border-border/50 bg-background/60 backdrop-blur-xl">
          <div className="grid grid-cols-12 gap-6 items-center px-8 py-5">
            <div className="col-span-5 flex items-center gap-8">
              <StatusBlock
                label="Jogadores"
                value={`${MOCK_SERVER_STATUS.players.current} / ${MOCK_SERVER_STATUS.players.max}`}
                dotClass="bg-primary"
              />
              <StatusBlock
                label="Mojang"
                value={MOCK_MOJANG_STATUS.auth === "green" ? "Online" : "Instável"}
                dotClass={
                  MOCK_MOJANG_STATUS.auth === "green" ? "bg-primary" : "bg-destructive"
                }
              />
              <StatusBlock
                label="Ping"
                value={`${MOCK_SERVER_STATUS.ping ?? "--"} ms`}
                dotClass="bg-accent"
              />
            </div>

            <div className="col-span-3 flex items-center justify-center gap-2">
              <IconLink href="/settings/account" label="Configurações">
                <Cog className="size-4" />
              </IconLink>
              <IconLink href="#" label="Site">
                <Globe className="size-4" />
              </IconLink>
              <IconLink href="#" label="YouTube">
                <Youtube className="size-4" />
              </IconLink>
              <IconLink href="#" label="Discord">
                <Disc className="size-4" />
              </IconLink>
            </div>

            <div className="col-span-4 flex items-center justify-end gap-4">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Instância
                </p>
                <p className="text-sm font-medium text-foreground">
                  {MOCK_MANIFEST.name}{" "}
                  <span className="text-muted-foreground font-normal">
                    • {MOCK_MANIFEST.minecraft} • v{MOCK_MANIFEST.version}
                  </span>
                </p>
              </div>

              <Button
                size="lg"
                onClick={handleLaunch}
                disabled={progress !== null && progress.phase !== "error" && progress.phase !== "running"}
                className={cn(
                  "h-14 px-8 rounded-md font-serif text-lg tracking-[0.25em]",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  "aetherion-gold-glow",
                )}
              >
                <span className="inline-flex items-center gap-3">
                  <Play className="size-4 fill-primary-foreground" />
                  JOGAR
                </span>
              </Button>
            </div>
          </div>
        </footer>
      </div>

      {progress && (
        <LaunchProgressOverlay
          progress={progress}
          onCancel={cancel}
          onDismiss={() => setProgress(null)}
        />
      )}
    </div>
  )
}

function StatusBlock({
  label,
  value,
  dotClass,
}: {
  label: string
  value: string
  dotClass: string
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <span className={cn("size-1.5 rounded-full", dotClass)} />
        <span className="text-sm font-medium text-foreground">{value}</span>
      </div>
    </div>
  )
}

function IconLink({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="size-9 inline-flex items-center justify-center rounded-md border border-border/60 bg-card/50 text-muted-foreground hover:text-primary hover:border-primary/40 transition"
    >
      {children}
    </Link>
  )
}

function AccountBadge({
  username,
  avatarUrl,
  type,
}: {
  username: string
  avatarUrl?: string
  type: "offline" | "microsoft"
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-md border border-border/60 bg-card/60 backdrop-blur-md">
      <div className="text-right">
        <p className="text-sm font-medium text-foreground leading-tight">{username}</p>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {type === "microsoft" ? "Microsoft" : "Offline"}
        </p>
      </div>
      <Avatar className="size-10 rounded-md ring-1 ring-primary/30">
        <AvatarImage src={publicAssetPath(avatarUrl || "/placeholder.svg")} alt={username} />
        <AvatarFallback className="rounded-md bg-muted text-primary">
          {username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <Link
        href="/login"
        aria-label="Trocar conta"
        className="ml-1 size-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-primary transition"
      >
        <LogIn className="size-4" />
      </Link>
    </div>
  )
}
