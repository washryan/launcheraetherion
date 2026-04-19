"use client"

import type React from "react"
import { Minus, Square, X } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * WindowFrame — simula a chrome de uma janela desktop.
 *
 * No preview web (Fase 1) os botões são decorativos. Na Fase 5 (Electron/Tauri),
 * estes botões serão conectados a `window.minimize()`, `window.maximize()` e
 * `window.close()` via bridge IPC. A janela real será `frame: false` +
 * `titleBarStyle: 'hidden'` (Electron) ou `decorations: false` (Tauri).
 */
export function WindowFrame({
  title = "Aetherion Launcher",
  children,
  className,
}: {
  title?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="min-h-dvh w-full flex items-center justify-center p-6 bg-background">
      <div
        className={cn(
          "w-full max-w-[1200px] h-[760px] rounded-xl overflow-hidden",
          "bg-card border border-border/60",
          "shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)]",
          "flex flex-col",
          className,
        )}
      >
        {/* Title bar */}
        <header
          className="h-10 shrink-0 flex items-center justify-between px-4 bg-background/40 border-b border-border/50 select-none"
          // Na Fase 5: adicionar -webkit-app-region: drag no Electron
        >
          <div className="flex items-center gap-2">
            <div className="size-4 rounded-sm bg-primary/90 aetherion-gold-glow" aria-hidden />
            <span className="text-xs font-medium tracking-wider text-foreground/80 font-serif">
              {title}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <WindowButton aria-label="Minimizar">
              <Minus className="size-3.5" />
            </WindowButton>
            <WindowButton aria-label="Maximizar">
              <Square className="size-3" />
            </WindowButton>
            <WindowButton aria-label="Fechar" variant="danger">
              <X className="size-3.5" />
            </WindowButton>
          </div>
        </header>

        {/* Conteúdo */}
        <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
      </div>
    </div>
  )
}

function WindowButton({
  children,
  variant = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "danger" }) {
  return (
    <button
      type="button"
      className={cn(
        "size-7 rounded-md inline-flex items-center justify-center text-muted-foreground transition",
        "hover:bg-muted hover:text-foreground",
        variant === "danger" && "hover:bg-destructive hover:text-destructive-foreground",
      )}
      {...props}
    >
      {children}
    </button>
  )
}
