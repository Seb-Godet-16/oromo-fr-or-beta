# 📊 Bilan Technique — Taphad'Meuh
### Application PWA bilingue Français ↔ Afaan Oromoo
*Juin–Juillet 2026 — Sébastien Godet*
*Assisté par IA : Claude Sonnet 4.6, Claude Sonnet 5 (Anthropic) et Gemini 3.5 Flash (Google)*

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
| Taille totale du code source | ~635 Ko (6 fichiers principaux, 13 412 lignes) |

---

## 2. Architecture des fichiers

### Taille et lignes exactes

| Fichier | Taille | Lignes | Rôle |
|---|---|---|---|
| `js/app.js` | 191 Ko | 4 690 | Moteur applicatif complet (121 fonctions) |
| `css/style.css` | 135 Ko | 4 193 | Styles + système de thèmes dual |
| `js/data-fr.js` | 106 Ko | 1 427 | Dataset mode "Apprendre le Français" |
| `js/data-or.js` | 103 Ko | 1 382 | Dataset mode "Apprendre l'Oromo" |
| `index.html` | 68 Ko | 1 096 | Structure HTML — 5 écrans + 2 modales |
| `sw.js` | 33 Ko | 624 | Service Worker — Cache First / Network First |
| `manifest.json` | — | — | PWA — icônes, orientation, screenshots |
| `deploy.yml` | — | — | CI/CD GitHub Actions |

### Parcours utilisateur

```
[Lanceur]  →  choix de la langue d'apprentissage
     │
     ▼
 [Home / Guide]  →  onboarding au 1er lancement de chaque mode
     │                                                     ▲
     ▼                                                     │ ❓ (icône Guide)
 [Sections]  →  grille 2 colonnes — 48 modules (Niv. 1 × 32 + Niv. 2 × 16)
     │      ╲
     ▼       ╲ 🏠 (icône Accueil → retour au Lanceur, changer de langue)
 [Leçon]  →  5 onglets par module
              ├── 🃏 Cartes Flash    (flip + TTS)
              ├── 📖 Vocabulaire     (liste cliquable)
              ├── 🎯 Quiz            (10 QCM auto-générés)
              ├── 💬 Dialogue        (Niveau 2 uniquement)
              └── 🎤 Répète          (reconnaissance vocale)
```

Depuis l'écran Sections, deux icônes remplacent l'ancien bouton retour unique :
- **🏠** (`goToAccueil()`) → écran Lanceur (`#app-launcher`, choix Français/Oromo) — même mécanisme que le bouton "Changer de langue" de la nav basse.
- **❓** (`goToGuide()`) → écran Home (dashboard Commencer/Continuer + carte(s) de progression + guide explicatif) — identique au bouton "Guide" de la nav basse.

---

## 3. Sections de `app.js` — numéros de lignes exacts

| # | Section | Fonctions clés | Ligne exacte |
|---|---|---|---|
| 1 | Variables d'état globales | `currentMode`, `CT`, `done`, `q10Step`, `_TOTAL_THEMES_PER_MODE`… | **93** |
| — | Utilitaire bilingue | `L()`, `isFrench()`, `langKeys()` | **148 / 179 / 188** |
| 2 | Point d'entrée | `_loadDataScript()`, `initApp(mode)` | **250 / 280** |
| 3 | Synthèse vocale TTS | `_resolveOromoVoice()`, `speak()`, `_doSpeak()` | **505 / 682 / 766** |
| 3b | Retour haptique | `_vibrateFeedback()` | **1038** |
| 3b2 | Confetti | `_launchConfetti()` | **1076** |
| 3c | Interruption audio | `visibilitychange` (écouteur) | **1158** (section **1129**) |
| 3d | KeepAlive watchdog | `_startTtsKeepAlive()`, `_stopTtsKeepAlive()` | **1189 / 1201** |
| 4 | Persistance progression | `loadDone()`, `saveDone()`, `markDone()` | **1225 / 1237 / 1398** |
| 4c | Réinitialisation | `confirmResetProgress()`, `executeResetProgress()` | **1288 / 1342** (dans §4) |
| 4b | Session quiz | `_saveQuizSession()`, `_restoreQuizSession()` | **1484 / 1503** |
| 5 | Navigation | `showScreen()` | **1589** |
| 5b | Navigation basse | `_updateBottomNav()`, `navGoModules()`, `lessonGoBack()` | **1714 / 1773 / 1789** |
| 5b | **🆕 Icônes retour Sections** | `goToAccueil()`, `goToGuide()` | **1801 / 1811** |
| 5b | Navigation leçon | `lessonNav()` | **1824** |
| 6 | Écran Home — progression | `_computeProgressFrom()`, `_getProgress()`, `_getOtherModeProgress()` | **1871 / 1888 / 1902** |
| 6 | Écran Home — rendu | `renderHome()`, `_buildProgressCardHTML()` | **1915 / 1979** |
| 7 | Écran Sections | `renderSections()`, `_buildThemeCard()` | **2017 / 2089** |
| 8 | Ouverture thème | `openTheme()`, `switchTab()` | **2131 / 2264** |
| 9 | Cartes Flash | `renderFlash()`, `flipCard()`, `nextCard()` | **2305 / 2436 / 2445** |
| 10 | Quiz 10 questions | `_generateQuiz()`, `renderQuiz10()`, `checkQ10()` | **2559 / 2623 / 2738** |
| 11 | Dialogue | `renderDialog()`, `pickSit()` | **2793 / 2836** |
| 12 | Vocabulaire | `renderVocab()` | **2852** |
| 13b | Onglet Répète | `_matchRepeat()`, `renderRepeat()`, `repeatRecord()` | **2977 / 3106 / 3364** |
| 13 | Quiz Dialogue | `renderDialogQuiz()`, `checkDQ()` | **3567 / 3635** |
| 14 | Utilitaires | `_quizResultStrings()`, `esc()`, `escJS()` | **3677 / 3711 / 3731** |
| 17 | Guide / Onboarding | `_buildHomeGuide()`, `_maybeShowOnboarding()` | **3811 / 3888** |
| 18 | Crédits | `showCredits()`, `closeCreditsModal()` | **3918 / 3969** |
| 15 | Launcher init | Initialisation au chargement | **3975** |
| 16 | Accessibilité clavier | Navigation clavier globale | **3993** |
| 19 | Spinner / Viewport | `_showLoadingSpinner()`, fix Android Chrome | **4018 / 4048** |
| 20 | Service Worker | Enregistrement PWA | **4110** |
| 21 | Exports PDF | `_exportGuide()`, `_exportVocab()`, `_exportSituation()` | **4360 / 4466 / 4562** |

*Nouveautés 05–06/07/2026 (voir Historique, §9) : `_TOTAL_THEMES_PER_MODE` (ligne 131), `_setAttrBi()` (ligne 406), `goToAccueil()` / `goToGuide()` (icônes 🏠/❓), `_computeProgressFrom()` / `_getOtherModeProgress()` / `_buildProgressCardHTML()` (carte(s) de progression Home).*

---

## 4. Sections de `style.css` — numéros de lignes exacts

| § | Section | Ligne |
|---|---|---|
| §1 | Reset & base globale | 69 |
| §2 | Variables de thème `:root` (fallback) | 193 |
| §3 | Thème Français `html.theme-french` | 256 |
| §4 | Thème Oromo `html.theme-oromo` | 296 |
| §5 | Écran 0 — Lanceur | 331 |
| §6 | Écran 1 — Accueil #home | 537 |
| §7 | Écran 2 — Sections | 603 |
| §8 | Écran 3 — Leçon (dont `.back-btn-icon`, 🏠/❓) | 728 (icônes : 946) |
| §9 | Flashcards | 1007 |
| §10 | Alphabet | 1189 |
| §11 | Quiz | 1289 |
| §12 | Dialogues / Situations | 1394 |
| §13 | Vocabulaire | 1499 |
| §14 | Modale Remerciements | 1567 |
| §15 | Footer commun | 1654 |
| §16 | Toast notification | 1674 |
| §17 | Onglet Répète | 1710 |
| §18 | Focus clavier | 1979 |
| §19 | Guide utilisateur `.ob-*` | 1997 |
| §20 | Spinner de chargement | 2453 |
| §22 | Écran Home redesigné | 2490 |
| §23 | Écran Sections redesigné (dont `.back-btn-group`) | 2751 (groupe : 2776) |
| §24 | Responsive tablette & desktop | 2881 |
| §24b | Mode sombre `prefers-color-scheme` | 2971 |
| §24c | Responsive mode paysage mobile | 3082 |
| §25 | Boutons export PDF | 3144 |
| §26 | Barre de navigation basse | 3244 |
| §27 | Onglets Niveau 1 / 2 | 3371 |
| §28 | Écrans sections (no-scroll fix) | 3466 |
| §20e | Grille thèmes dans les écrans level | 3663 |
| §CONFETTI | Animation ⭐⭐⭐ | 3684 |
| §PROGRESS | 🆕 Carte(s) de progression Home (1 ou 2 selon parcours) | 3755 |
| §CONFIRM | Modale confirmation suppression | 3878 |
| §ANTISPAM | Email affiché à l'envers (RTL CSS) | 3997 |
| §SPEAKING | Feedback visuel bouton audio (TTS) | 4024 |
| §29 | Correctifs accessibilité mode sombre (WCAG AA) | 4082 |

*§PROGRESS a été entièrement réécrit le 06/07/2026 : l'ancien cercle SVG unique (`.home-progress-circle-wrap`) est remplacé par `.home-progress-wrap` + `.home-progress-card`, capable d'afficher 1 ou 2 cartes.*

---

## 5. Sections de `index.html`

| Section | ID / Description | Ligne |
|---|---|---|
| `<head>` | Meta, CSP, PWA, Open Graph | 1 |
| Écran 0 | `#app-launcher` — Lanceur | 117 |
| Écran 1 | `#home` — Guide / Onboarding (dont `#homeProgressWrap` 🆕) | 220 |
| Écran 2a | `#sections-level1` — Grille Niveau 1 (dont icônes 🏠/❓ 🆕) | 855 |
| Écran 2b | `#sections-level2` — Grille Niveau 2 (dont icônes 🏠/❓ 🆕) | 887 |
| Écran 3 | `#lesson` — Leçon (5 onglets) | 924 |
| Modale 1 | `#credits-modal` — Remerciements | 1003 |
| Modale 2 | `#custom-confirm-modal` — Confirmation suppression | 1036 |
| Nav | `#bottom-nav` — Barre de navigation basse | 1052 |
| Scripts | Chargement de `app.js` | 1094 |

---

## 6. Décisions techniques majeures

### 6.1 Système de thème dual (CSS)
Une seule classe sur `<html>` (`theme-french` ou `theme-oromo`) bascule l'intégralité du rendu visuel via les variables CSS `var(--c-*)`. Aucun chargement dynamique de CSS supplémentaire.

### 6.2 Chargement lazy des données
`initApp(mode)` injecte dynamiquement `<script src="data-fr.js">` ou `<script src="data-or.js">` dans le DOM. Seul le dataset du mode choisi (~100 Ko) est chargé en mémoire JS — l'autre reste en cache disque Service Worker.

### 6.3 Cascade TTS pour l'Oromo
La voix Oromo native (`om-ET`) est quasi absente des appareils. `_resolveOromoVoice()` tente : `om-ET` → `so-SO` → `am-ET` → `ha-NG` → `sw-KE` → `es-ES`. L'onglet Répète a sa propre cascade `_resolveRepeatLangOromo()` (ligne 3166) avec le même ordre.

### 6.4 Algorithme de correspondance Répète
`_matchRepeat()` combine correspondance exacte + distance de Levenshtein (`_levenshtein()`, **ligne 3022**) pour tolérer les erreurs de prononciation mineures lors de la reconnaissance vocale.

### 6.5 Persistance de progression
Deux clés localStorage indépendantes : `pe_om_fr_done_v1` (mode Français) et `pe_fr_om_done_v1` (mode Oromo). Les étoiles ne décroissent jamais — seul le meilleur score est conservé. Seuils : ≥ 50 % → ⭐ · ≥ 75 % → ⭐⭐ · 100 % → ⭐⭐⭐.

### 6.6 Quiz alphabet — statique vs dynamique
Le thème `alpha` seul utilise un tableau `quiz10[]` codé en dur dans les données, car le quiz est **audio** (phonétique) : les distracteurs doivent être phonétiquement proches (ex : C / K / CH / G). Tous les autres thèmes utilisent `_generateQuiz()` (Fisher-Yates, **ligne 2559**).

### 6.7 Session quiz (sessionStorage)
`_saveQuizSession()` / `_restoreQuizSession()` (**lignes 1484 / 1503**) sauvegardent l'état du quiz en cours dans `sessionStorage` — survit à un changement d'onglet accidentel, mais s'efface à la fermeture du navigateur.

### 6.8 Versioning de cache automatisé
`sw.js` contient le placeholder `GITHUB_RUN_NUMBER`, remplacé par `sed` dans `deploy.yml` à chaque déploiement. Chaque build produit un nom de cache unique — aucune intervention manuelle requise.

### 6.9 Fix viewport Android
`--app-h` et `--bottom-nav-h` sont recalculées via `window.innerHeight` à chaque `resize`/`orientationchange` (**ligne 4048**) pour contourner le bug `100dvh` incluant la barre d'URL sur Android Chrome/Brave.

### 6.10 Anti-spam email
L'adresse email est affichée en écriture RTL CSS dans `index.html` (**ligne 187**) et dans les guides onboarding (lignes **525** et **838**), masquant la vraie adresse aux scrapers. Le clic copie l'adresse corrigée dans le presse-papier.

### 6.11 🆕 Navigation retour Sections — deux destinations distinctes (06/07/2026)
L'ancien bouton unique `← Retour` de l'écran Sections est remplacé par deux icônes (`goToAccueil()` ligne 1801, `goToGuide()` ligne 1811) :
- **🏠** renvoie au **Lanceur** (`#app-launcher`), pas à l'écran Home — c'est le même écran que celui affiché au tout premier lancement de l'app, où l'on choisit Français ou Oromo.
- **❓** renvoie à l'écran **Home** (dashboard + guide), sans scroll forcé — comportement strictement identique au bouton "Guide" déjà présent dans la nav basse (`showOnboardingGuide()`).

Aucun nouvel écran n'a été créé : les deux icônes réutilisent des cibles de navigation déjà existantes (`showScreen('app-launcher', …)` / `showScreen('home', …)`), ce qui limite le risque de régression.

### 6.12 🆕 Carte(s) de progression sur l'écran Home (06/07/2026)
Le cercle SVG unique de l'écran Home est remplacé par 0, 1 ou 2 « cartes » (drapeau + cercle % + étoiles + nombre de modules), selon les parcours ayant de la progression :

| Situation | Affichage |
|---|---|
| Aucun parcours commencé | Rien (pas de barre vide) |
| Un seul parcours a de la progression | 1 carte, pour ce parcours (actif **ou** l'autre) |
| Les deux parcours ont de la progression | 2 cartes côte à côte (🇫🇷 et 🇪🇹) |

Le nombre total de thèmes de l'AUTRE parcours (48, identique dans les deux modes) est une constante figée (`_TOTAL_THEMES_PER_MODE`, ligne 131) plutôt que lu depuis son dataset — évite d'injecter le `data-*.js` de l'autre mode juste pour afficher une statistique. La progression elle-même est lue directement dans son `localStorage` (`_getOtherModeProgress()`, ligne 1902).

---

## 7. Points de vigilance / dettes techniques

| Point | Niveau | Détail |
|---|---|---|
| `app.js` monolithique | ⚠️ Moyen | 4 690 lignes, 121 fonctions — maintenable grâce aux `§` mais migration ES modules complexe (handlers `onclick` inline) |
| `unsafe-inline` CSP | ⚠️ Moyen | Nécessaire pour les `onclick` générés dynamiquement par `innerHTML` et pour GitHub Pages (pas de headers HTTP customs) |
| Voix Oromo TTS | ⚠️ Moyen | `om-ET` absente sur la plupart des appareils — l'utilisateur entend souvent du Somali ou de l'Amharique |
| Quiz dynamique (Fisher-Yates) | ✅ OK | Bien implémenté — cache `_q10Questions` évite le re-shuffle si on revient sur l'onglet |
| Mode sombre | ✅ OK | `prefers-color-scheme` supporté (§24b) + correctifs WCAG AA (§29) |
| Accessibilité | ✅ Partiel | `aria-*` présents sur les éléments critiques — navigation clavier supportée (§18 CSS / §16 JS) |
| Données | ✅ OK | 48 thèmes × 2 modes — cohérence vérifiée entre `data-fr.js` et `data-or.js` |
| Icônes retour 🏠/❓ | ✅ OK | Testées en navigateur réel (Playwright/Chromium) : destinations, aria-label, absence d'erreur JS |
| Carte(s) de progression Home | ✅ OK | Testé pour 0, 1 (parcours actif ou non) et 2 parcours — pas de `:has()` CSS (incompatible Safari < 15.4, hors cible iOS 14.5+) |
| Compatibilité `:has()` CSS | ✅ OK | Évité volontairement ; taille de cercle pilotée par classe JS (`--single`) plutôt que par sélecteur `:has()` |

---

## 8. Recettage — retours de tests (30/06 → 06/07/2026)

| Date | Testeur / Outil | Environnement | Résultat |
|---|---|---|---|
| 30/06/2026 | Fédérico Calo | Terrain | Retours de test transmis à Sébastien |
| 03/07/2026 | Sébastien Godet + Gemini 3.5 Flash | Desktop Chrome (local) | ✅ Aucune erreur JS console sur les deux applis, cœur applicatif sain. Fonctionnalités mobiles (PWA, micro, hors-ligne) non testables en local desktop → notées N/A, plusieurs actions non passées |
| 04/07/2026 | Sébastien Godet + Gemini 3.5 Flash Extended | Brave Android — Samsung Galaxy A55 5G (appli Oromo) | Liste de correctifs identifiée, traitée via prompts |
| 05/07/2026 | Sébastien Godet + Claude Sonnet 5 | Appli Oromo | Correctifs appliqués |
| 06/07/2026 | Sébastien Godet + Claude Sonnet 5 | Appli Oromo | Correctifs appliqués (fin) — dont icônes retour 🏠/❓ et carte(s) de progression Home |

*Détail complet du retour de recettage du 03/07/2026 disponible en commentaire d'en-tête de `app.js` (bloc HISTORIQUE).*

---

## 9. Historique du projet

| Période | Étape |
|---|---|
| 07/06 → 29/06/2026 | Version Bêta créée avec Claude Sonnet 4.6 et Gemini 3.5 Flash |
| 30/06/2026 | Recettage terrain par Fédérico Calo |
| 03/07/2026 | Recettage desktop Chrome — Sébastien Godet + Gemini 3.5 Flash |
| 04/07/2026 | Recettage mobile (Brave Android / Galaxy A55 5G) — Sébastien Godet + Gemini 3.5 Flash Extended |
| 05/07/2026 | Correctifs — Sébastien Godet + Claude Sonnet 5 |
| 06/07/2026 | Correctifs (fin) — Sébastien Godet + Claude Sonnet 5 |

*Journal détaillé (dont la citation complète du retour de recettage du 03/07) : voir le bloc de commentaire `HISTORIQUE DE L'APPLICATION` en tête de `app.js`.*
