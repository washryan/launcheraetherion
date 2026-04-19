import { SettingsPage } from "@/components/launcher/settings-shell"
import { JavaTab } from "@/components/settings/java-tab"

export default function JavaPage() {
  return (
    <SettingsPage
      title="Configurações Java"
      description="Gerencie memória, executável e argumentos JVM. O launcher seleciona a versão correta automaticamente por instância."
    >
      <JavaTab />
    </SettingsPage>
  )
}
