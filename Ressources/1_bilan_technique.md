# 📊 Bilan Technique — Taphad'Meuh
### Application PWA bilingue Français ↔ Afaan Oromoo
*Juin 2026 — Sébastien Godet*

---

## 1. Vue d'ensemble

| Indicateur | Valeur |
|---|---|
| Type d'application | PWA (Progressive Web App) — installable Android & iOS |
| Stack technique | Vanilla JS (ES2020) · CSS3 · HTML5 — zéro dépendance |
| Hébergement | GitHub Pages + GitHub Actions (CI/CD automatisé) |
| Modes d'apprentissage | 2 (Apprendre le Français / Apprendre l'Oromo) |
| Thèmes par mode | 48 (32 Niveau 1 Vocabulaire + 16 Niveau 2 Dialogue) |
| Mots/expressions par mode | ~387 entrées (Français) · ~396 entrées (Oromo) |
| Fonctionnement hors-ligne | ✅ 100 % après première visite (Service Worker) |
| Taille totale du code source | ~594 Ko (6 fichiers principaux, 12 443 lignes) |

---

## 2. Architecture des fichiers

### Taille et lignes exactes

| Fichier | Taille | Lignes | Rôle |
|---|---|---|---|
| `js/app.js` | 167 Ko | 4 112 | Moteur applicatif complet (104 fonctions) |
| `css/style.css` | 124 Ko | 3 828 | Styles + système de thèmes dual |
| `js/data-fr.js` | 110 Ko | 1 427 | Dataset mode "Apprendre le Français" |
| `js/data-or.js` | 106 Ko | 1 382 | Dataset mode "Apprendre l'Oromo" |
| `index.html` | 67 Ko | 1 070 | Structure HTML — 4 écrans + 2 modales |
| `sw.js` | 33 Ko | 624 | Service Worker — Cache First / Network First |
| `manifest.json` | — | — | PWA — icônes, orientation, screenshots |
| `deploy.yml` | — | — | CI/CD GitHub Actions |

### Parcours utilisateur (4 écrans)

```
[Lanceur]  →  choix de la langue d'apprentissage
     │
     ▼
 [Home / Guide]  →  onboarding au 1er lancement de chaque mode
     │
     ▼
 [Sections]  →  grille 2 colonnes — 48 modules (Niv. 1 × 32 + Niv. 2 × 16)
     │
     ▼
 [Leçon]  →  5 onglets par module
              ├── 🃏 Cartes Flash    (flip + TTS)
              ├── 📖 Vocabulaire     (liste cliquable)
              ├── 🎯 Quiz            (10 QCM auto-générés)
              ├── 💬 Dialogue        (Niveau 2 uniquement)
              └── 🎤 Répète          (reconnaissance vocale)
```

---

## 3. Sections de `app.js` — numéros de lignes exacts

| # | Section | Fonctions clés | Ligne exacte |
|---|---|---|---|
| 1 | Variables d'état globales | `currentMode`, `CT`, `done`, `q10Step`… | **54** |
| — | Utilitaire bilingue | `L()`, `isFrench()`, `langKeys()` | **88** |
| 2 | Point d'entrée | `initApp(mode)`, `_loadDataScript()` | **158 / 190** |
| 3 | Synthèse vocale TTS | `speak()`, `_resolveOromoVoice()`, `_doSpeak()` | **339 / 422 / 582** |
| 3b | Retour haptique | `_vibrateFeedback()` | **617** |
| 3b2 | Confetti | `_launchConfetti()` | **639** |
| 3c | Interruption audio | `visibilitychange / focus` | **712** |
| 3d | KeepAlive watchdog | `_startTtsKeepAlive()`, `_stopTtsKeepAlive()` | **753 / 772 / 784** |
| 4 | Persistance progression | `loadDone()`, `saveDone()`, `markDone()` | **795 / 808 / 981** |
| 4c | Réinitialisation | `confirmResetProgress()`, `executeResetProgress()` | **871 / 925** |
| 4b | Session quiz | `_saveQuizSession()`, `_restoreQuizSession()` | **1036 / 1067 / 1086** |
| 5 | Navigation | `showScreen()`, `lessonGoBack()`, `lessonNav()` | **1148 / 1371 / 1386** |
| 5b | Navigation basse | `navGoModules()`, `_updateBottomNav()` | **1263 / 1297** |
| 6 | Écran Home | `renderHome()`, `_getProgress()` | **1414 / 1429** |
| 7 | Écran Sections | `renderSections()`, `_buildThemeCard()` | **1496 / 1507 / 1579** |
| 8 | Ouverture thème | `openTheme()`, `switchTab()` | **1609 / 1621 / 1753** |
| 9 | Cartes Flash | `renderFlash()`, `flipCard()`, `nextCard()` | **1781 / 1899 / 1908** |
| 10 | Quiz 10 questions | `renderQuiz10()`, `_generateQuiz()`, `checkQ10()` | **1930 / 2020 / 2084 / 2199** |
| 11 | Dialogue | `renderDialog()`, `pickSit()` | **2244 / 2254 / 2297** |
| 12 | Vocabulaire | `renderVocab()` | **2303 / 2313** |
| 13b | Onglet Répète | `renderRepeat()`, `repeatRecord()`, `_matchRepeat()` | **2350 / 2566 / 2821 / 2437** |
| 13 | Quiz Dialogue | `renderDialogQuiz()`, `checkDQ()` | **2997 / 3007 / 3075** |
| 14 | Utilitaires | `esc()`, `escJS()`, `_quizResultStrings()` | **3107 / 3151 / 3171 / 3117** |
| 17 | Guide / Onboarding | `_buildHomeGuide()`, `_maybeShowOnboarding()` | **3194 / 3251 / 3312** |
| — | Écran Home (guide) | `_buildHomeGuide()` | **3219** |
| 18 | Crédits | `showCredits()`, `closeCreditsModal()` | **3336 / 3340 / 3391** |
| 15 | Launcher init | Initialisation au chargement | **3397** |
| 16 | Accessibilité clavier | Navigation clavier globale | **3415** |
| 19 | Spinner / Viewport | `_showLoadingSpinner()`, fix Android Chrome | **3427 / 3440 / 3470** |
| 20 | Service Worker | Enregistrement PWA | **3532** |
| 21 | Exports PDF | `_exportGuide()`, `_exportVocab()`, `_exportSituation()` | **3579 / 3782 / 3888 / 3984** |

---

## 4. Sections de `style.css` — numéros de lignes exacts

| § | Section | Ligne |
|---|---|---|
| §1 | Reset & base globale | 62 |
| §2 | Variables de thème `:root` (fallback) | 186 |
| §3 | Thème Français `html.theme-french` | 249 |
| §4 | Thème Oromo `html.theme-oromo` | 289 |
| §5 | Écran 0 — Lanceur | 324 |
| §6 | Écran 1 — Accueil #home | 530 |
| §7 | Écran 2 — Sections | 596 |
| §8 | Écran 3 — Leçon | 721 |
| §9 | Flashcards | 972 |
| §10 | Alphabet | 1095 |
| §11 | Quiz | 1195 |
| §12 | Dialogues / Situations | 1300 |
| §13 | Vocabulaire | 1405 |
| §14 | Modale Remerciements | 1473 |
| §15 | Footer commun | 1560 |
| §16 | Toast notification | 1580 |
| §17 | Onglet Répète | 1616 |
| §18 | Focus clavier | 1865 |
| §19 | Guide utilisateur `.ob-*` | 1883 |
| §20 | Spinner de chargement | 2339 |
| §22 | Écran Home redesigné | 2376 |
| §23 | Écran Sections redesigné | 2637 |
| §24 | Responsive tablette & desktop | 2765 |
| §24b | Mode sombre `prefers-color-scheme` | 2855 |
| §25 | Boutons export PDF | 2966 |
| §26 | Barre de navigation basse | 3066 |
| §27 | Onglets Niveau 1 / 2 | 3193 |
| §28 | Écrans sections (no-scroll fix) | 3288 |
| §20e | Grille thèmes dans les écrans level | 3472 |
| §CONFETTI | Animation ⭐⭐⭐ | 3493 |
| §PROGRESS | Cercle SVG progression | 3551 |
| §CONFIRM | Modale confirmation suppression | 3627 |
| §ANTISPAM | Email affiché à l'envers (RTL CSS) | 3746 |
| §SPEAKING | Feedback visuel bouton audio (TTS) | 3773 |

---

## 5. Sections de `index.html`

| Section | ID / Description | Ligne |
|---|---|---|
| `<head>` | Meta, CSP, PWA, Open Graph | 1 |
| Écran 0 | `#app-launcher` — Lanceur | 117 |
| Écran 1 | `#home` — Guide / Onboarding | 220 |
| Écran 2a | `#sections-level1` — Grille Niveau 1 | 837 |
| Écran 2b | `#sections-level2` — Grille Niveau 2 | 865 |
| Écran 3 | `#lesson` — Leçon (5 onglets) | 898 |
| Modale 1 | `#credits-modal` — Remerciements | 977 |
| Modale 2 | `#custom-confirm-modal` — Confirmation suppression | 1010 |
| Nav | `#bottom-nav` — Barre de navigation basse | 1026 |
| Scripts | Chargement de `app.js` | 1068 |

---

## 6. Décisions techniques majeures

### 6.1 Système de thème dual (CSS)
Une seule classe sur `<html>` (`theme-french` ou `theme-oromo`) bascule l'intégralité du rendu visuel via 201 variables CSS `var(--c-*)`. Aucun chargement dynamique de CSS supplémentaire.

### 6.2 Chargement lazy des données
`initApp(mode)` injecte dynamiquement `<script src="data-fr.js">` ou `<script src="data-or.js">` dans le DOM. Seul le dataset du mode choisi (~100 Ko) est chargé en mémoire JS — l'autre reste en cache disque Service Worker.

### 6.3 Cascade TTS pour l'Oromo
La voix Oromo native (`om-ET`) est quasi absente des appareils. `_resolveOromoVoice()` tente : `om-ET` → `so-SO` → `am-ET` → `ha-NG` → `sw-KE` → `es-ES`. L'onglet Répète a sa propre cascade `_resolveRepeatLangOromo()` avec le même ordre.

### 6.4 Algorithme de correspondance Répète
`_matchRepeat()` combine correspondance exacte + distance de Levenshtein (`_levenshtein()`, **ligne 2482**) pour tolérer les erreurs de prononciation mineures lors de la reconnaissance vocale.

### 6.5 Persistance de progression
Deux clés localStorage indépendantes : `pe_om_fr_done_v1` (mode Français) et `pe_fr_om_done_v1` (mode Oromo). Les étoiles ne décroissent jamais — seul le meilleur score est conservé. Seuils : ≥ 50 % → ⭐ · ≥ 75 % → ⭐⭐ · 100 % → ⭐⭐⭐.

### 6.6 Quiz alphabet — statique vs dynamique
Le thème `alpha` seul utilise un tableau `quiz10[]` codé en dur dans les données, car le quiz est **audio** (phonétique) : les distracteurs doivent être phonétiquement proches (ex : C / K / CH / G). Tous les autres thèmes utilisent `_generateQuiz()` (Fisher-Yates, **ligne 2020**).

### 6.7 Session quiz (sessionStorage)
`_saveQuizSession()` / `_restoreQuizSession()` (**lignes 1067 / 1086**) sauvegardent l'état du quiz en cours dans `sessionStorage` — survit à un changement d'onglet accidentel, mais s'efface à la fermeture du navigateur.

### 6.8 Versioning de cache automatisé
`sw.js` contient le placeholder `GITHUB_RUN_NUMBER`, remplacé par `sed` dans `deploy.yml` à chaque déploiement. Chaque build produit un nom de cache unique — aucune intervention manuelle requise.

### 6.9 Fix viewport Android
`--app-h` et `--bottom-nav-h` sont recalculées via `window.innerHeight` à chaque `resize`/`orientationchange` (**ligne 3470**) pour contourner le bug `100dvh` incluant la barre d'URL sur Android Chrome/Brave.

### 6.10 Anti-spam email
L'adresse email est affichée en écriture RTL CSS dans `index.html` (**ligne 187**) et dans les guides onboarding (lignes **520** et **820**), masquant la vraie adresse aux scrapers. Le clic copie l'adresse corrigée dans le presse-papier.

---

## 7. Points de vigilance / dettes techniques

| Point | Niveau | Détail |
|---|---|---|
| `app.js` monolithique | ⚠️ Moyen | 4 112 lignes, 104 fonctions — maintenable grâce aux `§` mais migration ES modules complexe (handlers `onclick` inline) |
| `unsafe-inline` CSP | ⚠️ Moyen | Nécessaire pour les `onclick` générés dynamiquement par `innerHTML` et pour GitHub Pages (pas de headers HTTP customs) |
| Voix Oromo TTS | ⚠️ Moyen | `om-ET` absente sur la plupart des appareils — l'utilisateur entend souvent du Somali ou de l'Amharique |
| Quiz dynamique (Fisher-Yates) | ✅ OK | Bien implémenté — cache `_q10Questions` évite le re-shuffle si on revient sur l'onglet |
| Mode sombre | ✅ OK | `prefers-color-scheme` supporté (§24b) |
| Accessibilité | ✅ Partiel | `aria-*` présents sur les éléments critiques (17 en JS + 12 en HTML) — navigation clavier supportée (§16) |
| Données | ✅ OK | 48 thèmes × 2 modes — cohérence vérifiée entre `data-fr.js` et `data-or.js` |
