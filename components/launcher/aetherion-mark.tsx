import { cn } from "@/lib/utils"

/**
 * AetherionMark — marca gráfica do launcher.
 * Um "A" com serifa medieval dentro de um anel dourado.
 * Mantido como SVG inline para ficar nítido em qualquer tamanho e
 * colorível via currentColor.
 */
export function AetherionMark({
  className,
  size = 40,
}: {
  className?: string
  size?: number
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={cn("text-primary", className)}
      aria-label="Aetherion"
      role="img"
    >
      <defs>
        <radialGradient id="ae-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* glow */}
      <circle cx="32" cy="32" r="30" fill="url(#ae-glow)" />

      {/* anel externo */}
      <circle
        cx="32"
        cy="32"
        r="26"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        opacity="0.7"
      />
      {/* anel interno */}
      <circle
        cx="32"
        cy="32"
        r="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.6"
        opacity="0.35"
      />

      {/* marcas cardeais */}
      <g stroke="currentColor" strokeWidth="1" opacity="0.55">
        <line x1="32" y1="4" x2="32" y2="10" />
        <line x1="32" y1="54" x2="32" y2="60" />
        <line x1="4" y1="32" x2="10" y2="32" />
        <line x1="54" y1="32" x2="60" y2="32" />
      </g>

      {/* Letra A estilizada */}
      <path
        d="M32 16 L22 46 L26 46 L28.5 39 L35.5 39 L38 46 L42 46 L32 16 Z M30 35 L32 28 L34 35 Z"
        fill="currentColor"
      />
    </svg>
  )
}
