# PyF26 — Architecture Overview

> **Stack:** React 18 · TypeScript 5.6 · Vite 6 · Tailwind CSS 3
> **Hosting:** GitHub Pages · **CI/CD:** GitHub Actions · **Analytics:** Google Analytics 4

---

## 1. Deployment & Infrastructure

End-to-end flow from code commit to the player's browser.

```mermaid
flowchart LR
    DEV(["👨‍💻 Developer\npush to master"])

    subgraph GITHUB ["GitHub"]
        REPO[("Repository\nlpavia/PyF26")]
        subgraph ACTIONS ["GitHub Actions — deploy.yml"]
            direction TB
            A1["1 · checkout"]
            A2["2 · setup Node 20"]
            A3["3 · npm ci"]
            A4["4 · npm run build\ntsc -b + vite build"]
            A5["5 · upload dist/"]
            A1 --> A2 --> A3 --> A4 --> A5
        end
        PAGES["GitHub Pages\nlpavia.github.io/PyF26"]
    end

    subgraph BROWSER ["User's Browser"]
        HTML["index.html\n(entry point)"]
        APP["React SPA\n(JS bundle)"]
        CSS["Tailwind styles\n(CSS bundle)"]
    end

    GA(["📊 Google Analytics 4\nG-144NJM1RWB"])

    DEV --> REPO
    REPO --> ACTIONS
    A5 --> PAGES
    PAGES -->|"HTTPS — static assets"| HTML
    HTML --> APP
    HTML --> CSS
    HTML -.->|"gtag.js beacon"| GA
```

---

## 2. Application Layers

Internal structure of the React SPA running in the browser. No backend exists — all logic runs client-side.

```mermaid
flowchart TB
    subgraph ENTRY ["Entry"]
        IDX["index.html"]
        MAIN["main.tsx\nReactDOM.createRoot"]
        APP["App.tsx\nbg-indigo-950 wrapper"]
        IDX --> MAIN --> APP
    end

    subgraph UI ["UI Layer — React Components"]
        direction TB
        GB["GameBoard.tsx\norchestrator"]

        subgraph INPUT ["Input"]
            GI["GuessInput.tsx\n4-digit display + keyboard events"]
            NP["NumPad.tsx\n3×4 button grid"]
            GI --> NP
        end

        subgraph HISTORY ["History"]
            GL["GuessList.tsx\nscrollable list"]
            GR["GuessRow.tsx\ndigit chips + F/• chips"]
            GL --> GR
        end

        subgraph OVERLAYS ["Overlays"]
            GOO["GameOverOverlay.tsx\nwin / lose modal"]
            HO["HelpOverlay.tsx\nrules modal"]
        end

        AB["AttemptsBar.tsx\n10 progress dots"]

        GB --> INPUT
        GB --> HISTORY
        GB --> OVERLAYS
        GB --> AB
    end

    subgraph STATE ["State Layer — React Hook"]
        HK["useGame.ts\nsecret · records · status\nresetCount · submitGuess · resetGame"]
    end

    subgraph LOGIC ["Game Logic — Pure TypeScript"]
        direction LR
        GEN["generateSecret()"]
        VAL["isValidGuess()"]
        SCR["scoreGuess()"]
        VER["getDigitVerdicts()"]
        DRV["deriveStatus()"]
    end

    subgraph STYLE ["Styling"]
        TW["Tailwind CSS v3\nJIT utility classes"]
        ANI["index.css\nslide-in · shake · scale-in"]
    end

    APP --> GB
    GB --> HK
    HK --> LOGIC
    UI -.->|"Tailwind classes"| STYLE
```

---

## 3. Component Data Flow

How state and events move between components during a game turn.

```mermaid
flowchart TD
    HK(["useGame hook\n(secret, records, status,\nresetCount, submitGuess, resetGame)"])

    GB["GameBoard"]

    HK -->|"records, status, maxAttempts"| AB["AttemptsBar\n▸ renders used/total dots"]
    HK -->|"records"| GL["GuessList\n▸ renders guess history"]
    HK -->|"status, submitGuess"| GI["GuessInput\n▸ manages digit state\n▸ validates on submit"]
    HK -->|"status, secret, resetGame"| GOO["GameOverOverlay\n▸ shows on won / lost"]
    HK -->|"resetGame"| GB

    GB -->|"key={resetCount}\nforces remount on reset"| GI

    GI -->|"digit clicks"| NP["NumPad\n▸ ⌫ · 0–9 · ✓"]
    NP -->|"onDigit / onBackspace / onSubmit"| GI
    GI -->|"submitGuess(guess)"| HK

    GL -->|"record, index"| GR["GuessRow\n▸ digit chips (slate)\n▸ F chips (fuchsia)\n▸ • chips (amber)"]

    GOO -->|"onReset → resetGame()"| HK

    HELP["HelpOverlay\n▸ static rules text\n▸ no game state"]
    GB -->|"showHelp state"| HELP
```

---

## 4. File Map

```
PyF26/
├── index.html                  ← entry, GA tag, theme-color, viewport-fit
├── vite.config.ts              ← base: '/PyF26/', react plugin
├── tailwind.config.js          ← content glob: src/**/*.{ts,tsx}
├── postcss.config.js
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── .github/
│   └── workflows/
│       └── deploy.yml          ← CI/CD: build → GitHub Pages
└── src/
    ├── main.tsx                ← ReactDOM.createRoot
    ├── App.tsx                 ← root layout (bg-indigo-950)
    ├── index.css               ← Tailwind directives + keyframes
    ├── vite-env.d.ts
    ├── game/
    │   └── logic.ts            ← pure TS: generateSecret, scoreGuess, deriveStatus…
    ├── hooks/
    │   └── useGame.ts          ← all game state (React hook)
    └── components/
        ├── GameBoard.tsx       ← orchestrator, fixed-height card
        ├── GuessInput.tsx      ← 4-box display + keyboard listener
        ├── NumPad.tsx          ← mobile number pad
        ├── GuessList.tsx       ← scrollable history
        ├── GuessRow.tsx        ← single attempt row
        ├── AttemptsBar.tsx     ← 10-dot progress indicator
        ├── GameOverOverlay.tsx ← win/lose modal
        └── HelpOverlay.tsx     ← rules modal
```

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| No backend | All logic is deterministic and runs safely in the browser — no server needed |
| Pure functions in `logic.ts` | Keeps game rules testable and completely decoupled from React |
| `status` derived, never stored | Eliminates state sync bugs — single source of truth is `records[]` |
| `key={resetCount}` on GuessInput | Forces full remount on reset, clearing digit state without prop drilling |
| `base: '/PyF26/'` in Vite | Required for correct asset paths on GitHub Pages subdirectory hosting |
| `viewport-fit=cover` + `theme-color` | Fills mobile safe-area zones (status bar, home indicator) with app background |
