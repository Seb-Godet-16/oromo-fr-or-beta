[README.md](https://github.com/user-attachments/files/29271238/README.md)
# 🐄 Taphad'Meuh — Français ↔ Afaan Oromoo

> **FR** Application bilingue d'apprentissage · **EN** Bilingual learning app · **OR** Appii barachuu afaan lama · **AM** መተግበሪያ ሁለት ቋንቋ

[![PWA](https://img.shields.io/badge/PWA-ready-blueviolet)](#)
[![Vanilla JS](https://img.shields.io/badge/JS-Vanilla-yellow)](#)
[![ES2020](https://img.shields.io/badge/ES-2020-orange)](#)
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
├── index.html              ← Unique entry point — 5 screens + 4 modals (no logic)
│
├── css/
│   └── style.css           ← All styles — dual theme system (theme-french / theme-oromo)
│
├── js/
│   ├── app.js              ← Full application engine (6 549 lines, 21 sections)
│   ├── data-fr.js          ← Dataset — "Learn French" mode (53 themes, 1 532 lines)
│   └── data-or.js          ← Dataset — "Learn Oromo" mode  (53 themes, 1 487 lines)
│
├── sw.js                   ← Service Worker — Cache First / Network First + SVG fallbacks
├── manifest.json           ← PWA manifest — icons, theme colors, orientation
│
├── img/
│   ├── Logo-appli-or-fr.png
│   └── icons/
│       └── icon-*.png      ← PWA icons (72 → 512 px, maskable variants)
```

*Chiffres resynchronisés le 30/08/2026 (voir Bilan technique §6.31) — ce bloc n'avait pas suivi les mises à jour de contenu successives (52→53 thèmes, lignes) depuis sa dernière mise à jour ; `style.css` et `sw.js` non chiffrés ici, voir Bilan technique §2 pour le détail complet par fichier.*

---

## 🔄 User flow

```
[Launcher]  →  choose language
     │
     ▼
   [Home]  →  dashboard + bilingual explanatory guide, ONE merged screen
              (dashboard: Start/Continue button + progress card(s) ;
               guide: accordions, reachable any time via 📚/Guide nav)
     │
     ▼
 [Sections]  →  grid of 53 modules  (Niveau 1 ×37 + Niveau 2 ×16)
              🆕 (29/08/2026) BOTH levels grouped into collapsible
              categories with their own "▶ Continue" card — Niveau 1
              into 6 categories (🌱🔢😊🏠🍽️🌍), Niveau 2 into 4
              (👋🎉🧳⛅, deliberately different emojis)
     │
     ▼
 [Lesson]  →  tabs per module
              ├── 🃏 Cartes Flash   (flip cards + TTS)
              ├── 📖 Vocabulaire    (full word list, clickable)
              ├── 🎯 Quiz           (10 MCQ, auto-generated)
              ├── 💬 Dialogue       (Niveau 2 only — scripted scenes)
              └── 🎤 Répète         (Speech Recognition — mic required)
```

**🆕 (24/07/2026, agencement VACHÉBO)** `Home` and `Guide` are a single merged screen (`#home`) — not two separate screens as an earlier same-day fix had briefly made them (that intermediate split caused a two-step, unnatural navigation). The layout follows the sister app VACHÉBO: logo → flags → title → subtitle → badges → install prompt → Commencer/PDF → guide accordions. "Commencer" starts the modules and marks that mode as onboarded (each mode's guide auto-shows on its own very first visit; later launches skip straight to Modules).

**Back navigation (Sections / Lesson screens)** — a dedicated icon row lets the learner jump straight to any destination:

```
[Sections/Lesson]  ──🏠──▶  [Launcher]   (choose Français / Oromo again)
                    ──❓──▶  [Home]       (same merged screen, guide part)
                    ──📚──▶  [Sections]  (jump back to the modules grid)
                    ──🚪──▶  quit confirmation modal
```

**🆕 (25/07/2026)** On the Launcher, before any language is chosen, the bottom nav's ❓ Guide and 📚 Modules icons are visibly dimmed — tapping them now explains why (a small bilingual popup) instead of silently doing nothing: a language must be picked first, after which both work normally from anywhere.

---

## ⚙️ Key technical decisions

| Topic | Choice | Why |
|---|---|---|
| Framework | **None** — vanilla JS (**ES2020 max.**) | Zero build step, works on any host ; ES2020 = plafond de compatibilité choisi pour rester natif sur iOS Safari 14.5+ sans bundler ni transpileur |
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

**Home screen — progress card(s).** The dashboard shows one circular progress
card (flag + % + stars + modules count) per learning path that has at least
one completed module — read from *both* `localStorage` keys, regardless of
which mode is currently active :

```
No path started        →  no card at all (nothing to show yet)
Only 1 path started    →  1 card, for that path (active OR the other one)
Both paths started     →  2 cards side by side (🇫🇷 and 🇪🇹), since the
                           numbers differ between the two
```

The "other" path's total theme count (52) is a fixed constant
(`_TOTAL_THEMES_PER_MODE` in `app.js`) rather than read from its dataset —
avoids injecting the other mode's `data-*.js` file just to display a stat.

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

Le moteur applicatif tient dans un seul fichier (5 905 lignes, 21 sections commentées).
Ce choix est délibéré : zéro étape de build, compatibilité maximale, hébergement statique sans bundler.

Si le projet grossit significativement, une migration vers des modules ES (`import`/`export`) est envisageable. Elle nécessiterait :
- un serveur de développement local (les modules ES ne fonctionnent pas en `file://`)
- un bundler ou un `<script type="module">` avec les bons en-têtes CORS
- de reprendre les fonctions exposées globalement (ex : `onclick="flipCard()"` dans le HTML généré dynamiquement)

Pour l'instant, la section `SECTIONS DE CE FICHIER` en tête de `app.js` et les commentaires `// §N` suffisent à naviguer rapidement.

### Cible JS — ES2020 maximum, aucun transpileur

L'ensemble des fichiers `.js` du projet (`app.js`, `sw.js`, `data-fr.js`, `data-or.js`) est écrit en **ES2020 strict** : `const`/`let` uniquement (plus aucun `var`), fonctions fléchées pour tous les callbacks anonymes, et optional chaining (`?.`) partout où une chaîne de vérifications `a && a.b` existait auparavant.

**Pourquoi ES2020 et pas plus récent ?** C'est le plafond de compatibilité qui garantit un fonctionnement natif sur **iOS Safari 14.5+**, sans navigateur intermédiaire, bundler ou transpileur (Babel, etc.) — cohérent avec le choix "zéro dépendance" du projet. Les apprenants du mode Oromo utilisent majoritairement des smartphones récents ; c'est côté Français que la compatibilité descendante est surveillée. Cette règle est rappelée en commentaire en tête de chaque fichier `.js` concerné.

**Pour les futurs contributeurs :** avant d'introduire une syntaxe plus récente (`replaceAll`, `??=`, `Array.prototype.at`, classes avec champs privés `#x`, etc.), vérifier sa disponibilité sur Safari 14.5 (voir [caniuse.com](https://caniuse.com)) ou repousser volontairement le plafond de compatibilité — mais alors mettre à jour ce paragraphe et les en-têtes de fichiers en conséquence.

### Alphabet — quiz `quiz10[]` statique vs génération dynamique

Les autres thèmes de Niveau 1 génèrent leurs questions à la volée depuis `words[]` (algorithme Fisher-Yates dans `_generateQuiz()`). Le thème `alpha` fait exception et utilise un tableau `quiz10[]` défini manuellement dans chaque fichier de données :

| Fichier | Langue du quiz | Spécificité |
|---|---|---|
| `data-fr.js` → `quiz10` | Questions en Afaan Oromoo | Sons français difficiles : C, E, Q, X, V, Z… |
| `data-or.js` → `quiz10` | Questions en Français | Sons oromo difficiles : DH, CH, NY, Q, X, SH, PH… |

**Pourquoi statique ?** Le quiz alphabet est un **quiz audio** ("quelle lettre entendez-vous ?"). Les distracteurs doivent être phonétiquement proches (ex : `C / K / CH / G`), ce qu'un mélange aléatoire parmi les 26–33 lettres ne garantit pas.

**⚠️ Point d'attention pour les futurs contributeurs :** si vous ajoutez ou supprimez des lettres dans `words[]` du thème `alpha`, pensez à mettre à jour `quiz10[]` dans le même fichier pour maintenir la cohérence.

---

## 🕓 Historique du projet

*Historique commun aux 2 applications — VACHÉBO (français-espagnol) et Taphad'Meuh (français-oromo).*

| Période | Étape |
|---|---|
| 07/06/2026 → 29/06/2026 | Versions Bêta créées avec IA Claude Sonnet 4.6 et Gemini 3.5 Flash |
| 29/06/2026 → 08/07/2026 | Recettages et correctifs avec IA Claude Sonnet 5 et Gemini 3.5 Flash |
| 08/07/2026 → 12/07/2026 | Retours d'expériences utilisateurs (Christophe, Maman, Moi) avec des correctifs réalisés avec IA Claude Sonnet 5 |
| 18/07/2026 → 25/07/2026 | Retours d'expérience utilisatrice Sandrine avec des correctifs réalisés avec IA Claude Sonnet 5 |
| 27/08/2026 → 31/08/2026 | Retours d'expérience utilisateur Mussa et Moi avec des correctifs réalisés avec IA Claude Sonnet 5 |
| 05/09/2026 | Mise à jour Qui suis-je + Historique avec IA Claude Sonnet 5 |

---

**Sébastien Godet** — sebastien.godet16@gmail.com · [LinkedIn](https://www.linkedin.com/in/sébastien-godet-142ba6145)

Built with the assistance of **Claude Sonnet 4.6**, **Claude Sonnet 5** (Anthropic) and **Gemini 3.5 Flash** (Google).

Special thanks to **Fédérico Calo** (web architecture) and **Mussa Sembro** (Oromo translations & linguistic review).

---

*© Juin–Juillet 2026 — Sébastien Godet*