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
├── index.html              ← Unique entry point — 4 screens + 2 modals (no logic)
│
├── css/
│   └── style.css           ← All styles — dual theme system (theme-french / theme-oromo)
│
├── js/
│   ├── app.js              ← Full application engine (5 670 lines, 21 sections)
│   ├── data-fr.js          ← Dataset — "Learn French" mode (48 themes, 1 428 lines)
│   └── data-or.js          ← Dataset — "Learn Oromo" mode  (48 themes, 1 383 lines)
│
├── sw.js                   ← Service Worker — Cache First / Network First + SVG fallbacks
├── manifest.json           ← PWA manifest — icons, theme colors, orientation
│
├── img/
│   ├── Logo-appli-or-fr.png
│   └── icons/
│       └── icon-*.png      ← PWA icons (72 → 512 px, maskable variants)
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

**Back navigation (Sections screen)** — two dedicated icons instead of a single "← Back" button, so the learner can jump straight to either destination :

```
[Sections]  ──🏠──▶  [Launcher]   (choose Français / Oromo again — same as the
                                   bottom-nav "Change language" button)
            ──❓──▶  [Home]       (dashboard : Start/Continue button +
                                   progress card(s) + explanatory guide below)
```

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

The "other" path's total theme count (48) is a fixed constant
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

Le moteur applicatif tient dans un seul fichier (5 670 lignes, 21 sections commentées).
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

| Période | Étape |
|---|---|
| 07/06 → 29/06/2026 | Version Bêta créée avec Claude Sonnet 4.6 et Gemini 3.5 Flash |
| 30/06/2026 | Recettage terrain par Fédérico Calo (retours de test) |
| 03/07/2026 | Recettage desktop Chrome (Sébastien + Gemini 3.5 Flash) — aucune erreur JS, cœur applicatif sain ; fonctionnalités mobiles (PWA, micro, hors-ligne) non testables en local (N/A) |
| 04/07/2026 | Recettage mobile — Brave Android, Samsung Galaxy A55 5G (Sébastien + Gemini 3.5 Flash Extended) — liste de correctifs identifiée |
| 05–06/07/2026 | Correctifs appliqués (Sébastien + Claude Sonnet 5) |
| 08/07/2026 | Documentation (README + Bilan technique) resynchronisée avec le code réel (Sébastien + Claude Sonnet 5) |
| 09-10/07/2026 | Bandeau hors-ligne persistant (§6.14) + section Guide "Quel navigateur choisir ?" — comparatif Android/iOS des 10 navigateurs les plus utilisés au monde, corrigé suite à un retour terrain (Sébastien + Claude Sonnet 5) |
| 10/07/2026 | Resynchronisation complète des commentaires à numéros de ligne dans `index.html` et `style.css` (plan de fichier de ce dernier entièrement recalculé) + correction d'une taille obsolète de `app.js` dans ce README (Sébastien + Claude Sonnet 5) |
| 11/07/2026 | Réorganisation des rubriques du Guide (Écran 1), ajout du paragraphe "Limites audio hors ligne" et du bloc "En bref" en tête du Guide *(entrée reconstituée le 12/07 à partir des en-têtes de fichiers — voir le trou de documentation signalé en fin de section 6 du Bilan technique)* |
| 12/07/2026 | Correctif `_exportGuide()` (le PDF du Guide contenait les deux langues au lieu d'une seule) + système à 3 états visuels pour les cartes-module (nouveau / en cours / terminé à 100%, badge "Nouveau", compteur "✅ X/48 terminés") en complément des étoiles ⭐ — voir Bilan technique §6.18. Resynchronisation de ce README et du Bilan technique (`app.js` : 5 244 lignes, `style.css` : 4 467 lignes) (Sébastien + Claude Sonnet 5) |
| 12/07/2026 | Vérification proactive des mises à jour de l'app installée : `registration.update()` déclenché au retour au premier plan et toutes les 60 min, en complément du mécanisme existant (`skipWaiting`/`clients.claim`/`controllerchange` → rechargement auto) — voir Bilan technique §6.19 (`app.js` : 5 287 lignes) (Sébastien + Claude Sonnet 5) |
| 12/07/2026 | Ajout d'une période dans l'historique en en-tête de `app.js` (08/07 → 12/07/2026, expériences utilisateurs) + resynchronisation complète du plan interne `SECTIONS DE CE FICHIER` du même fichier — désynchronisé depuis l'ajout de §3e, il lui manquait aussi entièrement les sections §3e (Bandeau hors-ligne) et §20b (Installation PWA), désormais ajoutées — voir Bilan technique §6.20 (`app.js` : 5 299 lignes) (Sébastien + Claude Sonnet 5) |
| 12/07/2026 | Relecture complète de l'application et resynchronisation des commentaires à numéros de ligne : recalcul intégral du plan interne de `style.css` (périmé depuis le 10/07/2026) et de `index.html`, correction d'un nouveau décalage de +3 lignes dans le plan de `app.js` apparu depuis l'entrée précédente — voir Bilan technique §6.21. Aucune ligne de code fonctionnel modifiée (`app.js` : 5 303 lignes, `style.css` : 4 467 lignes, `index.html` : 1 307 lignes) (Sébastien + Claude Sonnet 5) |
| 24/07/2026 | Identité de marque reprise du logo (`Logo-appli-or-fr.png`), en s'inspirant du projet frère VACHÉBO : tokens `--c-flag-red/black/cream` communs aux deux thèmes, footer du lanceur et carte "L'essentiel en 30 secondes" recolorés, logo complet ajouté aux headers de l'écran Modules, mélange d'éléments culturels (🗼🛖🌳🐓☕🥐) en footer + clin d'œil sur un quiz sans-faute, crème mixée dans le dégradé d'accueil. Correctif au passage d'un bug latent de z-index (`.modal` recouvert par `.app-toast`). Resynchronisation complète des 3 plans internes — voir Bilan technique §6.22 (`app.js` : 5 670 lignes, `style.css` : 4 999 lignes, `index.html` : 1 754 lignes) (Sébastien + Claude Sonnet 5) |

*Journal détaillé (dont le retour de recettage complet du 03/07) disponible en commentaire d'en-tête dans `app.js`.*

---

**Sébastien Godet** — sebastien.godet16@gmail.com · [LinkedIn](https://www.linkedin.com/in/sébastien-godet-142ba6145)

Built with the assistance of **Claude Sonnet 4.6**, **Claude Sonnet 5** (Anthropic) and **Gemini 3.5 Flash** (Google).

Special thanks to **Fédérico Calo** (web architecture) and **Mussa Sembro** (Oromo translations & linguistic review).

---

*© Juin–Juillet 2026 — Sébastien Godet*