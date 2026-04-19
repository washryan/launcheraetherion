import { SettingsPage } from "@/components/launcher/settings-shell"
import { MinecraftTab } from "@/components/settings/minecraft-tab"

export default function MinecraftPage() {
  return (
    <SettingsPage
      title="Configurações do Minecraft"
      description="Opções relacionadas à inicialização do jogo."
    >
      <MinecraftTab />
    </SettingsPage>
  )
}
