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
| Taille totale du code source | ~646 Ko (6 fichiers principaux, 13 618 lignes) |

---

## 2. Architecture des fichiers

### Taille et lignes exactes

| Fichier | Taille | Lignes | Rôle |
|---|---|---|---|
| `js/app.js` | 200 Ko | 4 845 | Moteur applicatif complet (123 fonctions) |
| `css/style.css` | 137 Ko | 4 244 | Styles + système de thèmes dual |
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
| 1 | Variables d'état globales | `currentMode`, `CT`, `done`, `q10Step`, `_TOTAL_THEMES_PER_MODE`… | **86 / 92 / 108 / 101 / 115** |
| — | Utilitaire bilingue | `L()`, `isFrench()`, `_isIosPwaStandalone()`, `langKeys()` | **156 / 163 / 182 / 191** |
| 2 | Point d'entrée | `_loadDataScript()`, `initApp(mode)` | **253 / 283** |
| 3 | Synthèse vocale TTS | `_resolveOromoVoice()`, `speak()`, `_doSpeak()` | **508 / 720 / 804** |
| 3b | Retour haptique | `_vibrateFeedback()` | **1093** |
| 3b2 | Confetti | `_launchConfetti()` | **1131** |
| 3c | Interruption audio | `visibilitychange` (écouteur) | **1213** (section **1185**) |
| 3d | KeepAlive watchdog | `_startTtsKeepAlive()`, `_stopTtsKeepAlive()` | **1244 / 1256** |
| 4 | Persistance progression | `loadDone()`, `saveDone()`, `markDone()` | **1280 / 1292 / 1453** |
| 4c | Réinitialisation | `confirmResetProgress()`, `executeResetProgress()` | **1343 / 1397** (dans §4) |
| 4b | Session quiz | `_saveQuizSession()`, `_restoreQuizSession()` | **1539 / 1558** |
| 5 | Navigation | `showScreen()` | **1644** |
| 5b | Navigation basse | `_updateBottomNav()`, `navGoModules()`, `lessonGoBack()` | **1769 / 1828 / 1844** |
| 5b | Icônes retour Sections | `goToAccueil()`, `goToGuide()` | **1856 / 1866** |
| 5b | Navigation leçon | `lessonNav()` | **1879** |
| 6 | Écran Home — progression | `_computeProgressFrom()`, `_getProgress()`, `_getOtherModeProgress()` | **1926 / 1943 / 1957** |
| 6 | Écran Home — rendu | `renderHome()`, `_buildProgressCardHTML()` | **1970 / 2034** |
| 7 | Écran Sections | `renderSections()`, `_buildThemeCard()` | **2072 / 2144** |
| 8 | Ouverture thème | `openTheme()`, badge ⚠️ onglet Répète (`repeatWarnTitle`), `switchTab()` | **2186 / 2277 / 2336** |
| 9 | Cartes Flash | `renderFlash()`, `flipCard()`, `nextCard()` | **2377 / 2509 / 2518** |
| 10 | Quiz 10 questions | `_generateQuiz()`, `renderQuiz10()`, `checkQ10()` | **2632 / 2696 / 2816** |
| 11 | Dialogue | `renderDialog()`, `pickSit()` | **2871 / 2915** |
| 12 | Vocabulaire | `renderVocab()` | **2931** |
| 13b | Onglet Répète | `_matchRepeat()`, `renderRepeat()`, garde iOS standalone (ligne 3222), `repeatRecord()` | **3057 / 3186 / 3509** |
| 13 | Quiz Dialogue | `renderDialogQuiz()`, `checkDQ()` | **3724 / 3792** |
| 14 | Utilitaires | `_quizResultStrings()`, `esc()`, `escJS()` | **3834 / 3868 / 3888** |
| 17 | Guide / Onboarding | `_buildHomeGuide()`, `_maybeShowOnboarding()` | **3968 / 4045** |
| 18 | Crédits | `showCredits()`, `closeCreditsModal()` | **4075 / 4126** |
| 15 | Launcher init | Initialisation au chargement | **4133** |
| 16 | Accessibilité clavier | Navigation clavier globale | **4151** |
| 19 | Spinner / Viewport | `_showLoadingSpinner()`, `setAppHeight()` (fix Android Chrome) | **4175 / 4233** |
| 20 | Service Worker | Enregistrement PWA (`navigator.serviceWorker.register`) | **4268** (appel : **4306**) |
| 21 | Exports PDF | `_exportGuide()`, `_exportVocab()`, `_exportSituation()` | **4515 / 4621 / 4717** |

*Table entièrement revérifiée et resynchronisée avec le code le 08/07/2026 — toutes les lignes ci-dessus ont été confirmées par recherche directe dans `app.js` (4 845 lignes actuelles). Elles avaient dérivé de -16 à +51 lignes par rapport à la précédente version de ce tableau, sans que le code lui-même soit en cause : le plan interne en en-tête de `app.js` (`SECTIONS DE CE FICHIER`), lui, est resté exact tout du long et a servi de référence pour cette mise à jour.*

*Repères utiles pour les prochaines évolutions (voir §6.11 à §6.13) : `_TOTAL_THEMES_PER_MODE` (ligne 115), `_setAttrBi()` (ligne 409), `_isIosPwaStandalone()` (ligne 182, réutilisé dans `renderRepeat()` ligne 3222, `repeatRecord()` ligne 3545 et `_openPrintWindow()` ligne 4351).*

---

## 4. Sections de `style.css` — numéros de lignes exacts

| § | Section | Ligne |
|---|---|---|
| §1 | Reset & base globale | 70 |
| §2 | Variables de thème `:root` (fallback) | 194 |
| §3 | Thème Français `html.theme-french` | 257 |
| §4 | Thème Oromo `html.theme-oromo` | 297 |
| §5 | Écran 0 — Lanceur | 332 |
| §6 | Écran 1 — Accueil #home | 538 |
| §7 | Écran 2 — Sections | 604 |
| §8 | Écran 3 — Leçon (dont `.back-btn-icon`, 🏠/❓) | 729 (icônes : 947) |
| §9 | Flashcards | 1008 |
| §10 | Alphabet | 1210 |
| §11 | Quiz | 1310 |
| §12 | Dialogues / Situations | 1415 |
| §13 | Vocabulaire | 1520 |
| §14 | Modale Remerciements | 1588 |
| §15 | Footer commun | 1675 |
| §16 | Toast notification | 1695 |
| §17 | Onglet Répète | 1731 |
| §18 | Focus clavier | 2029 |
| §19 | Guide utilisateur `.ob-*` | 2047 |
| §20 | Spinner de chargement | 2503 |
| §22 | Écran Home redesigné | 2540 |
| §23 | Écran Sections redesigné (dont `.back-btn-group`) | 2801 (groupe : 2826) |
| §24 | Responsive tablette & desktop | 2931 |
| §24b | Mode sombre `prefers-color-scheme` | 3021 |
| §24c | Responsive mode paysage mobile | 3132 |
| §25 | Boutons export PDF | 3194 |
| §26 | Barre de navigation basse | 3294 |
| §27 | Onglets Niveau 1 / 2 | 3421 |
| §28 | Écrans sections (no-scroll fix) | 3516 |
| §20e | Grille thèmes dans les écrans level | 3714 |
| §CONFETTI | Animation ⭐⭐⭐ | 3735 |
| §PROGRESS | Carte(s) de progression Home (1 ou 2 selon parcours) | 3806 |
| §CONFIRM | Modale confirmation suppression | 3929 |
| §ANTISPAM | Email affiché à l'envers (RTL CSS) | 4048 |
| §SPEAKING | Feedback visuel bouton audio (TTS) | 4075 |
| §29 | Correctifs accessibilité mode sombre (WCAG AA) | 4133 |

*Table resynchronisée le 08/07/2026 (elle avait dérivé de +1 à +51 lignes selon la position dans le fichier — `style.css` a continué de grossir sans que ce tableau soit remis à jour). §PROGRESS reste la refonte du 06/07/2026 : l'ancien cercle SVG unique (`.home-progress-circle-wrap`) est remplacé par `.home-progress-wrap` + `.home-progress-card`, capable d'afficher 1 ou 2 cartes. Pour rappel, le plan interne en en-tête de `style.css` (`PLAN DU FICHIER`) est resté exact tout du long et a servi de référence pour cette mise à jour.*

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
La voix Oromo native (`om-ET`) est quasi absente des appareils. `_resolveOromoVoice()` tente : `om-ET` → `so-SO` → `am-ET` → `ha-NG` → `sw-KE` → `es-ES`. L'onglet Répète a sa propre cascade `_resolveRepeatLangOromo()` (ligne 3271) avec le même ordre.

### 6.4 Algorithme de correspondance Répète
`_matchRepeat()` combine correspondance exacte + distance de Levenshtein (`_levenshtein()`, **ligne 3102**) pour tolérer les erreurs de prononciation mineures lors de la reconnaissance vocale.

### 6.5 Persistance de progression
Deux clés localStorage indépendantes : `pe_om_fr_done_v1` (mode Français) et `pe_fr_om_done_v1` (mode Oromo). Les étoiles ne décroissent jamais — seul le meilleur score est conservé. Seuils : ≥ 50 % → ⭐ · ≥ 75 % → ⭐⭐ · 100 % → ⭐⭐⭐.

### 6.6 Quiz alphabet — statique vs dynamique
Le thème `alpha` seul utilise un tableau `quiz10[]` codé en dur dans les données, car le quiz est **audio** (phonétique) : les distracteurs doivent être phonétiquement proches (ex : C / K / CH / G). Tous les autres thèmes utilisent `_generateQuiz()` (Fisher-Yates, **ligne 2632**).

### 6.7 Session quiz (sessionStorage)
`_saveQuizSession()` / `_restoreQuizSession()` (**lignes 1539 / 1558**) sauvegardent l'état du quiz en cours dans `sessionStorage` — survit à un changement d'onglet accidentel, mais s'efface à la fermeture du navigateur.

### 6.8 Versioning de cache automatisé
`sw.js` contient le placeholder `GITHUB_RUN_NUMBER`, remplacé par `sed` dans `deploy.yml` à chaque déploiement. Chaque build produit un nom de cache unique — aucune intervention manuelle requise.

### 6.9 Fix viewport Android
`--app-h` et `--bottom-nav-h` sont recalculées via `window.innerHeight` dans `setAppHeight()` (**ligne 4233**), appelée à chaque `resize`/`orientationchange`, pour contourner le bug `100dvh` incluant la barre d'URL sur Android Chrome/Brave.

### 6.10 Anti-spam email
L'adresse email est affichée en écriture RTL CSS dans `index.html` (**ligne 187**) et dans les guides onboarding (lignes **525** et **838**), masquant la vraie adresse aux scrapers. Le clic copie l'adresse corrigée dans le presse-papier.

### 6.11 🆕 Navigation retour Sections — deux destinations distinctes (06/07/2026)
L'ancien bouton unique `← Retour` de l'écran Sections est remplacé par deux icônes (`goToAccueil()` ligne 1856, `goToGuide()` ligne 1866) :
- **🏠** renvoie au **Lanceur** (`#app-launcher`), pas à l'écran Home — c'est le même écran que celui affiché au tout premier lancement de l'app, où l'on choisit Français ou Oromo.
- **❓** renvoie à l'écran **Home** (dashboard + guide), sans scroll forcé — comportement strictement identique au bouton "Guide" déjà présent dans la nav basse (`showOnboardingGuide()`).

Aucun nouvel écran n'a été créé : les deux icônes réutilisent des cibles de navigation déjà existantes (`showScreen('app-launcher', …)` / `showScreen('home', …)`), ce qui limite le risque de régression.

### 6.13 🆕 Reconnaissance vocale indisponible en app installée sur iOS (06/07/2026)

**Constat du recettage iPhone (Point 5)** : l'onglet 🎙️ Répète affichait `Erreur : service-not-allowed` dès que l'utilisateur appuyait sur le bouton micro.

**Cause identifiée** : ce n'est pas un bug de l'application. Un ingénieur WebKit confirme publiquement (bug officiel [webkit.org #225298](https://bugs.webkit.org/show_bug.cgi?id=225298), ouvert depuis 2021, toujours non résolu mi-2026) que l'API `SpeechRecognition` est volontairement bridée par Apple/WebKit lorsqu'un site tourne en **mode standalone** (ajouté à l'écran d'accueil via le menu Partager de Safari) : la classe existe bien dans `window` (donc indétectable par un simple test de support), mais tout appel à `.start()` échoue systématiquement avec `service-not-allowed`. La même URL ouverte dans un **onglet Safari classique** fonctionne normalement — aucun contournement côté code n'est possible, Apple bloque le service lui-même.

**Correctifs appliqués** (aucune solution de contournement n'existant, l'objectif est d'informer clairement l'apprenant plutôt que de le laisser face à une erreur cryptique) :

| Emplacement | Comportement |
|---|---|
| `_isIosPwaStandalone()` (utilitaire centralisé, ligne 182) | Détecte `navigator.standalone === true`, réutilisé partout où cette limitation s'applique |
| Onglet **Répète** — barre d'onglets (`openTheme()`, ligne 2277) | Badge `⚠️` ajouté directement sur le libellé de l'onglet + `title` explicatif, visible **avant même que l'apprenant ne touche l'onglet** |
| Onglet **Répète** — ouverture (`renderRepeat()`, ligne 3222) | Message d'indisponibilité clair affiché **avant** la demande de permission micro (évite une demande inutile qui échouera de toute façon) |
| Bouton micro (`repeatRecord()` → `onerror`, ligne 3545) | Filet de sécurité : si `service-not-allowed` survient quand même (navigation privée, Dictée désactivée, app tierce type SafariViewController), message spécifique au lieu du texte brut de l'erreur |

**Limite assumée** : sur iPhone/iPad, l'onglet Répète ne fonctionnera **jamais** dans l'app installée sur l'écran d'accueil — seulement dans un onglet Safari classique. C'est communiqué à l'apprenant, pas corrigé (aucune correction possible côté web).

### 6.12 🆕 Carte(s) de progression sur l'écran Home (06/07/2026)
Le cercle SVG unique de l'écran Home est remplacé par 0, 1 ou 2 « cartes » (drapeau + cercle % + étoiles + nombre de modules), selon les parcours ayant de la progression :

| Situation | Affichage |
|---|---|
| Aucun parcours commencé | Rien (pas de barre vide) |
| Un seul parcours a de la progression | 1 carte, pour ce parcours (actif **ou** l'autre) |
| Les deux parcours ont de la progression | 2 cartes côte à côte (🇫🇷 et 🇪🇹) |

Le nombre total de thèmes de l'AUTRE parcours (48, identique dans les deux modes) est une constante figée (`_TOTAL_THEMES_PER_MODE`, ligne 115) plutôt que lu depuis son dataset — évite d'injecter le `data-*.js` de l'autre mode juste pour afficher une statistique. La progression elle-même est lue directement dans son `localStorage` (`_getOtherModeProgress()`, ligne 1957).

---

## 7. Points de vigilance / dettes techniques

| Point | Niveau | Détail |
|---|---|---|
| `app.js` monolithique | ⚠️ Moyen | 4 845 lignes, 123 fonctions — maintenable grâce aux `§` mais migration ES modules complexe (handlers `onclick` inline) |
| `unsafe-inline` CSP | ⚠️ Moyen | Nécessaire pour les `onclick` générés dynamiquement par `innerHTML` et pour GitHub Pages (pas de headers HTTP customs) |
| Voix Oromo TTS | ⚠️ Moyen | `om-ET` absente sur la plupart des appareils — l'utilisateur entend souvent du Somali ou de l'Amharique |
| 🆕 Reconnaissance vocale (mic) en app installée iOS | ⚠️ Bloquant non corrigeable, ✅ communiqué | Limitation Apple/WebKit confirmée (bug #225298) : `service-not-allowed` systématique en mode standalone. Aucune solution côté code — badge ⚠️ sur l'onglet + message clair avant la demande de permission (voir §6.13) |
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
| 06/07/2026 | Sébastien Godet + Claude Sonnet 5 | iPhone (recettage terrain) | **Point 5 KO** : `Erreur : service-not-allowed` sur le micro (onglet Répète). Cause identifiée : limitation Apple/WebKit en mode standalone (bug #225298), non corrigeable côté code. Traité par une information claire à l'apprenant (badge ⚠️ sur l'onglet + message avant demande de permission) — voir §6.13 |

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
| 08/07/2026 | Vérification et resynchronisation de toute la documentation (README + ce Bilan) avec les numéros de ligne réels du code — Sébastien Godet + Claude Sonnet 5 |

*Journal détaillé (dont la citation complète du retour de recettage du 03/07) : voir le bloc de commentaire `HISTORIQUE DE L'APPLICATION` en tête de `app.js`.*
