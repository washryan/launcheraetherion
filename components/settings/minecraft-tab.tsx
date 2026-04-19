"use client"

import { useEffect, useState } from "react"
import { FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { SettingsRow, SettingsSection } from "@/components/launcher/settings-shell"
import { DEFAULT_SETTINGS } from "@/lib/launcher/mock-data"

export function MinecraftTab() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS.minecraft)
  const [instancePath, setInstancePath] = useState(settings.gameDirectory ?? "")

  useEffect(() => {
    if (!window.aetherion?.settings) return

    window.aetherion.settings
      .get()
      .then((state) => {
        setSettings(state.minecraft)
        setInstancePath(state.minecraft.gameDirectory ?? "")
      })
      .catch((err) => console.warn("[aetherion] failed to load minecraft settings", err))

    window.aetherion.settings
      .getPaths()
      .then((paths) => setInstancePath(paths.instancePath))
      .catch(() => undefined)
  }, [])

  function updateMinecraft(next: typeof settings | ((current: typeof settings) => typeof settings)) {
    setSettings((current) => {
      const resolved = typeof next === "function" ? next(current) : next
      window.aetherion?.settings
        .update({ minecraft: resolved })
        .then((state) => {
          setSettings(state.minecraft)
          setInstancePath(state.minecraft.gameDirectory ?? instancePath)
        })
        .catch((err) => console.warn("[aetherion] failed to save minecraft settings", err))
      return resolved
    })
  }

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
                updateMinecraft((s) => ({
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
                updateMinecraft((s) => ({
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
            onCheckedChange={(v) => updateMinecraft((s) => ({ ...s, fullscreen: v }))}
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
            onCheckedChange={(v) => updateMinecraft((s) => ({ ...s, autoConnectServer: v }))}
          />
        </SettingsRow>

        <SettingsRow
          label="Processo separado do launcher"
          description="Se desligado, fechar o launcher também fecha o jogo."
        >
          <Switch
            checked={settings.detachProcess}
            onCheckedChange={(v) =>
              updateMinecraft((s) => ({
                ...s,
                detachProcess: v,
                closeOnLaunch: v ? s.closeOnLaunch : false,
              }))
            }
          />
        </SettingsRow>

        <SettingsRow
          label="Fechar launcher ao abrir o jogo"
          description="Libera RAM enquanto você joga."
        >
          <Switch
            checked={settings.closeOnLaunch}
            onCheckedChange={(v) =>
              updateMinecraft((s) => ({
                ...s,
                closeOnLaunch: v,
                detachProcess: v || s.detachProcess,
              }))
            }
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
            value={
              instancePath ||
              settings.gameDirectory ||
              "%APPDATA%\\Aetherion Launcher\\instances\\aetherion-main"
            }
            className="flex-1 h-9 bg-input/40 font-mono text-xs"
          />
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 bg-transparent"
            onClick={() =>
              window.aetherion?.settings
                .openInstanceFolder()
                .catch((err) => console.warn("[aetherion] failed to open instance", err))
            }
          >
            <FolderOpen className="size-4" />
            Abrir
          </Button>
        </div>
      </SettingsSection>
    </>
  )
}
