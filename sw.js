/*
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  Language App 🇫🇷🇪🇹  —  sw.js  (Service Worker)              ║
 * ║  Auteur   : Sébastien Godet                                     ║
 * ║  Assistés  : Claude Sonnet 4.6 et Gemini 3.5 Flash                                 ║
 * ║  Version  : Juin 2026                                           ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  STRATÉGIE DE CACHE HYBRIDE                                     ║
 * ║                                                                 ║
 * ║  • Ressources locales (html, css, js, png, icons)               ║
 * ║    → Cache First : on sert depuis le cache, réseau en fallback  ║
 * ║    → Objectif : fonctionnement 100% hors-ligne après install    ║
 * ║                                                                 ║
 * ║  • Ressources externes (CDN, API, fonts Google…)                ║
 * ║    → Network First : réseau d'abord, cache en fallback          ║
 * ║    → Objectif : fraîcheur des données quand le réseau existe    ║
 * ║                                                                 ║
 * ║  FALLBACKS SVG INLINE                                           ║
 * ║  Quand une ressource est introuvable (cache + réseau KO),       ║
 * ║  le SW répond avec un SVG ou une page HTML générés en mémoire   ║
 * ║  plutôt qu'une erreur 503 nue. Quatre types couverts :          ║
 * ║    • Image PNG/JPG/WEBP manquante  → svgFallbackImage()         ║
 * ║    • Icône PWA manquante           → svgFallbackIcon()          ║
 * ║    • Image externe manquante       → _respondSvgExternalImage() ║
 * ║      (GitHub raw, CDN Twemoji, Google Fonts…)                   ║
 * ║    • Navigation HTML manquante     → offlinePage()              ║
 * ║                                                                 ║
 * ║  CYCLE DE VIE                                                   ║
 * ║    install  → pré-cache de toutes les ressources statiques      ║
 * ║    activate → nettoyage des anciens caches (évite les zombies)  ║
 * ║    fetch    → interception et dispatch Cache/Network First      ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

/* ──────────────────────────────────────────────────────────────────
   CONFIGURATION  (L.34)
   ──────────────────────────────────────────────────────────────────
   CACHE_NAME : suffixe automatiquement remplacé par GitHub Actions
   (variable GITHUB_RUN_NUMBER) à chaque déploiement — pas d'action
   manuelle requise.
   ────────────────────────────────────────────────────────────────── */
const CACHE_NAME = 'taphadmeuh-GITHUB_RUN_NUMBER';   /* Suffixe automatisé par GitHub Actions */

/*
  Liste exhaustive des ressources à pré-cacher lors de l'installation.
  Toutes ces URLs doivent répondre 200 ou l'install échoue.
  Chemins relatifs à la racine du scope du SW.

  CHANGEMENT v2 : data.js remplacé par data-fr.js + data-or.js.
  Les deux fichiers de données sont pré-cachés dès l'installation
  pour garantir le fonctionnement hors-ligne dans les deux modes,
  même si l'utilisateur n'a encore choisi qu'un seul mode.
  (Le coût réseau est identique à l'ancien data.js monolithique,
  mais la mémoire JS n'est consommée que pour le mode actif.)
*/
/*
  Ressources CRITIQUES : un seul échec fait échouer l'installation entière du SW.
  Ces fichiers doivent tous répondre 200 ou l'app ne sera pas installable hors-ligne.

  IMPORTANT (I5) — data-fr.js et data-or.js sont explicitement précachés ici.
  Sans cela, _loadDataScript() (injection dynamique de <script>) ne pourrait pas
  les servir hors-ligne : le SW naïf (cache statique à l'install) ne les intercepte
  que s'ils figurent dans PRECACHE_URLS. Les deux fichiers DOIVENT rester dans cette
  liste si de nouveaux fichiers de données sont ajoutés à l'avenir.
*/
const PRECACHE_URLS = [
  './index.html',
  './css/style.css',
  './js/data-fr.js',
  './js/data-or.js',
  './js/app.js',
  './manifest.json',
  /* Logo principal affiché sur l'écran lanceur */
  './img/Logo-appli-or-fr.png',
  /* Icônes PWA */
  './icons/icon-72x72.png',
  './icons/icon-96x96.png',
  './icons/icon-128x128.png',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
  './icons/icon-192x192.png',
  './icons/icon-192x192-maskable.png',
  './icons/icon-384x384.png',
  './icons/icon-512x512.png',
  './icons/icon-512x512-maskable.png'
];

/*
  Ressources OPTIONNELLES : screenshots manifest.json uniquement.
  Leurs noms contiennent des espaces et des caractères accentués (ç)
  qui peuvent provoquer des erreurs 404 selon l'encodage du serveur.
  Un échec ici NE bloque PAS l'installation du SW : cache.addAll()
  est remplacé par des cache.add() individuels avec .catch() silencieux.
*/
const PRECACHE_SCREENSHOTS = [
  './img/Ecran Accueil - 933x1829.png',
  './img/Modules 933x1829.png',
  './img/Flashcard fran\u00e7ais recto 933x1829.png',
  './img/Flashcard oromo verso 933x1829.png',
  './img/Guide Explicatif 933x1829.png'
];

/* Préfixes d'URLs considérées comme "externes" → stratégie Network First */
const EXTERNAL_PREFIXES = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://cdnjs.cloudflare.com',
  'https://raw.githubusercontent.com/',
  'https://api.'
];

/* Extensions reconnues comme des images raster */
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];

/* Chemin du dossier des icônes PWA */
const ICONS_PATH = '/icons/';


/* ──────────────────────────────────────────────────────────────────
   HELPERS — CLASSIFICATION DES REQUÊTES  (L.98)
   ────────────────────────────────────────────────────────────────── */

/**
 * Détermine si une URL est une ressource externe.
 * @param {string} url
 * @returns {boolean}
 */
function _isExternal(url) {
  return EXTERNAL_PREFIXES.some((prefix) => url.startsWith(prefix));
}

/**
 * Détermine si une requête doit être interceptée.
 * On ignore les requêtes non-GET et les extensions navigateur.
 * @param {Request} request
 * @returns {boolean}
 */
function _shouldHandle(request) {
  return request.method === 'GET'
    && (request.url.startsWith('http://') || request.url.startsWith('https://'));
}

/**
 * Détecte si l'URL pointe vers une image raster (PNG, JPG, WEBP…).
 * @param {string} url
 * @returns {boolean}
 */
function _isRasterImage(url) {
  const clean = url.split('?')[0].toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => clean.endsWith(ext));
}

/**
 * Détecte si l'URL pointe vers une icône PWA dans /icons/.
 * @param {string} url
 * @returns {boolean}
 */
function _isPwaIcon(url) {
  return url.includes(ICONS_PATH);
}

/**
 * Détecte si la requête est une navigation (page HTML principale).
 * Mode 'navigate' = le navigateur charge une URL directement.
 * @param {Request} request
 * @returns {boolean}
 */
function _isNavigation(request) {
  return request.mode === 'navigate'
    || request.headers.get('accept').indexOf('text/html') !== -1;
}


/* ──────────────────────────────────────────────────────────────────
   INSTALL — Pré-cache des ressources statiques  (L.155)
   ──────────────────────────────────────────────────────────────────
   skipWaiting() : le nouveau SW prend le contrôle immédiatement
   sans attendre la fermeture de tous les onglets.
   ────────────────────────────────────────────────────────────────── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      /* 1. Ressources critiques : un échec ici fait échouer l'installation */
      return cache.addAll(PRECACHE_URLS)
        .then(() => {
          /* 2. Screenshots optionnels : échecs silencieux (noms avec espaces/accents) */
          return Promise.all(
            PRECACHE_SCREENSHOTS.map((url) => cache.add(url).catch(() => {}))
          );
        });
    })
    .then(() => self.skipWaiting())
  );
});


/* ──────────────────────────────────────────────────────────────────
   ACTIVATE — Nettoyage des anciens caches  (L.174)
   ────────────────────────────────────────────────────────────────── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name)   => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});


/* ──────────────────────────────────────────────────────────────────
   FETCH — Interception des requêtes réseau  (L.194)
   ──────────────────────────────────────────────────────────────────
   Dispatch vers la stratégie appropriée selon le type de ressource.
   ────────────────────────────────────────────────────────────────── */
self.addEventListener('fetch', function(event) {
  if (!_shouldHandle(event.request)) return;

  if (_isExternal(event.request.url)) {
    event.respondWith(networkFirst(event.request));
  } else {
    event.respondWith(cacheFirst(event.request));
  }
});


/* ──────────────────────────────────────────────────────────────────
   STRATÉGIE 1 — CACHE FIRST (ressources locales)  (L.210)
   ──────────────────────────────────────────────────────────────────
   1. Cherche dans le cache
   2. Si trouvé → répond immédiatement
   3. Si absent → fetch réseau + mise en cache
   4. Si réseau aussi KO → fallback SVG ou page offline selon le type
   ────────────────────────────────────────────────────────────────── */
function cacheFirst(request) {
  return caches.match(request)
    .then(function(cached) {
      if (cached) return cached;

      return fetch(request)
        .then(function(networkResponse) {
          if (!networkResponse || networkResponse.status !== 200
              || networkResponse.type === 'error') {
            return networkResponse;
          }
          /* clone() obligatoire : une Response ne peut être lue qu'une fois */
          var toCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(request, toCache);
          });
          return networkResponse;
        })
        .catch(function() {
          /* ── Réseau KO + cache vide : fallback typé ── */
          return _offlineFallback(request);
        });
    });
}


/* ──────────────────────────────────────────────────────────────────
   STRATÉGIE 2 — NETWORK FIRST (ressources externes)  (L.244)
   ──────────────────────────────────────────────────────────────────
   1. Tente le fetch réseau
   2. Si succès → répond + met à jour le cache en arrière-plan
   3. Si réseau KO → fallback cache ou SVG externe selon le type
   ────────────────────────────────────────────────────────────────── */
function networkFirst(request) {
  return fetch(request)
    .then(function(networkResponse) {
      if (!networkResponse || networkResponse.status !== 200
          || networkResponse.type === 'error') {
        return networkResponse;
      }
      var toCache = networkResponse.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(request, toCache);
      });
      return networkResponse;
    })
    .catch(function() {
      return caches.match(request).then(function(cached) {
        if (cached) return cached;
        /* Ressource externe absente du cache → fallback SVG si image.
         * Couvre : Google Fonts, CDN Twemoji, GitHub raw (raw.githubusercontent.com).
         */
        if (_isRasterImage(request.url)) return _respondSvgExternalImage();
        return new Response('', { status: 503, statusText: 'Hors ligne' });
      });
    });
}


/* ──────────────────────────────────────────────────────────────────
   DISPATCH DU FALLBACK OFFLINE (ressources locales)  (L.275)
   ──────────────────────────────────────────────────────────────────
   Choisit le bon fallback selon le type de ressource manquante :
     • Navigation HTML    → page offline complète avec bouton retry
     • Icône PWA          → SVG vache tricolore (identité de l'app)
     • Image raster       → SVG placeholder neutre
     • Tout le reste      → réponse vide 503 (CSS, JS : rien à faire)
   ────────────────────────────────────────────────────────────────── */
function _offlineFallback(request) {
  var url = request.url;

  if (_isNavigation(request)) {
    return new Response(offlinePage(), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  if (_isPwaIcon(url)) {
    return _respondSvgIcon();
  }

  if (_isRasterImage(url)) {
    return _respondSvgLocalImage();
  }

  /* CSS, JS, JSON manquants hors-ligne → 503 silencieux */
  return new Response('', { status: 503, statusText: 'Hors ligne' });
}


/* ──────────────────────────────────────────────────────────────────
   FALLBACK 1 — ICÔNE PWA MANQUANTE  (L.307)
   ──────────────────────────────────────────────────────────────────
   SVG carré 512×512 qui reproduit l'identité visuelle de l'app :
   dégradé tricolore (bleu FR / blanc / rouge), globe centré et
   le nom court "T'M" en typographie grasse.
   Utilisé si une icône PNG du dossier /icons/ est absente du cache.
   ────────────────────────────────────────────────────────────────── */
function _respondSvgIcon() {
  /*
   * Icône de secours Taphad'Meuh — SVG 512×512
   * ─────────────────────────────────────────────
   * Fidèle à l'identité visuelle : fond partagé FR (gauche) / OR (droite),
   * silhouette de vache stylisée (visage + cornes + taches) en blanc opaque,
   * texte "T'M" en bas comme signature.
   *
   * Géométrie vache :
   *   - Tête ovale  : ellipse cx=256 cy=230 rx=95 ry=85
   *   - Deux cornes : arcs Bézier vers le haut
   *   - Museau      : ellipse plus petite, légèrement plus basse
   *   - Narines     : deux petits cercles
   *   - Yeux        : deux cercles remplis blanc + pupilles foncées
   *   - Taches      : ellipses irrégulières en blanc semi-transparent
   *   - Oreilles    : demi-cercles latéraux
   */
  var svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" role="img" aria-label="Taphad\'Meuh — icône vache bicolore">',
    '  <defs>',
    '    <linearGradient id="gFR" x1="0" y1="0" x2="0" y2="1">',
    '      <stop offset="0%"   stop-color="#002395"/>',
    '      <stop offset="50%"  stop-color="#1a3a9e"/>',
    '      <stop offset="100%" stop-color="#003cbf"/>',
    '    </linearGradient>',
    '    <linearGradient id="gOR" x1="0" y1="0" x2="0" y2="1">',
    '      <stop offset="0%"   stop-color="#007a36"/>',
    '      <stop offset="50%"  stop-color="#009A44"/>',
    '      <stop offset="100%" stop-color="#00b84f"/>',
    '    </linearGradient>',
    '    <clipPath id="rnd"><rect width="512" height="512" rx="96" ry="96"/></clipPath>',
    '  </defs>',

    '  <!-- Fond bicolore FR|OR -->',
    '  <g clip-path="url(#rnd)">',
    '    <rect width="512" height="512" fill="url(#gFR)"/>',
    '    <!-- Triangle OR sur le côté droit -->',
    '    <polygon points="280,0 512,0 512,512 280,512" fill="url(#gOR)" opacity="0.92"/>',
    '    <!-- Bande centrale blanche séparatrice -->',
    '    <rect x="268" y="0" width="10" height="512" fill="rgba(255,255,255,.18)"/>',
    '  </g>',

    '  <!-- ══ Vache stylisée ══ -->',

    '  <!-- Oreilles -->',
    '  <ellipse cx="152" cy="208" rx="32" ry="22" fill="rgba(255,255,255,.85)" transform="rotate(-20,152,208)"/>',
    '  <ellipse cx="152" cy="208" rx="18" ry="12" fill="rgba(255,180,180,.6)"  transform="rotate(-20,152,208)"/>',
    '  <ellipse cx="360" cy="208" rx="32" ry="22" fill="rgba(255,255,255,.85)" transform="rotate(20,360,208)"/>',
    '  <ellipse cx="360" cy="208" rx="18" ry="12" fill="rgba(255,180,180,.6)"  transform="rotate(20,360,208)"/>',

    '  <!-- Cornes -->',
    '  <path d="M185 170 Q160 100 195 72" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="16" stroke-linecap="round"/>',
    '  <path d="M327 170 Q352 100 317 72" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="16" stroke-linecap="round"/>',

    '  <!-- Taches de vache (Holstein) sur la tête -->',
    '  <ellipse cx="218" cy="195" rx="28" ry="20" fill="rgba(255,255,255,.22)" transform="rotate(-15,218,195)"/>',
    '  <ellipse cx="300" cy="185" rx="22" ry="16" fill="rgba(255,255,255,.18)" transform="rotate(10,300,185)"/>',
    '  <ellipse cx="255" cy="250" rx="18" ry="13" fill="rgba(255,255,255,.15)"/>',

    '  <!-- Tête ovale -->',
    '  <ellipse cx="256" cy="228" rx="96" ry="86" fill="rgba(255,255,255,.88)"/>',

    '  <!-- Museau -->',
    '  <ellipse cx="256" cy="284" rx="58" ry="38" fill="rgba(255,220,210,.95)"/>',

    '  <!-- Narines -->',
    '  <ellipse cx="234" cy="290" rx="10" ry="7"  fill="rgba(160,80,80,.55)"/>',
    '  <ellipse cx="278" cy="290" rx="10" ry="7"  fill="rgba(160,80,80,.55)"/>',

    '  <!-- Yeux -->',
    '  <circle cx="218" cy="210" r="18" fill="#1a1a1a"/>',
    '  <circle cx="294" cy="210" r="18" fill="#1a1a1a"/>',
    '  <circle cx="224" cy="205" r="7"  fill="#fff"/>',
    '  <circle cx="300" cy="205" r="7"  fill="#fff"/>',
    '  <!-- Reflets dans les yeux -->',
    '  <circle cx="227" cy="203" r="3"  fill="rgba(255,255,255,.9)"/>',
    '  <circle cx="303" cy="203" r="3"  fill="rgba(255,255,255,.9)"/>',

    '  <!-- Signature T\'M en bas -->',
    '  <text x="256" y="430" font-family="system-ui,sans-serif" font-size="64"',
    '        font-weight="900" fill="#fff" text-anchor="middle"',
    '        letter-spacing="-1" opacity="0.96">T\'M</text>',

    '  <!-- Petits drapeaux 🇫🇷🇪🇹 symboliques — rectangles colorés -->',
    '  <!-- FR : bleu blanc rouge -->',
    '  <rect x="148" y="455" width="12" height="22" fill="#002395" rx="1"/>',
    '  <rect x="160" y="455" width="12" height="22" fill="#fff"    rx="0"/>',
    '  <rect x="172" y="455" width="12" height="22" fill="#ED2939" rx="1"/>',
    '  <!-- ET : vert jaune rouge -->',
    '  <rect x="328" y="455" width="12" height="22" fill="#009A44" rx="1"/>',
    '  <rect x="340" y="455" width="12" height="22" fill="#FED141" rx="0"/>',
    '  <rect x="352" y="455" width="12" height="22" fill="#EF2B2D" rx="1"/>',

    '</svg>'
  ].join('\n');

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-store'
    }
  });
}


/* ──────────────────────────────────────────────────────────────────
   FALLBACK 2 — IMAGE LOCALE MANQUANTE  (L.421)
   ──────────────────────────────────────────────────────────────────
   SVG placeholder neutre pour toute image PNG/JPG locale absente
   du cache. Montre une icône image cassée stylisée avec le logo
   globe de l'app, sans texte pour rester universellement lisible.
   ────────────────────────────────────────────────────────────────── */
function _respondSvgLocalImage() {
  var svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" width="320" height="200" role="img" aria-label="Image non disponible hors-ligne">',
    '  <rect width="320" height="200" rx="12" fill="#e8ecf8"/>',
    '  <!-- Cadre image cassée -->',
    '  <rect x="110" y="50" width="100" height="80" rx="8" fill="none" stroke="#b0b8d8" stroke-width="2.5" stroke-dasharray="6 4"/>',
    '  <!-- Globe simplifié centré dans le cadre -->',
    '  <circle cx="160" cy="90" r="28" fill="none" stroke="#8090c0" stroke-width="2"/>',
    '  <ellipse cx="160" cy="90" rx="13" ry="28" fill="none" stroke="#8090c0" stroke-width="1.5" opacity="0.6"/>',
    '  <line x1="132" y1="90" x2="188" y2="90" stroke="#8090c0" stroke-width="1.5" opacity="0.6"/>',
    '  <!-- Étiquette -->',
    '  <text x="160" y="155" font-family="system-ui,sans-serif" font-size="11"',
    '        fill="#9098b8" text-anchor="middle">Image non disponible hors-ligne</text>',
    '  <text x="160" y="170" font-family="system-ui,sans-serif" font-size="10"',
    '        fill="#b0b8d0" text-anchor="middle" font-style="italic">Interneetii malee hin argamu</text>',
    '</svg>'
  ].join('\n');

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-store'
    }
  });
}


/* ──────────────────────────────────────────────────────────────────
   FALLBACK 3 — IMAGE EXTERNE MANQUANTE (CDN, API…)  (L.456)
   ──────────────────────────────────────────────────────────────────
   Variante du placeholder local mais avec un ton légèrement
   différent pour indiquer que c'est une ressource distante
   (dégradé vert-or au lieu de bleu — rappel du thème Oromo).
   ────────────────────────────────────────────────────────────────── */
function _respondSvgExternalImage() {
  var svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" width="320" height="200" role="img" aria-label="Ressource externe non disponible">',
    '  <defs>',
    '    <linearGradient id="gExt" x1="0" y1="0" x2="1" y2="1">',
    '      <stop offset="0%" stop-color="#e8f5e9"/>',
    '      <stop offset="100%" stop-color="#fff8e1"/>',
    '    </linearGradient>',
    '  </defs>',
    '  <rect width="320" height="200" rx="12" fill="url(#gExt)"/>',
    '  <rect x="110" y="50" width="100" height="80" rx="8" fill="none" stroke="#a0d4b8" stroke-width="2.5" stroke-dasharray="6 4"/>',
    '  <!-- Signal wifi barré -->',
    '  <circle cx="160" cy="82" r="6" fill="#a0c8b0"/>',
    '  <path d="M145 70 Q160 58 175 70" fill="none" stroke="#a0c8b0" stroke-width="2.5" stroke-linecap="round"/>',
    '  <path d="M138 63 Q160 48 182 63" fill="none" stroke="#c8dfc8" stroke-width="2" stroke-linecap="round" opacity="0.6"/>',
    '  <line x1="148" y1="58" x2="172" y2="108" stroke="#EF2B2D" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>',
    '  <text x="160" y="155" font-family="system-ui,sans-serif" font-size="11"',
    '        fill="#5a8a6a" text-anchor="middle">Ressource externe non disponible</text>',
    '  <text x="160" y="170" font-family="system-ui,sans-serif" font-size="10"',
    '        fill="#a0c8b0" text-anchor="middle" font-style="italic">Alaa interneetii hin argamu</text>',
    '</svg>'
  ].join('\n');

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-store'
    }
  });
}


/* ──────────────────────────────────────────────────────────────────
   FALLBACK 4 — PAGE DE NAVIGATION HORS-LIGNE  (L.496)
   ──────────────────────────────────────────────────────────────────
   Page HTML complète affichée quand l'utilisateur tente d'ouvrir
   l'app sans réseau ET avant la première visite (cache vide).
   Après la première visite réussie, index.html est en cache et
   cette page n'est jamais montrée.
   Design : reprend les couleurs et la typographie de l'app.
   ────────────────────────────────────────────────────────────────── */
function offlinePage() {
  return '<!DOCTYPE html>'
    + '<html lang="fr">'
    + '<head>'
    + '<meta charset="UTF-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=5">'
    + '<title>Hors ligne — Taphad\'Meuh 🌍</title>'
    + '<style>'
    /* reset */
    + '*{box-sizing:border-box;margin:0;padding:0}'
    + 'body{'
    +   'font-family:"Segoe UI",system-ui,sans-serif;'
    +   'min-height:100vh;display:flex;flex-direction:column;'
    +   'align-items:center;justify-content:center;'
    +   'background:#f5f5f0;color:#1a1a2e;text-align:center;padding:32px 24px'
    + '}'
    /* carte centrale */
    + '.card{'
    +   'background:#fff;border-radius:24px;padding:40px 32px;'
    +   'max-width:360px;width:100%;'
    +   'box-shadow:0 8px 40px rgba(0,35,149,.10)'
    + '}'
    /* SVG globe inline dans la carte */
    + '.globe-wrap{margin-bottom:20px}'
    /* textes */
    + 'h1{font-size:1.45rem;font-weight:900;color:#002395;margin-bottom:6px;letter-spacing:-.02em}'
    + '.sub{font-size:.82rem;color:#009A44;font-style:italic;margin-bottom:20px;font-weight:600}'
    + 'p{font-size:.92rem;color:#555;line-height:1.65;margin-bottom:10px}'
    + '.or{font-size:.80rem;color:#888;font-style:italic;line-height:1.6}'
    /* séparateur */
    + 'hr{border:none;border-top:1px solid #e8ecf8;margin:18px 0}'
    /* bouton */
    + 'button{'
    +   'margin-top:22px;padding:14px 36px;border:none;border-radius:50px;'
    +   'background:linear-gradient(135deg,#002395,#ED2939);'
    +   'color:#fff;font-size:.95rem;font-weight:700;cursor:pointer;'
    +   'box-shadow:0 4px 16px rgba(0,35,149,.25);'
    +   'transition:transform .15s,box-shadow .15s;width:100%'
    + '}'
    + 'button:active{transform:scale(.97);box-shadow:0 2px 8px rgba(0,35,149,.2)}'
    /* footer */
    + '.footer{margin-top:28px;font-size:.68rem;color:#bbb}'
    + '</style>'
    + '</head>'
    + '<body>'
    + '<div class="card">'

    /* Globe SVG inline — identité de l'app sans dépendance réseau */
    + '<div class="globe-wrap">'
    + '<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
    + '<defs>'
    + '<linearGradient id="gFR2" x1="0" y1="0" x2="0" y2="1">'
    + '<stop offset="0%" stop-color="#002395"/>'
    + '<stop offset="45%" stop-color="#ffffff"/>'
    + '<stop offset="100%" stop-color="#ED2939"/>'
    + '</linearGradient>'
    + '<linearGradient id="gOR2" x1="0" y1="0" x2="0" y2="1">'
    + '<stop offset="0%" stop-color="#009A44"/>'
    + '<stop offset="55%" stop-color="#FED141"/>'
    + '<stop offset="100%" stop-color="#EF2B2D"/>'
    + '</linearGradient>'
    + '</defs>'
    /* fond circulaire coupé diagonalement */
    + '<clipPath id="circ"><circle cx="40" cy="40" r="36"/></clipPath>'
    + '<circle cx="40" cy="40" r="36" fill="url(#gFR2)"/>'
    + '<polygon points="40,4 76,4 76,76 40,76" fill="url(#gOR2)" opacity="0.85" clip-path="url(#circ)"/>'
    /* méridiens et équateur */
    + '<circle cx="40" cy="40" r="36" fill="none" stroke="#fff" stroke-width="2.5" opacity="0.9"/>'
    + '<ellipse cx="40" cy="40" rx="16" ry="36" fill="none" stroke="#fff" stroke-width="1.8" opacity="0.6"/>'
    + '<line x1="4" y1="40" x2="76" y2="40" stroke="#fff" stroke-width="1.8" opacity="0.6"/>'
    + '<line x1="10" y1="26" x2="70" y2="26" stroke="#fff" stroke-width="1.2" opacity="0.35"/>'
    + '<line x1="10" y1="54" x2="70" y2="54" stroke="#fff" stroke-width="1.2" opacity="0.35"/>'
    + '</svg>'
    + '</div>'

    + '<h1>Taphad\'Meuh !</h1>'
    + '<div class="sub">Français ↔ Afaan Oromoo</div>'

    + '<p>L\'application n\'est pas encore disponible hors-ligne.</p>'
    + '<p>Connectez-vous une première fois pour activer l\'apprentissage sans réseau.</p>'

    + '<hr>'

    + '<p class="or">Applikeeshiniin kun interneetii malee ammaaf hin hojjetu.</p>'
    + '<p class="or">Dursii interneetiin banaa — booda malee hin barbaachisu.</p>'

    + '<button onclick="location.reload()">🔄 Réessayer &nbsp;/&nbsp; Irra deebiʼi</button>'
    + '</div>'

    + '<div class="footer">© Juin 2026 — Sébastien Godet</div>'

    + '</body>'
    + '</html>';
}