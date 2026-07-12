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
| Taille totale du code source | ~695 Ko (6 fichiers principaux, 14 497 lignes) |
| Indicateur hors-ligne | ✅ Bandeau persistant, proactif (couvre 🎤 Répète ET 🔊 Écouter — voir §6.14) |
| Guide navigateur | 🆕 Comparatif Android/iOS des 10 navigateurs les plus utilisés au monde (voir §6.15) |
| Repérage visuel des modules | 🆕 Système à 3 états (nouveau / en cours / terminé à 100%) en plus des étoiles ⭐ (voir §6.18) |
| Mises à jour PWA | 🆕 Vérification proactive (retour au premier plan + filet toutes les 60 min), en plus du cycle natif du navigateur (voir §6.19) |

---

## 2. Architecture des fichiers

### Taille et lignes exactes

| Fichier | Taille | Lignes | Rôle |
|---|---|---|---|
| `js/app.js` | 222 Ko | 5 299 | Moteur applicatif complet (135 fonctions, dont le bandeau hors-ligne §3e, le suivi "modules déjà ouverts" §7 et la vérification proactive des mises à jour SW §20 — voir §6.19 ; plan interne `SECTIONS DE CE FICHIER` resynchronisé, y compris §3e et §20b qui en étaient absentes) |
| `css/style.css` | 145 Ko | 4 467 | Styles + système de thèmes dual (dont §16b bandeau hors-ligne, §7 états visuels des cartes-module) |
| `js/data-fr.js` | 106 Ko | 1 427 | Dataset mode "Apprendre le Français" |
| `js/data-or.js` | 103 Ko | 1 382 | Dataset mode "Apprendre l'Oromo" |
| `index.html` | 87 Ko | 1 298 | Structure HTML — 5 écrans + 2 modales + bandeau hors-ligne + guide "Quel navigateur choisir ?" |
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
| 1 | Variables d'état globales | `currentMode`, `CT`, `done`, `q10Step`, `_TOTAL_THEMES_PER_MODE`… | **98 / 107 / 123 / 116 / 131** |
| — | Utilitaire bilingue | `L()`, `isFrench()`, `_isIosPwaStandalone()`, `langKeys()` | **172 / 179 / 198 / 232** |
| 2 | Point d'entrée | `_loadDataScript()`, `initApp(mode)` | **294 / 324** |
| 3 | Synthèse vocale TTS | `_resolveOromoVoice()`, `speak()`, `_doSpeak()` | **552 / 764 / 848** |
| 3b | Retour haptique | `_vibrateFeedback()` | **1137** |
| 3b2 | Confetti | `_launchConfetti()` | **1175** |
| 3c | Interruption audio | `visibilitychange` (écouteur) | **section 1229** |
| 3d | KeepAlive watchdog | `_startTtsKeepAlive()`, `_stopTtsKeepAlive()` | **1288 / 1300** |
| 3e | 🆕 Bandeau hors-ligne (connectivité) | `_offlineBannerShortText()`, `_offlineBannerDetailHTML()`, `_updateOfflineBanner()`, `_toggleOfflineBannerDetail()` | **1352 / 1365 / 1384 / 1403** (section **1312**) |
| 4 | Persistance progression | `loadDone()`, `saveDone()`, `markDone()` | **1436 / 1448 / 1656** |
| 4a | 🆕 Suivi "modules déjà ouverts" (badge Nouveau, §6.18) | `loadOpened()`, `saveOpened()`, `markOpened()`, `isOpened()` | **1459 / 1471 / 1482 / 1492** (dans §4) |
| 4c | Réinitialisation | `confirmResetProgress()`, `executeResetProgress()` | **1541 / 1595** (dans §4) |
| 4b | Session quiz | `_saveQuizSession()`, `_restoreQuizSession()` | **1742 / 1761** |
| 5 | Navigation | `showScreen()` | **1847** |
| 5b | Navigation basse | `_updateBottomNav()`, `navGoModules()`, `lessonGoBack()` | **1972 / 2055 / 2071** |
| 5b | Icônes retour Sections | `goToAccueil()`, `goToGuide()` | **2083 / 2093** |
| 5b | Navigation leçon | `lessonNav()` | **2106** |
| 6 | Écran Home — progression | `_computeProgressFrom()`, `_getProgress()`, `_getOtherModeProgress()` | **2153 / 2175 / 2189** |
| 6 | Écran Home — rendu | `renderHome()`, `_buildProgressCardHTML()` | **2202 / 2266** |
| 7 | Écran Sections | `renderSections()`, `_buildThemeCard()` | **2304 / 2391** |
| 8 | Ouverture thème | `openTheme()`, badge ⚠️ onglet Répète (`repeatWarnTitle`), `switchTab()` | **2459 / 2551 / 2610** |
| 9 | Cartes Flash | `renderFlash()`, `flipCard()`, `nextCard()` | **2651 / 2783 / 2792** |
| 10 | Quiz 10 questions | `_generateQuiz()`, `renderQuiz10()`, `checkQ10()` | **2906 / 2970 / 3090** |
| 11 | Dialogue | `renderDialog()`, `pickSit()` | **3145 / 3189** |
| 12 | Vocabulaire | `renderVocab()` | **3205** |
| 13b | Onglet Répète | `_matchRepeat()`, `renderRepeat()`, garde iOS standalone (ligne 3496), `repeatRecord()` | **3331 / 3460 / 3783** |
| 13 | Quiz Dialogue | `renderDialogQuiz()`, `checkDQ()` | **3998 / 4066** |
| 14 | Utilitaires | `_quizResultStrings()`, `esc()`, `escJS()` | **4108 / 4142 / 4162** |
| 17 | Guide / Onboarding | `_buildHomeGuide()`, `_maybeShowOnboarding()` | **4242 / 4331** |
| 18 | Crédits | `showCredits()`, `closeCreditsModal()` | **4361 / 4412** |
| 15 | Launcher init | Initialisation au chargement | **≈4419** |
| 16 | Accessibilité clavier | Navigation clavier globale | **4452** |
| 19 | Spinner / Viewport | `_showLoadingSpinner()`, `setAppHeight()` (fix Android Chrome) | **4476 / 4534** |
| 20 | Service Worker | Enregistrement PWA (`navigator.serviceWorker.register`) + 🆕 `_checkForSwUpdate()` (§6.19) | **appel : 4641 / `_checkForSwUpdate()` : 4633** |
| 20b | 🆕 Installation PWA | Bouton natif "Installer l'app" (Android/Chrome) | **section 4659** |
| 21 | Exports PDF | `_exportGuide()` 🆕 corrigé (§6.18), `_exportVocab()`, `_exportSituation()` | **4960 / 5075 / 5171** |

*Table entièrement revérifiée et resynchronisée le 12/07/2026 — toutes les lignes ci-dessus ont été reconfirmées par recherche directe dans `app.js` (**5 299 lignes** au total). Historique des ajouts de la journée : **§6.18** (correctif `_exportGuide()` + bloc §4a + refonte `_buildThemeCard()`/`_fillHeader()`, +110 lignes) ; **§6.19** (vérification proactive des mises à jour SW, +43 lignes) ; ajout d'une entrée dans le bloc `HISTORIQUE DE L'APPLICATION` en tête du fichier (période 08/07 → 12/07/2026, +4 lignes) ; puis **resynchronisation complète du plan interne** `SECTIONS DE CE FICHIER` (+8 lignes, dont l'ajout des deux sections qui en étaient absentes depuis leur création : **§3e** Bandeau hors-ligne et **§20b** Installation PWA). Ce plan interne, désynchronisé depuis l'ajout de §3e (signalé lors des resyncs précédentes), est maintenant à jour et fait à nouveau foi au même titre que cette table.*

*Repères utiles pour les prochaines évolutions (voir §6.11 à §6.15, §6.18, §6.19) : `_TOTAL_THEMES_PER_MODE` (ligne 131), `_setAttrBi()` (ligne 453), `_isIosPwaStandalone()` (ligne 198, réutilisé dans `renderRepeat()` ligne 3496, `repeatRecord()` ligne 3841 et `_openPrintWindow()` ligne 4794).*

---

## 4. Sections de `style.css` — numéros de lignes exacts

| § | Section | Ligne |
|---|---|---|
| §1 | Reset & base globale | 73 |
| §2 | Variables de thème `:root` (fallback, dont 🆕 `--c-card-progress-bg`/`--c-card-complete-bg`) | 197 |
| §3 | Thème Français `html.theme-french` | 263 |
| §4 | Thème Oromo `html.theme-oromo` | 305 |
| §5 | Écran 0 — Lanceur | 342 |
| §6 | Écran 1 — Accueil #home | 548 |
| §7 | Écran 2 — Sections (dont 🆕 pill `.sections-complete-pill`, ligne 3087) | 614 |
| §8 | Écran 3 — Leçon (dont `.back-btn-icon`, 🏠/❓) | 782 (icônes : 1000) |
| §9 | Flashcards | 1061 |
| §10 | Alphabet | 1263 |
| §11 | Quiz | 1363 |
| §12 | Dialogues / Situations | 1468 |
| §13 | Vocabulaire | 1573 |
| §14 | Modale Remerciements | 1641 |
| §15 | Footer commun | 1728 |
| §16 | Toast notification | 1748 |
| §16b | 🆕 Bandeau hors-ligne persistant (`#offline-banner`) | 1784 |
| §17 | Onglet Répète | 1848 |
| §18 | Focus clavier | 2146 |
| §19 | Guide utilisateur `.ob-*` (dont 🆕 listes du guide navigateur) | 2164 (listes : 2409) |
| §20 | Spinner de chargement | 2632 |
| §22 | Écran Home redesigné | 2669 |
| §23 | Écran Sections redesigné (dont `.back-btn-group`) | 3011 (groupe : 3036) |
| §24 | Responsive tablette & desktop | 3150 |
| §24b | Mode sombre `prefers-color-scheme` | 3240 |
| §24c | Responsive mode paysage mobile | 3355 |
| §25 | Boutons export PDF | 3417 |
| §26 | Barre de navigation basse | 3517 |
| §27 | Onglets Niveau 1 / 2 | 3644 |
| §28 | Écrans sections (no-scroll fix) | 3739 |
| §20e | Grille thèmes dans les écrans level | 3937 |
| §CONFETTI | Animation ⭐⭐⭐ | 3958 |
| §PROGRESS | Carte(s) de progression Home (1 ou 2 selon parcours) | 4029 |
| §CONFIRM | Modale confirmation suppression | 4152 |
| §ANTISPAM | Email affiché à l'envers (RTL CSS) | 4271 |
| §SPEAKING | Feedback visuel bouton audio (TTS) | 4298 |
| §29 | Correctifs accessibilité mode sombre (WCAG AA) | 4356 |

*Table intégralement revérifiée et resynchronisée le 12/07/2026 (**4 467 lignes actuelles**) — chaque ligne ci-dessus a été reconfirmée par recherche directe dans `style.css`. **+61 lignes** proviennent des ajouts documentés en **§6.18** (variables `--c-card-*`, refonte de `.theme-card` en 3 états + `.t-badge-new` + `.star-filled`/`.star-empty`, pill `.sections-complete-pill`, variantes mode sombre). Le fichier comptait déjà **4 406 lignes** avant cette session (contre 4 373 dans la précédente table de ce document, soit **+33 lignes** déjà non reflétées ici avant même cette resynchronisation — même trou de documentation que pour `app.js`, voir note **§6.16/§6.17** en fin de section 6). **Le plan interne en en-tête du fichier (`PLAN DU FICHIER`) n'a en revanche PAS été retouché lors de cette session** (contrairement au 10/07/2026 où il avait été entièrement recalculé) : il liste toujours les anciens numéros de ligne d'avant le présent correctif et ne doit plus être considéré comme fiable tant qu'il n'aura pas été remis à jour. §PROGRESS reste la refonte du 06/07/2026 : l'ancien cercle SVG unique (`.home-progress-circle-wrap`) est remplacé par `.home-progress-wrap` + `.home-progress-card`, capable d'afficher 1 ou 2 cartes.*

---

## 5. Sections de `index.html`

| Section | ID / Description | Ligne |
|---|---|---|
| `<head>` | Meta, CSP, PWA, Open Graph | 1 |
| Bandeau | 🆕 `#offline-banner` — Bandeau hors-ligne persistant (voir §6.14) | 132 |
| Écran 0 | `#app-launcher` — Lanceur | 151 |
| Écran 1 | `#home` — Guide / Onboarding (dont `#homeProgressWrap` 🆕) | 254 |
| Écran 2a | `#sections-level1` — Grille Niveau 1 (dont icônes 🏠/❓ 🆕) | 1057 |
| Écran 2b | `#sections-level2` — Grille Niveau 2 (dont icônes 🏠/❓ 🆕) | 1089 |
| Écran 3 | `#lesson` — Leçon (5 onglets) | 1126 |
| Modale 1 | `#credits-modal` — Remerciements | 1205 |
| Modale 2 | `#custom-confirm-modal` — Confirmation suppression | 1238 |
| Nav | `#bottom-nav` — Barre de navigation basse | 1254 |
| Scripts | Chargement de `app.js` | 1296 |

*Table resynchronisée le 12/07/2026 (**1 298 lignes actuelles**, contre 1 246 dans la précédente table de ce document). `index.html` n'a **pas** été modifié pendant cette session (seuls `app.js` et `style.css` l'ont été, voir §6.18) : les **+52 lignes** d'écart proviennent entièrement d'un travail antérieur non documenté ici — le fichier lui-même porte un en-tête à jour daté du 11/07/2026 référençant "Bilan_technique.md §6.17" (réorganisation des rubriques du Guide, ajout du paragraphe "Limites audio hors ligne" et du bloc "En bref"), mais les entrées §6.16/§6.17 correspondantes n'existaient pas dans ce document avant la présente resynchronisation des tables. Voir la note à ce sujet en fin de section 6.*

---

## 6. Décisions techniques majeures

### 6.1 Système de thème dual (CSS)
Une seule classe sur `<html>` (`theme-french` ou `theme-oromo`) bascule l'intégralité du rendu visuel via les variables CSS `var(--c-*)`. Aucun chargement dynamique de CSS supplémentaire.

### 6.2 Chargement lazy des données
`initApp(mode)` injecte dynamiquement `<script src="data-fr.js">` ou `<script src="data-or.js">` dans le DOM. Seul le dataset du mode choisi (~100 Ko) est chargé en mémoire JS — l'autre reste en cache disque Service Worker.

### 6.3 Cascade TTS pour l'Oromo
La voix Oromo native (`om-ET`) est quasi absente des appareils. `_resolveOromoVoice()` (**ligne 540**) tente, dans cet ordre : `om-ET` → `so-SO` → `am-ET` → `ha-NG` → `sw-KE` → `es-ES` → `it-IT`. L'onglet Répète a sa propre cascade `_resolveRepeatLangOromo()` (**ligne 3533**) avec le même ordre.

**Précision importante** (voir aussi §6.14) : ce classement est une **cascade de priorité phonétique par langue** — la première voix disponible dont le code langue (`voice.lang`) correspond à l'une des langues de la liste ci-dessus, dans cet ordre. Ce n'est **pas** un tri entre voix « locales » (embarquées sur l'appareil) et voix « distantes » (nécessitant une connexion réseau) : le code ne lit, n'inspecte ni n'utilise nulle part la propriété `voice.localService` de la Web Speech API, et aucune fonction du fichier ne trie ni ne filtre les voix selon leur origine locale/réseau. Concrètement, hors ligne, `speechSynthesis.getVoices()` ne renvoie de toute façon que les voix effectivement installées sur l'appareil à ce moment-là ; la cascade choisit simplement la meilleure correspondance phonétique parmi celles-ci — si aucune ne correspond, c'est la voix par défaut du système qui est utilisée (langue non garantie).

### 6.4 Algorithme de correspondance Répète
`_matchRepeat()` combine correspondance exacte + distance de Levenshtein (`_levenshtein()`, **ligne 3364**) pour tolérer les erreurs de prononciation mineures lors de la reconnaissance vocale.

### 6.5 Persistance de progression
Deux clés localStorage indépendantes : `pe_om_fr_done_v1` (mode Français) et `pe_fr_om_done_v1` (mode Oromo). Les étoiles ne décroissent jamais — seul le meilleur score est conservé. Seuils : ≥ 50 % → ⭐ · ≥ 75 % → ⭐⭐ · 100 % → ⭐⭐⭐.

### 6.6 Quiz alphabet — statique vs dynamique
Le thème `alpha` seul utilise un tableau `quiz10[]` codé en dur dans les données, car le quiz est **audio** (phonétique) : les distracteurs doivent être phonétiquement proches (ex : C / K / CH / G). Tous les autres thèmes utilisent `_generateQuiz()` (**ligne 2894**), qui délègue le mélange à `_shuffle()` — l'implémentation Fisher-Yates elle-même (**ligne 2869**). *Correction de précision (12/07/2026) : la version précédente de cette note citait la ligne 2632 pour "`_generateQuiz()` (Fisher-Yates)", ce qui ne correspondait déjà plus à aucune des deux fonctions avant la présente session — probablement un résidu d'une resynchronisation antérieure incomplète.*

### 6.7 Session quiz (sessionStorage)
`_saveQuizSession()` / `_restoreQuizSession()` (**lignes 1730 / 1749**) sauvegardent l'état du quiz en cours dans `sessionStorage` — survit à un changement d'onglet accidentel, mais s'efface à la fermeture du navigateur.

### 6.8 Versioning de cache automatisé
`sw.js` contient le placeholder `GITHUB_RUN_NUMBER`, remplacé par `sed` dans `deploy.yml` à chaque déploiement. Chaque build produit un nom de cache unique — aucune intervention manuelle requise.

### 6.9 Fix viewport Android
`--app-h` et `--bottom-nav-h` sont recalculées via `window.innerHeight` dans `setAppHeight()` (**ligne 4522**), appelée à chaque `resize`/`orientationchange`, pour contourner le bug `100dvh` incluant la barre d'URL sur Android Chrome/Brave.

### 6.10 Anti-spam email
L'adresse email est affichée en écriture RTL CSS dans `index.html` (**ligne 221**) et dans les guides onboarding (lignes **649** et **1040**), masquant la vraie adresse aux scrapers. Le clic copie l'adresse corrigée dans le presse-papier.

### 6.11 🆕 Navigation retour Sections — deux destinations distinctes (06/07/2026)
L'ancien bouton unique `← Retour` de l'écran Sections est remplacé par deux icônes (`goToAccueil()` ligne 2071, `goToGuide()` ligne 2081) :
- **🏠** renvoie au **Lanceur** (`#app-launcher`), pas à l'écran Home — c'est le même écran que celui affiché au tout premier lancement de l'app, où l'on choisit Français ou Oromo.
- **❓** renvoie à l'écran **Home** (dashboard + guide), sans scroll forcé — comportement strictement identique au bouton "Guide" déjà présent dans la nav basse (`showOnboardingGuide()`).

Aucun nouvel écran n'a été créé : les deux icônes réutilisent des cibles de navigation déjà existantes (`showScreen('app-launcher', …)` / `showScreen('home', …)`), ce qui limite le risque de régression.

### 6.13 🆕 Reconnaissance vocale indisponible en app installée sur iOS (06/07/2026)

**Constat du recettage iPhone (Point 5)** : l'onglet 🎙️ Répète affichait `Erreur : service-not-allowed` dès que l'utilisateur appuyait sur le bouton micro.

**Cause identifiée** : ce n'est pas un bug de l'application. Un ingénieur WebKit confirme publiquement (bug officiel [webkit.org #225298](https://bugs.webkit.org/show_bug.cgi?id=225298), ouvert depuis 2021, toujours non résolu mi-2026) que l'API `SpeechRecognition` est volontairement bridée par Apple/WebKit lorsqu'un site tourne en **mode standalone** (ajouté à l'écran d'accueil via le menu Partager de Safari) : la classe existe bien dans `window` (donc indétectable par un simple test de support), mais tout appel à `.start()` échoue systématiquement avec `service-not-allowed`. La même URL ouverte dans un **onglet Safari classique** fonctionne normalement — aucun contournement côté code n'est possible, Apple bloque le service lui-même.

**Correctifs appliqués** (aucune solution de contournement n'existant, l'objectif est d'informer clairement l'apprenant plutôt que de le laisser face à une erreur cryptique) :

| Emplacement | Comportement |
|---|---|
| `_isIosPwaStandalone()` (utilitaire centralisé, ligne 186) | Détecte `navigator.standalone === true`, réutilisé partout où cette limitation s'applique |
| Onglet **Répète** — barre d'onglets (`openTheme()`, ligne 2447) | Badge `⚠️` ajouté directement sur le libellé de l'onglet + `title` explicatif, visible **avant même que l'apprenant ne touche l'onglet** |
| Onglet **Répète** — ouverture (`renderRepeat()`, garde ligne 3484) | Message d'indisponibilité clair affiché **avant** la demande de permission micro (évite une demande inutile qui échouera de toute façon) |
| Bouton micro (`repeatRecord()` → `onerror`, ligne 3827) | Filet de sécurité : si `service-not-allowed` survient quand même (navigation privée, Dictée désactivée, app tierce type SafariViewController), message spécifique au lieu du texte brut de l'erreur |

**Limite assumée** : sur iPhone/iPad, l'onglet Répète ne fonctionnera **jamais** dans l'app installée sur l'écran d'accueil — seulement dans un onglet Safari classique. C'est communiqué à l'apprenant, pas corrigé (aucune correction possible côté web).

### 6.12 🆕 Carte(s) de progression sur l'écran Home (06/07/2026)
Le cercle SVG unique de l'écran Home est remplacé par 0, 1 ou 2 « cartes » (drapeau + cercle % + étoiles + nombre de modules), selon les parcours ayant de la progression :

| Situation | Affichage |
|---|---|
| Aucun parcours commencé | Rien (pas de barre vide) |
| Un seul parcours a de la progression | 1 carte, pour ce parcours (actif **ou** l'autre) |
| Les deux parcours ont de la progression | 2 cartes côte à côte (🇫🇷 et 🇪🇹) |

Le nombre total de thèmes de l'AUTRE parcours (48, identique dans les deux modes) est une constante figée (`_TOTAL_THEMES_PER_MODE`, ligne 119) plutôt que lu depuis son dataset — évite d'injecter le `data-*.js` de l'autre mode juste pour afficher une statistique. La progression elle-même est lue directement dans son `localStorage` (`_getOtherModeProgress()`, ligne 2177).

### 6.14 🆕 Bandeau hors-ligne persistant — Répète ET Écouter (09-10/07/2026)

**Constat de départ** : un indicateur *réactif* (un message d'erreur affiché seulement après le clic sur 🎤 ou 🔊) laissait l'apprenant découvrir la limitation trop tard, et n'expliquait qu'un seul des deux cas. Les deux fonctions audio sont pourtant affectées différemment par le mode hors-ligne, pour des raisons techniques distinctes :

| Fonction | Hors ligne | Raison technique |
|---|---|---|
| 🎤 **Répète** (`SpeechRecognition`) | ❌ Ne fonctionne **jamais** | Chrome, Edge et Safari envoient tous l'enregistrement audio à un service cloud (serveurs Google/Apple) pour le transcrire — aucune de ces implémentations ne fait la reconnaissance sur l'appareil. C'est une limite de l'API elle-même, vraie sur n'importe quel site utilisant le micro, pas un bug de cette application. |
| 🔊 **Écouter** (`speechSynthesis`) | ⚠️ Peut fonctionner, **mais langue non garantie** | Fonctionne hors ligne uniquement si une voix est déjà installée sur le système (souvent le cas). Si la voix ciblée par la cascade (§6.3) n'est pas installée localement, `speechSynthesis` retombe silencieusement sur la voix par défaut du système — l'apprenant peut alors entendre une langue différente du français ou de l'oromo attendu, sans message d'erreur explicite. |

**Correctif implémenté** — un bandeau persistant (`#offline-banner`, `index.html` ligne 132), piloté par `app.js` §3e et stylé par `style.css` §16b :

| Élément | Emplacement | Rôle |
|---|---|---|
| `_updateOfflineBanner()` | `app.js` ligne 1372 | Affiche/masque le bandeau ; écoute les évènements natifs `online`/`offline` (`window.addEventListener`, ligne 1401-1402) et est aussi appelée à chaque rendu de l'écran Home |
| `_offlineBannerShortText()` | `app.js` ligne 1340 | Résumé toujours visible sur une ligne (ex. *« 📴 Hors ligne — 🎤 Répète indisponible · 🔊 Écouter possible, langue non garantie »*) |
| `_offlineBannerDetailHTML()` | `app.js` ligne 1353 | Détail dépliable expliquant séparément les deux cas (texte ci-dessus, sans jargon technique pour l'apprenant) |
| `_toggleOfflineBannerDetail()` | `app.js` ligne 1391 | Déplie/replie le détail au tap sur le résumé, pour ne pas monopoliser l'espace écran en permanence |

Le bandeau est affiché sur **tous les écrans** dès que l'appareil perd la connexion (pas seulement au moment où l'apprenant appuie sur un bouton audio/micro qui échouerait silencieusement ou avec une erreur cryptique), et reste visible tant que `navigator.onLine` est faux.

**Point de vigilance déjà noté ailleurs dans ce document, à ne pas réintroduire** : la cascade `_resolveOromoVoice()` (§6.3) ne trie **pas** les voix entre « locales » et « distantes » — une éventuelle description antérieure de cette fonctionnalité en ces termes ne correspond à aucune ligne de code réelle et a été corrigée en §6.3.

### 6.15 🆕 Guide "Quel navigateur choisir ?" — comparatif Android/iOS (10/07/2026)

**Demande** : au-delà du bandeau hors-ligne (§6.14) qui réagit à la perte de connexion, l'apprenant a besoin d'un repère **permanent** pour choisir son navigateur *avant même* de rencontrer un problème — en particulier parce que 🎤 Répète (`SpeechRecognition`) se comporte très différemment d'un navigateur à l'autre, y compris parmi ceux basés sur Chromium.

**Solution implémentée** : une nouvelle section d'accordéon (`.hg-section`, icône 🌐, libellé *"Quel navigateur choisir ?"*) dans le Guide de l'écran Home, dupliquée dans les deux blocs de langue (`data-lang="or"` et `data-lang="fr"` de `index.html`), positionnée juste après la section **"Hors ligne"** et avant **"Comparaison"**. Contenu 100% statique (aucune nouvelle fonction JS), cohérent avec le fait que les sections Audio et Hors ligne existantes étaient déjà statiques malgré leur dépendance à l'OS/navigateur.

**Périmètre** : comparatif des 10 navigateurs les plus utilisés au monde par part de marché (Chrome, Safari, Edge, Firefox, Opera, Samsung Internet, UC Browser, Brave, Vivaldi, DuckDuckGo), classés par fiabilité sur Android et iOS pour les 3 fonctionnalités sensibles au navigateur :

| Fonctionnalité | Ce qui varie d'un navigateur à l'autre |
|---|---|
| 🔊 Écouter (`speechSynthesis`) | Très largement supporté partout (y compris Firefox) — rarement un problème |
| 🎤 Répète (`SpeechRecognition`) | Le plus inégal : ✅ fiable sur Chrome/Samsung Internet · ⚠️ bugué de longue date sur Edge/Opera/Brave (le micro peut rester silencieux même autorisé) · ❌ jamais supporté sur Firefox (désactivé par choix de Mozilla) |
| 📲 Installation hors-ligne | Fiable sur la plupart des navigateurs Android ; sur iOS, Safari reste le seul garanti à 100%, les autres (Chrome/Edge/Opera/Brave/DuckDuckGo iOS) le permettent depuis iOS 17 mais de façon moins directe |

**Cas particulier iOS** : la section rappelle explicitement qu'Apple impose à **tous** les navigateurs sur iPhone/iPad (Chrome, Firefox, Edge, Brave, Opera, DuckDuckGo…) d'utiliser son propre moteur WebKit — donc la limitation 🎤 Répète en mode standalone documentée en §6.13 (bug WebKit #225298) s'applique à l'identique à tous ces navigateurs, pas seulement à Safari.

**Sources** : vérifiées le 10/07/2026 via caniuse.com (Speech Recognition API / Speech Synthesis API), la documentation développeur Apple sur les moteurs de navigateur alternatifs (DMA/UE), et plusieurs rapports de bugs publics confirmant le dysfonctionnement de `SpeechRecognition` sur Edge et Brave (comportement identique documenté par les deux communautés).

⚠️ **Traduction Oromo** : première version rédigée à partir du vocabulaire déjà validé ailleurs dans l'app (*browser*, *filatamaa*, *hin danda'amu*…), en cohérence avec la convention déjà suivie pour le bandeau hors-ligne (§6.14). Comme le reste des textes Oromo du projet, une relecture par un locuteur natif (voir remerciements du README — Mussa Sembro) reste recommandée avant mise en production définitive.

**⚠️ Correction du même jour (10/07/2026, suite à un retour terrain avec capture d'écran)** : la première version de cette section classait Edge/Opera/Brave/Vivaldi Android en "⚠️ limité" pour 🎤 Répète, sur la base de rapports concernant surtout la version **ordinateur** de ces navigateurs (absence de clé API cloud propriétaire de Google, cf. issues GitHub `brave/brave-browser`). Un test réel sur **Brave Android** (capture d'écran de l'apprenant : la boîte de dialogue native "souhaite utiliser votre micro" s'affiche et 🎤 Répète fonctionne) a montré que cette généralisation était erronée pour Android : sur ce système, la reconnaissance vocale des navigateurs Chromium passe par le service vocal du téléphone (Services vocaux Google) et non par une implémentation propre à chaque navigateur — ce qui explique pourquoi le problème documenté en ligne concerne principalement les versions **desktop**. Le contenu a été corrigé en conséquence : seul **Firefox** (qui n'implémente jamais `SpeechRecognition`, sur aucune plateforme) reste classé "❌" pour 🎤 Répète sur Android ; DuckDuckGo et UC Browser restent en "⚠️ moins éprouvés" par prudence générale (pas de bug spécifique confirmé, juste moins de retours). Ce début de test réel recoupe aussi le recettage du 04/07/2026 (§8), déjà effectué sur Brave Android.

---

⚠️ **Trou de documentation §6.16 / §6.17 (constaté le 12/07/2026)** : l'en-tête de `index.html` (lignes 41-45) et un commentaire de `style.css` (ligne 2882, dans §22) référencent tous deux un travail daté du **11/07/2026** — "réorganisation des rubriques du Guide (Écran 1), ajout du paragraphe *Limites audio hors ligne* (rubrique Hors ligne) et ajout du bloc *En bref* (résumé + navigateurs) en tête du Guide" — et renvoient explicitement à "Bilan_technique.md §6.17". Ce travail est bien présent dans le code (`index.html` et `style.css` ont chacun une dizaine de lignes de plus que ce que la précédente version de ce document indiquait), **mais les entrées §6.16 et §6.17 elles-mêmes n'ont jamais été rédigées dans ce fichier**. N'ayant pas réalisé ce travail et ne disposant pas du contexte complet (raisons de la réorganisation, contenu exact du paragraphe et du bloc ajoutés), la présente resynchronisation se limite à corriger les numéros de ligne impactés (tables §2, §3, §5 ci-dessus) sans reconstituer le contenu manquant de §6.16/§6.17 — à compléter par qui a réalisé ce travail, pour ne pas laisser deux numéros de section réservés mais vides.

### 6.18 🆕 Correctif export PDF bilingue + système à 3 états pour les cartes-module (12/07/2026)

**Demande** : deux retours distincts de Sébastien Godet — (1) le PDF généré depuis le Guide de l'écran Home contenait le texte des **deux langues** au lieu de la seule langue de l'apprenant ; (2) au-delà des étoiles ⭐, l'apprenant avait besoin d'un repère visuel plus net pour identifier d'un coup d'œil les modules déjà travaillés dans la grille de l'écran Sections.

**(1) Correctif `_exportGuide()` (bug)** — `index.html` déclare le Guide en double : un bloc `.home-lang-block[data-lang="or"]` et un bloc `[data-lang="fr"]`, `_buildHomeGuide()` (ligne 4230) retirant la classe `.home-lang-hidden` (`display:none`, `style.css` ligne 2826, dans §22) du seul bloc de la langue active. `_exportGuide()` (ligne 4905) lisait cependant `#homeGuideBody` dans son ensemble via `querySelectorAll('details.hg-section')`, une méthode qui **ignore le `display:none`** : les deux langues se retrouvaient donc concaténées dans le PDF. Correctif : la recherche est maintenant restreinte au bloc `.home-lang-block:not(.home-lang-hidden)` (le seul actuellement visible), sans toucher au HTML ni à `_buildHomeGuide()`.

**(2) Système à 3 états visuels pour les cartes-module** — en complément des étoiles ⭐ (inchangées), chaque carte de `_buildThemeCard()` (ligne 2379) reçoit désormais un état mutuellement exclusif :

| État | Condition | Rendu visuel |
|---|---|---|
| `state-new` | Jamais ouvert, 0 étoile | Neutre + badge `🆕 Nouveau` (coin haut-gauche) |
| `state-progress` | Ouvert au moins une fois, < 3 étoiles | Fond ambre discret (`--c-card-progress-bg`) |
| `state-complete` | 3 étoiles (100%) | Fond vert (`--c-card-complete-bg`) + coche `✓` (reprend l'ancien indicateur `.done`, désormais réservé au 100% plutôt qu'à "≥1 étoile") |

Ce système nécessite un nouveau suivi persistant, **indépendant des étoiles** : `openedThemes` (localStorage `pe_om_fr_opened_v1` / `pe_fr_om_opened_v1`, §4a — `loadOpened()`/`saveOpened()`/`markOpened()`/`isOpened()`, lignes 1447/1459/1470/1480), pour distinguer "jamais essayé" de "essayé mais raté" — deux cas qu'une simple lecture des étoiles ne permet pas de séparer. `markOpened()` est appelée depuis `openTheme()` (ligne 2447) ; `executeResetProgress()` (ligne 1583) efface aussi cette clé pour qu'une réinitialisation complète redonne le badge "Nouveau" à tous les modules, comme au tout premier lancement.

Par ailleurs : les étoiles non acquises passent de `☆` en couleur de texte par défaut à `.star-empty` (gris, opacité réduite), et un second indicateur "`✅ X / 48 terminés`" (comptant uniquement les modules à 3 étoiles, `nComplete` dans `_computeProgressFrom()`, ligne 2141) est ajouté dans l'en-tête de la grille, à côté du compteur d'étoiles déjà existant qui, lui, comptait tout module ne serait-ce qu'entamé (≥ 50%).

**Fichiers modifiés** : `app.js` (+110 lignes) et `style.css` (+61 lignes) uniquement — `index.html`, `data-fr.js`, `data-or.js`, `sw.js` et `deploy.yml` non touchés.

---

### 6.19 🆕 Vérification proactive des mises à jour PWA (12/07/2026)

**Demande** : Sébastien Godet a demandé confirmation que l'app installée se remet bien à jour toute seule dès qu'une connexion internet est disponible, et un correctif si ce n'était pas déjà garanti "dans tous les cas".

**Constat** : le mécanisme de rechargement automatique (§20) était déjà correctement en place — `sw.js` change de `CACHE_NAME` à chaque déploiement (build number injecté par `deploy.yml`), et `controllerchange` (`app.js`, appelé une fois le nouveau SW actif) déclenche un `location.reload()`. **Mais rien ne forçait activement le navigateur à revérifier `sw.js`** : ce cycle ne se déclenchait donc que selon le calendrier interne du navigateur, dont la spec autorise jusqu'à 24h de délai — un temps d'attente trop long pour une PWA rouverte plusieurs fois par jour depuis l'écran d'accueil, sans navigation classique pour forcer une revérification.

**Correctif** : ajout de `_checkForSwUpdate()` (ligne 4621) dans le bloc d'enregistrement du Service Worker (§20), qui appelle `registration.update()` — méthode standard forçant une revérification immédiate de `sw.js` — sur deux déclencheurs complémentaires :

| Déclencheur | Fréquence | Cas d'usage principal |
|---|---|---|
| `visibilitychange` → `document.visibilityState === 'visible'` | À chaque retour au premier plan | Mobile — l'utilisateur rouvre l'app installée ou y revient après avoir changé d'appli |
| `setInterval` | Toutes les 60 minutes | Filet de sécurité — onglet desktop laissé ouvert en continu, jamais mis en arrière-plan |

Dans les deux cas, si une nouvelle version est détectée, le cycle déjà en place (`install` → `skipWaiting()` → `clients.claim()` → `controllerchange` → `location.reload()`) prend le relais sans aucune action supplémentaire. Si l'appareil est hors-ligne au moment du contrôle, `registration.update()` échoue silencieusement (`.catch()` vide) et sera simplement retenté au prochain déclencheur — aucun risque de casser le mode hors-ligne existant.

Le texte du Guide Home (`index.html`, rubrique "Hors ligne" : *« L'app se met à jour automatiquement à chaque nouvelle version — il suffit de la rouvrir dans le navigateur »*) restait déjà juste et n'a pas eu besoin d'être modifié — ce correctif le rend simplement vrai plus rapidement (quasi immédiat après reconnexion, au lieu d'un délai natif pouvant aller jusqu'à 24h).

**Fichiers modifiés** : `app.js` (+43 lignes, dans §20) uniquement — `index.html`, `style.css`, `data-fr.js`, `data-or.js`, `sw.js` et `deploy.yml` non touchés.

---

### 6.20 🆕 Historique d'app.js + resynchronisation complète du plan interne (12/07/2026)

**Demande** : ajouter une période manquante dans le bloc `HISTORIQUE DE L'APPLICATION` en tête de `app.js` (08/07 → 12/07/2026, expériences utilisateurs Christophe, Elin, Maman, l'auteur), puis mettre à jour tous les commentaires à numéros de ligne devenus obsolètes suite aux différents correctifs de la session (§6.18, §6.19, cette entrée d'historique).

**Ajout d'historique** : nouvelle entrée de 3 lignes dans le bloc de commentaire d'ouverture (+4 lignes).

**Resynchronisation du plan interne** : le plan `SECTIONS DE CE FICHIER` en en-tête de `app.js` — désynchronisé depuis l'ajout de §3e (signalé sans être corrigé lors des sessions du 10/07, 11/07 et plus tôt le 12/07) — a été entièrement recalculé. Chacune des ~40 lignes du plan a été revérifiée par recherche directe (`grep`) de la fonction ou du bloc de commentaire correspondant dans le fichier réel, plutôt que par simple décalage arithmétique, pour éviter de propager une éventuelle erreur préexistante. Cette revérification a révélé que le plan ne listait pas seulement des numéros obsolètes, mais qu'il **omettait purement et simplement deux sections entières**, ajoutées à une session antérieure sans jamais être indexées :

| Section manquante | Contenu | Ligne |
|---|---|---|
| **§3e** | Bandeau hors-ligne — connectivité (voir §6.14) | 1312 |
| **§20b** | Installation PWA — bouton natif "Installer l'app" | 4659 |

Les deux ont été ajoutées au plan à leur emplacement réel dans l'ordre d'apparition du fichier, et la ligne de §20 a été complétée pour mentionner `_checkForSwUpdate()` (§6.19).

Au total, la resynchronisation du plan (avec l'ajout de ces deux entrées et de leurs lignes de description) allonge le bloc d'en-tête de **+8 lignes**, ce qui décale à son tour l'intégralité du code qui suit — la table §3 de ce document a donc été entièrement recalculée en conséquence (chaque ligne revérifiée par `grep`, pas par arithmétique seule).

**Fichiers modifiés** : `app.js` (+12 lignes au total : +4 historique, +8 plan interne) uniquement — `index.html`, `style.css`, `data-fr.js`, `data-or.js`, `sw.js` et `deploy.yml` non touchés.

**Point de vigilance résiduel** : `style.css` a un plan interne équivalent (`PLAN DU FICHIER`) qui présente le même type de désynchronisation, déjà signalée dans la note de la table §5 de ce document (session du 12/07 précédente) — non traité ici car `style.css` n'a pas été modifié dans cette session. À reprendre séparément si besoin.

---

## 7. Points de vigilance / dettes techniques

| Point | Niveau | Détail |
|---|---|---|
| `app.js` monolithique | ⚠️ Moyen | 5 299 lignes, 135 fonctions — maintenable grâce aux `§` mais migration ES modules complexe (handlers `onclick` inline). Plan interne en en-tête du fichier **resynchronisé le 12/07/2026** (voir §3), y compris les sections §3e et §20b qui en étaient absentes depuis leur création |
| 🆕 Mises à jour PWA (`registration.update()`) | ✅ OK | Vérification proactive sur retour au premier plan + toutes les 60 min, en plus du cycle natif du navigateur — voir §6.19. Échec silencieux et sans risque si hors-ligne |
| `unsafe-inline` CSP | ⚠️ Moyen | Nécessaire pour les `onclick` générés dynamiquement par `innerHTML` et pour GitHub Pages (pas de headers HTTP customs) |
| Voix Oromo TTS | ⚠️ Moyen, ✅ communiqué hors ligne | `om-ET` absente sur la plupart des appareils — l'utilisateur entend souvent du Somali ou de l'Amharique. Hors connexion, si aucune voix de la cascade n'est installée localement, la langue par défaut du système peut être utilisée à la place — désormais signalé par le bandeau hors-ligne (voir §6.14) |
| 🆕 Reconnaissance vocale (mic) en app installée iOS | ⚠️ Bloquant non corrigeable, ✅ communiqué | Limitation Apple/WebKit confirmée (bug #225298) : `service-not-allowed` systématique en mode standalone. Aucune solution côté code — badge ⚠️ sur l'onglet + message clair avant la demande de permission (voir §6.13), renforcé par le bandeau hors-ligne persistant (§6.14) |
| 🆕 Bandeau hors-ligne (Répète + Écouter) | ✅ OK | Indicateur proactif et persistant (pas seulement une erreur au clic), visible sur tous les écrans, se met à jour automatiquement via les évènements `online`/`offline` — voir §6.14 |
| 🆕 Choix du navigateur (Répète notamment) | ✅ Communiqué, non corrigeable côté code | Comparatif Android/iOS des 10 navigateurs les plus utilisés au monde, section statique dans le Guide Home — voir §6.15. Seul Firefox pose un problème confirmé pour 🎤 Répète (sur toute plateforme) ; les autres limites documentées dépendent des éditeurs tiers, pas du code de l'application |
| Quiz dynamique (Fisher-Yates) | ✅ OK | Bien implémenté — cache `_q10Questions` évite le re-shuffle si on revient sur l'onglet |
| Mode sombre | ✅ OK | `prefers-color-scheme` supporté (§24b) + correctifs WCAG AA (§29) |
| Accessibilité | ✅ Partiel | `aria-*` présents sur les éléments critiques — navigation clavier supportée (§18 CSS / §16 JS) |
| Données | ✅ OK | 48 thèmes × 2 modes — cohérence vérifiée entre `data-fr.js` et `data-or.js` |
| Icônes retour 🏠/❓ | ✅ OK | Testées en navigateur réel (Playwright/Chromium) : destinations, aria-label, absence d'erreur JS |
| Carte(s) de progression Home | ✅ OK | Testé pour 0, 1 (parcours actif ou non) et 2 parcours — pas de `:has()` CSS (incompatible Safari < 15.4, hors cible iOS 14.5+) |
| Compatibilité `:has()` CSS | ✅ OK | Évité volontairement ; taille de cercle pilotée par classe JS (`--single`) plutôt que par sélecteur `:has()` |
| 🆕 Suivi "modules déjà ouverts" (badge Nouveau) | ✅ OK, ⚠️ 3ᵉ clé localStorage par mode | `openedThemes` (§6.18) s'ajoute à `done` : deux clés indépendantes par mode à surveiller en cas d'évolution du système de progression. `isOpened()` retombe sur `isDone()` par sécurité (anciennes progressions déjà sauvegardées avant l'ajout de cette clé ne réaffichent pas "Nouveau" à tort) |

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
| 09/07/2026 | 🆕 Étape 1 : ajout d'un bandeau hors-ligne persistant et proactif (`#offline-banner`), couvrant séparément 🎤 Répète (jamais disponible hors ligne) et 🔊 Écouter (disponible hors ligne mais langue non garantie) — Sébastien Godet + Claude Sonnet 5 |
| 10/07/2026 | 🆕 Étape 2 : resynchronisation de ce Bilan technique avec le code réel après l'ajout du bandeau hors-ligne (tables `app.js` / `style.css` / `index.html`, nouvelle section §6.14) ; confirmation qu'aucun tri de voix « locale/distante » n'existe dans le code — la cascade `_resolveOromoVoice()` reste une priorité phonétique par langue (voir §6.3) — Sébastien Godet + Claude Sonnet 5 |
| 10/07/2026 | 🆕 Étape 3 : ajout d'une section "Quel navigateur choisir ?" dans le Guide Home — comparatif Android/iOS des 10 navigateurs les plus utilisés au monde (🔊 Écouter / 🎤 Répète / 📲 Installation hors-ligne), avec resynchronisation des numéros de ligne (`index.html` : 1 138 → 1 239, `style.css` : 4 358 → 4 370) — Sébastien Godet + Claude Sonnet 5 |
| 10/07/2026 | 🆕 Étape 4 : correction du contenu ci-dessus suite à un retour terrain (capture d'écran, Brave Android — 🎤 Répète fonctionnel) : Edge/Opera/Brave/Vivaldi reclassés "✅ Recommandés" sur Android (seul Firefox reste problématique pour 🎤 Répète, sur toute plateforme) — Sébastien Godet + Claude Sonnet 5 |
| 10/07/2026 | 🆕 Étape 5 : resynchronisation complète des commentaires à numéros de ligne dans `index.html` (renumérotation `<!-- 5bis -->` → `<!-- 6 -->`, décalage en cascade jusqu'à `<!-- 9. À propos -->`) et dans `style.css` (le `PLAN DU FICHIER` en en-tête, resté périmé depuis l'ajout de §16b, a été entièrement recalculé et corrigé — §1 à §29) ; mise à jour de ce Bilan (§2, §4, §5, §6.10) et du README en conséquence (`index.html` : 1 246 lignes, `style.css` : 4 373 lignes) — Sébastien Godet + Claude Sonnet 5 |
| 12/07/2026 | 🆕 Étape 6 : correctif `_exportGuide()` (le PDF du Guide contenait les deux langues au lieu de la seule langue de l'apprenant) + système à 3 états visuels pour les cartes-module de l'écran Sections (nouveau / en cours / terminé à 100%, badge "Nouveau", compteur "✅ X/48 terminés") en complément des étoiles ⭐ — voir §6.18. Resynchronisation complète des tables §2/§3/§4/§5 de ce Bilan (`app.js` : 5 244 lignes, `style.css` : 4 467 lignes) ; au passage, un trou de documentation préexistant a été identifié et signalé (§6.16/§6.17 référencés dans le code depuis le 11/07/2026 mais jamais rédigés dans ce fichier — non comblé faute de contexte, voir note en fin de section 6) — Sébastien Godet + Claude Sonnet 5 |
| 12/07/2026 | 🆕 Étape 7 : vérification proactive des mises à jour PWA — `registration.update()` déclenché au retour au premier plan (`visibilitychange`) et toutes les 60 min (`setInterval`), en complément du cycle `skipWaiting`/`clients.claim`/`controllerchange` déjà en place — voir §6.19. Table §3 (lignes §20/§21) et compteur `app.js` (5 287 lignes) resynchronisés en conséquence — Sébastien Godet + Claude Sonnet 5 |
| 12/07/2026 | 🆕 Étape 8 : ajout d'une période dans l'historique en en-tête de `app.js` (08/07 → 12/07/2026) + resynchronisation complète du plan interne `SECTIONS DE CE FICHIER`, désynchronisé depuis l'ajout de §3e — deux sections entières (§3e, §20b) en étaient absentes et ont été ajoutées — voir §6.20. Table §3 entièrement revérifiée par recherche directe et compteur `app.js` (5 299 lignes) à jour — Sébastien Godet + Claude Sonnet 5 |

*Journal détaillé (dont la citation complète du retour de recettage du 03/07) : voir le bloc de commentaire `HISTORIQUE DE L'APPLICATION` en tête de `app.js`.*
