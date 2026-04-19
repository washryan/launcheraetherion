"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeft, Box, Cog, Coffee, Home, User } from "lucide-react"
import type React from "react"
import { cn } from "@/lib/utils"
import { AetherionMark } from "./aetherion-mark"

const NAV = [
  { href: "/settings/account", label: "Conta", icon: User },
  { href: "/settings/minecraft", label: "Minecraft", icon: Home },
  { href: "/settings/mods", label: "Mods", icon: Box },
  { href: "/settings/java", label: "Java", icon: Coffee },
  { href: "/settings/launcher", label: "Launcher", icon: Cog },
]

export function SettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="h-full w-full grid grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside className="border-r border-border/50 bg-sidebar flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <AetherionMark size={28} />
          <div>
            <p className="font-serif text-base tracking-wider leading-none">Aetherion</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
              Configurações
            </p>
          </div>
        </div>

        <div className="aetherion-divider h-px mx-6" />

        <nav className="flex-1 px-3 py-6 space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 h-9 rounded-md text-sm transition",
                  active
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent",
                )}
              >
                <Icon className="size-4" />
                <span className="font-medium tracking-wide">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-border/50">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 h-9 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
          >
            <ArrowLeft className="size-4" />
            <span>Voltar</span>
          </Link>
          <p className="mt-3 px-3 text-[10px] text-muted-foreground/70">Aetherion v0.1.0</p>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="min-w-0 overflow-y-auto aetherion-scroll">{children}</main>
    </div>
  )
}

/**
 * SettingsPage — wrapper que dá consistência a título/descrição.
 */
export function SettingsPage({
  title,
  description,
  children,
  actions,
}: {
  title: string
  description?: string
  children: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="min-h-full flex flex-col">
      <header className="flex items-start justify-between gap-6 p-10 pb-6">
        <div>
          <h1 className="font-serif text-3xl tracking-wide text-foreground">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground max-w-xl">{description}</p>
          )}
        </div>
        {actions}
      </header>
      <div className="aetherion-divider h-px mx-10" />
      <div className="flex-1 px-10 py-8 space-y-8">{children}</div>
    </div>
  )
}

export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-medium tracking-[0.2em] uppercase text-primary/90">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{description}</p>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

export function SettingsRow({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-4 border-b border-border/40 last:border-b-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}
