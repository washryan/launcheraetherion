import { SettingsPage } from "@/components/launcher/settings-shell"
import { LauncherTab } from "@/components/settings/launcher-tab"

export default function LauncherPage() {
  return (
    <SettingsPage
      title="Configurações do Launcher"
      description="Comportamento do próprio Aetherion: atualizações, armazenamento e ferramentas."
    >
      <LauncherTab />
    </SettingsPage>
  )
}
