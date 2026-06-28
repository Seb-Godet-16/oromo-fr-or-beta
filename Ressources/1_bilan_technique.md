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
| Taille totale du code source | ~607 Ko (6 fichiers principaux, 12 418 lignes) |

---

## 2. Architecture des fichiers

### Taille et lignes exactes

| Fichier | Taille | Lignes | Rôle |
|---|---|---|---|
| `js/app.js` | 166 Ko | 4 096 | Moteur applicatif complet (104 fonctions) |
| `css/style.css` | 123 Ko | 3 832 | Styles + système de thèmes dual |
| `js/data-fr.js` | 109 Ko | 1 427 | Dataset mode "Apprendre le Français" |
| `js/data-or.js` | 106 Ko | 1 382 | Dataset mode "Apprendre l'Oromo" |
| `index.html` | 66 Ko | 1 057 | Structure HTML — 4 écrans + 2 modales |
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
| 1 | Variables d'état globales | `currentMode`, `CT`, `done`, `q10Step`… | **52** |
| — | Utilitaire bilingue | `L()`, `isFrench()`, `langKeys()` | **112** |
| 2 | Point d'entrée | `initApp(mode)`, `_loadDataScript()` | **190 / 220** |
| 3 | Synthèse vocale TTS | `speak()`, `_resolveOromoVoice()`, `_doSpeak()` | **422 / 512 / 572** |
| 3b | Retour haptique | `_vibrateFeedback()` | **609** |
| 3b2 | Confetti | `_launchConfetti()` | **641** |
| 3c | Interruption audio | `_startTtsKeepAlive()`, `_stopTtsKeepAlive()` | **752 / 764** |
| 4 | Persistance progression | `loadDone()`, `saveDone()`, `markDone()` | **788 / 800 / 961** |
| 4c | Réinitialisation | `confirmResetProgress()`, `executeResetProgress()` | **851 / 905** |
| 4b | Session quiz | `_saveQuizSession()`, `_restoreQuizSession()` | **1047 / 1066** |
| 5 | Navigation | `showScreen()`, `lessonGoBack()`, `lessonNav()` | **1152 / 1351 / 1366** |
| 6 | Écran Home | `renderHome()`, `_getProgress()` | **1421 / 1409** |
| 7 | Écran Sections | `renderSections()`, `_buildThemeCard()` | **1487 / 1559** |
| 8 | Ouverture thème | `openTheme()`, `switchTab()` | **1601 / 1737** |
| 9 | Cartes Flash | `renderFlash()`, `flipCard()`, `nextCard()` | **1775 / 1883 / 1892** |
| 10 | Quiz 10 questions | `renderQuiz10()`, `_generateQuiz()`, `checkQ10()` | **2068 / 2004 / 2183** |
| 11 | Dialogue | `renderDialog()`, `pickSit()` | **2238 / 2281** |
| 12 | Vocabulaire | `renderVocab()` | **2297** |
| 13b | Onglet Répète | `renderRepeat()`, `repeatRecord()`, `_matchRepeat()` | **2550 / 2805 / 2421** |
| 13 | Quiz Dialogue | `renderDialogQuiz()`, `checkDQ()` | **2991 / 3059** |
| 14 | Utilitaires | `esc()`, `escJS()`, `_quizResultStrings()` | **3135 / 3155 / 3101** |
| 17 | Guide / Onboarding | `_buildHomeGuide()`, `_maybeShowOnboarding()` | **3235 / 3296** |
| 18 | Crédits | `showCredits()`, `closeCreditsModal()` | **3324 / 3375** |
| 15 | Launcher init | Initialisation au chargement | **3413** |
| 16 | Accessibilité clavier | Navigation clavier globale | **3424** |
| 19 | Spinner / Viewport | `_showLoadingSpinner()`, fix Android Chrome | **3424 / 3479** |
| 20 | Service Worker | Enregistrement PWA | **3541** |
| 21 | Exports PDF | `_exportGuide()`, `_exportVocab()`, `_exportSituation()` | **3766 / 3872 / 3968** |

---

## 4. Sections de `style.css` — numéros de lignes exacts

| § | Section | Ligne |
|---|---|---|
| §1 | Reset & base globale | 59 |
| §2 | Variables de thème `:root` (fallback) | 183 |
| §3 | Thème Français `html.theme-french` | 246 |
| §4 | Thème Oromo `html.theme-oromo` | 286 |
| §5 | Écran 0 — Lanceur | 321 |
| §6 | Écran 1 — Accueil #home | 528 |
| §7 | Écran 2 — Sections | 594 |
| §8 | Écran 3 — Leçon | 715 |
| §9 | Flashcards | 891 |
| §10 | Alphabet | 1014 |
| §11 | Quiz | 1114 |
| §12 | Dialogues / Situations | 1219 |
| §13 | Vocabulaire | 1324 |
| §14 | Modale Remerciements | 1392 |
| §15 | Footer commun | 1477 |
| §16 | Toast notification | 1497 |
| §17 | Onglet Répète | 1533 |
| §18 | Focus clavier | 1755 |
| §19 | Guide utilisateur `.ob-*` | 1773 |
| §20 | Spinner de chargement | 2229 |
| §22 | Écran Home redesigné | 2266 |
| §23 | Écran Sections redesigné | 2487 |
| §24 | Responsive tablette & desktop | 2598 |
| §24b | Mode sombre `prefers-color-scheme` | 2688 |
| §25 | Boutons export PDF | 2799 |
| §26 | Barre de navigation basse | 2916 |
| §27 | Onglets Niveau 1 / 2 | 3024 |
| §28 | Écrans sections (no-scroll fix) | 3108 |
| §CONFETTI | Animation ⭐⭐⭐ | 3327 |
| §PROGRESS | Cercle SVG progression | 3386 |
| §CONFIRM | Modale confirmation suppression | 3462 |
| §ANTISPAM | Email affiché à l'envers (RTL CSS) | 3576 |

---

## 5. Sections de `index.html`

| Section | ID / Description | Ligne |
|---|---|---|
| `<head>` | Meta, CSP, PWA, Open Graph | 1 |
| Écran 0 | `#app-launcher` — Lanceur | 89 |
| Écran 1 | `#home` — Guide / Onboarding | 182 |
| Écran 2a | `#sections-level1` — Grille Niveau 1 | 239 |
| Écran 2b | `#sections-level2` — Grille Niveau 2 | 267 |
| Écran 3 | `#lesson` — Leçon (5 onglets) | 296 |
| Modale 1 | `#credits-modal` — Remerciements | 358 |
| Modale 2 | Confirmation suppression progression | 394 |
| Nav | Barre de navigation basse | 414 |
| Scripts | Chargement de `app.js` | 441 |

---

## 6. Décisions techniques majeures

### 6.1 Système de thème dual (CSS)
Une seule classe sur `<html>` (`theme-french` ou `theme-oromo`) bascule l'intégralité du rendu visuel via 201 variables CSS `var(--c-*)`. Aucun chargement dynamique de CSS supplémentaire.

### 6.2 Chargement lazy des données
`initApp(mode)` injecte dynamiquement `<script src="data-fr.js">` ou `<script src="data-or.js">` dans le DOM. Seul le dataset du mode choisi (~100 Ko) est chargé en mémoire JS — l'autre reste en cache disque Service Worker.

### 6.3 Cascade TTS pour l'Oromo
La voix Oromo native (`om-ET`) est quasi absente des appareils. `_resolveOromoVoice()` tente : `om-ET` → `so-SO` → `am-ET` → `ha-NG` → `sw-KE` → `es-ES`. L'onglet Répète a sa propre cascade `_resolveRepeatLangOromo()` avec le même ordre.

### 6.4 Algorithme de correspondance Répète
`_matchRepeat()` combine correspondance exacte + distance de Levenshtein (`_levenshtein()`, **ligne 2466**) pour tolérer les erreurs de prononciation mineures lors de la reconnaissance vocale.

### 6.5 Persistance de progression
Deux clés localStorage indépendantes : `pe_om_fr_done_v1` (mode Français) et `pe_fr_om_done_v1` (mode Oromo). Les étoiles ne décroissent jamais — seul le meilleur score est conservé. Seuils : ≥ 50 % → ⭐ · ≥ 75 % → ⭐⭐ · 100 % → ⭐⭐⭐.

### 6.6 Quiz alphabet — statique vs dynamique
Le thème `alpha` seul utilise un tableau `quiz10[]` codé en dur dans les données, car le quiz est **audio** (phonétique) : les distracteurs doivent être phonétiquement proches (ex : C / K / CH / G). Tous les autres thèmes utilisent `_generateQuiz()` (Fisher-Yates, **ligne 2004**).

### 6.7 Session quiz (sessionStorage)
`_saveQuizSession()` / `_restoreQuizSession()` (**lignes 1047 / 1066**) sauvegardent l'état du quiz en cours dans `sessionStorage` — survit à un changement d'onglet accidentel, mais s'efface à la fermeture du navigateur.

### 6.8 Versioning de cache automatisé
`sw.js` contient le placeholder `GITHUB_RUN_NUMBER`, remplacé par `sed` dans `deploy.yml` à chaque déploiement. Chaque build produit un nom de cache unique — aucune intervention manuelle requise.

### 6.9 Fix viewport Android
`--app-h` et `--bottom-nav-h` sont recalculées via `window.innerHeight` à chaque `resize`/`orientationchange` (**ligne 3486**) pour contourner le bug `100dvh` incluant la barre d'URL sur Android Chrome/Brave.

### 6.10 Anti-spam email
L'adresse email est affichée en écriture RTL CSS dans `index.html` (**ligne 186**), masquant la vraie adresse aux scrapers. Le clic copie l'adresse corrigée dans le presse-papier.

---

## 7. Points de vigilance / dettes techniques

| Point | Niveau | Détail |
|---|---|---|
| `app.js` monolithique | ⚠️ Moyen | 4 096 lignes, 104 fonctions — maintenable grâce aux `§` mais migration ES modules complexe (handlers `onclick` inline) |
| `unsafe-inline` CSP | ⚠️ Moyen | Nécessaire pour les `onclick` générés dynamiquement par `innerHTML` et pour GitHub Pages (pas de headers HTTP customs) |
| Voix Oromo TTS | ⚠️ Moyen | `om-ET` absente sur la plupart des appareils — l'utilisateur entend souvent du Somali ou de l'Amharique |
| Quiz dynamique (Fisher-Yates) | ✅ OK | Bien implémenté — cache `_q10Questions` évite le re-shuffle si on revient sur l'onglet |
| Mode sombre | ✅ OK | `prefers-color-scheme` supporté (§24b) |
| Accessibilité | ✅ Partiel | `aria-*` présents sur les éléments critiques (17 en JS + 12 en HTML) — navigation clavier supportée (§16) |
| Données | ✅ OK | 48 thèmes × 2 modes — cohérence vérifiée entre `data-fr.js` et `data-or.js` |
