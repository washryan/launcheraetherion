import { SettingsPage } from "@/components/launcher/settings-shell"
import { AccountTab } from "@/components/settings/account-tab"

export default function AccountPage() {
  return (
    <SettingsPage
      title="Configurações da conta"
      description="Adicione, remova ou selecione a conta ativa. Contas Microsoft e offline coexistem."
    >
      <AccountTab />
    </SettingsPage>
  )
}
