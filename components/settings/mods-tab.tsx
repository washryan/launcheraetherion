"use client"

import { useState } from "react"
import { Lock, Plus, RefreshCw, Trash2, Upload } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { SettingsSection } from "@/components/launcher/settings-shell"
import {
  MOCK_DROPIN_MODS,
  OPTIONAL_MODS,
  REQUIRED_MODS,
} from "@/lib/launcher/mock-data"
import type { DropinMod, ModEntry } from "@/lib/launcher/types"
import { cn } from "@/lib/utils"

function formatSize(bytes: number) {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`
  return `${bytes} B`
}

export function ModsTab() {
  const [optional, setOptional] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(OPTIONAL_MODS.map((m) => [m.id, m.defaultEnabled ?? false])),
  )
  const [dropins, setDropins] = useState<DropinMod[]>(MOCK_DROPIN_MODS)

  return (
    <>
      <SettingsSection
        title={`Obrigatórios (${REQUIRED_MODS.length})`}
        description="Mods definidos pelo manifest do servidor. Não podem ser desativados."
      >
        <div className="rounded-lg border border-border/50 divide-y divide-border/40">
          {REQUIRED_MODS.map((mod) => (
            <ModRow key={mod.id} mod={mod} locked />
          ))}
        </div>
      </SettingsSection>

      <SettingsSection
        title={`Opcionais (${OPTIONAL_MODS.length})`}
        description="Você pode ativar ou desativar livremente."
      >
        <div className="rounded-lg border border-border/50 divide-y divide-border/40">
          {OPTIONAL_MODS.map((mod) => (
            <ModRow
              key={mod.id}
              mod={mod}
              enabled={optional[mod.id]}
              onToggle={(v) => setOptional((prev) => ({ ...prev, [mod.id]: v }))}
            />
          ))}
        </div>
      </SettingsSection>

      <SettingsSection
        title="Drop-in Mods"
        description="Mods que você adicionou manualmente. O launcher preserva esses arquivos durante atualizações."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2 bg-transparent">
            <Upload className="size-4" />
            Adicionar .jar
          </Button>
          <Button variant="ghost" size="sm" className="h-9 gap-2 text-muted-foreground">
            <RefreshCw className="size-4" />
            Recarregar
          </Button>
          <p className="ml-auto text-xs text-muted-foreground">
            Pasta: <code className="font-mono">mods/dropin/</code>
          </p>
        </div>

        <div className="rounded-lg border border-border/50 divide-y divide-border/40">
          {dropins.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Nenhum mod adicionado ainda.
            </div>
          ) : (
            dropins.map((mod, i) => (
              <div key={mod.filename} className="flex items-center gap-4 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono text-foreground truncate">
                    {mod.filename}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{formatSize(mod.size)}</p>
                </div>
                <Switch
                  checked={mod.enabled}
                  onCheckedChange={(v) =>
                    setDropins((prev) =>
                      prev.map((m, idx) => (idx === i ? { ...m, enabled: v } : m)),
                    )
                  }
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 text-muted-foreground hover:text-destructive"
                  onClick={() =>
                    setDropins((prev) => prev.filter((m) => m.filename !== mod.filename))
                  }
                  aria-label={`Remover ${mod.filename}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </SettingsSection>

      <SettingsSection
        title="Shaderpacks"
        description="Shaders funcionam apenas em máquinas potentes. Instale Iris/Oculus para suporte."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9 bg-transparent">
            <Plus className="size-4" />
          </Button>
          <Select defaultValue="off">
            <SelectTrigger className="h-9 flex-1 bg-input/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="off">Off (Default)</SelectItem>
              <SelectItem value="complementary">Complementary Shaders v4.7</SelectItem>
              <SelectItem value="bsl">BSL Shaders v8.2</SelectItem>
              <SelectItem value="sildurs">Sildur&apos;s Vibrant Shaders</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SettingsSection>
    </>
  )
}

function ModRow({
  mod,
  locked,
  enabled,
  onToggle,
}: {
  mod: ModEntry
  locked?: boolean
  enabled?: boolean
  onToggle?: (v: boolean) => void
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <div
        className={cn(
          "size-2 rounded-full shrink-0",
          locked ? "bg-primary" : enabled ? "bg-accent" : "bg-muted",
        )}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">{mod.name}</p>
          {mod.tag && (
            <Badge
              variant="outline"
              className="text-[10px] uppercase tracking-wider border-border/60 text-muted-foreground"
            >
              {mod.tag}
            </Badge>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground">
          v{mod.version}
          {mod.author && ` • ${mod.author}`}
        </p>
      </div>
      {locked ? (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-muted-foreground text-xs">
          <Lock className="size-3" />
          Travado
        </div>
      ) : (
        <Switch checked={enabled ?? false} onCheckedChange={onToggle} />
      )}
    </div>
  )
}
