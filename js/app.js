/* ============================================================
   Taphad'Meuh 🐄  —  Moteur applicatif unifié
   Français ↔ Afaan Oromoo
   © Juin 2026 – Sébastien Godet · Claude Sonnet 4.6 et Gemini 3.5 Flash
   Modernisé ES2020 : let/const, fonctions fléchées, for…of
   ============================================================
   ARCHITECTURE (5 fichiers) :
     ├─ index.html   → Structure HTML + launcher
     ├─ style.css    → Thèmes couleur, composants visuels
     ├─ data-fr.js   → ALL_THEMES_FR (contenu — mode Français)
     ├─ data-or.js   → ALL_THEMES_OR (contenu — mode Oromo)
     └─ app.js       → Ce fichier : logique applicative complète

   SECTIONS DE CE FICHIER (ordre d'apparition réel) :
      1.   Variables d'état globales (let/const)             ligne ~   52
      —    Utilitaire bilingue L() / langKeys()              ligne ~   86
      2.   Point d'entrée — initApp(mode)                    ligne ~  156
      3.   Synthèse vocale + prononciation Oromo             ligne ~  341
      3b.  Retour haptique — _vibrateFeedback()              ligne ~  522
      3b2. Confetti — animation de félicitations (stars)     ligne ~  544
      3c.  Interruption audio — visibilitychange / focus     ligne ~  617
      4.   Persistance de la progression (étoiles)           ligne ~  654
      4c.  Réinitialisation — confirmResetProgress()         ligne ~  724  (dans §4)
      4b.  Restauration de session quiz (sessionStorage)     ligne ~  877
      5.   Navigation entre écrans                           ligne ~  976
      5b.  Navigation basse — helpers                        ligne ~ 1077
      6.   Écran Home — barre de progression globale         ligne ~ 1200
      7.   Écran Sections — grille des thèmes                ligne ~ 1282
      8.   Ouverture d'un thème (écran Lesson + onglets)     ligne ~ 1387
           switchTab() : onglets + repositionnement          ligne ~ 1508
           du bouton PDF en mode Cartes (fixed via JS)
      9.   Cartes Flash — vocabulaire interactif             ligne ~ 1558
     10.   Quiz 10 questions — avec étoiles progressives     ligne ~ 1707
     11.   Dialogue — scènes de situation                    ligne ~ 1955
     12.   Vocabulaire — lexique visuel cliquable            ligne ~ 2012
     13b.  Onglet Répète — reconnaissance vocale             ligne ~ 2057
     13.   Quiz Dialogue — questions sur le dialogue         ligne ~ 2651
     14.   Utilitaires & chaînes de résultats bilingues      ligne ~ 2741
     17.   Guide utilisateur — Onboarding                    ligne ~ 2800
      —    Écran Home — _buildHomeGuide()                    ligne ~ 2825
     18.   Crédits — showCredits()                           ligne ~ 3362
     15.   Initialisation du launcher                        ligne ~ 3413
     16.   Accessibilité clavier                             ligne ~ 3424
     19.   Spinner de chargement des données                 ligne ~ 3436
     19b.  Viewport height fix — Android Chrome / Brave      ligne ~ 3479
     20.   Enregistrement du Service Worker (PWA)            ligne ~ 3541
     21.   Exports PDF — window.print() + @media print       ligne ~ 3588
     21a.  Export Guide (écran Home)                         ligne ~ 3773
     21b.  Export Vocabulaire (leçon Niveau 1)               ligne ~ 3870
     21c.  Export Situation (leçon Niveau 2 — dialogue)      ligne ~ 3966
   ============================================================ */


/* ============================================================
   1. VARIABLES D'ÉTAT GLOBALES
   ============================================================
   Toutes les variables partagées entre les fonctions.
   Séparées par type : configuration du mode, session en cours,
   progression persistée.
   ============================================================ */

/* ── Configuration du mode actif ── */
let currentMode = '';       // 'learn_french' | 'learn_oromo'
let voiceLang   = 'fr-FR';  // Langue de la synthèse vocale (mise à jour par initApp)
let ALL_THEMES  = [];       // Tableau des thèmes actifs, rempli par initApp() depuis data-fr.js ou data-or.js
let STORAGE_KEY = '';       // Clé localStorage séparée par mode (deux progressions indépendantes)

/* ── Session en cours (réinitialisées à chaque ouverture de thème) ── */
let CT           = null;    // Current Theme : objet thème actuellement ouvert
let fcIdx        = 0;       // Cartes Flash : index de la carte affichée

let dqStep       = 0;       // Quiz Dialogue : numéro de la question
let dqScore      = 0;       // Quiz Dialogue : score (bonnes réponses)
let dqAnswered   = false;   // Quiz Dialogue : évite le double-clic

let sitIdx       = 0;       // Dialogue : index de la situation affichée

let q10Step      = 0;       // Quiz 10 questions : numéro de la question
let q10Score     = 0;       // Quiz 10 questions : score
let q10Answered  = false;   // Quiz 10 questions : évite le double-clic
let _q10Questions = null;   // Cache des questions générées pour le quiz en cours
                            // (évite de re-mélanger si l'utilisateur revient sur l'onglet)

/* ── Progression persistante ── */
let done = [];              // Tableau d'objets { id, stars } sauvegardé dans localStorage


/* ============================================================
   UTILITAIRE CENTRAL DE SÉLECTION BILINGUE
   ============================================================
   L(fr, et) — "L" pour "Langue"
   Retourne `fr` en mode learn_french, `et` en mode learn_oromo.
   Appliqué systématiquement à chaque texte dépendant du mode,
   cette fonction unique élimine les blocs if/else dupliqués
   dans toutes les fonctions de rendu.

   isFrench() — raccourci booléen pour les rares cas où une
   branche entière dépend du mode (ex : ordre des champs dans
   un titre composé).

   langKey() — retourne 'fr' ou 'et', pratique pour indexer
   les objets { fr, et } dans les quiz et les cartes flash.
   ============================================================ */

/**
 * Sélecteur bilingue : retourne la valeur française ou oromoo
 * selon le mode d'apprentissage actif.
 * @param {string} fr  – Valeur à utiliser en mode learn_french
 * @param {string} et  – Valeur à utiliser en mode learn_oromo
 * @returns {string}
 */
function L(fr, et) {
  return currentMode === 'learn_french' ? fr : et;
}

/**
 * @returns {boolean} true si le mode actif est learn_french
 */
function isFrench() {
  return currentMode === 'learn_french';
}

/**
 * Retourne la clé de la langue "source" (langue affichée en premier)
 * et celle de la langue "cible" (traduction / réponse), selon le mode.
 * @returns {{ src: 'fr'|'et', tgt: 'et'|'fr' }}
 */
function langKeys() {
  return isFrench()
    ? { src: 'fr', tgt: 'et' }
    : { src: 'et', tgt: 'fr' };
}

/**
 * Résout le titre d'un thème dans la langue source (nom principal)
 * et la langue cible (sous-titre), en gérant le cas particulier
 * de l'alphabet.
 * @param {Object} t – Objet thème
 * @returns {{ main: string, sub: string }}
 */
function _themeTitle(t) {
  let isAlpha = (t.id === 'alpha' || t.type === 'alpha');
  let main = isAlpha ? L("L'Alphabet", 'Qubeewwan') : t.name;
  let sub  = isAlpha ? L('Qubeewwan', "L'Alphabet") : t.sub;
  return { main: main, sub: sub };
}

/**
 * Retourne le texte "parlé" d'une carte (le mot dans la langue source).
 * @param {Object} card – Objet mot { fr, et }
 * @returns {string}
 */
function _spokenKey(card) {
  return L(card.fr, card.et);
}


/* ============================================================
   2. POINT D'ENTRÉE — initApp(mode)
   ============================================================
   Appelée par les boutons du launcher HTML (index.html).
   Charge dynamiquement le fichier de données correspondant au
   mode choisi (data-fr.js OU data-or.js), puis configure le
   thème visuel, la voix et l'UI, et affiche l'écran d'accueil.

   CHARGEMENT CONDITIONNEL :
   Au lieu de charger les 4 tableaux (~2700 lignes) en mémoire
   au démarrage, on injecte un <script> uniquement pour le mode
   sélectionné. Chaque fichier contient ~1350 lignes, soit ~50%
   de la mémoire initiale. Le gain est particulièrement sensible
   sur mobile et si le contenu Oromo continue de grossir.
   ============================================================ */

/**
 * Cache des scripts de données déjà injectés dans le DOM.
 * Clé : nom du fichier (ex. 'data-fr.js') — Valeur : true.
 * Évite de réinjecter le même <script> si l'utilisateur revient
 * sur le launcher et rechoisit le même mode.
 */
let _loadedDataFiles = {};

/**
 * Injecte dynamiquement un script de données et appelle le callback
 * une fois le script exécuté. Si le script est déjà chargé, le
 * callback est appelé immédiatement (synchrone).
 *
 * @param {string}   filename - Nom du fichier JS (ex. 'data-fr.js')
 * @param {Function} callback - Appelé sans argument quand le script est prêt
 */
function _loadDataScript(filename, callback) {
  /* Script déjà injecté et exécuté → rappel direct, sans ré-injection */
  if (_loadedDataFiles[filename]) {
    callback();
    return;
  }

  let script    = document.createElement('script');
  script.src    = 'js/' + filename;
  script.async  = false;   /* false = ordre d'exécution garanti dans le DOM */

  script.onload = () => {
    _loadedDataFiles[filename] = true;
    callback();
  };

  script.onerror = () => {
    /* Affiche un message d'erreur non bloquant si le fichier est introuvable */
    _showToast('⚠️ Dogoggora / Erreur : impossible de charger ' + filename);
  };

  document.head.appendChild(script);
}

/**
 * Initialise l'application pour un mode d'apprentissage donné.
 * Le chargement des données est asynchrone (injection dynamique du script),
 * mais l'utilisateur voit immédiatement le thème et le spinner de transition.
 * @param {'learn_french'|'learn_oromo'} mode
 */
function initApp(mode) {
  currentMode = mode;

  /* ── Réinitialiser le cache de voix Oromo à chaque changement de mode ──
     Évite qu'une voix Oromo résolue lors d'une session précédente
     soit réutilisée en mode Français (et inversement). */
  _resetOromoVoiceCache();

  /* ── Appliquer immédiatement le thème visuel et masquer le launcher ── */
  if (mode === 'learn_french') {
    document.documentElement.className = 'theme-french';
    /*
      lang HTML : en mode learn_french, l'apprenant EST oromophone.
      L'interface s'affiche en Oromo → lang="om" pour les lecteurs d'écran et la synthèse vocale système.
    */
    document.documentElement.lang = 'om';
    voiceLang   = 'fr-FR';
    STORAGE_KEY = 'pe_om_fr_done_v1';
    /* Synchroniser la meta theme-color avec la couleur française */
    let tcMeta = document.getElementById('meta-theme-color');
    if (tcMeta) tcMeta.setAttribute('content', '#002395');
  } else {
    document.documentElement.className = 'theme-oromo';
    /*
      lang HTML : en mode learn_oromo, l'apprenant EST francophone.
      L'interface s'affiche en Français → lang="fr".
    */
    document.documentElement.lang = 'fr';
    voiceLang   = 'om-ET';
    STORAGE_KEY = 'pe_fr_om_done_v1';
    /* Synchroniser la meta theme-color avec la couleur oromo */
    let tcMeta = document.getElementById('meta-theme-color');
    if (tcMeta) tcMeta.setAttribute('content', '#009A44');
  }

  /* Masquer le launcher pendant le chargement (feedback immédiat) */
  document.getElementById('app-launcher').classList.remove('active');

  /* Afficher le spinner de chargement pendant le fetch de data-*.js */
  _showLoadingSpinner();

  /* ── Déterminer le fichier de données à charger ── */
  let dataFile = (mode === 'learn_french') ? 'data-fr.js' : 'data-or.js';

  _loadDataScript(dataFile, () => {
    /* Callback : données disponibles en mémoire → finaliser l'initialisation */

    /*
      REFACTORING (Archi) : les deux blocs if/else identiques avec _setUI()
      sont fusionnés en un seul appel, chaque valeur étant sélectionnée via L().
      Avantage : ajouter un libellé = 1 ligne au lieu de 2.
    */
    ALL_THEMES = isFrench() ? ALL_THEMES_FR : ALL_THEMES_OR;

    _setUI({
      homeTitle      : L('Apprendre le Français',  'Afaan Oromoo barachuu'),
      homeStartBtn   : L('▶ Jalqabi',              '▶ Commencer'),
      sectionsBackBtn: L('← Retour',               '← Gara duubaatti'),
      sectionsTitle  : L('📚 Modules',              '📚 Moojuulota'),
      lessonBackBtn  : L('← Modules',              '← Moojuulota'),
      level1Label    : L('Niveau 1 — Vocabulaire',  'Sadarkaa 1 — Jechoota'),
      level2Label    : L('Niveau 2 — Dialogues',    'Sadarkaa 2 — Dubbii')
    });

    /* ── Construire le contenu du Guide/Home (Écran 2 redesigné) ── */
    _buildHomeGuide();

    /* Charger la progression sauvegardée pour ce mode */
    loadDone();

    /* Masquer le spinner de chargement avant d'afficher l'écran home */
    _hideLoadingSpinner();

    /* Afficher l'écran d'accueil */
    showScreen('home');

    /* Afficher le guide utilisateur à la première visite (une fois par mode) */
    _maybeShowOnboarding();
  });
}

/**
 * Injecte les libellés bilingues dans les éléments HTML identifiés par ID.
 * @param {Object} t - Dictionnaire { idElement: valeurTexte }
 */
function _setUI(t) {
  _setText('homeTitle',       t.homeTitle);
  _setText('homeStartBtn',    t.homeStartBtn);
  _setText('sectionsBackBtn', t.sectionsBackBtn);
  _setText('sectionsTitle',   t.sectionsTitle);
  _setText('lessonBackBtn',   t.lessonBackBtn);
  _setText('level1Label',     t.level1Label);
  _setText('level2Label',     t.level2Label);

  /* Le bouton "Démarrer" sur l'écran home ouvre l'écran sections */
  let btn = document.getElementById('homeStartBtn');
  if (btn) btn.onclick = () => { showScreen('sections-level1'); };

  /* Mettre à jour les footers selon la langue du parcours */
  _setFooters();
}

/**
 * Utilitaire : injecte un texte dans un élément HTML par son ID.
 * Ignore silencieusement si l'élément n'existe pas.
 * @param {string} id
 * @param {string} val
 */
function _setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/**
 * Met à jour les footers des écrans #home et #sections selon le mode actif.
 * - Mode learn_french (apprenant francophone → interface FR) : textes en français
 * - Mode learn_oromo  (apprenant oromophone → interface OR) : textes en afaan oromoo
 */
function _setFooters() {
  /* Les footers home et sections sont supprimés (contenu intégré dans la modale Infos via showCredits).
     Cette fonction est conservée pour compatibilité mais ne modifie plus le DOM. */
}


/* ============================================================
   3. SYNTHÈSE VOCALE + PRONONCIATION OROMO (CASCADE DE VOIX)
   ============================================================
   L'Afaan Oromoo n'a pas de voix dédiée sur la plupart des
   navigateurs. On utilise une cascade : on cherche d'abord une
   voix om-ET, puis des voix phonétiquement proches (Somali,
   Amharique, Haoussa, Swahili, puis Espagnol/Italien pour la
   phonétique des voyelles).
   ============================================================ */

/* Cache de la voix Oromo résolue (undefined = pas encore cherché, null = aucune trouvée) */
let _oromoVoice = undefined;

/* Drapeau pour ne notifier l'utilisateur qu'une seule fois de la voix sélectionnée */
let _hasNotifiedVoice = false;

/**
 * Réinitialise le cache de voix Oromo.
 * Appelé par initApp() à chaque changement de mode pour éviter
 * qu'une voix Oromo résolue précédemment soit utilisée en mode Français.
 */
function _resetOromoVoiceCache() {
  _oromoVoice       = undefined;
  _hasNotifiedVoice = false;
}

/**
 * Affiche une notification discrète et non bloquante en haut de l'écran.
 * Remplace l'usage de alert(), qui interrompt brutalement l'apprentissage
 * et bloque le thread JS tant que l'utilisateur n'a pas cliqué "OK".
 * Le toast reste visible (comportement inchangé : un par initialisation
 * de voix) mais disparaît seul, sans action requise.
 * @param {string} msg      - Texte à afficher
 * @param {number} [duration=4000] - Durée d'affichage en ms avant disparition
 */
function _showToast(msg, duration) {
  duration = duration || 4000;

  const toast = document.createElement('div');
  toast.className = 'app-toast';
  toast.textContent = msg;
  document.body.appendChild(toast);

  /* L'ajout de la classe doit être différé d'une frame pour que la
     transition CSS d'entrée (opacité + translation) soit bien jouée. */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { toast.classList.add('visible'); });
  });

  setTimeout(() => {
    toast.classList.remove('visible');
    /* Laisser la transition de sortie se terminer avant de retirer le nœud */
    setTimeout(() => { toast.remove(); }, 300);
  }, duration);
}

/**
 * Résout de manière asynchrone la meilleure voix disponible pour l'Oromo.
 * Utilise un cache interne pour éviter de répéter la recherche.
 * @param {Function} callback - Appelé avec la voix trouvée (ou null)
 */
function _resolveOromoVoice(callback) {
  /* Si la voix est déjà en cache, on rappelle directement */
  if (_oromoVoice !== undefined) {
    callback(_oromoVoice);
    return;
  }

  /**
   * Tente de trouver une voix dans la liste disponible.
   * @returns {boolean} true si des voix étaient disponibles
   */
  function search() {
    let voices = speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return false;

    /* Priorités de voix : de la plus proche à la plus éloignée phonétiquement */
    let priorities = [
      { lang: 'om-ET', name: 'Oromo' },
      { lang: 'so-SO', name: 'Somali' },
      { lang: 'am-ET', name: 'Amharique' },
      { lang: 'ha-NG', name: 'Haoussa' },
      { lang: 'sw-KE', name: 'Swahili' },
      { lang: 'es-ES', name: 'Phonétique (Optimisé Espagnol)' },
      { lang: 'it-IT', name: 'Phonétique (Optimisé Italien)' }
    ];

    let foundVoice = null;
    let foundLabel = 'Voix par défaut';

    for (const target of priorities) {
      const match = voices.find((v) => {
        return v.lang.toLowerCase().includes(target.lang.split('-')[0].toLowerCase());
      });
      if (match) {
        foundVoice = match;
        foundLabel = target.name;
        break;
      }
    }

    /* Repli absolu : première voix disponible si aucune ne correspond */
    _oromoVoice = foundVoice || voices[0];

    /* Notification unique à l'utilisateur sur la voix choisie */
    if (!_hasNotifiedVoice) {
      _hasNotifiedVoice = true;
      _showToast('🎙️ Audio Oromo configuré avec la voix : ' + foundLabel);
    }

    callback(_oromoVoice);
    return true;
  }

  /* Si les voix ne sont pas encore chargées, on attend l'événement 'voiceschanged'.
     Sur iOS/Safari, cet événement ne se déclenche parfois jamais.
     Un timeout de 2 s force la résolution avec les voix disponibles à ce moment
     (ou la voix par défaut si la liste est encore vide). */
  if (!search()) {
    let _voicesTimeout = null;

    function _onVoicesChanged() {
      speechSynthesis.removeEventListener('voiceschanged', _onVoicesChanged);
      clearTimeout(_voicesTimeout);
      if (_oromoVoice === undefined) {
        /* Pas encore résolu : forcer avec ce qu'on a */
        _oromoVoice = speechSynthesis.getVoices()[0] || null;
      }
      callback(_oromoVoice);
    }

    speechSynthesis.addEventListener('voiceschanged', _onVoicesChanged);

    /* Timeout de sécurité : 2 s max pour éviter un callback silencieux sur iOS */
    _voicesTimeout = setTimeout(() => {
      speechSynthesis.removeEventListener('voiceschanged', _onVoicesChanged);
      if (_oromoVoice === undefined) {
        /* Forcer un résultat même si la liste est vide */
        const fallback = speechSynthesis.getVoices();
        _oromoVoice = fallback.length > 0 ? fallback[0] : null;
        if (!_hasNotifiedVoice) {
          _hasNotifiedVoice = true;
          _showToast('🎙️ Audio Oromo configuré avec la voix : Voix par défaut');
        }
      }
      callback(_oromoVoice);
    }, 2000);
  }
}

/**
 * Point d'entrée unique pour la lecture audio d'un texte.
 * Redirige vers la cascade Oromo ou la lecture française standard.
 * Gère les textes multiples séparés par " / " (pause de 800ms entre chaque).
 * Applique la classe CSS `is-speaking` sur le bouton déclencheur pendant
 * toute la durée de la lecture, pour un retour visuel immédiat.
 * @param {string} txt      - Texte à lire (peut contenir " / " comme séparateur)
 * @param {HTMLElement} [triggerBtn] - Bouton ayant déclenché la lecture (optionnel)
 */
function speak(txt, triggerBtn) {
  if (!txt) return;

  /* ── Feedback visuel : marquer le bouton comme "en lecture" ── */
  function _markSpeaking(btn) {
    if (!btn) return;
    btn.classList.add('is-speaking');
    btn.setAttribute('aria-label', (btn.getAttribute('aria-label') || '') + ' (lecture…)');
  }
  function _unmarkSpeaking(btn) {
    if (!btn) return;
    btn.classList.remove('is-speaking');
    const lbl = btn.getAttribute('aria-label') || '';
    btn.setAttribute('aria-label', lbl.replace(' (lecture…)', ''));
  }

  if (currentMode === 'learn_oromo') {
    if (!window.speechSynthesis) return;

    _resolveOromoVoice(function(voice) {
      speechSynthesis.cancel();
      let parts = txt.split('/').map((p) => p.trim()).filter(Boolean);
      _markSpeaking(triggerBtn);

      function speakPart(i) {
        if (i >= parts.length) { _unmarkSpeaking(triggerBtn); return; }
        let u = new SpeechSynthesisUtterance(parts[i]);
        if (voice) {
          u.voice = voice;
          u.lang  = voice.lang;
        }
        u.rate  = 0.85;  // Légèrement ralenti pour faciliter la compréhension
        u.onend = () => {
          if (i + 1 < parts.length) setTimeout(() => { speakPart(i + 1); }, 800);
          else _unmarkSpeaking(triggerBtn);
        };
        speechSynthesis.speak(u);
      }

      speakPart(0);
    });

  } else {
    /* Mode learn_french : lecture standard en français */
    _doSpeak(txt, null, 0.80, triggerBtn);
  }
}

/**
 * Lit un texte avec la Web Speech API, en gérant les parties séparées par " / ".
 * Fonction interne utilisée pour le français (voix et langue déjà connues).
 * @param {string} txt      - Texte à lire
 * @param {SpeechSynthesisVoice|null} voiceObj - Voix à utiliser (null = voix par défaut)
 * @param {number} rate     - Vitesse de lecture (0.1 à 10)
 * @param {HTMLElement} [triggerBtn] - Bouton déclencheur (reçoit is-speaking pendant la lecture)
 */
function _doSpeak(txt, voiceObj, rate, triggerBtn) {
  speechSynthesis.cancel();
  let parts = txt.split('/').map((p) => p.trim()).filter(Boolean);
  if (triggerBtn) triggerBtn.classList.add('is-speaking');

  function speakPart(i) {
    if (i >= parts.length) {
      if (triggerBtn) triggerBtn.classList.remove('is-speaking');
      return;
    }
    let u  = new SpeechSynthesisUtterance(parts[i]);
    u.lang = voiceLang;
    u.rate = rate;
    if (voiceObj) u.voice = voiceObj;
    u.onend = () => {
      if (i + 1 < parts.length) setTimeout(() => { speakPart(i + 1); }, 800);
      else if (triggerBtn) triggerBtn.classList.remove('is-speaking');
    };
    speechSynthesis.speak(u);
  }

  speakPart(0);
}


/* ============================================================
   3b. RETOUR HAPTIQUE — _vibrateFeedback()
   ============================================================
   Déclenche une vibration courte (succès) ou longue (erreur)
   sur les appareils mobiles qui supportent l'API Vibration.
   Sans effet silencieux sur les plateformes non compatibles.
   ============================================================ */

/**
 * Vibration de retour haptique lors de la validation d'une réponse.
 * @param {'correct'|'wrong'} type
 */
function _vibrateFeedback(type) {
  if (!navigator.vibrate) return;
  if (type === 'correct') {
    navigator.vibrate(40);            // courte impulsion : succès
  } else {
    navigator.vibrate([60, 40, 60]); // double impulsion : erreur
  }
}


/* ============================================================
   3b2. CONFETTI — Animation de félicitations ⭐⭐⭐
   ============================================================
   Déclenchée uniquement quand un module atteint 100% (3 étoiles)
   pour la première fois ou lorsqu'il passe de 1/2 à 3 étoiles.

   Technique : 22 div .conf-p sont créés dynamiquement, reçoivent
   des propriétés CSS personnalisées aléatoires (position X, couleur,
   taille, délai), puis l'overlay est supprimé du DOM après 2,4 s
   (durée maximale de l'animation + marge) pour ne laisser aucun
   résidu visuel.

   Les couleurs s'adaptent automatiquement au thème actif :
     • theme-french → palette tricolore FR (bleu, blanc, rouge)
     • theme-oromo  → palette tricolore ET (vert, or, rouge)
   ============================================================ */

/**
 * Lance l'animation confetti sur l'écran entier.
 * Crée un overlay fixe, y injecte les particules, puis nettoie.
 * @param {boolean} [isThreeStars=true] - Intensité (réservé pour évolution)
 */
function _launchConfetti(isThreeStars) {
  /* Vérifier que l'API CSS custom properties est disponible
     (guard pour très vieux navigateurs) */
  if (typeof document.documentElement.style.setProperty !== 'function') return;

  /* Palette selon le thème actif */
  let isFr   = document.documentElement.classList.contains('theme-french');
  let colors = isFr
    ? ['#002395', '#ffffff', '#ED2939', '#FFD700', '#4A6FE3', '#FF6B7A']  /* FR */
    : ['#009A44', '#FED141', '#EF2B2D', '#ffffff', '#52C87A', '#FFE566']; /* OR */

  /* Créer l'overlay */
  let overlay = document.createElement('div');
  overlay.className = 'confetti-overlay';
  document.body.appendChild(overlay);

  let COUNT = 22;
  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'conf-p';

    /* Position X : répartie en "zones" pour éviter les regroupements */
    let zone  = (i / COUNT) * 100;
    let jitter = (Math.random() - 0.5) * 14;
    let cx   = Math.max(2, Math.min(98, zone + jitter));

    /* Couleur cyclique dans la palette */
    let color = colors[i % colors.length];

    /* Scale aléatoire entre 0.7 et 1.5 */
    let scale = (0.7 + Math.random() * 0.8).toFixed(2);

    /* Délai échelonné : les 22 particules partent sur ~0.6 s */
    let delay = (i * 0.028).toFixed(3) + 's';

    p.style.setProperty('--cx',  cx + '%');
    p.style.setProperty('--cr',  color);
    p.style.setProperty('--cs',  scale);
    p.style.setProperty('--cd',  delay);

    overlay.appendChild(p);
  }

  /* Nettoyer l'overlay après la fin de la dernière animation
     (délai max ~0.6s + durée animation ~1.4s + marge) */
  setTimeout(() => {
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }, 2400);
}


/* ============================================================
   3c. INTERRUPTION AUDIO — visibilitychange / focus
   ============================================================
   Problème : speak() et _doSpeak() enchaînent les parties d'un
   texte via u.onend → setTimeout → speakPart(i+1).
   Si l'app passe en arrière-plan (appel entrant, changement
   d'onglet, verrouillage écran) entre deux parties, le
   setTimeout continue de tourner et relance
   speechSynthesis.speak() sur une page cachée — comportement
   indéfini selon le navigateur : boucle silencieuse, audio
   résiduel, ou crash TTS.

   Solution : un unique écouteur visibilitychange sur document.
   Dès que document.hidden passe à true, on appelle
   speechSynthesis.cancel(). Cela :
     • Coupe immédiatement la partie en cours.
     • Invalide les setTimeout pendants : quand ils se déclenchent,
       speakPart() appelle speechSynthesis.speak() mais le moteur
       est déjà annulé — la lecture ne reprend pas.
     • N'impacte pas la reprise : quand l'utilisateur revient sur
       l'app, il devra re-cliquer pour relancer manuellement
       (comportement cohérent avec le design actuel).

   On vérifie la présence de window.speechSynthesis avant de
   brancher l'écouteur pour ne pas planter sur les vieux
   navigateurs ou en SSR.
   ============================================================ */

if (window.speechSynthesis) {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      speechSynthesis.cancel();
    }
  });
}

/* ============================================================
   3d. KEEPALIVE WATCHDOG — Chrome / Android
   ============================================================
   Bug Chrome/Android : speechSynthesis.speaking passe à false
   après ~15 s d'inactivité du moteur TTS (bug Chromium #503948).
   La synthèse se fige silencieusement en plein milieu d'une
   lecture, sans déclencher onend ni onerror.

   Solution : un intervalle de 10 s qui appelle pause()/resume()
   si et seulement si le moteur est censé être en train de parler
   (speaking === true). Ce micro-jolt réveille le thread TTS
   sans interrompre l'audio perçu par l'utilisateur.

   L'intervalle est suspendu automatiquement quand l'app passe
   en arrière-plan (document.hidden) pour économiser la batterie,
   et reprend à la remise au premier plan.
   ============================================================ */
let _ttsKeepAliveTimer = null;

function _startTtsKeepAlive() {
  if (_ttsKeepAliveTimer) return;           // déjà actif
  if (!window.speechSynthesis) return;
  _ttsKeepAliveTimer = setInterval(() => {
    if (document.hidden) return;            // app en arrière-plan : on ne fait rien
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      speechSynthesis.resume();
    }
  }, 10000);
}

function _stopTtsKeepAlive() {
  if (_ttsKeepAliveTimer) {
    clearInterval(_ttsKeepAliveTimer);
    _ttsKeepAliveTimer = null;
  }
}

/* Démarrer le watchdog dès le chargement de la page */
_startTtsKeepAlive();


/* ============================================================
   4. PERSISTANCE DE LA PROGRESSION (SYSTÈME D'ÉTOILES ⭐)
   ============================================================
   Chaque thème complété est sauvegardé sous la forme :
     { id: 'theme_id', stars: 1|2|3 }
   Les étoiles ne peuvent qu'augmenter (on conserve le meilleur score).
   Seuils : 50%→⭐   75%→⭐⭐   100%→⭐⭐⭐
   ============================================================ */

/**
 * Charge la progression depuis localStorage pour le mode actif.
 * Réinitialise silencieusement en cas de données corrompues.
 */
function loadDone() {
  try {
    done = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch(e) {
    done = [];
  }
}

/**
 * Sauvegarde la progression dans localStorage.
 * Ignore silencieusement les erreurs (ex : mode privé).
 */
function saveDone() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(done));
  } catch(e) {}
}

/**
 * Ouvre la modale de confirmation personnalisée (générique).
 * Injecte le titre, le message et le callback de validation,
 * puis affiche la modale. Remplace window.confirm() partout.
 *
 * @param {Object} opts
 * @param {string}   opts.title       - Titre du <h3> (ex. "⚠️ Réinitialiser ?")
 * @param {string}   opts.msg         - Corps du <p>
 * @param {string}   opts.labelOk     - Libellé du bouton de validation
 * @param {string}   opts.labelCancel - Libellé du bouton d'annulation
 * @param {Function} opts.onConfirm   - Callback exécuté si l'utilisateur valide
 */
function _openConfirmModal(opts) {
  const modal     = document.getElementById('custom-confirm-modal');
  const btnOk     = document.getElementById('modal-confirm-validate');
  const btnCancel = document.getElementById('modal-confirm-cancel');
  if (!modal || !btnOk || !btnCancel) return;

  /* Injecter le contenu dynamique */
  document.getElementById('modal-confirm-title').textContent = opts.title;
  document.getElementById('modal-confirm-msg').textContent   = opts.msg;
  btnCancel.textContent = opts.labelCancel;

  /* Câbler le callback : cloner le bouton pour effacer tout listener précédent */
  const freshBtn = btnOk.cloneNode(true);
  freshBtn.textContent = opts.labelOk;
  btnOk.parentNode.replaceChild(freshBtn, btnOk);
  freshBtn.addEventListener('click', () => {
    closeConfirmModal();
    opts.onConfirm();
  });

  modal.classList.remove('modal-hidden');
}

/**
 * Ouvre la modale pour réinitialiser TOUTE la progression du mode actif.
 * Déclenchée par le bouton "Réinitialiser" dans le guide / l'aide.
 */
function confirmResetProgress() {
  _openConfirmModal({
    title       : L('⚠️ Hunda haqi ?',       '⚠️ Tout effacer ?'),
    msg         : L(
      "Tartiiba, qabxii fi filannoowwan kee hundi ni dhaban. Kun deebi'uu hin danda'u.",
      "Cette action est irréversible. Tu vas perdre toute ta progression, tes scores et tes paramètres."
    ),
    labelOk     : L('Eeyyee, haqadhu',        'Oui, effacer'),
    labelCancel : L('Dhiisi',                  'Annuler'),
    onConfirm   : executeResetProgress,
  });
}

/**
 * Ferme la modale (bouton Annuler ou après validation).
 */
function closeConfirmModal() {
  const modal = document.getElementById('custom-confirm-modal');
  if (modal) modal.classList.add('modal-hidden');
}

/**
 * Antispam e-mail — double verrouillage :
 *   1. Dans le HTML, l'adresse est écrite à l'envers dans un <span class="antispam-email">.
 *      Le CSS (direction:rtl) la remet à l'endroit visuellement sans toucher au code source.
 *   2. Au clic, l'adresse est reconstituée en mémoire vive (jamais dans le DOM à l'endroit)
 *      pour ouvrir le client mail ET copier l'adresse dans le presse-papier.
 */
function openAndCopyEmail() {
  const user   = 'sebastien.godet16';
  const domain = 'gmail.com';
  const full   = user + '@' + domain;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(full).then(() => {
      const btn = document.getElementById('btn-copy-email');
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerText = L('Waraabameera! ✅', 'Copié ! ✅');
        setTimeout(() => { btn.innerHTML = orig; }, 2000);
      }
    }).catch(() => {});
  }

  window.location.href = 'mailto:' + full;
}

/**
 * Étape 3 : Exécute le nettoyage complet si l'utilisateur valide l'action.
 * Supprime la progression, l'onboarding et rafraîchit proprement la page.
 */
function executeResetProgress() {
  // 1. Fermer immédiatement la modale visuelle
  closeConfirmModal();

  // 2. Détermination du mode actuel pour cibler l'onboarding à réinitialiser
  let isOromoInterface = (STORAGE_KEY === 'pe_om_fr_done_v1');

  // 3. On supprime proprement la progression du mode actif
  localStorage.removeItem(STORAGE_KEY); 
  
  // 4. On supprime l'onboarding du mode actif pour réafficher le guide au redémarrage
  if (isOromoInterface) {
    localStorage.removeItem(_OB_KEY_FR); // Mode "Apprendre le Français"
  } else {
    localStorage.removeItem(_OB_KEY_OR); // Mode "Apprendre l'Oromo"
  }

  // 5. Déclenchement d'un retour haptique de confirmation (vibration tactile)
  _vibrateFeedback('correct');

  // 6. Notification de succès via le système de Toast bilingue de l'application
  _showToast(isOromoInterface 
    ? '🔄 Appilikeeshiniin deebifameera!'
    : '🔄 Application réinitialisée avec succès !' 
  );

  // 7. Rechargement propre de la page après un léger délai pour appliquer les changements
  setTimeout(() => {
    window.location.reload();
  }, 1200);
}

/**
 * Calcule le nombre d'étoiles en fonction d'un pourcentage de réussite.
 * @param {number} pct - Pourcentage (0–100)
 * @returns {0|1|2|3}
 */
function _calcStars(pct) {
  if (pct === 100) return 3;
  if (pct >= 75)   return 2;
  if (pct >= 50)   return 1;
  return 0;
}

/**
 * Enregistre (ou améliore) la progression d'un thème.
 */
function markDone(id, pct) {
  const newStars = _calcStars(pct);
  if (newStars === 0) return;

  let existing = done.find((d) => d.id === id);
  if (existing) {
    if (newStars <= existing.stars) return; 
    existing.stars = newStars;
  } else {
    done.push({ id: id, stars: newStars });
  }
  saveDone();
}

/**
 * Efface la progression d'un thème et rafraîchit l'affichage.
 * @param {string} id - Identifiant du thème à réinitialiser
 */
function resetTheme(id) {
  _openConfirmModal({
    title       : L('⚠️ Kutaa kana haqi ?',    '⚠️ Réinitialiser ce module ?'),
    msg         : L(
      "Urjiilee ⭐ argatte ni dhaban. Kun deebi'uu hin danda'u.",
      'Tes ⭐ étoiles pour ce module seront perdues. Cette action est irréversible.'
    ),
    labelOk     : L('Eeyyee, haqadhu',          'Oui, réinitialiser'),
    labelCancel : L('Dhiisi',                    'Annuler'),
    onConfirm   : () => {
      done = done.filter((d) => d.id !== id);
      saveDone();
      renderSections(_currentThemeLevel || 1);
      renderHome();
    },
  });
}

/**
 * @param {string} id
 * @returns {boolean} true si le thème a été complété (≥ 1 étoile)
 */
function isDone(id) {
  return done.some((d) => d.id === id);
}

/**
 * @param {string} id
 * @returns {0|1|2|3} Nombre d'étoiles obtenues pour ce thème
 */
function getThemeStars(id) {
  let found = done.find((d) => d.id === id);
  return found ? found.stars : 0;
}



/* ============================================================
   4b. RESTAURATION DE SESSION QUIZ (sessionStorage)
   ============================================================
   Problème : si l'utilisateur quitte l'application en cours
   de quiz (appel entrant, changement d'appli, rafraîchissement
   accidentel), toute sa progression dans le quiz est perdue.

   Solution : on persiste l'état complet du quiz dans
   sessionStorage après chaque réponse validée.
   sessionStorage est vidé après fermeture complète du navigateur
   (contrairement à localStorage), ce qui garantit qu'une session
   reprise le lendemain ne propose pas de "continuer" un vieux quiz.

   Clé : QUIZ_SESSION_KEY ('quiz_session') — valeur JSON :
     {
       mode     : 'learn_french' | 'learn_oromo',
       themeId  : string,
       quizType : 'q10' | 'dq',
       step     : number,
       score    : number,
       questions: Array   // questions générées (pour le quiz standard)
     }
   ============================================================ */

/** Clé sessionStorage unique pour la session quiz en cours. */
const QUIZ_SESSION_KEY = 'quiz_session';

/**
 * Sauvegarde l'état courant du quiz dans sessionStorage.
 * @param {'q10'|'dq'} quizType
 */
function _saveQuizSession(quizType) {
  try {
    let state = {
      mode     : currentMode,
      themeId  : CT ? CT.id : null,
      quizType : quizType,
      step     : quizType === 'q10' ? q10Step  : dqStep,
      score    : quizType === 'q10' ? q10Score : dqScore,
      questions: quizType === 'q10' ? (_q10Questions || []) : null
    };
    sessionStorage.setItem(QUIZ_SESSION_KEY, JSON.stringify(state));
  } catch(e) { /* session privée ou quota dépassé : on ignore */ }
}

/**
 * Tente de restaurer une session quiz interrompue depuis sessionStorage.
 * Retourne true si une session a été restaurée et affichée, false sinon.
 * @returns {boolean}
 */
function _restoreQuizSession() {
  try {
    let raw = sessionStorage.getItem(QUIZ_SESSION_KEY);
    if (!raw) return false;

    let state = JSON.parse(raw);

    /* Vérifications de cohérence : même mode, même thème, session non terminée */
    if (!state
        || state.mode    !== currentMode
        || state.themeId !== (CT ? CT.id : null)
        || state.step    === 0) {
      return false;
    }

    if (state.quizType === 'q10') {
      if (state.step >= (state.questions || []).length) return false;
      /* Restauration du quiz standard */
      q10Step       = state.step;
      q10Score      = state.score;
      q10Answered   = false;
      _q10Questions = state.questions;
      _showToast(L('Gaaffiin itti fufameera (hatattamaan dhiissite)', 'Quiz restauré depuis votre dernière session'), 3500);
      renderQuiz10();
      return true;
    }

    if (state.quizType === 'dq') {
      if (!CT.quiz || state.step >= CT.quiz.length) return false;
      /* Restauration du quiz dialogue */
      dqStep     = state.step;
      dqScore    = state.score;
      dqAnswered = false;
      _showToast(L('Gaaffiin itti fufameera (hatattamaan dhiissite)', 'Quiz restauré depuis votre dernière session'), 3500);
      renderDialogQuiz();
      return true;
    }
  } catch(e) { /* données corrompues : on ignore et on repart de zéro */ }
  return false;
}

/**
 * Efface la session quiz sauvegardée (appelée à la fin du quiz ou
 * quand l'utilisateur démarre un nouveau thème).
 */
function _clearQuizSession() {
  try { sessionStorage.removeItem(QUIZ_SESSION_KEY); } catch(e) {}
}

/* ============================================================
   5. NAVIGATION ENTRE ÉCRANS
   ============================================================
   L'application utilise des "screens" CSS : une seule a la
   classe 'active' à la fois. Les écrans sont : launcher, home,
   sections, lesson.
   ============================================================ */

/**
 * Active un écran et masque tous les autres,
 * avec une animation de slide directionnelle.
 *
 * ORDRE DES ÉCRANS (profondeur de navigation) :
 *   0: app-launcher → 1: home → 2: sections → 3: lesson
 * Aller vers un écran plus profond → slide de droite à gauche (forward)
 * Revenir vers un écran moins profond → slide de gauche à droite (back)
 *
 * @param {'home'|'sections'|'lesson'} id - ID de l'élément HTML de l'écran
 * @param {'forward'|'back'|'none'} [dir] - Direction forcée (optionnel)
 */

/* Ordre des écrans pour déterminer la direction */
const _SCREEN_ORDER = ['app-launcher', 'home', 'sections-level1', 'sections-level2', 'lesson'];

function showScreen(id, dir) {
  /* Trouver l'écran actuellement actif */
  let currentScreen = null;
  document.querySelectorAll('.screen').forEach((s) => {
    if (s.classList.contains('active') ||
        s.classList.contains('slide-in-right') ||
        s.classList.contains('slide-in-left')) {
      currentScreen = s;
    }
  });

  let nextScreen = document.getElementById(id);
  if (!nextScreen) return;

  /* Remonter en haut dès maintenant */
  window.scrollTo(0, 0);

  /* ── Déclencher le rendu des écrans dynamiques avant l'animation ── */
  if (id === 'home')              renderHome();
  if (id === 'sections-level1')   renderSections(1);
  if (id === 'sections-level2')   renderSections(2);

  /* ── Synchroniser les onglets Niveau 1 / 2 ── */
  _updateLevelTabs(id);

  /* ── Mettre à jour la nav bar ── */
  _updateBottomNav(id);

  /* ── Pas d'animation si même écran ou pas d'écran source ── */
  if (!currentScreen || currentScreen === nextScreen) {
    document.querySelectorAll('.screen').forEach((s) => {
      s.classList.remove('active','slide-in-right','slide-out-left',
                          'slide-in-left','slide-out-right');
    });
    nextScreen.classList.add('active');
    return;
  }

  /* ── Déterminer la direction selon l'ordre des écrans ── */
  if (!dir) {
    let currentId = currentScreen.id;
    let iCurrent  = _SCREEN_ORDER.indexOf(currentId);
    let iNext     = _SCREEN_ORDER.indexOf(id);
    dir = (iNext > iCurrent) ? 'forward' : 'back';
  }

  /* ── Nettoyer toute animation résiduelle ── */
  let ANIM_CLASSES = ['active','slide-in-right','slide-out-left',
                       'slide-in-left','slide-out-right'];
  document.querySelectorAll('.screen').forEach((s) => {
    s.classList.remove.apply(s.classList, ANIM_CLASSES);
  });

  /* ── Appliquer les classes d'animation ── */
  let inClass, outClass;
  if (dir === 'forward') {
    inClass  = 'slide-in-right';
    outClass = 'slide-out-left';
  } else {
    inClass  = 'slide-in-left';
    outClass = 'slide-out-right';
  }

  currentScreen.classList.add(outClass);
  nextScreen.classList.add(inClass);

  /* ── Finaliser après la durée de l'animation (280ms) ── */
  let DURATION = 280;
  setTimeout(() => {
    document.querySelectorAll('.screen').forEach((s) => {
      s.classList.remove.apply(s.classList, ANIM_CLASSES);
    });
    nextScreen.classList.add('active');
  }, DURATION);
}


/* ============================================================
   5b. NAVIGATION BASSE — helpers
   ============================================================ */

/** Niveau du thème ouvert (1 ou 2) — mémorisé pour retour et flèches */
let _currentThemeLevel = 1;

/**
 * Synchronise l'état actif des onglets Niveau 1 / 2
 * sur les deux paires de boutons (level-tab) selon l'écran affiché.
 * @param {string} screenId
 */
function _updateLevelTabs(screenId) {
  let isL1 = (screenId === 'sections-level1');
  let isL2 = (screenId === 'sections-level2');
  if (!isL1 && !isL2) return;

  /* Onglets dans sections-level1 */
  let t1a = document.getElementById('lvlTab1');
  let t2a = document.getElementById('lvlTab2');
  if (t1a) t1a.classList.toggle('active', isL1);
  if (t2a) t2a.classList.toggle('active', isL2);

  /* Onglets dans sections-level2 */
  let t1b = document.getElementById('lvlTab1b');
  let t2b = document.getElementById('lvlTab2b');
  if (t1b) t1b.classList.toggle('active', isL1);
  if (t2b) t2b.classList.toggle('active', isL2);
}

/**
 * Met à jour l'état actif de la nav bar selon l'écran courant.
 * @param {string} screenId
 */
function _updateBottomNav(screenId) {
  let nav = document.getElementById('bottom-nav');
  if (!nav) return;

  nav.classList.add('visible');

  /* Sur le launcher : état neutre, libellés FR par défaut, boutons Guide/Modules grisés */
  if (screenId === 'app-launcher') {
    /* Réinitialiser l'icône langue au globe neutre */
    let langFlag = document.getElementById('navLangFlag');
    if (langFlag) langFlag.textContent = '🌐';
    /* Aucun bouton actif */
    ['navBtnLang','navBtnGuide','navBtnModules','navBtnCredits'].forEach((id) => {
      let el = document.getElementById(id);
      if (el) el.classList.remove('active');
    });
    /* Griser les boutons non utilisables avant le choix de langue */
    let btnGuide   = document.getElementById('navBtnGuide');
    let btnModules = document.getElementById('navBtnModules');
    if (btnGuide)   btnGuide.style.opacity   = '.35';
    if (btnModules) btnModules.style.opacity  = '.35';
    return;
  }

  /* Rétablir l'opacité normale sur tous les boutons (une fois un mode choisi) */
  ['navBtnGuide','navBtnModules'].forEach((id) => {
    let el = document.getElementById(id);
    if (el) el.style.opacity = '';
  });

  /* Mettre à jour les libellés bilingues de la nav (dans la langue de l'apprenant) */
  _setText('navLabelLang',    L('Afaan',     'Langue'));
  _setText('navLabelGuide',   L('Gargaarsa', 'Guide'));
  _setText('navLabelModules', L('Kutaalee',  'Modules'));
  _setText('navLabelCredits', L('Odeeffannoo', 'Infos'));

  let langFlag = document.getElementById('navLangFlag');
  if (langFlag) langFlag.textContent = L('🇫🇷', '🇪🇹');

  /* Activer le bon bouton */
  ['navBtnLang','navBtnGuide','navBtnModules','navBtnCredits'].forEach((id) => {
    let el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });
  /* Sur le launcher, aucun bouton n'est actif (état neutre) */
  if (screenId === 'sections-level1' || screenId === 'sections-level2') {
    let mb = document.getElementById('navBtnModules');
    if (mb) mb.classList.add('active');
  }
  if (screenId === 'home') {
    let gb = document.getElementById('navBtnGuide');
    if (gb) gb.classList.add('active');
  }
}

/**
 * Bouton Modules dans la nav bar :
 * va sur l'écran du niveau mémorisé (ou niveau 1 par défaut).
 */
function navGoModules() {
  let target = (_currentThemeLevel === 2) ? 'sections-level2' : 'sections-level1';
  /* Direction : depuis lesson = back, sinon forward */
  let current = null;
  document.querySelectorAll('.screen').forEach((s) => {
    if (s.classList.contains('active')) current = s.id;
  });
  let dir = (current === 'lesson') ? 'back' : undefined;
  renderSections(_currentThemeLevel);
  showScreen(target, dir);
}

/**
 * Bouton retour de l'écran leçon → retourne au bon écran de niveau.
 */
function lessonGoBack() {
  let target = (_currentThemeLevel === 2) ? 'sections-level2' : 'sections-level1';
  renderSections(_currentThemeLevel);
  showScreen(target, 'back');
}

/**
 * Navigation prev/next entre modules du même niveau.
 * @param {number} delta - +1 (suivant) ou -1 (précédent)
 */
function lessonNav(delta) {
  if (!CT || !ALL_THEMES.length) return;
  let levelThemes = ALL_THEMES.filter((t) => t.level === CT.level);
  let idx = levelThemes.findIndex((t) => t.id === CT.id);
  let newIdx = idx + delta;
  if (newIdx < 0 || newIdx >= levelThemes.length) return;
  openTheme(levelThemes[newIdx].id, delta > 0 ? 'forward' : 'back');
}

/**
 * Met à jour l'état disabled des boutons prev/next de lesson.
 */
function _updateLessonNavArrows() {
  if (!CT) return;
  let levelThemes = ALL_THEMES.filter((t) => t.level === CT.level);
  let idx = levelThemes.findIndex((t) => t.id === CT.id);
  let prev = document.getElementById('lessonPrevBtn');
  let next = document.getElementById('lessonNextBtn');
  if (prev) prev.disabled = (idx <= 0);
  if (next) next.disabled = (idx >= levelThemes.length - 1);
}




/* ============================================================
   6. ÉCRAN HOME — BARRE DE PROGRESSION GLOBALE
   ============================================================
   Affiche le pourcentage de thèmes validés et le total d'étoiles.
   ============================================================ */

/**
 * Met à jour la barre de progression et le compteur d'étoiles sur l'écran home.
 */
/**
 * Calcule la progression globale en un seul endroit.
 * Utilisé par renderHome() ET renderSections() pour éviter la duplication.
 * @returns {{ total: number, n: number, pct: number,
 *             starsEarned: number, starsMax: number }}
 */
function _getProgress() {
  let total = ALL_THEMES.length;
  let n     = done.length;
  return {
    total      : total,
    n          : n,
    pct        : total > 0 ? Math.round(n / total * 100) : 0,
    starsEarned: done.reduce(function(acc, d) { return acc + d.stars; }, 0),
    starsMax   : total * 3
  };
}

function renderHome() {
  /* L'écran home est désormais le Guide/Onboarding — rien à re-rendre ici
     (le contenu est injecté une fois par _buildHomeGuide() dans initApp).
     On garde la fonction pour compatibilité avec les appels existants. */
  if (!ALL_THEMES.length) return;

  let p   = _getProgress();

  /* ── Bouton Commencer / Continuer ── */
  let btn = document.getElementById('homeStartBtn');
  if (btn) {
    btn.textContent = p.n > 0
      ? L('▶ Continuer', '▶ Itti fufi')
      : L('▶ Jalqabi', '▶ Commencer');
  }

  /* ── Cercle SVG de progression ── */
  let wrap = document.getElementById('homeProgressCircleWrap');
  if (wrap) {
    if (p.n === 0) {
      /* Première visite : on cache le cercle */
      wrap.style.display = 'none';
    } else {
      wrap.style.display = 'flex';

      /* Circumférence pour r=50 : 2π×50 = 314.159… */
      let CIRC    = 314.16;
      let offset  = CIRC - (CIRC * p.pct / 100);

      let arc     = document.getElementById('hpcArc');
      let pctTxt  = document.getElementById('hpcPct');
      let subTxt  = document.getElementById('hpcSub');
      let titleEl = document.getElementById('hpcTitle');
      let descEl  = document.getElementById('hpcDesc');

      /* Léger délai pour déclencher la transition CSS après display:flex */
      setTimeout(() => {
        if (arc) arc.style.strokeDashoffset = offset;
      }, 50);

      if (pctTxt)  pctTxt.textContent  = p.pct + '%';
      if (subTxt)  subTxt.textContent  = '⭐ ' + p.starsEarned + ' / ' + p.starsMax;

      /* Textes accessibles (aria) */
      let a11yLabel = L(
        'Ida\'ata Guutuu: modules ' + p.n + ' / ' + p.total + ' — ' + p.pct + '% — urjii ' + p.starsEarned + ' / ' + p.starsMax,
        'Progression globale : ' + p.n + ' / ' + p.total + ' modules — ' + p.pct + '% — ' + p.starsEarned + ' étoiles / ' + p.starsMax
      );
      if (titleEl) titleEl.textContent = a11yLabel;
      if (descEl)  descEl.textContent  = a11yLabel;
    }
  }
}


/* ============================================================
   7. ÉCRAN SECTIONS — GRILLE DES THÈMES
   ============================================================
   Affiche deux grilles (Niveau 1 et Niveau 2) avec les cartes
   de thèmes et la progression globale.
   ============================================================ */

/**
 * Rend la grille de modules.
 * @param {1|2} [activeLevel=1] - Niveau affiché (sections-level1 ou sections-level2)
 */
function renderSections(activeLevel) {
  if (!ALL_THEMES.length) return;
  if (!activeLevel) activeLevel = 1;

  let p = _getProgress();

  /* ── Libellés de niveau bilingues (avec traduction en sous-titre) ── */
  let lbl1 = L('Niveau 1 — Vocabulaire',     'Sadarkaa 1 — Jechoota');
  let lbl2 = L('Niveau 2 — Dialogues', 'Sadarkaa 2 — Dubbii');
  /* Traductions pour les onglets */
  let lbl1transl = L('Sadarkaa 1 — Jechoota', 'Niveau 1 — Vocabulaire');
  let lbl2transl = L('Sadarkaa 2 — Dubbii',   'Niveau 2 — Dialogues');
  /* Traduction du titre "Modules" dans le header */
  let titleTransl = L('📚 Moojuulota', '📚 Modules');

  /* ── Helper : remplir les éléments d'un header de sections ── */
  function _fillHeader(suffix) {
    let s = suffix || '';
    let titleEl = document.getElementById('sectionsTitle' + s);
    if (titleEl) titleEl.innerHTML =
      L('📚 Modules', '📚 Moojuulota')
      + '<span class="hdr-transl">' + titleTransl + '</span>';
    let gp = document.getElementById('globalProgress' + s);
    if (gp) gp.style.width = p.pct + '%';

    let pl = document.getElementById('progressLabel' + s);
    if (pl) pl.innerHTML =
      '<span class="progress-label-text">'
      + p.n + ' / ' + p.total + ' ' + L('modules', 'kutaalee') + ' — ' + p.pct + '%'
      + '</span>'
      + '<button class="btn-reset-prog" onclick="confirmResetProgress()"'
      + ' title="' + L('Tartiiba guutuu haqi', 'Réinitialiser toute la progression') + '"'
      + ' aria-label="' + L('Tartiiba guutuu haqi', 'Réinitialiser toute la progression') + '"'
      + '>🔄</button>';

    let se = document.getElementById('sectionsStars' + s);
    if (se) se.innerHTML =
      '<span class="sections-stars-inner">⭐ '
      + p.starsEarned + ' / ' + p.starsMax + '</span>';

    let fe = document.getElementById('sectionsFlagRight' + s);
    if (fe) fe.textContent = L('🇫🇷', '🇪🇹');
  }

  /* ── Remplir les deux headers ── */
  _fillHeader('');
  _fillHeader('2');

  /* ── Remplir les libellés des onglets de niveau (deux paires : '' et 'B') ── */
  ['', 'B'].forEach((sfx) => {
    let el1 = document.getElementById('level1Label' + sfx);
    let el2 = document.getElementById('level2Label' + sfx);
    if (el1) el1.innerHTML = lbl1 + '<span class="level-tab-transl">' + lbl1transl + '</span>';
    if (el2) el2.innerHTML = lbl2 + '<span class="level-tab-transl">' + lbl2transl + '</span>';
  });

  /* ── Grilles de thèmes ── */
  let grid1 = document.getElementById('grid1');
  let grid2 = document.getElementById('grid2');
  if (grid1) grid1.innerHTML = ALL_THEMES
    .filter((t) => t.level === 1)
    .map((t) => _buildThemeCard(t)).join('');
  if (grid2) grid2.innerHTML = ALL_THEMES
    .filter((t) => t.level === 2)
    .map((t) => _buildThemeCard(t)).join('');
}

/**
 * Génère le HTML d'une carte de thème (titre, étoiles, bouton reset).
 * @param {Object} t - Objet thème depuis ALL_THEMES
 * @returns {string} HTML de la carte
 */
function _buildThemeCard(t) {
  let title     = _themeTitle(t);
  let mainTitle = title.main
    ? title.main.charAt(0).toUpperCase() + title.main.slice(1)
    : '';

  let resetBtn = isDone(t.id)
    ? '<button class="btn-reset-theme" '
      + 'onclick="event.stopPropagation();resetTheme(\'' + t.id + '\')">'
      + L('🔄 Irra deebiʼi', '🔄 Recommencer')
      + '</button>'
    : '';

  let currentStars = getThemeStars(t.id);
  let starsStr = Array.from({ length: 3 }, function(_, i) {
    return i < currentStars ? '⭐' : '☆';
  }).join('');

  return '<div class="theme-card' + (isDone(t.id) ? ' done' : '') + '" '
    + 'role="button" tabindex="0" aria-label="' + _escAttr(mainTitle) + '" '
    + 'onclick="openTheme(\'' + t.id + '\')">'
    + '<div class="t-emoji">'   + t.emoji    + '</div>'
    + '<div class="t-name">'    + mainTitle  + '</div>'
    + '<div class="t-sub">'     + title.sub  + '</div>'
    + '<div class="t-stars" style="letter-spacing:2px">' + starsStr + '</div>'
    + resetBtn
    + '</div>';
}


/* ============================================================
   8. OUVERTURE D'UN THÈME (ÉCRAN LESSON + ONGLETS)
   ============================================================
   Charge le thème, construit les onglets dynamiquement selon
   le type de thème (vocabulaire, alphabet, dialogue).
   ============================================================ */

/**
 * Ouvre un thème et affiche l'écran Lesson avec ses onglets.
 * Réinitialise toutes les variables de session.
 * @param {string} id - Identifiant du thème
 */
function openTheme(id, dir) {
  let found = ALL_THEMES.find((t) => t.id === id);
  if (!found) {
    /* Thème introuvable : probablement une typo d'id dans data-fr.js / data-or.js.
       On affiche un message visible plutôt qu'un écran blanc silencieux. */
    console.error('[openTheme] Thème introuvable : "' + id + '"');
    _showToast('⚠️ Thème introuvable : "' + id + '" — vérifiez data-fr.js / data-or.js', 6000);
    return;
  }
  CT = found;
  fcIdx = 0;
  dqStep = 0; dqScore = 0; dqAnswered = false;
  sitIdx = 0;
  q10Step = 0; q10Score = 0; q10Answered = false; _q10Questions = null;
  _clearQuizSession();   /* nouvelle session : on efface toute session interrompue */

  document.getElementById('lessonEmoji').textContent = CT.emoji;

  let title = _themeTitle(CT);
  let lessonTitle = L(
    title.main + ' — ' + title.sub,
    title.main + ' — ' + title.sub
  );
  // Note: _themeTitle retourne déjà (main=langue source, sub=langue cible)
  // on concatène donc toujours main + ' — ' + sub, dans les deux modes.
  lessonTitle = title.main + ' — ' + title.sub;
  if (lessonTitle) {
    lessonTitle = lessonTitle.charAt(0).toUpperCase() + lessonTitle.slice(1);
  }
  document.getElementById('lessonTitle').textContent = lessonTitle;

  /* ── Badge niveau cliquable dans le header leçon ── */
  let badge = document.getElementById('lessonLevelBadge');
  if (badge) {
    badge.textContent = L(
      CT.level === 1 ? 'Niv. 1' : 'Niv. 2',
      CT.level === 1 ? 'Sad. 1' : 'Sad. 2'
    );
    /* Le clic du badge ramène à la liste du bon niveau */
    badge.onclick = () => {
      const target = CT.level === 2 ? 'sections-level2' : 'sections-level1';
      renderSections(CT.level);
      showScreen(target, 'back');
    };
  }

  /* Mémoriser le niveau du thème ouvert pour le retour et les flèches */
  _currentThemeLevel = CT.level;
  /* Si déjà sur l'écran lesson (navigation prev/next) :
     animer le corps (lessonBody) en slide horizontal selon la direction,
     sans recréer l'écran entier (les flèches et le header restent en place).
     Sinon, animer l'écran complet avec showScreen(). */
  const _alreadyInLesson = document.getElementById('lesson').classList.contains('active');
  const _slideDir = dir || 'forward';   /* direction mémorisée pour l'animation du body */
  if (!_alreadyInLesson) {
    showScreen('lesson', _slideDir);
  }

  /* ── Construction des onglets selon le type de thème ── */
  let tabs;
  if (CT.type === 'dialog') {
    tabs = [
      { k: 'dialog', lbl: L('💬 Maree',    '💬 Dialogue')   },
      { k: 'vocab',  lbl: L('📚 Jechoota', '📚 Lexique') },
      { k: 'dquiz',  lbl: L('❓ Gaaffilee', '❓ Quiz')        },
      { k: 'repeat', lbl: L('🎙️ Irraddeessi', '🎙️ Répète')   }
    ];
  } else if (CT.type === 'alpha') {
    tabs = [
      { k: 'flash',  lbl: L('🔤 Qubee',    '🔤 Alphabet')   },
      { k: 'quiz10', lbl: L('🔊 Quiz Sagalee', '🔊 Quiz Audio') }
    ];
  } else {
    tabs = [
      { k: 'flash',  lbl: L('🃏 Kaardota', '🃏 Cartes')      },
      { k: 'quiz10', lbl: L('❓ Gaaffilee', '❓ Quiz')         },
      { k: 'repeat', lbl: L('🎙️ Irraddeessi', '🎙️ Répète')   }
    ];
  }

  document.getElementById('lessonTabs').innerHTML = tabs.map((t, i) => {
    return '<button class="tab' + (i === 0 ? ' active' : '') + '" data-tab="' + t.k + '" onclick="switchTab(\'' + t.k + '\')">' + t.lbl + '</button>';
  }).join('');


  /* ── Bouton d'export PDF : afficher le bon selon le type de thème ──
     Visibilité gérée via .is-hidden (définie dans style.css §25)
     Les boutons sont désormais intégrés dans .lesson-header (pills compacts). */
  let btnVocab = document.getElementById('lessonExportVocab');
  let btnSit   = document.getElementById('lessonExportSit');
  if (btnVocab && btnSit) {
    if (CT.type === 'dialog') {
      btnVocab.classList.add('is-hidden');
      btnSit.classList.remove('is-hidden');
      btnSit.title = L('Galmee haala kana buusi', 'Télécharger cette situation (PDF)');
    } else {
      btnSit.classList.add('is-hidden');
      btnVocab.classList.remove('is-hidden');
      btnVocab.title = L('Moojuula kana buusi', 'Télécharger ce module (PDF)');
    }
  }

  switchTab(tabs[0].k);

  /* ── Mise à jour des flèches prev/next (après switchTab pour avoir le bon CT) ── */
  _updateLessonNavArrows();

  /* ── Animation du corps de la leçon lors d'une navigation prev/next ──
     Seulement si on était déjà dans lesson (évite la double animation
     avec showScreen qui anime l'écran entier à l'arrivée). */
  if (_alreadyInLesson) {
    let body = document.getElementById('lessonBody');
    if (body) {
      let inClass  = _slideDir === 'back' ? 'lesson-body-slide-in-left'  : 'lesson-body-slide-in-right';
      let outClass = _slideDir === 'back' ? 'lesson-body-slide-out-right': 'lesson-body-slide-out-left';
      /* Sortie du contenu actuel */
      body.classList.add(outClass);
      setTimeout(() => {
        body.classList.remove(outClass);
        /* Entrée du nouveau contenu */
        body.classList.add(inClass);
        setTimeout(() => { body.classList.remove(inClass); }, 240);
      }, 160);
    }
  }
}

/**
 * Active un onglet et déclenche le rendu du contenu correspondant.
 * @param {'flash'|'quiz10'|'dialog'|'vocab'|'dquiz'|'repeat'} tab
 */
function switchTab(tab) {
  document.querySelectorAll('#lessonTabs .tab').forEach((b) => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });

  const lessonEl = document.getElementById('lesson');
  if (lessonEl) lessonEl.classList.toggle('mode-cartes', tab === 'flash');

  if (tab !== 'repeat') _stopRepeat();

  if      (tab === 'flash')  { renderFlash(); }
  else if (tab === 'quiz10') { q10Step = 0; q10Score = 0; q10Answered = false; _q10Questions = null; if (!_restoreQuizSession()) renderQuiz10(); }
  else if (tab === 'dialog') { renderDialog(); }
  else if (tab === 'vocab')  { renderVocab(); }
  else if (tab === 'dquiz')  { dqStep = 0; dqScore = 0; dqAnswered = false; if (!_restoreQuizSession()) renderDialogQuiz(); }
  else if (tab === 'repeat') { renderRepeat(); }
}


/* ============================================================
   9. CARTES FLASH — VOCABULAIRE INTERACTIF
   ============================================================
   Affiche les mots recto/verso avec animation de retournement.
   Gère aussi le mode Alphabet (grille de lettres cliquables).
   ============================================================ */

/**
 * Affiche la carte flash courante (ou la grille alphabétique si type 'alpha').
 */
function renderFlash() {
  let words = CT.words;
  let card  = words[fcIdx];
  let keys  = langKeys(); // Contient keys.src ('fr' ou 'et') et keys.tgt ('et' ou 'fr')

  /* ── Mode Alphabet : grille de lettres cliquables ── */
  if (CT.type === 'alpha') {
    document.getElementById('tabContent').innerHTML =
      '<div class="section-label">'
      + L('Qubee dhaggeeffachuuf irratti cuqaasi !', 'Cliquez sur une lettre pour l\'écouter !')
      + '</div>'
      + '<div class="alpha-grid">' + words.map((c, i) => {
          let bigLetter   = c[keys.src];
          let smallName   = c[keys.tgt];
          let listenHint  = L('Dhaggeeffachuuf cuqaasi : ', 'Écouter la lettre ') + bigLetter;
          return '<div class="alpha-card" role="button" tabindex="0" '
            + 'aria-label="' + _escAttr(listenHint) + '" '
            + 'onclick="pickAlpha(' + i + ')">'
            + '<div class="alpha-letter" lang="' + keys.src + '">' + bigLetter + '</div>'
            + '<div class="alpha-name" lang="' + keys.tgt + '">'   + smallName  + '</div>'
            + '</div>';
        }).join('')
      + '</div>'
      + '<div id="alphaDetail" class="alpha-detail">' + buildAlphaDetail(card) + '</div>';
    return;
  }

  /* ── Mode Cartes Flash standard ── */
  let emFront = card.em ? '<div class="fc-front-emoji">' + card.em + '</div>' : '';
  let emBack  = card.em ? '<div class="fc-back-emoji">'  + card.em + '</div>' : '';
  let hasConj = card.conj && card.conj.et && card.conj.fr;
  let frontContent, backContent;

  if (hasConj) {
    frontContent = emFront
      + '<div class="fc-front-word" lang="' + keys.src + '">' + card[keys.src] + '</div>'
      + '<div class="fc-conj" lang="' + keys.src + '">' + card.conj[keys.src].map((l) => {
          return '<div class="fc-conj-line">' + l + '</div>';
        }).join('') + '</div>';
    backContent = emBack
      + '<div class="fc-back-word" lang="' + keys.tgt + '">' + card[keys.tgt] + '</div>'
      + '<div class="fc-conj" lang="' + keys.tgt + '">' + card.conj[keys.tgt].map((l) => {
          return '<div class="fc-conj-line">' + l + '</div>';
        }).join('') + '</div>';
  } else {
    let flipHint = L('Hiika isaa Afaan Oromootin arguuf cuqaasi', 'Cliquez pour voir la traduction en français');
    frontContent = emFront
      + '<div class="fc-front-word" lang="' + keys.src + '">' + card[keys.src] + '</div>'
      + '<div class="fc-front-hint">👆 ' + flipHint + '</div>';
    backContent  = emBack
      + '<div class="fc-back-word" lang="' + keys.tgt + '">' + card[keys.tgt] + '</div>';
  }

  let sectionLabel = L(
    'Fuuldura : Français 🇫🇷 — Duuba : Afaan Oromoo 🇪🇹 · Kaardicha garagalchi !',
    'Recto : Afaan Oromoo 🇪🇹 — Verso : Français 🇫🇷 · Cliquez pour retourner !'
  );
  let flipAria  = L('Garagalchi kaardicha', 'Retourner la carte');
  let prevLabel = L('← Kan duraa',          '← Précédent');
  let nextLabel = L('Kan itti aanu →',       'Suivant →');
  let audioBtn  = L('🔊 Sagalee dhaggeeffadhu', '🔊 Écouter la prononciation');

  document.getElementById('tabContent').innerHTML =
    '<div class="section-label">' + sectionLabel + '</div>'
    + '<div class="fc-wrap"><div class="fc" id="fc" role="button" tabindex="0" '
    + 'aria-label="' + _escAttr(flipAria) + '" onclick="flipCard()">'
    + '<div class="fc-front">' + frontContent + '</div>'
    + '<div class="fc-back">'  + backContent  + '</div>'
    + '</div></div>'
    + '<div class="fc-nav">'
    + '<button onclick="prevCard()">' + prevLabel + '</button>'
    + '<span class="fc-counter">' + (fcIdx + 1) + ' / ' + words.length + '</span>'
    + '<button onclick="nextCard()">' + nextLabel + '</button>'
    + '</div>'
    + '<div class="fc-audio-wrap" style="text-align:center;">'
    + '<button class="audio-btn-big" onclick="speak(\'' + esc(card[keys.src]) + '\')">' + audioBtn + '</button>'
    + '</div>';
}

/**
 * Génère le HTML du panneau de détail pour une lettre de l'alphabet.
 * @param {Object} c - Objet lettre { fr, et }
 * @returns {string} HTML du panneau de détail
 */
function buildAlphaDetail(c) {
  let keys = langKeys();
  return '<div class="alpha-detail-letter" lang="' + keys.src + '">' + c[keys.src] + '</div>'
    + '<div class="alpha-detail-name" lang="' + keys.tgt + '">' + c[keys.tgt] + '</div>'
    + '<button class="alpha-detail-btn" onclick="speak(\'' + esc(c[keys.src]) + '\')">'
    + L('🔊 Dhaggeeffadhu', '🔊 Écouter')
    + '</button>';
}

/**
 * Sélectionne une lettre dans la grille alphabétique et joue son son.
 * @param {number} i - Index de la lettre dans CT.words
 */
function pickAlpha(i) {
  fcIdx = i;
  let card = CT.words[i];
  speak(_spokenKey(card));
  let d = document.getElementById('alphaDetail');
  if (d) d.innerHTML = buildAlphaDetail(card);
}

/**
 * Retourne la carte flash (animation CSS via la classe 'flipped').
 */
function flipCard() {
  let fc = document.getElementById('fc');
  if (!fc) return;
  fc.classList.toggle('flipped');
}

/**
 * Passe à la carte suivante et joue automatiquement le son (délai 300ms).
 */
function nextCard() {
  fcIdx = (fcIdx + 1) % CT.words.length;
  renderFlash();
  setTimeout(() => { speak(_spokenKey(CT.words[fcIdx])); }, 300);
}

/**
 * Revient à la carte précédente.
 */
function prevCard() {
  fcIdx = (fcIdx - 1 + CT.words.length) % CT.words.length;
  renderFlash();
}

/**
 * @returns {boolean} true si le thème actif est de type Alphabet
 */
function isAlphaQuiz() {
  return CT && CT.type === 'alpha';
}


/* ============================================================
   10. QUIZ 10 QUESTIONS — AVEC ÉTOILES PROGRESSIVES
   ============================================================
   Le quiz adapte son nombre de questions à la taille du
   vocabulaire. Les questions sont générées dynamiquement
   (mélange aléatoire) pour les thèmes de vocabulaire standard,
   ou chargées depuis le champ statique 'quiz' / 'quiz10'
   pour les dialogues et l'alphabet.
   ============================================================ */

/**
 * Détermine le nombre optimal de questions selon la taille du vocabulaire.
 * @param {Object} theme - Objet thème
 * @returns {3|5|8|10}
 */
function getQuizTotal(theme) {
  let n = (theme.words || []).length;
  if (n < 10)  return 3;
  if (n < 15)  return 5;
  if (n <= 27) return 8;
  return 10;
}

/**
 * Mélange un tableau par l'algorithme de Fisher-Yates.
 * @param {Array} arr - Tableau à mélanger (non muté)
 * @returns {Array} Copie mélangée
 */
function _shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j   = Math.floor(Math.random() * (i + 1));
    const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

/**
 * Retourne le libellé d'un mot dans la langue demandée.
 * @param {Object} word - Objet mot { fr, et, conj? }
 * @param {'fr'|'et'} lang
 * @returns {string}
 */
function _wordLabel(word, lang) {
  return word[lang] || '';
}

/**
 * Génère un ensemble de N questions QCM aléatoires depuis les mots du thème.
 * @param {Object} theme - Objet thème contenant .words
 * @param {number} total - Nombre de questions à générer
 * @returns {Array} Tableau de questions { q, opts, ans, audio }
 */
function _generateQuiz(theme, total) {
  let words = theme.words || [];
  if (words.length < 2) return [];

  let keys     = langKeys();
  let shuffled = _shuffle(words);
  let selected = shuffled.slice(0, Math.min(total, shuffled.length));
  let qLabel   = L('Afaan Oromootti akkamitti jedhamaa ?', 'Comment dit-on en français ?');

  return selected.map((correctWord) => {
    let qText    = _wordLabel(correctWord, keys.src);
    let aCorrect = _wordLabel(correctWord, keys.tgt);

    let pool        = words.filter((w) => w !== correctWord);
    let distractors = _shuffle(pool).slice(0, 3).map((w) => {
      return _wordLabel(w, keys.tgt);
    });

    let opts   = distractors.slice(0, 3);
    let ansPos = Math.floor(Math.random() * 4);
    opts.splice(ansPos, 0, aCorrect);

    return {
      q    : '"' + qText + '" — ' + qLabel,
      opts : opts,
      ans  : ansPos,
      audio: qText
    };
  });
}

/**
 * Retourne les questions à utiliser pour le quiz selon le type de thème.
 * @param {Object} theme
 * @returns {Array}
 */
function getQuizQuestions(theme) {
  if (theme.type === 'alpha')                      return (theme.quiz10 || []);
  if (theme.level === 2 || theme.type === 'dialog') return (theme.quiz   || []);
  return _generateQuiz(theme, getQuizTotal(theme));
}

/**
 * Affiche la question courante du quiz (ou l'écran de résultats à la fin).
 */
function renderQuiz10() {
  if (!_q10Questions) {
    _q10Questions = getQuizQuestions(CT);
    /* Persister immédiatement les questions générées dans sessionStorage.
       Ainsi, même si _restoreQuizSession() échoue à la prochaine visite
       (storage corrompu ou onglet rechargé avant la 1ʳᵉ réponse),
       la session aura quand même été sauvegardée avec les bonnes questions. */
    _saveQuizSession('q10');
  }
  let qs    = _q10Questions;
  let total = qs.length;

  if (!qs || !total) {
    document.getElementById('tabContent').innerHTML =
      '<div class="result-box"><p>'
      + L('Gaffiinkoo hin jiru.', 'Aucun quiz disponible.')
      + '</p></div>';
    return;
  }

  /* ── Écran de résultats ── */
  if (q10Step >= total) {
    _clearQuizSession();   /* quiz terminé : on nettoie la session */
    let pct         = Math.round(q10Score / total * 100);
    let earnedStars = _calcStars(pct);

    /* ── Confetti : uniquement si on atteint 3 étoiles pour la première fois
       (ou si le module était à 1 ou 2 étoiles et passe maintenant à 3).
       On lit le score AVANT markDone() pour comparer. ── */
    let _prevStars  = getThemeStars(CT.id);
    if (earnedStars > 0) markDone(CT.id, pct);
    if (earnedStars === 3 && _prevStars < 3) {
      setTimeout(_launchConfetti, 300); /* léger délai pour laisser le DOM se mettre à jour */
    }

    let r         = _quizResultStrings(pct, 'q10');
    let isSuccess = earnedStars > 0;

    let endStars = Array.from({ length: 3 }, function(_, i) {
      return i < earnedStars ? '⭐' : '☆';
    }).join('');

    document.getElementById('tabContent').innerHTML = '<div class="result-box">'
      + '<div style="font-size:2rem; margin-bottom:5px;">' + (earnedStars === 3 ? '🌟🌟🌟' : endStars) + '</div>'
      + '<h3>' + r.title + '</h3>'
      + '<div class="score-num">' + q10Score + '/' + total + '</div>'
      + '<div style="font-size:1rem;margin:6px 0;color:' + (isSuccess ? 'var(--c-success)' : 'var(--c-error)') + '">' + r.sub + '</div>'
      + '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:14px">'
      + '<button class="retry-btn" style="background:#888" onclick="q10Step=0;q10Score=0;q10Answered=false;_q10Questions=null;renderQuiz10()">' + r.retry + '</button>'
      + (isSuccess ? '<button class="retry-btn" onclick="renderSections(_currentThemeLevel);lessonGoBack()">' + r.finish + '</button>' : '')
      + '</div></div>';
    renderSections(_currentThemeLevel || 1);
    return;
  }

  let q = qs[q10Step];

  /* ── Quiz Alphabet ── */
  if (isAlphaQuiz()) {
    let qLabel = L('Gaaffii ', 'Question ') + (q10Step + 1) + '/' + total;
    let opts = q.opts.map((o, i) => {
      return '<button class="quiz-opt" id="q10o' + i + '" onclick="checkQ10(' + i + ',' + q.ans + ')" '
        + 'style="font-size:1.4rem;font-weight:900;letter-spacing:2px">' + o + '</button>';
    }).join('');

    document.getElementById('tabContent').innerHTML =
      '<div class="alpha-audio-quiz">'
      + '<div class="alpha-audio-label">'
      + L('Sagalee dhaggeeffadhu kutaa sirrii filadhu', 'Écoutez le son et choisissez la bonne lettre')
      + '<br><small>' + qLabel + '</small></div>'
      + '<button class="alpha-audio-btn" id="playAudioBtn" onclick="playAlphaAudio(\'' + esc(q.audio) + '\')" '
      + 'title="' + L('Dhaggeeffachuuf cuqaasi', 'Cliquez pour écouter') + '">🔊</button>'
      + '<div style="font-size:.75rem;color:#aaa;margin-bottom:14px">'
      + L('Dhaggeeffachuuf cuqaasi', 'Cliquez pour écouter') + '</div>'
      + '<div class="quiz-options" style="grid-template-columns:1fr 1fr;gap:12px">' + opts + '</div>'
      + '<div class="quiz-feedback" id="q10fb"></div>'
      + '</div>';
    setTimeout(() => { playAlphaAudio(q.audio); }, 400);
    q10Answered = false;
    return;
  }

  /* ── Quiz standard ── */
  let qStdLabel = L('Gaaffii ', 'Question ') + (q10Step + 1) + '/' + total;
  let stdOpts = q.opts.map((o, i) => {
    return '<button class="quiz-opt" id="q10o' + i + '" onclick="checkQ10(' + i + ',' + q.ans + ')">' + o + '</button>';
  }).join('');

  document.getElementById('tabContent').innerHTML =
    '<div class="dialog-quiz-wrap">'
    + '<div class="quiz-q"><div class="q-text">' + qStdLabel + '<br><b>' + q.q + '</b></div></div>'
    + '<div class="quiz-options" style="grid-template-columns:1fr">' + stdOpts + '</div>'
    + '<div class="quiz-feedback" id="q10fb"></div>'
    + '</div>';
  q10Answered = false;
}

/**
 * Joue le son d'une lettre dans le quiz alphabet, avec animation de feedback.
 * @param {string} letter - Lettre à lire
 */
function playAlphaAudio(letter) {
  speak(letter);
  let btn = document.getElementById('playAudioBtn');
  if (btn) {
    btn.style.transform = 'scale(0.9)';
    setTimeout(() => { btn.style.transform = 'scale(1)'; }, 200);
  }
}

/**
 * Valide la réponse choisie, colorise les options et avance au prochain step.
 * @param {number} chosen  - Index de l'option choisie par l'utilisateur
 * @param {number} correct - Index de la bonne réponse
 */
function checkQ10(chosen, correct) {
  if (q10Answered) return;
  q10Answered = true;

  let qs = _q10Questions || getQuizQuestions(CT);

  document.querySelectorAll('[id^=q10o]').forEach((b, i) => {
    b.classList.add('disabled');
    if (i === correct)                           b.classList.add('correct');
    else if (i === chosen && chosen !== correct) b.classList.add('wrong');
  });

  if (chosen === correct) { q10Score++; _vibrateFeedback('correct'); } else { _vibrateFeedback('wrong'); }

  let correctWord = qs[q10Step].opts[correct];
  let fb  = document.getElementById('q10fb');
  fb.textContent = (chosen === correct)
    ? L('✅ Sirrii dha! Baga gammadde!', '✅ Correct ! Félicitations !')
    : L('❌ Dogoggora. Deebiin sirriin: ', '❌ Mauvaise réponse. La solution était : ') + correctWord;
  fb.style.color = (chosen === correct) ? 'var(--c-success)' : 'var(--c-error)';

  if (isAlphaQuiz()) {
    if (chosen !== correct) setTimeout(() => { speak(qs[q10Step].audio); }, 300);
  } else {
    if (CT.words) {
      let match = CT.words.find((w) => w.et === correctWord || w.fr === correctWord);
      if (match) speak(_spokenKey(match));
    }
  }

  _saveQuizSession('q10');
  setTimeout(() => { q10Step++; renderQuiz10(); }, 1600);
}


/* ============================================================
   11. DIALOGUE — SCÈNES DE SITUATION
   ============================================================
   Affiche les bulles de conversation pour la situation choisie,
   avec traduction intégrée et bouton d'écoute par bulle.
   ============================================================ */

/**
 * Affiche le dialogue de la situation courante.
 */
function renderDialog() {
  let sits    = CT.situations;
  let sitBtns = sits.map((s, i) => {
    return '<button class="sit-btn' + (i === sitIdx ? ' active' : '') + '" onclick="pickSit(' + i + ')">' + s.label + '</button>';
  }).join('');
  let sit = sits[sitIdx];

  let keys = langKeys(); // Contient keys.src ('fr' ou 'et') et keys.tgt ('et' ou 'fr')
  let bubbles = sit.dialogue.map((ln, i) => {
    let listenTip = L('Dhaggeeffadhu', 'Écouter');
    return '<div class="bubble ' + ln.side + '" style="opacity:0;transition:opacity .3s ' + (i * 0.08) + 's" id="bl' + i + '">'
      + '<div class="speaker-name">' + ln.s + '</div>'
      + '<div class="msg-row">'
      + '<div class="msg" lang="' + keys.src + '">' + ln[keys.src] + '</div>'
      + '<button class="speak-bubble-btn" onclick="speak(\'' + esc(ln[keys.src]) + '\')" title="' + listenTip + '">🔊</button>'
      + '</div>'
      + '<div class="bubble-translation" lang="' + keys.tgt + '">' + ln[keys.tgt] + '</div>'
      + '</div>';
  }).join('');

  document.getElementById('tabContent').innerHTML =
    '<div class="sit-nav">' + sitBtns + '</div>'
    + '<div class="dialogue-box">'
    + '<div class="scene-img-big">' + sit.img + '</div>'
    + '<div class="bubble-wrap">' + bubbles + '</div>'
    + '</div>'
    + '<div class="action-row">'
    + '<button class="btn-start-quiz" onclick="switchTab(\'dquiz\')">'
    + L('Quiz jalqabi ➜', 'Lancer le mini quiz ➜')
    + '</button>'
    + '</div>';

  setTimeout(() => {
    document.querySelectorAll('[id^=bl]').forEach((b) => { b.style.opacity = '1'; });
  }, 80);
}

/**
 * Change la situation affichée dans le dialogue.
 * @param {number} i - Index de la situation
 */
function pickSit(i) {
  sitIdx = i;
  renderDialog();
}


/* ============================================================
   12. VOCABULAIRE — LEXIQUE VISUEL CLIQUABLE
   ============================================================
   Affiche le vocabulaire d'un thème de dialogue sous forme de
   chips cliquables (écoute du mot au clic).
   ============================================================ */

/**
 * Affiche les chips de vocabulaire du thème de dialogue courant.
 */
function renderVocab() {
  let keys = langKeys();
  let chips = CT.vocab.map((v) => {
    let parts    = v.split('=');
    let et       = parts[0].trim();
    let fr       = parts[1] ? parts[1].trim() : '';
    /* On reconstruit un mini-objet { fr, et } pour réutiliser langKeys */
    let word     = { fr: fr, et: et };
    let mainWord = word[keys.src];
    let subWord  = word[keys.tgt];
    let listenTip = L('Dhaggeeffadhu : ', 'Écouter : ') + mainWord;

    return '<span class="vocab-chip" role="button" tabindex="0" '
      + 'aria-label="' + _escAttr(listenTip) + '" onclick="speak(\'' + esc(mainWord) + '\')">'
      + '<span class="vocab-item-et">' + mainWord + '</span>'
      + (subWord ? '<span class="vocab-item-fr">= ' + subWord + '</span>' : '')
      + '</span>';
  }).join('');

  document.getElementById('tabContent').innerHTML =
    '<div class="vocab-section">'
    + '<div class="vocab-title">'
    + L('📚 Jechoota murteessoo — Sagalee dhaggeeffachuuf cuqaasi !',
        '📚 Lexique essentiel — Cliquez pour écouter l\'Oromo !')
    + '</div>'
    + '<div class="vocab-grid">' + chips + '</div>'
    + '</div>'
    + '<div class="action-row">'
    + '<button class="btn-start-quiz" onclick="switchTab(\'dquiz\')">'
    + L('Quiz jalqabi ➜', 'Lancer le mini quiz ➜')
    + '</button>'
    + '</div>';
}


/* ============================================================
   13b. ONGLET RÉPÈTE — RECONNAISSANCE VOCALE
   ============================================================
   L'utilisateur entend un mot (TTS), puis le répète à voix haute.
   La Web Speech API (SpeechRecognition) compare ce qui a été dit
   au mot attendu et donne un feedback visuel immédiat.

   Cascade de langues pour la reconnaissance Oromo :
     1. om-ET  (Oromo natif — rare mais idéal)
     2. so-SO  (Somali — phonétiquement proche)
     3. am-ET  (Amharique — même région)
     4. ha-NG  (Haoussa — voyelles proches)
     5. sw-KE  (Swahili — africain oriental)
     6. es-ES  (Espagnol — voyelles similaires)
     7. it-IT  (Italien — voyelles similaires)
   Si aucune n'est acceptée par le navigateur : message explicatif.

   En mode learn_french : fr-FR uniquement.
   Si le navigateur ne supporte pas SpeechRecognition : message.
   ============================================================ */

/* ── Variables d'état de l'onglet Répète ── */
let _repeatIdx        = 0;       // Index du mot courant dans la liste
let _repeatWords      = [];      // Liste des mots de la session
let _repeatScore      = 0;       // Bonnes réponses sur la session
let _repeatTotal      = 0;       // Total de mots dans la session
let _repeatRecognizer = null;    // Instance SpeechRecognition en cours
let _repeatLangUsed   = null;    // Langue réellement utilisée pour la reco
let _repeatLangLabel  = null;    // Libellé lisible de cette langue

/**
 * Cascade de langues de reconnaissance pour l'Oromo.
 * Classées de la plus pertinente à la moins pertinente.
 */
const REPEAT_OROMO_LANGS = [
  { lang: 'om-ET', label: 'Oromo (om-ET)' },
  { lang: 'so-SO', label: 'Somali (so-SO)' },
  { lang: 'am-ET', label: 'Amharique (am-ET)' },
  { lang: 'ha-NG', label: 'Haoussa (ha-NG)' },
  { lang: 'sw-KE', label: 'Swahili (sw-KE)' },
  { lang: 'es-ES', label: 'Espagnol (es-ES)' },
  { lang: 'it-IT', label: 'Italien (it-IT)' }
];

/**
 * Arrête proprement la reconnaissance en cours, sans lever d'erreur.
 */
function _stopRepeat() {
  if (_repeatRecognizer) {
    try { _repeatRecognizer.abort(); } catch(e) {}
    _repeatRecognizer = null;
  }
}

/**
 * Normalise un texte pour la comparaison :
 * minuscules, sans accents, sans ponctuation superflue.
 * L'apostrophe typographique Oromo ' (U+2019) est convertie en
 * apostrophe droite ' (U+0027) avant le nettoyage, ce qui évite
 * les faux négatifs sur les mots comme ba'uu, ni ja'a, hin ta'u…
 * @param {string} s
 * @returns {string}
 */
function _normalizeRepeat(s) {
  return (s || '')
    .toLowerCase()
    .replace(/\u2019/g, "'")           // apostrophe typographique → droite (Oromo)
    .replace(/[\u2018\u201A\u0060]/g, "'") // autres variantes d'apostrophe ouvrante
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // supprime les diacritiques
    .replace(/[^a-z0-9\s']/g, ' ')    // ponctuation → espace (conserve l'apostrophe droite)
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Teste si la transcription contient le mot attendu.
 * Stratégie en trois passes :
 *   1. Correspondance exacte ou inclusion directe.
 *   2. Tolérance Levenshtein ≤ 25 % sur la transcription entière.
 *   3. Même tolérance mot par mot (absorbe les parasites STT).
 *   4. Pour les expressions avec " / ", chaque partie est testée
 *      indépendamment — la première qui passe valide la réponse.
 * @param {string} transcript
 * @param {string} expected
 * @returns {boolean}
 */
function _matchRepeat(transcript, expected) {
  /* Tester une paire normalisée (t, e) avec la logique Levenshtein */
  function _testPair(t, e) {
    if (!e) return false;
    if (t === e || t.indexOf(e) !== -1) return true;
    /* Mots très courts (≤ 3 car) : pas de tolérance */
    if (e.length <= 3) return t === e;
    let threshold = Math.floor(e.length * 0.25);
    if (threshold < 1) threshold = 1;
    if (_levenshtein(t, e) <= threshold) return true;
    /* Test mot par mot dans la transcription */
    const words = t.split(/\s+/);
    for (const word of words) {
      if (_levenshtein(word, e) <= threshold) return true;
    }
    return false;
  }

  let t = _normalizeRepeat(transcript);

  /* Bug 8 — Tester chaque partie séparée par " / " indépendamment.
     Ex. : "ba'uu / hin deemne" → on teste "ba'uu" ET "hin deemne"
     séparément. La transcription STT ne restitue qu'une seule partie ;
     le seuil de 25% global échouerait sur l'expression complète. */
  const expectedParts = expected.split('/').map((p) => _normalizeRepeat(p)).filter(Boolean);

  if (expectedParts.length <= 1) {
    /* Pas de séparateur : comportement classique */
    return _testPair(t, _normalizeRepeat(expected));
  }

  /* Plusieurs parties : la transcription doit matcher au moins l'une d'elles */
  for (const part of expectedParts) {
    if (_testPair(t, part)) return true;
  }
  return false;
}

/**
 * Calcule la distance de Levenshtein entre deux chaînes.
 * Algorithme DP classique, O(n*m) en temps, O(min(n,m)) en espace.
 * @param {string} a
 * @param {string} b
 * @returns {number} Nombre minimum d'opérations (insertion/suppression/substitution)
 */
function _levenshtein(a, b) {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  /* Garantir que s est la chaîne la plus courte (économie mémoire) */
  const [long, short] = a.length >= b.length ? [a, b] : [b, a];
  let prev = [];
  let curr = [];
  for (let j = 0; j <= short.length; j++) prev[j] = j;
  for (let i = 1; i <= long.length; i++) {
    curr[0] = i;
    for (let k = 1; k <= short.length; k++) {
      const cost = (long[i - 1] === short[k - 1]) ? 0 : 1;
      curr[k] = Math.min(
        curr[k - 1] + 1,        /* insertion */
        prev[k]     + 1,        /* suppression */
        prev[k - 1] + cost      /* substitution */
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[short.length];
}

/**
 * Tente d'instancier SpeechRecognition avec la langue donnée.
 * Retourne l'instance ou null si non supporté/refusé.
 * @param {string} lang  - BCP-47 (ex. 'fr-FR', 'om-ET')
 * @returns {SpeechRecognition|null}
 */
function _makeRecognizer(lang) {
  let SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  try {
    let r = new SR();
    r.lang          = lang;
    r.continuous    = false;
    r.interimResults = false;
    r.maxAlternatives = 3;
    return r;
  } catch(e) { return null; }
}

/**
 * Construit la liste des mots de la session Répète selon le type de thème.
 * Pour les dialogues, on extrait les répliques de la langue source.
 * @returns {Array<{word:string, hint:string}>}
 *   word  = texte à prononcer (langue source)
 *   hint  = traduction (langue cible)
 */
function _buildRepeatWords() {
  let keys = langKeys();
  let list = [];

  if (CT.type === 'dialog') {
    /* Thème dialogue : on prend le vocabulaire clé (CT.vocab) */
    (CT.vocab || []).forEach((v) => {
      let parts = v.split('=');
      let et = parts[0] ? parts[0].trim() : '';
      let fr = parts[1] ? parts[1].trim() : '';
      let word = { fr: fr, et: et };
      let mainWord = word[keys.src];
      let hintWord = word[keys.tgt];
      if (mainWord) list.push({ word: mainWord, hint: hintWord });
    });
  } else {
    /* Thème vocabulaire standard : CT.words */
    (CT.words || []).forEach((w) => {
      let mainWord = w[keys.src];
      let hintWord = w[keys.tgt];
      if (mainWord) list.push({ word: mainWord, hint: hintWord, em: w.em || '' });
    });
  }
  return list;
}

/**
 * Affiche l'onglet Répète.
 * Détecte la disponibilité de la reconnaissance vocale, résout la langue,
 * puis affiche l'interface de répétition ou un message d'indisponibilité.
 */
function renderRepeat() {
  _stopRepeat();
  _repeatWords = _buildRepeatWords();
  _repeatIdx   = 0;
  _repeatScore = 0;
  _repeatTotal = _repeatWords.length;

  let SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  /* ── SpeechRecognition non supporté ── */
  if (!SR) {
    _renderRepeatUnavailable(
      L('🎙️ Afaan kee dubbisuuf tajaajilli sagalee kun browser kee irratti hin deeggaramu.',
        '🎙️ La reconnaissance vocale n\'est pas disponible sur ce navigateur.'),
      L('Chrome yookiin Edge fayyadami.',
        'Essayez Chrome ou Edge sur Android/Windows/Mac.')
    );
    return;
  }

  if (isFrench()) {
    /* ── Mode learn_french : fr-FR uniquement ── */
    _repeatLangUsed  = 'fr-FR';
    _repeatLangLabel = 'Français (fr-FR)';
    _renderRepeatUI(null, null);

  } else {
    /* ── Mode learn_oromo : cascade de langues ── */
    _resolveRepeatLangOromo(function(lang, label) {
      if (!lang) {
        _renderRepeatUnavailable(
          '🎙️ Aucune langue de reconnaissance compatible avec l\'Oromo n\'est disponible sur ce navigateur.',
          'Essayez Chrome sur Android ou sur PC. La langue Somali ou Espagnole peut aussi aider.'
        );
        return;
      }
      _repeatLangUsed  = lang;
      _repeatLangLabel = label;
      let isNative = (lang === 'om-ET');
      let altMsg = isNative ? null : (
        '⚠️ Pas de reconnaissance Oromo native. Utilisation de : <strong>' + label + '</strong><br>'
        + '<small>La reconnaissance sera approximative. Parlez lentement et clairement.</small>'
      );
      _renderRepeatUI(altMsg, null);
    });
  }
}

/**
 * Teste en cascade les langues Oromo disponibles pour la reconnaissance.
 * Appelle callback(lang, label) avec la première langue acceptée,
 * ou callback(null, null) si aucune ne fonctionne.
 * @param {Function} callback
 */
function _resolveRepeatLangOromo(callback) {
  let idx = 0;

  function tryNext() {
    if (idx >= REPEAT_OROMO_LANGS.length) {
      callback(null, null);
      return;
    }
    let candidate = REPEAT_OROMO_LANGS[idx];
    idx++;

    let r = _makeRecognizer(candidate.lang);
    if (!r) { tryNext(); return; }

    /* On teste avec un timeout : si start() ne déclenche pas d'erreur
       en 400ms, on considère la langue comme acceptée par le navigateur. */
    let resolved = false;

    r.onerror = (e) => {
      if (resolved) return;
      /* 'language-not-supported' → on passe à la suivante */
      if (e.error === 'language-not-supported' || e.error === 'network') {
        try { r.abort(); } catch(_) {}
        tryNext();
      } else {
        /* Autre erreur (micro refusé, etc.) → on accepte quand même cette langue */
        resolved = true;
        try { r.abort(); } catch(_) {}
        callback(candidate.lang, candidate.label);
      }
    };

    r.onstart = () => {
      if (resolved) return;
      resolved = true;
      try { r.abort(); } catch(_) {}
      callback(candidate.lang, candidate.label);
    };

    /* Fallback timeout : si rien ne se passe en 600ms, on accepte */
    setTimeout(() => {
      if (resolved) return;
      resolved = true;
      try { r.abort(); } catch(_) {}
      callback(candidate.lang, candidate.label);
    }, 600);

    try { r.start(); } catch(e) { if (!resolved) { resolved = true; callback(candidate.lang, candidate.label); } }
  }

  tryNext();
}

/**
 * Affiche un message d'indisponibilité dans l'onglet Répète.
 * @param {string} mainMsg
 * @param {string} tip
 */
function _renderRepeatUnavailable(mainMsg, tip) {
  document.getElementById('tabContent').innerHTML =
    '<div class="repeat-unavailable">'
    + '<div class="repeat-unavail-icon">🎙️</div>'
    + '<p class="repeat-unavail-main">' + mainMsg + '</p>'
    + (tip ? '<p class="repeat-unavail-tip">' + tip + '</p>' : '')
    + '</div>';
}

/**
 * Affiche l'interface principale de l'onglet Répète.
 * @param {string|null} altLangMsg  - Message d'avertissement langue alternative (HTML)
 * @param {string|null} _unused
 */
function _renderRepeatUI(altLangMsg) {
  if (!_repeatWords.length) {
    document.getElementById('tabContent').innerHTML =
      '<div class="repeat-unavailable"><p>'
      + L('Jechoota hin argamne.', 'Aucun mot disponible pour cet exercice.')
      + '</p></div>';
    return;
  }

  let altBanner = altLangMsg
    ? '<div class="repeat-alt-lang">' + altLangMsg + '</div>'
    : '';

  let langInfo = '<div class="repeat-lang-info">🌐 '
    + L('Af-dubbii : ', 'Reconnaissance : ')
    + '<strong>' + _repeatLangLabel + '</strong></div>';

  document.getElementById('tabContent').innerHTML =
    altBanner
    + langInfo
    + '<div id="repeat-card" class="repeat-card"></div>'
    + '<div id="repeat-feedback" class="repeat-feedback"></div>'
    + '<div id="repeat-controls" class="repeat-controls"></div>'
    + '<div id="repeat-progress" class="repeat-progress-wrap"></div>';

  _renderRepeatCard();
}

/**
 * Affiche la carte du mot courant et les contrôles.
 */
function _renderRepeatCard() {
  if (_repeatIdx >= _repeatTotal) {
    _renderRepeatResult();
    return;
  }

  let item    = _repeatWords[_repeatIdx];
  let counter = (_repeatIdx + 1) + ' / ' + _repeatTotal;
  let emoji   = item.em ? '<div class="repeat-card-emoji">' + item.em + '</div>' : '';

  /* Carte mot */
  document.getElementById('repeat-card').innerHTML =
    emoji
    + '<div class="repeat-card-counter">' + counter + '</div>'
    + '<div class="repeat-card-word">' + item.word + '</div>'
    + (item.hint ? '<div class="repeat-card-hint">' + item.hint + '</div>' : '');

  /* Zone feedback */
  document.getElementById('repeat-feedback').innerHTML = '';

  /* Contrôles */
  let listenLbl = L('🔊 Dhaggeeffadhu', '🔊 Écouter');
  let micLbl    = L('🎙️ Dubbadhu',      '🎙️ Parler');
  let skipLbl   = L('⏭ Irra darbii',   '⏭ Passer');

  document.getElementById('repeat-controls').innerHTML =
    '<button class="repeat-btn repeat-btn--listen" onclick="repeatListen()">' + listenLbl + '</button>'
    + '<button class="repeat-btn repeat-btn--mic"    id="repeat-mic-btn" onclick="repeatRecord()">' + micLbl + '</button>'
    + '<button class="repeat-btn repeat-btn--skip"   onclick="repeatSkip()">' + skipLbl + '</button>';

  /* Barre de progression */
  let pct = Math.round(_repeatIdx / _repeatTotal * 100);
  document.getElementById('repeat-progress').innerHTML =
    '<div class="repeat-progress-bar"><div class="repeat-progress-fill" style="width:' + pct + '%"></div></div>'
    + '<div class="repeat-progress-label">' + _repeatScore + ' ✅ / ' + _repeatIdx + ' ' + L('yaaliitiin', 'tentatives') + '</div>';

  /* Lecture automatique à l'affichage de la première carte */
  if (_repeatIdx === 0) {
    setTimeout(() => { repeatListen(); }, 400);
  }
}

/**
 * Lit le mot courant à voix haute (TTS).
 */
function repeatListen() {
  let item = _repeatWords[_repeatIdx];
  if (!item) return;
  speak(item.word);

  /* Animation du bouton écoute */
  let btn = document.getElementById('repeat-controls');
  if (btn) {
    let listenBtn = btn.querySelector('.repeat-btn--listen');
    if (listenBtn) {
      listenBtn.classList.add('repeat-btn--pulse');
      setTimeout(() => { listenBtn.classList.remove('repeat-btn--pulse'); }, 600);
    }
  }
}

/**
 * Lance l'enregistrement et la reconnaissance vocale pour le mot courant.
 */
function repeatRecord() {
  _stopRepeat();

  let item = _repeatWords[_repeatIdx];
  if (!item) return;

  let micBtn = document.getElementById('repeat-mic-btn');
  if (micBtn) {
    micBtn.textContent = L('⏺ Sagalee dhageessuu...', '⏺ Écoute en cours...');
    micBtn.classList.add('repeat-btn--recording');
    micBtn.disabled = true;
  }

  let fbEl = document.getElementById('repeat-feedback');
  if (fbEl) {
    fbEl.className = 'repeat-feedback repeat-feedback--listening';
    fbEl.textContent = L('🎙️ Dubbadhu...', '🎙️ Parlez maintenant...');
  }

  _repeatRecognizer = _makeRecognizer(_repeatLangUsed);
  if (!_repeatRecognizer) {
    _renderRepeatUnavailable(
      L('Sagalee addabaasuu hin danda\'amu.', 'Impossible de démarrer la reconnaissance vocale.'),
      ''
    );
    return;
  }

  _repeatRecognizer.onresult = (e) => {
    const transcripts = Array.from(
      { length: e.results[0].length },
      (_, i) => e.results[0][i].transcript
    );
    _handleRepeatResult(transcripts, item.word);
  };

  _repeatRecognizer.onerror = (e) => {
    _resetMicBtn();
    const fbEl2 = document.getElementById('repeat-feedback');
    if (!fbEl2) return;

    if (e.error === 'not-allowed' || e.error === 'permission-denied') {
      fbEl2.className = 'repeat-feedback repeat-feedback--error';
      fbEl2.innerHTML = L(
        '🔒 Hayyama maaykiroofooniif kenni (browser settings).',
        '🔒 Autorisez le microphone dans les paramètres du navigateur.'
      );
    } else if (e.error === 'no-speech') {
      fbEl2.className = 'repeat-feedback repeat-feedback--neutral';
      fbEl2.textContent = L('Sagalee hin dhagahanne. Ammas yaali.', 'Aucun son détecté. Réessayez.');
    } else if (e.error === 'language-not-supported') {
      fbEl2.className = 'repeat-feedback repeat-feedback--error';
      fbEl2.innerHTML = L(
        '⚠️ Afaan kuni browser keetin hin deeggararamu.',
        '⚠️ Langue non supportée par ce navigateur pour la reconnaissance.'
      );
    } else {
      fbEl2.className = 'repeat-feedback repeat-feedback--neutral';
      fbEl2.textContent = L('Dogoggora: ' + e.error, 'Erreur : ' + e.error);
    }
  };

  _repeatRecognizer.onend = () => {
    _resetMicBtn();
  };

  try {
    _repeatRecognizer.start();
  } catch(e) {
    _resetMicBtn();
    let fbElCatch = document.getElementById('repeat-feedback');
    if (fbElCatch) {
      fbElCatch.className = 'repeat-feedback repeat-feedback--error';
      fbElCatch.textContent = L('Maaykiroofoona jalqabuu dadhabeera.', 'Impossible de démarrer le microphone.');
    }
  }
}

/**
 * Remet le bouton micro dans son état initial.
 */
function _resetMicBtn() {
  let micBtn = document.getElementById('repeat-mic-btn');
  if (micBtn) {
    micBtn.textContent = L('🎙️ Dubbadhu', '🎙️ Parler');
    micBtn.classList.remove('repeat-btn--recording');
    micBtn.disabled = false;
  }
}

/**
 * Traite le résultat de la reconnaissance : compare avec le mot attendu
 * et affiche le feedback approprié.
 * @param {string[]} transcripts  - Alternatives retournées par la reco
 * @param {string}   expected     - Mot attendu
 */
function _handleRepeatResult(transcripts, expected) {
  let matched = transcripts.some((t) => _matchRepeat(t, expected));
  let best    = transcripts[0] || '';

  let fbEl = document.getElementById('repeat-feedback');
  if (!fbEl) return;

  if (matched) {
    _repeatScore++;
    _vibrateFeedback('correct');
    fbEl.className = 'repeat-feedback repeat-feedback--correct';
    fbEl.innerHTML =
      '<span class="repeat-fb-icon">✅</span> '
      + L('Sirrii dha! Baay\'ee gaarii!', 'Correct ! Bravo !')
      + (best ? '<div class="repeat-fb-heard">'
          + L('Dhageenyee: ', 'Entendu : ')
          + '<em>' + best + '</em></div>' : '');

    /* Passe au mot suivant automatiquement après 1,5 s */
    setTimeout(() => {
      _repeatIdx++;
      _renderRepeatCard();
    }, 1500);

  } else {
    _vibrateFeedback('wrong');
    fbEl.className = 'repeat-feedback repeat-feedback--wrong';
    fbEl.innerHTML =
      '<span class="repeat-fb-icon">❌</span> '
      + L('Irra deebi\'i yaalii godhi. Jechan: ', 'Pas tout à fait. Mot attendu : ')
      + '<strong>' + expected + '</strong>'
      + (best ? '<div class="repeat-fb-heard">'
          + L('Dhageenyee: ', 'Entendu : ')
          + '<em>' + best + '</em></div>' : '');
  }
}

/**
 * Passe le mot courant sans le valider.
 */
function repeatSkip() {
  _stopRepeat();
  _repeatIdx++;
  _renderRepeatCard();
}

/**
 * Affiche l'écran de résultats à la fin de la session Répète.
 */
function _renderRepeatResult() {
  let pct  = _repeatTotal > 0 ? Math.round(_repeatScore / _repeatTotal * 100) : 0;
  let emoji = pct === 100 ? '🎉🎉🎉' : pct >= 75 ? '⭐⭐' : pct >= 50 ? '⭐' : '😅';

  document.getElementById('repeat-card').innerHTML = '';
  document.getElementById('repeat-feedback').innerHTML = '';
  document.getElementById('repeat-progress').innerHTML = '';
  document.getElementById('repeat-controls').innerHTML =
    '<div class="result-box">'
    + '<div style="font-size:2rem;margin-bottom:8px">' + emoji + '</div>'
    + '<h3 style="color:var(--c-primary)">'
    + L('Shaakallii xumurameera!', 'Exercice terminé !')
    + '</h3>'
    + '<div class="score-num">' + _repeatScore + ' / ' + _repeatTotal + '</div>'
    + '<div style="font-size:.85rem;color:#666;margin:8px 0">'
    + pct + '% ' + L('si\'aa sirriin dubbachiiste', 'de réussite')
    + '</div>'
    + '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:14px">'
    + '<button class="retry-btn" style="background:#888" onclick="renderRepeat()">'
    + L('🔄 Irra deebi\'i', '🔄 Recommencer')
    + '</button>'
    + '<button class="retry-btn" onclick="switchTab(\'flash\')">'
    + L('🃏 Kaardota', '🃏 Cartes')
    + '</button>'
    + '</div></div>';
}


/* ============================================================
   13. QUIZ DIALOGUE — QUESTIONS SUR LE DIALOGUE
   ============================================================
   Quiz statique chargé depuis CT.quiz (défini dans data-fr.js / data-or.js).
   Même système d'étoiles que le Quiz 10 questions.
   ============================================================ */

/**
 * Affiche la question courante du quiz dialogue (ou l'écran de résultats).
 */
function renderDialogQuiz() {
  let qs    = CT.quiz;
  let total = qs.length;

  /* ── Écran de résultats ── */
  if (dqStep >= total) {
    _clearQuizSession();   /* quiz terminé : on nettoie la session */
    let pct         = Math.round(dqScore / total * 100);
    let earnedStars = _calcStars(pct);
    let _prevStarsD = getThemeStars(CT.id);
    if (earnedStars > 0) markDone(CT.id, pct);
    if (earnedStars === 3 && _prevStarsD < 3) {
      setTimeout(_launchConfetti, 300);
    }

    let r         = _quizResultStrings(pct, 'dq');
    let isSuccess = earnedStars > 0;

    let endStars = Array.from({ length: 3 }, function(_, i) {
      return i < earnedStars ? '⭐' : '☆';
    }).join('');

    document.getElementById('tabContent').innerHTML = '<div class="result-box">'
      + '<div style="font-size:2rem; margin-bottom:5px;">' + (earnedStars === 3 ? '🎉🎉🎉' : endStars) + '</div>'
      + '<h3>' + r.title + '</h3>'
      + '<div class="score-num">' + dqScore + '/' + total + '</div>'
      + '<div style="font-size:.9rem;margin-top:6px;color:' + (isSuccess ? 'var(--c-success)' : 'var(--c-error)') + '">' + r.sub + '</div>'
      + '<div style="display:flex;gap:8px;justify-content:center;margin-top:14px;flex-wrap:wrap">'
      + '<button class="retry-btn" style="background:#888" onclick="dqStep=0;dqScore=0;dqAnswered=false;renderDialogQuiz()">' + r.retry + '</button>'
      + (isSuccess ? '<button class="retry-btn" onclick="renderSections(_currentThemeLevel);lessonGoBack()">' + r.finish + '</button>' : '')
      + '</div></div>';
    renderSections(_currentThemeLevel || 1);
    return;
  }

  /* ── Question courante ── */
  let q      = qs[dqStep];
  let qLabel = L('Gaaffii ', 'Question ') + (dqStep + 1) + '/' + total;

  let opts = q.opts.map((o, i) => {
    return '<button class="quiz-opt" id="dqo' + i + '" onclick="checkDQ(' + i + ',' + q.ans + ')">' + o + '</button>';
  }).join('');

  document.getElementById('tabContent').innerHTML =
    '<div class="dialog-quiz-wrap">'
    + '<div class="quiz-q"><div class="q-text">' + qLabel + '<br><b>' + q.q + '</b></div></div>'
    + '<div class="quiz-options" style="grid-template-columns:1fr">' + opts + '</div>'
    + '<div class="quiz-feedback" id="dqfb"></div>'
    + '</div>';
  dqAnswered = false;
}

/**
 * Valide la réponse du quiz dialogue et avance à la question suivante.
 * @param {number} chosen  - Index de l'option choisie
 * @param {number} correct - Index de la bonne réponse
 */
function checkDQ(chosen, correct) {
  if (dqAnswered) return;
  dqAnswered = true;

  document.querySelectorAll('[id^=dqo]').forEach((b, i) => {
    b.classList.add('disabled');
    if (i === correct)                           b.classList.add('correct');
    else if (i === chosen && chosen !== correct) b.classList.add('wrong');
  });

  if (chosen === correct) { dqScore++; _vibrateFeedback('correct'); } else { _vibrateFeedback('wrong'); }

  let fb = document.getElementById('dqfb');
  fb.textContent = (chosen === correct)
    ? L('✅ Deebii sirrii dha!', '✅ Bonne réponse !')
    : L('❌ Deebistee yaali!',   '❌ Essayer de nouveau !');
  fb.style.color = (chosen === correct) ? 'var(--c-success)' : 'var(--c-error)';

  _saveQuizSession('dq');
  setTimeout(() => { dqStep++; renderDialogQuiz(); }, 1500);
}


/* ============================================================
   14. UTILITAIRES & CHAÎNES DE RÉSULTATS BILINGUES
   ============================================================ */

/**
 * Génère les chaînes bilingues pour l'écran de résultats d'un quiz.
 * @param {number} pct   - Pourcentage de réussite (0–100)
 * @param {'q10'|'dq'} type
 * @returns {{ title: string, sub: string, retry: string, finish: string }}
 */
function _quizResultStrings(pct, type) {
  let stars     = _calcStars(pct);
  let isSuccess = stars > 0;

  let title = L('Quiz xumurameera!', 'Quiz terminé !');
  if      (stars === 3) title = L('Baayʼee gaari da! 🌟🌟🌟', 'Parfait ! 🌟🌟🌟');
  else if (stars === 2) title = L('Gari da! ⭐⭐',             'Très bien ! ⭐⭐');
  else if (stars === 1) title = L('Ni dandaʼama! ⭐',          'Bien ! ⭐');

  return {
    title : title,
    sub   : isSuccess
      ? L('Kutaan kun milkiin darbeera! Tarreeffama haaraa argatteetta.',
          'Module validé ! Vous pouvez passer au suivant ou réessayer pour plus d\'étoiles.')
      : L('Darbuuf yoo xiqqaate 50% deebii sirrii barbaachisa. Deebisii yaali!',
          'Il vous faut au moins 50% de bonnes réponses (1⭐) pour valider. Réessayez !'),
    retry : L('🔄 Deebisi yaali', '🔄 Réessayer'),
    finish: L('✓ Xumuri',        '✓ Terminer')
  };
}

/**
 * Échappe les caractères spéciaux pour une insertion sécurisée
 * dans les attributs HTML inline (onclick="...") et les littéraux JS,
 * en protégeant particulièrement les apostrophes (hudhaa) de l'Afaan Oromoo.
 * @param {string} s
 * @returns {string}
 */
function esc(s) {
  if (!s) return '';
  return s
    .replaceAll('\\', '\\\\')
    .replaceAll("'",  '&#39;')   // Protège l'apostrophe Oromo dans le DOM HTML
    .replaceAll('"',  '&quot;'); // Protège les guillemets
}

/**
 * Échappe une chaîne pour une insertion sûre dans un attribut HTML
 * (aria-label, title…). Seuls & et " sont échappés.
 * @param {string} s
 * @returns {string}
 */
function _escAttr(s) {
  return (s || '')
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;');
}


/* ============================================================
   17. GUIDE UTILISATEUR — ONBOARDING (première visite par mode)
   ============================================================
   Affiché UNE SEULE FOIS par mode d'apprentissage, au premier
   lancement, juste après l'affichage de l'écran #home.

   PERSISTANCE : deux clés localStorage indépendantes :
     • 'tm_onboarded_fr' → mode learn_french déjà vu
     • 'tm_onboarded_or' → mode learn_oromo déjà vu
   Ainsi, un utilisateur bilingue qui passe d'un mode à l'autre
   voit le guide pour chaque mode la première fois.

   ARCHITECTURE :
     _maybeShowOnboarding() → point d'entrée appelé par initApp()
     _closeOnboarding()     → ferme + marque vu dans localStorage
     showOnboardingGuide()  → fonction publique (lien "Relire")

   ACCORDÉONS : utilise <details>/<summary> natifs — zéro JS pour
   l'ouverture/fermeture, juste du CSS (voir §19 de style.css).
   ============================================================ */

/** Clés localStorage des flags d'onboarding (une par mode) */
const _OB_KEY_FR = 'tm_onboarded_fr';
const _OB_KEY_OR = 'tm_onboarded_or';

/* ============================================================
   ÉCRAN 2 — GUIDE / HOME (remplace l'ancien écran Home)
   ============================================================
   _buildHomeGuide() : injecte dans #home le guide d'utilisation
   bilingue avec badges, accordéons et checkbox "Ne plus afficher".
   Appelée une fois par initApp() après _setUI().

   Logique "Ne plus afficher" :
   • Si le flag localStorage est posé ET que ce n'est pas un
     appel depuis "Aide" → on saute directement à sections.
   • La checkbox dans l'écran permet de poser/retirer le flag.
   • showOnboardingGuide() : force l'affichage depuis le footer
     (écran home) sans toucher au flag.
   ============================================================ */

/**
 * Active le bon bloc de langue dans l'écran #home et met à jour
 * les éléments dynamiques (drapeaux, titre, sous-titre, badges,
 * boutons).
 *
 * ARCHITECTURE (depuis Juin 2026) :
 * La structure HTML complète du guide (accordéons, audio, bio…)
 * est déclarée statiquement dans index.html, dans deux blocs :
 *   • .home-lang-block[data-lang="or"] → guide en Oromo
 *     (apprenant oromophone qui apprend le Français)
 *   • .home-lang-block[data-lang="fr"] → guide en Français
 *     (apprenant francophone qui apprend l'Oromo)
 * Cette fonction se limite à :
 *   1. Masquer les deux blocs, puis révéler le bon.
 *   2. Renseigner les IDs de l'en-tête (drapeaux, titre, sous-titre,
 *      badges) et des boutons (Commencer, Export PDF, topbar).
 */
function _buildHomeGuide() {
  let isFr = isFrench();
  /*
   * CONVENTION DE LANGUE :
   * isFr = true  → mode learn_french → apprenant OROMOPHONE → guide en OROMO   → bloc [data-lang="or"]
   * isFr = false → mode learn_oromo  → apprenant FRANCOPHONE → guide en FRANÇAIS → bloc [data-lang="fr"]
   */
  let activeLang = isFr ? 'or' : 'fr';

  /* ── 1. Révèle le bon bloc, masque l'autre ── */
  document.querySelectorAll('.home-lang-block').forEach((el) => {
    if (el.dataset.lang === activeLang) {
      el.classList.remove('home-lang-hidden');
    } else {
      el.classList.add('home-lang-hidden');
    }
  });

  /* ── 2. En-tête : drapeaux, titre, sous-titre ── */
  let flagsEl = document.getElementById('homeGuideFlagsRow');
  if (flagsEl) flagsEl.textContent = isFr ? '🇪🇹 → 🇫🇷' : '🇫🇷 → 🇪🇹';

  let titleEl = document.getElementById('homeTitle');
  if (titleEl) titleEl.textContent = isFr
    ? 'Afaan Faransaayii barachuu 🇫🇷'
    : "Apprendre l'Oromo 🇪🇹";

  let subEl = document.getElementById('homeGuideSubtitle');
  if (subEl) subEl.textContent = isFr
    ? "App bilisaa — calqalbaa irraa jalqabuuf ta'e"
    : 'App gratuite — idéale pour débuter depuis zéro';

  /* ── 3. Badges de fonctionnalités ── */
  let badgesEl = document.getElementById('homeGuideBadges');
  if (badgesEl) {
    let badges = isFr
      ? ['✅ Bilisaa', '🚧 Galmee malee', '📱 Bilbila & Kompiyuutara', '🔊 Sagalee', '🎤 Irra deebʼi', '📲 Interneetii malee']
      : ['✅ 100% Gratuit', '🚧 Sans inscription', '📱 Mobile & Bureau', '🔊 Audio inclus', '🎤 Répétition orale', '📲 Hors-ligne'];
    badgesEl.innerHTML = badges.map((b) => '<span class="hg-badge">' + b + '</span>').join('');
  }

  /* ── 4. Topbar ── */
  let topbarTitle = document.getElementById('homeTopbarTitle');
  if (topbarTitle) topbarTitle.textContent = L('Gargaarsa', 'Guide explicatif');

  /* ── 5. Bouton Commencer ── */
  let btn = document.getElementById('homeStartBtn');
  if (btn) {
    btn.textContent = L('▶ Jalqabi', '▶ Commencer');
    btn.onclick = () => { showScreen('sections-level1'); };
  }

  /* ── 6. Bouton export PDF du guide (pill compact dans la barre sticky) ── */
  let exportBtn = document.getElementById('homeExportBtn');
  if (exportBtn) {
    exportBtn.textContent = L('📄 PDF', '📄 PDF');
    exportBtn.title = L('Galmee guutuu buusi', 'Télécharger le guide (PDF)');
  }
}


function _maybeShowOnboarding() {
  /* Le guide est toujours affiché à l'arrivée — l'utilisateur navigue librement
     avec la barre de navigation basse. Plus de flag "ne plus afficher". */
}

/**
 * Ferme la modale onboarding legacy (gardée pour compatibilité).
 */
function _closeOnboarding() {
  let overlay = document.getElementById('onboarding-modal');
  if (!overlay) return;
  overlay.classList.remove('ob-visible');
  let key = (currentMode === 'learn_french') ? _OB_KEY_FR : _OB_KEY_OR;
  try { localStorage.setItem(key, '1'); } catch(e) {}
  /* Synchroniser les deux checkboxes sur l'écran home */
  let chk = document.getElementById('homeNoshowChk');
  if (chk) chk.checked = true;
  let chkTopbar = document.getElementById('homeTopbarNoshowChk');
  if (chkTopbar) chkTopbar.checked = true;
}

/**
 * Ouvre le guide depuis le lien "Aide" dans les footers.
 * Affiche l'écran #home (guide) sans toucher au flag.
 */
function showOnboardingGuide() {
  showScreen('home');
}

/* ============================================================
   CRÉDITS
   ============================================================ */

function showCredits() {
  /* Mise à jour bilingue du contenu selon le mode actif */
  let titleEl = document.getElementById('credits-modal-title');
  let bodyEl  = document.getElementById('credits-modal-body');
  let closeEl = document.getElementById('credits-modal-close');

  if (titleEl) titleEl.textContent = L('Odeeffannoo', 'Infos');
  if (closeEl) closeEl.textContent = L('Cufuu', 'Fermer');

  let lblCopy = L(
    '© Waxabajjii 2026 – Kan Sébastien Godet tolche · AI Claude Sonnet 4.6 fi Gemini 3.5 Flash gargaaramee',
    '© Juin 2026 – Développé par Sébastien Godet · Assisté par IA Claude Sonnet 4.6 et Gemini 3.5 Flash'
  );

  if (bodyEl) {
    bodyEl.innerHTML = isFrench()
      /* ── Texte Oromo (interface pour l'apprenant de français) ── */
      ? '<p class="credits-copy">' + lblCopy + '</p>'
        + '<p><button class="antispam-btn credits-email" onclick="openAndCopyEmail()"><span class="antispam-email">moc.liamg@61tedog.neitsabes</span></button>'
        + ' · <a href="https://www.linkedin.com/in/s%C3%A9bastien-godet-142ba6145" target="_blank" rel="noopener">LinkedIn</a></p>'
        + '<hr class="credits-sep">'
        + '<p>Galata guddaa <strong>Fédérico Calo</strong>'
        + ' (<a href="https://www.linkedin.com/in/federicocalo/" target="_blank" rel="noopener">Architektii Guddisaa Web</a>)'
        + ' gargaarsa teknikaaf.</p>'
        + '<p>Galata baay\'een <strong>Mussa Sembro</strong>'
        + ' (<a href="https://www.linkedin.com/in/mussa-sembro-137472174/" target="_blank" rel="noopener">Hiikkaa-Ibsituu Afaan Oromoo</a>)'
        + ' — hiikaa, sirreessaa fi gorsa afaanii.</p>'
        + '<p><strong>Maatii koo</strong> — irra deebi\'ee dubbisuu fi gorsaaf.</p>'
      /* ── Texte français (interface pour l'apprenant d'Oromo) ── */
      : '<p class="credits-copy">' + lblCopy + '</p>'
        + '<p><button class="antispam-btn credits-email" onclick="openAndCopyEmail()"><span class="antispam-email">moc.liamg@61tedog.neitsabes</span></button>'
        + ' · <a href="https://www.linkedin.com/in/s%C3%A9bastien-godet-142ba6145" target="_blank" rel="noopener">LinkedIn</a></p>'
        + '<hr class="credits-sep">'
        + '<p>Un grand merci à <strong>Fédérico Calo</strong>'
        + ' (<a href="https://www.linkedin.com/in/federicocalo/" target="_blank" rel="noopener">Architecte Développeur Web</a>)'
        + ' pour son aide technique.</p>'
        + '<p>Merci beaucoup à <strong>Mussa Sembro</strong>'
        + ' (<a href="https://www.linkedin.com/in/mussa-sembro-137472174/" target="_blank" rel="noopener">Traducteur-Interprète en Oromo</a>)'
        + ' pour son travail de traduction, ses corrections et ses précieux conseils linguistiques.</p>'
        + '<p>Merci à mes <strong>parents</strong> pour leur relecture attentive et leurs conseils.</p>';
  }

  let modal = document.getElementById('credits-modal');
  if (modal) modal.style.display = 'flex';
}


/* ============================================================
   15. INITIALISATION DU LAUNCHER
   ============================================================ */

/* Afficher la nav dès le chargement — visible sur toutes les pages
   y compris le launcher (état neutre : aucun bouton actif) */
(function() {
  let nav = document.getElementById('bottom-nav');
  if (nav) nav.classList.add('visible');
})();

document.querySelectorAll('.lang-card[data-lang]').forEach((card) => {
  card.addEventListener('click', () => {
    initApp(card.getAttribute('data-lang'));
  });
});


/* ============================================================
   16. ACCESSIBILITÉ CLAVIER — ÉLÉMENTS "BOUTON" NON NATIFS
   ============================================================ */
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const target = e.target.closest('[role="button"]');
  if (!target) return;
  e.preventDefault();
  target.click();
});


/* ============================================================
   UX — SPINNER DE CHARGEMENT DES DONNÉES
   ============================================================
   Affiché entre le clic sur le launcher et l'affichage de #home,
   pendant le téléchargement de data-fr.js ou data-or.js (~100 Ko).
   L'élément #app-loading est injecté dans le DOM par _showLoadingSpinner()
   et retiré par _hideLoadingSpinner() dans le callback de _loadDataScript.
   ============================================================ */

/**
 * Affiche un spinner plein écran pendant le chargement des données.
 * Injecté dynamiquement pour ne pas alourdir le HTML initial.
 */
function _showLoadingSpinner() {
  if (document.getElementById('app-loading')) return; /* déjà visible */
  let el = document.createElement('div');
  el.id        = 'app-loading';
  el.className = 'app-loading';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  el.innerHTML =
    '<div class="app-loading-inner">'
    + '<div class="app-loading-spinner"></div>'
    + '<p class="app-loading-label">'
    + L('Barachuu eegaluuf…', 'Chargement en cours…')
    + '</p>'
    + '</div>';
  document.body.appendChild(el);
  /* Forcer un reflow pour que la transition CSS d'entrée soit jouée */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { el.classList.add('app-loading--visible'); });
  });
}

/**
 * Retire le spinner de chargement avec une transition de sortie.
 */
function _hideLoadingSpinner() {
  let el = document.getElementById('app-loading');
  if (!el) return;
  el.classList.remove('app-loading--visible');
  setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
}
/* ============================================================
   19b. VIEWPORT HEIGHT FIX — Android Chrome / Brave
   ============================================================
   PROBLÈME :
     Sur Android, 100dvh inclut parfois la barre d'URL du navigateur.
     Quand celle-ci apparaît ou disparaît, le layout ne se recalcule
     pas toujours correctement → la carte (mode Kaardota) est coupée
     en bas, et les boutons d'export débordent sous la bottom-nav.

   SOLUTION :
     window.innerHeight donne TOUJOURS la hauteur réelle du viewport
     visible (sans la barre d'URL), quelle que soit son état.
     On l'écrit dans la custom property CSS --app-h sur <html>,
     utilisée par #lesson à la place de 100dvh.
     On lit aussi la hauteur réelle de #bottom-nav pour --bottom-nav-h.

   DÉCLENCHEURS :
     • 'resize' fenêtre        → rotation, zoom, redimensionnement
     • visualViewport 'resize' → barre d'URL qui apparaît/disparaît
       (seul événement fiable sur Chrome/Brave Android)
     • DOMContentLoaded        → valeur initiale avant tout rendu

   DEBOUNCE :
     visualViewport se déclenche à chaque pixel de scroll de la barre ;
     un délai de 80 ms évite des repaints inutiles sans perte de réactivité.
   ============================================================ */

(function initViewportFix() {
  function setAppHeight() {
    const h   = window.innerHeight;
    const nav = document.getElementById('bottom-nav');
    const navH = nav ? nav.getBoundingClientRect().height : 56;
    document.documentElement.style.setProperty('--app-h',        h    + 'px');
    document.documentElement.style.setProperty('--bottom-nav-h', navH + 'px');
  }

  /* Appel immédiat — couvre le premier rendu */
  setAppHeight();

  /* Resize classique (rotation, zoom clavier virtuel) */
  window.addEventListener('resize', setAppHeight, { passive: true });

  /* visualViewport : barre d'URL Chrome/Brave qui slide */
  if (window.visualViewport) {
    let _debTimer = null;
    window.visualViewport.addEventListener('resize', () => {
      clearTimeout(_debTimer);
      _debTimer = setTimeout(setAppHeight, 80);
    }, { passive: true });
  }

  /* touchend : fallback pour Brave/Chrome Android où visualViewport.resize
     ne se déclenche pas toujours quand la barre d'URL réapparaît après
     un scroll vers le haut. On recalcule 300ms après le lâcher du doigt,
     délai suffisant pour que le navigateur ait terminé son animation. */
  let _touchTimer = null;
  document.addEventListener('touchend', () => {
    clearTimeout(_touchTimer);
    _touchTimer = setTimeout(setAppHeight, 300);
  }, { passive: true });
})();

/* ============================================================
   20. ENREGISTREMENT DU SERVICE WORKER (PWA / Hors-ligne)
   ============================================================
   Enregistré après le chargement complet de la page pour ne pas
   bloquer le rendu initial. Le SW gère le cache hors-ligne et
   la stratégie Cache First / Network First (voir sw.js).
   ============================================================ */
if ('serviceWorker' in navigator) {
  /*
   * FLAG ANTI-BOUCLE
   * controllerchange peut théoriquement se déclencher plusieurs fois
   * (rare mais possible sur certains navigateurs mobiles).
   * Le flag garantit qu'on ne recharge qu'une seule fois par session.
   */
  let _reloading = false;

  /*
   * RECHARGEMENT AUTOMATIQUE À LA PRISE DE CONTRÔLE DU NOUVEAU SW
   * ---------------------------------------------------------------
   * Cycle de vie :
   *   1. sw.js change de CACHE_NAME (nouveau déploiement)
   *   2. Le navigateur installe le nouveau SW en arrière-plan (install)
   *   3. skipWaiting() dans sw.js lui ordonne de prendre le contrôle
   *      immédiatement sans attendre la fermeture des onglets
   *   4. clients.claim() dans sw.js étend ce contrôle à cet onglet
   *   5. → 'controllerchange' se déclenche ici
   *   6. location.reload() : l'onglet recharge depuis le nouveau cache
   *
   * Résultat : l'utilisateur voit un flash de rechargement (~200 ms)
   * et repart sur la version fraîche. Aucune action requise de sa part.
   * Aucun message à lire, aucun bouton à taper.
   */
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (_reloading) return;
    _reloading = true;
    window.location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .catch(function(err) {
        /* Échec silencieux : l'app fonctionne quand même en ligne */
        console.warn('[SW] Enregistrement échoué :', err);
      });
  });
}

/* ============================================================
   21. EXPORTS PDF — window.print() + @media print
   ============================================================
   Trois exports indépendants, 100% côté navigateur.
   Chacun ouvre une fenêtre temporaire avec un HTML complet
   (styles inline @media print), déclenche window.print(),
   puis ferme la fenêtre automatiquement.

   _exportGuide()      → Ecran Home  : guide complet toutes sections
   _exportVocab()      → Lecon Niv.1 : tableau 2 col. dense (Oromo|FR)
   _exportSituation()  → Lecon Niv.2 : situation courante (sitIdx)
   ============================================================ */

/* ── Utilitaire commun : ouvre une fenêtre print et la ferme après ── */
/**
 * Ouvre une fenêtre d'impression avec le contenu HTML fourni.
 *
 * STRATÉGIE TRIPLE :
 *   • Cas normal        : window.open() + window.print() (navigateurs desktop)
 *   • Android           : window.open() avec Blob URL est bloqué silencieusement par
 *     le bloqueur de popups intégré (Brave, Chrome…) — la fenêtre retourne non-null
 *     mais l'événement 'load' ne se déclenche jamais → print() n'est jamais appelé.
 *     Fallback direct → _downloadAsHtml() pour tous les UA Android.
 *   • iOS PWA standalone : window.open() est bloqué par Safari en mode standalone.
 *     Fallback → Blob HTML + <a download> qui déclenche un téléchargement direct du
 *     fichier .html, que l'utilisateur peut ouvrir dans son navigateur pour imprimer.
 *
 * Détection iOS standalone : navigator.standalone === true (propriété non-standard
 * Apple, disponible sur tous les Safari iOS depuis iOS 2.1).
 * Détection Android : /Android/i.test(navigator.userAgent).
 *
 * @param {string} htmlContent - Document HTML complet à imprimer / télécharger
 */
function _openPrintWindow(htmlContent) {
  /* ── Détection iOS PWA standalone ── */
  const isIosPwaStandalone = (navigator.standalone === true);

  if (isIosPwaStandalone) {
    _downloadAsHtml(htmlContent);
    return;
  }

  /* ── Détection Android ──
     Sur Android (Brave, Chrome, Firefox…), window.open() avec une Blob URL
     est bloqué silencieusement par le bloqueur de popups intégré : la fonction
     retourne un objet non-null mais la fenêtre n'est jamais rendue, et l'événement
     'load' ne se déclenche donc pas → window.print() n'est jamais appelé.
     Solution : on contourne window.open() sur Android et on télécharge directement
     le fichier HTML via _downloadAsHtml(), que l'utilisateur ouvre pour imprimer. */
  const isAndroid = /Android/i.test(navigator.userAgent);

  if (isAndroid) {
    _downloadAsHtml(htmlContent);
    return;
  }

  /* ── Chemin normal : Blob URL + popup + print ──
     On utilise une Blob URL au lieu de document.write() car sur Android
     (Brave/Chrome), l'événement 'load' ne se déclenche pas avec document.write(),
     ce qui empêche window.print() d'être appelé (aperçu bloqué indéfiniment).
     Avec une Blob URL, le navigateur charge une vraie ressource et 'load' est fiable. */
  let blobUrl;
  try {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    blobUrl = URL.createObjectURL(blob);
  } catch(e) {
    _downloadAsHtml(htmlContent);
    return;
  }

  const win = window.open(blobUrl, '_blank', 'width=800,height=600');
  if (!win) {
    /* Popup bloqué : proposer le téléchargement HTML */
    URL.revokeObjectURL(blobUrl);
    _showToast(L(
      '⚠️ Pop-up bloqué — téléchargement du fichier HTML à la place.',
      '⚠️ Pop-up dhaabame — faayilii HTML buufama.'
    ), 5000);
    _downloadAsHtml(htmlContent);
    return;
  }

  win.addEventListener('load', () => {
    setTimeout(() => {
      win.print();
      win.addEventListener('afterprint', () => {
        win.close();
        URL.revokeObjectURL(blobUrl);
      });
      /* Sécurité : fermeture et nettoyage au bout de 30 s si afterprint ne se déclenche pas */
      setTimeout(() => {
        try { win.close(); } catch(e) {}
        URL.revokeObjectURL(blobUrl);
      }, 30000);
    }, 250);
  });
}

/**
 * Fallback export : génère un Blob HTML et déclenche un téléchargement via <a download>.
 * Utilisé sur iOS Safari PWA standalone (window.open bloqué) et quand les popups
 * sont bloqués sur les autres navigateurs.
 *
 * L'utilisateur reçoit un fichier .html qu'il peut ouvrir dans son navigateur
 * pour imprimer ou convertir en PDF via la boîte de dialogue d'impression.
 *
 * @param {string} htmlContent - Document HTML complet
 */
function _downloadAsHtml(htmlContent) {
  try {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'taphadmeuh-export.html';
    document.body.appendChild(a);
    a.click();
    /* Nettoyer le lien et libérer l'URL objet après le déclenchement */
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
    const isAndroid = /Android/i.test(navigator.userAgent);
    _showToast(L(
      isAndroid
        ? '📄 Fichier HTML téléchargé — ouvrez-le dans votre navigateur pour imprimer.'
        : '📄 Fichier HTML téléchargé — ouvrez-le dans Safari pour imprimer.',
      isAndroid
        ? '📄 Faayilii HTML buufame — maxxansuuf browser keessatti bani.'
        : '📄 Faayilii HTML buufame — maxxansuuf Safari keessatti bani.'
    ), 6000);
  } catch(e) {
    _showToast(L(
      '⚠️ Export impossible sur cet appareil.',
      "⚠️ Meeshaa kana irratti erguu hin danda'amu."
    ), 5000);
  }
}

/* ── CSS de base partage par les trois exports ── */
function _printBaseCSS(primaryColor, accentColor) {
  return '<style>'
    + '*{box-sizing:border-box;margin:0;padding:0}'
    + 'body{font-family:"Segoe UI",system-ui,sans-serif;font-size:11pt;color:#1a1a2e;background:#fff;padding:12mm 14mm}'
    + 'h1{font-size:16pt;color:' + primaryColor + ';margin-bottom:4pt;font-weight:700}'
    + 'h2{font-size:13pt;color:' + primaryColor + ';margin:8pt 0 4pt;font-weight:700}'
    + 'h3{font-size:11pt;color:' + primaryColor + ';margin:6pt 0 2pt;font-weight:600}'
    + 'p{margin:3pt 0;line-height:1.5}'
    + 'ul{margin:3pt 0 3pt 14pt;line-height:1.6}'
    + 'li{margin-bottom:1pt}'
    + 'a{color:' + primaryColor + ';text-decoration:none}'
    + '.print-header{border-bottom:3pt solid ' + primaryColor + ';padding-bottom:6pt;margin-bottom:10pt;display:flex;justify-content:space-between;align-items:flex-end}'
    + '.print-title{font-size:18pt;font-weight:700;color:' + primaryColor + '}'
    + '.print-subtitle{font-size:10pt;color:#555;margin-top:2pt}'
    + '.print-meta{font-size:8.5pt;color:#777;text-align:right;line-height:1.6}'
    + '.print-footer{border-top:1pt solid #ddd;margin-top:14pt;padding-top:5pt;font-size:8pt;color:#888;text-align:center}'
    + '.badge{display:inline-block;background:' + accentColor + ';color:#fff;border-radius:3pt;padding:1pt 5pt;font-size:8pt;font-weight:600;margin-right:3pt;vertical-align:middle}'
    + '@media print{body{padding:8mm 10mm}@page{margin:10mm 12mm;size:A4 portrait}}'
    + '</style>';
}

/* ── En-tete commun de document ── */
function _printDocHeader(titleLine1, titleLine2, meta1, meta2, primaryColor, accentColor) {
  return '<div class="print-header">'
    + '<div>'
    + '<div class="print-title">\ud83d\udc04 ' + titleLine1 + '</div>'
    + '<div class="print-subtitle">' + titleLine2 + '</div>'
    + '</div>'
    + '<div class="print-meta">'
    + 'Taphad\'Meuh \xb7 Juin 2026<br>'
    + meta1 + '<br>'
    + meta2
    + '</div>'
    + '</div>';
}

/* ── Pied de page commun ── */
function _printDocFooter() {
  return '<div class="print-footer">'
    + 'Taphad\'Meuh \u2014 Application bilingue Fran\u00e7ais \u2194 Afaan Oromoo \xb7 D\u00e9velopp\u00e9 par S\u00e9bastien Godet \xb7 '
    + '<span class="antispam-email">moc.liamg@61tedog.neitsabes</span> \xb7 linkedin.com/in/s\u00e9bastien-godet-142ba6145'
    + '</div>';
}


/* ============================================================
   21a. EXPORT GUIDE (Ecran Home)
   ============================================================ */

function _exportGuide() {
  let isFr = isFrench();
  let primary = isFr ? '#002395' : '#009A44';
  let accent  = isFr ? '#ED2939' : '#EF2B2D';
  let flag    = isFr ? '\ud83c\uddeb\ud83c\uddf7' : '\ud83c\uddea\ud83c\uddf9';
  let langPair = isFr ? 'Fran\u00e7ais \u2194 Afaan Oromoo' : 'Afaan Oromoo \u2194 Fran\u00e7ais';
  let modeLabel = isFr ? 'Mode : Apprendre le Fran\u00e7ais' : 'Mode : Afaan Oromoo Barachuu';

  let bodyEl = document.getElementById('homeGuideBody');
  let sectionsHTML = '';

  if (bodyEl) {
    let details = bodyEl.querySelectorAll('details.hg-section');
    details.forEach((det) => {
      let summaryEl = det.querySelector('.hg-summary');
      let detailEl  = det.querySelector('.hg-detail');
      if (!summaryEl || !detailEl) return;

      let icon  = summaryEl.querySelector('.hg-icon')  ? summaryEl.querySelector('.hg-icon').textContent  : '';
      let label = summaryEl.querySelector('.hg-label') ? summaryEl.querySelector('.hg-label').textContent : '';

      let tempDiv = document.createElement('div');
      tempDiv.innerHTML = detailEl.innerHTML;
      tempDiv.querySelectorAll('a[href="#"]').forEach((a) => {
        a.removeAttribute('href');
        a.removeAttribute('onclick');
      });
      let cleanBody = tempDiv.innerHTML;

      sectionsHTML +=
        '<div class="guide-section">'
        + '<h2>' + icon + ' ' + label + '</h2>'
        + '<div class="guide-body">' + cleanBody + '</div>'
        + '</div>';
    });
  }

  let css = _printBaseCSS(primary, accent)
    + '<style>'
    + '.guide-section{margin-bottom:14pt;padding-bottom:10pt;border-bottom:0.5pt solid #e0e0e0;break-inside:avoid}'
    + '.guide-section:last-child{border-bottom:none}'
    + '.guide-body{margin-top:4pt;font-size:10.5pt;line-height:1.65}'
    + '.guide-body p{margin:3pt 0}'
    + '.guide-body ul{margin:3pt 0 3pt 16pt}'
    + '.guide-body li{margin-bottom:2pt}'
    + '.guide-body .ob-tip{background:#fffde7;border-left:3pt solid #FED141;padding:5pt 8pt;margin:6pt 0;font-size:10pt;border-radius:2pt}'
    + '.guide-body .ob-flow{display:flex;flex-wrap:wrap;gap:4pt;margin:6pt 0;align-items:center}'
    + '.guide-body .ob-flow-step{background:' + primary + ';color:#fff;padding:2pt 7pt;border-radius:10pt;font-size:9pt;font-weight:600}'
    + '.guide-body .ob-flow-arrow{color:' + primary + ';font-weight:700}'
    + '.guide-body .ob-compare{display:grid;grid-template-columns:repeat(2,1fr);gap:6pt;margin:6pt 0}'
    + '.guide-body .ob-compare-col{border:0.5pt solid #ddd;padding:6pt;border-radius:3pt;font-size:9pt}'
    + '.guide-body .ob-compare-head{font-weight:700;color:' + primary + ';margin-bottom:3pt;font-size:9.5pt}'
    + '.guide-body .ob-cascade{margin:6pt 0}'
    + '.guide-body .ob-cascade-row{display:flex;align-items:baseline;gap:6pt;padding:3pt 0;border-bottom:0.5pt solid #f0f0f0;flex-wrap:wrap}'
    + '.guide-body .ob-cascade-badge{font-size:8pt;min-width:70pt}'
    + '.guide-body .ob-cascade-lang{font-weight:600;font-size:9.5pt;min-width:90pt}'
    + '.guide-body .ob-cascade-desc{font-size:9pt;color:#555}'
    + '.guide-body .ob-cascade-example{display:flex;gap:10pt;font-size:8.5pt;padding:2pt 0 2pt 12pt;color:#555;flex-wrap:wrap}'
    + '.guide-body .ob-cascade-example .ob-ex-bad{color:#c0392b}'
    + '.guide-body .ob-cascade-example .ob-ex-good{color:#27ae60}'
    + '.guide-body .ob-audio-block{border:0.5pt solid #e0e0e0;border-radius:3pt;padding:6pt 8pt;margin:5pt 0}'
    + '.guide-body .ob-audio-head{font-weight:700;color:' + primary + ';font-size:10pt;margin-bottom:3pt}'
    + '.guide-body .ob-audio-tip{background:#e8f4fd;padding:4pt 6pt;border-radius:2pt;font-size:8.5pt;margin-top:4pt}'
    + '.guide-body .ob-bio-card{display:flex;align-items:center;gap:8pt;background:#f8f8f8;border-radius:4pt;padding:6pt 8pt;margin-bottom:6pt}'
    + '.guide-body .ob-bio-avatar{font-size:22pt}'
    + '.guide-body .ob-bio-name{font-weight:700;font-size:11pt}'
    + '.guide-body .ob-bio-role{font-size:9pt;color:#555}'
    + '.guide-body .ob-bio-btn{display:inline-block;border:1pt solid ' + primary + ';color:' + primary + ';padding:2pt 7pt;border-radius:3pt;font-size:9pt;margin-right:5pt}'
    + '.guide-body .ob-bio-contact{background:#f5f5f5;border-radius:3pt;padding:6pt;margin-top:6pt}'
    + '.guide-body .ob-bio-contact-title{font-weight:600;margin-bottom:3pt}'
    + 'h2{page-break-after:avoid}'
    + '</style>';

  let html = '<!DOCTYPE html><html lang="' + (isFr ? 'om' : 'fr') + '"><head>'
    + '<meta charset="UTF-8">'
    + '<title>Taphad\'Meuh \u2014 Guide</title>'
    + css
    + '</head><body>'
    + _printDocHeader(
        'Guide Taphad\'Meuh ' + flag,
        langPair,
        modeLabel,
        isFr ? '\ud83c\uddea\ud83c\uddf9 \u2192 \ud83c\uddeb\ud83c\uddf7' : '\ud83c\uddeb\ud83c\uddf7 \u2192 \ud83c\uddea\ud83c\uddf9',
        primary, accent
      )
    + sectionsHTML
    + _printDocFooter()
    + '</body></html>';

  _openPrintWindow(html);
}


/* ============================================================
   21b. EXPORT VOCABULAIRE (Lecon Niveau 1)
   ============================================================ */

function _exportVocab() {
  if (!CT || !CT.words || CT.words.length === 0) {
    _showToast(L('\u26a0\ufe0f Aucun vocabulaire \u00e0 exporter.', '\u26a0\ufe0f Jechoota hin jiran.'), 3000);
    return;
  }

  let keys    = langKeys();
  let primary = isFrench() ? '#002395' : '#009A44';
  let accent  = isFrench() ? '#ED2939' : '#EF2B2D';
  let flag    = isFrench() ? '\ud83c\uddeb\ud83c\uddf7' : '\ud83c\uddea\ud83c\uddf9';
  let title   = _themeTitle(CT);

  let colSrc = isFrench() ? 'Fran\u00e7ais \ud83c\uddeb\ud83c\uddf7' : 'Afaan Oromoo \ud83c\uddea\ud83c\uddf9';
  let colTgt = isFrench() ? 'Afaan Oromoo \ud83c\uddea\ud83c\uddf9' : 'Fran\u00e7ais \ud83c\uddeb\ud83c\uddf7';

  let rows = CT.words.map((w, i) => {
    let mainWord = w[keys.src] || '';
    let subWord  = w[keys.tgt] || '';
    let em       = w.em || '';
    let bg       = (i % 2 === 0) ? '#ffffff' : '#f8f8ff';
    let conjHTML = '';

    if (w.conj && w.conj[keys.src] && w.conj[keys.tgt]) {
      let conjSrc = w.conj[keys.src].join(' \xb7 ');
      let conjTgt = w.conj[keys.tgt].join(' \xb7 ');
      conjHTML = '<div class="conj">'
        + '\u2514 ' + conjSrc + '<br>'
        + '\u2514 ' + conjTgt
        + '</div>';
    }

    return '<tr style="background:' + bg + '">'
      + '<td class="td-num">' + (i + 1) + '</td>'
      + '<td class="td-em">' + em + '</td>'
      + '<td class="td-src"><strong>' + mainWord + '</strong>' + conjHTML + '</td>'
      + '<td class="td-tgt">' + subWord + '</td>'
      + '</tr>';
  }).join('');

  let noteHTML = CT.note
    ? '<div class="vocab-note">\ud83d\udca1 ' + CT.note + '</div>'
    : '';

  let css = _printBaseCSS(primary, accent)
    + '<style>'
    + 'table{width:100%;border-collapse:collapse;margin-top:8pt;font-size:10.5pt}'
    + 'thead tr{background:' + primary + ';color:#fff}'
    + 'th{padding:5pt 7pt;text-align:left;font-weight:600;font-size:10pt}'
    + 'td{padding:4pt 7pt;vertical-align:top;border-bottom:0.5pt solid #ebebeb}'
    + '.td-num{width:18pt;color:#aaa;font-size:9pt;text-align:right;padding-right:5pt}'
    + '.td-em{width:22pt;font-size:14pt;text-align:center}'
    + '.td-src{width:44%}'
    + '.td-tgt{width:44%;color:#444}'
    + '.conj{font-size:8.5pt;color:#777;margin-top:2pt;line-height:1.4}'
    + '.vocab-note{margin-top:10pt;background:#fffde7;border-left:3pt solid #FED141;padding:6pt 10pt;font-size:10pt;border-radius:2pt}'
    + '.stats{font-size:9pt;color:#777;margin-top:5pt;margin-bottom:2pt}'
    + 'tr{break-inside:avoid}'
    + 'thead{display:table-header-group}'
    + '</style>';

  let themeLabel = CT.emoji + ' ' + title.main + ' \u2014 ' + title.sub;

  let html = '<!DOCTYPE html><html lang="' + (isFrench() ? 'om' : 'fr') + '"><head>'
    + '<meta charset="UTF-8">'
    + '<title>Taphad\'Meuh \u2014 ' + title.main + '</title>'
    + css
    + '</head><body>'
    + _printDocHeader(
        themeLabel,
        isFrench() ? 'Module Vocabulaire \u2014 Apprendre le Fran\u00e7ais' : 'Module Vocabulaire \u2014 Afaan Oromoo Barachuu',
        isFrench() ? 'Niveau 1 \u2014 Vocabulaire' : 'Sadarkaa 1 \u2014 Jechota',
        CT.words.length + (isFrench() ? ' mots' : ' jechota'),
        primary, accent
      )
    + '<div class="stats">' + CT.words.length + (isFrench() ? ' entr\u00e9es' : ' warra') + '</div>'
    + '<table>'
    + '<thead><tr>'
    + '<th class="td-num">#</th>'
    + '<th class="td-em"></th>'
    + '<th class="td-src">' + colSrc + '</th>'
    + '<th class="td-tgt">' + colTgt + '</th>'
    + '</tr></thead>'
    + '<tbody>' + rows + '</tbody>'
    + '</table>'
    + noteHTML
    + _printDocFooter()
    + '</body></html>';

  _openPrintWindow(html);
}


/* ============================================================
   21c. EXPORT SITUATION (Lecon Niveau 2 - dialogue)
   ============================================================ */

function _exportSituation() {
  if (!CT || CT.type !== 'dialog' || !CT.situations) {
    _showToast(L('\u26a0\ufe0f Aucune situation \u00e0 exporter.', '\u26a0\ufe0f Haala hin jiru.'), 3000);
    return;
  }

  let sit = CT.situations[sitIdx];
  if (!sit) { _showToast('\u26a0\ufe0f Situation introuvable.', 3000); return; }

  let keys    = langKeys();
  let primary = isFrench() ? '#002395' : '#009A44';
  let accent  = isFrench() ? '#ED2939' : '#EF2B2D';
  let title   = _themeTitle(CT);

  let bubblesHTML = sit.dialogue.map((ln) => {
    let mainText = ln[keys.src] || '';
    let subText  = ln[keys.tgt] || '';
    let isLeft   = (ln.side === 'left');
    return '<tr class="brow ' + (isLeft ? 'bleft' : 'bright') + '">'
      + '<td class="speaker">' + ln.s + '</td>'
      + '<td class="line-src">' + mainText + '</td>'
      + '<td class="line-tgt">' + subText  + '</td>'
      + '</tr>';
  }).join('');

  let vocabHTML = '';
  if (CT.vocab && CT.vocab.length > 0) {
    let vocabRows = CT.vocab.map((v, i) => {
      let parts  = v.split('=');
      let et     = parts[0] ? parts[0].trim() : '';
      let fr     = parts[1] ? parts[1].trim() : '';
      let src    = keys.src === 'et' ? et : fr;
      let tgt    = keys.tgt === 'et' ? et : fr;
      let bg     = (i % 2 === 0) ? '#ffffff' : '#f5fdf5';
      return '<tr style="background:' + bg + '">'
        + '<td class="v-num">' + (i + 1) + '</td>'
        + '<td class="v-src"><strong>' + src + '</strong></td>'
        + '<td class="v-tgt">' + tgt + '</td>'
        + '</tr>';
    }).join('');

    let vColSrc = isFrench() ? 'Fran\u00e7ais \ud83c\uddeb\ud83c\uddf7'     : 'Afaan Oromoo \ud83c\uddea\ud83c\uddf9';
    let vColTgt = isFrench() ? 'Afaan Oromoo \ud83c\uddea\ud83c\uddf9'  : 'Fran\u00e7ais \ud83c\uddeb\ud83c\uddf7';

    vocabHTML = '<h2>' + (isFrench() ? '\ud83d\udcda Jechoota murteessoo' : '\ud83d\udcda Lexique essentiel') + '</h2>'
      + '<table class="vtable">'
      + '<thead><tr>'
      + '<th class="v-num">#</th>'
      + '<th class="v-src">' + vColSrc + '</th>'
      + '<th class="v-tgt">' + vColTgt + '</th>'
      + '</tr></thead>'
      + '<tbody>' + vocabRows + '</tbody>'
      + '</table>';
  }

  let noteHTML = CT.note
    ? '<div class="sit-note">\ud83d\udca1 ' + CT.note + '</div>'
    : '';

  let sitBadge = (CT.situations.length > 1)
    ? '<span class="badge">' + sit.label + '</span> '
    : '';

  let css = _printBaseCSS(primary, accent)
    + '<style>'
    + '.sit-meta{font-size:10.5pt;color:#333;margin:4pt 0 10pt;font-weight:500}'
    + '.scene-icon{font-size:28pt;text-align:center;margin:6pt 0 10pt}'
    + '.sit-note{margin:8pt 0;background:#fffde7;border-left:3pt solid #FED141;padding:6pt 10pt;font-size:10pt;border-radius:2pt}'
    + 'table.dtable{width:100%;border-collapse:collapse;margin:8pt 0;font-size:10.5pt}'
    + 'table.dtable thead tr{background:' + primary + ';color:#fff}'
    + 'table.dtable th{padding:5pt 7pt;text-align:left;font-size:10pt;font-weight:600}'
    + 'table.dtable td{padding:5pt 7pt;vertical-align:top;border-bottom:0.5pt solid #ebebeb}'
    + '.bleft td{background:#eef3ff}'
    + '.bright td{background:#edfff4}'
    + '.speaker{font-weight:700;font-size:9pt;color:' + primary + ';white-space:nowrap;width:54pt}'
    + '.line-src{width:44%;font-weight:500}'
    + '.line-tgt{width:44%;color:#555;font-style:italic;font-size:10pt}'
    + 'table.vtable{width:100%;border-collapse:collapse;margin:6pt 0;font-size:10.5pt}'
    + 'table.vtable thead tr{background:' + primary + ';color:#fff}'
    + 'table.vtable th{padding:5pt 7pt;text-align:left;font-size:10pt;font-weight:600}'
    + 'table.vtable td{padding:4pt 7pt;border-bottom:0.5pt solid #ebebeb}'
    + '.v-num{width:18pt;color:#aaa;font-size:9pt;text-align:right}'
    + '.v-src{width:48%}'
    + '.v-tgt{width:48%;color:#444}'
    + 'tr{break-inside:avoid}'
    + 'thead{display:table-header-group}'
    + 'h2{margin-top:14pt;page-break-after:avoid}'
    + '</style>';

  let sitCount = CT.situations.length > 1
    ? (isFrench()
        ? (sitIdx + 1) + ' sur ' + CT.situations.length + ' situations'
        : (sitIdx + 1) + ' / ' + CT.situations.length + ' haala')
    : '';

  let dColSrc = isFrench() ? 'Fran\u00e7ais \ud83c\uddeb\ud83c\uddf7'    : 'Afaan Oromoo \ud83c\uddea\ud83c\uddf9';
  let dColTgt = isFrench() ? 'Afaan Oromoo \ud83c\uddea\ud83c\uddf9'  : 'Fran\u00e7ais \ud83c\uddeb\ud83c\uddf7';
  let locLabel = isFrench() ? 'Dubbataa' : 'Locuteur';

  let html = '<!DOCTYPE html><html lang="' + (isFrench() ? 'om' : 'fr') + '"><head>'
    + '<meta charset="UTF-8">'
    + '<title>Taphad\'Meuh \u2014 ' + title.main + '</title>'
    + css
    + '</head><body>'
    + _printDocHeader(
        CT.emoji + ' ' + title.main + ' \u2014 ' + title.sub,
        isFrench() ? 'Module Dialogue \u2014 Apprendre le Fran\u00e7ais' : 'Module Dialogue \u2014 Afaan Oromoo Barachuu',
        isFrench() ? 'Niveau 2 \u2014 Dialogue' : 'Sadarkaa 2 \u2014 Dubbii',
        sitCount,
        primary, accent
      )
    + '<div class="sit-meta">' + sitBadge + sit.title + '</div>'
    + '<div class="scene-icon">' + sit.img + '</div>'
    + noteHTML
    + '<h2>' + (isFrench() ? '\ud83d\udcac Maree / Dialogue' : '\ud83d\udcac Dialogue') + '</h2>'
    + '<table class="dtable">'
    + '<thead><tr>'
    + '<th style="width:54pt">' + locLabel + '</th>'
    + '<th>' + dColSrc + '</th>'
    + '<th>' + dColTgt + '</th>'
    + '</tr></thead>'
    + '<tbody>' + bubblesHTML + '</tbody>'
    + '</table>'
    + vocabHTML
    + _printDocFooter()
    + '</body></html>';

  _openPrintWindow(html);
}