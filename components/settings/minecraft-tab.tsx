"use client"

import { useState } from "react"
import { FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { SettingsRow, SettingsSection } from "@/components/launcher/settings-shell"
import { DEFAULT_SETTINGS } from "@/lib/launcher/mock-data"

export function MinecraftTab() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS.minecraft)

  return (
    <>
      <SettingsSection
        title="Vídeo"
        description="Resolução inicial e modo de tela do jogo."
      >
        <SettingsRow label="Resolução do jogo" description="Usada quando não está em tela cheia.">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={settings.resolution.width}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  resolution: { ...s.resolution, width: Number(e.target.value) },
                }))
              }
              className="w-24 h-9 bg-input/40 text-center"
            />
            <span className="text-muted-foreground">×</span>
            <Input
              type="number"
              value={settings.resolution.height}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  resolution: { ...s.resolution, height: Number(e.target.value) },
                }))
              }
              className="w-24 h-9 bg-input/40 text-center"
            />
          </div>
        </SettingsRow>

        <SettingsRow
          label="Iniciar em tela cheia"
          description="Substitui a resolução acima quando ativado."
        >
          <Switch
            checked={settings.fullscreen}
            onCheckedChange={(v) => setSettings((s) => ({ ...s, fullscreen: v }))}
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection
        title="Inicialização"
        description="Comportamento do jogo ao ser lançado."
      >
        <SettingsRow
          label="Conectar automaticamente ao servidor"
          description="Entra direto no Aetherion assim que o jogo abrir."
        >
          <Switch
            checked={settings.autoConnectServer}
            onCheckedChange={(v) => setSettings((s) => ({ ...s, autoConnectServer: v }))}
          />
        </SettingsRow>

        <SettingsRow
          label="Processo separado do launcher"
          description="Se desligado, fechar o launcher também fecha o jogo."
        >
          <Switch
            checked={settings.detachProcess}
            onCheckedChange={(v) => setSettings((s) => ({ ...s, detachProcess: v }))}
          />
        </SettingsRow>

        <SettingsRow
          label="Fechar launcher ao abrir o jogo"
          description="Libera RAM enquanto você joga."
        >
          <Switch
            checked={settings.closeOnLaunch}
            onCheckedChange={(v) => setSettings((s) => ({ ...s, closeOnLaunch: v }))}
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection
        title="Diretório da instância"
        description="Onde ficam os arquivos do modpack, saves, configs e cache."
      >
        <div className="flex items-center gap-2">
          <Input
            readOnly
            value={settings.gameDirectory ?? "%APPDATA%\\.aetherion\\instances\\main"}
            className="flex-1 h-9 bg-input/40 font-mono text-xs"
          />
          <Button variant="outline" size="sm" className="h-9 gap-2 bg-transparent">
            <FolderOpen className="size-4" />
            Alterar
          </Button>
        </div>
      </SettingsSection>
    </>
  )
}
