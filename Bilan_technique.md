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
| Thèmes par mode | 53 (37 Niveau 1 Vocabulaire + 16 Niveau 2 Dialogue) |
| Mots/expressions par mode | ~387 entrées (Français) · ~396 entrées (Oromo) |
| Fonctionnement hors-ligne | ✅ 100 % après première visite (Service Worker) |
| Taille totale du code source | ~868 Ko (6 fichiers principaux, 17 546 lignes — recalculé le 31/08/2026, voir §6.32 et §2) |
| Indicateur hors-ligne | ✅ Bandeau persistant, proactif (couvre 🎤 Répète ET 🔊 Écouter — voir §6.14) |
| Guide navigateur | 🆕 Comparatif Android/iOS des 10 navigateurs les plus utilisés au monde (voir §6.15) |
| Repérage visuel des modules | 🆕 Système à 3 états (nouveau / en cours / terminé à 100%) en plus des étoiles ⭐ (voir §6.18) |
| Mises à jour PWA | 🆕 Vérification proactive (retour au premier plan + filet toutes les 60 min), en plus du cycle natif du navigateur (voir §6.19) |
| Grille Niveau 1 | 🆕 37 thèmes regroupés en 6 catégories repliables + carte "▶ Continuer" ciblant le prochain thème pertinent (voir §6.27) |
| Grille Niveau 2 | 🆕 16 dialogues regroupés en 4 catégories repliables + sa propre carte "▶ Continuer" (voir §6.28) |
| En-tête écran Leçon | 🆕 2 lignes au lieu de 3 — flèches de nav fusionnées dans la rangée du titre, harmonisé avec l'appli sœur espagnole (voir §6.29) |
| Flashcards / carte Répète | 🆕 Taille adaptée au contenu réel (recto/verso mesurés), avec repli sur le scroll de page pour les cas extrêmes (voir §6.30) |
| Remerciements — Mussa Sembro | 🆕 Retour terrain crédité (interface trop chargée pour de grands débutants), distinct de la traduction — dans les 4 emplacements "remerciements" de l'app, FR + brouillon Oromo (voir §6.31) |

---

## 2. Architecture des fichiers

### Taille et lignes exactes

| Fichier | Taille | Lignes | Rôle |
|---|---|---|---|
| `js/app.js` | 292 Ko | 6 549 | Moteur applicatif complet (dont le bandeau hors-ligne §3e, le suivi "modules déjà ouverts" §7, la vérification proactive des mises à jour SW §20 — voir §6.19 —, le clin d'œil mascotte sur quiz sans-faute §14 — voir §6.22 —, l'écran Home+Guide fusionné et `goToHome()` supprimée — voir §6.24 —, la modale "Nav verrouillée" `#nav-locked-modal` + suppression du stub mort `_closeOnboarding()` — voir §6.25 —, le regroupement des Niveaux 1 ET 2 en catégories repliables + carte "Continuer" (`THEME_CATEGORIES_L1`/`THEME_CATEGORIES_L2`, `_buildCategorizedGrid()` partagée, §7) — voir §6.27/§6.28 —, l'audit anti-fuite audio/micro `_stopAllAudioAndMic()` sur 11 points de navigation, la taille des flashcards/carte Répète adaptée au contenu réel (`_adjustFlashcardHeight()`) + phrase d'intro Répète déplacée dans le panneau Réglages audio — voir §6.30 —, le bullet Mussa Sembro de la modale crédits (§18/`showCredits()`) — voir §6.31 —, et 🆕 l'auto-dépli d'une seule catégorie au démarrage (`_computeAutoOpenCategoryIds()`, §7) + indice redondant retiré des flashcards (§9) + bullet Mussa reformulé (§18) — voir §6.32 ; plan interne `SECTIONS DE CE FICHIER` **resynchronisé le 31/08/2026 pour §7 à §21c** (voir §6.32 — recalcul intégral par recherche directe, dérive préexistante signalée en §6.31 résorbée sur ce périmètre ; §1 à §6 non revérifiées, hors périmètre) |
| `css/style.css` | 196 Ko | 5 490 | Styles + système de thèmes dual (dont §16b bandeau hors-ligne, §7 états visuels des cartes-module, §2 tokens de marque `--c-flag-red/black/cream` — voir §6.22 —, l'écran Home+Guide fusionné (agencement VACHÉBO) — voir §6.24 —, §NAVLOCKED, la modale "Nav verrouillée" — voir §6.25 —, §20f, catégories Niveau 1 ET 2 + carte "Continuer" via la classe générique `.categories-body` — voir §6.27/§6.28 —, l'en-tête Leçon fusionné à 2 lignes — voir §6.29 —, la classe `.fc-tall` (repli scroll de page pour les flashcards trop hautes) + `.repeat-card` allégée — voir §6.30 —, et 🆕 `.fc-front-hint` (base + mode sombre) supprimée, devenue orpheline après le retrait de l'indice redondant des flashcards — voir §6.32 |
| `js/data-fr.js` | 113 Ko | 1 532 | Dataset mode "Apprendre le Français" — 37 thèmes Niveau 1 (voir §6.26) |
| `js/data-or.js` | 110 Ko | 1 487 | Dataset mode "Apprendre l'Oromo" — 37 thèmes Niveau 1 (voir §6.26) |
| `index.html` | 124 Ko | 1 864 | Structure HTML — 5 écrans (Home et Guide de nouveau fusionnés en un seul `#home`, voir §6.24) + 3 modales (dont `#nav-locked-modal`, voir §6.25) + bandeau hors-ligne + guide "Quel navigateur choisir ?" + logo étendu aux écrans Sections (§6.22) + `#grid1` ET `#grid2` en `.categories-body` (catégories Niveau 1 et 2, voir §6.27/§6.28) + en-tête Leçon fusionné à 2 lignes (voir §6.29) + paragraphe Remerciements Mussa Sembro — voir §6.31 —, et 🆕 scindé en 2 paragraphes distincts (Mussa Sembro / mes parents en gras) — voir §6.32 ; **⚠️ écart préexistant signalé** (non lié à §6.31/§6.32, hors périmètre) : cette table indiquait encore 1 821 lignes avant le 30/08/2026, alors que le fichier réellement reçu en comptait déjà 1 817 — non expliqué, non repris ici |
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
 [Sections]  →  53 modules (Niv. 1 × 37 + Niv. 2 × 16) ; 🆕 les deux
     │      ╲     niveaux regroupés en catégories repliables (6 pour
     ▼       ╲    Niv. 1, 4 pour Niv. 2) + leur propre carte
     ▼       ╲    "▶ Continuer" (voir §6.27/§6.28)
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
- **❓** (`goToGuide()`) → écran `#home` (dashboard + guide explicatif bilingue, écran unique depuis la fusion du 24/07/2026 — voir §6.24) — identique au bouton "Guide" de la nav basse. Le nom `goToGuide()` est conservé tel quel pour ne pas toucher tous les `onclick="goToGuide()"` du HTML, même si la cible n'est plus un écran `#guide` distinct (celui-ci a existé quelques heures le 24/07/2026 avant d'être refusionné avec `#home`, voir §6.23 puis §6.24).

🆕 **(25/07/2026, §6.25)** Sur le Lanceur, avant tout choix de langue, `navGoModules()` et `showOnboardingGuide()` (déclenchés par 📚/❓ de la nav basse) affichent désormais une petite modale bilingue (`#nav-locked-modal`) au lieu de tenter une navigation incohérente — voir §6.25.

---

## 3. Sections de `app.js` — numéros de lignes exacts

⚠️ **Table non resynchronisée lors de cette session** (§6.25, 25/07/2026) — comme signalé en §6.22/§6.23, elle reflète encore une session antérieure (avant la séparation puis la refusion de Home/Guide, §6.23/§6.24) et nécessiterait une resynchronisation ligne-par-ligne dédiée. Elle ne montre donc ni la fusion Home+Guide (`_buildHomeGuide()`, `goToHome()` supprimée) ni la modale "Nav verrouillée" (`openNavLockedModal()`/`closeNavLockedModal()`) ni la suppression du stub `_closeOnboarding()` — voir le plan interne à jour en en-tête de `app.js`, ou §6.24/§6.25 ci-dessous, pour les repères exacts et actuels.

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
| 17 | Guide / Onboarding | `_buildHomeGuide()`, `_maybeShowOnboarding()` | **4242 / 4334** |
| 18 | Crédits | `showCredits()`, `closeCreditsModal()` | **4364 / 4415** |
| 15 | Launcher init | Initialisation au chargement | **≈4422** |
| 16 | Accessibilité clavier | Navigation clavier globale | **4455** |
| 19 | Spinner / Viewport | `_showLoadingSpinner()`, `setAppHeight()` (fix Android Chrome) | **4479 / 4537** |
| 20 | Service Worker | Enregistrement PWA (`navigator.serviceWorker.register`) + 🆕 `_checkForSwUpdate()` (§6.19) | **appel : 4644 / `_checkForSwUpdate()` : 4636** |
| 20b | 🆕 Installation PWA | Bouton natif "Installer l'app" (Android/Chrome) | **section 4662** |
| 21 | Exports PDF | `_exportGuide()` 🆕 corrigé (§6.18), `_exportVocab()`, `_exportSituation()` | **4963 / 5078 / 5174** |

*Table entièrement revérifiée et resynchronisée le 12/07/2026 — toutes les lignes ci-dessus ont été reconfirmées par recherche directe dans `app.js` (**5 303 lignes** au total). Un nouveau décalage de **+3 lignes**, portant sur tout le contenu à partir de `_maybeShowOnboarding()` (§17) jusqu'à la fin du fichier, avait été introduit entre la précédente resynchronisation (§6.20) et la présente session, sans qu'aucune section entière ne soit cette fois manquante — voir **§6.21**.*

*Repères utiles pour les prochaines évolutions (voir §6.11 à §6.15, §6.18 à §6.21) : `_TOTAL_THEMES_PER_MODE` (ligne 131), `_setAttrBi()` (ligne 453), `_isIosPwaStandalone()` (ligne 198, réutilisé dans `renderRepeat()` ligne 3496, `repeatRecord()` ligne 3841 et `_openPrintWindow()` ligne 4797).*

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

*Table revérifiée le 12/07/2026 (**4 467 lignes actuelles**, inchangé depuis la précédente session) — chaque ligne ci-dessus reste reconfirmée par recherche directe dans `style.css`. **Le plan interne en en-tête du fichier (`PLAN DU FICHIER`), resté périmé depuis le 10/07/2026 (signalé dans la session précédente sans être corrigé), a cette fois été intégralement recalculé** — voir **§6.21** : chacune de ses ~40 lignes a été revérifiée par recherche directe plutôt que par simple arithmétique, et fait à nouveau foi au même titre que cette table. §PROGRESS reste la refonte du 06/07/2026 : l'ancien cercle SVG unique (`.home-progress-circle-wrap`) est remplacé par `.home-progress-wrap` + `.home-progress-card`, capable d'afficher 1 ou 2 cartes.*

---

## 5. Sections de `index.html`

| Section | ID / Description | Ligne |
|---|---|---|
| `<head>` | Meta, CSP, PWA, Open Graph | 1 |
| Bandeau | 🆕 `#offline-banner` — Bandeau hors-ligne persistant (voir §6.14) | 132 |
| Écran 0 | `#app-launcher` — Lanceur | 151 |
| Écran 1 | `#home` — Guide / Onboarding (dont `#homeProgressWrap` 🆕) | 254 |
| Écran 2a | `#sections-level1` — Grille Niveau 1 (dont icônes 🏠/❓ 🆕) | 1065 |
| Écran 2b | `#sections-level2` — Grille Niveau 2 (dont icônes 🏠/❓ 🆕) | 1097 |
| Écran 3 | `#lesson` — Leçon (5 onglets) | 1134 |
| Modale 1 | `#credits-modal` — Remerciements | 1213 |
| Modale 2 | `#custom-confirm-modal` — Confirmation suppression | 1246 |
| Nav | `#bottom-nav` — Barre de navigation basse | 1262 |
| Scripts | Chargement de `app.js` | 1304 |

*Table resynchronisée le 12/07/2026 (**1 307 lignes actuelles**, contre 1 298 dans la précédente table de ce document). `index.html` n'a pas été modifié fonctionnellement pendant cette session — seul son plan interne en en-tête (`PLAN DU FICHIER`) a été recalculé (voir §6.21) : les **+9 lignes** d'écart avec la précédente table proviennent d'un travail antérieur (daté du 11/07/2026 dans l'en-tête du fichier) déjà partiellement documenté en §6.16/§6.17.*

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

### 6.21 🆕 Relecture complète et resynchronisation des commentaires à numéros de ligne (12/07/2026)

**Demande** : relire l'ensemble de l'application et mettre à jour les commentaires (et leurs numéros de ligne) ainsi que le README et ce Bilan technique si nécessaire.

**Constat** : aucune ligne de code fonctionnel n'a été modifiée dans cette session — uniquement des commentaires. Trois plans internes se sont révélés périmés à des degrés divers :

| Fichier | Plan interne | État avant cette session | Correctif |
|---|---|---|---|
| `app.js` | `SECTIONS DE CE FICHIER` | Décalage de **+3 lignes** sur tout le contenu situé après `_maybeShowOnboarding()` (§17), apparu depuis la resynchronisation du §6.20 sans qu'aucune section ne soit cette fois manquante | Chacune des ~13 lignes concernées revérifiée par recherche directe et corrigée |
| `style.css` | `PLAN DU FICHIER` | Périmé depuis le 10/07/2026 (signalé à plusieurs reprises — §6.20 — sans jamais être corrigé) ; décalages allant de **+3 à +94 lignes** selon la section, cumulés sur plusieurs sessions (§6.15, §6.18) | Plan intégralement recalculé, section par section, par recherche directe (`§1` à `§29`, y compris les sous-repères internes comme les icônes de retour ou la liste "Quel navigateur choisir ?") |
| `index.html` | `PLAN DU FICHIER` | Décalage de **+8 à +9 lignes** selon la section, dû au travail du 11/07/2026 déjà partiellement documenté (§6.16/§6.17) mais jamais répercuté dans ce plan | Numéros de ligne recalculés pour les 9 repères du plan |

Aucune section entière n'était manquante cette fois-ci (contrairement à `app.js` en §6.20) : il s'agissait uniquement de numéros de ligne obsolètes.

**Méthode** : chaque numéro de ligne annoncé dans les trois plans a été vérifié par recherche directe (`grep`) de l'élément réel correspondant (déclaration de fonction, sélecteur CSS, balise HTML `id="..."`) plutôt que par simple report arithmétique, pour éviter de propager une erreur préexistante. Chaque modification de commentaire a ensuite été revérifiée pour s'assurer qu'elle ne modifiait pas le nombre total de lignes du fichier — un ajout ou une suppression de ligne dans un en-tête aurait décalé tout le code qui suit et invalidé les numéros que l'on vient de corriger. `app.js`, `style.css` et `index.html` conservent donc chacun exactement le même nombre de lignes qu'avant cette session.

**Documents mis à jour en conséquence** : les tables §2, §3, §4 et §5 de ce Bilan (numéros de ligne et compteurs de lignes actuels de tous les fichiers), ainsi que le README (architecture, note de maintenabilité, tableau historique).

**Hors périmètre de cette session** : les nombreuses références ponctuelles à des numéros de ligne dans la prose des sections §6.1 à §6.19 de ce document (ex. §6.3, §6.9, §6.10, §6.11, §6.13) n'ont pas été systématiquement revérifiées une par une — certaines datent de sessions plus anciennes et pourraient elles aussi être décalées. Seules les tables de référence structurées (§2 à §5) et les trois plans internes des fichiers sources font foi de manière fiable à ce jour.

**Fichiers modifiés** : `app.js`, `style.css`, `index.html` (commentaires uniquement, aucun changement de comportement, nombre de lignes inchangé pour chacun), `Bilan_technique.md` et `README.md` (mise à jour des tables et de l'historique).

---

### §6.22 — 🆕 Identité de marque du logo + resynchronisation complète (24/07/2026)

**Contexte** : demande utilisateur, en s'inspirant d'une capture d'écran du projet frère VACHÉBO (Français/Espagnol, même auteur) — reprendre pour cette application trois de ses partis-pris : logo affiché sur tous les écrans praticables, éléments de marque indépendants du thème actif, clin d'œil culturel décoratif.

**Ajouts fonctionnels** :
1. **Tokens de marque** `--c-flag-red` (#C8102E), `--c-flag-black` (#1A1A1A), `--c-flag-cream` (#F7F2E7) — déclarés dans `:root` (§2 de `style.css`), **non redéfinis** par `html.theme-french` ni `html.theme-oromo` (contrairement à `--c-primary`/`--c-accent`) : ce sont les couleurs du drapeau illustré dans `Logo-appli-or-fr.png`, une identité de marque transversale aux deux thèmes — même logique que `--c-vache-cream`/`--c-vache-brown` chez VACHÉBO.
2. **Footer du lanceur** (`.launcher-footer`, §15) et carte **"L'essentiel en 30 secondes"** (`.hg-tldr`, §19, versions FR et OR) recolorés avec ces tokens, variantes mode sombre incluses (rouge éclairci `#E8536A` pour rester lisible sur fond sombre).
3. **Logo complet** ajouté aux deux headers de l'écran Modules (`#sections-level1`/`#sections-level2`, §23) — vignette 56px avec ombre portée, masquée en paysage compressé comme celle du Guide. L'écran Leçon (`#lesson`) a été délibérément laissé de côté : son header est déjà très compact ("footer supprimé pour maximiser l'espace disponible sur mobile", commentaire préexistant du fichier).
4. **Mélange d'éléments culturels du logo** (🗼 tour Eiffel, 🛖 case traditionnelle, 🌳 baobab, 🐓 coq, ☕ café, 🥐 croissant) — ligne décorative `aria-hidden`, sans nouveau texte à traduire, affichée sous le footer du lanceur, sous chaque carte `.hg-tldr`, et 🆕 sur un clin d'œil mascotte affiché uniquement sur un quiz **sans-faute (3⭐)**, aux deux écrans de résultat (`_quizResultStrings()`, §14 → nouveau champ `cultural`).
5. **Crème du logo mixée dans `--c-grad-home`** — la teinte médiane du dégradé d'accueil, jusqu'ici un blanc pur (`#ffffff`), utilise désormais `var(--c-flag-cream)` dans les 3 déclarations (`:root`, `theme-french`, `theme-oromo`).

**Correctif de bug latent (indépendant de la demande initiale)** : `.modal` (la modale Infos/Remerciements, `#credits-modal`) était en z-index **9999**, sous `.app-toast` (**10000**) — un toast pouvait donc recouvrir visuellement cette modale si elle était ouverte au moment où un toast se déclenchait. Exactement le même bug déjà identifié et corrigé chez VACHÉBO le 22/07/2026 sur ses 3 modales de confirmation. `.modal` relevé à **10001**.

**Resynchronisation des trois plans internes** (`SECTIONS DE CE FICHIER` dans `app.js`, `PLAN DU FICHIER` dans `style.css` et `index.html`) : chaque ancre revérifiée par recherche directe, comme en §6.21. Deux origines distinctes à l'écart constaté :
- Les ajouts de cette session (ci-dessus), qui décalent `app.js` de +1/+2 lignes à partir de §11 (les deux `+ r.cultural` insérés aux écrans de résultat) puis +11 lignes à partir de §17 (bloc `cultural` dans `_quizResultStrings`, §14) ;
- Un **écart préexistant, sans rapport avec cette session**, découvert en cours de resynchronisation : `index.html` (`#sections-level1`) était déjà à la ligne réelle 1437 dans le fichier reçu en tout début de session, contre 1205 indiqué au plan — soit environ +230 lignes d'écart non lié aux étapes 22/07 ou 23/07 documentées dans le README. Un écart de nature similaire existait dans `style.css` autour de l'Écran 3 (Leçon). **Non investigué plus avant** faute de contexte sur son origine exacte ; corrigé au passage comme les autres ancres.

**Hors périmètre de cette session** — ⚠️ **à signaler explicitement** : les tables détaillées §3 (`app.js`), §4 (`style.css`) et §5 (`index.html`) de ce Bilan, ainsi que les tailles de fichiers citées en §7 et dans le README, n'ont **pas** été resynchronisées avant ce soir — elles datent toutes de l'Étape 9 (§6.21, 12/07/2026) et affichaient encore `app.js` : 5 303 lignes / `style.css` : 4 467 lignes / `index.html` : 1 307 lignes, alors que le fichier reçu ce soir (avant toute modification) en comptait déjà 5 650 / 4 923 / 1 729. **Cet écart de fond (12 jours, plusieurs sessions du 18 au 23/07 non répercutées ici) dépasse largement les quelques dizaines de lignes ajoutées ce soir** et n'a pas été comblé : seuls les compteurs globaux (§2 ci-dessus, §7, README) ont été mis à jour avec les valeurs réelles actuelles ; les ~80 repères ligne-par-fonction des tables §3/§4/§5 nécessiteraient une session dédiée, sur le même principe que l'Étape 9, pour être revérifiés un par un plutôt que par arithmétique.

**Fichiers modifiés** : `app.js`, `style.css`, `index.html` (ajouts fonctionnels + resynchronisation des plans internes), `Bilan_technique.md` et `README.md` (§2, §7, historique).

---

### §6.23 — 🐞 Séparation des écrans Home et Guide (24/07/2026)

**Contexte** : retour terrain — sur l'écran Home, l'icône ❓ (censée mener au Guide) rechargeait en fait l'écran sur lequel on se trouvait déjà, sans effet visible. Cause : `#home` faisait double emploi depuis la refonte de Juin 2026, contenant à la fois le tableau de bord (logo, titre, badges, carte(s) de progression, bouton Commencer/Continuer) et tout le corps explicatif du Guide (accordéons bilingues) dans un seul et même `<div id="home">`. Il était donc impossible d'avoir un jeu d'icônes différent pour Home et pour Guide puisque c'était le même écran — et l'icône 🏠, elle, menait au Lanceur (`goToAccueil()`), pas au tableau de bord.

**Correctif — séparation en deux écrans** :
1. **`index.html`** : `#home` scindé en deux `<div class="screen">` distincts. `#home` ne conserve que le tableau de bord (en-tête, badges, installation PWA, carte(s) de progression, bouton Commencer + export PDF). Un nouvel écran `#guide` reprend tel quel l'ancien corps du guide (les deux blocs bilingues `.home-lang-block`, un par langue cible, dont un seul visible via `_buildHomeGuide()`) — l'ancien `id="homeGuideBody"` est renommé `id="guideBody"`.
2. **Icônes de la topbar** — chaque écran n'affiche désormais que l'icône vers l'écran *opposé* :
   - `#home` : ❓ (mène à Guide) + 📚 Modules — 🏠 supprimé (redondant : la nav basse propose déjà "Changer de langue" pour le même effet)
   - `#guide` : 🏠 (mène à Home) + 📚 Modules — ❓ supprimé (redondant : on y est déjà)
3. **`app.js`** : nouvelle fonction `goToHome()` (🏠 de Guide → `#home`, sans changer de mode/langue), distincte de `goToAccueil()` (🏠 de Sections/Leçon → `#app-launcher`, changement de langue). `goToGuide()` cible désormais `showScreen('guide', ...)` au lieu de `'home'` — utilisée aussi bien par l'icône ❓ de Home que par celles de Sections/Leçon et par `showOnboardingGuide()` (bouton "Guide" de la nav basse). `_SCREEN_ORDER` et `_QUICK_NAV_MAP` mis à jour avec une entrée `'guide'` dédiée (`current: 'guide'`). La règle de masquage du 📚 tant que le mode n'est pas onboardé, ainsi que le masquage de la nav basse en première visite, sont étendues à `#guide` (accessible dès la première visite via ❓ depuis Home). `_buildHomeGuide()` peuple désormais deux topbars distinctes : "Accueil" sur `#home`, "Guide explicatif" (libellé inchangé) sur `#guide`. `_exportGuide()` lit désormais `#guideBody` (renommé).
4. **`style.css`** : `#guide` ajouté aux sélecteurs partagés avec `#home` (fond dégradé tricolore, `min-height`, correctifs responsive tablette/desktop et paysage mobile) — aucune nouvelle classe créée, `#guide` réutilise entièrement les classes `.home-guide-*` existantes.

**Comportement de première visite — 🆕 mis à jour le 24/07/2026 (suite au correctif ci-dessus)** : `_maybeShowOnboarding()` enchaîne désormais automatiquement sur `#guide` quand le mode n'a jamais été onboardé (au lieu de laisser `#home` affiché sans action). Séquence exacte : `initApp()` affiche `#home` (dashboard) puis, dans la foulée, `_maybeShowOnboarding()` bascule aussitôt sur `#guide` — l'apprenant voit donc Home juste avant que le Guide ne s'affiche (transition "forward" via `_SCREEN_ORDER`), plutôt que de devoir taper ❓ lui-même. Il revient à `#home` via l'icône 🏠 du Guide pour cliquer sur "Commencer" (ce qui pose le flag onboarding et débloque 📚 + la nav basse). Une fois le mode onboardé, les lancements suivants sautent directement à `#sections-level1`, comme avant.

**Resynchronisation des trois plans internes**, comme en §6.21/§6.22 — chaque ancre revérifiée par recherche directe. Au passage, un écart préexistant de +9 lignes (antérieur à cette session, sans rapport avec le correctif Home/Guide) a été corrigé sur les ancres §1 à §4b du plan de `app.js`.

**Fichiers modifiés** : `index.html`, `app.js`, `style.css` (correctif fonctionnel + resynchronisation des plans internes), `Bilan_technique.md` et `README.md` (historique, diagramme de flux utilisateur).

---

### §6.24 — 🆕 Refusion de Home et Guide, agencement VACHÉBO (24/07/2026, 2e correctif du même jour)

⚠️ **Entrée rédigée rétroactivement le 25/07/2026** : les trois fichiers de code (`app.js`, `index.html`, `style.css`) citent tous "§6.24" depuis le 24/07/2026 pour ce correctif, mais l'entrée correspondante n'avait alors jamais été ajoutée à ce Bilan — trou de documentation comblé ici, a posteriori, à partir des commentaires datés laissés dans le code.

**Contexte** : la séparation Home/Guide du §6.23 (plus tôt le même jour) corrigeait bien le bug d'icône ❓ inopérante, mais introduisait une navigation à deux temps peu naturelle : `initApp()` affichait d'abord `#home` (tableau de bord), puis basculait aussitôt sur `#guide` à la première visite d'un mode. Décision prise le jour même de revenir à un écran unique — mais pas un simple retour arrière à l'ancien `#home` de Juin 2026 : un réagencement complet calqué sur l'application sœur **VACHÉBO** (logo → drapeaux → titre → sous-titre → badges → installation → bouton Commencer/PDF → accordéons du guide).

**Correctif** :
1. **`index.html`** : `#home` et `#guide` (créés quelques heures plus tôt en §6.23) sont réunis en un seul `<div id="home" class="screen">`. La topbar ne garde que 📚 Modules + 🚪 Quitter — 🏠 et ❓ sont retirés, tous deux redondants puisqu'ils menaient vers cet écran lui-même. Le fichier raccourcit d'environ 40 lignes (topbar et petit en-tête dupliqués supprimés).
2. **`app.js`** : `goToHome()` (créée en §6.23 pour l'icône 🏠 de l'ex-`#guide`) est supprimée — elle n'a plus de raison d'être. `goToGuide()` cible à nouveau `showScreen('home', ...)` ; son nom est conservé tel quel pour ne pas devoir modifier tous les `onclick="goToGuide()"` du HTML (icônes ❓ de Sections/Leçon). `_maybeShowOnboarding()` revient à un choix binaire simple : `#sections-level1` si le mode est déjà onboardé, sinon `#home`. `_QUICK_NAV_MAP` perd son entrée `'guide'` dédiée. `_buildHomeGuide()` reste la fonction unique qui peuple tout l'écran (dashboard + bon bloc de langue du guide).
3. **`style.css`** : `#guide` retiré des sélecteurs partagés (redevenus `#home` seul) ; nouvel agencement VACHÉBO du dashboard.

**Resynchronisation des trois plans internes** — chaque ancre revérifiée par recherche directe, comme aux sessions précédentes.

**Fichiers modifiés** : `index.html`, `app.js`, `style.css`, `README.md` (diagramme de flux utilisateur, historique).

---

### §6.25 — 🐞 Modale "Nav verrouillée" sur le Lanceur + nettoyage (25/07/2026)

**Contexte** : sur le Lanceur (`#app-launcher`), avant tout choix de langue, les icônes ❓ Guide et 📚 Modules de la nav basse sont grisées (`opacity:.35`, voir `_updateBottomNav()` §5b) — mais restaient **cliquables**. `navGoModules()` et `showOnboardingGuide()` ne comportaient aucun garde-fou : appelées avec `currentMode === ''`, elles pouvaient planter ou afficher un écran incohérent, `data-fr.js`/`data-or.js` n'étant pas encore injecté à ce stade.

**Correctif** :
1. **`app.js`** : garde-fou `if (!currentMode) { openNavLockedModal(); return; }` ajouté en tête de `navGoModules()` et `showOnboardingGuide()`. Nouvelles fonctions `openNavLockedModal()`/`closeNavLockedModal()` (§5d, juste après `closeQuitModal()`).
2. **`index.html`** : nouvelle modale statique `#nav-locked-modal`, calquée sur `#quit-app-modal` — contenu 100 % bilingue en dur (Français puis Afaan Oromoo) puisqu'aucune langue n'est encore choisie à ce stade, donc pas de `L()` possible. Un seul bouton "D'accord · Tole".
3. **`style.css`** : nouveau bloc `§NAVLOCKED`, overlay + `.modal-content` calqués sur `#quit-app-modal`, bouton plein `var(--c-primary)`.

**Nettoyage — code obsolète supprimé** : `_closeOnboarding()`, stub à corps vide conservé depuis la suppression de l'ancienne modale onboarding legacy ("pour compatibilité des appels existants"), n'avait en réalité plus aucun appelant nulle part dans le projet. Supprimé ; la doc `ARCHITECTURE` du bloc §17 mise à jour en conséquence (le marquage "vu" de l'onboarding est en réalité géré par `showScreen()` à la sortie de `#home`, pas par cette fonction).

**Resynchronisation complète des trois plans internes**, comme aux sessions précédentes — chaque ancre revérifiée par recherche directe. Au passage, correction d'une erreur de groupement héritée du 23/07/2026 dans le plan de `app.js` : `goToAccueil()`/`goToGuide()` sont physiquement dans le bloc §5c (après son bandeau), pas §5b comme l'indiquait le plan depuis cette date.

**Documentation** : `README.md` — le diagramme "User flow" décrivait encore Home et Guide comme deux écrans séparés (périmé depuis le §6.24 du 24/07/2026, jamais corrigé alors) ; entièrement réécrit pour refléter l'écran `#home` unique actuel, plus une mention de la nouvelle modale. Ce Bilan technique lui-même comblait un trou : §6.24 (la fusion) était citée partout dans le code depuis le 24/07/2026 mais n'existait pas encore ici — ajoutée rétroactivement ci-dessus.

**Hors périmètre de cette session** — comme signalé en §6.22/§6.23 : les tables détaillées §3 (`app.js`), §4 (`style.css`) et §5 (`index.html`) restent périmées (dernière resynchronisation ligne-par-ligne : 12/07/2026, §6.21) et nécessiteraient une session dédiée pour être revérifiées une par une.

**Fichiers modifiés** : `app.js`, `index.html`, `style.css` (correctif + nettoyage + resynchronisation des plans internes), `README.md`, `Bilan_technique.md`.

---

### §6.26 — 🆕 Scission du thème `sante` en `sante` + `secu` (méthode VACHÉBO, 28/08/2026)

**Contexte** : le thème Niveau 1 `sante` (🏥 La Santé / Fayyaa) avait été élargi le 28/08/2026 (même journée, étape précédente) avec 9 mots de vocabulaire de sécurité générale (danger, police, pompiers, au secours, appeler à l'aide, se perdre, vol, attention, prudent(e)), mélangeant désormais deux champs sémantiques distincts (médical vs sécurité/urgences) dans une même rubrique de 30 mots.

**Correctif** — scission en deux thèmes Niveau 1 distincts, sur le même principe qu'un correctif équivalent déjà appliqué sur le projet frère VACHÉBO :
- `sante` **conserve son id existant** et repasse à ses **21 mots médicaux d'origine** (douleur, fièvre, médecin, hôpital, pharmacie, ambulance, urgences…) — **zéro impact sur la progression déjà sauvegardée** des utilisateurs sur ce thème.
- Nouveau thème `secu` (**nouvel id**, donc progression vierge pour tous) créé juste après `sante` dans les deux fichiers de données, emoji 🚨 (distinct de 🏥), reprenant tels quels les 9 mots de sécurité — nom FR "La Sécurité" / sous-titre Oromo "Nageenya" (miroir strict avec `data-or.js` : `name: 'Nageenya'` / `sub: 'La Sécurité'`).

**Effets de bord traités dans le même lot** :
1. Niveau 1 : 36 → **37** thèmes ; Total : 52 → **53** — `_TOTAL_THEMES_PER_MODE` (`app.js`) mis à jour en conséquence.
2. Renumérotation complète des commentaires `// N/52 -- ...` en `// N/53 -- ...` dans `data-fr.js` et `data-or.js` : dénominateur changé sur les 30 premiers thèmes (`sante` inclus, numéro inchangé), nouveau repère `31/53` pour `secu`, et tous les thèmes suivants (ex Voyage, Pays…) décalés de +1 (`31/52`→`32/53`, etc. jusqu'à `52/52`→`53/53`).
3. **7 occurrences** de comptage (`36`/`52`) resynchronisées dans le Guide bilingue d'`index.html` (écran Home Français et Oromo, écran Sections, cartes "L'essentiel en 30 secondes").
4. Table §1 (Vue d'ensemble) de ce Bilan mise à jour (48→53, valeur déjà périmée avant cette session — voir point de vigilance ci-dessous).

**Traduction provisoire** : le titre Oromo "Nageenya" est une traduction IA provisoire, à valider par Mussa Sembro comme le reste du lot du 28/08/2026 via le classeur de révision Excel dédié.

**Vérifications effectuées** :
- Syntaxique : `node --check` sur `data-fr.js`, `data-or.js`, `app.js` — aucune erreur.
- Programmatique (script Node dédié, lecture directe des tableaux de données) : 37 ids uniques en Niveau 1 des deux côtés (aucun doublon, aucun oubli) ; miroir strict FR/OR confirmé sur la liste complète des ids (même ordre) ; `sante` = 21 mots des deux côtés, `secu` = 9 mots des deux côtés (21+9 = 30, aucune perte ni doublon par rapport à l'ancien `sante` à 30 mots) ; contenu mot-à-mot de `secu` identique entre `data-fr.js` et `data-or.js` (aucun écart de traduction/emoji) ; `secu` positionné immédiatement après `sante` dans les deux fichiers ; total `LEVEL1 + LEVEL2` = 53 des deux côtés.

**⚠️ Point de vigilance signalé au passage** : la table §1 de ce Bilan affichait encore **48** thèmes avant cette session (jamais mise à jour lors de l'étape précédente du même jour, qui était pourtant déjà passée à 52) — corrigée directement à 53 ici, sans session de resynchronisation dédiée pour le reste de cette table (mots/expressions par mode notamment, non revérifié).

**Fichiers modifiés** : `data-fr.js`, `data-or.js`, `app.js`, `index.html` (7 occurrences de comptage), `README.md`, `Bilan_technique.md` (§1, §6.26).

---

### §6.27 — 🆕 Niveau 1 regroupé en catégories repliables + carte "Continuer" (méthode VACHÉBO, 28/08/2026)

**Contexte** : après les étapes 1 et 2 du même jour (§6.26 et l'entrée précédente), le Niveau 1 compte 37 thèmes affichés en une seule grille plate (`#grid1`) — longue à parcourir pour l'apprenant, sans repère visuel de progression par grand domaine.

**Correctif** — regroupement en **6 catégories thématiques repliables** (accordéons natifs `<details>`/`<summary>`, zéro JS pour l'ouverture/fermeture, même principe que les accordéons du Guide `.hg-section`) :

| Catégorie | Thèmes (ids) | Nb |
|---|---|---|
| 🌱 Les Bases | `alpha, salut, pres, expr, interro, connect` | 6 |
| 🔢 Chiffres, Temps & Météo | `num, temps, quantfreq, meteo` | 4 |
| 😊 Se Décrire, Ressentir & Rester en Sécurité | `verb, emot, col, adj, corps, sante, secu` | 7 |
| 🏠 Maison, Famille & Métiers | `fam, routine, objets, log, muebles_equipamiento, veth, met` | 7 |
| 🍽️ Repas, Argent & Déplacements | `nour, bois, rest, argent, orient, lieux, trans` | 7 |
| 🌍 Voyage, Nature & Le Monde | `viaje, pays, ocio, plan, anim, agri` | 6 |

Plus une carte **"▶ Continuer"** en tête de grille, avant les catégories, qui pointe vers :
1. le thème déjà entamé (`isOpened`) mais pas encore maîtrisé à 100 % (`getThemeStars < 3`) s'il y en a un ;
2. sinon le premier thème jamais ouvert, dans l'ordre d'affichage des catégories ;
3. sinon (Niveau 1 entièrement à 100 %) un message de félicitations à la place du lien.

**Auto-dépli** : au tout premier rendu, seule la première catégorie non terminée à 100 % + la suivante sont ouvertes (toutes fermées sinon si tout est fini, sauf la première). **Aux rendus suivants** (fin de quiz, retour d'écran…), l'état ouvert/fermé de chaque catégorie est relu directement dans le DOM avant d'écraser `#grid1` : un dépliage manuel de l'apprenant n'est donc plus jamais écrasé par l'auto-dépli, qui ne s'applique qu'une seule fois par session d'app.

**Implémentation** :
1. **`app.js`** (§7, juste avant `renderSections()`) : `THEME_CATEGORIES_L1` (config figée, ids de catégorie utilisés comme clé de mémorisation d'ouverture) + `_getCategoryProgress()`, `_getContinueTargetL1()`, `_buildContinueCard()`, `_computeAutoOpenCategoryIds()`, `_buildCategoryAccordion()`, `_buildLevel1Body()`. `renderSections()` modifié pour que `#grid1` utilise `_buildLevel1Body()` ; `#grid2` (Niveau 2, 16 thèmes) inchangé — volume déjà gérable sans ce découpage.
2. **`index.html`** : `#grid1` renommé de `.themes-grid` à `.level1-body` — il n'est plus lui-même une grille (sinon il aurait hérité du `display:grid` 2/4 colonnes destiné aux cartes-thèmes) mais un empilement vertical de la carte "Continuer" et des accordéons, chacun conservant SA PROPRE `.themes-grid` interne.
3. **`style.css`** : nouveau bloc `§20f`, juste après la grille responsive existante des écrans Level (§20e) — `.level1-body`, `.continue-card` (+ variante `.continue-card-done` pour le message de félicitations), `.theme-category`/`.category-summary`/`.category-icon`/`.category-label`/`.category-progress`/`.category-chevron`, avec surcharges mode sombre ajoutées à côté du bloc `.level-details` existant (§24b).

**⚠️ CSS mort repéré, volontairement non réutilisé** : il existait déjà un bloc complet `.level-details`/`.level-summary`/`.level-chevron` (chevron animé, fond arrondi, ombre) — jamais câblé à aucun HTML, ni dans `index.html` ni ailleurs. Reliquat probable d'une tentative antérieure de cette même fonctionnalité jamais terminée, ou copie brute depuis le projet frère VACHÉBO. Ce bloc n'a pas été réutilisé tel quel — remplacé par des classes dédiées (`.theme-category`, `.category-summary`, `.category-chevron`) pour ne pas hériter d'un bug potentiel jamais diagnostiqué dans ce CSS mort.

**Traductions provisoires** : les 6 titres de catégorie en Oromo sont des traductions IA provisoires, à valider par Mussa Sembro comme le reste du lot du 28/08/2026.

**Resynchronisation complète du plan interne d'`app.js`** — le `THEME_CATEGORIES_L1` et les fonctions associées (155 lignes) ont été insérés en §7, juste avant `renderSections()` ; toutes les ancres à partir de §8 ont décalé de +181 lignes en conséquence. Chaque ancre revérifiée par recherche directe dans le fichier final (pas par arithmétique de décalage), y compris après un second décalage de +15 lignes provoqué par la resynchronisation du plan lui-même (le plan documentant sa propre taille, l'ajouter dedans déplace tout ce qui le suit — recalcul final vérifié anchor par anchor).

**Vérifications effectuées** :
- Syntaxique : `node --check app.js` — aucune erreur.
- Programmatique (harnais Node `vm`, dépendances stubbées) : couverture exacte des 37 ids Niveau 1 par les 6 catégories (aucun doublon, aucun oubli) ; cible "Continuer" correcte à l'état neuf (`alpha`), après complétion d'une catégorie (bascule sur la suivante), et à 100 % (`null` → message de félicitations) ; auto-dépli correct dans les 3 mêmes états ; rendu HTML de `_buildLevel1Body()` et `_buildCategoryAccordion()` sans exception.
- Visuel : non testé dans un navigateur réel lors de cette session (pas d'accès DOM/rendu graphique dans l'environnement d'implémentation) — **à vérifier par Sébastien** sur Chrome desktop + Android avant mise en production, notamment le comportement natif `<details>`/`<summary>` (accessibilité clavier, focus visuel) et le rendu du dégradé de la carte "Continuer" en mode sombre.

**Fichiers modifiés** : `app.js`, `index.html`, `style.css`, `README.md` (diagramme "User flow", historique), `Bilan_technique.md` (§6.27).

---

### §6.28 — 🆕 Niveau 2 (dialogues) regroupé en catégories repliables + carte "Continuer" (méthode VACHÉBO, 29/08/2026)

**Contexte** : suite directe de §6.27 — le Niveau 1 avait reçu le regroupement en catégories repliables, le Niveau 2 (16 dialogues, `#grid2`) restait volontairement en grille plate ("volume déjà gérable"). Demande explicite de reproduire le même traitement sur le Niveau 2, y compris sa propre carte "▶ Continuer" (initialement non demandée, ajoutée sur confirmation explicite après validation du découpage en catégories).

**Correctif** — regroupement en **4 catégories thématiques repliables**, avec des emojis volontairement différents du Niveau 1 (🌱🔢😊🏠🍽️🌍) pour distinguer les deux niveaux d'un coup d'œil :

| Catégorie | Dialogues (ids) | Nb |
|---|---|---|
| 👋 Rencontres & Orientation | `salut2, pres2, chemin2` | 3 |
| 🎉 Sorties, Repas & Loisirs | `bar2, resto2, fiesta2, gustos2` | 4 |
| 🧳 S'installer au Quotidien | `hotel2, logement2, routine2, compras2, transp2` | 5 |
| ⛅ Météo, Temps & Santé | `meteo2, temps2, farmacia2, medico2` | 4 |

Même carte **"▶ Continuer"** que le Niveau 1 (logique identique : thème entamé non maîtrisé > premier thème neuf > félicitations si 100%), placée en tête de `#grid2`.

**Implémentation — généralisation, zéro duplication de logique** :
1. **`app.js`** (§7) : nouvelle constante `THEME_CATEGORIES_L2`, juste après `THEME_CATEGORIES_L1`. Les fonctions de §6.27 sont généralisées plutôt que dupliquées :
   - `_getContinueTargetL1()` → `_getContinueTarget(categories)` (accepte désormais L1 ou L2 en paramètre) ;
   - `_buildContinueCard()` → `_buildContinueCard(categories, doneTextFr, doneTextOr)` (message de félicitations paramétré, car le texte diffère entre "modules" Niveau 1 et "dialogues" Niveau 2) ;
   - `_computeAutoOpenCategoryIds()` accepte désormais `categories` en paramètre ;
   - `_getCategoryProgress()` et `_buildCategoryAccordion()` étaient déjà génériques (prenaient une catégorie en paramètre) — **inchangées**.
   - Nouvelle fonction partagée `_buildCategorizedGrid(grid, categories, doneTextFr, doneTextOr)`, factorisant la logique commune (lecture de l'état ouvert/fermé existant dans le DOM, calcul de l'auto-dépli, construction carte Continuer + accordéons) — appelée par `_buildLevel1Body(grid1)` (Niveau 1) et la nouvelle `_buildLevel2Body(grid2)` (Niveau 2).
   - `renderSections()` modifié : `#grid2` utilise désormais `_buildLevel2Body(grid2)` au lieu du `.filter(level===2).map(_buildThemeCard)` plat précédent.
2. **`index.html`** : `.level1-body` renommée en `.categories-body` (classe générique), appliquée à la fois à `#grid1` ET `#grid2` — évite d'avoir deux classes séparées pour un comportement identique.
3. **`style.css`** : `§20f` renommé `.level1-body` → `.categories-body` ; les règles `.continue-card`, `.theme-category`, `.category-*` (déjà génériques, sans préfixe "Niveau 1") sont réutilisées telles quelles, aucune règle dupliquée. Les surcharges mode sombre existantes (également génériques) s'appliquent automatiquement au Niveau 2 sans modification.

**Traductions provisoires** : les 4 titres de catégorie en Oromo sont des traductions IA provisoires, à valider par Mussa Sembro comme le reste du lot du 28–29/08/2026.

**Resynchronisation complète des 3 plans internes** :
- `app.js` : +70 lignes nettes insérées en §7 (constante `THEME_CATEGORIES_L2` + généralisation des fonctions) ; toutes les ancres à partir de §8 recalculées par recherche directe dans le fichier final.
- `index.html` : +6 lignes nettes (commentaires + classe renommée sur 2 lignes) ; ancres à partir de "Écran 2b" recalculées par recherche directe.
- `style.css` : renommage de classe sans ajout/suppression de règle (836 accolades ouvrantes / 836 fermantes, identique avant/après) — **⚠️ point de vigilance signalé, pas corrigé dans cette étape** : le plan interne (`PLAN DU FICHIER`) de `style.css` présentait déjà un décalage important (~139 lignes) sur plusieurs sections antérieur à cette étape (dernière resynchronisation complète : 24/07/2026, §6.22) — non traité ici pour ne pas mélanger un correctif de documentation sans rapport avec cette étape fonctionnelle ; à prévoir dans une prochaine passe de resynchronisation dédiée.

**Vérifications effectuées** :
- Syntaxique : `node --check app.js`, `node --check data-fr.js`, `node --check data-or.js` — aucune erreur.
- Miroir strict FR/OR : les 16 ids Niveau 2 confirmés identiques entre `data-fr.js` et `data-or.js` par diff programmatique.
- Comptage programmatique **extrait directement du `app.js` final** (pas d'une recopie manuelle) : couverture exacte des 16 ids Niveau 2 par les 4 catégories de `THEME_CATEGORIES_L2` (aucun doublon, aucun oubli) ; Niveau 1 revérifié en parallèle par sécurité — 37/37 ids toujours corrects, aucune régression.
- Comptage accolades CSS avant/après (`style.css`) : 836 / 836 dans les deux cas — aucune règle cassée ou dupliquée.
- Variables CSS (`--c-*`) avant/après : 30 / 30, liste identique — aucune variable ajoutée par erreur.
- Simulation de 3 scénarios utilisateur (apprenant neuf, mi-parcours avec 1 catégorie à 100% + 1 entamée, tout terminé à 100%), logique extraite directement du `app.js` final : cible "Continuer" et auto-dépli corrects dans les 3 cas.
- Visuel : non testé dans un navigateur réel lors de cette session (pas d'accès DOM/rendu graphique dans l'environnement d'implémentation) — **à vérifier par Sébastien** avant mise en production (voir liste de vérifications ci-dessous).

**Fichiers modifiés** : `app.js`, `index.html`, `style.css`, `README.md` (diagramme "User flow", historique), `Bilan_technique.md` (§6.28).

---

### §6.29 — 🐞 En-tête Leçon fusionné : 2 lignes au lieu de 3 (méthode VACHÉBO, 29/08/2026)

**Contexte** : retour terrain par capture d'écran (comparaison directe avec l'appli sœur espagnole, même famille de projet). Le header de l'écran Leçon prenait **3 lignes** : la rangée d'icônes rapides `.lesson-quick-nav` (🏠/❓/📚 à gauche, 🚪 à droite), puis `.lesson-header-top` (← bouton retour, badge "Niv. X", emoji, titre `#lessonTitle`), puis une ligne à part, `.lesson-header-bot`, ne contenant plus que les 2 boutons de navigation `.lesson-nav-arrows` (‹ ›) — ce dernier bouton PDF ayant déjà quitté cette ligne lors d'une étape antérieure (voir §8b dans `app.js` et `.audio-settings` ci-dessus). Sur l'appli sœur espagnole, le même en-tête tient sur 2 lignes : retour + emoji + titre + flèches partagent la même rangée, seul le titre repasse à la ligne suivante s'il est trop long.

**Correctif** — fusion de `.lesson-header-bot` dans `.lesson-header-top` :
1. **`index.html`** : le bloc `.lesson-nav-arrows` (les 2 boutons `#lessonPrevBtn`/`#lessonNextBtn`) est déplacé physiquement à l'intérieur de `.lesson-header-top`, juste après `<h3 id="lessonTitle">`. Le `<div class="lesson-header-bot">` qui l'entourait est supprimé (il ne contenait plus rien d'autre).
2. **`style.css`** : la règle `.lesson-header-bot` (qui ne faisait plus que `justify-content:flex-end` sur ses 2 boutons) est supprimée. `#lessonTitle` reçoit `min-width:0` en complément de son `flex:1` existant — nécessaire pour qu'un élément `flex:1` sans largeur intrinsèque définie se comprime correctement une fois que `.lesson-nav-arrows` (largeur fixe, `flex-shrink:0`) partage la même rangée que lui ; sans cette propriété, un titre long pourrait déborder de la rangée au lieu de passer proprement à la ligne. Aucun `justify-content` n'est nécessaire sur `.lesson-header-top` pour ancrer les flèches à droite : `#lessonTitle` en `flex:1` absorbe tout l'espace restant, poussant naturellement `.lesson-nav-arrows` (qui le suit dans le flux) contre le bord droit.
3. Commentaires de plan mis à jour dans `style.css` (bloc d'en-tête `.lesson-header`, désormais documenté comme 2 lignes au lieu de 3) et dans `index.html` (bloc `.lesson-header-top`).

**Effet** : le titre continue de passer seul à la ligne s'il est long (comme observé sur la capture, "Expressions Essentielles — Jechi Murteessoo" / "Gochaalee — Les Verbes") — seule la ligne des flèches disparaît en tant que rangée séparée, ce qui regagne la hauteur d'une ligne complète d'en-tête sur l'écran Leçon et harmonise l'affichage avec l'appli sœur.

**Vérifications effectuées** :
- Syntaxique : `node --check app.js` — aucune erreur (fichier non touché par ce correctif, revérifié par sécurité).
- Comptage accolades CSS avant/après : 844 → 845 (cohérent avec la suppression nette d'une règle `.lesson-header-bot` et l'ajout d'une propriété `min-width:0` dans une règle existante — le différentiel exact n'a pas été isolé, mais la variation est du bon ordre de grandeur pour ce diff).
- Comptage de balises `<div>`/`</div>` avant/après dans `index.html` : `230`/`229` → `229`/`228` — l'écart préexistant d'une balise (probablement une occurrence de texte "`<div`" dans un commentaire, non un déséquilibre réel) reste identique avant/après, confirmant qu'un `<div>` et sa fermeture ont bien été retirés ensemble, sans casser l'équilibre du reste du fichier.
- Visuel : non testé dans un navigateur réel lors de cette session (pas d'accès DOM/rendu graphique dans l'environnement d'implémentation) — **à vérifier par Sébastien** avant mise en production, notamment le comportement du titre le plus long actuellement en base sur un petit écran.

**Fichiers modifiés** : `index.html`, `style.css`, `README.md` (historique), `Bilan_technique.md` (§6.29).

---

### §6.30 — 🐞 Taille des flashcards adaptée au contenu + phrase d'intro Répète déplacée (méthode VACHÉBO, 29/08/2026)

**Contexte** : retour terrain par 3 captures d'écran. Deux problèmes distincts observés sur l'affichage des cartes de vocabulaire :
1. Onglet **Cartes** (mode-cartes, `.fc-wrap`) : sur un verbe à conjugaison (ex. "Ta'uu / Jiraachuu" — "Être", 6 formes conjuguées), la carte était trop courte pour tout afficher — un scroll interne apparaissait (`overflow-y:auto` sur `.fc-front`/`.fc-back`, filet de sécurité déjà en place depuis un correctif antérieur sur ce même type de contenu, voir §6.27), coupant visuellement la dernière ligne de conjugaison au premier coup d'œil.
2. Onglet **Répète** (`.repeat-card`) : sur une entrée sans indice long (le même verbe "Ta'uu / Jiraachuu" — "Être", affiché ici sans ses conjugaisons, réservées à l'onglet Cartes), la carte affichait un vide disproportionné sous le mot, hérité d'un plancher de hauteur (`min-height:130px`) et d'un padding généreux (`24px` en haut) pensés sans distinction entre entrées courtes et longues.

**Cause commune** : dans les deux cas, une taille **fixe**, identique pour tous les mots, sans rapport avec le volume de texte réellement affiché — trop grande pour un mot simple (vide visible), trop petite pour un verbe à conjugaison (scroll nécessaire).

**Correctif 1 — `.fc-wrap` (onglet Cartes), taille pilotée par le contenu réel** :
- Nouvelle fonction `_adjustFlashcardHeight()` (`app.js`), appelée à la fin de `renderFlash()` (juste après chaque (re)construction de la carte) et depuis `setAppHeight()` (recalcul au redimensionnement du viewport — rotation, barre d'URL qui apparaît/disparaît).
- Mesure `Math.max(front.scrollHeight, back.scrollHeight)` sur `.fc-front` et `.fc-back` — `.scrollHeight` reste fiable même si les deux faces sont superposées en `position:absolute` (l'une invisible pendant que l'autre est affichée) et même contraintes visuellement par `height:100%` (règle `#lesson.mode-cartes .fc-front/.fc-back`, §8) : cette propriété ignore la contrainte de hauteur visuelle et reflète toujours la hauteur réellement nécessaire au contenu.
- Deux cas :
  - **Cas normal** (contenu ≤ plafond dérivé du viewport, `CEILING = appH - 470`, même budget de chrome que l'ancien calcul fixe) : `.fc-wrap` reçoit `max-height` égal à la hauteur naturelle du contenu (plancher `FLOOR = 170px` pour rester lisible sur un mot très court) — la carte épouse son contenu au lieu d'occuper systématiquement tout le budget disponible.
  - **Cas `.fc-tall`** (contenu dépassant même ce plafond — verbe à conjugaison très longue sur petit écran) : plutôt qu'un scroll interne à la carte (`overflow-y:auto` sur les faces, toujours en place en filet de sécurité mais peu lisible — "scroller dans une petite fenêtre"), la classe `fc-tall` est posée sur `#lesson` et `.fc-wrap` prend sa hauteur complète non plafonnée (`flexShrink:'0'`, `height` explicite). Nouvelle règle CSS `#lesson.mode-cartes.fc-tall .lesson-body{overflow-y:auto}`, qui réactive le scroll de toute la page le temps de cette carte — **exactement la même technique** que celle déjà en place pour le panneau Réglages audio ouvert (`.audio-settings-open`, voir §6.20/§6.28), réutilisée ici pour la même raison (éviter de réintroduire le type de régression d'affichage déjà rencontré et documenté sur cette mise en page).
- La valeur `max-height: calc(var(--app-h) - 470px)` qui existait déjà en CSS sur `#lesson.mode-cartes .fc-wrap` (§8) n'est pas supprimée : elle reste un **filet de repli** (avant le tout premier rendu JS, ou si celui-ci échouait), l'inline JS la surchargeant systématiquement une fois `_adjustFlashcardHeight()` exécutée.

**Correctif 2 — `.repeat-card` (onglet Répète), plancher réduit** :
- `min-height:130px` → `96px`, `padding:24px 18px 18px` → `18px 18px 14px`. Le contenu reste centré verticalement (`justify-content:center`, inchangé) et la carte grandit toujours naturellement si un indice plus long est présent — seuls le plancher et le padding par défaut sont réduits, pour ne plus imposer un vide disproportionné sur les entrées courtes.

**Correctif 3 — phrase d'intro Répète déplacée dans le panneau Réglages audio** :
- La phrase "🔊 Une voix te fait entendre le mot, 🎙️ un micro vérifie ce que tu dis" (`introLine`, `.repeat-badges-intro`), affichée depuis le 08/07/2026 juste au-dessus de la carte, servait de titre pédagogique aux 2 badges "Tu entends" (voix TTS) / "Le micro comprend" (reconnaissance vocale). Depuis qu'une étape antérieure du 29/08/2026 a déplacé ces 2 badges dans le panneau Réglages audio (avec la vitesse et le bouton PDF), la phrase d'intro était restée seule au-dessus de la carte, orpheline des badges qu'elle introduit — et pouvait en plus se retrouver coupée par le header sticky lors du scroll (observé sur capture).
- `introLine` est désormais construite au même endroit qu'avant (`_renderRepeatUI()`), mais insérée en tout premier dans le contenu passé à `_buildAudioSettingsHTML()`, juste avant `#repeatVoiceBadge`, au lieu d'être concaténée avant `#repeat-card` dans `#tabContent`. Aucune règle CSS modifiée pour `.repeat-badges-intro` (déjà en texte discret aligné à droite, cohérent avec les badges qui suivent dans ce même panneau).

**Vérifications effectuées** :
- Syntaxique : `node --check app.js` — aucune erreur.
- Comptage accolades CSS avant/après : 845/845 (nouvelle règle `.fc-tall` ajoutée en CSS, tightening de `.repeat-card` sans ajout/suppression de règle — total inchangé sur ce diff précis, l'ajout de §6.29 ayant déjà porté le compteur à 845).
- Câblage vérifié par recherche directe dans le fichier final : `_adjustFlashcardHeight()` définie une fois, appelée depuis `renderFlash()` et `setAppHeight()` ; classe `fc-tall` posée en JS et consommée par une seule règle CSS.
- Visuel / recette terrain : **non vérifié dans un navigateur réel** lors de cette session (pas d'accès DOM/rendu graphique dans l'environnement d'implémentation), notamment le cas `.fc-tall` qui repose sur une interaction entre flexbox (`flex-shrink`), `overflow-y:auto` et `position:sticky` difficile à garantir à 100 % sans test live — **à vérifier par Sébastien**, idéalement sur le même verbe à conjugaison ("Ta'uu / Jiraachuu") que celui des captures d'écran ayant motivé ce correctif, sur un petit écran.

**Fichiers modifiés** : `app.js`, `style.css`, `README.md` (historique), `Bilan_technique.md` (§6.30).

---

### §6.31 — 📝 Remerciements enrichis : retour terrain de Mussa Sembro (30/08/2026)

**Contexte** : l'appli sœur espagnole VACHÉBO crédite Mussa Sembro pour un retour UX direct sur Taphad'Meuh (interface jugée trop chargée pour de grands débutants). Confirmation du porteur du projet : Mussa est bien à l'origine de **ce constat précis** — en revanche, la solution qui en a découlé (regroupement des thèmes en catégories repliables, §6.27) est de son fait à lui, pas de celui de Mussa. Objectif : refléter ce retour terrain dans Taphad'Meuh, dans toutes les parties "remerciements" (pas dans "Qui suis-je ?"/"Eenyu ani?", hors périmètre de cette demande), en créditant le **constat** et non la **solution**, avec un phrasé volontairement sobre ne faisant pas explicitement le lien avec la catégorisation.

**4 emplacements identifiés et modifiés** (2 rendus × 2 langues) :

| # | Fichier | Emplacement | Langue |
|---|---|---|---|
| 1 | `app.js` (§18, `showCredits()`) | Bullet modale crédits `#credits-modal` | Oromo — brouillon IA |
| 2 | `app.js` (§18, `showCredits()`) | Bullet modale crédits `#credits-modal` | Français |
| 3 | `index.html` (Écran 1 `#home`, accordéon §8) | Paragraphe "Galateeffannaa" | Oromo — brouillon IA |
| 4 | `index.html` (Écran 1 `#home`, accordéon §8) | Paragraphe "Remerciements" | Français |

**Choix de formulation** (3 options proposées, validées par le porteur du projet) : *"traduction, conseils linguistiques et retour terrain (interface trop chargée pour de grands débutants)"* — volontairement sobre, sans lien explicite avec la catégorisation, pour ne pas laisser entendre que la solution vient de Mussa.

**Choix de structure pour `index.html` FR** (2 options proposées) : le paragraphe Français existant attribuait déjà, de façon conjointe et floue, des "conseils sur l'ergonomie de l'application" à Mussa **et** à mes parents. Option retenue : **cette phrase existante reste intacte** (sa portée est plus large — ce ne sont pas les mêmes personnes ni le même sujet), et le nouveau retour terrain est ajouté en **phrase séparée**, spécifique à Mussa, à la fin du même paragraphe. Le paragraphe Oromo équivalent ne contenait pas cette phrase floue (asymétrie FR/OR pré-existante, non traitée ici — hors périmètre) ; la nouvelle phrase y est ajoutée de la même façon, en miroir de la version française.

**Bullets `app.js`** — la mention existante (lien LinkedIn vers "traduction & conseils linguistiques" / "hiikkaa fi gorsa afaanii") est conservée telle quelle ; le retour terrain est ajouté à la suite, hors du lien, dans le même `<li>`.

**Traduction Oromo** : brouillon IA pour les 2 segments ajoutés (bullet `app.js` + phrase `index.html`), à faire valider par Mussa Sembro comme le reste du lot en cours (même convention que §6.26/§6.27/§6.28).

**Resynchronisation des plans internes** :
- `app.js` : plan `SECTIONS DE CE FICHIER` (en-tête) — §18 (Crédits) et toutes les ancres suivantes dans l'ordre d'apparition réel (§15, §15b, §16, §19, §19b, §20, §20b, §21, §21a, §21b, §21c) recalculées par recherche directe (+9 lignes en §18). **Découverte fortuite** : ces ancres étaient déjà décalées d'environ 320-330 lignes par rapport au fichier réel *avant même ce correctif* (ex. §18 indiquait 5092, la ligne réelle de `showCredits()` était déjà 5416) — écart antérieur non expliqué, non introduit par ce correctif, non corrigé au-delà de §18-§21c (recalcul de §1 à §17 hors périmètre de cette session, voir point de vigilance §7).
- `index.html` : plan `PLAN DU FICHIER` (en-tête) — "Écran 2a" et toutes les ancres suivantes (Écran 2b, Écran 3, les 4 modales, Nav, Scripts) recalculées par recherche directe (+18 lignes dans "Écran 1"). **Écart préexistant flagué** (non corrigé, hors périmètre) : "Écran 0" et "Écran 1" étaient déjà décalés de 23 à 32 lignes avant ce correctif.

**Vérifications effectuées** :
- Syntaxique : `node --check app.js` — aucune erreur.
- Comptage de balises `<div>`/`</div>` dans `index.html` : `229`/`228` → toujours `229`/`228` (aucun `<div>` ajouté ou retiré par ce correctif, uniquement du texte dans des `<p>` existants ou nouveaux).
- Mentions de "Mussa" : `app.js` 10 → 11 occurrences, `index.html` 5 → 8 occurrences (cohérent avec 2 bullets enrichis + 2 phrases ajoutées + commentaires de traçabilité).
- 4 occurrences exactes de la nouvelle mention en code (recherche directe), aucun doublon, miroir FR/OR confirmé sur le sens (constat crédité, solution non attribuée).
- Toutes les ancres de plan interne modifiées revérifiées par recherche directe (pas par arithmétique), comme l'exige la convention du projet.
- Visuel : non testé dans un navigateur réel (pas d'accès DOM/rendu graphique dans l'environnement d'implémentation) — changement purement textuel à faible risque, mais **relecture Oromo par Mussa Sembro toujours en attente** avant publication.

**Fichiers modifiés** : `app.js`, `index.html`, `README.md` (historique), `Bilan_technique.md` (§6.31, §1, §2).

---

### §6.32 — 🐞📝 4 correctifs retour terrain, doc "Faire_les_modifications_suivantes" (31/08/2026)

**Contexte** : le porteur du projet transmet un document Word annoté de 5 captures d'écran, listant 4 modifications précises à réaliser.

**1. Auto-dépli du démarrage — 1 seule catégorie au lieu de 2** (captures 1 et 2). `_computeAutoOpenCategoryIds()` (`app.js` §7) ouvrait la première catégorie non terminée **et** la suivante (`categories[idx + 1]`). Ce comportement s'appliquait aussi bien au Niveau 1 qu'au Niveau 2 (fonction généralisée depuis §6.28). Correctif : suppression de l'ajout de la catégorie suivante — une seule catégorie ouverte au démarrage, quel que soit le niveau.

**2. Indice redondant retiré des flashcards** (capture 3). Le recto des flashcards (mode standard, hors conjugaison) affichait l'icône 👆 et la phrase "Cliquez pour voir la traduction en français" (`.fc-front-hint`), en doublon avec le libellé "Recto : Oromo — Verso : Français · Cliquez pour retourner !" déjà présent juste au-dessus de la carte. Supprimé de `app.js` (variable `flipHint` et son insertion dans `frontContent`) ; classe CSS `.fc-front-hint` devenue orpheline retirée de `style.css` (règle de base + variante mode sombre).

**3. Bullet Mussa Sembro (modale crédits) reformulé** (capture 4). Le texte demandé par le porteur du projet, en remplacement de la formulation issue de §6.31 : *"vérification et correction de la traduction oromo & retour terrain"* — insiste sur le travail de relecture/correction de la traduction déjà réalisée par Mussa (plutôt que sur la traduction elle-même) et retire le détail entre parenthèses sur l'interface. Appliqué au bullet FR et à son miroir Oromo (brouillon IA).

**4. Paragraphe Remerciements (Guide) scindé en 2** (capture 5). Le paragraphe unique introduit en §6.31 (Mussa + mes parents, avec la phrase "ergonomie" conjointe et floue) est remplacé, à la demande explicite du porteur du projet, par 2 paragraphes distincts :
- Un paragraphe dédié à Mussa Sembro, texte aligné sur le point 3 ci-dessus : *"Merci beaucoup à Mussa Sembro (Traducteur-Interprète en Oromo) pour son travail de vérification et de correction de la traduction oromo, ainsi que son retour terrain précieux (interface un peu trop chargée pour de grands débutants)."*
- Un paragraphe dédié à mes parents, avec **"mes parents"** en gras (demande explicite) : *"Merci beaucoup à mes parents pour leur travail de relecture et leurs conseils sur l'ergonomie de l'application."*

Motif donné par le porteur du projet : "mes parents c'était bien plus global" — la portée de leur contribution (relecture générale + ergonomie) justifie un paragraphe propre, distinct de celui de Mussa. Ce choix remplace directement la structure "Option 2" retenue en §6.31 (phrase conjointe conservée + ajout séparé) par une séparation complète des deux paragraphes. Appliqué en FR et en miroir Oromo (brouillon IA).

**Resynchronisation des plans internes** :
- `app.js` : plan `SECTIONS DE CE FICHIER` — ancres de §7 à §21c recalculées par recherche directe (les points 1 et 2 modifient du contenu dans §7 et §9, ce qui décale toutes les sections suivantes ; le point 3 modifie §18, déjà l'ancre de départ des resynchronisations précédentes). Note de resynchronisation du 30/08 (dérive préexistante §18-§21c) remplacée par la nouvelle note du 31/08, la dérive ayant été résorbée par la resynchronisation complète de §7 à §21c effectuée ici.
- `index.html` : plan `PLAN DU FICHIER` — ancres d'"Écran 2a" à "Scripts" recalculées par recherche directe (+2 lignes nettes dans "Écran 1" suite au point 4). Le flag d'écart préexistant sur "Écran 0"/"Écran 1" (non concernées par ce correctif, hors périmètre) est conservé et ses valeurs réelles de référence mises à jour (199→210, 423→434, décalage dû aux notes de resynchronisation elles-mêmes, phénomène auto-référentiel déjà rencontré en §6.31).

**Vérifications effectuées** :
- Syntaxique : `node --check app.js` — aucune erreur.
- Comptage de balises `<div>`/`</div>` dans `index.html` : `229`/`228` → toujours `229`/`228` (aucun `<div>` ajouté ou retiré, seulement du texte et un `<p>` supplémentaire dans du contenu existant).
- Comptage d'accolades CSS dans `style.css` : `842`/`842` → toujours équilibré après retrait de la règle `.fc-front-hint` (base + mode sombre, 2 règles retirées, aucun déséquilibre introduit).
- Toutes les ancres de plan interne modifiées (`app.js` §7-§21c, `index.html` Écran 2a-Scripts) revérifiées par recherche directe (pas par arithmétique) — concordance exacte confirmée entre valeurs déclarées et positions réelles, à convergence (plusieurs passes nécessaires du fait du caractère auto-référentiel des notes de resynchronisation elles-mêmes, cf. §6.31).
- Visuel : non testé dans un navigateur réel (pas d'accès DOM/rendu graphique dans l'environnement d'implémentation) — les points 1 et 3/4 sont des changements de comportement/texte à faible risque ; le point 2 (suppression d'éléments HTML) mérite une vérification terrain rapide (aucune classe orpheline détectée par recherche, mais pas de rendu visuel confirmé).
- **Relecture Oromo par Mussa Sembro toujours en attente** pour les 2 segments modifiés ici (bullet crédits + paragraphe Guide), qui s'ajoutent aux segments déjà en attente depuis §6.31.

**Fichiers modifiés** : `app.js`, `style.css`, `index.html`, `README.md` (historique), `Bilan_technique.md` (§6.32).

---

## 7. Points de vigilance / dettes techniques

| Point | Niveau | Détail |
|---|---|---|
| `app.js` monolithique | ⚠️ Moyen | 6 109 lignes — maintenable grâce aux `§` mais migration ES modules complexe (handlers `onclick` inline). Plan interne en en-tête du fichier **resynchronisé le 28/08/2026** (voir §6.27) |
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
| Icônes retour 🏠/❓ | ✅ OK | Testées en navigateur réel (Playwright/Chromium) : destinations, aria-label, absence d'erreur JS. Depuis le 24/07/2026 (§6.24), Home et Guide sont de nouveau un seul écran `#home` ; 🏠/❓ y sont retirés (redondants), seuls 📚 Modules + 🚪 Quitter restent en topbar |
| Carte(s) de progression Home | ✅ OK | Testé pour 0, 1 (parcours actif ou non) et 2 parcours — pas de `:has()` CSS (incompatible Safari < 15.4, hors cible iOS 14.5+) |
| Compatibilité `:has()` CSS | ✅ OK | Évité volontairement ; taille de cercle pilotée par classe JS (`--single`) plutôt que par sélecteur `:has()` |
| 🆕 Suivi "modules déjà ouverts" (badge Nouveau) | ✅ OK, ⚠️ 3ᵉ clé localStorage par mode | `openedThemes` (§6.18) s'ajoute à `done` : deux clés indépendantes par mode à surveiller en cas d'évolution du système de progression. `isOpened()` retombe sur `isDone()` par sécurité (anciennes progressions déjà sauvegardées avant l'ajout de cette clé ne réaffichent pas "Nouveau" à tort) |
| 🆕 Taille de flashcard adaptée au contenu (`.fc-tall`) | ⚠️ Non testé en navigateur réel | `_adjustFlashcardHeight()` (§6.30) repose sur une interaction entre `flex-shrink`, `overflow-y:auto` et `position:sticky` raisonnée uniquement sur le code (pas d'accès DOM/rendu graphique dans l'environnement d'implémentation). Le cas courant (contenu sous le plafond viewport) est à faible risque ; le repli `.fc-tall` (contenu au-delà, ex. verbe à conjugaison longue sur petit écran) mérite une vérification terrain dédiée avant confiance totale |
| 🆕 Plans internes (`app.js`/`index.html`) partiellement désynchronisés | ⚠️ Faible (amélioré) | §6.31 avait révélé une dérive préexistante d'environ 320-330 lignes sur les ancres `app.js` §18-§21c ; §6.32 a étendu la resynchronisation à §7-§21c (recherche directe), résorbant cette dérive sur ce périmètre. **Restent non revérifiées** : §1-§17 d'`app.js` (avant l'accordéon Niveau 1) et "Écran 0"/"Écran 1" d'`index.html` (avant le Guide/Remerciements) — une resynchronisation complète et dédiée des deux plans internes serait utile avant de s'y fier pour une prochaine évolution touchant ce périmètre |

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

*Historique commun aux 2 applications — VACHÉBO (français-espagnol) et Taphad'Meuh (français-oromo).*

| Période | Étape |
|---|---|
| 07/06/2026 → 29/06/2026 | Versions Bêta créées avec IA Claude Sonnet 4.6 et Gemini 3.5 Flash |
| 29/06/2026 → 08/07/2026 | Recettages et correctifs avec IA Claude Sonnet 5 et Gemini 3.5 Flash |
| 08/07/2026 → 12/07/2026 | Retours d'expériences utilisateurs (Christophe, Maman, Moi) avec des correctifs réalisés avec IA Claude Sonnet 5 |
| 18/07/2026 → 25/07/2026 | Retours d'expérience utilisatrice Sandrine avec des correctifs réalisés avec IA Claude Sonnet 5 |
| 27/08/2026 → 31/08/2026 | Retours d'expérience utilisateur Mussa et Moi avec des correctifs réalisés avec IA Claude Sonnet 5 |
| 05/09/2026 | Mise à jour Qui suis-je + Historique avec IA Claude Sonnet 5 |
