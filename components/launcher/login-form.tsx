"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AlertCircle, ArrowRight, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { addOfflineAccount, validateOfflineUsername } from "@/lib/launcher/accounts"
import type { AccountsState } from "@/lib/launcher/types"
import { AetherionMark } from "./aetherion-mark"

export function LoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return

    const validation = validateOfflineUsername(username)
    if (validation) {
      setError(validation)
      return
    }

    setBusy(true)
    setError(null)

    try {
      if (window.aetherion?.accounts) {
        await window.aetherion.accounts.addOffline(username)
      } else {
        const previewState: AccountsState = { activeId: null, accounts: [] }
        await addOfflineAccount(previewState, username)
      }
      router.push("/launcher")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao criar conta offline.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="h-full w-full grid grid-cols-12">
      <div className="col-span-5 relative border-r border-border/50 bg-[url('/aetherion-bg.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background" />
        <div className="relative h-full flex flex-col justify-between p-10">
          <div className="flex items-center gap-3">
            <AetherionMark size={36} />
            <span className="font-serif text-lg tracking-wider">Aetherion</span>
          </div>
          <div>
            <p className="font-serif text-3xl leading-tight text-foreground text-balance">
              Cruze o veu.
              <br />
              <span className="text-primary">Forje sua lenda.</span>
            </p>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
              Entre em modo offline local. Login Microsoft sera conectado depois,
              com tokens guardados apenas no cofre do sistema.
            </p>
          </div>
        </div>
      </div>

      <div className="col-span-7 relative flex items-center justify-center p-10">
        <Link
          href="/launcher"
          aria-label="Cancelar"
          className="absolute top-6 right-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition"
        >
          <X className="size-4" /> Cancelar
        </Link>

        <div className="w-full max-w-sm">
          <h1 className="font-serif text-2xl tracking-wider text-foreground">Entrar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sua conta fica salva somente neste computador.
          </p>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setError("Login Microsoft sera implementado depois do fluxo offline local.")
            }
            className="mt-8 w-full h-11 justify-center gap-3 border-border/70 bg-card hover:bg-muted"
          >
            <MicrosoftLogo />
            <span className="text-sm font-medium">Continuar com Microsoft</span>
          </Button>

          <div className="flex items-center gap-4 my-6">
            <Separator className="flex-1 bg-border/60" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              ou modo offline
            </span>
            <Separator className="flex-1 bg-border/60" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field>
              <FieldLabel htmlFor="username" className="text-xs uppercase tracking-[0.2em]">
                Nome de usuario
              </FieldLabel>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    setError(null)
                  }}
                  placeholder="Steve"
                  className="pl-10 h-11 bg-input/40 border-border/60"
                  required
                  minLength={3}
                  maxLength={16}
                />
              </div>
              <FieldDescription className="text-[11px]">
                Use 3 a 16 caracteres. Nenhuma senha e pedida ou enviada.
              </FieldDescription>
            </Field>

            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 flex items-start gap-2">
                <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-foreground/90 leading-relaxed">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={busy}
              className="w-full h-11 mt-6 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-serif tracking-[0.2em] aetherion-gold-glow"
            >
              {busy ? "SALVANDO..." : "ENTRAR"}
              <ArrowRight className="size-4" />
            </Button>
          </form>

          <p className="mt-8 text-center text-[10px] text-muted-foreground/70">
            O Aetherion nao armazena dados de conta em servidores proprios.
          </p>
        </div>
      </div>
    </div>
  )
}

function MicrosoftLogo() {
  return (
    <svg viewBox="0 0 23 23" className="size-4" aria-hidden>
      <path fill="#f25022" d="M1 1h10v10H1z" />
      <path fill="#00a4ef" d="M1 12h10v10H1z" />
      <path fill="#7fba00" d="M12 1h10v10H12z" />
      <path fill="#ffb900" d="M12 12h10v10H12z" />
    </svg>
  )
}
