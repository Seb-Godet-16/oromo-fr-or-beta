[README.md](https://github.com/user-attachments/files/29271238/README.md)
# 🐄 Taphad'Meuh — Français ↔ Afaan Oromoo

> **FR** Application bilingue d'apprentissage · **EN** Bilingual learning app · **OR** Appii barachuu afaan lama · **AM** መተግበሪያ ሁለት ቋንቋ

[![PWA](https://img.shields.io/badge/PWA-ready-blueviolet)](#)
[![Vanilla JS](https://img.shields.io/badge/JS-Vanilla-yellow)](#)
[![No dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](#)
[![Offline](https://img.shields.io/badge/offline-ready-blue)](#)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](#)

---

## 🇫🇷 Français

Application web progressive (PWA) pour apprendre le Français ou l'Afaan Oromoo — gratuite, sans inscription, 100 % hors-ligne après la première visite. Zéro dépendance, zéro framework.

## 🇬🇧 English

Progressive Web App (PWA) to learn French or Afaan Oromoo — free, no sign-up, 100% offline after first visit. Zero dependency, zero framework.

## 🇪🇹 Afaan Oromoo

Appii web (PWA) Faransaayii yookiin Afaan Oromoo barachuuf — bilisaa, galmee malee, interneetii malee yeroo hundaa hojjeta. Hirmaannaa yookiin framework hin barbaachisu.

## 🇪🇹 አማርኛ (Amharic)

ፕሮግረሲቭ ዌብ አፕ (PWA) ፈረንሳይኛ ወይም አፋን ኦሮሞ ለመማር — ነፃ፣ ምዝገባ አያስፈልግም፣ ከመጀመሪያ ጉብኝት በኋላ ሙሉ በሙሉ ከመስመር ውጭ ይሰራል።

---

## 📁 Architecture

```
Taphad'Meuh/
│
├── index.html              ← Unique entry point — 4 screens + 2 modals (no logic)
│
├── css/
│   └── style.css           ← All styles — dual theme system (theme-french / theme-oromo)
│
├── js/
│   ├── app.js              ← Full application engine (~3 983 lines, 21 sections)
│   ├── data-fr.js          ← Dataset — "Learn French" mode (48 themes, ~1 428 lines)
│   └── data-or.js          ← Dataset — "Learn Oromo" mode  (48 themes, ~1 383 lines)
│
├── sw.js                   ← Service Worker — Cache First / Network First + SVG fallbacks
├── manifest.json           ← PWA manifest — icons, theme colors, orientation
│
├── img/
│   └── Logo-appli-or-fr.png
└── icons/
    └── icon-*.png          ← PWA icons (72 → 512 px, maskable variants)
```

---

## 🔄 User flow

```
[Launcher]  →  choose language
     │
     ▼
 [Home / Guide]  →  onboarding (first visit per mode)
     │
     ▼
 [Sections]  →  grid of 48 modules  (Niveau 1 ×32 + Niveau 2 ×16)
     │
     ▼
 [Lesson]  →  tabs per module
              ├── 🃏 Cartes Flash   (flip cards + TTS)
              ├── 📖 Vocabulaire    (full word list, clickable)
              ├── 🎯 Quiz           (10 MCQ, auto-generated)
              ├── 💬 Dialogue       (Niveau 2 only — scripted scenes)
              └── 🎤 Répète         (Speech Recognition — mic required)
```

---

## ⚙️ Key technical decisions

| Topic | Choice | Why |
|---|---|---|
| Framework | **None** — vanilla JS (ES5) | Zero build step, works on any host, maximum compatibility |
| Data loading | **Dynamic `<script>` injection** | Only the chosen mode's dataset (~100 KB) is loaded into memory |
| Theme system | **CSS class on `<html>`** (`theme-french` / `theme-oromo`) | Single toggle switches every colour via `var(--c-*)` tokens |
| Persistence | **localStorage** (stars ⭐) + **sessionStorage** (quiz state) | Stars survive restarts; quiz state survives accidental tab switches |
| TTS (Oromo) | **Voice cascade** om-ET → so-SO → am-ET → ha-NG → sw-KE → es-ES | Native Oromo voice absent on most devices; phonetically ranked fallbacks |
| Offline | **Service Worker** — Cache First local, Network First external | Full offline after first visit; SVG placeholders for missing resources |
| PWA | `manifest.json` + SW + `apple-mobile-web-app-*` meta | Installable on Android and iOS without an app store |
| Haptics | `navigator.vibrate()` | Short pulse = correct, double pulse = wrong — silent on unsupported devices |

---

## 🧩 Data structure — Level 1 theme (vocabulary)

```js
{
  id    : 'salutations',   // unique key — used as localStorage progress key
  level : 1,
  emoji : '👋',
  name  : 'Salutations',  // displayed in source language
  sub   : 'Nagaa gaafachuu / Salutations',
  words : [
    { et: 'Nagaa', fr: 'Bonjour', em: '☀️' },
    { et: 'Nagaatti', fr: 'Au revoir', em: '👋',
      conj: {              // optional — verbs only
        et: ['...6 conjugated forms...'],
        fr: ['...6 conjugated forms...']
      }
    }
  ]
}
```

## 🧩 Data structure — Level 2 theme (dialogue)

```js
{
  id        : 'marche',
  level     : 2,
  type      : 'dialog',
  emoji     : '🛒',
  name      : 'Au marché',
  sub       : 'Gabaa / Au marché',
  situations: [
    {
      label   : 'Sit. 1',
      title   : 'Acheter des légumes',
      img     : '🥕',
      dialogue: [
        { s: 'Vendeur', et: 'Maalan si gargaaruu?', fr: 'Que puis-je faire pour vous ?', side: 'left' },
        { s: 'Client',  et: 'Dinnicha barbaada.',   fr: 'Je voudrais des pommes de terre.', side: 'right' }
      ]
    }
  ],
  vocab : ['Dinnicha = Pomme de terre', 'Gabaa = Marché'],
  quiz  : [{ q: '...', opts: ['A','B','C','D'], ans: 0 }]
}
```

---

## 🌍 Bilingual logic — the `L()` function

Every UI string goes through a single selector function. No duplicated `if/else` blocks anywhere in the codebase:

```js
// Returns `fr` value in learn_french mode, `et` value in learn_oromo mode
function L(fr, et) {
  return currentMode === 'learn_french' ? fr : et;
}

// Usage — any label, tip, button text:
button.textContent = L('Commencer', 'Jalqabi');
title.textContent  = L('Modules 📚', 'Moojuulota 📚');
```

Language of the UI = **native language of the learner** (inverse of what they are learning).

---

## ⭐ Star / progress system

```
Score ≥ 50%  →  ⭐      (module unlocked)
Score ≥ 75%  →  ⭐⭐
Score = 100% →  ⭐⭐⭐

Rule : stars never decrease — only the personal best is kept.
Storage key  : 'pe_om_fr_done_v1'  (learn_french mode)
               'pe_fr_om_done_v1'  (learn_oromo  mode)
Format       : [{ id: 'theme_id', stars: 1|2|3 }, …]
```

---

## 🛠️ Service Worker strategy

```
GET request
    │
    ├─ External URL? (fonts, CDN, api.)
    │       └─ Network First → cache fallback → 503
    │
    └─ Local resource?
            ├─ Navigation (HTML)  → Cache First → offline page (HTML inline)
            ├─ PWA icon           → Cache First → SVG icon placeholder
            ├─ Raster image       → Cache First → SVG image placeholder
            └─ Other (JS/CSS)     → Cache First → network fallback
```

Cache name is auto-versioned by GitHub Actions (`GITHUB_RUN_NUMBER`) on every deploy — no manual cache busting needed.

---

## 🗂️ Notes de maintenabilité

### `app.js` — fichier unique volontairement monolithique

Le moteur applicatif tient dans un seul fichier (~3 900 lignes, 21 sections commentées).
Ce choix est délibéré : zéro étape de build, compatibilité maximale, hébergement statique sans bundler.

Si le projet grossit significativement, une migration vers des modules ES (`import`/`export`) est envisageable. Elle nécessiterait :
- un serveur de développement local (les modules ES ne fonctionnent pas en `file://`)
- un bundler ou un `<script type="module">` avec les bons en-têtes CORS
- de reprendre les fonctions exposées globalement (ex : `onclick="flipCard()"` dans le HTML généré dynamiquement)

Pour l'instant, la section `SECTIONS DE CE FICHIER` en tête de `app.js` et les commentaires `// §N` suffisent à naviguer rapidement.

### Alphabet — quiz `quiz10[]` statique vs génération dynamique

Les autres thèmes de Niveau 1 génèrent leurs questions à la volée depuis `words[]` (algorithme Fisher-Yates dans `_generateQuiz()`). Le thème `alpha` fait exception et utilise un tableau `quiz10[]` défini manuellement dans chaque fichier de données :

| Fichier | Langue du quiz | Spécificité |
|---|---|---|
| `data-fr.js` → `quiz10` | Questions en Afaan Oromoo | Sons français difficiles : C, E, Q, X, V, Z… |
| `data-or.js` → `quiz10` | Questions en Français | Sons oromo difficiles : DH, CH, NY, Q, X, SH, PH… |

**Pourquoi statique ?** Le quiz alphabet est un **quiz audio** ("quelle lettre entendez-vous ?"). Les distracteurs doivent être phonétiquement proches (ex : `C / K / CH / G`), ce qu'un mélange aléatoire parmi les 26–33 lettres ne garantit pas.

**⚠️ Point d'attention pour les futurs contributeurs :** si vous ajoutez ou supprimez des lettres dans `words[]` du thème `alpha`, pensez à mettre à jour `quiz10[]` dans le même fichier pour maintenir la cohérence.

---



**Sébastien Godet** — sebastien.godet16@gmail.com · [LinkedIn](https://www.linkedin.com/in/sébastien-godet-142ba6145)

Built with the assistance of **Claude Sonnet 4.6** (Anthropic) and **Gemini 3.5 Flash** (Google).

Special thanks to **Fédérico Calo** (web architecture) and **Mussa Sembro** (Oromo translations & linguistic review).

---

*© Juin 2026 — Sébastien Godet*