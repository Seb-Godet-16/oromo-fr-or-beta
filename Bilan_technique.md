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
| Taille totale du code source | ~678 Ko (6 fichiers principaux, 14 171 lignes) |
| Indicateur hors-ligne | ✅ Bandeau persistant, proactif (couvre 🎤 Répète ET 🔊 Écouter — voir §6.14) |
| Guide navigateur | 🆕 Comparatif Android/iOS des 10 navigateurs les plus utilisés au monde (voir §6.15) |

---

## 2. Architecture des fichiers

### Taille et lignes exactes

| Fichier | Taille | Lignes | Rôle |
|---|---|---|---|
| `js/app.js` | 213 Ko | 5 119 | Moteur applicatif complet (124 fonctions, dont le bandeau hors-ligne §3e) |
| `css/style.css` | 142 Ko | 4 373 | Styles + système de thèmes dual (dont §16b bandeau hors-ligne) |
| `js/data-fr.js` | 106 Ko | 1 427 | Dataset mode "Apprendre le Français" |
| `js/data-or.js` | 103 Ko | 1 382 | Dataset mode "Apprendre l'Oromo" |
| `index.html` | 82 Ko | 1 246 | Structure HTML — 5 écrans + 2 modales + bandeau hors-ligne + guide "Quel navigateur choisir ?" |
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
| — | Utilitaire bilingue | `L()`, `isFrench()`, `_isIosPwaStandalone()`, `langKeys()` | **156 / 163 / 182 / 216** |
| 2 | Point d'entrée | `_loadDataScript()`, `initApp(mode)` | **278 / 308** |
| 3 | Synthèse vocale TTS | `_resolveOromoVoice()`, `speak()`, `_doSpeak()` | **533 / 745 / 829** |
| 3b | Retour haptique | `_vibrateFeedback()` | **1118** |
| 3b2 | Confetti | `_launchConfetti()` | **1156** |
| 3c | Interruption audio | `visibilitychange` (écouteur) | **section 1210** |
| 3d | KeepAlive watchdog | `_startTtsKeepAlive()`, `_stopTtsKeepAlive()` | **1269 / 1281** |
| 3e | 🆕 Bandeau hors-ligne (connectivité) | `_offlineBannerShortText()`, `_offlineBannerDetailHTML()`, `_updateOfflineBanner()`, `_toggleOfflineBannerDetail()` | **1333 / 1346 / 1365 / 1384** (section **1293**) |
| 4 | Persistance progression | `loadDone()`, `saveDone()`, `markDone()` | **1417 / 1429 / 1590** |
| 4c | Réinitialisation | `confirmResetProgress()`, `executeResetProgress()` | **1480 / 1534** (dans §4) |
| 4b | Session quiz | `_saveQuizSession()`, `_restoreQuizSession()` | **1676 / 1695** |
| 5 | Navigation | `showScreen()` | **1781** |
| 5b | Navigation basse | `_updateBottomNav()`, `navGoModules()`, `lessonGoBack()` | **1906 / 1989 / 2005** |
| 5b | Icônes retour Sections | `goToAccueil()`, `goToGuide()` | **2017 / 2027** |
| 5b | Navigation leçon | `lessonNav()` | **2040** |
| 6 | Écran Home — progression | `_computeProgressFrom()`, `_getProgress()`, `_getOtherModeProgress()` | **2087 / 2104 / 2118** |
| 6 | Écran Home — rendu | `renderHome()`, `_buildProgressCardHTML()` | **2131 / 2195** |
| 7 | Écran Sections | `renderSections()`, `_buildThemeCard()` | **2233 / 2305** |
| 8 | Ouverture thème | `openTheme()`, badge ⚠️ onglet Répète (`repeatWarnTitle`), `switchTab()` | **2347 / 2438 / 2497** |
| 9 | Cartes Flash | `renderFlash()`, `flipCard()`, `nextCard()` | **2538 / 2670 / 2679** |
| 10 | Quiz 10 questions | `_generateQuiz()`, `renderQuiz10()`, `checkQ10()` | **2793 / 2857 / 2977** |
| 11 | Dialogue | `renderDialog()`, `pickSit()` | **3032 / 3076** |
| 12 | Vocabulaire | `renderVocab()` | **3092** |
| 13b | Onglet Répète | `_matchRepeat()`, `renderRepeat()`, garde iOS standalone (ligne 3383), `repeatRecord()` | **3218 / 3347 / 3670** |
| 13 | Quiz Dialogue | `renderDialogQuiz()`, `checkDQ()` | **3885 / 3953** |
| 14 | Utilitaires | `_quizResultStrings()`, `esc()`, `escJS()` | **3995 / 4029 / 4049** |
| 17 | Guide / Onboarding | `_buildHomeGuide()`, `_maybeShowOnboarding()` | **4129 / 4218** |
| 18 | Crédits | `showCredits()`, `closeCreditsModal()` | **4248 / 4299** |
| 15 | Launcher init | Initialisation au chargement | **≈4315** |
| 16 | Accessibilité clavier | Navigation clavier globale | **4324** |
| 19 | Spinner / Viewport | `_showLoadingSpinner()`, `setAppHeight()` (fix Android Chrome) | **4348 / 4406** |
| 20 | Service Worker | Enregistrement PWA (`navigator.serviceWorker.register`) | **appel : 4479** |
| 21 | Exports PDF | `_exportGuide()`, `_exportVocab()`, `_exportSituation()` | **4789 / 4895 / 4991** |

*Table entièrement revérifiée et resynchronisée avec le code le 10/07/2026 — toutes les lignes ci-dessus ont été reconfirmées par recherche directe dans `app.js` (5 119 lignes actuelles, contre 4 845 lors de la précédente resynchronisation du 08/07). L'écart provient essentiellement de l'ajout de la nouvelle section **§3e (bandeau hors-ligne, voir §6.14)**, qui décale d'environ 130 lignes tout ce qui la suit dans le fichier. À noter : le plan interne en en-tête de `app.js` (`SECTIONS DE CE FICHIER`) n'a, cette fois, **pas** été mis à jour lors de l'ajout de §3e — il continue de lister les anciens numéros de ligne et ne mentionne pas §3e du tout ; il ne doit donc plus être considéré comme une référence fiable tant qu'il n'aura pas été retouché.*

*Repères utiles pour les prochaines évolutions (voir §6.11 à §6.14) : `_TOTAL_THEMES_PER_MODE` (ligne 115), `_setAttrBi()` (ligne 434), `_isIosPwaStandalone()` (ligne 182, réutilisé dans `renderRepeat()` ligne 3383, `repeatRecord()` ligne 3706 et `_openPrintWindow()` ligne 4623).*

---

## 4. Sections de `style.css` — numéros de lignes exacts

| § | Section | Ligne |
|---|---|---|
| §1 | Reset & base globale | 73 |
| §2 | Variables de thème `:root` (fallback) | 197 |
| §3 | Thème Français `html.theme-french` | 260 |
| §4 | Thème Oromo `html.theme-oromo` | 300 |
| §5 | Écran 0 — Lanceur | 335 |
| §6 | Écran 1 — Accueil #home | 541 |
| §7 | Écran 2 — Sections | 607 |
| §8 | Écran 3 — Leçon (dont `.back-btn-icon`, 🏠/❓) | 732 (icônes : 950) |
| §9 | Flashcards | 1011 |
| §10 | Alphabet | 1213 |
| §11 | Quiz | 1313 |
| §12 | Dialogues / Situations | 1418 |
| §13 | Vocabulaire | 1523 |
| §14 | Modale Remerciements | 1591 |
| §15 | Footer commun | 1678 |
| §16 | Toast notification | 1698 |
| §16b | 🆕 Bandeau hors-ligne persistant (`#offline-banner`) | 1734 |
| §17 | Onglet Répète | 1798 |
| §18 | Focus clavier | 2096 |
| §19 | Guide utilisateur `.ob-*` (dont 🆕 listes du guide navigateur) | 2114 (listes : 2356) |
| §20 | Spinner de chargement | 2582 |
| §22 | Écran Home redesigné | 2619 |
| §23 | Écran Sections redesigné (dont `.back-btn-group`) | 2930 (groupe : 2955) |
| §24 | Responsive tablette & desktop | 3060 |
| §24b | Mode sombre `prefers-color-scheme` | 3150 |
| §24c | Responsive mode paysage mobile | 3261 |
| §25 | Boutons export PDF | 3323 |
| §26 | Barre de navigation basse | 3423 |
| §27 | Onglets Niveau 1 / 2 | 3550 |
| §28 | Écrans sections (no-scroll fix) | 3645 |
| §20e | Grille thèmes dans les écrans level | 3843 |
| §CONFETTI | Animation ⭐⭐⭐ | 3864 |
| §PROGRESS | Carte(s) de progression Home (1 ou 2 selon parcours) | 3935 |
| §CONFIRM | Modale confirmation suppression | 4058 |
| §ANTISPAM | Email affiché à l'envers (RTL CSS) | 4177 |
| §SPEAKING | Feedback visuel bouton audio (TTS) | 4204 |
| §29 | Correctifs accessibilité mode sombre (WCAG AA) | 4262 |

*Table intégralement revérifiée et resynchronisée le 10/07/2026 (4 373 lignes actuelles) — chaque ligne ci-dessus a été reconfirmée par recherche directe dans `style.css`, y compris §1 à §19 (inchangés depuis le 08/07) et §20 à §29 (décalés de +15 lignes par l'ajout des règles `.ob-audio-block ul` du guide navigateur, voir §6.15). **Le plan interne en en-tête du fichier (`PLAN DU FICHIER`) a cette fois été entièrement corrigé et remis en phase avec le code réel** — il n'était plus fiable depuis l'ajout de §16b (voir historique) ; ce n'est plus le cas. §PROGRESS reste la refonte du 06/07/2026 : l'ancien cercle SVG unique (`.home-progress-circle-wrap`) est remplacé par `.home-progress-wrap` + `.home-progress-card`, capable d'afficher 1 ou 2 cartes.*

---

## 5. Sections de `index.html`

| Section | ID / Description | Ligne |
|---|---|---|
| `<head>` | Meta, CSP, PWA, Open Graph | 1 |
| Bandeau | 🆕 `#offline-banner` — Bandeau hors-ligne persistant (voir §6.14) | 127 |
| Écran 0 | `#app-launcher` — Lanceur | 146 |
| Écran 1 | `#home` — Guide / Onboarding (dont `#homeProgressWrap` 🆕) | 249 |
| Écran 2a | `#sections-level1` — Grille Niveau 1 (dont icônes 🏠/❓ 🆕) | 1005 |
| Écran 2b | `#sections-level2` — Grille Niveau 2 (dont icônes 🏠/❓ 🆕) | 1037 |
| Écran 3 | `#lesson` — Leçon (5 onglets) | 1074 |
| Modale 1 | `#credits-modal` — Remerciements | 1153 |
| Modale 2 | `#custom-confirm-modal` — Confirmation suppression | 1186 |
| Nav | `#bottom-nav` — Barre de navigation basse | 1202 |
| Scripts | Chargement de `app.js` | 1244 |

*Table resynchronisée le 10/07/2026 (1 246 lignes actuelles — voir §6.15 pour le détail complet : ajout de la section "Quel navigateur choisir ?", sa correction suite à un retour terrain, et la renumérotation des commentaires de section qui la suivent, `<!-- 6. ... -->` à `<!-- 9. ... -->`).*

---

## 6. Décisions techniques majeures

### 6.1 Système de thème dual (CSS)
Une seule classe sur `<html>` (`theme-french` ou `theme-oromo`) bascule l'intégralité du rendu visuel via les variables CSS `var(--c-*)`. Aucun chargement dynamique de CSS supplémentaire.

### 6.2 Chargement lazy des données
`initApp(mode)` injecte dynamiquement `<script src="data-fr.js">` ou `<script src="data-or.js">` dans le DOM. Seul le dataset du mode choisi (~100 Ko) est chargé en mémoire JS — l'autre reste en cache disque Service Worker.

### 6.3 Cascade TTS pour l'Oromo
La voix Oromo native (`om-ET`) est quasi absente des appareils. `_resolveOromoVoice()` (**ligne 533**) tente, dans cet ordre : `om-ET` → `so-SO` → `am-ET` → `ha-NG` → `sw-KE` → `es-ES` → `it-IT`. L'onglet Répète a sa propre cascade `_resolveRepeatLangOromo()` (**ligne 3432**) avec le même ordre.

**Précision importante** (voir aussi §6.14) : ce classement est une **cascade de priorité phonétique par langue** — la première voix disponible dont le code langue (`voice.lang`) correspond à l'une des langues de la liste ci-dessus, dans cet ordre. Ce n'est **pas** un tri entre voix « locales » (embarquées sur l'appareil) et voix « distantes » (nécessitant une connexion réseau) : le code ne lit, n'inspecte ni n'utilise nulle part la propriété `voice.localService` de la Web Speech API, et aucune fonction du fichier ne trie ni ne filtre les voix selon leur origine locale/réseau. Concrètement, hors ligne, `speechSynthesis.getVoices()` ne renvoie de toute façon que les voix effectivement installées sur l'appareil à ce moment-là ; la cascade choisit simplement la meilleure correspondance phonétique parmi celles-ci — si aucune ne correspond, c'est la voix par défaut du système qui est utilisée (langue non garantie).

### 6.4 Algorithme de correspondance Répète
`_matchRepeat()` combine correspondance exacte + distance de Levenshtein (`_levenshtein()`, **ligne 3263**) pour tolérer les erreurs de prononciation mineures lors de la reconnaissance vocale.

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
L'adresse email est affichée en écriture RTL CSS dans `index.html` (**ligne 216**) et dans les guides onboarding (lignes **620** et **988**), masquant la vraie adresse aux scrapers. Le clic copie l'adresse corrigée dans le presse-papier.

### 6.11 🆕 Navigation retour Sections — deux destinations distinctes (06/07/2026)
L'ancien bouton unique `← Retour` de l'écran Sections est remplacé par deux icônes (`goToAccueil()` ligne 2017, `goToGuide()` ligne 2027) :
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
| Onglet **Répète** — barre d'onglets (`openTheme()`, ligne 2347) | Badge `⚠️` ajouté directement sur le libellé de l'onglet + `title` explicatif, visible **avant même que l'apprenant ne touche l'onglet** |
| Onglet **Répète** — ouverture (`renderRepeat()`, garde ligne 3383) | Message d'indisponibilité clair affiché **avant** la demande de permission micro (évite une demande inutile qui échouera de toute façon) |
| Bouton micro (`repeatRecord()` → `onerror`, ligne 3706) | Filet de sécurité : si `service-not-allowed` survient quand même (navigation privée, Dictée désactivée, app tierce type SafariViewController), message spécifique au lieu du texte brut de l'erreur |

**Limite assumée** : sur iPhone/iPad, l'onglet Répète ne fonctionnera **jamais** dans l'app installée sur l'écran d'accueil — seulement dans un onglet Safari classique. C'est communiqué à l'apprenant, pas corrigé (aucune correction possible côté web).

### 6.12 🆕 Carte(s) de progression sur l'écran Home (06/07/2026)
Le cercle SVG unique de l'écran Home est remplacé par 0, 1 ou 2 « cartes » (drapeau + cercle % + étoiles + nombre de modules), selon les parcours ayant de la progression :

| Situation | Affichage |
|---|---|
| Aucun parcours commencé | Rien (pas de barre vide) |
| Un seul parcours a de la progression | 1 carte, pour ce parcours (actif **ou** l'autre) |
| Les deux parcours ont de la progression | 2 cartes côte à côte (🇫🇷 et 🇪🇹) |

Le nombre total de thèmes de l'AUTRE parcours (48, identique dans les deux modes) est une constante figée (`_TOTAL_THEMES_PER_MODE`, ligne 115) plutôt que lu depuis son dataset — évite d'injecter le `data-*.js` de l'autre mode juste pour afficher une statistique. La progression elle-même est lue directement dans son `localStorage` (`_getOtherModeProgress()`, ligne 2118).

### 6.14 🆕 Bandeau hors-ligne persistant — Répète ET Écouter (09-10/07/2026)

**Constat de départ** : un indicateur *réactif* (un message d'erreur affiché seulement après le clic sur 🎤 ou 🔊) laissait l'apprenant découvrir la limitation trop tard, et n'expliquait qu'un seul des deux cas. Les deux fonctions audio sont pourtant affectées différemment par le mode hors-ligne, pour des raisons techniques distinctes :

| Fonction | Hors ligne | Raison technique |
|---|---|---|
| 🎤 **Répète** (`SpeechRecognition`) | ❌ Ne fonctionne **jamais** | Chrome, Edge et Safari envoient tous l'enregistrement audio à un service cloud (serveurs Google/Apple) pour le transcrire — aucune de ces implémentations ne fait la reconnaissance sur l'appareil. C'est une limite de l'API elle-même, vraie sur n'importe quel site utilisant le micro, pas un bug de cette application. |
| 🔊 **Écouter** (`speechSynthesis`) | ⚠️ Peut fonctionner, **mais langue non garantie** | Fonctionne hors ligne uniquement si une voix est déjà installée sur le système (souvent le cas). Si la voix ciblée par la cascade (§6.3) n'est pas installée localement, `speechSynthesis` retombe silencieusement sur la voix par défaut du système — l'apprenant peut alors entendre une langue différente du français ou de l'oromo attendu, sans message d'erreur explicite. |

**Correctif implémenté** — un bandeau persistant (`#offline-banner`, `index.html` ligne 127), piloté par `app.js` §3e et stylé par `style.css` §16b :

| Élément | Emplacement | Rôle |
|---|---|---|
| `_updateOfflineBanner()` | `app.js` ligne 1365 | Affiche/masque le bandeau ; écoute les évènements natifs `online`/`offline` (`window.addEventListener`, ligne 1394-1395) et est aussi appelée à chaque rendu de l'écran Home |
| `_offlineBannerShortText()` | `app.js` ligne 1333 | Résumé toujours visible sur une ligne (ex. *« 📴 Hors ligne — 🎤 Répète indisponible · 🔊 Écouter possible, langue non garantie »*) |
| `_offlineBannerDetailHTML()` | `app.js` ligne 1346 | Détail dépliable expliquant séparément les deux cas (texte ci-dessus, sans jargon technique pour l'apprenant) |
| `_toggleOfflineBannerDetail()` | `app.js` ligne 1384 | Déplie/replie le détail au tap sur le résumé, pour ne pas monopoliser l'espace écran en permanence |

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

## 7. Points de vigilance / dettes techniques

| Point | Niveau | Détail |
|---|---|---|
| `app.js` monolithique | ⚠️ Moyen | 5 119 lignes, 124 fonctions — maintenable grâce aux `§` mais migration ES modules complexe (handlers `onclick` inline). Le plan interne en en-tête du fichier n'a pas été remis à jour depuis l'ajout de §3e (voir note §3) |
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

*Journal détaillé (dont la citation complète du retour de recettage du 03/07) : voir le bloc de commentaire `HISTORIQUE DE L'APPLICATION` en tête de `app.js`.*
