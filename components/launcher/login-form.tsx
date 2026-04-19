"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowRight, Lock, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { AetherionMark } from "./aetherion-mark"

/**
 * LoginForm — tela de autenticação.
 *
 * Duas rotas de login:
 *  1. OFFLINE/PIRATA: usuário digita nick, senha em branco → cria Account local com UUID v3 derivado do nick
 *  2. MICROSOFT: botão dedicado → abre OAuth device code flow numa janela externa
 *
 * Fase 5: `handleSubmit` chamará `window.aetherion.accounts.addOffline(username)`
 * ou `window.aetherion.accounts.startMicrosoftAuth()` via IPC.
 */
export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(true)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO (Fase 2): integrar com camada de contas
  }

  return (
    <div className="h-full w-full grid grid-cols-12">
      {/* Coluna esquerda — arte */}
      <div className="col-span-5 relative border-r border-border/50 bg-[url('/aetherion-bg.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background" />
        <div className="relative h-full flex flex-col justify-between p-10">
          <div className="flex items-center gap-3">
            <AetherionMark size={36} />
            <span className="font-serif text-lg tracking-wider">Aetherion</span>
          </div>
          <div>
            <p className="font-serif text-3xl leading-tight text-foreground text-balance">
              Cruze o véu.
              <br />
              <span className="text-primary">Forje sua lenda.</span>
            </p>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
              Acesse o reino etéreo com sua conta Microsoft ou entre em modo offline para
              explorar livremente.
            </p>
          </div>
        </div>
      </div>

      {/* Coluna direita — formulário */}
      <div className="col-span-7 relative flex items-center justify-center p-10">
        <Link
          href="/"
          aria-label="Cancelar"
          className="absolute top-6 right-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition"
        >
          <X className="size-4" /> Cancelar
        </Link>

        <div className="w-full max-w-sm">
          <h1 className="font-serif text-2xl tracking-wider text-foreground">Entrar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Bem-vindo de volta ao Aetherion.
          </p>

          {/* Microsoft */}
          <Button
            type="button"
            variant="outline"
            className="mt-8 w-full h-11 justify-center gap-3 border-border/70 bg-card hover:bg-muted"
          >
            <MicrosoftLogo />
            <span className="text-sm font-medium">Continuar com Microsoft</span>
          </Button>

          {/* Separador */}
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
                Nome de usuário
              </FieldLabel>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Steve"
                  className="pl-10 h-11 bg-input/40 border-border/60"
                  required
                  minLength={3}
                  maxLength={16}
                />
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="password" className="text-xs uppercase tracking-[0.2em]">
                Senha
              </FieldLabel>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Deixe em branco para pirata"
                  className="pl-10 h-11 bg-input/40 border-border/60"
                />
              </div>
              <FieldDescription className="text-[11px]">
                Sua senha é enviada diretamente ao Mojang e nunca armazenada.
              </FieldDescription>
            </Field>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <Checkbox
                  checked={remember}
                  onCheckedChange={(v) => setRemember(v === true)}
                  className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-xs text-muted-foreground">Lembrar-me</span>
              </label>
              <Link href="#" className="text-xs text-muted-foreground hover:text-primary">
                Esqueceu sua senha?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-11 mt-6 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-serif tracking-[0.2em] aetherion-gold-glow"
            >
              ENTRAR
              <ArrowRight className="size-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Precisa de uma conta?{" "}
            <Link href="#" className="text-primary hover:underline">
              Criar agora
            </Link>
          </p>
          <p className="mt-8 text-center text-[10px] text-muted-foreground/70">
            Este launcher não é afiliado à Mojang AB.
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
