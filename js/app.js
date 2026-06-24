/* ============================================================
   Taphad'Meuh 🐄  —  Moteur applicatif unifié
   Français ↔ Afaan Oromoo
   © Juin 2026 – Sébastien Godet · Claude Sonnet 4.6 · Gemini 3.5 Flash 
   Modernisé ES2020 : let/const, fonctions fléchées, for…of
   ============================================================
   ARCHITECTURE (5 fichiers) :
     ├─ index.html   → Structure HTML + launcher
     ├─ style.css    → Thèmes couleur, composants visuels
     ├─ data-fr.js   → ALL_THEMES_FR (contenu — mode Français)
     ├─ data-or.js   → ALL_THEMES_OR (contenu — mode Oromo)
     └─ app.js       → Ce fichier : logique applicative complète

   SECTIONS DE CE FICHIER :
     1.  Variables d'état globales (let/const)
     2.  Point d'entrée — initApp(mode)
     3.  Synthèse vocale + prononciation Oromo (cascade de voix)
     3b. Retour haptique — _vibrateFeedback()
     3c. Interruption audio — visibilitychange / focus
     4.  Persistance de la progression (système d'étoiles ⭐)
     4b. Restauration de session quiz (sessionStorage)
     4c. Réinitialisation complète — confirmResetProgress()
     5.  Navigation entre écrans
     6.  Écran Home — rendu de la barre de progression
     7.  Écran Sections — grille des thèmes
     8.  Ouverture d'un thème (écran Lesson + onglets)
     9.  Cartes Flash — vocabulaire interactif
    10.  Quiz 10 questions — avec étoiles progressives
    11.  Dialogue — scènes de situation
    12.  Vocabulaire — lexique visuel cliquable
    13.  Quiz Dialogue — questions sur le dialogue
    13b. Onglet Répète — reconnaissance vocale (Speech Recognition)
    14.  Utilitaires & chaînes de résultats bilingues
    15.  Initialisation du launcher
    16.  Accessibilité clavier
    17.  Guide utilisateur — Onboarding (première visite par mode)
    18.  Crédits — showCredits()
    19.  Spinner de chargement des données
    20.  Enregistrement du Service Worker (PWA / Hors-ligne)
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

  _loadDataScript(dataFile, function() {
    /* Callback : données disponibles en mémoire → finaliser l'initialisation */

    /*
      REFACTORING (Archi) : les deux blocs if/else identiques avec _setUI()
      sont fusionnés en un seul appel, chaque valeur étant sélectionnée via L().
      Avantage : ajouter un libellé = 1 ligne au lieu de 2.
    */
    ALL_THEMES = isFrench() ? ALL_THEMES_FR : ALL_THEMES_OR;

    _setUI({
      homeTitle      : L('Apprendre le Français',  'Afaan Oromoo barachuu'),
      homeStartBtn   : L('▶ Commencer',             '▶ Jalqabi'),
      sectionsBackBtn: L('← Retour',               '← Gara duubaatti'),
      sectionsTitle  : L('📚 Modules',              '📚 Moojuulota'),
      lessonBackBtn  : L('← Modules',              '← Moojuulota'),
      level1Badge    : '1',
      level1Label    : L('Niveau 1 — Vocabulaire',  'Sadarkaa 1 — Jechoota'),
      level2Badge    : '2',
      level2Label    : L('Niveau 2 — Phrases simples', 'Sadarkaa 2 — Himoota salphaa')
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
  _setText('level1Badge',     t.level1Badge);
  _setText('level1Label',     t.level1Label);
  _setText('level2Badge',     t.level2Badge);
  _setText('level2Label',     t.level2Label);

  /* Le bouton "Démarrer" sur l'écran home ouvre l'écran sections */
  let btn = document.getElementById('homeStartBtn');
  if (btn) btn.onclick = function() { showScreen('sections-level1'); };

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
  /* Textes bilingues des liens footer */
  let lblCredits = L('Remerciements',   'Galateeffannaa');
  let lblHelp    = L('Aide',            'Gargaarsa');
  let lblCopy    = L(
    '© Juin 2026 – Développé par Sébastien Godet · Assisté par IA Claude Sonnet 4.6 et Gemini 3.5 Flash',
    '© Waxabajjii 2026 – Kan Sébastien Godet tolche · AI Claude Sonnet 4.6 fi Gemini 3.5 Flash gargaaramee'
  );

  let html =
    lblCopy + '<br>' +
    '<button id="btn-copy-email" class="antispam-btn" onclick="openAndCopyEmail()"><span class="antispam-email">moc.liamg@61tedog.neitsabes</span></button> · ' +
    '<a href="https://www.linkedin.com/in/s%C3%A9bastien-godet-142ba6145" target="_blank">LinkedIn</a> · ' +
    '<a href="#" onclick="showCredits()">' + lblCredits + '</a> · ' +
    '<a href="#" onclick="showOnboardingGuide()">' + lblHelp + '</a>';

  let ids = ['homeFooter', 'sectionsFooter'];
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }
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

    for (let i = 0; i < priorities.length; i++) {
      let target = priorities[i];
      let match = voices.find((v) => {
        return v.lang.toLowerCase().indexOf(target.lang.split('-')[0].toLowerCase()) !== -1;
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

  /* Si les voix ne sont pas encore chargées, on attend l'événement 'voiceschanged' */
  if (!search()) {
    speechSynthesis.addEventListener('voiceschanged', function h() {
      speechSynthesis.removeEventListener('voiceschanged', h);
      search();
      callback(_oromoVoice);
    });
  }
}

/**
 * Point d'entrée unique pour la lecture audio d'un texte.
 * Redirige vers la cascade Oromo ou la lecture française standard.
 * Gère les textes multiples séparés par " / " (pause de 2s entre chaque).
 * @param {string} txt - Texte à lire (peut contenir " / " comme séparateur)
 */
function speak(txt) {
  if (!txt) return;

  if (currentMode === 'learn_oromo') {
    if (!window.speechSynthesis) return;

    _resolveOromoVoice(function(voice) {
      speechSynthesis.cancel();
      let parts = txt.split('/').map((p) => p.trim()).filter(Boolean);

      function speakPart(i) {
        if (i >= parts.length) return;
        let u = new SpeechSynthesisUtterance(parts[i]);
        if (voice) {
          u.voice = voice;
          u.lang  = voice.lang;
        }
        u.rate  = 0.85;  // Légèrement ralenti pour faciliter la compréhension
        u.onend = function() {
          if (i + 1 < parts.length) setTimeout(() => { speakPart(i + 1); }, 2000);
        };
        speechSynthesis.speak(u);
      }

      speakPart(0);
    });

  } else {
    /* Mode learn_french : lecture standard en français */
    _doSpeak(txt, null, 0.80);
  }
}

/**
 * Lit un texte avec la Web Speech API, en gérant les parties séparées par " / ".
 * Fonction interne utilisée pour le français (voix et langue déjà connues).
 * @param {string} txt      - Texte à lire
 * @param {SpeechSynthesisVoice|null} voiceObj - Voix à utiliser (null = voix par défaut)
 * @param {number} rate     - Vitesse de lecture (0.1 à 10)
 */
function _doSpeak(txt, voiceObj, rate) {
  speechSynthesis.cancel();
  let parts = txt.split('/').map((p) => p.trim()).filter(Boolean);

  function speakPart(i) {
    if (i >= parts.length) return;
    let u  = new SpeechSynthesisUtterance(parts[i]);
    u.lang = voiceLang;
    u.rate = rate;
    if (voiceObj) u.voice = voiceObj;
    u.onend = function() {
      if (i + 1 < parts.length) setTimeout(() => { speakPart(i + 1); }, 2000);
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
    let p = document.createElement('div');
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

   Clé : 'quiz_session' — valeur JSON :
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
const SESSION_KEY = 'quiz_session';

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
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  } catch(e) { /* session privée ou quota dépassé : on ignore */ }
}

/**
 * Tente de restaurer une session quiz interrompue depuis sessionStorage.
 * Retourne true si une session a été restaurée et affichée, false sinon.
 * @returns {boolean}
 */
function _restoreQuizSession() {
  try {
    let raw = sessionStorage.getItem(SESSION_KEY);
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
  try { sessionStorage.removeItem(SESSION_KEY); } catch(e) {}
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

  /* Cacher la nav sur le launcher */
  if (screenId === 'app-launcher') {
    nav.classList.remove('visible');
    return;
  }
  nav.classList.add('visible');

  /* Mettre à jour les libellés bilingues de la nav */
  _setText('navLabelModules', L('Modules', 'Kutaalee'));
  _setText('navLabelGuide',   L('Guide',   'Gargaarsa'));
  _setText('navLabelLang',    L('Langue',  'Afaan'));
  _setText('navLabelCredits', L('Merci',   'Galata'));

  let langFlag = document.getElementById('navLangFlag');
  if (langFlag) langFlag.textContent = L('🇫🇷', '🇪🇹');

  /* Activer le bon bouton */
  ['navBtnModules','navBtnGuide','navBtnLang','navBtnCredits'].forEach((id) => {
    let el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });
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
      : L('▶ Commencer', '▶ Jalqabi');
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

  /* ── Libellés de niveau bilingues ── */
  let lbl1 = L('Niveau 1 — Vocabulaire',     'Sadarkaa 1 — Jechoota');
  let lbl2 = L('Niveau 2 — Phrases simples', 'Sadarkaa 2 — Himoota salphaa');

  /* ── Helper : remplir les éléments d'un header de sections ── */
  function _fillHeader(suffix) {
    let s = suffix || '';
    _setText('sectionsTitle' + s,   L('📚 Modules', '📚 Moojuulota'));
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

  /* ── Remplir les libellés des onglets de niveau (4 groupes : A, B, et les originaux) ── */
  ['', 'A', 'B'].forEach((sfx) => {
    _setText('level1Badge' + sfx, '1');
    _setText('level1Label' + sfx, lbl1);
    _setText('level2Badge' + sfx, '2');
    _setText('level2Label' + sfx, lbl2);
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
    badge.onclick = function() {
      let target = CT.level === 2 ? 'sections-level2' : 'sections-level1';
      renderSections(CT.level);
      showScreen(target, 'back');
    };
  }

  /* Mémoriser le niveau du thème ouvert pour le retour et les flèches */
  _currentThemeLevel = CT.level;
  /* Si déjà sur l'écran lesson (navigation prev/next), rafraîchir sans transition.
     Sinon, animer avec la direction fournie par l'appelant (ou 'forward' par défaut). */
  const _alreadyInLesson = document.getElementById('lesson').classList.contains('active');
  if (_alreadyInLesson) {
    _updateLessonNavArrows();
  } else {
    showScreen('lesson', dir || 'forward');
    _updateLessonNavArrows();
  }

  /* ── Construction des onglets selon le type de thème ── */
  let tabs;
  if (CT.type === 'dialog') {
    tabs = [
      { k: 'dialog', lbl: L('💬 Maree',    '💬 Dialogue')   },
      { k: 'vocab',  lbl: L('📚 Jechoota', '📚 Vocabulaire') },
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
     plutôt que par style.display inline, pour respecter le système CSS. */
  let btnVocab = document.getElementById('lessonExportVocab');
  let btnSit   = document.getElementById('lessonExportSit');
  if (btnVocab && btnSit) {
    if (CT.type === 'dialog') {
      btnVocab.classList.add('is-hidden');
      btnSit.classList.remove('is-hidden');
      btnSit.textContent = L('\ud83d\udcc4 Galmee haala kana buusi', '\ud83d\udcc4 Télécharger cette situation');
    } else {
      btnSit.classList.add('is-hidden');
      btnVocab.classList.remove('is-hidden');
      btnVocab.textContent = L('\ud83d\udcc4 Moojuula kana buusi', '\ud83d\udcc4 Télécharger ce module');
    }
  }

  switchTab(tabs[0].k);
}

/**
 * Active un onglet et déclenche le rendu du contenu correspondant.
 * @param {'flash'|'quiz10'|'dialog'|'vocab'|'dquiz'|'repeat'} tab
 */
function switchTab(tab) {
  document.querySelectorAll('#lessonTabs .tab').forEach((b) => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });

  /* Arrêter toute reconnaissance vocale en cours si on quitte l'onglet Répète */
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
    + '<div style="text-align:center;margin-top:10px;">'
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
 * @param {string} s
 * @returns {string}
 */
function _normalizeRepeat(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // supprime les diacritiques
    .replace(/[^a-z0-9\s']/g, ' ')   // ponctuation → espace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Teste si la transcription contient le mot attendu (tolérance partielle :
 * le mot attendu doit apparaître quelque part dans la transcription,
 * ce qui absorbe les mots parasites courants du speech-to-text).
 * @param {string} transcript
 * @param {string} expected
 * @returns {boolean}
 */
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
  /* Garantir que b est la chaîne la plus courte (économie mémoire) */
  if (a.length < b.length) { const tmp = a; a = b; b = tmp; }
  let prev = [];
  let curr = [];
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let k = 1; k <= b.length; k++) {
      let cost = (a[i - 1] === b[k - 1]) ? 0 : 1;
      curr[k] = Math.min(
        curr[k - 1] + 1,        /* insertion */
        prev[k]     + 1,        /* suppression */
        prev[k - 1] + cost      /* substitution */
      );
    }
    let swap = prev; prev = curr; curr = swap;
  }
  return prev[b.length];
}

function _matchRepeat(transcript, expected) {
  let t = _normalizeRepeat(transcript);
  let e = _normalizeRepeat(expected);

  /* Correspondance exacte ou le mot attendu est contenu dans la transcription */
  if (t === e || t.indexOf(e) !== -1) return true;

  /* Mots très courts (≤ 3 car) : pas de tolérance pour éviter les faux positifs */
  if (e.length <= 3) return t === e;

  /*
    Tolérance Levenshtein : on accepte si la distance normalisée est ≤ 25 %.
    Exemples avec seuil 25% :
      "bonjour" (7) → tolère jusqu'à 1 faute  (7 × 0.25 = 1.75 → floor 1)
      "au revoir" (8) → tolère jusqu'à 2 fautes
      "enchanté" (8) → "enchante" (sans accent) → distance 1 → ✅
    On teste aussi chaque mot de la transcription séparément, ce qui absorbe
    les mots parasites que le STT ajoute souvent en début ou fin de phrase.
  */
  let threshold = Math.floor(e.length * 0.25);
  if (threshold < 1) threshold = 1;

  /* Test sur la transcription entière d'abord */
  if (_levenshtein(t, e) <= threshold) return true;

  /* Test mot par mot dans la transcription (absorbe les "euh", "et", etc.) */
  let words = t.split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    if (_levenshtein(words[i], e) <= threshold) return true;
  }

  return false;
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

    r.onerror = function(e) {
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

    r.onstart = function() {
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

  _repeatRecognizer.onresult = function(e) {
    let transcripts = [];
    for (let i = 0; i < e.results[0].length; i++) {
      transcripts.push(e.results[0][i].transcript);
    }
    _handleRepeatResult(transcripts, item.word);
  };

  _repeatRecognizer.onerror = function(e) {
    _resetMicBtn();
    let fbEl2 = document.getElementById('repeat-feedback');
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

  _repeatRecognizer.onend = function() {
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
 * Construit et injecte le contenu du Guide dans l'écran #home.
 * Appelée par initApp() et showOnboardingGuide().
 */
function _buildHomeGuide() {
  let isFr = isFrench();
  /*
   * CONVENTION DE LANGUE DU GUIDE :
   * isFr = true  → mode learn_french → apprenant OROMOPHONE → guide en OROMO
   * isFr = false → mode learn_oromo  → apprenant FRANCOPHONE → guide en FRANÇAIS
   * Règle : langue du guide = langue maternelle de l'apprenant
   *         = langue INVERSE de ce qu'il apprend.
   * Dans chaque ternaire : isFr ? texte_OROMO : texte_FRANÇAIS
   */

  /* ── Flags dans l'en-tête ── */
  let flagsEl = document.getElementById('homeGuideFlagsRow');
  if (flagsEl) flagsEl.textContent = isFr ? '🇪🇹 → 🇫🇷' : '🇫🇷 → 🇪🇹';

  /* ── Titre & sous-titre ── */
  let titleEl = document.getElementById('homeTitle');
  if (titleEl) titleEl.textContent = isFr
    ? 'Afaan Faransaayii barachuu 🇫🇷'   /* oromophone apprend le français */
    : "Apprendre l'Oromo 🇪🇹";            /* francophone apprend l'oromo */

  let subEl = document.getElementById('homeGuideSubtitle');
  if (subEl) subEl.textContent = isFr
    ? "App bilisaa — calqalbaa irraa jalqabuuf ta'e · Application gratuite pour débutants"
    : 'App gratuite — idéale pour débuter depuis zéro · Bilisaa, duruma irraa';

  /* ── Badges de fonctionnalités ── */
  let badgesEl = document.getElementById('homeGuideBadges');
  if (badgesEl) {
    let badges = isFr
      /* Badges en oromo (pour l'apprenant oromophone) */
      ? ['\u2705 Bilisaa', '\ud83d\udea7 Galmee malee', '\ud83d\udcf1 Bilbila & Kompiyuutara', '\ud83d\udd0a Sagalee', '\ud83c\udfa4 Irra deeb\u02bci', '\ud83d\udcf2 Interneetii malee']
      /* Badges en français (pour l'apprenant francophone) */
      : ['\u2705 100% Gratuit', '\ud83d\udea7 Sans inscription', '\ud83d\udcf1 Mobile & Bureau', '\ud83d\udd0a Audio inclus', '\ud83c\udfa4 Répétition orale', '\ud83d\udcf2 Hors-ligne'];
    badgesEl.innerHTML = badges.map((b) => {
      return '<span class="hg-badge">' + b + '</span>';
    }).join('');
  }

  /* ── Accordéons ── */
  let sections = [
    {
      icon : '🗺️',
      title: isFr ? 'Appiin keessa akkamiin deemna' : "Comment ça marche",
      body : isFr
        /* Oromo : apprenant oromophone */
        ? '<p>Appiin kun <strong>afaan lama</strong> — Oromoo fi Faransaayii — walitti fiduuf hojjetame. Sadarkaa lamaan irratti hojjeta :</p>'
          + '<ul>'
          + '<li>📚 <strong>Sadarkaa 1 — Jechota (32)</strong> : Kaardota, Jechootaa, Quiz, Irra deebʼi</li>'
          + '<li>💬 <strong>Sadarkaa 2 — Dubbii (16)</strong> : Haala jireenya dhugaa keessatti fayyadamuu</li>'
          + '</ul>'
          + '<div class="ob-flow">'
          + '<span class="ob-flow-step">🚀 Jalqabaa</span>'
          + '<span class="ob-flow-arrow">→</span>'
          + '<span class="ob-flow-step">📚 Moojuulota</span>'
          + '<span class="ob-flow-arrow">→</span>'
          + '<span class="ob-flow-step">🃏 Kaardota</span>'
          + '<span class="ob-flow-arrow">→</span>'
          + '<span class="ob-flow-step">🎯 Quiz</span>'
          + '<span class="ob-flow-arrow">→</span>'
          + '<span class="ob-flow-step">⭐ Urjii</span>'
          + '</div>'
          + '<p>Fuula <strong>Gargaarsa</strong> kun jalqaba hunda ni mulʼata — "Kaʼumsa irratti hin agarsiifin" cuqaasi hanqisuuf.</p>'
          + '<div class="ob-tip">💡 Sadarkaa 1 irraa jalqabi — booda sadarkaa 2 salphaa taʼa !</div>'
        /* Français : apprenant francophone */
        : '<p>Cette appli vous guide pas à pas pour apprendre l\'Oromo, à votre rythme, sans inscription ni abonnement.</p>'
          + '<p>Elle est organisée en <strong>deux niveaux</strong> :</p>'
          + '<ul>'
          + '<li>📚 <strong>Niveau 1 — Vocabulaire (32 thèmes)</strong> : Cartes Flash, Lexique, Quiz, Répétition orale</li>'
          + '<li>💬 <strong>Niveau 2 — Dialogues (16 mises en situation)</strong> : scènes de la vie réelle à écouter, comprendre et répéter</li>'
          + '</ul>'
          + '<div class="ob-flow">'
          + '<span class="ob-flow-step">🚀 Lancement</span>'
          + '<span class="ob-flow-arrow">→</span>'
          + '<span class="ob-flow-step">📚 Modules</span>'
          + '<span class="ob-flow-arrow">→</span>'
          + '<span class="ob-flow-step">🃏 Cartes</span>'
          + '<span class="ob-flow-arrow">→</span>'
          + '<span class="ob-flow-step">🎯 Quiz</span>'
          + '<span class="ob-flow-arrow">→</span>'
          + '<span class="ob-flow-step">⭐ Étoiles</span>'
          + '</div>'
          + '<p>Ce <strong>Guide</strong> s\'affiche à chaque visite — cochez "Ne plus afficher" pour le passer à l\'avenir.</p>'
          + '<div class="ob-tip">💡 Commencez par le Niveau 1 — les dialogues du Niveau 2 seront plus faciles ensuite !</div>'
    },
    {
      icon : '⭐',
      title: isFr ? 'Faayidaawwan Appii kanaatii' : 'Points forts de cette appli',
      body : isFr
        /* Oromo */
        ? '<ul>'
          + '<li>✅ <strong>Bilisaa guutuu</strong> — gatii hin kaffaltu, galmee hin barbaachisu</li>'
          + '<li>📵 <strong>Interneetii malee</strong> — buufadhu, iddoo kamittiyyuu baradhu</li>'
          + '<li>📚 <strong>Qabiyyee guddaa</strong> — jechota 32 + dubbii 16 (waliigala 48)</li>'
          + '<li>🔊 <strong>Sagalee dhaggeeffachuu</strong> — jechoota dhaggeeffachuuf caancala 🔊 cuqaasi</li>'
          + '<li>🎤 <strong>Dubbii shaakali</strong> — onglet Irra deebʼi maaykiroofoonii fayyadama</li>'
          + '<li>⭐ <strong>Tartiiba urjii</strong> — madaala keessan kan darbee ni eegama, hir\'atu hin beeku</li>'
          + '</ul>'
          + '<div class="ob-tip">💡 Appiin kun meeshaa tokkicha hin taʼu — Duolingo fi barsiisaa waliin itti fayyadami !</div>'
        /* Français */
        : '<ul>'
          + '<li>💸 <strong>100% gratuit</strong> — aucun abonnement, aucune publicité</li>'
          + '<li>🚫 <strong>Sans inscription</strong> — ouvrez l\'app et commencez immédiatement</li>'
          + '<li>🗂️ <strong>Vocabulaire structuré</strong> — 32 thèmes + 16 dialogues, du plus simple au plus complexe</li>'
          + '<li>🔊 <strong>Audio intégré</strong> — écoutez chaque mot prononcé d\'un simple tap</li>'
          + '<li>🎤 <strong>Répétition orale</strong> — l\'onglet <em>Répète</em> analyse votre prononciation en temps réel</li>'
          + '<li>📴 <strong>Hors-ligne</strong> — installez l\'app sur votre écran d\'accueil et apprenez sans connexion</li>'
          + '<li>⭐ <strong>Progression sauvegardée</strong> — vos étoiles ne diminuent jamais, votre meilleur score est conservé</li>'
          + '</ul>'
          + '<div class="ob-tip">💡 Cette appli n\'est pas un outil unique — combinez-la avec Duolingo, un cours ou des amis natifs pour progresser plus vite !</div>'
    },
    {
      icon : '\ud83c\udccf',
      title: isFr ? 'Kaardota (Cartes Flash)' : 'Les Cartes Flash',
      body : isFr
        ? '<p>Kaardni tokko jecha Faransaayii agarsiisa. <strong>Cuqaasi</strong> sagalee dhageeffachuu fi hiika Oromoo argachuuf.</p>'
          + '<ul>'
          + '<li>\ud83d\udd0a : sagalee dhageeffadhu · \u2039 \u203a : kaardii itti aanu yookiin kan darbee · Kaardiin <strong>garagalti</strong>.</li>'
          + '</ul>'
          + '<div class="ob-tip">\ud83d\udca1 Dura sagalee dhageeffadhu, booda Quiz gali !</div>'
        : '<p>Chaque carte montre un mot en Oromo. <strong>Tapez dessus</strong> pour voir la traduction française et entendre la prononciation.</p>'
          + '<ul>'
          + '<li>\ud83d\udd0a : écouter le mot · \u2039 \u203a : carte suivante/précédente · La carte se <strong>retourne</strong>.</li>'
          + '</ul>'
          + '<div class="ob-tip">\ud83d\udca1 Écoutez plusieurs fois avant de passer au Quiz !</div>'
    },
    {
      icon : '\ud83c\udfaf',
      title: isFr ? 'Quiz fi Urjiin \u2b50' : 'Le Quiz et les Étoiles \u2b50',
      body : isFr
        ? '<p>Kaardota booda <strong>Quiz gaafii 10</strong>. Deebii sirrii 4 keessaa tokko filadhu.</p>'
          + '<ul>'
          + '<li>\u2b50 : \u2265 50% darbe !  · \u2b50\u2b50 : \u2265 75%  · \u2b50\u2b50\u2b50 : 100% \ud83c\udf89</li>'
          + '</ul>'
          + '<p>Urjiilee <strong>hir\'atan hin beekani</strong> — madaala gaarii ta\'e qofti yaadatama.</p>'
          + '<div class="ob-tip">\ud83d\udca1 Madaali keessan \u2b50 fuula Moojuulota irraa mul\'ata.</div>'
        : '<p><strong>Quiz 10 questions</strong> après les cartes. Choisissez la bonne réponse parmi 4 options.</p>'
          + '<ul>'
          + '<li>\u2b50 : \u2265 50% \u2192 module validé !  · \u2b50\u2b50 : \u2265 75%  · \u2b50\u2b50\u2b50 : 100% \ud83c\udf89</li>'
          + '</ul>'
          + '<p>Les étoiles ne <strong>diminuent jamais</strong> — votre meilleur score est conservé.</p>'
          + '<div class="ob-tip">\ud83d\udca1 Votre score total \u2b50 est visible en haut de l\'écran Modules.</div>'
    },
    {
      icon : '\ud83d\udcd6',
      title: isFr ? 'Jechootaa (Vocabulaire)' : 'L\'onglet Vocabulaire',
      body : isFr
        /* Oromo */
        ? '<p>Cimdii <strong>Jechootaa</strong> — jechota moojuulaa tarree keessatti agarsiisa, yeroo hundaa ilaaluuf.</p>'
          + '<ul>'
          + '<li>Jecha tokko irratti cuqaasi — sagalee dhageeffatta.</li>'
          + '<li>Jechoonni Oromoo fi Faransaayii waliin ni mul\'atu.</li>'
          + '<li>Kaardota fi Quiz caalaa salphaa — irra deebi\'uuf gaarii.</li>'
          + '</ul>'
          + '<div class="ob-tip">💡 Jechootaa irraa jalqabuun ni danda\'ama — booda Kaardota fi Quiz gali !</div>'
        /* Français */
        : '<p>L\'onglet <strong>Vocabulaire</strong> affiche tous les mots du module sous forme de liste, consultable à tout moment.</p>'
          + '<ul>'
          + '<li>Tapez sur un mot pour l\'entendre prononcé.</li>'
          + '<li>Chaque entrée affiche le mot en Oromo et sa traduction française côte à côte.</li>'
          + '<li>Plus rapide que les cartes — idéal pour réviser avant un quiz.</li>'
          + '</ul>'
          + '<div class="ob-tip">💡 Utilisez le Vocabulaire comme aide-mémoire entre deux sessions !</div>'
    },
    {
      icon : '\ud83d\udcac',
      title: isFr ? 'Dubbii — Sadarkaa 2' : 'Les Dialogues — Niveau 2',
      body : isFr
        /* Oromo */
        ? '<p>Moojuulota Sadarkaa 2 keessa <strong>haalli jireenya dhugaa</strong> jira — gurgurtaa, hospitaala, masaraa xiyyaaraa fi kkf.</p>'
          + '<ul>'
          + '<li>Haaloota hedduu (<em>Sit. 1, Sit. 2…</em>) — ongletota irraa filanna.</li>'
          + '<li>Bubbulliiwwan lama ni mullatu — 🔵 bitaa fi 🟢 mirga — nama lama gidduutti dubbii.</li>'
          + '<li>Caancala 🔊 cuqaasi — hirmaataa dubbisu dhageeffadhu.</li>'
          + '<li>Cimdii <strong>Jechootaa</strong> : jechota murteessoo dubbii sanaa.</li>'
          + '<li>Cimdii <strong>Quiz</strong> : gaafii dubbii irratti of-qori.</li>'
          + '</ul>'
          + '<div class="ob-tip">💡 Dura Sadarkaa 1 xumuruun gaarii — jechonni Sadarkaa 2 keessatti ni mul\'atu !</div>'
        /* Français */
        : '<p>Les modules du Niveau 2 proposent des <strong>mises en situation réelles</strong> — marché, hôpital, aéroport, etc.</p>'
          + '<ul>'
          + '<li>Plusieurs situations par thème (<em>Sit. 1, Sit. 2…</em>) — naviguez via les onglets en haut.</li>'
          + '<li>Deux bulles de dialogue — 🔵 gauche et 🟢 droite — représentent les deux interlocuteurs.</li>'
          + '<li>Cliquez sur 🔊 pour écouter chaque réplique prononcée.</li>'
          + '<li>Onglet <strong>Vocabulaire</strong> : les mots-clés du dialogue.</li>'
          + '<li>Onglet <strong>Quiz</strong> : questions de compréhension sur le dialogue.</li>'
          + '</ul>'
          + '<div class="ob-tip">💡 Conseil : lisez d\'abord le dialogue entier, puis écoutez-le, puis jouez le Quiz !</div>'
    },
    {
      icon : '\ud83d\udd0a',
      title: isFr ? 'Sagalee qindeessuu (Synthèse Vocale)' : 'Configurer l\'audio',
      body : isFr
        /* Oromo — version concise */
        ? '<p>Sagalee sirriitti dhageeffachuun barachuu keessatti barbaachisaa dha. Appiin kun <strong>sagalee browser yookiin bilbila kee</strong> (Web Speech API) fayyadama.</p>'
          + '<p>🤖 <strong>Android</strong> : Qindaa\'inaa → Gargaarsa → Sagalee uumamaa → Google TTS filadhu, sagalee buufadhu.</p>'
          + '<p>🍎 <strong>iPhone/iPad</strong> : Qindaa\'inaa → Gargaarsa → Sagalee dubbisuu → Sagalee → afaan filadhu, ⬇️ cuqaasi.</p>'
          + '<p>💻 <strong>Kompiyuutara</strong> : Chrome yookiin Edge fayyadami — sagalee gaarii qabdu.</p>'
          + '<div class="ob-tip">💡 Sagalee dhaabbataan yoo hin hojjenne — meeshaa kee gargaarsa barbaadi yookiin support Google/Apple quunnamaa.</div>'
        /* Français — guide complet */
        : '<p>Bien entendre les mots, c\'est essentiel ! L\'appli utilise la <strong>synthèse vocale intégrée</strong> à votre téléphone ou navigateur (Web Speech API). Si le son est absent, robotique ou dans la mauvaise langue, suivez le guide ci-dessous.</p>'
          /* Android */
          + '<div class="ob-audio-block">'
          + '<div class="ob-audio-head">\ud83e\udd16 Android</div>'
          + '<ol>'
          + '<li>Ouvrez <strong>Paramètres → Accessibilité → Synthèse vocale</strong> (ou cherchez « synthèse » dans la barre de recherche).</li>'
          + '<li>Dans <em>Moteur préféré</em>, choisissez <strong>Google Text-to-Speech</strong> et mettez-le à jour dans le Play Store.</li>'
          + '<li>Appuyez sur ⚙️ → <em>Installer les données vocales</em> → téléchargez la voix <strong>Français (France)</strong>.</li>'
          + '<li>Revenez dans l\'appli et <strong>actualisez la page</strong>.</li>'
          + '</ol>'
          + '<div class="ob-audio-tip">\ud83d\udca1 Sur Samsung : Paramètres → Accessibilité → TTS. Les voix supplémentaires se téléchargent depuis ce même menu.</div>'
          + '</div>'
          /* iOS */
          + '<div class="ob-audio-block">'
          + '<div class="ob-audio-head">\ud83c\udf4e iPhone / iPad (iOS)</div>'
          + '<ol>'
          + '<li>Ouvrez <strong>Réglages → Accessibilité → Contenu énoncé → Voix</strong>.</li>'
          + '<li>Sélectionnez la langue cible, choisissez une voix et appuyez sur \u2b07\ufe0f pour la télécharger en qualité <em>Améliorée</em>.</li>'
          + '<li>Ouvrez l\'appli dans <strong>Safari</strong> (recommandé sur iOS) et tapez une première fois sur \ud83d\udd0a — iOS demande une interaction avant d\'autoriser l\'audio.</li>'
          + '<li>Si rien ne sort, vérifiez que le <strong>bouton silencieux</strong> (interrupteur sur le côté) est bien désactivé.</li>'
          + '</ol>'
          + '<div class="ob-audio-tip">\ud83d\udca1 L\'onglet 🎤 Répète n\'est disponible que sur Safari iOS 14.5+ et Chrome Android — pas sur Firefox mobile.</div>'
          + '</div>'
          /* PC */
          + '<div class="ob-audio-block">'
          + '<div class="ob-audio-head">\ud83d\udcbb Ordinateur (Windows / Mac)</div>'
          + '<ol>'
          + '<li><strong>Chrome ou Edge</strong> sont recommandés — ils embarquent de bonnes voix et supportent la reconnaissance vocale.</li>'
          + '<li><strong>Windows</strong> : Paramètres → Heure et langue → Parole → Ajouter des voix → installez <em>Français (France)</em>.</li>'
          + '<li><strong>Mac</strong> : Préférences Système → Accessibilité → Contenu parlé → Voix système → téléchargez <em>Thomas (FR)</em>.</li>'
          + '<li>Redémarrez le navigateur après l\'installation — les nouvelles voix sont détectées au chargement.</li>'
          + '</ol>'
          + '</div>'
          /* Support */
          + '<div class="ob-audio-block">'
          + '<div class="ob-audio-head">\ud83c\udd98 Toujours un problème ?</div>'
          + '<p>Si l\'audio ne fonctionne toujours pas, le problème vient probablement d\'un réglage spécifique à votre modèle. Les équipes support peuvent vous aider :</p>'
          + '<p style="margin:.4em 0">'
          + '\ud83e\udd16 <a href="https://support.google.com/accessibility/android" target="_blank" rel="noopener">Support Google / Android</a> · '
          + '\ud83c\udf4e <a href="https://support.apple.com" target="_blank" rel="noopener">Support Apple</a> · '
          + '\ud83d\udcf1 <a href="https://www.samsung.com/fr/support/" target="_blank" rel="noopener">Support Samsung</a> · '
          + '\ud83d\udcbb <a href="https://support.microsoft.com" target="_blank" rel="noopener">Support Microsoft</a>'
          + '</p>'
          + '<p>Pour tout autre fabricant (Xiaomi, Oppo, OnePlus…), recherchez <em>« synthèse vocale + [nom de votre téléphone] »</em> sur le site officiel du fabricant.</p>'
          + '</div>'
    },
    {
      icon : '\ud83c\udfa7',
      title: isFr ? 'Sagalee Oromoo — Tartiiba Sagalee' : 'L\'audio en Oromo : la Cascade de Voix',
      body : isFr
        /* Oromo — version concise */
        ? '<p>Afaan Oromoo qubee Latin (Qubee) fayyadama. Sagaleen Oromoo meeshaalee hedduurratti hin argamtu — kanaaf appiin kun <strong>sagalee walii galaa sirriitti dubbisu</strong> barbaacha hojjeta.</p>'
          + '<p>Sagalee Oromoo yoo dhabame, appiin sagalee biraa filataa :<br>'
          + '🟢 Oromoo → 🔵 Somali → 🟡 Amharic → 🟠 Swahili → 🔴 Español</p>'
          + '<div class="ob-tip">\ud83d\udca1 Sagalee jalqaba cuqaastu yeroo, banneerri xiqqaan maal sagalee hojjetaa jiruu ni agarta.</div>'
        /* Français — version complète */
        : '<p>L\'Oromo (Afaan Oromoo) s\'écrit avec l\'alphabet latin (le Qubee). Comme la voix native Oromo n\'est pas encore préinstallée sur tous les appareils, l\'application utilise un <strong>système intelligent de cascade phonétique</strong> — si le niveau 1 est absent, elle descend automatiquement au suivant.</p>'
          /* cascade visuelle */
          + '<div class="ob-cascade">'
          /* P1 Oromo */
          + '<div class="ob-cascade-row ob-cascade-p1">'
          + '<span class="ob-cascade-badge">🟢 Priorité 1</span>'
          + '<span class="ob-cascade-lang">\ud83c\uddea\ud83c\uddf9 Oromo <code>[om-ET]</code></span>'
          + '<span class="ob-cascade-desc">L\'idéal absolu — prononciation 100% authentique</span>'
          + '</div>'
          /* P2 Somali */
          + '<div class="ob-cascade-row ob-cascade-p2">'
          + '<span class="ob-cascade-badge">🔵 Priorité 2</span>'
          + '<span class="ob-cascade-lang">\ud83c\uddf8\ud83c\uddf4 Somali <code>[so-SO]</code></span>'
          + '<span class="ob-cascade-desc">Famille couchitique — maîtrise les voyelles longues (haaraa, osoo…)</span>'
          + '</div>'
          + '<div class="ob-cascade-example">'
          + '<span class="ob-ex-bad">\u274c Haaraa \u2192 [ara]</span><span class="ob-ex-good">\u2705 Haaraa \u2192 [haaa-raaa]</span>'
          + '<span class="ob-ex-bad">\u274c Osoo \u2192 [ozo]</span><span class="ob-ex-good">\u2705 Osoo \u2192 [osooo]</span>'
          + '</div>'
          /* P3 Amharique */
          + '<div class="ob-cascade-row ob-cascade-p3">'
          + '<span class="ob-cascade-badge">🟡 Priorité 3</span>'
          + '<span class="ob-cascade-lang">\ud83c\uddea\ud83c\uddf9 Amharique <code>[am-ET]</code></span>'
          + '<span class="ob-cascade-desc">Éthiopie — musicalité d\'Afrique de l\'Est, consonnes éjectives</span>'
          + '</div>'
          + '<div class="ob-cascade-example">'
          + '<span class="ob-ex-bad">\u274c Caffee \u2192 [café]</span><span class="ob-ex-good">\u2705 Caffee \u2192 [tcha--ffé]</span>'
          + '<span class="ob-ex-bad">\u274c Xalayaa \u2192 [ksalaya]</span><span class="ob-ex-good">\u2705 Xalayaa \u2192 [t\'alavaa]</span>'
          + '</div>'
          /* P4 Swahili/Haoussa */
          + '<div class="ob-cascade-row ob-cascade-p4">'
          + '<span class="ob-cascade-badge">🟠 Priorité 4</span>'
          + '<span class="ob-cascade-lang">\ud83c\uddf0\ud83c\uddea\ud83c\uddf3\ud83c\uddec Swahili / Haoussa <code>[sw-KE / ha-NG]</code></span>'
          + '<span class="ob-cascade-desc">Voyelles pures — le E fait [é], le U fait [ou], sans avaler les finales</span>'
          + '</div>'
          + '<div class="ob-cascade-example">'
          + '<span class="ob-ex-bad">\u274c Bari \u2192 [barin]</span><span class="ob-ex-good">\u2705 Bari \u2192 [ba-ri]</span>'
          + '<span class="ob-ex-bad">\u274c Mucaad \u2192 [mycad]</span><span class="ob-ex-good">\u2705 Mucaad \u2192 [mou-caad]</span>'
          + '</div>'
          /* P5 Espagnol/Italien */
          + '<div class="ob-cascade-row ob-cascade-p5">'
          + '<span class="ob-cascade-badge">🔴 Priorité 5</span>'
          + '<span class="ob-cascade-lang">\ud83c\uddea\ud83c\uddf8\ud83c\uddee\ud83c\uddf9 Espagnol / Italien <code>[es-ES / it-IT]</code></span>'
          + '<span class="ob-cascade-desc">Bouclier anti-français — U=[ou], CH=[tch], zéro voyelle nasale</span>'
          + '</div>'
          + '<div class="ob-cascade-example">'
          + '<span class="ob-ex-bad">\u274c Mana \u2192 [m\u00e2na]</span><span class="ob-ex-good">\u2705 Mana \u2192 [ma-na]</span>'
          + '<span class="ob-ex-bad">\u274c Gutu \u2192 [gy-ty]</span><span class="ob-ex-good">\u2705 Gutu \u2192 [gou-tou]</span>'
          + '</div>'
          + '</div>'
          /* ce que ça change */
          + '<div class="ob-tip">\ud83d\udca1 Au premier clic \ud83d\udd0a, un bandeau discret vous indique quelle voix est active — ex. <em>« \ud83c\udfa4 Audio Oromo configuré avec la voix : Somali »</em>. Vous savez ainsi avec quel accent travaille votre oreille !</div>'
    },
    {
      icon : '\ud83c\udfa4',
      title: isFr ? 'Cimdii Irra deeb\u02bci' : "L'onglet Répète",
      sub  : isFr ? "L'onglet Répète"         : 'Onglet Irra deebʼi',
      body : isFr
        ? '<p>Cimdii <strong>Irra deeb\u02bci</strong> sagalee shaakaaluuf maaykiroofoonii meeshaa kee fayyadama :</p>'
          + '<ul>'
          + '<li><strong>\ud83d\udd0a Dhageeffadhu</strong> — jecha dhaggeeffadhu.</li>'
          + '<li><strong>\ud83c\udfa4 Dubbadhu</strong> — jecha dubbadhuu.</li>'
          + '</ul>'
          + '<div class="ob-tip">\ud83d\udca1 Hayyama maaykiroofoonii barbaachisa — browser mara irratti hin hojjetu.</div>'
        : "<p>L'onglet <strong>Répète</strong> utilise le microphone pour pratiquer la prononciation :</p>"
          + '<ul>'
          + '<li><strong>\ud83d\udd0a Écouter</strong> — entendez le mot.</li>'
          + '<li><strong>\ud83c\udfa4 Parler</strong> — prononcez-le à votre tour.</li>'
          + '</ul>'
          + "<div class=\"ob-tip\">\ud83d\udca1 Nécessite l'autorisation microphone — peut ne pas fonctionner sur tous les navigateurs.</div>"
    },
    {
      icon : '\ud83d\udd04',
      title: isFr ? 'Moojuula haaromsuuu (\u2b50 haquuu)' : 'Réinitialiser un module',
      body : isFr
        /* Oromo */
        ? '<p>Moojuula tokko irra deebi\'uu barbaaddaa? Urjiilee haquun <strong>jalqaba irraa jalqabuu</strong> ni dandaa\'ama.</p>'
          + '<ul>'
          + '<li>Fuula <strong>Moojuulota</strong> irratti moojuula filadhu.</li>'
          + '<li>Caancala <strong>🔄 Haaromsi</strong> cuqaasi — mirkaneeffannaa ni gaafata.</li>'
          + '<li>Urjiilee ni dhaban — garuu Quiz irra deebi\'uun urjii haaraa argachuu ni dandaa\'ama.</li>'
          + '</ul>'
          + '<div class="ob-tip">💡 Madaalli haaraan kan duraa caale qofti yaadatama — yeroo hunda waltajjii keessan ol ta\'a !</div>'
        /* Français */
        : '<p>Envie de recommencer un module à zéro ? Vous pouvez <strong>effacer vos étoiles</strong> et repartir de la base.</p>'
          + '<ul>'
          + '<li>Depuis l\'écran <strong>Modules</strong>, appuyez sur le thème concerné.</li>'
          + '<li>Appuyez sur le bouton <strong>🔄 Recommencer</strong> — une confirmation vous sera demandée.</li>'
          + '<li>Vos étoiles sont supprimées — rejouez le Quiz pour en regagner.</li>'
          + '</ul>'
          + '<div class="ob-tip">💡 Seul votre meilleur score est conservé — si vous rejouez et faites mieux, le compteur monte. Si vous faites moins bien, il ne bouge pas !</div>'
    },
    {
      icon : '\ud83d\udcf2',
      title: isFr ? 'App gara meeshaa irratti buusi' : "Installer l'app (hors-ligne)",
      body : isFr
        ? '<ul>'
          + '<li><strong>Android / Chrome</strong> : \u22ee cuqaasi \u2192 <em>"Fuula jalqabarratti ida\'i"</em></li>'
          + '<li><strong>iOS / Safari</strong> : \ud83d\udd17 cuqaasi \u2192 <em>"Fuula jalqabarratti"</em></li>'
          + '</ul>'
          + '<p>Erga buufamee booda, interneetii malee <strong>hojjeta</strong> — iddoo kamittiyyuu !</p>'
        : '<ul>'
          + '<li><strong>Android / Chrome</strong> : menu \u22ee \u2192 <em>"Ajouter à l\'écran d\'accueil"</em></li>'
          + '<li><strong>iOS / Safari</strong> : \ud83d\udd17 \u2192 <em>"Sur l\'écran d\'accueil"</em></li>'
          + '</ul>'
          + "<p>Une fois installée, l'app fonctionne <strong>entièrement hors-ligne</strong> !</p>"
    },
    {
      icon : '\u2696\ufe0f',
      title: isFr ? 'Walbira qabuu — meeshaalee barachuu' : 'Comparaison — cette appli vs. les autres',
      body : isFr
        /* Oromo */
        ? '<p>Meeshaa tokko qofti gahaa miti — walitti makuun saffisaan barata !</p>'
          + '<div class="ob-compare">'
          + '<div class="ob-compare-col">'
          + '<div class="ob-compare-head">📱 App tana</div>'
          + '<ul><li>💸 Bilisaa guutuu</li><li>🚫 Galmee malee</li><li>🗂️ Jechota sirna qabsiifte</li><li>🔊 Sagalee</li><li>🎤 Dubbii shaakali</li><li>📴 Interneetii malee</li></ul>'
          + '</div>'
          + '<div class="ob-compare-col">'
          + '<div class="ob-compare-head">🦉 Duolingo / Babbel</div>'
          + '<ul><li>🎮 Taphataa kan kakaasu</li><li>🌐 Afaanota baay\'ee</li><li>🎯 Karaa kan of madaaluu</li><li>👥 Hawaasa fi dorgommii</li><li>📐 Caasluga tartiibaan</li></ul>'
          + '</div>'
          + '<div class="ob-compare-col">'
          + '<div class="ob-compare-head">🏫 Mana barumsaa</div>'
          + '<ul><li>🧑🏫 Barsiisaa namaa</li><li>📋 Sirna barnootaa</li><li>🗣️ Hirmaachiisa</li><li>🎓 Ragaa beekamaa</li><li>📐 Caasluga gadi-fagoo</li></ul>'
          + '</div>'
          + '<div class="ob-compare-col">'
          + '<div class="ob-compare-head">🗣️ Hiriyoota Oromoo</div>'
          + '<ul><li>🌍 Afaan jireenya dhugaa</li><li>🎙️ Sagalee uumamaa</li><li>🛒 Jechota guyyaa guyyaa</li><li>💪 Amantaa of-keessaa</li><li>🤝 Waljijjiirraa aadaa</li></ul>'
          + '</div>'
          + '</div>'
          + '<div class="ob-tip">💡 Meeshaaleen kunneen walitti makuu — app kanaan jalqabi, Duolingo yookiin barsiisaa waliin caasluga baradhu, hiriyootaan dubbii dhugaa shaakali !</div>'
        /* Français */
        : '<p>Pas de meilleure méthode unique — chacune a ses forces. <strong>L\'idéal, c\'est de les combiner !</strong></p>'
          + '<div class="ob-compare">'
          + '<div class="ob-compare-col">'
          + '<div class="ob-compare-head">📱 Cette appli</div>'
          + '<ul><li>💸 100% gratuit</li><li>🚫 Sans inscription</li><li>🗂️ Vocabulaire structuré</li><li>🔊 Audio intégré</li><li>🎤 Répétition orale</li><li>📴 Hors-ligne</li></ul>'
          + '</div>'
          + '<div class="ob-compare-col">'
          + '<div class="ob-compare-head">🦉 Duolingo / Babbel</div>'
          + '<ul><li>🎮 Gamification motivante</li><li>🌐 Large catalogue</li><li>🎯 Parcours adaptatif</li><li>👥 Communauté</li><li>📐 Grammaire progressive</li></ul>'
          + '</div>'
          + '<div class="ob-compare-col">'
          + '<div class="ob-compare-head">🏫 École de langue</div>'
          + '<ul><li>🧑🏫 Enseignant humain</li><li>📋 Structure pédagogique</li><li>🗣️ Pratique entre apprenants</li><li>🎓 Certification reconnue</li><li>📐 Grammaire approfondie</li></ul>'
          + '</div>'
          + '<div class="ob-compare-col">'
          + '<div class="ob-compare-head">🗣️ Immersion / Amis natifs</div>'
          + '<ul><li>🌍 Langue authentique</li><li>🎙️ Accent naturel</li><li>🛒 Vocabulaire du quotidien</li><li>💪 Confiance en soi</li><li>🤝 Échanges culturels</li></ul>'
          + '</div>'
          + '</div>'
          + '<div class="ob-tip">💡 Notre conseil : utilise cette appli pour construire ta base de vocabulaire dès le premier jour — puis appuie-toi sur Duolingo ou une école pour la grammaire, et pratique avec des natifs pour la fluidité. Chaque outil renforce les autres !</div>'
    },
    {
      icon : '\ud83d\ude4f',
      title: isFr ? 'Galateeffannaa' : 'Remerciements',
      body : isFr
        /* Oromo */
        ? '<p>Galata guddaa <strong>Fédérico Calo</strong>'
          + ' (<a href="https://www.linkedin.com/in/federicocalo/" target="_blank" rel="noopener">Architektii Guddisaa Web</a>)'
          + ' gargaarsa teknikaaf.</p>'
          + '<p>Galata baay\'een <strong>Mussa Sembro</strong>'
          + ' (<a href="https://www.linkedin.com/in/mussa-sembro-137472174/" target="_blank" rel="noopener">Hiikkaa-Ibsituu Afaan Oromoo</a>)'
          + ' fi maatii kootiif — irra deebi\'ee dubbisuu, hiika sirreessuu fi gorsa ergonomii appii kennuuf.</p>'
        /* Français */
        : '<p>Un grand merci à <strong>Fédérico Calo</strong>'
          + ' (<a href="https://www.linkedin.com/in/federicocalo/" target="_blank" rel="noopener">Architecte Développeur Web</a>)'
          + ' pour son aide technique.</p>'
          + '<p>Merci beaucoup également à <strong>Mussa Sembro</strong>'
          + ' (<a href="https://www.linkedin.com/in/mussa-sembro-137472174/" target="_blank" rel="noopener">Traducteur-Interprète en Oromo</a>)'
          + ' et à mes parents pour leur travail de relecture, leurs corrections sur les traductions'
          + ' et leurs conseils sur l\'ergonomie de l\'application.</p>'
    },
    {
      icon : '\ud83d\ude4b',
      title: isFr ? 'Eenyuu fi maaliif?' : 'À propos — Qui suis-je ?',
      body : isFr
        /* Oromo — version concise */
        ? '<p>\ud83d\ude4b <strong>Sébastien Godet</strong> — hojii jijjiirraa keessa jira (Gestionna Pirojektii Agile & Data).</p>'
          + '<p>Appiin Taphad\'Meuh kun hidha Oromoo fi Faransaayii jabeessuuf — <strong>bilisaa, galmee malee, iddoo kamittiyyuu</strong>.</p>'
          + '<p>\ud83d\udce7 <button class="antispam-btn" onclick="openAndCopyEmail()"><span class="antispam-email">moc.liamg@61tedog.neitsabes</span></button> · '
          + '<a href="https://www.linkedin.com/in/s%C3%A9bastien-godet-142ba6145" target="_blank" rel="noopener">LinkedIn</a></p>'
        /* Français — version complète */
        : '<div class="ob-bio-card">'
          + '<div class="ob-bio-avatar">\ud83d\ude4b</div>'
          + '<div class="ob-bio-info">'
          + '<div class="ob-bio-name">Sébastien Godet</div>'
          + '<div class="ob-bio-role">En reconversion — Gestion de projets Agile &amp; Data</div>'
          + '</div>'
          + '</div>'
          + '<p>Après plus de 10 ans dans le géomarketing — études de marché, analyses d\'implantation — je suis en reconversion vers la gestion de projets. Mon profil est volontairement polyvalent : Scrum Master, Product Owner, Chef de Projet, Business Analyst ou AI Project Manager selon les besoins.</p>'
          + '<p><strong>Taphad\'Meuh</strong> est née d\'une envie simple : créer un outil gratuit, sans inscription et vraiment utile pour tisser des liens entre francophones et oromophones. C\'est aussi ma façon de travailler — apprendre par la pratique, trouver des solutions, soigner le détail.</p>'
          + '<p>L\'appli grandit avec mon réseau : quand de nouveaux contacts me font découvrir de nouveaux mots ou expressions, je les intègre. C\'est un <strong>projet vivant, pensé pour des gens réels</strong>.</p>'
          + '<div class="ob-bio-contact">'
          + '<div class="ob-bio-contact-title">\ud83d\udcac Une suggestion, une coquille, une idée ?</div>'
          + '<p>Cette appli est faite pour toi — chaque retour compte vraiment !</p>'
          + '<div class="ob-bio-links">'
          + '<button class="ob-bio-btn antispam-btn" onclick="openAndCopyEmail()">\u2709\ufe0f <span class="antispam-email">moc.liamg@61tedog.neitsabes</span></button>'
          + '<a class="ob-bio-btn" href="https://www.linkedin.com/in/s%C3%A9bastien-godet-142ba6145" target="_blank" rel="noopener">\ud83d\udcbc Message LinkedIn</a>'
          + '</div>'
          + '</div>'
    }
  ];

  let bodyEl = document.getElementById('homeGuideBody');
  if (bodyEl) {
    bodyEl.innerHTML = sections.map((s) => {
      return '<details class="hg-section">'
        + '<summary class="hg-summary">'
        + '<span class="hg-icon">' + s.icon + '</span>'
        + '<span class="hg-label">' + s.title + '</span>'
        + '<span class="hg-chevron">\u25bc</span>'
        + '</summary>'
        + '<div class="hg-detail">' + s.body + '</div>'
        + '</details>';
    }).join('');
  }

  /* ── Checkbox "Ne plus afficher" — libellé dans la langue maternelle ── */
  let noshowLabel = isFr
    ? "Ka'umsa irratti gargaarsa kana hin agarsiifin"  /* oromo */
    : 'Ne plus afficher ce guide au démarrage';         /* français */

  /* Checkbox du bas */
  let noshowText = document.getElementById('homeNoshowText');
  if (noshowText) noshowText.textContent = noshowLabel;

  /* Checkbox de la topbar */
  let topbarNoshowText = document.getElementById('homeTopbarNoshowText');
  if (topbarNoshowText) topbarNoshowText.textContent = noshowLabel;

  /* Synchroniser l'état des deux checkboxes avec localStorage */
  let chk       = document.getElementById('homeNoshowChk');
  let chkTopbar = document.getElementById('homeTopbarNoshowChk');
  let key = (currentMode === 'learn_french') ? _OB_KEY_FR : _OB_KEY_OR;
  let checked = false;
  try { checked = !!localStorage.getItem(key); } catch(e) {}
  if (chk)       chk.checked       = checked;
  if (chkTopbar) chkTopbar.checked = checked;

  /* Garder les deux en sync entre elles + localStorage */
  function _syncNoshow(val) {
    try {
      if (val) { localStorage.setItem(key, '1'); }
      else      { localStorage.removeItem(key); }
    } catch(e) {}
    if (chk       && chk.checked       !== val) chk.checked       = val;
    if (chkTopbar && chkTopbar.checked !== val) chkTopbar.checked = val;
  }
  if (chk)       chk.onchange       = function() { _syncNoshow(chk.checked); };
  if (chkTopbar) chkTopbar.onchange = function() { _syncNoshow(chkTopbar.checked); };

  /* ── Bouton Commencer / Continuer ── */
  let btn = document.getElementById('homeStartBtn');
  if (btn) {
    btn.textContent = L('▶ Jalqabi', '▶ Commencer');
    btn.onclick = function() { showScreen('sections-level1'); };
  }

  /* ── Bouton Fermer (✕) en haut à droite ── */
  let closeBtn = document.getElementById('homeCloseBtn');
  if (closeBtn) {
    closeBtn.textContent = L('Cufuu ✕', 'Fermer ✕');
    closeBtn.setAttribute('aria-label', L('Fermer le guide', 'Gargaarsa cufuu'));
    /* Fermer = passer directement aux modules (sans toucher au flag localStorage) */
    closeBtn.onclick = function() { showScreen('sections-level1'); };
  }

  /* ── Bouton export PDF du guide ── */
  let exportBtn = document.getElementById('homeExportBtn');
  if (exportBtn) {
    exportBtn.textContent = L('📄 Galmee buusi', '📄 Télécharger le guide');
  }
}

function _maybeShowOnboarding() {
  let key = (currentMode === 'learn_french') ? _OB_KEY_FR : _OB_KEY_OR;
  try {
    if (localStorage.getItem(key)) {
      /* Flag posé → passer directement aux modules */
      showScreen('sections-level1');
      return;
    }
  } catch(e) {}
  /* Pas de flag → rester sur l'écran Guide/Home (déjà affiché) */
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
  /* Re-synchroniser les deux checkboxes car le flag peut avoir changé */
  let chk = document.getElementById('homeNoshowChk');
  let chkTopbar = document.getElementById('homeTopbarNoshowChk');
  let key = (currentMode === 'learn_french') ? _OB_KEY_FR : _OB_KEY_OR;
  let checked = false;
  try { checked = !!localStorage.getItem(key); } catch(e) {}
  if (chk)       chk.checked       = checked;
  if (chkTopbar) chkTopbar.checked = checked;
}

/* ============================================================
   CRÉDITS
   ============================================================ */

function showCredits() {
  /* Mise à jour bilingue du contenu selon le mode actif */
  let titleEl = document.getElementById('credits-modal-title');
  let bodyEl  = document.getElementById('credits-modal-body');
  let closeEl = document.getElementById('credits-modal-close');

  if (titleEl) titleEl.textContent = L('Galateeffannaa', 'Remerciements');
  if (closeEl) closeEl.textContent = L('Cufuu', 'Fermer');

  if (bodyEl) {
    bodyEl.innerHTML = isFrench()
      /* ── Texte Oromo (interface pour l'apprenant de français) ── */
      ? '<p>Galata guddaa <strong>Fédérico Calo</strong>'
        + ' (<a href="https://www.linkedin.com/in/federicocalo/" target="_blank">'
        + 'Architektii Guddisaa Web</a>) gargaarsa teknikaaf.</p>'
        + '<p>Galata baay&#x27;een <strong>Mussa Sembro</strong>'
        + ' (<a href="https://www.linkedin.com/in/mussa-sembro-137472174/" target="_blank">'
        + 'Hiikkaa-Ibsituu Afaan Oromoo</a>)'
        + ' — hiikaa, sirreessaa fi gorsa afaanii.</p>'
        + '<p><strong>Maatii koo</strong> — irra deebi&#x27;ee dubbisuu fi gorsaaf.</p>'
      /* ── Texte français (interface pour l'apprenant d'Oromo) ── */
      : '<p>Un grand merci à <strong>Fédérico Calo</strong>'
        + ' (<a href="https://www.linkedin.com/in/federicocalo/" target="_blank">'
        + 'Architecte Développeur Web</a>) pour son aide technique.</p>'
        + '<p>Merci beaucoup à <strong>Mussa Sembro</strong>'
        + ' (<a href="https://www.linkedin.com/in/mussa-sembro-137472174/" target="_blank">'
        + 'Traducteur-Interprète en Oromo</a>)'
        + ' pour son travail de traduction, ses corrections et ses précieux conseils linguistiques.</p>'
        + '<p>Merci à mes <strong>parents</strong> pour leur relecture attentive et leurs conseils.</p>';
  }

  let modal = document.getElementById('credits-modal');
  if (modal) modal.style.display = 'flex';
}


/* ============================================================
   15. INITIALISATION DU LAUNCHER
   ============================================================ */

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

   _exportGuide()      -> Ecran Home  : guide complet toutes sections
   _exportVocab()      -> Lecon Niv.1 : tableau 2 col. dense (Oromo|FR)
   _exportSituation()  -> Lecon Niv.2 : situation courante (sitIdx)
   ============================================================ */

/* ── Utilitaire commun : ouvre une fenêtre print et la ferme après ── */
/**
 * Ouvre une fenêtre d'impression avec le contenu HTML fourni.
 *
 * STRATÉGIE DOUBLE :
 *   • Cas normal        : window.open() + window.print() (tous navigateurs desktop/Android)
 *   • iOS PWA standalone : window.open() est bloqué par Safari en mode standalone.
 *     Fallback → Blob HTML + <a download> qui déclenche un téléchargement direct du
 *     fichier .html, que l'utilisateur peut ouvrir dans Safari pour imprimer.
 *
 * Détection iOS standalone : navigator.standalone === true (propriété non-standard
 * Apple, disponible sur tous les Safari iOS depuis iOS 2.1).
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

  /* ── Chemin normal : popup + print ── */
  const win = window.open('', '_blank', 'width=800,height=600');
  if (!win) {
    /* Popup bloqué (hors iOS standalone) : proposer le téléchargement HTML */
    _showToast(L(
      '⚠️ Pop-up bloqué — téléchargement du fichier HTML à la place.',
      '⚠️ Pop-up dhaabame — faayilii HTML buufama.'
    ), 5000);
    _downloadAsHtml(htmlContent);
    return;
  }
  win.document.open();
  win.document.write(htmlContent);
  win.document.close();
  win.focus();
  win.addEventListener('load', () => {
    setTimeout(() => {
      win.print();
      win.addEventListener('afterprint', () => { win.close(); });
      setTimeout(() => { try { win.close(); } catch(e) {} }, 30000);
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
    _showToast(L(
      '📄 Fichier HTML téléchargé — ouvrez-le dans Safari pour imprimer.',
      '📄 Faayilii HTML buufame — maxxansuuf Safari keessatti bani.'
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