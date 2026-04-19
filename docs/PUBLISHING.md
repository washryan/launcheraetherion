# Publicação do modpack com GitHub Releases + Pages

Custo: **zero**. Limites práticos: assets de release podem ter até **2 GB** cada e você tem
quota abundante de download. Perfeito para um modpack.

---

## 1) Estrutura de repositórios

Você vai ter dois repos, ambos públicos:

```
aetherion-network/
├── aetherion-launcher          ← código do launcher (Electron)
└── aetherion-launcher-assets   ← modpack + manifest
```

No `aetherion-launcher-assets`:

- **Releases** armazenam os `.jar` pesados (mods, forge installer).
- **GitHub Pages** (branch `gh-pages` ou pasta `/docs` da branch main) serve o
  `manifest.json` e o site estático.

---

## 2) Gerar uma nova versão (ex: v0.3)

### 2.1 Monte a pasta local

```
pack-v0.3/
├── forge-1.19.2-43.3.13-installer.jar
├── mods/
│   ├── required/
│   │   ├── aetherion-core-2.4.1.jar
│   │   ├── create-0.5.1f.jar
│   │   └── jei-11.6.0.jar
│   └── optional/
│       ├── journeymap-5.9.7.jar
│       └── soundphysics-1.1.6.jar
└── config/
    └── aetherion-common.toml
```

### 2.2 Gere o manifest com hashes reais

```bash
node scripts/build-manifest.mjs \
  --version 0.3 \
  --mc 1.19.2 \
  --forge 43.3.13 \
  --in ./pack-v0.3 \
  --out ./manifest.json \
  --owner aetherion-network \
  --repo aetherion-launcher-assets
```

O script calcula `sha256` e `size` de cada arquivo e preenche as URLs no formato
`https://github.com/{owner}/{repo}/releases/download/v0.3/{filename}`.

### 2.3 Crie o release no GitHub

Via **gh CLI** (recomendado — uma linha só):

```bash
cd pack-v0.3
gh release create v0.3 \
  --repo aetherion-network/aetherion-launcher-assets \
  --title "Aetherion v0.3" \
  --notes-file ../CHANGELOG-v0.3.md \
  forge-1.19.2-43.3.13-installer.jar \
  mods/required/*.jar \
  mods/optional/*.jar \
  config/*.toml
```

Ou via interface web: `Releases → Draft a new release → Upload assets`.

### 2.4 Publique o manifest

O `manifest.json` **não** vai como asset do release — vai no GitHub Pages para
ser servido como JSON público com URL estável.

Opção A (pasta `/docs` na branch main — mais simples):

```bash
cp manifest.json docs/
git add docs/manifest.json
git commit -m "chore(pack): publish manifest v0.3"
git push
```

Depois em `Settings → Pages → Source`: `main` / `/docs`.

A URL pública será:
`https://aetherion-network.github.io/aetherion-launcher-assets/manifest.json`

Opção B (branch dedicada `gh-pages`):

```bash
git checkout --orphan gh-pages
git rm -rf .
cp ../manifest.json .
git add manifest.json
git commit -m "publish v0.3"
git push origin gh-pages
```

---

## 3) URLs finais

| Recurso | URL |
|---|---|
| Manifest | `https://aetherion-network.github.io/aetherion-launcher-assets/manifest.json` |
| Mod `create-0.5.1f.jar` | `https://github.com/aetherion-network/aetherion-launcher-assets/releases/download/v0.3/create-0.5.1f.jar` |
| Forge installer | `https://github.com/.../releases/download/v0.3/forge-1.19.2-43.3.13-installer.jar` |
| Página do release (changelog) | `https://github.com/.../releases/tag/v0.3` |

O launcher lê **apenas** a URL do manifest — todas as outras URLs chegam dentro
dele. Para apontar para outro repo, mude `AETHERION_HOSTING` em
`lib/launcher/github-releases.ts`.

---

## 4) Cache e cache-busting

GitHub Pages coloca `Cache-Control: max-age=600` no `manifest.json`. O launcher
já adiciona `?t={timestamp}` em cada fetch (ver `fetchManifest`) então você
nunca pega versão antiga. Os **assets de release** têm URLs imutáveis por tag
(`v0.3/x.jar` nunca muda), então podem ser cacheados forever.

---

## 5) Atualização incremental — como funciona

1. Launcher baixa `manifest.json` (pequeno, alguns KB).
2. Escaneia a pasta local `Aetherion/mods/` e calcula SHA-256 de cada `.jar`.
3. Para cada entrada do manifest:
   - se hash local == hash remoto → `skip`
   - senão → baixa de GitHub Releases e valida SHA-256 após download.
4. Arquivos que saíram do manifest e não são drop-ins → `remove`.

Resultado: uma atualização entre v0.3 → v0.4 que troca 2 mods baixa só esses
2 arquivos, não o modpack inteiro.

---

## 6) Rate limits

- **GitHub Releases (downloads):** sem rate limit documentado. Contas pessoais
  conseguem servir dezenas de milhares de downloads/mês sem problemas.
- **GitHub Pages:** 100 GB de soft bandwidth/mês. Como `manifest.json` tem
  poucos KB, é virtualmente ilimitado.
- **GitHub API (se usar):** 60 req/h sem token, 5.000 req/h com token. O
  launcher não precisa de API — acessa tudo via CDN direta.

---

## 7) Assinatura de código do launcher (Windows)

Sem assinatura, o Windows SmartScreen mostra aviso na primeira execução.
Opções:

- **SignPath.io (gratuito para OSS)** — o mais barato, exige o projeto ser
  aberto.
- **Certum CodeSign para OSS** — ~35 EUR/ano.
- **Não assinar** — usuários clicam em "Mais informações → Executar assim mesmo".

Assinatura não é requisito técnico, só reduz atrito no primeiro download.
