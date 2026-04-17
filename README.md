# Mono — React Mobile Template

Template React + Vite aplicando um tema mobile **monocromático, em pílulas e com grande respiração** (estilo "premium iOS").

## Começando

```bash
npm install
npm run dev       # inicia em http://localhost:5173
npm run build     # build de produção
npm run preview   # serve o build
```

## Estrutura

```
src/
├─ styles/
│  ├─ tokens.css       Design tokens (cores, tipografia, espaçamento, raios)
│  └─ global.css       Reset + utilitários + shell do "device"
├─ components/
│  ├─ Button.jsx       Variantes primary / secondary / ghost / soft, pílula
│  ├─ Card.jsx         Superfície neutra em cantos arredondados (xl/2xl)
│  ├─ ListItem.jsx     + <List/> agrupador estilo iOS
│  ├─ Avatar.jsx       Circular, iniciais ou imagem
│  ├─ Badge.jsx        Pílula com variantes soft / solid / outline
│  ├─ Switch.jsx       iOS-like, monocromático
│  ├─ SegmentedControl.jsx
│  ├─ SearchBar.jsx    Campo pílula
│  ├─ TabBar.jsx       Bottom navigation em formato pílula
│  ├─ StatusBar.jsx    Faux status bar iOS
│  ├─ Header.jsx       Grande título + avatar/ações
│  └─ Icon.jsx         Conjunto mínimo de ícones de linha
└─ pages/
   └─ Home.jsx         Showcase do tema
```

## Tokens (resumo)

| Categoria     | Tokens principais                                              |
| ------------- | -------------------------------------------------------------- |
| Cor / base    | `--color-bg` #F5F5F3 · `--color-surface` #FFFFFF               |
| Cor / texto   | `--color-text` #111 · `--color-text-secondary` #5B5B5B         |
| Cor / ação    | `--color-invert` #111 (botão primário, superfícies invertidas) |
| Raios         | `--radius-lg` 18 · `--radius-xl` 24 · `--radius-pill` 999      |
| Tipografia    | `-apple-system, SF Pro, Inter…` · escala 11→34                 |
| Espaçamento   | Escala de 4px (`--space-1` a `--space-11`)                     |
| Sombras       | `--shadow-xs` → `--shadow-lg`, todas discretas e quentes       |
| Motion        | `--dur-base` 200ms · `--ease-standard` cubic-bezier(.2,.8,.2,1)|

Todos os tokens vivem em `src/styles/tokens.css` e podem ser sobrescritos por
tema, data-attribute ou media query (`prefers-color-scheme: dark`).

## Princípios do tema

1. **Monocromia**: preto tinto sobre off-white. Accents são **sutis** e
   reservados a estados (sucesso/aviso/erro).
2. **Pílulas em toda ação**: botões, switches, search, tab bar, badges —
   `--radius-pill`.
3. **Respiração**: padding generoso (20–24px), hierarquia pela tipografia
   (grandes títulos), não por divisórias agressivas.
4. **Superfícies coerentes**: `surface` (branco) sobre `bg` (off-white), com
   `shadow-inset` (1px) em vez de bordas duras.
5. **Micro-interação**: `transform: scale(.98)` em toque, transições de 120–
   200ms com easing padrão do iOS.

## Próximos passos sugeridos

- Exportar tokens para **Tokens Studio / Figma JSON**.
- Replicar em **Tailwind config** (mapeando `theme.extend.colors`, `borderRadius`, `boxShadow`, `fontFamily`).
- Variantes de **dark mode** (já há uma prévia automática via `data-theme="auto"`).
- Expandir biblioteca: `Input`, `TextArea`, `Modal`, `BottomSheet`, `Empty State`, `Toast`.
