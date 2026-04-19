import { LoginForm } from "@/components/launcher/login-form"
import { WindowFrame } from "@/components/launcher/window-frame"

export default function LoginPage() {
  return (
    <WindowFrame title="Aetherion Launcher • Login">
      <LoginForm />
    </WindowFrame>
  )
}
