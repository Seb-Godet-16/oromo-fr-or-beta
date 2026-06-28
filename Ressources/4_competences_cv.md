# 💼 Compétences CV — Taphad'Meuh
### Ce que ce projet démontre concrètement

*Développé en autonomie avec assistance IA (Claude Sonnet 4.6 + Gemini 3.5 Flash) · Juin 2026*

---

## 🔷 Formulé pour un CV (bullet points directs)

### Développement Web Front-End
- Conception et développement complet d'une **PWA bilingue** (Français ↔ Afaan Oromoo) — zéro framework, zéro dépendance, JavaScript vanilla ES2020
- Architecture d'un moteur applicatif de 4 000+ lignes structuré en 21 sections documentées, avec 104 fonctions et un pattern de navigation multi-écrans par classes CSS
- Implémentation d'un **système de thèmes dual dynamique** (CSS custom properties `var(--c-*)`) — un seul toggle de classe HTML bascule l'intégralité de l'interface
- Développement de **5 types d'activités pédagogiques** : flashcards interactives (flip CSS 3D), quiz QCM (algorithme Fisher-Yates), dialogues, vocabulaire cliquable, reconnaissance vocale
- Maîtrise du **cycle de vie Service Worker** (Cache First / Network First, fallbacks SVG inline, versioning automatique de cache par CI/CD)

### Internationalisation & APIs navigateur
- Intégration de la **Web Speech API** (TTS + reconnaissance vocale) avec cascade de voix de fallback pour une langue minoritaire sans support natif (`om-ET → so-SO → am-ET`)
- Implémentation de l'**algorithme de Levenshtein** pour la tolérance aux fautes de prononciation dans l'onglet Répète
- Gestion complète d'une interface **bilingue fonctionnelle** via une fonction sélectrice unique `L(fr, et)` éliminant les blocs conditionnels dupliqués

### Performance & UX Mobile
- Stratégie de **chargement lazy** des datasets (~100 Ko par mode) via injection dynamique de `<script>` — aucun bundle, aucune surconsommation mémoire
- Fix natif du bug `100dvh` Android Chrome/Brave via recalcul de `--app-h` par `window.innerHeight`
- Implémentation du **retour haptique** (`navigator.vibrate()`) pour le feedback quiz (correct / incorrect)
- Animation confetti CSS pur (particules CSS variables + keyframes) déclenchée au score parfait

### Persistance & Gestion des données
- Architecture de progression persistante **localStorage** (étoiles, meilleur score) + **sessionStorage** (état du quiz — survie au changement d'onglet) avec clés indépendantes par mode
- Système d'étoiles à trois niveaux (⭐ ⭐⭐ ⭐⭐⭐) avec règle de non-régression et sauvegarde du meilleur score uniquement

### PWA & Déploiement
- Configuration complète **PWA** : `manifest.json`, icônes multi-résolutions (72→512 px, variantes maskable), screenshots store, orientation portrait, installation Android/iOS
- Pipeline CI/CD **GitHub Actions** — déploiement automatique sur GitHub Pages avec injection du numéro de build dans le nom de cache Service Worker (`sed -i`)
- Mise en place d'une **Content Security Policy** adaptée aux contraintes GitHub Pages (absence de headers HTTP custom)
- Protection anti-spam de l'email par affichage CSS RTL + copie clipboard au clic

### Accessibilité & Qualité
- Attributs `aria-*` et `role` sur les composants interactifs critiques
- Navigation clavier complète (Tab / Entrée / Espace)
- Support `prefers-reduced-motion` (animations désactivées) et `prefers-color-scheme` (mode sombre)
- Fonction d'annonce `_announce()` pour les lecteurs d'écran
- Exports PDF (`window.print()` + `@media print`) de 3 types de contenu (guide, vocabulaire, dialogue)

---

## 🔷 Formulé pour un entretien (réponses développées)

### "Vous avez travaillé sur une PWA ?"
> J'ai conçu et développé de A à Z une Progressive Web App bilingue Français/Oromo, installable sur Android et iOS sans store. Le projet couvre tout le cycle : architecture front-end, expérience utilisateur pédagogique, offline-first avec Service Worker, CI/CD automatisé sur GitHub Pages. Zéro framework, zéro dépendance externe — un choix délibéré pour la compatibilité maximale et l'hébergement statique.

### "Vous avez de l'expérience avec les APIs navigateur ?"
> Oui, j'ai intégré la Web Speech API dans ses deux dimensions : la synthèse vocale (TTS) avec une cascade de fallback pour l'Afaan Oromoo (une langue sans support natif sur la majorité des appareils), et la reconnaissance vocale pour l'onglet "Répète". J'ai aussi implémenté l'algorithme de Levenshtein pour tolérer les variations de prononciation dans les résultats de reconnaissance.

### "Comment gérez-vous la performance sans framework ?"
> Par du chargement lazy : seul le dataset du mode choisi (~100 Ko) est injecté dynamiquement au démarrage — l'autre dataset reste en cache Service Worker mais n'occupe aucune mémoire JS. Le système de cache est auto-versionné à chaque déploiement GitHub Actions, sans intervention manuelle.

### "Vous avez utilisé l'IA dans votre développement ?"
> Oui, j'ai travaillé en collaboration active avec Claude Sonnet 4.6 (Anthropic) et Gemini 3.5 Flash (Google) — non pas pour générer du code "à la volée", mais comme partenaires techniques : revue d'architecture, debug de cas limites (bug viewport Android, cascade TTS), génération et raffinement du dataset bilingue (387 entrées vocabulaire + 48 dialogues). Cela m'a permis d'itérer beaucoup plus vite tout en gardant la maîtrise des décisions techniques.

---

## 🔷 Tags / Mots-clés techniques (pour LinkedIn / ATS)

`PWA` · `Service Worker` · `Vanilla JavaScript` · `ES2020` · `CSS Custom Properties` · `Web Speech API` · `SpeechSynthesis` · `SpeechRecognition` · `Levenshtein` · `localStorage` · `sessionStorage` · `GitHub Actions` · `GitHub Pages` · `CI/CD` · `Cache First` · `Mobile-first` · `Accessibilité` · `aria` · `Content Security Policy` · `HTML5` · `CSS3` · `Fisher-Yates` · `Algorithme de tri` · `Applications bilingues` · `Internationalisation (i18n)` · `UX pédagogique` · `Application hors-ligne` · `Haptic feedback`

---

## 🔷 Ligne de projet pour CV (format 1 ligne)

> **Taphad'Meuh** — PWA bilingue Français/Oromo (Vanilla JS, Service Worker, Web Speech API, GitHub Actions) — 48 modules, 5 activités, 100 % hors-ligne · *github.com/sgodet/taphadmeuh*

---

*© Juin 2026 — Sébastien Godet*
