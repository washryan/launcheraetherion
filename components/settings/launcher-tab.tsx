"use client"

import { useState } from "react"
import { FileText, FolderOpen, HardDrive, RotateCcw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  SettingsRow,
  SettingsSection,
} from "@/components/launcher/settings-shell"
import { DEFAULT_SETTINGS } from "@/lib/launcher/mock-data"

export function LauncherTab() {
  const [prefs, setPrefs] = useState(DEFAULT_SETTINGS.launcher)

  return (
    <>
      <SettingsSection
        title="Atualizações"
        description="Controla como o próprio launcher se atualiza."
      >
        <SettingsRow
          label="Canal de atualização"
          description="Beta recebe novidades antes, mas pode ter instabilidades."
        >
          <Select
            value={prefs.updateChannel}
            onValueChange={(v: "stable" | "beta") =>
              setPrefs((p) => ({ ...p, updateChannel: v }))
            }
          >
            <SelectTrigger className="w-36 h-9 bg-input/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stable">Estável</SelectItem>
              <SelectItem value="beta">Beta</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>

        <SettingsRow
          label="Minimizar para a bandeja"
          description="Ao fechar, o launcher continua rodando em segundo plano."
        >
          <Switch
            checked={prefs.minimizeToTray}
            onCheckedChange={(v) => setPrefs((p) => ({ ...p, minimizeToTray: v }))}
          />
        </SettingsRow>

        <SettingsRow
          label="Telemetria anônima"
          description="Ajuda a detectar crashes e bugs. Nenhum dado pessoal é enviado."
        >
          <Switch
            checked={prefs.telemetry}
            onCheckedChange={(v) => setPrefs((p) => ({ ...p, telemetry: v }))}
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection
        title="Armazenamento"
        description="Instâncias, mods baixados, caches e logs ficam aqui."
      >
        <div className="flex items-center gap-2">
          <HardDrive className="size-4 text-muted-foreground shrink-0" />
          <Input
            readOnly
            value={prefs.dataDirectory ?? "%APPDATA%\\.aetherion"}
            className="flex-1 h-9 bg-input/40 font-mono text-xs"
          />
          <Button variant="outline" size="sm" className="h-9 gap-2 bg-transparent">
            <FolderOpen className="size-4" />
            Abrir
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <ActionCard
            icon={<RotateCcw className="size-4" />}
            title="Verificar integridade"
            description="Recalcula hashes e baixa arquivos corrompidos."
          />
          <ActionCard
            icon={<Trash2 className="size-4" />}
            title="Limpar cache"
            description="Remove downloads temporários e thumbnails."
          />
          <ActionCard
            icon={<FileText className="size-4" />}
            title="Ver logs"
            description="Abre a pasta de logs do launcher e do jogo."
          />
        </div>
      </SettingsSection>

      <SettingsSection title="Sobre">
        <div className="rounded-lg border border-border/50 bg-card/40 p-5 space-y-3">
          <InfoLine label="Launcher" value="Aetherion v0.1.0" />
          <InfoLine label="Build" value="2026.04.18" />
          <InfoLine label="Electron" value="— (Fase 5)" muted />
          <InfoLine label="Node" value="— (Fase 5)" muted />
        </div>
      </SettingsSection>
    </>
  )
}

function ActionCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <button
      type="button"
      className="text-left p-4 rounded-lg border border-border/50 bg-card/40 hover:border-primary/40 hover:bg-primary/5 transition"
    >
      <span className="inline-flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {icon}
      </span>
      <p className="mt-3 text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{description}</p>
    </button>
  )
}

function InfoLine({
  label,
  value,
  muted,
}: {
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={muted ? "text-muted-foreground/60 font-mono" : "text-foreground font-mono"}>
        {value}
      </span>
    </div>
  )
}
