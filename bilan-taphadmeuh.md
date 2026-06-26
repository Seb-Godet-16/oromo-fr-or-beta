# 🐄 Bilan technique — Taphad'Meuh · Français ↔ Afaan Oromoo
*Juin 2026 — Sébastien Godet*

---

## 📁 Vue d'ensemble des fichiers

| Fichier | Lignes | Rôle |
|---|---|---|
| `index.html` | 469 | Structure HTML — 4 écrans + 2 modales, zéro logique |
| `css/style.css` | 3 614 | Styles — thème dynamique, tous les composants visuels |
| `js/app.js` | 4 113 | Moteur applicatif — logique complète (21 sections) |
| `js/data-fr.js` | 1 428 | Dataset — mode "Apprendre le Français" (48 thèmes) |
| `js/data-or.js` | 1 383 | Dataset — mode "Apprendre l'Oromo" (48 thèmes) |
| `sw.js` | 598 | Service Worker — cache hybride + fallbacks SVG |
| `manifest.json` | 113 | Manifest PWA — icônes, orientation, screenshots |

**Total : ~11 718 lignes — zéro dépendance, zéro framework.**

---

## 🏗️ Architecture

### Principe général
Application web progressive (PWA) **mono-fichier HTML**, entièrement en **Vanilla JS ES2020**, sans build step ni framework. Fonctionne 100 % hors-ligne après la première visite.

### Chargement conditionnel des données
Au lieu de charger un seul fichier de données monolithique, `app.js` injecte dynamiquement un `<script>` selon le mode choisi par l'utilisateur. Ce mécanisme (`_loadDataScript()` — `app.js` L.190) réduit la mémoire JS active de ~50 %.

```
Clic lanceur → initApp(mode) → _loadDataScript('data-fr.js' | 'data-or.js')
            → callback : ALL_THEMES = [...] → affichage écran Home
```

### Séparation des responsabilités
- `index.html` → structure HTML pure, **aucun onclick de logique métier** (optimisé)
- `style.css` → tout le visuel via **tokens CSS** (`var(--c-*)`)
- `app.js` → toute la logique ; rendu HTML généré par JS dans les conteneurs prévus
- `data-fr.js / data-or.js` → contenu pur (tableaux de données), aucun code

### Fichiers concernés par thème
```
Architecture générale      → index.html (entête), app.js §1–2, sw.js
Thème visuel / design      → style.css §2–4 (tokens), §3–4 (thèmes FR/OR)
Navigation entre écrans    → app.js §5 + §5b, style.css §1 (transitions)
Données / contenu          → data-fr.js, data-or.js
PWA / hors-ligne           → sw.js, manifest.json
```

---

## 🎨 Design UX — `style.css` (3 614 lignes, 27 sections)

### Système de thème dynamique
Un seul toggle de classe sur `<html>` bascule l'intégralité du rendu :
- `html.theme-french` → bleu `#002395` / blanc / rouge `#ED2939`
- `html.theme-oromo` → vert `#009A44` / or `#FED141` / rouge `#EF2B2D`

Tous les composants utilisent des **custom properties CSS** (`var(--c-*)`), définies en §2 (`L.183`) et surchargées en §3 (`L.246`) et §4 (`L.286`). Modifier un thème = changer une palette unique, aucun selector à chercher partout.

### Transitions de navigation
Système de slides CSS directionnel (`slide-in-right / slide-out-left / slide-in-left / slide-out-right`) — style.css §1 `L.94–182`. Animation de 280 ms. `prefers-reduced-motion` respecté (désactivation automatique des animations).

### Composants visuels notables (avec localisation)
| Composant | Section style.css | Ligne approx. |
|---|---|---|
| Écran Lanceur | §5 | ~321 |
| Écran Home / Guide | §6 + §22 | ~528 / ~2 266 |
| Grille de modules (sections) | §7 + §23 | ~594 / ~2 487 |
| Écran Leçon (onglets) | §8 | ~715 |
| Flashcards (recto/verso, flip) | §9 | ~891 |
| Grille Alphabet | §10 | ~1 014 |
| Quiz (options, feedback) | §11 | ~1 114 |
| Dialogues / Situations | §12 | ~1 219 |
| Vocabulaire (chips cliquables) | §13 | ~1 324 |
| Modale Remerciements | §14 | ~1 392 |
| Toast notification | §16 | ~1 497 |
| Onglet Répète | §17 | ~1 533 |
| Guide onboarding (accordéons) | §19 | ~1 773 |
| Spinner de chargement | §20 | ~2 229 |
| Responsive tablette/desktop | §24 | ~2 598 |
| Mode sombre | §24b | ~2 688 |
| Boutons export PDF | §25 | ~2 799 |
| Barre de navigation basse | §26 | ~2 916 |
| Onglets Niveau 1 / 2 | §27 | ~3 024 |
| Animation confetti ⭐⭐⭐ | §CONFETTI | ~3 327 |
| Cercle SVG de progression | §PROGRESS | ~3 386 |
| Modale confirmation suppression | §CONFIRM | ~3 462 |
| Antispam e-mail (CSS RTL) | §ANTISPAM | ~3 576 |

### Points UX avancés
- **Mode sombre** : §24b (`L.~2 688`) — détection via `prefers-color-scheme:dark`
- **Responsive** : §24 (`L.~2 598`) — grille 3 colonnes sur tablette/desktop
- **Focus clavier** : §18 (`L.~1 755`) — outline visible WCAG-compliant
- **Viewport height fix Android** : custom property `--app-h` mise à jour dynamiquement (`app.js` §21b `L.3 494`)
- **Antispam e-mail** : adresse écrite à l'envers dans le DOM, `direction:rtl` CSS la remet à l'endroit — style.css §ANTISPAM + app.js `L.754`

---

## 🧭 Navigation — `app.js` §5 + §5b (L.978–1 198)

### Flux utilisateur
```
[Lanceur #app-launcher]  → choix de langue → initApp()
        ↓
[Guide #home]            → onboarding + progression globale
        ↓
[Modules #sections-level1]  ←→  [Modules #sections-level2]
        ↓
[Leçon #lesson]          → onglets selon le type de thème
```

### Mécanique
- `showScreen(id, dir)` — active un écran, déclenche l'animation slide, gère la direction automatiquement selon `_SCREEN_ORDER`
- Direction auto : compare les index dans `['app-launcher','home','sections-level1','sections-level2','lesson']`
- Navigation prev/next dans les modules : `lessonNav(±1)` — `app.js` `L.1 177`
- Badge niveau cliquable dans le header leçon : retour direct au bon niveau
- Barre de navigation basse : `_updateBottomNav()` — masquée sur le lanceur, libellés bilingues, bouton actif synchronisé

---

## ⚙️ Fonctionnalités — `app.js` (4 113 lignes, 21 sections)

### §1 Variables d'état globales (L.52)
Toutes les variables partagées : `currentMode`, `voiceLang`, `ALL_THEMES`, `STORAGE_KEY`, état de session des quiz, `done[]`.

### Utilitaire bilingue L() (L.88)
```js
function L(fr, et) { return currentMode === 'learn_french' ? fr : et; }
```
**Toute chaîne de l'interface passe par `L()`** — élimine tous les `if/else` de langue. Complété par `langKeys()` (clés `fr`/`et` selon le mode) et `_themeTitle()`.

### §2 Initialisation — initApp(mode) (L.158)
Chargement conditionnel du dataset, thème visuel immédiat, spinner, onboarding premier lancement. Gère aussi la balise `lang` HTML pour les lecteurs d'écran (`om` si interface Oromo, `fr` si interface Française).

### §3 Synthèse vocale TTS (L.341)
**Cascade de voix pour l'Oromo** : `om-ET → so-SO → am-ET → ha-NG → sw-KE → es-ES → it-IT`. Détection et sélection automatique de la meilleure voix disponible. Gestion des textes multi-parties séparés par `/` (lecture séquentielle avec délai). Interruption auto à la mise en arrière-plan (`visibilitychange` — §3c `L.617`).

### §3b Retour haptique (L.522)
`navigator.vibrate()` — 40 ms sur bonne réponse, `[60,40,60]` sur erreur. Silencieux sur les plateformes non compatibles.

### §3b2 Animation Confetti (L.544)
22 particules CSS dynamiques à la première obtention de 3 étoiles. Palette adaptée au thème actif. Overlay auto-détruit après 2,4 s.

### §4 Persistance progression — Étoiles ⭐ (L.654)
```
Score ≥ 50% → ⭐   Score ≥ 75% → ⭐⭐   Score = 100% → ⭐⭐⭐
```
Les étoiles ne diminuent jamais (meilleur score conservé). `localStorage` par mode (`pe_om_fr_done_v1` / `pe_fr_om_done_v1`). Réinitialisation par thème individuel ou globale via modale de confirmation personnalisée.

### §4b Restauration de session quiz (L.877)
`sessionStorage` sauvegarde l'état complet du quiz (étape, score, questions) après chaque réponse. Reprise automatique si l'utilisateur revient sur l'onglet. Effacé à la fermeture complète du navigateur.

### §5/§5b Navigation (L.978)
Voir section Navigation ci-dessus.

### §6 Barre de progression Home (L.1 200)
`_getProgress()` — source unique de vérité (total, n, pct, starsEarned, starsMax). Utilisée par renderHome() ET renderSections() pour éviter la duplication. Cercle SVG animé sur l'écran Home.

### §7 Grille des thèmes (L.1 282)
`renderSections(level)` génère les grilles Niveau 1 (32 thèmes) et Niveau 2 (16 thèmes). Carte thème : emoji + nom + sous-titre bilingue + étoiles `⭐☆☆` + bouton de réinitialisation individuelle si complété.

### §8 Ouverture d'un thème + onglets (L.1 387)
`openTheme(id)` charge le thème, construit les onglets dynamiquement selon le type :
- **Vocabulaire standard** : Cartes Flash + Quiz + Répète
- **Alphabet** : Grille lettres + Quiz Audio
- **Dialogue** : Dialogue + Lexique + Quiz + Répète

`switchTab()` gère le repositionnement du bouton PDF en mode Cartes (sortie du flux flex + `position:fixed` dynamique — correction Android).

### §9 Cartes Flash (L.1 558)
Navigation prev/next avec bouton écoute TTS. Mode Alphabet : grille cliquable. Retournement recto/verso par CSS (classe `flipped`). Gestion des conjugaisons (`conj`) pour les verbes.

### §10 Quiz 10 questions (L.1 707)
Questions auto-générées depuis le champ `words` (mélange, 10 questions max). Pour l'alphabet : `quiz10` fixe. 4 options par question. Feedback immédiat (couleur + vibration), délai 1,5 s avant question suivante. Attribution et animation des étoiles progressives.

### §11 Dialogue / Situations (L.1 955)
3 situations par module Niveau 2. Onglets de situation. Bulles de dialogue alignées gauche/droite. Lecture TTS de chaque réplique. Navigation entre situations mémorisée pour l'export PDF.

### §12 Vocabulaire lexique (L.2 012)
Chips cliquables avec TTS au tap. Affichage du lexique clé des modules Niveau 2.

### §13b Onglet Répète — Reconnaissance vocale (L.2 057)
**Algorithme de correspondance phonétique** à 3 niveaux :
1. Correspondance exacte ou inclusion dans la transcription
2. Mots courts (≤ 3 car) : exacte uniquement
3. Distance de **Levenshtein** (algo DP) : tolérance ≤ 25 % de la longueur

Cascade de langues pour la reconnaissance Oromo : `om-ET → so-SO → am-ET → ha-NG → sw-KE → es-ES → it-IT`. Normalisation des textes (sans accents, sans ponctuation) avant comparaison.

### §13 Quiz Dialogue (L.2 651)
Quiz fixe (3 questions dans `data-*.js`, champ `quiz`). Questions sur le contenu du dialogue. Même mécanique de feedback et d'étoiles que le quiz vocabulaire.

### §14 Utilitaires (L.2 741)
`_quizResultStrings()` — chaînes de résultats bilingues. `esc()` — échappement apostrophes Oromo pour innerHTML. `_escAttr()` — échappement attributs HTML.

### §17 Guide utilisateur Onboarding (L.2 800)
Affiché une seule fois par mode (flag `localStorage` séparé : `tm_onboarded_fr` / `tm_onboarded_or`). Accordéons HTML natifs `<details>/<summary>` (zéro JS d'ouverture/fermeture). Checkbox "Ne plus afficher". Accessible depuis la nav bar (bouton ❓).

Contenu du guide :
- Comment ça marche + flux utilisateur visuel
- Points forts de l'app
- Guide audio (installation voix par OS : Android / iOS / Windows / macOS)
- Guide de prononciation Oromo
- Section Répète (reconnaissance vocale)
- Trucs et astuces
- Réinitialisation

### §18 Crédits (L.3 362)
Modale bilingue. E-mail antispam (adresse écrite à l'envers dans le DOM, reconstituée en mémoire vive au clic — ouvre le client mail + copie dans le presse-papier).

### §19 Spinner de chargement (L.3 451)
Affiché entre le clic lanceur et l'affichage du Home. Injecté dynamiquement dans le `<body>`, retiré via transition CSS après chargement de `data-*.js`.

### §21b Viewport Height Fix Android (L.3 494)
`window.innerHeight` → `--app-h` sur `<html>`. Déclenché sur `resize`, `visualViewport.resize` (debounce 80 ms) et `touchend` (fallback 300 ms). Corrige les décalages liés à la barre d'URL Chrome/Brave.

### §20 Service Worker (L.3 556)
Enregistrement post-chargement. Flag anti-boucle `controllerchange`. Rechargement automatique à la prise de contrôle du nouveau SW (mise à jour transparente).

### §21 Exports PDF (L.3 588)
3 types d'export via `window.print()` dans une nouvelle fenêtre :
- **Export Guide** (`_exportGuide()` — L.3 773) : page HTML complète du guide utilisateur
- **Export Vocabulaire** (`_exportVocab()` — L.3 870) : tableau bilingue des mots du module, avec conjugaisons si présentes
- **Export Situation** (`_exportSituation()` — L.3 966) : dialogue en colonnes + lexique clé

Chaque export génère une page HTML inline avec CSS print (`@media print`), en-tête coloré selon le thème, logo, numérotation, pied de page. Le bouton export est repositionné dynamiquement en mode Cartes pour rester visible sur Android (`switchTab()` — §8).

---

## 🌐 PWA & Hors-ligne — `sw.js` (598 lignes) + `manifest.json`

### Service Worker — Stratégie hybride
| Type de ressource | Stratégie | Fallback |
|---|---|---|
| Ressources locales (HTML, CSS, JS, PNG) | **Cache First** | Fallback typé |
| Ressources externes (CDN, fonts, API) | **Network First** | Cache ou SVG |
| Navigation HTML (hors-ligne total) | Cache First | Page HTML offline inline |
| Icône PWA manquante | Cache First | SVG vache bicolore |
| Image raster manquante | Cache First | SVG placeholder neutre |
| Image externe manquante | Network First | SVG placeholder vert-or |

### Fallbacks SVG inline générés en mémoire (sw.js)
- **Icône vache** : SVG 512×512 — fond bicolore FR|OR, silhouette de vache Holstein, signature "T'M", drapeaux symboliques (`_respondSvgIcon()` — L.315)
- **Image locale** : placeholder globe centré, cadre pointillé (`_respondSvgLocalImage()` — L.428)
- **Image externe** : variante vert-or, icône wifi barré (`_respondSvgExternalImage()` — L.463)
- **Page offline** : HTML complet avec globe SVG, texte bilingue FR/OR, bouton "Réessayer" (`offlinePage()` — L.505)

### Cache
Nom auto-versionné par `GITHUB_RUN_NUMBER` (GitHub Actions) à chaque déploiement. Nettoyage automatique des anciens caches à l'activation. Toutes les ressources statiques pré-cachées à l'installation (`skipWaiting()`).

### Manifest PWA
- 10 tailles d'icônes (72 → 512 px, variantes maskable)
- 5 screenshots déclarés (form_factor: narrow)
- Orientation portrait-primary
- `prefer_related_applications: false`

---

## 🔧 Maintenance & code — points clés

### Conventions à respecter
- **Toute chaîne UI** passe par `L(fr, et)` — jamais de texte hardcodé en une seule langue
- **Styles visuels** → `style.css` uniquement, jamais de `style.inline` sauf exceptions documentées
- **Couleurs** → toujours `var(--c-*)`, jamais de couleur hardcodée en JS (sauf exports PDF qui n'ont pas accès au CSS)
- **Nouvelles sections `app.js`** → ajouter l'entrée dans le plan de sections (L.14–51)

### Points sensibles documentés
| Problème | Solution | Localisation |
|---|---|---|
| Barre d'URL Android (--app-h) | `window.innerHeight` → CSS var | app.js §21b L.3 494 |
| Bouton PDF masqué en mode Cartes | Déplacement DOM + `position:fixed` dynamique | app.js §8 switchTab() L.1 520 |
| TTS en arrière-plan | `visibilitychange` → `speechSynthesis.cancel()` | app.js §3c L.617 |
| Apostrophes Oromo dans innerHTML | `esc()` et `_escAttr()` | app.js §14 L.2 794 |
| Rechargement multiple SW | Flag `_reloading` + `controllerchange` | app.js §20 L.3 566 |
| Réinjection script data-*.js | Cache `_loadedDataFiles` | app.js §2 L.180 |
| Quiz état perdu (appel entrant) | sessionStorage après chaque réponse | app.js §4b L.877 |

### Ajouter un thème
1. Ajouter l'objet dans `data-fr.js` ET `data-or.js` (même `id`, même structure)
2. Ajouter le commentaire `// N/48 -- Nom -- Sous-titre` avant l'objet
3. Mettre à jour le compteur total si > 48 thèmes

### Ajouter une langue d'interface
1. Créer `data-xx.js` avec les mêmes `id` que les autres datasets
2. Dans `app.js` : étendre `L()` ou créer `L3(fr, et, xx)`
3. Dans `initApp()` : nouvelle branche `else if`
4. Dans `style.css` : nouveau `html.theme-xx { ... }`
5. Dans `sw.js` : ajouter `data-xx.js` à `PRECACHE_URLS`

---

## 📊 Métriques de l'application

| Indicateur | Valeur |
|---|---|
| Thèmes Niveau 1 (vocabulaire) | 32 |
| Thèmes Niveau 2 (dialogue) | 16 |
| Total thèmes | 48 |
| Onglets par thème (vocab) | 3 : Cartes + Quiz + Répète |
| Onglets par thème (dialogue) | 4 : Dialogue + Lexique + Quiz + Répète |
| Onglets par thème (alphabet) | 2 : Grille + Quiz Audio |
| Modes d'apprentissage | 2 (apprendre le Français / apprendre l'Oromo) |
| Progressions indépendantes | 2 (localStorage séparés) |
| Tailles d'icônes PWA | 10 (72 → 512 px) |
| Fallbacks SVG offline | 4 types |
| Exports PDF | 3 types (Guide, Vocab, Situation) |
| Langues reconnues (Répète) | 7 (cascade Oromo) / 1 (Français) |

---

*Bilan généré pour comparaison avec l'application Espagnol-Français · © Juin 2026*
