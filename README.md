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
│   ├── app.js              ← Full application engine (5 905 lines, 21 sections)
│   ├── data-fr.js          ← Dataset — "Learn French" mode (52 themes, 1 524 lines)
│   └── data-or.js          ← Dataset — "Learn Oromo" mode  (52 themes, 1 479 lines)
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
| 24/07/2026 | 🐞 Correctif retour terrain : Home et Guide (`#home`) étaient fusionnés en un seul écran, rendant l'icône ❓ inopérante depuis Home (elle rechargeait le même écran). Séparés en deux écrans distincts `#home` (dashboard) et `#guide` (guide explicatif) ; chacun n'affiche plus que l'icône vers l'AUTRE écran (`#home` → ❓ seule, `#guide` → 🏠 seule). Nouvelle fonction `goToHome()`, `goToGuide()` recentrée sur `#guide`. Resynchronisation complète des 3 plans internes — voir Bilan technique §6.23 (`app.js` : 5 796 lignes, `style.css` : 5 082 lignes, `index.html` : 1 824 lignes) (Sébastien + Claude Sonnet 5) |
| 24/07/2026 | Suite directe de l'étape précédente : à la toute première visite d'un mode (jamais onboardé), l'apprenant voit désormais automatiquement l'écran Guide juste après Home, sans avoir à taper ❓ lui-même (`_maybeShowOnboarding()` bascule sur `#guide` au lieu de laisser `#home` affiché sans action). Une fois "Commencer" cliqué depuis Home (flag onboarding posé), les lancements suivants sautent directement aux Modules, comme avant. Resynchronisation du plan interne de `app.js` — voir Bilan technique §6.23 (`app.js` : 5 790 lignes) (Sébastien + Claude Sonnet 5) |
| 25/07/2026 | 🐞 Correctif retour terrain : sur le Lanceur, avant tout choix de langue, les icônes ❓ Guide et 📚 Modules de la nav basse étaient grisées mais restaient cliquables sans aucun retour (elles pouvaient planter ou afficher un écran incohérent, `data-fr/or.js` n'étant pas encore chargé). Ajout d'une petite modale bilingue (`#nav-locked-modal`, `openNavLockedModal()`/`closeNavLockedModal()`) qui explique la raison et se ferme au tap. Suppression au passage du stub mort `_closeOnboarding()` (corps vide, plus aucun appelant depuis la fusion Home+Guide). Correction d'une erreur de groupement héritée du 23/07/2026 dans le plan interne de `app.js` (`goToAccueil()`/`goToGuide()` sont physiquement dans le bloc §5c, pas §5b). Resynchronisation complète des 3 plans internes + mise à jour du diagramme "User flow" ci-dessus, périmé depuis la fusion Home+Guide (il décrivait encore deux écrans séparés) — voir Bilan technique §6.25 (`app.js` : 5 905 lignes, `style.css` : 5 219 lignes, `index.html` : 1 806 lignes) (Sébastien + Claude Sonnet 5) |
| 22/07/2026 → 25/07/2026 | Expériences utilisatrice (Sandrine avec application espagnole VACHÉBO, Moi) et correctifs avec Claude Sonnet 5. |
| 28/08/2026 | **Étape 1 (méthode VACHÉBO)** : enrichissement du vocabulaire Niveau 1 pour grands débutants — 4 nouveaux thèmes (`adj` Adjectifs de Base, `connect` Mots de Liaison, `quantfreq` Quantité/Fréquence/Temps, `argent` L'Argent) + enrichissement de 4 thèmes existants (`num` +10 ordinaux, `fam` +11 famille étendue, `objets` +12 vocabulaire numérique/tech, `sante` +9 vocabulaire de sécurité générale — ids inchangés pour préserver la progression déjà sauvegardée). 32→36 thèmes Niveau 1 (48→52 au total), `_TOTAL_THEMES_PER_MODE` mis à jour, comptage des thèmes renuméroté dans les 2 fichiers de données, textes du Guide (FR + Oromo) resynchronisés dans `index.html`. Traductions oromo provisoires (IA), en attente de relecture par Mussa Sembro via le classeur de révision Excel dédié — 2 entrées (jumeaux, accident) volontairement omises du code faute de traduction fiable, 1 doublon fusionné (« Peu / Un peu ») (`data-fr.js` : 1 524 lignes, `data-or.js` : 1 479 lignes, `app.js` : 5 913 lignes, `index.html` : 1 806 lignes) (Sébastien + Claude Sonnet 5) |
| 28/08/2026 | **Étape 2 (méthode VACHÉBO)** : scission du thème `sante` élargi à l'étape 1 en deux thèmes Niveau 1 distincts — `sante` (🏥 La Santé / Fayyaa) conserve son id et ses 21 mots médicaux d'origine, zéro impact sur la progression déjà sauvegardée ; nouveau thème `secu` (🚨 La Sécurité / Nageenya) créé juste après, reprenant tels quels les 9 mots de sécurité générale ajoutés à l'étape 1 (nouvel id → progression vierge). 36→37 thèmes Niveau 1 (52→53 au total), `_TOTAL_THEMES_PER_MODE` mis à jour, renumérotation complète des commentaires `// N/53` dans les 2 fichiers de données, 7 occurrences de comptage (36/52) resynchronisées dans le Guide bilingue d'`index.html`. Traduction oromo du titre « Nageenya » provisoire (IA), en attente de relecture par Mussa Sembro comme le reste du lot du 28/08. Vérifications : `node --check` sur les 3 fichiers JS modifiés, comptage programmatique (21+9=30 mots répartis sans perte ni doublon, 37 ids uniques Niveau 1, miroir FR/OR strict confirmé sur ids et contenu du nouveau thème) (`data-fr.js` : 1 532 lignes, `data-or.js` : 1 487 lignes, `app.js` : 5 913 lignes, `index.html` : 1 806 lignes) (Sébastien + Claude Sonnet 5) |
| 28/08/2026 | **Étape 3 (méthode VACHÉBO)** : la grille plate des 37 thèmes de Niveau 1 (longue à parcourir) est regroupée en **6 catégories thématiques repliables** (accordéons natifs `<details>`/`<summary>`, zéro JS pour l'ouverture/fermeture) — 🌱 Les Bases (6), 🔢 Chiffres/Temps/Météo (4), 😊 Se Décrire/Ressentir/Sécurité (7), 🏠 Maison/Famille/Métiers (7), 🍽️ Repas/Argent/Déplacements (7), 🌍 Voyage/Nature/Monde (6) — plus une carte **"▶ Continuer"** en tête de grille qui pointe vers le thème entamé mais pas encore maîtrisé à 100 %, sinon le premier thème neuf, sinon un message de félicitations si tout est fini (`THEME_CATEGORIES_L1`, `_buildLevel1Body()` et fonctions associées, nouveau §7 d'`app.js`). L'auto-dépli n'ouvre que la catégorie en cours + la suivante au tout premier rendu ; les ouvertures/fermetures manuelles de l'apprenant sont ensuite préservées d'un rendu à l'autre (fin de quiz, retour d'écran…). Un bloc CSS mort et jamais câblé (`.level-details`/`.level-summary`/`.level-chevron`, reliquat d'une tentative antérieure ou copie de VACHÉBO) a été repéré mais volontairement **non réutilisé**, remplacé par des classes dédiées (`.theme-category`, `.category-summary`, `.category-chevron`) pour ne pas hériter d'un bug potentiel non diagnostiqué. Niveau 2 (16 dialogues) reste une grille plate inchangée. Traductions oromo des 6 titres de catégorie provisoires (IA), en attente de relecture par Mussa Sembro comme le reste du lot du 28/08. Vérifications : `node --check`, tests unitaires isolés (harnais Node `vm`) sur la couverture exacte des 37 ids, la cible "Continuer" et l'auto-dépli aux états neuf / en cours / 100 % — voir Bilan technique §6.27 (`app.js` : 6 109 lignes, `style.css` : 5 388 lignes, `index.html` : 1 811 lignes) (Sébastien + Claude Sonnet 5) |
| 29/08/2026 | **Étape 4 (méthode VACHÉBO)** : même traitement appliqué au Niveau 2 (16 dialogues) — regroupement en **4 catégories thématiques repliables**, avec des emojis volontairement différents du Niveau 1 pour distinguer les deux niveaux d'un coup d'œil : 👋 Rencontres & Orientation (3), 🎉 Sorties/Repas/Loisirs (4), 🧳 S'installer au Quotidien (5), ⛅ Météo/Temps/Santé (4) — plus, sur demande explicite, sa propre carte **"▶ Continuer"** (même logique que le Niveau 1). Généralisation plutôt que duplication : les fonctions de l'étape 3 acceptent désormais la liste de catégories en paramètre (`_getContinueTarget()`, `_buildContinueCard()`, `_computeAutoOpenCategoryIds()`), nouvelle fonction partagée `_buildCategorizedGrid()` appelée par `_buildLevel1Body()` et la nouvelle `_buildLevel2Body()` ; `.level1-body` renommée en `.categories-body` (classe générique réutilisée par `#grid1` ET `#grid2`) dans `index.html`/`style.css`, sans dupliquer une seule règle CSS. Resynchronisation complète des 3 plans internes. Vérifications : `node --check` sur les 3 fichiers JS, miroir FR/OR strict des 16 ids Niveau 2 confirmé par diff programmatique, couverture exacte des 16 ids par les 4 catégories (extraite directement du `app.js` final, aucun doublon ni oubli), Niveau 1 revérifié sans régression (37/37), comptage accolades CSS (836/836) et variables `--c-*` (30/30) identiques avant/après, simulation de 3 scénarios utilisateur (neuf / mi-parcours / 100%) pour la cible "Continuer" et l'auto-dépli — voir Bilan technique §6.28 (`app.js` : 6 199 lignes, `style.css` : 5 394 lignes, `index.html` : 1 829 lignes) (Sébastien + Claude Sonnet 5) |

*Journal détaillé (dont le retour de recettage complet du 03/07) disponible en commentaire d'en-tête dans `app.js`.*

---

**Sébastien Godet** — sebastien.godet16@gmail.com · [LinkedIn](https://www.linkedin.com/in/sébastien-godet-142ba6145)

Built with the assistance of **Claude Sonnet 4.6**, **Claude Sonnet 5** (Anthropic) and **Gemini 3.5 Flash** (Google).

Special thanks to **Fédérico Calo** (web architecture) and **Mussa Sembro** (Oromo translations & linguistic review).

---

*© Juin–Juillet 2026 — Sébastien Godet*