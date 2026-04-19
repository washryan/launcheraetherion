"use client"

import { useState } from "react"
import { CheckCircle2, Coffee, Download, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { SettingsSection } from "@/components/launcher/settings-shell"
import { DEFAULT_SETTINGS, MOCK_MANIFEST_PREVIEW } from "@/lib/launcher/mock-data"

const TOTAL_SYSTEM_RAM_MB = 32 * 1024

export function JavaTab() {
  const [java, setJava] = useState(DEFAULT_SETTINGS.java)

  const maxGb = java.maxRamMb / 1024
  const minGb = java.minRamMb / 1024
  const totalGb = TOTAL_SYSTEM_RAM_MB / 1024

  return (
    <>
      <SettingsSection
        title="Memória"
        description={`Total do sistema: ${totalGb.toFixed(1)} GB. Recomendado: 6–10 GB para modpacks.`}
      >
        <div className="rounded-lg border border-border/50 bg-card/40 p-5 space-y-6">
          <MemorySlider
            label="RAM máxima"
            value={java.maxRamMb}
            min={2048}
            max={TOTAL_SYSTEM_RAM_MB}
            onChange={(v) =>
              setJava((s) => ({ ...s, maxRamMb: Math.max(v, s.minRamMb) }))
            }
            display={`${maxGb.toFixed(1)} GB`}
          />
          <MemorySlider
            label="RAM mínima"
            value={java.minRamMb}
            min={1024}
            max={java.maxRamMb}
            onChange={(v) => setJava((s) => ({ ...s, minRamMb: v }))}
            display={`${minGb.toFixed(1)} GB`}
          />
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/40">
            <MemoryStat label="Alocada" value={`${maxGb.toFixed(1)} GB`} accent />
            <MemoryStat label="Mínima" value={`${minGb.toFixed(1)} GB`} />
            <MemoryStat label="Sistema" value={`${totalGb.toFixed(1)} GB`} />
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Definir o mesmo valor em mínimo e máximo pode reduzir lag em alguns casos.
        </p>
      </SettingsSection>

      <SettingsSection
        title="Executável Java"
        description="O launcher valida o binário antes de iniciar o jogo. Deve terminar com bin/javaw.exe (Windows) ou bin/java (Linux/macOS)."
      >
        <div className="rounded-lg border border-border/50 bg-card/40 p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="size-9 inline-flex items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
              <CheckCircle2 className="size-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Java 17 detectado{" "}
                <span className="text-muted-foreground font-normal">(Temurin)</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Recomendado para Minecraft {MOCK_MANIFEST_PREVIEW.minecraft} (Forge{" "}
                {MOCK_MANIFEST_PREVIEW.forgeVersion}) — major ≥ 17
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Coffee className="size-4 text-muted-foreground shrink-0" />
            <Input
              readOnly
              value={java.executablePath ?? ""}
              className="flex-1 h-9 bg-input/40 font-mono text-xs"
            />
            <Button variant="outline" size="sm" className="h-9 gap-2 bg-transparent">
              <FolderOpen className="size-4" />
              Escolher
            </Button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <p className="text-xs text-muted-foreground">
              Se não houver Java compatível instalado, baixamos para você.
            </p>
            <Button variant="ghost" size="sm" className="h-8 gap-2 text-primary">
              <Download className="size-4" />
              Baixar runtime
            </Button>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Opções JVM Adicionais"
        description="Argumentos passados ao processo Java. Use com cuidado."
      >
        <Textarea
          value={java.jvmArgs}
          onChange={(e) => setJava((s) => ({ ...s, jvmArgs: e.target.value }))}
          className="min-h-[96px] bg-input/40 font-mono text-xs"
          spellCheck={false}
        />
      </SettingsSection>
    </>
  )
}

function MemorySlider({
  label,
  value,
  min,
  max,
  onChange,
  display,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
  display: string
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </label>
        <span className="text-sm font-mono text-primary">{display}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={512}
        onValueChange={([v]) => onChange(v)}
      />
    </div>
  )
}

function MemoryStat({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
      <p className={`mt-1 text-lg font-serif ${accent ? "text-primary" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  )
}
