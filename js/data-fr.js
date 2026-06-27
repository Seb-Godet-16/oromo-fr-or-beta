/*
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  Language App 🇫🇷🇪🇹  —  js/data-fr.js                         ║
 * ║  Auteur   : Sébastien Godet                                     ║
 * ║  Assisté  : Claude Sonnet 4.6 · Gemini 3.5 Flash               ║
 * ║  Modernisé ES2020 (const pour les tableaux de données)           ║
 * ║  Version  : Juin 2026                                           ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  RÔLE DE CE FICHIER                                             ║
 * ║  Données pour le mode "Apprendre le Français" (apprenant       ║
 * ║  oromophone). Chargé dynamiquement par initApp() uniquement    ║
 * ║  si l'utilisateur choisit ce mode, pour ne pas surcharger la   ║
 * ║  mémoire si seul le mode Oromo est utilisé.                    ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  2 TABLEAUX EXPORTÉS (variables globales)                       ║
 * ║   • LEVEL1_THEMES_FR  → 32 thèmes de vocabulaire (apprenant FR) ║
 * ║   • LEVEL2_THEMES_FR  → 16 dialogues de mise en situation (FR)  ║
 * ║  + 1 tableau fusionné :                                         ║
 * ║   • ALL_THEMES_FR = LEVEL1_THEMES_FR + LEVEL2_THEMES_FR (48)    ║
 * ║  "FR" désigne la LANGUE D'INTERFACE de l'apprenant oromophone. ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  STRUCTURE D'UN THÈME — NIVEAU 1 (vocabulaire, type par défaut) ║
 * ║   {                                                              ║
 * ║     id     : identifiant unique du thème (clé de progression)  ║
 * ║     level  : 1                                                  ║
 * ║     emoji  : pictogramme affiché sur la carte du thème          ║
 * ║     name   : titre du thème en Afaan Oromoo                     ║
 * ║     sub    : sous-titre bilingue "Oromo / Français"             ║
 * ║     type   : 'alpha' pour l'alphabet (sinon absent)             ║
 * ║     note   : (optionnel) repère culturel affiché en contexte    ║
 * ║     words  : [{ et, fr, em, conj? }, …] — le lexique du thème   ║
 * ║       • et : mot/expression en Afaan Oromoo                     ║
 * ║       • fr : traduction française                               ║
 * ║       • em : emoji illustratif de la flashcard                  ║
 * ║       • conj : { et:[...6 formes], fr:[...6 formes] } —        ║
 * ║         conjugaison complète, uniquement sur les verbes         ║
 * ║     quiz10 : (uniquement pour type:'alpha') quiz audio fixe     ║
 * ║       [{ q, audio, opts:[4], ans:index }, …]                    ║
 * ║   }                                                              ║
 * ║  Pour les thèmes niveau 1 SANS quiz10, app.js génère le quiz    ║
 * ║  dynamiquement à partir de "words" (voir _generateQuiz dans     ║
 * ║  app.js) — c'est pourquoi la plupart des thèmes n'ont pas de    ║
 * ║  bloc quiz10 : il serait redondant avec les données de "words". ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  STRUCTURE D'UN THÈME — NIVEAU 2 (dialogue, type:'dialog')      ║
 * ║   {                                                              ║
 * ║     id, level:2, emoji, name, sub, type:'dialog', note?         ║
 * ║     situations : [{ label, title, img, dialogue:[…] }, …]       ║
 * ║       • label    : libellé court de l'onglet (ex. "Sit. 1")     ║
 * ║       • title    : titre de la mise en situation                ║
 * ║       • img      : emoji illustrant la scène                    ║
 * ║       • dialogue : [{ s, et, fr, side }, …] — répliques         ║
 * ║           s    : nom du personnage qui parle                   ║
 * ║           et   : réplique en Afaan Oromoo                      ║
 * ║           fr   : réplique en français                          ║
 * ║           side : 'left' ou 'right' (position de la bulle)      ║
 * ║     vocab : ['Oromo = Français', …] — lexique clé du dialogue,  ║
 * ║             une chaîne par entrée, séparateur "=" entre les     ║
 * ║             deux langues (parsé dynamiquement par app.js)       ║
 * ║     quiz  : [{ q, opts:[4], ans:index }, …] — quiz de fin de    ║
 * ║             module, fixe (pas de génération dynamique ici)      ║
 * ║   }                                                              ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  CONVENTIONS DE FORMATAGE DE CE FICHIER                         ║
 * ║  • Chaque thème est précédé d'un commentaire numéroté de la     ║
 * ║    forme "N/total -- Nom -- Sous-titre" pour naviguer vite.     ║
 * ║  • Les mots courts sans conjugaison sont regroupés plusieurs    ║
 * ║    par ligne (lisibilité sans exploser le nombre de lignes).    ║
 * ║  • Les verbes conjugués (champ "conj") sont toujours seuls sur  ║
 * ║    leur ligne : la ligne est déjà longue, inutile de la charger.║
 * ║  • Guillemets simples partout, apostrophes échappées par \' —   ║
 * ║    convention identique à celle utilisée dans app.js.           ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */


/* ══════════════════════════════════════════════════════════════════
   §1 — NIVEAU 1 : VOCABULAIRE (langue d'interface : Français)
   ──────────────────────────────────────────────────────────────────
   32 thèmes. L'apprenant francophone voit les menus en français
   et apprend l'Afaan Oromoo : champ "et" = mot à apprendre,
   champ "fr" = traduction donnée comme aide.
   ══════════════════════════════════════════════════════════════════ */

const LEVEL1_THEMES_FR = [

  // 1/48 -- L'Alphabet -- Qubeewwan
  {
    id: 'alpha', level: 1, emoji: '🔤',
    name: 'L\'Alphabet', sub: 'Qubeewwan',
    type: 'alpha',
    words: [
      {et:'A',fr:'A',em:'✈️'}, {et:'B',fr:'B',em:'🎈'}, {et:'C',fr:'C',em:'☕'}, {et:'D',fr:'D',em:'💃'},
      {et:'E',fr:'E',em:'🏫'}, {et:'F',fr:'F',em:'🌸'}, {et:'G',fr:'G',em:'🚉'}, {et:'H',fr:'H',em:'🏨'},
      {et:'I',fr:'I',em:'🏝️'}, {et:'J',fr:'J',em:'🌿'}, {et:'K',fr:'K',em:'⚖️'}, {et:'L',fr:'L',em:'🦁'},
      {et:'M',fr:'M',em:'🏠'}, {et:'N',fr:'N',em:'🌙'}, {et:'O',fr:'O',em:'🐦'}, {et:'P',fr:'P',em:'🍞'},
      {et:'Q',fr:'Q',em:'🏘️'}, {et:'R',fr:'R',em:'🌹'}, {et:'S',fr:'S',em:'☀️'}, {et:'T',fr:'T',em:'🚂'},
      {et:'U',fr:'U',em:'1️⃣'}, {et:'V',fr:'V',em:'🌆'}, {et:'W',fr:'W',em:'🚃'}, {et:'X',fr:'X',em:'🔨'},
      {et:'Y',fr:'Y',em:'🥛'}, {et:'Z',fr:'Z',em:'0️⃣'}
    ],
    quiz10: [
      {q:'Sagalee kam dhageessan?',audio:'A',opts:['A','E','I','O'],ans:0},
      {q:'Sagalee kam dhageessan?',audio:'C',opts:['K','S','C','G'],ans:2},
      {q:'Sagalee kam dhageessan?',audio:'E',opts:['A','E','O','U'],ans:1},
      {q:'Sagalee kam dhageessan?',audio:'Q',opts:['K','Q','C','P'],ans:1},
      {q:'Sagalee kam dhageessan?',audio:'X',opts:['T','S','X','Z'],ans:2},
      {q:'Sagalee kam dhageessan?',audio:'H',opts:['H','F','M','N'],ans:0},
      {q:'Sagalee kam dhageessan?',audio:'J',opts:['I','Y','J','G'],ans:2},
      {q:'Sagalee kam dhageessan?',audio:'U',opts:['O','U','E','A'],ans:1},
      {q:'Sagalee kam dhageessan?',audio:'V',opts:['B','F','V','W'],ans:2},
      {q:'Sagalee kam dhageessan?',audio:'Z',opts:['S','X','Z','J'],ans:2}
    ]
  },

  // 2/48 -- Les Salutations -- Nagaa Gaafachuu
  {
    id: 'salut', level: 1, emoji: '👋',
    name: 'Les Salutations', sub: 'Nagaa Gaafachuu',
    words: [
      {et:'Akkam bulte / Akkam boolte',fr:'Bonjour (le matin)',em:'🌅'},
      {et:'Akkam ooltee',fr:'Bon après-midi',em:'🌆'},
      {et:'Akkam boolte / Aduun galatoomaa',fr:'Bonsoir / Bonne nuit',em:'🌙'}, {et:'Nagaa!',fr:'Salut !',em:'👋'},
      {et:'Nagaan ooluu / Nagaan turaa',fr:'Au revoir / À bientôt',em:'👋'},
      {et:'Daddaffiin walargina',fr:'À bientôt',em:'⏱️'},
      {et:'Galatoomaa / Baay\'ee galatoomaa',fr:'Merci / Merci beaucoup',em:'🙏'},
      {et:'Maaloo / Waan gaarii',fr:'S\'il vous plaît / De rien',em:'🤝'},
      {et:'Dhiifama',fr:'Pardon / Excusez-moi',em:'🙇'}, {et:'Eeyyee! / Tole!',fr:'Oui ! / D\'accord !',em:'👍'},
      {et:'Eeyyee',fr:'Oui',em:'✅'}, {et:'Lakkii',fr:'Non',em:'❌'},
      {et:'Akkam jirta? yookiin Maaloo akkam?',fr:'Comment ça va ?',em:'🤗'},
      {et:'Fayyaan jira, galatoomaa',fr:'Je vais bien, merci',em:'😊'},
      {et:'Jidduu jira / Haaluma',fr:'Comme ci comme ça',em:'😐'},
      {et:'Dafqaan jira / Fayyaa miti',fr:'Je ne vais pas bien / Je n\'ai pas la forme',em:'😔'},
      {et:'Baay\'ee gaarii! / Roorroo!',fr:'Très bien ! / Super !',em:'🌟'}
    ]
  },

  // 3/48 -- Se Présenter -- Ofii Beeksisuu
 {
    id: 'pres', level: 1, emoji: '🙋',
    name: 'Se Présenter', sub: 'Ofii Beeksisuu',
    words: [
      {et:'Maqaa abbaaf eeyyee',fr:'Le nom de famille',em:'👨‍👩‍👧'}, {et:'Maqaa ofii',fr:'Le prénom',em:'🏷️'},
      {et:'Biyya irraa dhufame',fr:'La nationalité',em:'🌍'}, {et:'Umurii',fr:'L\'âge',em:'🎂'},
      {et:'Hojii yookiin ogummaa',fr:'La profession',em:'💼'}, {et:'Biyya',fr:'Le pays',em:'🗺️'},
      {et:'Faransaawi / Faransaawitii',fr:'Français(e)',em:'🇫🇷'},
      {et:'Oromoo / Itoophiyaanitti',fr:'Éthiopien(ne)',em:'🇪🇹'}, {et:'Nan jiraadha',fr:'J\'habite à',em:'🏠'},
      {et:'Ani / Naan',fr:'Je suis',em:'🧑'}, {et:'Waggoota ... qabaadha',fr:'J\'ai ... ans',em:'🎈'},
      {et:'Maqaan koo ...',fr:'Je m\'appelle',em:'👋'}, {et:'Eessa irraa dhufte?',fr:'D\'où es-tu ?',em:'🌍'},
      {et:'Shashemaneetti dhufeen',fr:'Je suis de Shashemene',em:'🏙️'}
    ]
  },

  // 4/48 -- Expressions Essentielles -- Jechi Murteessoo
  {
    id: 'expr', level: 1, emoji: '💬',
    name: 'Expressions Essentielles', sub: 'Jechi Murteessoo',
    words: [
      {et:'Hin galeef.',fr:'Je ne comprends pas.',em:'😕'}, {et:'Galeef.',fr:'Je comprends.',em:'✅'},
      {et:'Xiqqoo dubbadhu.',fr:'Parlez plus lentement, s\'il vous plaît.',em:'🐢'},
      {et:'Irra deebi\'i, maaloo.',fr:'Répétez, s\'il vous plaît.',em:'🔄'},
      {et:'Maal jechuudha?',fr:'Qu\'est-ce que ça veut dire ?',em:'📖'},
      {et:'Afaan Faransaayi xiqqoo dubbadha.',fr:'Je parle un peu français.',em:'🇫🇷'},
      {et:'Afaan Oromoo xiqqoo dubbadha.',fr:'Je parle un peu oromo.',em:'🇪🇹'},
      {et:'Gargaarsa barbaada.',fr:'J\'ai besoin d\'aide.',em:'🆘'},
      {et:'Rakkoo hin qabu.',fr:'Pas de problème.',em:'👌'}, {et:'Beekaa.',fr:'Je sais.',em:'💡'},
      {et:'Hin beeku.',fr:'Je ne sais pas.',em:'🤷'}, {et:'Yaada gaarii!',fr:'Bonne idée !',em:'💡'},
      {et:'Anis / Anaanis!',fr:'Moi aussi !',em:'🙋'}, {et:'Lakki, galatoomi.',fr:'Non merci.',em:'🙅'},
      {et:'Baay\'ee gaarii dha!',fr:'C\'est très bien !',em:'🌟'},
      {et:'Maaloo?',fr:'S\'il vous plaît ? / Pardon ?',em:'🙏'},
      {et:'Sirriidha!',fr:'C\'est exact ! / C\'est juste !',em:'✔️'},
      {et:'Sirrii miti.',fr:'Ce n\'est pas exact.',em:'❌'}
    ]
  },

  // 5/48 -- Mots interrogatifs -- Gaaffii Addaadaa
  {
    id: 'interro', level: 1, emoji: '❓',
    name: 'Mots interrogatifs', sub: 'Gaaffii Addaadaa',
    words: [
      {et:'Eessa?',fr:'Où ?',em:'📍'}, {et:'Yoom?',fr:'Quand ?',em:'📅'},
      {et:'Maaliif? / Maaf?',fr:'Pourquoi ?',em:'🤔'}, {et:'Akkamiin? / Maaliin?',fr:'Comment ?',em:'💬'},
      {et:'Eenyu?',fr:'Qui ?',em:'🙋'}, {et:'Maal? / Maali?',fr:'Quoi ? / Qu\'est-ce que ?',em:'❓'},
      {et:'Meeqa?',fr:'Combien ?',em:'🔢'}, {et:'Kami? / Isa kamii?',fr:'Lequel ? / Laquelle ?',em:'👆'},
      {et:'Eessa jira?',fr:'Où est… ?',em:'🗺️'}, {et:'Yoom dhufa?',fr:'Ça arrive quand ?',em:'🕐'},
      {et:'Maaliif barbaadda?',fr:'Pourquoi tu veux ?',em:'🤷'},
      {et:'Akkamiin jedha?',fr:'Comment dit-on ?',em:'💬'}, {et:'Eenyu kan?',fr:'C\'est qui ?',em:'👤'},
      {et:'Maal jechuudha?',fr:'Qu\'est-ce que ça veut dire ?',em:'📖'},
      {et:'Meeqa gatii qaba?',fr:'Ça coûte combien ?',em:'💶'}
    ]
  },

  // 6/48 -- Les Nombres -- Lakkoofsa
  {
    id: 'num', level: 1, emoji: '🔢',
    name: 'Les Nombres', sub: 'Lakkoofsa',
    words: [
      {et:'Zeerroo',fr:'Zéro',em:'0️⃣'}, {et:'Tokko',fr:'Un',em:'1️⃣'}, {et:'Lama',fr:'Deux',em:'2️⃣'},
      {et:'Sadii',fr:'Trois',em:'3️⃣'}, {et:'Afur',fr:'Quatre',em:'4️⃣'}, {et:'Shan',fr:'Cinq',em:'5️⃣'},
      {et:'Jaha',fr:'Six',em:'6️⃣'}, {et:'Torba',fr:'Sept',em:'7️⃣'}, {et:'Saddeet',fr:'Huit',em:'8️⃣'},
      {et:'Sagal',fr:'Neuf',em:'9️⃣'}, {et:'Kudhan',fr:'Dix',em:'🔟'}, {et:'Kudha tokko',fr:'Onze',em:'1️⃣1️⃣'},
      {et:'Kudha lama',fr:'Douze',em:'1️⃣2️⃣'}, {et:'Kudha sadii',fr:'Treize',em:'1️⃣3️⃣'},
      {et:'Kudha afur',fr:'Quatorze',em:'1️⃣4️⃣'}, {et:'Kudha shan',fr:'Quinze',em:'1️⃣5️⃣'},
      {et:'Kudha jaha',fr:'Seize',em:'1️⃣6️⃣'}, {et:'Kudha torba',fr:'Dix-sept',em:'1️⃣7️⃣'},
      {et:'Kudha saddeet',fr:'Dix-huit',em:'1️⃣8️⃣'}, {et:'Kudha sagal',fr:'Dix-neuf',em:'1️⃣9️⃣'},
      {et:'Digdama',fr:'Vingt',em:'2️⃣0️⃣'}, {et:'Soddomaa',fr:'Trente',em:'3️⃣0️⃣'},
      {et:'Afurtama',fr:'Quarante',em:'4️⃣0️⃣'}, {et:'Shantama',fr:'Cinquante',em:'5️⃣0️⃣'},
      {et:'Jahatama',fr:'Soixante',em:'6️⃣0️⃣'}, {et:'Torbaatama',fr:'Soixante-dix',em:'7️⃣0️⃣'},
      {et:'Saddeetama',fr:'Quatre-vingts',em:'8️⃣0️⃣'}, {et:'Sagaltama',fr:'Quatre-vingt-dix',em:'9️⃣0️⃣'},
      {et:'Dhibba / Dhibbaa',fr:'Cent',em:'1️⃣0️⃣0️⃣'}, {et:'Dhibba lama',fr:'Deux cents',em:'2️⃣0️⃣0️⃣'},
      {et:'Dhibba sadii',fr:'Trois cents',em:'3️⃣0️⃣0️⃣'}, {et:'Dhibba afur',fr:'Quatre cents',em:'4️⃣0️⃣0️⃣'},
      {et:'Dhibba shan',fr:'Cinq cents',em:'5️⃣0️⃣0️⃣'}, {et:'Dhibba jaha',fr:'Six cents',em:'6️⃣0️⃣0️⃣'},
      {et:'Dhibba torba',fr:'Sept cents',em:'7️⃣0️⃣0️⃣'}, {et:'Dhibba saddeet',fr:'Huit cents',em:'8️⃣0️⃣0️⃣'},
      {et:'Dhibba sagal',fr:'Neuf cents',em:'9️⃣0️⃣0️⃣'}, {et:'Kuma',fr:'Mille',em:'1️⃣0️⃣0️⃣0️⃣'},
      {et:'Kuma lama',fr:'Deux mille',em:'2️⃣0️⃣0️⃣0️⃣'}
    ]
  },

  // 7/48 -- L'Heure et le Calendrier -- Sa'atii fi Sanaata
  {
    id: 'temps', level: 1, emoji: '🕐',
    name: 'L\'Heure et le Calendrier', sub: 'Sa\'atii fi Sanaata',
    words: [
      {et:'Sa\'atii meeqa?',fr:'Quelle heure est-il ?',em:'🕐'}, {et:'Walakkaa',fr:'Et demie',em:'🕧'},
      {et:'Daqiiqaa',fr:'La minute',em:'⏱️'}, {et:'Sa\'atii',fr:'L\'heure',em:'⏰'},
      {et:'Ganama',fr:'Le matin',em:'🌅'}, {et:'Guyyaa',fr:'L\'après-midi',em:'☀️'},
      {et:'Galgala',fr:'Le soir',em:'🌆'}, {et:'Halkan',fr:'La nuit',em:'🌙'},
      {et:'Har\'aa',fr:'Aujourd\'hui',em:'📅'}, {et:'Boruu',fr:'Demain',em:'➡️'}, {et:'Kaleessa',fr:'Hier',em:'⬅️'},
      {et:'Torban kana',fr:'Cette semaine',em:'📆'}, {et:'Torban darbee',fr:'La semaine dernière',em:'⬅️'},
      {et:'Torban itti aanu',fr:'La semaine prochaine',em:'➡️'}, {et:'Guyyaa torbee',fr:'La semaine',em:'📆'},
      {et:'Wiixata',fr:'Lundi',em:'1️⃣'}, {et:'Kibxata',fr:'Mardi',em:'2️⃣'}, {et:'Roobii',fr:'Mercredi',em:'3️⃣'},
      {et:'Kamiisa',fr:'Jeudi',em:'4️⃣'}, {et:'Jimaata',fr:'Vendredi',em:'5️⃣'}, {et:'Sanbata',fr:'Samedi',em:'6️⃣'},
      {et:'Dilbata',fr:'Dimanche',em:'7️⃣'}, {et:'Ji\'a',fr:'Le mois',em:'🗓️'}, {et:'Amajjii',fr:'Janvier',em:'❄️'},
      {et:'Guraandhala',fr:'Février',em:'💝'}, {et:'Bitootessa',fr:'Mars',em:'🌱'}, {et:'Ebla',fr:'Avril',em:'🌸'},
      {et:'Caamsaa',fr:'Mai',em:'🌺'}, {et:'Waxabajjii',fr:'Juin',em:'☀️'}, {et:'Adoolessa',fr:'Juillet',em:'🏖️'},
      {et:'Hagayya',fr:'Août',em:'🌻'}, {et:'Fuulbana',fr:'Septembre',em:'🍂'},
      {et:'Onkoloolessa',fr:'Octobre',em:'🎃'}, {et:'Sadaasa',fr:'Novembre',em:'🍁'},
      {et:'Muddee',fr:'Décembre',em:'🎄'}, {et:'Bara / Waggaa',fr:'L\'année',em:'🗓️'},
      {et:'Bara darbe',fr:'L\'année dernière',em:'⬅️'}, {et:'Bara itti aanu',fr:'L\'année prochaine',em:'➡️'},
      {et:'Guyyaa dhaloota',fr:'L\'anniversaire',em:'🎂'},
      {et:'Ayyaana Fulbaanaa',fr:'La fête du Nouvel An éthiopien (Enkutatash)',em:'🎊'}
    ]
  },

  // 8/48 -- La Météo et le Climat -- Qilleensa fi Haala Biraa
  {
    id: 'meteo', level: 1, emoji: '🌤️',
    name: 'La Météo et le Climat', sub: 'Qilleensa fi Haala Biraa',
    words: [
      {et:'Qilleensa akkam?',fr:'Quel temps fait-il ?',em:'🌤️'},
      {et:'Ho\'a qilleensaa',fr:'La température',em:'🌡️'}, {et:'Digrii',fr:'Les degrés',em:'🌡️'},
      {et:'Ho\'aa',fr:'Il fait chaud',em:'🔥'}, {et:'Qorraa',fr:'Il fait froid',em:'🥶'},
      {et:'Roobu / Roobni jira',fr:'Il pleut',em:'🌧️'}, {et:'Urjiin jira',fr:'Il y a des nuages',em:'☁️'},
      {et:'Aduu jira',fr:'Il y a du soleil',em:'☀️'}, {et:'Qilleensi jabaan jira',fr:'Il y a du vent',em:'💨'},
      {et:'Aanoo roobaa',fr:'Le parapluie',em:'☂️'},
      {et:'Arfasaa',fr:'Saison des pluies / Le printemps français',em:'🌧️'},
      {et:'Gannaa',fr:'Grande saison sèche / L\'été français',em:'☀️'},
      {et:'Birraa',fr:'Petite saison sèche / L\'automne français',em:'🍂'},
      {et:'Bona',fr:'Saison fraîche / L\'hiver français',em:'❄️'}
    ]
  },

  // 9/48 -- Les Verbes -- Gochaalee
  {
    id: 'verb', level: 1, emoji: '📝',
    name: 'Les Verbes', sub: 'Gochaalee',
    words: [
      {et:'Ta\'uu / Jiraachuu',fr:'Être',em:'🧑',conj:{et:['Ani nan ta\'a / jira','Ati ni ta\'a / jirta','Inni/Isheen ni ta\'a / jira','Nuti ni taana / jirra','Isin ni taastu / jirtu','Isaan ni ta\'u / jiru'],fr:['Je suis','Tu es','Il/Elle est','Nous sommes','Vous êtes','Ils/Elles sont']}},
      {et:'Qabaachuu',fr:'Avoir',em:'🤲',conj:{et:['Ani nan qabaadha','Ati ni qabaatta','Inni/Isheen ni qabaata','Nuti ni qabaanna','Isin ni qabaastu','Isaan ni qabaatu'],fr:['J\'ai','Tu as','Il/Elle a','Nous avons','Vous avez','Ils/Elles ont']}},
      {et:'Dubbachuu',fr:'Parler',em:'🗣️',conj:{et:['Ani nan dubbadha','Ati ni dubbatta','Inni/Isheen ni dubbata','Nuti ni dubbanna','Isin ni dubbastu','Isaan ni dubbatu'],fr:['Je parle','Tu parles','Il/Elle parle','Nous parlons','Vous parlez','Ils/Elles parlent']}},
      {et:'Jiraachuu',fr:'Habiter',em:'🏠',conj:{et:['Ani nan jiraadha','Ati ni jiraatta','Inni/Isheen ni jiraata','Nuti ni jiraanna','Isin ni jiraastu','Isaan ni jiraatu'],fr:['J\'habite','Tu habites','Il/Elle habite','Nous habitons','Vous habitez','Ils/Elles habitent']}},
      {et:'Deemuu',fr:'Aller',em:'🚶',conj:{et:['Ani nan deema','Ati ni deemta','Inni/Isheen ni deema','Nuti ni deemna','Isin ni deemtu','Isaan ni deemu'],fr:['Je vais','Tu vas','Il/Elle va','Nous allons','Vous allez','Ils/Elles vont']}},
      {et:'Jaalachuu',fr:'Aimer',em:'❤️',conj:{et:['Nan jaalladha','Ni jaallataa','Ni jaallata','Ni jaallannaа','Ni jaallattu','Ni jaallatu'],fr:['J\'aime','Tu aimes','Il/Elle aime','Nous aimons','Vous aimez','Ils/Elles aiment']}},
      {et:'Nyaachuu',fr:'Manger',em:'🍽️',conj:{et:['Ani nan nyaadha','Ati ni nyaatta','Inni/Isheen ni nyaata','Nuti ni nyaanna','Isin ni nyaastu','Isaan ni nyaatu'],fr:['Je mange','Tu manges','Il/Elle mange','Nous mangeons','Vous mangez','Ils/Elles mangent']}},
      {et:'Dhuguu',fr:'Boire',em:'🥤',conj:{et:['Ani nan dhuga','Ati ni dhugta','Inni/Isheen ni dhuga','Nuti ni dhugna','Isin ni dhugtu','Isaan ni dhugu'],fr:['Je bois','Tu bois','Il/Elle boit','Nous buvons','Vous buvez','Ils/Elles boivent']}},
      {et:'Rafuu',fr:'Dormir',em:'😴',conj:{et:['Ani nan rafaa','Ati ni rafta','Inni/Isheen ni rafa','Nuti ni rafna','Isin ni raftu','Isaan ni rafu'],fr:['Je dors','Tu dors','Il/Elle dort','Nous dormons','Vous dormez','Ils/Elles dorment']}},
      {et:'Deemuu miila',fr:'Marcher',em:'🚶‍♂️',conj:{et:['Ani nan deema miila','Ati ni deemta miila','Inni/Isheen ni deema miila','Nuti ni deemna miila','Isin ni deemtu miila','Isaan ni deemu miila'],fr:['Je marche','Tu marches','Il/Elle marche','Nous marchons','Vous marchez','Ils/Elles marchent']}},
      {et:'Fiiguu',fr:'Courir',em:'🏃‍♂️',conj:{et:['Ani nan fiiga','Ati ni fiigta','Inni/Isheen ni fiiga','Nuti ni fiigna','Isin ni fiigtu','Isaan ni fiigu'],fr:['Je cours','Tu cours','Il/Elle court','Nous courons','Vous courez','Ils/Elles courent']}},
      {et:'Dubbisuu',fr:'Lire',em:'📖',conj:{et:['Ani nan dubbisa','Ati ni dubbista','Inni/Isheen ni dubbisa','Nuti ni dubbisna','Isin ni dubbistu','Isaan ni dubbisu'],fr:['Je lis','Tu lis','Il/Elle lit','Nous lisons','Vous lisez','Ils/Elles lisent']}},
      {et:'Barreessuu',fr:'Écrire',em:'✍️',conj:{et:['Ani nan barreessa','Ati ni barreesta','Inni/Isheen ni barreessa','Nuti ni barreessina','Isin ni barreestu','Isaan ni barreesu'],fr:['J\'écris','Tu écris','Il/Elle écrit','Nous écrivons','Vous écrivez','Ils/Elles écrivent']}},
      {et:'Dhaggeeffachuu',fr:'Écouter',em:'🎧',conj:{et:['Ani nan dhaggeeffadha','Ati ni dhaggeeffatta','Inni/Isheen ni dhaggeeffata','Nuti ni dhaggeeffanna','Isin ni dhaggeeffastu','Isaan ni dhaggeeffatu'],fr:['J\'écoute','Tu écoutes','Il/Elle écoute','Nous écoutons','Vous écoutez','Ils/Elles écoutent']}},
      {et:'Ilaaluu',fr:'Regarder',em:'👀',conj:{et:['Ani nan ilaala','Ati ni ilaalta','Inni/Isheen ni ilaala','Nuti ni ilaalana','Isin ni ilaaltuu','Isaan ni ilaalu'],fr:['Je regarde','Tu regardes','Il/Elle regarde','Nous regardons','Vous regardez','Ils/Elles regardent']}},
      {et:'Barachuu',fr:'Apprendre',em:'🧠',conj:{et:['Ani nan baradha','Ati ni baratta','Inni/Isheen ni barata','Nuti ni baranna','Isin ni barastu','Isaan ni baratu'],fr:['J\'apprends','Tu apprends','Il/Elle apprend','Nous apprenons','Vous apprenez','Ils/Elles apprennent']}},
      {et:'Yaaduu',fr:'Penser',em:'🤔',conj:{et:['Ani nan yaada','Ati ni yaadda','Inni/Isheen ni yaada','Nuti ni yaadna','Isin ni yaaddu','Isaan ni yaadu'],fr:['Je pense','Tu penses','Il/Elle pense','Nous pensons','Vous pensez','Ils/Elles pensent']}},
      {et:'Misoomsuu / Kolfuu',fr:'Sourire',em:'😊',conj:{et:['Ani nan misoomsa','Ati ni misoosta','Inni/Isheen ni misooma','Nuti ni misoomsina','Isin ni misoostu','Isaan ni misoomu'],fr:['Je souris','Tu souris','Il/Elle sourit','Nous sourions','Vous souriez','Ils/Elles sourient']}},
      {et:'Fudhachuu',fr:'Prendre',em:'🤲',conj:{et:['Ani nan fudhadha','Ati ni fudhatta','Inni/Isheen ni fudhata','Nuti ni fudhanna','Isin ni fudhastu','Isaan ni fudhatu'],fr:['Je prends','Tu prends','Il/Elle prend','Nous prenons','Vous prenez','Ils/Elles prennent']}},
      {et:'Kennuu',fr:'Donner',em:'🤲',conj:{et:['Ani nan kenna','Ati ni kenta','Inni/Isheen ni kenna','Nuti ni kennina','Isin ni kentu','Isaan ni kennu'],fr:['Je donne','Tu donnes','Il/Elle donne','Nous donnons','Vous donnez','Ils/Elles donnent']}},
      {et:'Barbaaduu',fr:'Chercher',em:'🔍',conj:{et:['Ani nan barbaada','Ati ni barbaadda','Inni/Isheen ni barbaada','Nuti ni barbaadna','Isin ni barbaaddu','Isaan ni barbaadu'],fr:['Je cherche','Tu cherches','Il/Elle cherche','Nous cherchons','Vous cherchez','Ils/Elles cherchent']}},
      {et:'Bituu',fr:'Acheter',em:'🛒',conj:{et:['Ani nan bita','Ati ni bitta','Inni/Isheen ni bita','Nuti ni bitna','Isin ni bittu','Isaan ni bitu'],fr:['J\'achète','Tu achètes','Il/Elle achète','Nous achetons','Vous achetez','Ils/Elles achètent']}},
      {et:'Gurguruu',fr:'Vendre',em:'💰',conj:{et:['Ani nan gurgura','Ati ni gurgurta','Inni/Isheen ni gurgura','Nuti ni gurgurna','Isin ni gurgurtu','Isaan ni gurguru'],fr:['Je vends','Tu vends','Il/Elle vend','Nous vendons','Vous vendez','Ils/Elles vendent']}},
      {et:'Kaffaltii kaffaluu',fr:'Payer',em:'💳',conj:{et:['Ani nan kaffala','Ati ni kaffalda','Inni/Isheen ni kaffala','Nuti ni kaffalina','Isin ni kaffaltu','Isaan ni kaffalu'],fr:['Je paie','Tu paies','Il/Elle paie','Nous payons','Vous payez','Ils/Elles paient']}},
      {et:'Hojjechuu',fr:'Travailler',em:'💼',conj:{et:['Ani nan hojjedha','Ati ni hojjetta','Inni/Isheen ni hojjeta','Nuti ni hojjenna','Isin ni hojjestu','Isaan ni hojjetu'],fr:['Je travaille','Tu travailles','Il/Elle travaille','Nous travaillons','Vous travaillez','Ils/Elles travaillent']}},
      {et:'Nyaata bilcheessuu',fr:'Cuisiner',em:'🍳',conj:{et:['Ani nan bilcheessa','Ati ni bilcheesta','Inni/Isheen ni bilcheessa','Nuti ni bilcheessina','Isin ni bilcheestu','Isaan ni bilcheesu'],fr:['Je cuisine','Tu cuisines','Il/Elle cuisine','Nous cuisinons','Vous cuisinez','Ils/Elles cuisinent']}},
      {et:'Qulqulleessuu',fr:'Nettoyer',em:'🧹',conj:{et:['Ani nan qulqulleessa','Ati ni qulqulleesta','Inni/Isheen ni qulqulleessa','Nuti ni qulqulleessina','Isin ni qulqulleestu','Isaan ni qulqulleesu'],fr:['Je nettoie','Tu nettoies','Il/Elle nettoie','Nous nettoyons','Vous nettoyez','Ils/Elles nettoient']}},
      {et:'Dhiqachuu',fr:'Se doucher',em:'🧼',conj:{et:['Ani nan dhiqadha','Ati ni dhiqatta','Inni/Isheen ni dhiqata','Nuti ni dhiqanna','Isin ni dhiqastu','Isaan ni dhiqatu'],fr:['Je me douche','Tu te douches','Il/Elle se douche','Nous nous douchons','Vous vous douchez','Ils/Elles se douchent']}},
      {et:'Ba\'uu / Deemuu',fr:'Partir',em:'🚪',conj:{et:['Ani nan ba\'a','Ati ni baata','Inni/Isheen ni ba\'a','Nuti ni baana','Isin ni baatu','Isaan ni ba\'u'],fr:['Je pars','Tu pars','Il/Elle part','Nous partons','Vous partez','Ils/Elles partent']}},
      {et:'Ga\'uu / Dhufuu',fr:'Arriver',em:'🛬',conj:{et:['Ani nan dhufa','Ati ni dhufta','Inni/Isheen ni dhufa','Nuti ni dhufna','Isin ni dhuftu','Isaan ni dhufu'],fr:['J\'arrive','Tu arrives','Il/Elle arrive','Nous arrivons','Vous arrivez','Ils/Elles arrivent']}},
      {et:'Waamuu',fr:'Appeler',em:'📞',conj:{et:['Ani nan waama','Ati ni waamta','Inni/Isheen ni waama','Nuti ni waamna','Isin ni waamtu','Isaan ni waamu'],fr:['J\'appelle','Tu appelles','Il/Elle appelle','Nous appelons','Vous appelez','Ils/Elles appellent']}},
      {et:'Gaafachuu',fr:'Demander',em:'🙋‍♂️',conj:{et:['Ani nan gaafadha','Ati ni gaafatta','Inni/Isheen ni gaafata','Nuti ni gaafanna','Isin ni gaafastu','Isaan ni gaafatu'],fr:['Je demande','Tu demandes','Il/Elle demande','Nous demandons','Vous demandez','Ils/Elles demandent']}},
      {et:'Konkolaachisuu',fr:'Conduire',em:'🚗',conj:{et:['Ani nan konkolaachisa','Ati ni konkolaachista','Inni/Isheen ni konkolaachisa','Nuti ni konkolaachisina','Isin ni konkolaachistuu','Isaan ni konkolaachisu'],fr:['Je conduis','Tu conduis','Il/Elle conduit','Nous conduisons','Vous conduisez','Ils/Elles conduisent']}},
      {et:'Baay\'ee jaalladha',fr:'Adorer',em:'😍',conj:{et:['Nan baay\'ee jaalladha','Ni baay\'ee jaallataa','Ni baay\'ee jaallata','Ni baay\'ee jaallannaа','Ni baay\'ee jaallattu','Ni baay\'ee jaallatu'],fr:['J\'adore','Tu adores','Il/Elle adore','Nous adorons','Vous adorez','Ils/Elles adorent']}}
    ]
  },

  // 10/48 -- Les Émotions -- Miiraawwan
  {
    id: 'emot', level: 1, emoji: '😄',
    name: 'Les Émotions', sub: 'Miiraawwan',
    words: [
      {et:'Gammadaa / Gammatti',fr:'Content / Contente',em:'😊'},
      {et:'Baayyee gammadaa / Gammatti',fr:'Heureux / Heureuse',em:'😊'},
      {et:'Koolu / Kooltuu',fr:'Joyeux / Joyeuse',em:'😄'}, {et:'Gadda / Gadditi',fr:'Triste / Triste',em:'😢'},
      {et:'Dadhabaa / Dadhabduu',fr:'Fatigué / Fatiguée',em:'😴'},
      {et:'Dallansuu / Dallantuu',fr:'Fâché / Fâchée',em:'😠'},
      {et:'Rifaatuu / Rifatii',fr:'Surpris / Choqué(e)',em:'😲'},
      {et:'Sodaachuu',fr:'Avoir peur',em:'😨'},
      {et:'Dhukkubsataa / Dhukkubsattuu',fr:'Malade / Malade',em:'🤒'},
      {et:'Xiqqoo dhukkubsataa',fr:'Pas très bien / Un peu souffrant',em:'🤒'},
      {et:'Yaaddoo / Yaaddoftuu',fr:'Inquiet / Inquiète',em:'😟'},
      {et:'Yaaddoo jabaa',fr:'Inquiet / Inquiète',em:'😟'}, {et:'Dhiphina / Dhibaa',fr:'Stressé / Stressée',em:'😰'},
      {et:'Baay\'ee dhiphina',fr:'Stressé / Stressée',em:'😰'},
      {et:'Abdii kutaa / Manooftuu',fr:'Déçu / Déçue',em:'😞'},
      {et:'Jibba / Jibbitu',fr:'Haineux / Haineuse',em:'😤'},
      {et:'Jaallachuu / Jaallattuu',fr:'Amoureux / Amoureuse',em:'😍'},
      {et:'Baay\'ee gaarii! / Roorroo!',fr:'C\'est super ! / C\'est cool !',em:'🌟'}
    ]
  },

  // 11/48 -- La Famille -- Maatii
  {
    id: 'fam', level: 1, emoji: '👨‍👩‍👧',
    name: 'La Famille', sub: 'Maatii',
    words: [
      {et:'Haadha / Haadha manaa',fr:'La mère / La maman',em:'👩'},
      {et:'Abbaa / Abbaa manaa',fr:'Le père / Le papa',em:'👨'}, {et:'Intala',fr:'La fille',em:'👧'},
      {et:'Ilma',fr:'Le fils',em:'👦'}, {et:'Obboleettii',fr:'La sœur',em:'👧'},
      {et:'Obboleessa',fr:'Le frère',em:'🧑'}, {et:'Akoo / Awoo',fr:'La grand-mère',em:'👵'},
      {et:'Akaakayyuu / Awoo Abbaa',fr:'Le grand-père',em:'👴'}, {et:'Niitii / Haadha manaa',fr:'La femme',em:'💑'},
      {et:'Abbaa warraa / Dhiirsa',fr:'Le mari',em:'💍'},
      {et:'Adaadaa (haadha abbaa) / Adda (obboleessa abbaa)',fr:'La tante (côté père) / L\'oncle',em:'👨‍👩‍👧'}
    ]
  },

  // 12/48 -- Les Couleurs -- Halluu
  {
    id: 'col', level: 1, emoji: '🎨',
    name: 'Les Couleurs', sub: 'Halluu',
    words: [
      {et:'Diimaa',fr:'Rouge',em:'❤️'}, {et:'Cuquliisa',fr:'Bleu',em:'💙'}, {et:'Magariisa',fr:'Vert',em:'💚'},
      {et:'Keelloo',fr:'Jaune',em:'💛'}, {et:'Burtukaana',fr:'Orange',em:'🧡'}, {et:'Adii',fr:'Blanc',em:'🤍'},
      {et:'Gurraacha',fr:'Noir',em:'🖤'}, {et:'Roozii',fr:'Rose',em:'🩷'},
      {et:'Daallatii / Diimtuuja',fr:'Violet',em:'💜'}, {et:'Bunii',fr:'Marron',em:'🤎'},
      {et:'Garaa garaa / Dulluma',fr:'Gris',em:'🩶'}
    ]
  },

  // 13/48 -- La Vie Quotidienne -- Jireenya Guyyaa Guyyaa
  {
    id: 'routine', level: 1, emoji: '🌅',
    name: 'La Vie Quotidienne', sub: 'Jireenya Guyyaa Guyyaa',
    words: [
      {et:'Ka\'uu / Dammaquu',fr:'Se lever / Se réveiller',em:'⏰'},
      {et:'Dhiqachuu',fr:'Se doucher / Se laver',em:'🚿'}, {et:'Fuula dhiqachuu',fr:'Se laver le visage',em:'🧼'},
      {et:'Ilkaan eebuu',fr:'Se brosser les dents',em:'🦷'}, {et:'Uffachuu',fr:'S\'habiller',em:'👕'},
      {et:'Ciree nyaachuu',fr:'Prendre le petit-déjeuner',em:'🍳'}, {et:'Hojjechuu',fr:'Travailler',em:'💼'},
      {et:'Barumsaaf deemuu',fr:'Aller à l\'école / Aller étudier',em:'🎒'},
      {et:'Baha manaa deemuu',fr:'Sortir de la maison',em:'🚪'},
      {et:'Bitachuu / Gabaa deemuu',fr:'Faire les courses',em:'🛒'},
      {et:'Nyaata bilcheessuu / Daakuu hojjechuu',fr:'Faire la cuisine / Cuisiner',em:'🍳'},
      {et:'Uffata dhiquu',fr:'Laver le linge',em:'🧺'},
      {et:'Uffata miicuu',fr:'Étendre / Repasser le linge',em:'👕'},
      {et:'Mana qulqulleessuu',fr:'Nettoyer la maison / Faire le ménage',em:'🧹'},
      {et:'Meeshaalee dhiquu',fr:'Faire la vaisselle',em:'🍽️'}, {et:'Saree oofuu',fr:'Sortir le chien',em:'🐕'},
      {et:'Bifa cireen duraa nyaachuu',fr:'Déjeuner',em:'🥗'}, {et:'Halkan nyaachuu',fr:'Dîner',em:'🍽️'},
      {et:'Boqochuu',fr:'Se reposer',em:'😮‍💨'}, {et:'Telefishina ilaalu',fr:'Regarder la télé',em:'📺'},
      {et:'Kitaaba dubbisuu',fr:'Lire un livre',em:'📖'}, {et:'Ciisuu / Rafuu',fr:'Se coucher / Dormir',em:'🛏️'}
    ]
  },

  // 14/48 -- La Nourriture -- Nyaata
  {
    id: 'nour', level: 1, emoji: '🍽️',
    name: 'La Nourriture', sub: 'Nyaata',
    words: [
      {et:'Muduraa',fr:'Les fruits',em:'🍉'}, {et:'Kuduraa',fr:'Les légumes',em:'🥦'},
      {et:'Buddeena / Injeeraa',fr:'L\'injera / La galette',em:'🫓'}, {et:'Daabboo',fr:'Le pain',em:'🍞'},
      {et:'Ruzii',fr:'Le riz',em:'🍚'}, {et:'Maakiirooni',fr:'Les pâtes',em:'🍝'},
      {et:'Dinnichi',fr:'La pomme de terre',em:'🥔'}, {et:'Foonii dinnichaa',fr:'Les frites',em:'🍟'},
      {et:'Foon',fr:'La viande',em:'🥩'}, {et:'Lukkuu',fr:'Le poulet',em:'🍗'},
      {et:'Qurxummii',fr:'Le poisson',em:'🐟'}, {et:'Tibs',fr:'Le tibs (viande grillée)',em:'🥩'},
      {et:'Kochoo',fr:'Le kotcho (pain de faux-bananier)',em:'🫓'}, {et:'Hanqaaquu',fr:'L\'œuf',em:'🥚'},
      {et:'Baadaa',fr:'Le fromage',em:'🧀'}, {et:'Dhadhaa',fr:'Le beurre',em:'🧈'},
      {et:'Buna',fr:'Le café (boisson)',em:'☕'}, {et:'Berbere',fr:'Le berbéré (piment rouge)',em:'🌶️'},
      {et:'Maangoo',fr:'La mangue',em:'🥭'}, {et:'Muzii',fr:'La banane',em:'🍌'},
      {et:'Burtukaana',fr:'L\'orange',em:'🍊'}, {et:'Limiin',fr:'Le citron',em:'🍋'},
      {et:'Avokaadoo',fr:'L\'avocat',em:'🥑'}, {et:'Pomii',fr:'La pomme',em:'🍎'},
      {et:'Mukarroo',fr:'La fraise',em:'🍓'}, {et:'Timaatimii',fr:'La tomate',em:'🍅'},
      {et:'Karootii',fr:'La carotte',em:'🥕'}, {et:'Qullubbii diimaa',fr:'L\'oignon rouge',em:'🧅'},
      {et:'Qullubbii adiikaa / Tumee',fr:'L\'ail',em:'🧄'}, {et:'Khyaar',fr:'Le concombre',em:'🥒'},
      {et:'Salaata',fr:'La salade / Laitue',em:'🥗'}, {et:'Zeyitii',fr:'L\'huile de cuisson',em:'🍾'},
      {et:'Sogidda',fr:'Le sel',em:'🧂'}, {et:'Damma',fr:'Le miel',em:'🍯'},
      {et:'Chokolaatii',fr:'Le chocolat',em:'🍫'}
    ]
  },

  // 15/48 -- Les Boissons -- Dhugaatii
  {
    id: 'bois', level: 1, emoji: '🥤',
    name: 'Les Boissons', sub: 'Dhugaatii',
    words: [
      {et:'Bishaan',fr:'L\'eau',em:'💧'}, {et:'Bishaan gaazii qaba',fr:'L\'eau gazeuse',em:'🫧'},
      {et:'Aannaan',fr:'Le lait',em:'🥛'}, {et:'Jiisii (Burtukaanaa)',fr:'Le jus (d\'orange)',em:'🍊'},
      {et:'Sodaa / Gasiyoozaa',fr:'Le soda',em:'🥤'}, {et:'Buna (qullayyoo)',fr:'Le café noir',em:'☕'},
      {et:'Buna aannaan waliin',fr:'Le café au lait',em:'☕'},
      {et:'Buna nannoo aannaan xinnoo',fr:'Le café avec un nuage de lait',em:'☕'},
      {et:'Shaayii',fr:'Le thé',em:'🍵'}, {et:'Koonjoo (diimaa / adii)',fr:'Le vin (rouge / blanc)',em:'🍷'},
      {et:'Biiraa',fr:'La bière',em:'🍺'}, {et:'Araqee',fr:'L\'araqé (alcool éthiopien)',em:'🍶'}
    ]
  },

  // 16/48 -- Au Restaurant -- Mana Nyaataa Keessatti
  {
    id: 'rest', level: 1, emoji: '🍽️',
    name: 'Au Restaurant', sub: 'Mana Nyaataa Keessatti',
    words: [
      {et:'Balbala alaa',fr:'La terrasse',em:'☀️'}, {et:'Teessoo',fr:'La table',em:'🪑'},
      {et:'Teessoon kun duwwaa dha?',fr:'Cette table est libre ?',em:'🪑'},
      {et:'Tajaajilaa / Tajaajiltu',fr:'Le serveur / La serveuse',em:'🧑‍🍳'},
      {et:'Liistii nyaataa',fr:'La carte',em:'📋'}, {et:'Menuu guyyaa',fr:'Le menu du jour',em:'🍱'},
      {et:'Gaafachuu',fr:'Commander',em:'🙋'}, {et:'Maal yaaddu?',fr:'Que recommandez-vous ?',em:'👨‍🍳'},
      {et:'Gluten hin qabu',fr:'Sans gluten',em:'🌾'}, {et:'Foon hin nyaatu',fr:'Végétarien / Végétarienne',em:'🥦'},
      {et:'Fuullaa xinnoo',fr:'L\'amuse-bouche',em:'🫒'}, {et:'Fuullaa dura',fr:'L\'entrée',em:'🥗'},
      {et:'Nyaata ijoo',fr:'Le plat principal',em:'🍖'}, {et:'Dhaamsa nyaataa',fr:'Le dessert',em:'🍮'},
      {et:'Saandiwichii / Buddeena',fr:'Le sandwich',em:'🥖'}, {et:'Fudhachuuf',fr:'À emporter',em:'🥡'},
      {et:'Baasii nyaataa',fr:'L\'addition',em:'💶'}, {et:'Qarshii dabalataa',fr:'Le pourboire',em:'💰'},
      {et:'Qarshii dabalataan dabalamee jira',fr:'Le pourboire est inclus',em:'✅'}
    ]
  },

  // 17/48 -- S'Orienter -- Karaa Kee Argachuu
  {
    id: 'orient', level: 1, emoji: '🧭',
    name: 'S\'Orienter', sub: 'Karaa Kee Argachuu',
    words: [
      {et:'Kallattii itti fufi',fr:'Tout droit',em:'⬆️'}, {et:'Bitatti',fr:'À gauche',em:'⬅️'},
      {et:'Mirgatti',fr:'À droite',em:'➡️'}, {et:'Fuuldura',fr:'Devant',em:'🔜'}, {et:'Duuba',fr:'Derrière',em:'🔙'},
      {et:'Cinaa',fr:'À côté',em:'↔️'}, {et:'Fuuldura / Eegalan',fr:'En face',em:'🔄'},
      {et:'Dhiyoo',fr:'Près',em:'📍'}, {et:'Fagoo',fr:'Loin',em:'🌅'},
      {et:'Kaartaa',fr:'Le plan / La carte',em:'🗺️'}
    ]
  },

  // 18/48 -- Les Lieux -- Iddoowwan
  {
    id: 'lieux', level: 1, emoji: '🏙️',
    name: 'Les Lieux', sub: 'Iddoowwan',
    words: [
      {et:'Magaalaa',fr:'La ville',em:'🏙️'}, {et:'Ganda',fr:'Le village',em:'🏡'},
      {et:'Baadiyyaa',fr:'La campagne',em:'🌾'},
      {et:'Tullu / Gaara',fr:'La montagne / La chaîne de montagnes',em:'⛰️'},
      {et:'Galaana / Haroo',fr:'La mer / L\'océan',em:'🌊'},
      {et:'Qorichee / Qixxee qilleensaa',fr:'La plage',em:'🏖️'}, {et:'Laga',fr:'La rivière',em:'🏞️'},
      {et:'Meeshaa bashannannaa',fr:'Le parc',em:'🌳'}, {et:'Bulee / Daaqqoo',fr:'La place publique',em:'⛲'},
      {et:'Daandii / Karaa',fr:'La rue / L\'avenue',em:'🛣️'}, {et:'Naannoo manaa',fr:'Le pâté de maisons',em:'🏘️'},
      {et:'Mana bulchiinsaa',fr:'La mairie',em:'🏛️'}, {et:'Hospitaala',fr:'L\'hôpital',em:'🏥'},
      {et:'Farmaasiitii',fr:'La pharmacie',em:'💊'}, {et:'Baankii',fr:'La banque',em:'🏦'},
      {et:'Kiilistiyaana / Masjiida',fr:'L\'église / La mosquée',em:'⛪🕌'},
      {et:'Suupaarmaarkeeti',fr:'Le supermarché',em:'🛒'}, {et:'Buna mana / Bunaa',fr:'Le bar / Le café',em:'☕'},
      {et:'Gabaa / Suuqii',fr:'Le marché / La boutique',em:'🛍️'},
      {et:'Mana barumsaa daa\'immanii',fr:'L\'école maternelle',em:'🧸'},
      {et:'Mana barumsaa sadarkaa duraatii',fr:'L\'école primaire',em:'🎒'},
      {et:'Mana barumsaa sadarkaa lammaffaa',fr:'Le collège',em:'📚'},
      {et:'Mana barumsaa ol\'aanaa',fr:'Le lycée',em:'🎓'}, {et:'Yuniversitii',fr:'L\'université',em:'🏛️'}
    ]
  },

  // 19/48 -- Les Transports -- Gejjiba
 {
    id: 'trans', level: 1, emoji: '🚌',
    name: 'Les Transports', sub: 'Gejjiba',
    words: [
      {et:'Baasii / Konkolaataa ummataa',fr:'Le bus',em:'🚌'}, {et:'Meetiroo',fr:'Le métro',em:'🚇'},
      {et:'Tiraamii',fr:'Le tramway',em:'🚊'}, {et:'Gaarii sibii',fr:'Le train',em:'🚂'},
      {et:'Xiyyaara',fr:'L\'avion',em:'✈️'}, {et:'Taaksii',fr:'Le taxi',em:'🚕'},
      {et:'Konkolaataa',fr:'La voiture',em:'🚗'}, {et:'Mootoorisikkilii',fr:'La moto',em:'🏍️'},
      {et:'Biskileetii',fr:'Le vélo',em:'🚴'}, {et:'Tikeeta',fr:'Le billet',em:'🎫'},
      {et:'Bajaajii',fr:'Le bajaj (tricycle / tuk-tuk)',em:'🛺'},
      {et:'Gaarii / Gaarii fardaa',fr:'Le gari (calèche à cheval)',em:'🐴'},
      {et:'Minibaasii',fr:'Le minibus collectif',em:'🚐'},
      {et:'Konkolaataa fe\'umsaa',fr:'Le camion de marchandises',em:'🚚'},
      {et:'Iddoo baasii / Tarmaala',fr:'La gare routière / station',em:'🏣'}
    ]
  },

  // 20/48 -- Le Corps -- Qaamaa
  {
    id: 'corps', level: 1, emoji: '🧍',
    name: 'Le Corps', sub: 'Qaamaa',
    words: [
      {et:'Mataa',fr:'La tête',em:'🗣️'}, {et:'Rifeensa',fr:'Les cheveux',em:'💇‍♂️'},
      {et:'Ija / Ijaan',fr:'L\'œil / Les yeux',em:'👀'}, {et:'Funyaan',fr:'Le nez',em:'👃'},
      {et:'Gurra / Gurraan',fr:'L\'oreille / Les oreilles',em:'👂'}, {et:'Afaan',fr:'La bouche',em:'👄'},
      {et:'Hidhii',fr:'Les lèvres',em:'💋'}, {et:'Arraba',fr:'La langue',em:'👅'},
      {et:'Ilkaan',fr:'La dent / Les dents',em:'🦷'}, {et:'Morma',fr:'Le cou',em:''},
      {et:'Harka gubbaa',fr:'Le bras / Les bras',em:'💪'}, {et:'Harka / Harkaan',fr:'La main / Les mains',em:'✋'},
      {et:'Quba / Qubaan',fr:'Le doigt / Les doigts',em:'☝️'},
      {et:'Quba miila / Ciltuu',fr:'L\'orteil / L\'ongle',em:'💅'}, {et:'Dugda',fr:'Le dos',em:''},
      {et:'Garaa',fr:'Le ventre',em:'🫃'}, {et:'Miila / Miilaan',fr:'La jambe / Les jambes',em:'🦵'},
      {et:'Miila jalaa / Miilaafi',fr:'Le pied / Les pieds',em:'🦶'}, {et:'Onnee',fr:'Le cœur',em:'❤️'},
      {et:'Sammuu',fr:'Le cerveau',em:'🧠'}, {et:'Lafee / Lafaan',fr:'L\'os / Les os',em:'🦴'}
    ]
  },

  // 21/48 -- Objets du Quotidien -- Mi'oota Guyyuu
  {
    id: 'objets', level: 1, emoji: '🔑',
    name: 'Objets du Quotidien', sub: 'Mi\'oota Guyyuu',
    words: [
      {et:'Bilbila',fr:'Le téléphone',em:'☎️'}, {et:'Bilbila harkaa',fr:'Le portable',em:'📱'},
      {et:'Kompiyuutara',fr:'L\'ordinateur',em:'💻'}, {et:'Chaajjara',fr:'Le chargeur',em:'🔌'},
      {et:'Sa\'atii harkaa',fr:'La montre',em:'⌚'}, {et:'Sa\'atii',fr:'L\'horloge / la pendule',em:'🕐'},
      {et:'Hirnaa',fr:'Les clés',em:'🔑'},
      {et:'Fardaa qarshii / Baankii xinnoo',fr:'Le portefeuille / le porte-monnaie',em:'👛'},
      {et:'Bursuusaa dugdaa',fr:'Le sac à dos',em:'🎒'}, {et:'Miidhagina ija',fr:'Les lunettes',em:'👓'},
      {et:'Aanoo roobaa',fr:'Le parapluie',em:'☂️'}, {et:'Waraqaa',fr:'Le papier',em:'📄'},
      {et:'Qalama / Biiroo',fr:'Le stylo / le bic',em:'🖊️'}, {et:'Mishira',fr:'Les ciseaux',em:'✂️'},
      {et:'Xaa\'oo',fr:'L\'assiette',em:'🍽️'}, {et:'Kilaasii',fr:'Le verre',em:'🥛'},
      {et:'Kubboo buna',fr:'La tasse',em:'☕'}, {et:'Simiintoo',fr:'La cuillère',em:'🥄'},
      {et:'Forkii',fr:'La fourchette',em:'🍴'}, {et:'Bilaa',fr:'Le couteau',em:'🔪'},
      {et:'Booteelaa',fr:'La bouteille',em:'🍶'}, {et:'Iyyaanoo',fr:'Le miroir',em:'🪞'},
      {et:'Tuwaallii',fr:'La serviette',em:'🛁'}, {et:'Saabunaa',fr:'Le savon',em:'🧼'},
      {et:'Kaafiyaa',fr:'L\'oreiller',em:''}
    ]
  },

  // 22/48 -- Le Logement -- Mana Jireenyaa
 {
    id: 'log', level: 1, emoji: '🏠',
    name: 'Le Logement', sub: 'Mana Jireenyaa',
    words: [
      {et:'Mana',fr:'La maison',em:'🏠'}, {et:'Apartamaantii',fr:'L\'appartement',em:'🏢'},
      {et:'Seensa / Galma dura',fr:'L\'entrée',em:'🚪'},
      {et:'Galma / Mana nyaataa',fr:'Le salon / la salle à manger',em:'🛋️'}, {et:'Daakuu',fr:'La cuisine',em:'🍳'},
      {et:'Kutaa ciisichaa',fr:'La chambre',em:'🛏️'},
      {et:'Mana fincaanii / Dhiqachuu',fr:'La salle de bain',em:'🚿'},
      {et:'Mana fincaanii',fr:'Les toilettes',em:'🚽'}, {et:'Mana konkolaataa',fr:'Le garage',em:'🚗'}
    ]
  },

  // 23/48 -- Meubles et Équipements -- Meeshaalee Manaa fi Meeshaalee Hojii
  {
    id: 'muebles_equipamiento', level: 1, emoji: '🪑',
    name: 'Meubles et Équipements', sub: 'Meeshaalee Manaa fi Meeshaalee Hojii',
    words: [
      {et:'Soofa',fr:'Le canapé',em:'🛋️'}, {et:'Teessoo qofaa',fr:'Le fauteuil',em:'💺'},
      {et:'Teessoo',fr:'La table',em:''}, {et:'Sannaddaa',fr:'La chaise',em:'🪑'},
      {et:'Ibsaa',fr:'La lampe',em:'💡'}, {et:'Mudaa kitaabaa',fr:'L\'étagère',em:''},
      {et:'Siree',fr:'Le lit',em:'🛏️'}, {et:'Amaaroo uffataa',fr:'L\'armoire',em:'🗄️'},
      {et:'Maardiima / Barrumsaa',fr:'Le bureau',em:'🖊️'}, {et:'Friijiidara',fr:'Le réfrigérateur',em:'🧊'},
      {et:'Aawoo',fr:'Le four',em:'🔥'}, {et:'Maaykirooweevii',fr:'Le micro-ondes',em:'🔲♨️'},
      {et:'Dhiqa meeshaa',fr:'L\'évier',em:'🚰'}, {et:'Dhiqa fuulaa',fr:'Le lavabo',em:'🚰'},
      {et:'Kuubii dhiqachuu',fr:'La baignoire',em:'🛁'}, {et:'Shawara',fr:'La douche',em:'🚿'}
    ]
  },

  // 24/48 -- Les Vêtements -- Uffata
  {
    id: 'veth', level: 1, emoji: '👗',
    name: 'Les Vêtements', sub: 'Uffata',
    words: [
      {et:'Shartii',fr:'Le t-shirt',em:'👕'}, {et:'Shartii dheeraa',fr:'La chemise',em:'👔'},
      {et:'Surrii',fr:'Le pantalon',em:'👖'}, {et:'Kophee / Shaakaalaa',fr:'Les chaussures / Les baskets',em:'👟'},
      {et:'Kaalseettii',fr:'Les chaussettes',em:'🧦'},
      {et:'Uffata dubartii / Qanafee',fr:'La robe / La jupe',em:'👗'}, {et:'Surrii gabaabaa',fr:'Le short',em:'🩳'},
      {et:'Jaakeetii / Uffata ho\'a',fr:'Le pull',em:'🧥'}, {et:'Jaakeetii alaa',fr:'La veste',em:'🧥'},
      {et:'Kuullaa / Keeppii',fr:'Le chapeau / La casquette',em:'🎩'}, {et:'Koobii guddaa',fr:'Le manteau',em:'🧥'},
      {et:'Shanxii morma',fr:'L\'écharpe',em:'🧣'}, {et:'Gantii',fr:'Les gants',em:'🧤'},
      {et:'Kuullaa ho\'a',fr:'Le bonnet',em:'🎿'}, {et:'Buursaa / Fardaa',fr:'Le sac / La poche',em:'👜'},
      {et:'Uffata bishaan',fr:'Le maillot de bain',em:'🩱'}
    ]
  },

  // 25/48 -- Les Professions -- Ogummaawwan Hojii
  {
    id: 'met', level: 1, emoji: '💼',
    name: 'Les Professions', sub: 'Ogummaawwan Hojii',
    words: [
      {et:'Barataa / Barattuun',fr:'L\'étudiant / L\'étudiante',em:'🎓'},
      {et:'Barsiisaa / Barsiistuu',fr:'Le professeur / La professeure',em:'👩‍🏫'},
      {et:'Tajaajilaa / Tajaajiltu',fr:'Le serveur / La serveuse',em:'🍽️'},
      {et:'Gurgurataa / Gurgurattu',fr:'Le vendeur / La vendeuse',em:'🏪'},
      {et:'Oofaa taaksii',fr:'Le chauffeur de taxi / La chauffeuse de taxi',em:'🚕'},
      {et:'Doktora',fr:'Le médecin / La médecin',em:'🩺'},
      {et:'Narsii',fr:'L\'infirmier / L\'infirmière',em:'👨‍⚕️'},
      {et:'Nyaata bilcheessaa',fr:'Le cuisinier / La cuisinière',em:'👨‍🍳'},
      {et:'Ogaa bishaan',fr:'Le plombier / La plombière',em:'🔧'},
      {et:'Ogaa kompiyuutaraa',fr:'L\'informaticien / L\'informaticienne',em:'💻'}
    ]
  },

  // 26/48 -- La Santé -- Fayyaa
  {
    id: 'sante', level: 1, emoji: '🏥',
    name: 'La Santé', sub: 'Fayyaa',
    words: [
      {et:'Dhukkubbii / Nan dhukkuba',fr:'Faire mal / j\'ai mal (j\'ai mal à la tête)',em:'🤕'},
      {et:'Dhukkubbii qabaachuu',fr:'Avoir une douleur (plus formel)',em:'😣'},
      {et:'Ho\'a qaamaa',fr:'La fièvre',em:'🌡️'}, {et:'Qufaa',fr:'La toux',em:'😮‍💨'},
      {et:'Xuruura fuulaa',fr:'Le mouchoir',em:'🤧'}, {et:'Meeshaa ho\'a safaruu',fr:'Le thermomètre',em:'🌡️'},
      {et:'Beellama',fr:'Le rendez-vous',em:'📅'}, {et:'Doktora / Doktoricha',fr:'Le médecin / La médecin',em:'🩺'},
      {et:'Dhukkubsataa',fr:'Le/la patient(e)',em:'🛏️'}, {et:'Gorsaa fayyaa',fr:'La consultation médicale',em:'📋'},
      {et:'Narsii / Narsicha',fr:'L\'infirmier / L\'infirmière',em:'👨‍⚕️'},
      {et:'Hospitaala',fr:'L\'hôpital',em:'🏥'}, {et:'Reseeptii / Ajaja qorichaa',fr:'L\'ordonnance',em:'📋'},
      {et:'Farmaasiitii',fr:'La pharmacie',em:'🏪'}, {et:'Qoricha',fr:'Le médicament',em:'💊'},
      {et:'Haaphii qoricha',fr:'Le comprimé',em:'💊'}, {et:'Vaaksiniifi',fr:'Le vaccin',em:'💉'},
      {et:'Mallattoo madaa',fr:'Le pansement adhésif',em:'🩹'}, {et:'Xaxaa madaa',fr:'Le bandage',em:'🩼'},
      {et:'Ambulaansii',fr:'L\'ambulance',em:'🚑'}, {et:'Bakka ariifachiisaa',fr:'Les urgences',em:'🆘'}
    ]
  },

  // 27/48 -- Le Voyage -- Imala
  {
    id: 'viaje', level: 1, emoji: '🧳',
    name: 'Le Voyage', sub: 'Imala',
    words: [
      {et:'Paaspoortiifi',fr:'Le passeport',em:'🛂'}, {et:'Baggaajii',fr:'La valise',em:'🧳'},
      {et:'Qabeenya deemsa',fr:'Les bagages',em:'🎒'}, {et:'Tikeeta',fr:'Le billet',em:'🎫'},
      {et:'Reserveeshina',fr:'La réservation',em:'📋'}, {et:'Ejensii deemsa',fr:'L\'agence de voyages',em:'🗺️'},
      {et:'Inshuraansii deemsa',fr:'L\'assurance voyage',em:'📄'}, {et:'Xiyyaara',fr:'L\'avion',em:'✈️'},
      {et:'Buufata xiyyaaraa',fr:'L\'aéroport',em:'🛫'}, {et:'Ba\'uu',fr:'Le départ',em:'🚪'},
      {et:'Ga\'uu',fr:'L\'arrivée',em:'🛬'}, {et:'Koostamii',fr:'La douane',em:'🛃'},
      {et:'Doonii guddaa',fr:'La croisière',em:'🚢'}, {et:'Hooteela',fr:'L\'hôtel',em:'🏨'},
      {et:'Kutaa lama yookiin tokko',fr:'La chambre double ou simple',em:'🛏️'},
      {et:'Qorichee laga',fr:'La plage',em:'🏖️'}, {et:'Tullu',fr:'La montagne',em:'⛰️'},
      {et:'Daawwataa',fr:'Le touriste',em:'📸'}
    ]
  },

  // 28/48 -- Les Pays -- Biyyoota
  {
    id: 'pays', level: 1, emoji: '🌍',
    name: 'Les Pays', sub: 'Biyyoota',
    words: [
      {et:'Faransaay',fr:'La France',em:'🇫🇷'}, {et:'Itoophiyaa',fr:'L\'Éthiopie',em:'🇪🇹'},
      {et:'Keeniyaa',fr:'Le Kenya',em:'🇰🇪'}, {et:'Xaaliyaanii',fr:'L\'Italie',em:'🇮🇹'},
      {et:'Beljiyoom',fr:'La Belgique',em:'🇧🇪'}, {et:'Swiizerlaandii',fr:'La Suisse',em:'🇨🇭'},
      {et:'Jarman',fr:'L\'Allemagne',em:'🇩🇪'}, {et:'Ingliizii',fr:'Le Royaume-Uni',em:'🇬🇧'},
      {et:'Jibuutii',fr:'Djibouti',em:'🇩🇯'}, {et:'Somaaliyaa',fr:'La Somalie',em:'🇸🇴'},
      {et:'Sudaan',fr:'Le Soudan',em:'🇸🇩'}, {et:'Braazil',fr:'Le Brésil',em:'🇧🇷'},
      {et:'Kaanaadaa',fr:'Le Canada',em:'🇨🇦'}, {et:'Morokkoo',fr:'Le Maroc',em:'🇲🇦'},
      {et:'Ameerikaa',fr:'Les États-Unis',em:'🇺🇸'}, {et:'Rushiyaa',fr:'La Russie',em:'🇷🇺'},
      {et:'Chaayinaa',fr:'La Chine',em:'🇨🇳'}, {et:'Jaappaan',fr:'Le Japon',em:'🇯🇵'},
      {et:'Hindii',fr:'L\'Inde',em:'🇮🇳'}, {et:'Turkii',fr:'La Turquie',em:'🇹🇷'},
      {et:'Giriikii',fr:'La Grèce',em:'🇬🇷'}, {et:'Awustiraaliyaa',fr:'L\'Australie',em:'🇦🇺'},
      {et:'Afrikaa Kibbaa',fr:'L\'Afrique du Sud',em:'🇿🇦'}
    ]
  },

  // 29/48 -- Les Loisirs -- Hojiiwwan Yeroo Boqonnaa
  {
    id: 'ocio', level: 1, emoji: '⛰️',
    name: 'Les Loisirs', sub: 'Hojiiwwan Yeroo Boqonnaa',
    words: [
      {et:'Dubbisuu',fr:'La lecture',em:'📚'}, {et:'Kitaaba',fr:'Le livre',em:'📖'},
      {et:'Muuziqaa',fr:'La musique',em:'🎵'}, {et:'Siinimaa',fr:'Le cinéma',em:'🎬'},
      {et:'Tiyaatira',fr:'Le théâtre',em:'🎭'}, {et:'Ispoortii',fr:'Le sport',em:''},
      {et:'Kora miilaa',fr:'Le football',em:'⚽'}, {et:'Daakuu bishaan',fr:'La natation',em:'🏊'},
      {et:'Biskileetii oofuu',fr:'Le cyclisme',em:'🚴'}, {et:'Fiigichaa',fr:'L\'athlétisme',em:'🏃'},
      {et:'Deemsa tulluutti',fr:'La randonnée',em:'🥾'}, {et:'Deemsa karaa',fr:'La marche nordique',em:''},
      {et:'Naqata / Seenaa',fr:'La promenade',em:'🌳'}, {et:'Taphaachuu',fr:'Jouer',em:'🎮'},
      {et:'Leenjii hojjechuu',fr:'Pratiquer',em:'💪'}, {et:'Boqachuu',fr:'Se reposer',em:'😴'},
      {et:'Gammachuun fayyadamuu',fr:'Profiter / Apprécier',em:'😊'}
    ]
  },

  // 30/48 -- Les Plantes -- Biqiltuuwwan
  {
    id: 'plan', level: 1, emoji: '🌿',
    name: 'Les Plantes', sub: 'Biqiltuuwwan',
    words: [
      {et:'Adaraa / Daadhii',fr:'La fleur',em:'🌸'}, {et:'Muka',fr:'L\'arbre',em:'🌳'},
      {et:'Caasee',fr:'La feuille',em:'🍃'}, {et:'Marga',fr:'L\'herbe',em:'🌱'}, {et:'Hidda',fr:'La racine',em:'🪵'},
      {et:'Ija muka',fr:'Le fruit (sur l\'arbre)',em:'🍎'}, {et:'Sanyii',fr:'La graine',em:'🌻'},
      {et:'Bakkee miidhagoo',fr:'Le jardin',em:'🏡'}, {et:'Daadhii diimaa',fr:'La rose',em:'🌹'},
      {et:'Bosonaa',fr:'La forêt',em:'🌲'}, {et:'Muka Maangoo',fr:'Le manguier',em:'🥭'},
      {et:'Muka Paappaayaa',fr:'Le papayer',em:'🍈'}, {et:'Muka Avokaadoo',fr:'L\'avocatier',em:'🥑'},
      {et:'Qoccoo / Warqee',fr:'L\'Ensete / Faux-bananier',em:'🌴'},
      {et:'Biqiltuu',fr:'La jeune pousse / Le plant',em:'🌱'},
      {et:'Marga miidhagoo',fr:'La pelouse / Le gazon',em:'⛳'},
      {et:'Odaa',fr:'Le sycomore (Arbre sacré Oromo)',em:'🌳'},
      {et:'Ejersa',fr:'L\'olivier sauvage d\'Afrique',em:'🫒'},
      {et:'Heexoo',fr:'Le kousso (arbre médicinal)',em:'🌿'}, {et:'Oyruu / Maasii',fr:'Le champ cultivé',em:'👨‍🌾'},
      {et:'Qoraan',fr:'Le bois de chauffage',em:'🪵'}
    ]
  },

  // 31/48 -- Les Animaux -- Bineensota
  {
    id: 'anim', level: 1, emoji: '🐘',
    name: 'Les Animaux', sub: 'Bineensota',
    words: [
      {et:'Saree',fr:'Le chien',em:'🐶'}, {et:'Adurree',fr:'Le chat',em:'🐱'},
      {et:'Simbiraa',fr:'L\'oiseau',em:'🐦'}, {et:'Qurxummii',fr:'Le poisson (vivant)',em:'🐟'},
      {et:'Farda',fr:'Le cheval',em:'🐴'}, {et:'Loon / Saree loon',fr:'La vache',em:'🐮'},
      {et:'Booyee',fr:'Le cochon',em:'🐷'}, {et:'Lukkuu',fr:'La poule',em:'🐔'},
      {et:'Illeena',fr:'Le lapin',em:'🐰'}, {et:'Qurxummii nyaataa',fr:'Le poisson (dans l\'assiette)',em:'🐟🍽️'},
      {et:'Sangaa',fr:'Le taureau',em:'🐂'}, {et:'Molgaa',fr:'Le canard',em:'🦆'},
      {et:'Kormaa lukkuu',fr:'Le coq',em:'🐓'}, {et:'Hoolaa / Hoolii',fr:'L\'agneau',em:'🐑'},
      {et:'Re\'ee',fr:'La chèvre',em:'🐐'}, {et:'Harree',fr:'L\'âne',em:'🫏'}, {et:'Arba',fr:'L\'éléphant',em:'🐘'},
      {et:'Baalee',fr:'L\'ours',em:'🐻'}, {et:'Qeerransaa',fr:'Le tigre',em:'🐯'},
      {et:'Qurxummii bishaaniin jiraatuu',fr:'Le dauphin',em:'🐬'}, {et:'Harootii guddaa',fr:'La baleine',em:'🐳'},
      {et:'Ardiitii / Gombisuu',fr:'L\'aigle',em:'🦅'}, {et:'Buraayyoo',fr:'Le papillon',em:'🦋'},
      {et:'Bofaa xixiqqaa',fr:'La grenouille',em:'🐸'}, {et:'Bofa',fr:'Le serpent',em:'🐍'},
      {et:'Bofa lafa',fr:'Le lézard',em:'🦎'}, {et:'Saappanaa',fr:'L\'araignée',em:'🕷️'},
      {et:'Hiyyeessa / Bineeldota xixiqqaa',fr:'Le moustique',em:'🦟'}, {et:'Dirreetti',fr:'La fourmi',em:'🐜'}
    ]
  },

  // 32/48 -- L'Agriculture et L'Élevage -- Qonnaafi Horsiisa Loonii
  {
    id: 'agri', level: 1, emoji: '🌾',
    name: 'L\'Agriculture et L\'Élevage', sub: 'Qonnaafi Horsiisa Loonii',
    words: [
      {et:'Qonnaan bulaa',fr:'L\'agriculteur / Le fermier',em:'👨‍🌾'},
      {et:'Oyruu / Maasii',fr:'Le champ cultivé',em:'🌾'}, {et:'Lafa',fr:'La terre / Le domaine',em:'🌍'},
      {et:'Biyyoo',fr:'Le sol / La terre arable',em:'🪨'}, {et:'Loon',fr:'Le bétail / Les vaches',em:'🐄'},
      {et:'Farda',fr:'Le cheval',em:'🐎'}, {et:'Harree',fr:'L\'âne (bête de somme)',em:'🫏'},
      {et:'Buna',fr:'La culture du café',em:'☕'}, {et:'Xaafii',fr:'Le teff (céréale locale)',em:'🌾'},
      {et:'Boqqolloo',fr:'Le maïs',em:'🌽'}, {et:'Qamadii',fr:'Le blé',em:'🌾'},
      {et:'Warqee / Qoccoo',fr:'La plantation d\'Ensete',em:'🌴'}, {et:'Sangaa',fr:'Le bœuf de trait',em:'🐂'},
      {et:'Hoolaa / Re\'ee',fr:'Le mouton / La chèvre',em:'🐐'}, {et:'Lukkuu',fr:'La volaille / La poule',em:'🐔'},
      {et:'Laga / Burqaa',fr:'La rivière / La source d\'eau',em:'💧'},
      {et:'Gindee / Muka marfoo',fr:'La charrue traditionnelle',em:'🪵'},
      {et:'Moteera qonnaa',fr:'Le tracteur',em:'🚜'}, {et:'Haamtuu',fr:'La faucille',em:'🌾'},
      {et:'Qonnaan buluu',fr:'Cultiver la terre',em:'🚜'},
      {et:'Sassabuu / Makuruu',fr:'Récolter / Moissonner',em:'🧺'},
      {et:'Gabaa geessuu',fr:'Apporter la récolte au marché',em:'🛒'}, {et:'Rooba',fr:'La pluie',em:'🌧️'},
      {et:'Arfaasaa',fr:'Saison des petites pluies (mars-mai)',em:'🌦️'},
      {et:'Ganna',fr:'Saison des grandes pluies (juin-sept)',em:'🌧️'},
      {et:'Bona',fr:'La saison sèche (oct-fév)',em:'☀️'}
    ]
  }

];

/* ══════════════════════════════════════════════════════════════════
   §2 — NIVEAU 2 : DIALOGUES & MISES EN SITUATION (Français)
   ──────────────────────────────────────────────────────────────────
   16 modules. Chaque module propose 3 mises en situation (onglet
   "situations"), un lexique clé ("vocab") et un quiz fixe ("quiz").
   ══════════════════════════════════════════════════════════════════ */

const LEVEL2_THEMES_FR = [

  // 33/48 -- Saluer Quelqu'un -- Nama Nagaa Gaafachuu
  {
    id: 'salut2', level: 2, emoji: '👋',
    name: 'Saluer Quelqu\'un', sub: 'Nama Nagaa Gaafachuu', type: 'dialog',
    situations: [
      {label:'Sit. 1',title:'Dans la rue',img:'🏘️',dialogue:[
        {s:'Lamma',et:'Akkam! Fayyaa?',fr:'Salut ! Ça va ?',side:'left'},
        {s:'Ayantu',et:'Gaarii, galatoomi! Ati hoo?',fr:'Bien, merci ! Et toi ?',side:'right'},
        {s:'Lamma',et:'Jiddu jiddu. Dadhabee jira.',fr:'Comme ci comme ça. Je suis fatigué.',side:'left'},
        {s:'Ayantu',et:'Yaa! Dhiifama.',fr:'Oh ! Je suis désolée.',side:'right'},
        {s:'Lamma',et:'Galatoomi. Haga wal arginu!',fr:'Merci. À plus !',side:'left'},
        {s:'Ayantu',et:'Itti aansuun!',fr:'À bientôt !',side:'right'}
      ]},
      {label:'Sit. 2',title:'Au bureau le matin',img:'💼',dialogue:[
        {s:'Tolaa',et:'Akkam bultee! Fayyaan bulte?',fr:'Bonjour ! Comment tu vas ?',side:'left'},
        {s:'Caaltuu',et:'Gaarii, galatoomi. Atis hoo?',fr:'Bien, merci. Et toi ?',side:'right'},
        {s:'Tolaa',et:'Xiqqoo dadhabee. Bunaa barbaaddaa?',fr:'Un peu fatigué. Tu veux un café ?',side:'left'},
        {s:'Caaltuu',et:'Eeyyeen, mee. Galatoomi!',fr:'Oui, s\'il te plaît. Merci !',side:'right'},
        {s:'Tolaa',et:'Nagaan. Kunoo fudhadhu!',fr:'De rien. Voilà !',side:'left'}
      ]},
      {label:'Sit. 3',title:'Retrouver un ami en terrasse',img:'☀️',dialogue:[
        {s:'Gamachuu',et:'Akkam! Akkam jirta?',fr:'Salut ! Comment tu vas ?',side:'left'},
        {s:'Finfinnee',et:'Baay\'ee gaarii! Atis hoo?',fr:'Très bien ! Et toi ?',side:'right'},
        {s:'Gamachuu',et:'Gaarii. Haaraan hoo maaltu jira?',fr:'Bien. Quoi de neuf ?',side:'left'},
        {s:'Finfinnee',et:'Haaraan tokko hin jiru. Waa xuruuri fudhanna?',fr:'Rien de spécial. On prend quelque chose ?',side:'right'},
        {s:'Gamachuu',et:'Yaada gaarii! Dheebuu dhabe.',fr:'Bonne idée ! J\'ai soif.',side:'left'},
        {s:'Finfinnee',et:'Anaanis!',fr:'Moi aussi !',side:'right'}
      ]}
    ],
    vocab: [
      'Fayyaa? / Akkam? = Ça va ?', 'Gaarii, galatoomi = Bien, merci', 'Jiddu jiddu = Comme ci comme ça',
      'Dadhabee jira = Je suis fatigué', 'Dhiifama = Je suis désolé(e)', 'Haga wal arginu! = À plus !',
      'Haaraan maaltu jira? = Quoi de neuf ?'
    ],
    quiz: [
      {q:'Jechuun "Jiddu jiddu" maal jechuudha?',opts:['Très bien','Très mal','Comme ci comme ça','Je suis fatigué'],ans:2},
      {q:'Afaan Oromootti "Je suis désolé" akkamiin jedha?',opts:['Galatoomi','Dhiifama','Nagaan','Dhiisi'],ans:1},
      {q:'Jechuun "Haga wal arginu!" maal jechuudha?',opts:['Bonjour !','Merci !','À plus !','S\'il vous plaît !'],ans:2}
    ]
  },

  // 34/48 -- Se Présenter -- Of Beeksisuu
  {
    id: 'pres2', level: 2, emoji: '🙋',
    name: 'Se Présenter', sub: 'Of Beeksisuu', type: 'dialog',
    situations: [
      {label:'Sit. 1',title:'Dans un cours d\'oromo',img:'📚',dialogue:[
        {s:'Barsiistuu',et:'Akkam! Maqaan kee eenyu?',fr:'Bonjour ! Tu t\'appelles comment ?',side:'right'},
        {s:'Marc',et:'Maqaan koo Marc. Atis hoo?',fr:'Je m\'appelle Marc. Et toi ?',side:'left'},
        {s:'Barsiistuu',et:'Ani Bontu. Lammii kamii ta\'a, Marc?',fr:'Je suis Bontu. Tu es d\'où, Marc ?',side:'right'},
        {s:'Marc',et:'Lammii Firaansaay, Paarisii irraa. Atis hoo?',fr:'Je suis de France, de Paris. Et toi ?',side:'left'},
        {s:'Barsiistuu',et:'Ani Shaashamannee irraa. Baga nagaan dhufte!',fr:'Je suis de Shashemene. Bienvenue !',side:'right'},
        {s:'Marc',et:'Galatoomi!',fr:'Merci !',side:'left'}
      ]},
      {label:'Sit. 2',title:'Rencontre dans le quartier',img:'🏙️',dialogue:[
        {s:'Ollaa',et:'Akkam! Haaraa taatee as jirtaa?',fr:'Bonjour ! Tu es nouveau ici ?',side:'right'},
        {s:'Julie',et:'Eeyyeen. Maqaan koo Julie. Ani Firaansaayiidha.',fr:'Oui. Je m\'appelle Julie. Je suis française.',side:'left'},
        {s:'Ollaa',et:'Ani Abirraa. Afaan Oromo dubbattaa?',fr:'Moi je suis Antonio. Tu parles oromo ?',side:'right'},
        {s:'Julie',et:'Xiqqoo. Barachuun jira.',fr:'Un peu. Je suis en train d\'apprendre.',side:'left'},
        {s:'Ollaa',et:'Baay\'ee gaarii! Afaan Oromoo kee gaariidha.',fr:'Très bien ! Ton oromo est bon.',side:'right'},
        {s:'Julie',et:'Galatoomi! Baay\'ee gaariidha.',fr:'Merci ! Tu es très gentil.',side:'left'}
      ]},
      {label:'Sit. 3',title:'À une fête',img:'🎉',dialogue:[
        {s:'Intala',et:'Akkam! Maqaan kee eenyu?',fr:'Salut ! Tu t\'appelles comment ?',side:'right'},
        {s:'Thomas',et:'Thomas. Atis hoo?',fr:'Thomas. Et toi ?',side:'left'},
        {s:'Intala',et:'Ani Hawi. Lammii Firaansaayiitii?',fr:'Moi je suis Hawi. Tu es français ?',side:'right'},
        {s:'Thomas',et:'Eeyyeen, Liyonii irraa. Atis Shaashamannee irraa?',fr:'Oui, je suis de Lyon. Et toi tu es de Shashemene ?',side:'left'},
        {s:'Intala',et:'Lakki, Adaamaatii. Gammadeen si arge!',fr:'Non, je suis d\'Adama. Enchantée !',side:'right'},
        {s:'Thomas',et:'Gammadeen si arge!',fr:'Enchanté !',side:'left'}
      ]}
    ],
    vocab: [
      'Maqaan koo = Je m\'appelle', 'Lammii kamii? = Tu es d\'où ?', 'Irraa dhufa = Je suis de',
      'Lammii Firaansaayiidha = Je suis français(e)', 'Barachuun jira = Je suis en train d\'apprendre',
      'Baga nagaan dhufte! = Bienvenue !', 'Gammadeen si arge! = Enchanté(e) !'
    ],
    quiz: [
      {q:'Afaan Oromootti "Je m\'appelle" akkamiin jedha?',opts:['Ani','Maqaan koo','Qabaa','Jiraadha'],ans:1},
      {q:'Jechuun "Lammii kamii?" maal jechuudha?',opts:['Comment tu t\'appelles ?','Quel âge tu as ?','Tu es d\'où ?','Tu habites où ?'],ans:2},
      {q:'Afaan Oromootti "Enchanté" akkamiin jedha?',opts:['Galatoomi','Dhiifama','Nagaan','Gammadeen si arge!'],ans:3}
    ]
  },

  // 35/48 -- Demander son Chemin -- Kallattii Gaafadhu
  {
    id: 'chemin2', level: 2, emoji: '🗺️',
    name: 'Demander son Chemin', sub: 'Kallattii Gaafadhu', type: 'dialog',
    situations: [
      {label:'Sit. 1',title:'Trouver la gare',img:'🚉',dialogue:[
        {s:'Daawwataa',et:'Dhiifama, buufatni traakinii eessa jira?',fr:'Pardon, où est la gare ?',side:'left'},
        {s:'Dubartii',et:'Kallattiin deemi ergasii bitaatti garagalii.',fr:'Continue tout droit et tourne à gauche.',side:'right'},
        {s:'Daawwataa',et:'Fagoo jiraa?',fr:'C\'est loin ?',side:'left'},
        {s:'Dubartii',et:'Lakki, dhiyoo jira. Daqiiqaa shan qofa.',fr:'Non, c\'est près. C\'est cinq minutes.',side:'right'},
        {s:'Daawwataa',et:'Baay\'ee galatoomi.',fr:'Merci beaucoup.',side:'left'},
        {s:'Dubartii',et:'Nagaan!',fr:'De rien !',side:'right'}
      ]},
      {label:'Sit. 2',title:'Trouver une pharmacie',img:'💊',dialogue:[
        {s:'Marc',et:'Dhiifama, farmaasinni dhiyotti jiraa?',fr:'Pardon, il y a une pharmacie près d\'ici ?',side:'left'},
        {s:'Dargagoo',et:'Eeyyeen. Dallaa kana gaditti qajeeli ergasii mirgutti garagali.',fr:'Oui. Descends cette rue et tourne à droite.',side:'right'},
        {s:'Marc',et:'Baankii booda?',fr:'Après la banque ?',side:'left'},
        {s:'Dargagoo',et:'Eeyyeen, siruma. Balballi magariisa isa.',fr:'Oui, exactement. C\'est la porte verte.',side:'right'},
        {s:'Marc',et:'Amma banama jiraa?',fr:'Elle est ouverte maintenant ?',side:'left'},
        {s:'Dargagoo',et:'Eeyyeen, nan yaada.',fr:'Oui, je crois que oui.',side:'right'}
      ]},
      {label:'Sit. 3',title:'Trouver un supermarché',img:'🛒',dialogue:[
        {s:'Julie',et:'Dhiifama, suupaarmaarketni as jiraa?',fr:'Pardon, il y a un supermarché ici ?',side:'left'},
        {s:'Jaarsa',et:'Eeyyeen, fuulduritti jira, kaafee cinaa.',fr:'Oui, il est en face, à côté du bar.',side:'right'},
        {s:'Julie',et:'Mirgutti moo bitaatti?',fr:'À droite ou à gauche ?',side:'left'},
        {s:'Jaarsa',et:'Mirgutti. Baay\'ee guddaadha.',fr:'À droite. Il est très grand.',side:'right'},
        {s:'Julie',et:'Baay\'ee gaarii! Galatoomi.',fr:'Parfait ! Merci.',side:'left'},
        {s:'Jaarsa',et:'Nagaan, guyyaan kee nagaa haa ta\'u!',fr:'De rien, bonne journée !',side:'right'}
      ]}
    ],
    vocab: [
      'Dhiifama = Pardon / Excusez-moi', '...eessa jira? = Où est... ?', 'Kallattiin = Tout droit', 'Bitaatti = À gauche',
      'Mirgutti = À droite', 'Dhiyoo = Près', 'Fagoo = Loin'
    ],
    quiz: [
      {q:'Afaan Oromootti "Tout droit" akkamiin jedha?',opts:['Mirgutti','Bitaatti','Kallattiin','Fuulduritti'],ans:2},
      {q:'Jechuun "Farmaasinni dhiyotti jiraa?" maal jechuudha?',opts:['La pharmacie est fermée','Il y a une pharmacie près d\'ici ?','Où est la pharmacie ?','La pharmacie est loin ?'],ans:1},
      {q:'Afaan Oromootti "À gauche" akkamiin jedha?',opts:['Kallattiin','Mirgutti','Duubatti','Bitaatti'],ans:3}
    ]
  },

  // 36/48 -- Commander au Café -- Kaaffeetti Ajajuu
  {
    id: 'bar2', level: 2, emoji: '☕',
    name: 'Commander au Café', sub: 'Kaaffeetti Ajajuu', type: 'dialog',
    situations: [
      {label:'Sit. 1',title:'Commande simple',img:'☕',dialogue:[
        {s:'Maamilaa',et:'Akkam! Buna qara\'ee tokko, maaloo.',fr:'Bonjour ! Un café au lait, s\'il vous plaît.',side:'left'},
        {s:'Tajaajilaa',et:'Qara\'ee wajjin moo qullaa?',fr:'Noir ou au lait ?',side:'right'},
        {s:'Maamilaa',et:'Qara\'ee wajjin, maaloo.',fr:'Au lait, s\'il vous plaît.',side:'left'},
        {s:'Tajaajilaa',et:'Sukkaara barbaaddaa?',fr:'Vous voulez du sucre ?',side:'right'},
        {s:'Maamilaa',et:'Eeyyeen, tokko. Meeqadha?',fr:'Oui, un. C\'est combien ?',side:'left'},
        {s:'Tajaajilaa',et:'Birraa tokko fi saddet.',fr:'Un euro cinquante.',side:'right'}
      ]},
      {label:'Sit. 2',title:'Commander de la nourriture',img:'🍢',dialogue:[
        {s:'Tajaajilaa',et:'Maal fudhattan?',fr:'Qu\'est-ce que vous prenez ?',side:'right'},
        {s:'Caaltuu',et:'Suufii tokko, maaloo.',fr:'Une bière, s\'il vous plaît.',side:'left'},
        {s:'Tolaa',et:'Anaan bishaanii tokko. Nyaata qabduu?',fr:'Et moi, une eau. Vous avez à manger ?',side:'right'},
        {s:'Tajaajilaa',et:'Eeyyeen. Injera fi tibs qabna.',fr:'Oui. Il y a de l\'injera et du tibs.',side:'right'},
        {s:'Caaltuu',et:'Baay\'ee gaarii! Tibs tokko, maaloo.',fr:'Parfait ! Du tibs, s\'il vous plaît.',side:'left'},
        {s:'Tajaajilaa',et:'Amma fida!',fr:'Tout de suite !',side:'right'}
      ]},
      {label:'Sit. 3',title:'Payer l\'addition',img:'🧾',dialogue:[
        {s:'Maamilaa',et:'Kafaltii, maaloo.',fr:'L\'addition, s\'il vous plaît.',side:'left'},
        {s:'Tajaajilaa',et:'Birraa saddet.',fr:'C\'est huit euros.',side:'right'},
        {s:'Maamilaa',et:'Kaardiin kaffalamuudha?',fr:'On peut payer par carte ?',side:'left'},
        {s:'Tajaajilaa',et:'Eeyyeen, dhugumatti.',fr:'Oui, bien sûr.',side:'right'},
        {s:'Maamilaa',et:'Kunoo fudhii. Galatoomi.',fr:'Voilà. Merci.',side:'left'},
        {s:'Tajaajilaa',et:'Galatoomi! Itti aansuun wal arginaa!',fr:'Merci à vous ! À bientôt !',side:'right'}
      ]}
    ],
    vocab: [
      'Buna qara\'ee = Un café au lait', 'Buna qullaa = Un café noir', 'Meeqadha? = C\'est combien ?', 'Kafaltii = L\'addition',
      'Kaardiin kaffalamuudha? = On peut payer par carte ?', 'Tibs = Le tibs (viande grillée)', 'Amma fida! = Tout de suite !'
    ],
    quiz: [
      {q:'Afaan Oromootti "Un café noir" akkamiin jedha?',opts:['Buna qara\'ee','Buna mi\'ooftuu','Buna qullaa','Buna qorraa'],ans:2},
      {q:'Jechuun "Kafaltii, maaloo" maal jechuudha?',opts:['Le menu, s\'il vous plaît','L\'addition, s\'il vous plaît','Un café, s\'il vous plaît','L\'eau, s\'il vous plaît'],ans:1},
      {q:'Afaan Oromootti "C\'est combien ?" akkamiin jedha?',opts:['Eessa jira?','Maaltu jira?','Meeqadha?','Maqaan isaanii eenyu?'],ans:2}
    ]
  },

  // 37/48 -- Commander un Repas -- Nyaata Ajajadhu
  {
    id: 'resto2', level: 2, emoji: '🍽️',
    name: 'Commander un Repas', sub: 'Nyaata Ajajadhu', type: 'dialog',
    situations: [
      {label:'Sit. 1',title:'Avoir une table',img:'🪑',dialogue:[
        {s:'Maamilaa',et:'Akkam, nama lamaa teessoo qabduu?',fr:'Bonjour, vous avez une table pour deux ?',side:'left'},
        {s:'Tajaajilttuu',et:'Eeyyeen, as kottaa, maaloo.',fr:'Oui, par ici, s\'il vous plaît.',side:'right'},
        {s:'Maamilaa',et:'Galatoomi. Menuu guyyaa qabduu?',fr:'Merci. Vous avez le menu du jour ?',side:'left'},
        {s:'Tajaajilttuu',et:'Eeyyeen. Har\'a maraq, daadhii fi mi\'eessaa qabna.',fr:'Oui. Aujourd\'hui il y a soupe, dorho et dessert.',side:'right'},
        {s:'Maamilaa',et:'Menuu sun meeqa?',fr:'Le menu coûte combien ?',side:'left'},
        {s:'Tajaajilttuu',et:'Birraa kudha lama, dhugaatii dabalatee.',fr:'Douze euros, boisson comprise.',side:'right'}
      ]},
      {label:'Sit. 2',title:'Commander à table',img:'🥗',dialogue:[
        {s:'Tajaajilaa',et:'Ajaja kennuuf qophaa\'taniittuu?',fr:'Vous êtes prêts à commander ?',side:'right'},
        {s:'Sophie',et:'Eeyyeen. Jalqaba, salaaxi tokko.',fr:'Oui. En entrée, une salade.',side:'left'},
        {s:'Tajaajilaa',et:'Booda hoo?',fr:'Et en plat ?',side:'right'},
        {s:'Sophie',et:'Daadhii, maaloo. Foon malee waa qabduu?',fr:'Le dorho, s\'il vous plaît. Vous avez quelque chose sans viande ?',side:'left'},
        {s:'Tajaajilaa',et:'Eeyyeen, atara mi\'ooftuu qabna.',fr:'Oui, il y a des légumes.',side:'right'},
        {s:'Sophie',et:'Baay\'ee gaarii, san barbaada.',fr:'Parfait, c\'est ça que je veux.',side:'left'}
      ]},
      {label:'Sit. 3',title:'Un problème avec la commande',img:'🤔',dialogue:[
        {s:'Maamilaa',et:'Dhiifama, kuni ani ajaje miti.',fr:'Pardon, ce n\'est pas ce que j\'ai commandé.',side:'left'},
        {s:'Tajaajilaa',et:'Dhiifama. Maal ajajde?',fr:'Je suis désolé. Qu\'est-ce que vous avez commandé ?',side:'right'},
        {s:'Maamilaa',et:'Qurxummii ajajee, foon miti.',fr:'J\'ai commandé le poisson, pas la viande.',side:'left'},
        {s:'Tajaajilaa',et:'Dhiifama, amma jijjiira.',fr:'Excusez-moi, je le change tout de suite.',side:'right'},
        {s:'Maamilaa',et:'Galatoomi.',fr:'Merci.',side:'left'},
        {s:'Tajaajilaa',et:'Baay\'ee dhiifama!',fr:'Je suis vraiment désolé !',side:'right'}
      ]}
    ],
    vocab: [
      'Nama lamaa teessoo qabduu? = Vous avez une table pour deux ?', 'Menuu guyyaa = Le menu du jour', 'Jalqaba = En entrée',
      'Booda = En plat', 'Foon malee = Sans viande', 'Dhugaatii dabalatee = Boisson comprise',
      'Kuni ani ajaje miti = Ce n\'est pas ce que j\'ai commandé'
    ],
    quiz: [
      {q:'Oromiyaa keessatti "Menuu guyyaa" maal jechuudha?',opts:['La carte du soir','Le menu du jour à prix fixe','Le plat du chef','Un menu gastronomique'],ans:1},
      {q:'Afaan Oromootti "En entrée" akkamiin jedha?',opts:['Mi\'eessaa','Booda','Dhugaatiif','Jalqaba'],ans:3},
      {q:'Jechuun "Foon malee" maal jechuudha?',opts:['Avec de la viande','Sans poisson','Sans viande','Avec du poulet'],ans:2}
    ]
  },

  // 38/48 -- Faire les Courses -- Gabaa deemu
  {
    id: 'compras2', level: 2, emoji: '🛍️',
    name: 'Faire les Courses', sub: 'Gabaa deemu', type: 'dialog',
    situations: [
      {label:'Sit. 1',title:'Au marché',img:'🧺',dialogue:[
        {s:'Maamilaa',et:'Nagaan bultee. Toomaatiin meeqa?',fr:'Bonjour. Combien coûtent les tomates ?',side:'left'},
        {s:'Gurgurtaa',et:'Kiiloon birraa lama.',fr:'Deux euros le kilo.',side:'right'},
        {s:'Maamilaa',et:'Kiiloo tokko barbaada, maaloo.',fr:'Je veux un kilo, s\'il vous plaît.',side:'left'},
        {s:'Gurgurtaa',et:'Kan biraa hoo?',fr:'Autre chose ?',side:'right'},
        {s:'Maamilaa',et:'Eeyyeen, burtukaana qabduu?',fr:'Oui, vous avez des oranges ?',side:'left'},
        {s:'Gurgurtaa',et:'Eeyyeen. Kiiloon birraa tokko.',fr:'Oui. C\'est un euro le kilo.',side:'right'}
      ]},
      {label:'Sit. 2',title:'Dans un magasin de vêtements',img:'👗',dialogue:[
        {s:'Tajaajilttuu',et:'Akkam! Si gargaaruu dandaahaa?',fr:'Bonjour ! Je peux vous aider ?',side:'right'},
        {s:'Lucie',et:'Eeyyeen, uffata barbaada.',fr:'Oui, je cherche un t-shirt.',side:'left'},
        {s:'Tajaajilttuu',et:'Saayiziin kee meeqa?',fr:'Vous faites quelle taille ?',side:'right'},
        {s:'Lucie',et:'Saayizii jiddugaleessa.',fr:'La taille moyenne.',side:'left'},
        {s:'Tajaajilttuu',et:'Yaaluu dandeessaa? Uffanno as jira.',fr:'Vous pouvez l\'essayer ? La cabine est là.',side:'right'},
        {s:'Lucie',et:'Galatoomi! Meeqa?',fr:'Merci ! Elle coûte combien ?',side:'left'}
      ]},
      {label:'Sit. 3',title:'À la caisse',img:'🛒',dialogue:[
        {s:'Kassaa',et:'Akkam! Hundayyuu gaariidha?',fr:'Bonjour ! Tout va bien ?',side:'right'},
        {s:'Maamilaa',et:'Eeyyeen, galatoomi. Waliigalatti meeqa?',fr:'Oui, merci. C\'est combien en tout ?',side:'left'},
        {s:'Kassaa',et:'Birraa kudha shan fi digdama.',fr:'C\'est quinze euros vingt.',side:'right'},
        {s:'Maamilaa',et:'Kaardiin kaffaluu dandaahaa?',fr:'Je peux payer par carte ?',side:'left'},
        {s:'Kassaa',et:'Eeyyeen, rakkoo tokko hin jiru.',fr:'Oui, sans problème.',side:'right'},
        {s:'Maamilaa',et:'Kunoo fudhii. Galatoomi!',fr:'Voilà. Merci !',side:'left'}
      ]}
    ],
    vocab: [
      'Meeqa? = Combien ça coûte ?', 'Barbaada = Je veux', 'Kan biraa hoo? = Autre chose ?', 'Barbaada = Je cherche',
      'Saayizii = La taille', 'Uffanno = La cabine d\'essayage', 'Waliigalatti meeqa? = C\'est combien en tout ?'
    ],
    quiz: [
      {q:'Afaan Oromootti "Je cherche" akkamiin jedha?',opts:['Qabaa','Barbaada','Fudhaa','Bitaa'],ans:2},
      {q:'Jechuun "Kan biraa hoo?" maal jechuudha?',opts:['C\'est tout ?','Autre chose ?','Vous avez ça ?','C\'est combien ?'],ans:1},
      {q:'Afaan Oromootti "La taille" (uffata) akkamiin jedha?',opts:['Halluu','Gatii','Saayizii','Lakkoofsa'],ans:2}
    ]
  },

  // 39/48 -- Se Déplacer -- Naannoo Keessa Socho'uu
 {
    id: 'transp2', level: 2, emoji: '🚌',
    name: 'Se Déplacer', sub: 'Naannoo Keessa Socho\'uu', type: 'dialog',
    situations: [
      {label:'Sit. 1',title:'Dans le minibus',img:'🚌',dialogue:[
        {s:'Imaltuu',et:'Dhiifama, kuni bustii magaalaa gidduu deemaa?',fr:'Pardon, ce bus va au centre ?',side:'left'},
        {s:'Dubartii',et:'Lakki. Lakkoofsa lama fudhachuu qabda.',fr:'Non. Tu dois prendre le numéro deux.',side:'right'},
        {s:'Imaltuu',et:'Lakkoofsi lama eessa jira?',fr:'Où est le numéro deux ?',side:'left'},
        {s:'Dubartii',et:'Achitti, mirgutti.',fr:'Là-bas, à droite.',side:'right'},
        {s:'Imaltuu',et:'Buufatni meeqa?',fr:'C\'est combien d\'arrêts ?',side:'left'},
        {s:'Dubartii',et:'Buufata afur. Adaamaatti bu\'a.',fr:'Quatre arrêts. Tu descends à Adama.',side:'right'}
      ]},
      {label:'Sit. 2',title:'Acheter un billet',img:'🎫',dialogue:[
        {s:'Imaltuu',et:'Akkam, tikkeettii tokko barbaada, maaloo.',fr:'Bonjour, je veux un billet, s\'il vous plaît.',side:'left'},
        {s:'Hojjettuu',et:'Tokko moo kudhan?',fr:'Simple ou carnet de dix ?',side:'right'},
        {s:'Imaltuu',et:'Tikkeettii tokkoon meeqa?',fr:'Combien coûte le billet simple ?',side:'left'},
        {s:'Hojjettuu',et:'Birraa tokko fi saddet. Kudhan birraa kudha lama.',fr:'Un euro cinquante. Le carnet de dix c\'est douze euros.',side:'right'},
        {s:'Imaltuu',et:'Kudhan barbaada.',fr:'Je veux le carnet de dix.',side:'left'},
        {s:'Hojjettuu',et:'Kunoo fudhii.',fr:'Voilà.',side:'right'}
      ]},
      {label:'Sit. 3',title:'Dans le bajaj',img:'🛺',dialogue:[
        {s:'Imaltuu',et:'Dhiifama, kuni baajajni Shaashamannee deemaa?',fr:'Pardon, ce bajaj va à Shashemene ?',side:'left'},
        {s:'Jaarsa',et:'Lakki, kuni buufata xiyyaaraa deema.',fr:'Non, celui-ci va à l\'aéroport.',side:'right'},
        {s:'Imaltuu',et:'Baajajni kami Shaashamannee deema?',fr:'Quel bajaj va à Shashemene ?',side:'left'},
        {s:'Jaarsa',et:'Lakkoofsa digdama sadii.',fr:'Le numéro vingt-trois.',side:'right'},
        {s:'Imaltuu',et:'Buufatni eessa jira?',fr:'Où est l\'arrêt ?',side:'left'},
        {s:'Jaarsa',et:'Fuulduritti jira, dallaa biroo.',fr:'Il est en face, de l\'autre côté de la rue.',side:'right'}
      ]}
    ],
    vocab: [
      'Bustii fudhachuu = Prendre le bus', 'Lakkoofsa = La ligne / Le numéro', 'Buufata = L\'arrêt',
      'Tikkeettii tokkoo = Le billet simple', '...tti bu\'uu = Descendre à', 'Buufatni meeqa? = Combien d\'arrêts ?',
      'Baajajni = Le bajaj (taxi tricycle)'
    ],
    quiz: [
      {q:'Afaan Oromootti "Prendre le bus" akkamiin jedha?',opts:['Bustii deemuu','Bustii fudhachuu','Bustii irraa bu\'uu','Bustii barbaaduu'],ans:1},
      {q:'Jechuun "Buufata" maal jechuudha?',opts:['Le billet','La ligne','L\'arrêt','Le quai'],ans:2},
      {q:'Afaan Oromootti "Descendre à Adama" akkamiin jedha?',opts:['Adaamaatti ol ba\'uu','Adaama deemuu','Adaamaatti bu\'uu','Adaama fudhachuu'],ans:2}
    ]
  },

  // 40/48 -- Arriver à l'Hôtel -- Hoteela Gahuu
  {
    id: 'hotel2', level: 2, emoji: '🏨',
    name: 'Arriver à l\'Hôtel', sub: 'Hoteela Gahuu', type: 'dialog',
    situations: [
      {label:'Sit. 1',title:'Arrivée à la réception',img:'🛎️',dialogue:[
        {s:'Simataa',et:'Gaarii bulee! Beellama qabduu?',fr:'Bonsoir ! Vous avez une réservation ?',side:'right'},
        {s:'Keessumaa',et:'Eeyyeen. Maqaan koo Dupont. Kutaa lama.',fr:'Oui. Je m\'appelle Dupont. Une chambre double.',side:'left'},
        {s:'Simataa',et:'Kunoo. Paaspoortii kee, maaloo?',fr:'Voilà. Votre passeport, s\'il vous plaît ?',side:'right'},
        {s:'Keessumaa',et:'Kunoo fudhii. Ciree dabalatamee?',fr:'Voilà. Le petit-déjeuner est inclus ?',side:'left'},
        {s:'Simataa',et:'Eeyyeen, torba irraa kudha.',fr:'Oui, de sept à dix heures.',side:'right'},
        {s:'Keessumaa',et:'Baay\'ee gaarii! Galatoomi.',fr:'Parfait ! Merci.',side:'left'}
      ]},
      {label:'Sit. 2',title:'Un problème dans la chambre',img:'🔧',dialogue:[
        {s:'Keessumaa',et:'Akkam. Kutaa koo keessa rakkoo jira.',fr:'Bonjour. Il y a un problème dans ma chambre.',side:'left'},
        {s:'Simataa',et:'Maal ta\'e?',fr:'Qu\'est-ce qui se passe ?',side:'right'},
        {s:'Keessumaa',et:'Qilleensa kondishinii hin hojjetu.',fr:'La climatisation ne fonctionne pas.',side:'left'},
        {s:'Simataa',et:'Dhiifama. Kutaa jijjiiruu barbaaddaa?',fr:'Je suis désolé. Vous voulez changer de chambre ?',side:'right'},
        {s:'Keessumaa',et:'Eeyyeen, maaloo.',fr:'Oui, s\'il vous plaît.',side:'left'},
        {s:'Simataa',et:'Kunoo 320 cufaa fudhii.',fr:'Voilà la clé de la trois cent vingt.',side:'right'}
      ]},
      {label:'Sit. 3',title:'Demander des infos',img:'🗺️',dialogue:[
        {s:'Keessumaa',et:'Dhiifama, mana nyaataa dhiyoo jiraa?',fr:'Pardon, il y a un restaurant près d\'ici ?',side:'left'},
        {s:'Simataa',et:'Eeyyeen, daqiiqaa lama keessa tokko baay\'ee gaarii jira.',fr:'Oui, il y en a un très bon à deux minutes.',side:'right'},
        {s:'Keessumaa',et:'Asitti waan daawwachuu dandaahamu jiraa?',fr:'Et il y a des choses à visiter ici ?',side:'left'},
        {s:'Simataa',et:'Eeyyeen, waldaan amantii baay\'ee dhiyoo jira.',fr:'Oui, l\'église est très près.',side:'right'},
        {s:'Keessumaa',et:'Har\'a banama jiraa?',fr:'Elle est ouverte aujourd\'hui ?',side:'left'},
        {s:'Simataa',et:'Eeyyeen, sagal irraa kudha jaha.',fr:'Oui, de neuf heures à dix-huit heures.',side:'right'}
      ]}
    ],
    vocab: [
      'Beellama qabduu? = Vous avez une réservation ?', 'Kutaa lama = La chambre double',
      'Ciree dabalatame = Le petit-déjeuner inclus', 'Hin hojjetu = Ça ne fonctionne pas',
      'Kutaa jijjiiruu = Changer de chambre', 'Cufaa = La clé', 'Banama jiraa? = C\'est ouvert ?'
    ],
    quiz: [
      {q:'Afaan Oromootti "La chambre double" akkamiin jedha?',opts:['Kutaa tokkee','Kutaa lama','Kutaa guddaa','Kutaa maatii'],ans:1},
      {q:'Jechuun "Hin hojjetu" maal jechuudha?',opts:['C\'est fermé','Ça ne marche pas','C\'est cassé','Je ne sais pas'],ans:1},
      {q:'Afaan Oromootti "La clé" akkamiin jedha?',opts:['Balbala','Mana','Cufaa','Ol ba\'aa'],ans:2}
    ]
  },

  // 41/48 -- Chercher un Logement -- Bakka Jireenyaa Barbaadi
 {
    id: 'logement2', level: 2, emoji: '🏠',
    name: 'Chercher un Logement', sub: 'Bakka Jireenyaa Barbaadi', type: 'dialog',
    situations: [
      {label:'Sit. 1',title:'Appeler pour une maison',img:'📱',dialogue:[
        {s:'Maamilaa',et:'Akkam, mana kiraa irratti bilbilaa jira.',fr:'Bonjour, j\'appelle pour la maison en location.',side:'left'},
        {s:'Abbaa mana',et:'Eeyyeen. Nama meeqaaf?',fr:'Oui. Pour combien de personnes ?',side:'right'},
        {s:'Maamilaa',et:'Nama tokkoof. Kiraan meeqa?',fr:'Pour une personne. Le loyer c\'est combien ?',side:'left'},
        {s:'Abbaa mana',et:'Ji\'aatti birraa dhibba torba.',fr:'Sept cents euros par mois.',side:'right'},
        {s:'Maamilaa',et:'Gatiin dabalatamee?',fr:'Les charges sont incluses ?',side:'left'},
        {s:'Abbaa mana',et:'Lakki, gatiin addaadha.',fr:'Non, les charges sont en plus.',side:'right'}
      ]},
      {label:'Sit. 2',title:'Visiter la maison',img:'🔑',dialogue:[
        {s:'Abbaa mana',et:'Galma guddaadha, ifaas jira.',fr:'Le salon est grand et très lumineux.',side:'right'},
        {s:'Maamilaa',et:'Nan jaalladha! Kutaa meeqa jira?',fr:'J\'aime bien ! Il a combien de chambres ?',side:'left'},
        {s:'Abbaa mana',et:'Kutaa lama fi mandaraa tokko.',fr:'Deux chambres et une salle de bain.',side:'right'},
        {s:'Maamilaa',et:'Ho\'isa qabaa?',fr:'Il y a le chauffage ?',side:'left'},
        {s:'Abbaa mana',et:'Eeyyeen, ho\'isaa jira.',fr:'Oui, il y a des radiateurs.',side:'right'},
        {s:'Maamilaa',et:'Yaaduu dandaahaa?',fr:'Je peux réfléchir ?',side:'left'}
      ]},
      {label:'Sit. 3',title:'Un problème dans la maison',img:'🔧',dialogue:[
        {s:'Kireessituu',et:'Akkam, rakkoo jira. Bishaan hin dhuftu.',fr:'Bonjour, il y a un problème. L\'eau ne fonctionne pas.',side:'left'},
        {s:'Abbaa mana',et:'Yoomii irraa?',fr:'Depuis quand ?',side:'right'},
        {s:'Kireessituu',et:'Har\'a ganama irraa.',fr:'Depuis ce matin.',side:'left'},
        {s:'Abbaa mana',et:'Amma hidhaata bishaan qaxaara.',fr:'Je vais appeler le plombier maintenant.',side:'right'},
        {s:'Kireessituu',et:'Har\'a dhufaa?',fr:'Il vient aujourd\'hui ?',side:'left'},
        {s:'Abbaa mana',et:'Eeyyeen, nan yaada.',fr:'Oui, je crois que oui.',side:'right'}
      ]}
    ],
    vocab: [
      'Kiraa = Le loyer', 'Gatii = Les charges', 'Kutaalee = Les chambres', 'Ho\'isaa = Le chauffage',
      'Kireessituu = Le locataire', 'Hidhaata bishaan = Le plombier', 'Gatiin addaadha = Les charges sont en plus'
    ],
    quiz: [
      {q:'Jechuun "Gatiin addaadha" maal jechuudha?',opts:['Tout compris','Les charges sont incluses','Les charges sont en plus','C\'est gratuit'],ans:2},
      {q:'Afaan Oromootti "Le plombier" akkamiin jedha?',opts:['Ibsaa hojjetaa','Hidhaata bishaan','Muka hojjetaa','Barreessaa'],ans:1},
      {q:'Jechuun "Kiraa" maal jechuudha?',opts:['La vente','Le loyer','La maison','Le contrat'],ans:1}
    ]
  },

  // 42/48 -- Parler de la Météo -- Waa'ee Qilleensaa Haasa'uu
  {
    id: 'meteo2', level: 2, emoji: '☀️',
    name: 'Parler de la Météo', sub: 'Waa\'ee Qilleensaa Haasa\'uu', type: 'dialog',
    situations: [
      {label:'Sit. 1',title:'Parler du temps',img:'🌤️',dialogue:[
        {s:'Tulluu',et:'Har\'a baay\'ee ho\'aa!',fr:'Quelle chaleur aujourd\'hui !',side:'left'},
        {s:'Romain',et:'Eeyyeen, baay\'ee ho\'aa. Digrii meeqa?',fr:'Oui, il fait très chaud. Il fait combien de degrés ?',side:'right'},
        {s:'Tulluu',et:'Digrii soddomaa fi shan.',fr:'Trente-cinq degrés.',side:'left'},
        {s:'Romain',et:'Baay\'ee dha! As bishaan dhaabbataa jiraa?',fr:'C\'est beaucoup ! Il y a une piscine ici ?',side:'right'},
        {s:'Tulluu',et:'Eeyyeen, hootelatti jira.',fr:'Oui, elle est à l\'hôtel.',side:'left'},
        {s:'Romain',et:'Haa deemuun!',fr:'Allons-y !',side:'right'}
      ]},
      {label:'Sit. 2',title:'Prévoir la sortie',img:'🌧️',dialogue:[
        {s:'Birraa',et:'Har\'a bahuun?',fr:'On sort aujourd\'hui ?',side:'left'},
        {s:'Camille',et:'Hin beeku. Qilleensi akkam?',fr:'Je ne sais pas. Il fait quel temps ?',side:'right'},
        {s:'Birraa',et:'Xiqqoo roobu.',fr:'Il pleut un peu.',side:'left'},
        {s:'Camille',et:'Arfasaa qabdaa?',fr:'Tu as un parapluie ?',side:'right'},
        {s:'Birraa',et:'Lakki. Atis?',fr:'Non. Et toi ?',side:'left'},
        {s:'Camille',et:'Ani qabaa. Waloon haa deemnu!',fr:'Moi oui. Allons-y ensemble !',side:'right'}
      ]},
      {label:'Sit. 3',title:'Parler des saisons',img:'🍂',dialogue:[
        {s:'Caaltuu',et:'Yeroon bareedaan kee kami?',fr:'Quelle est ta saison préférée ?',side:'right'},
        {s:'Théo',et:'Gannaa. Aduu fi ho\'a jaalladha.',fr:'L\'été. J\'aime le soleil et la chaleur.',side:'left'},
        {s:'Caaltuu',et:'Ani birraa jaalladha. Hin qorruu hin ho\'u.',fr:'Moi je préfère l\'automne. Il ne fait ni chaud ni froid.',side:'right'},
        {s:'Théo',et:'Oromiyaa keessaas? Gannaa baay\'ee qorraa?',fr:'Et en Oromia ? Il fait très froid en hiver ?',side:'left'},
        {s:'Caaltuu',et:'Irratti. Shaashamanneetti eeyyeen, Adaamaatti miti.',fr:'Ça dépend. À Shashemene oui, à Adama non.',side:'right'},
        {s:'Théo',et:'Baay\'ee nama barsiisa!',fr:'Comme c\'est intéressant !',side:'left'}
      ]}
    ],
    vocab: [
      'Ho\'aa! = Quelle chaleur !', 'Qorraa = Il fait froid', 'Ho\'aa = Il fait chaud', 'Roobu = Il pleut',
      'Arfasaa = Le parapluie', 'Gannaa = L\'été', 'Bona = L\'hiver'
    ],
    quiz: [
      {q:'Afaan Oromootti "Il fait froid" akkamiin jedha?',opts:['Ho\'aa','Aduu jira','Roobu','Qorraa'],ans:3},
      {q:'Jechuun "Ho\'aa baay\'ee!" maal jechuudha?',opts:['Quelle chance !','Quelle chaleur !','Quel froid !','Quel vent !'],ans:1},
      {q:'Afaan Oromootti "Le parapluie" akkamiin jedha?',opts:['Uffata ciicha','Haguugoo','Arfasaa','Kofii'],ans:2}
    ]
  },

  // 43/48 -- L'Heure et la Météo -- Yeroo fi Qilleensa
  {
    id: 'temps2', level: 2, emoji: '🕐',
    name: 'L\'Heure et la Météo', sub: 'Yeroo fi Qilleensa', type: 'dialog',
    note: '📍 Attention : en Oromia, l\'heure éthiopienne (sa\'atii Itoophiyaa) commence à 6h du matin (notre 6h = leur 12h). La journée à Shashamané est rythmée par le soleil, pas par les horloges !',
    situations: [
      {label:'Sit. 1',title:'Quelle heure est-il ?',img:'⏰',dialogue:[
        {s:'Marc',et:'Dhiifama, sa\'atii meeqa?',fr:'Pardon, quelle heure est-il ?',side:'left'},
        {s:'Caaltuu',et:'Sa\'atii sadii fi walakkaa.',fr:'Il est trois heures et demie.',side:'right'},
        {s:'Marc',et:'Baankiin amma banama jiraa?',fr:'La banque est encore ouverte ?',side:'left'},
        {s:'Caaltuu',et:'Eeyyeen, hanga shan banama.',fr:'Oui, elle est ouverte jusqu\'à cinq heures.',side:'right'},
        {s:'Marc',et:'Galatoomi! Ariifadhee deema.',fr:'Merci ! Je dois me dépêcher.',side:'left'},
        {s:'Caaltuu',et:'Ariifi! Nagaan!',fr:'Vas-y ! Bonne chance !',side:'right'}
      ]},
      {label:'Sit. 2',title:'Parler de la météo',img:'🌤️',dialogue:[
        {s:'Sophie',et:'Qilleensi har\'a akkam?',fr:'Il fait quel temps aujourd\'hui ?',side:'left'},
        {s:'Lamma',et:'Ganama ho\'aa, garuu galgala roobu dandaa.',fr:'Il fait chaud le matin, mais il peut pleuvoir le soir.',side:'right'},
        {s:'Sophie',et:'Shaashamanneetti yeroo maraan akkana?',fr:'À Shashamané c\'est souvent comme ça ?',side:'left'},
        {s:'Lamma',et:'Arfasaatti eeyyeen. Roobni guyyaa guyyaa dhufa.',fr:'En saison des pluies oui. Il pleut tous les jours.',side:'right'},
        {s:'Sophie',et:'Faransaayitti garuu bona qofaa.',fr:'En France c\'est seulement en hiver.',side:'left'},
        {s:'Lamma',et:'Baay\'ee adda! As ho\'a baay\'ee jaalladha.',fr:'C\'est très différent ! Ici j\'aime beaucoup la chaleur.',side:'right'}
      ]},
      {label:'Sit. 3',title:'Planifier selon la météo',img:'🌧️',dialogue:[
        {s:'Iftu',et:'Boruu gabaa deemna?',fr:'On va au marché demain ?',side:'right'},
        {s:'Théo',et:'Qilleensi akkam jedha?',fr:'Qu\'est-ce que dit la météo ?',side:'left'},
        {s:'Iftu',et:'Roobu jetteetti. Aanoo roobaa kaasi!',fr:'Elle dit qu\'il va pleuvoir. Prends ton parapluie !',side:'right'},
        {s:'Théo',et:'Tolee. Sa\'atii meeqatti deemna?',fr:'D\'accord. On y va à quelle heure ?',side:'left'},
        {s:'Iftu',et:'Ganama sa\'atii saddeet. Roobni dura deemuun wayya.',fr:'À huit heures du matin. Mieux vaut partir avant la pluie.',side:'right'},
        {s:'Théo',et:'Eeyyeen! Ganamaas ko\'otni baay\'ee jiru.',fr:'Oui ! Et le matin il y a plus de choix au marché.',side:'left'}
      ]}
    ],
    vocab: [
      'Sa\'atii meeqa? = Quelle heure est-il ?', 'Hanga ... banama = Ouvert jusqu\'à...', 'Ariifi! = Dépêche-toi !',
      'Qilleensi akkam? = Quel temps fait-il ?', 'Arfasaatti = En saison des pluies', 'Roobni dhufa = Il va pleuvoir',
      'Aanoo roobaa kaasi = Prends ton parapluie'
    ],
    quiz: [
      {q:'Afaan Oromootti "Quelle heure est-il ?" akkamiin jedha?',opts:['Guyyaan meeqa?','Sa\'atii meeqa?','Boruu meeqa?','Daqiiqaan meeqa?'],ans:1},
      {q:'Jechuun "Arfasaatti roobu" maal jechuudha?',opts:['Il neige en hiver','Il fait chaud en été','Il pleut en saison des pluies','Il y a du vent au printemps'],ans:2},
      {q:'Afaan Oromootti "Dépêche-toi !" akkamiin jedha?',opts:['Boqo!','Deemi!','Ariifi!','Rafuu!'],ans:2}
    ]
  },

  // 44/48 -- La Vie Quotidienne -- Jireenya Guyyuu
 {
    id: 'routine2', level: 2, emoji: '🌅',
    name: 'La Vie Quotidienne', sub: 'Jireenya Guyyuu', type: 'dialog',
    note: '📍 En France, on prend rarement le temps d\'une longue cérémonie du café le matin. En Oromia (Shashamané), la cérémonie du buna (café) est un moment social important. Le shor (déjeuner) est le repas principal en France.',
    situations: [
      {label:'Sit. 1',title:'La matinée',img:'⏰',dialogue:[
        {s:'Haadha',et:'Ka\'i! Sa\'atii torba ta\'eera!',fr:'Lève-toi ! Il est sept heures !',side:'right'},
        {s:'Dargagoo',et:'Eeyyeen, amma kaa\'a. Cireen qophaa\'eeii?',fr:'Oui, je me lève. Le petit-déjeuner est prêt ?',side:'left'},
        {s:'Haadha',et:'Eeyyeen. Dhiqadhu jalqaba.',fr:'Oui. Douche-toi d\'abord.',side:'right'},
        {s:'Dargagoo',et:'Tolee. Ilkaanis?',fr:'D\'accord. Les dents aussi ?',side:'left'},
        {s:'Haadha',et:'Dhugumatti! Ilkaan eebuu dagattee?',fr:'Bien sûr ! Tu as oublié de te brosser les dents ?',side:'right'},
        {s:'Dargagoo',et:'Lakki lakki, nan yaadadha!',fr:'Non non, je m\'en souviens !',side:'left'}
      ]},
      {label:'Sit. 2',title:'Partager les tâches',img:'🧹',dialogue:[
        {s:'Julie',et:'Kana booda mana qulqulleessina.',fr:'Après on fait le ménage.',side:'left'},
        {s:'Marc',et:'Tolee. Ani meeshaa dhiqa, ati hoo?',fr:'D\'accord. Je fais la vaisselle, et toi ?',side:'right'},
        {s:'Julie',et:'Ani daakuu qulqulleessa. Uffatnis?',fr:'Moi je nettoie la cuisine. Et le linge ?',side:'left'},
        {s:'Marc',et:'Uffata dhiquu hojjedheen jira.',fr:'J\'ai déjà lavé le linge.',side:'right'},
        {s:'Julie',et:'Baay\'ee gaarii! Xumurree nyaata bilcheessina.',fr:'Super ! Après le ménage on cuisine.',side:'left'},
        {s:'Marc',et:'Yaada gaarii! Maal bilcheessina?',fr:'Bonne idée ! On fait quoi à manger ?',side:'right'}
      ]},
      {label:'Sit. 3',title:'Le soir après le travail',img:'🌆',dialogue:[
        {s:'Tolaa',et:'Hojii irraa dhufe. Dadhabee jira!',fr:'Je rentre du travail. Je suis fatigué !',side:'left'},
        {s:'Caaltuu',et:'Boqo xiqqoo. Nyaata bilcheessaan jira.',fr:'Repose-toi un peu. Je suis en train de cuisiner.',side:'right'},
        {s:'Tolaa',et:'Baay\'ee galatoomi. Maal bilcheessita?',fr:'Merci beaucoup. Tu cuisines quoi ?',side:'left'},
        {s:'Caaltuu',et:'Injera fi atara. Dhukkubsattee?',fr:'De l\'injera et des lentilles. Ça va ?',side:'right'},
        {s:'Tolaa',et:'Gaarii, baay\'ee beela\'ee jira.',fr:'Ça va, j\'ai très faim.',side:'left'},
        {s:'Caaltuu',et:'Daqiiqaa kudha booda nyaanna!',fr:'Dans dix minutes on mange !',side:'right'}
      ]}
    ],
    vocab: [
      'Ka\'i! = Lève-toi !', 'Dhiqadhu = Douche-toi', 'Ilkaan eebuu = Se brosser les dents',
      'Mana qulqulleessuu = Faire le ménage', 'Meeshaa dhiquu = Faire la vaisselle', 'Uffata dhiquu = Laver le linge',
      'Nyaata bilcheessuu = Cuisiner', 'Dadhabee jira = Je suis fatigué', 'Boqo = Repose-toi'
    ],
    quiz: [
      {q:'Afaan Oromootti "Faire le ménage" akkamiin jedha?',opts:['Mana ijaaruu','Mana qulqulleessuu','Mana bituu','Mana jijjiiruu'],ans:1},
      {q:'Jechuun "Uffata dhiquu" maal jechuudha?',opts:['Repasser le linge','Étendre le linge','Laver le linge','Porter des vêtements'],ans:2},
      {q:'Afaan Oromootti "Je suis fatigué" akkamiin jedha?',opts:['Beela\'ee jira','Dheebuu dhabe','Dadhabee jira','Rafee jira'],ans:2}
    ]
  },

  // 45/48 -- Les Loisirs -- Hojiiwwan Yeroo Boqonnaa
  {
    id: 'gustos2', level: 2, emoji: '❤️',
    name: 'Les Loisirs', sub: 'Hojiiwwan Yeroo Boqonnaa', type: 'dialog',
    situations: [
      {label:'Sit. 1',title:'Parler de musique',img:'🎵',dialogue:[
        {s:'Iftu',et:'Muuziiqaa jaallattaa?',fr:'Tu aimes la musique ?',side:'right'},
        {s:'Paul',et:'Eeyyeen, baay\'ee. Muuziiqaa Oromoo jaalladha.',fr:'Oui, beaucoup. J\'aime la musique oromo.',side:'left'},
        {s:'Iftu',et:'Sirbaa aadaa hoo?',fr:'Et la musique traditionnelle ?',side:'right'},
        {s:'Paul',et:'Anaas, garuu baay\'ee hin beeku.',fr:'Aussi, mais je ne connais pas beaucoup.',side:'left'},
        {s:'Iftu',et:'Har\'a halkan agarsiisni jira! Dhufaa?',fr:'Il y a un spectacle ce soir ! Tu viens ?',side:'right'},
        {s:'Paul',et:'Eeyyeen! Sa\'aatii meeqatti jalqabaa?',fr:'Oui ! Ça commence à quelle heure ?',side:'left'}
      ]},
      {label:'Sit. 2',title:'Parler de sport',img:'⚽',dialogue:[
        {s:'Taammiruu',et:'Ispoortii taphataa?',fr:'Tu pratiques un sport ?',side:'left'},
        {s:'Claire',et:'Eeyyeen, kubbaa miilaa baay\'ee jaalladha.',fr:'Oui, j\'aime beaucoup le football.',side:'right'},
        {s:'Taammiruu',et:'Dhugumatti? Anaanis! Har\'a halkan taphataa ilaalaa?',fr:'Vraiment ? Moi aussi ! Tu regardes le match ce soir ?',side:'left'},
        {s:'Claire',et:'Eeyyeen. Atis kubbaa miilaa taphataa?',fr:'Oui. Tu joues au football aussi ?',side:'right'},
        {s:'Taammiruu',et:'Eeyyeen, Dilbata michootaa wajjin.',fr:'Oui, le dimanche avec des amis.',side:'left'},
        {s:'Claire',et:'Baay\'ee gaariidha!',fr:'Super !',side:'right'}
      ]},
      {label:'Sit. 3',title:'Proposer une activité',img:'🎬',dialogue:[
        {s:'Dassee',et:'Galgala kana maal goota?',fr:'Tu fais quoi cet après-midi ?',side:'left'},
        {s:'Marc',et:'Homaa. Maaliif?',fr:'Rien. Pourquoi ?',side:'right'},
        {s:'Dassee',et:'Siinimaa deemuu barbaaddaa?',fr:'Tu veux aller au cinéma ?',side:'left'},
        {s:'Marc',et:'Eeyyeen! Maal dhiyeessaa?',fr:'Oui ! Qu\'est-ce qu\'il y a ?',side:'right'},
        {s:'Dassee',et:'Fiilmii Firaansaay. Siinimaa Firaansaay jaalattaa?',fr:'Un film français. Tu aimes le cinéma français ?',side:'left'},
        {s:'Marc',et:'Baay\'ee jaalladha! Sa\'aatii meeqatti wal argina?',fr:'J\'adore ça ! On se retrouve à quelle heure ?',side:'right'}
      ]}
    ],
    vocab: [
      'Jaalladha = J\'aime', 'Hin jaalladu = Je n\'aime pas', 'Baay\'ee jaalladha = J\'adore',
      'Ispoortii taphataa? = Tu pratiques un sport ?', 'Taphaa = Le match',
      'Maal dhiyeessaa? = Qu\'est-ce qu\'il y a (au cinéma) ?',
      'Sa\'aatii meeqatti wal argina? = On se retrouve à quelle heure ?'
    ],
    quiz: [
      {q:'Afaan Oromootti "J\'adore" akkamiin jedha?',opts:['Jaalladha','Hin jaalladu','Baay\'ee jaalladha','Jibba'],ans:2},
      {q:'Jechuun "Maal dhiyeessaa?" siinimaa keessatti maal jechuudha?',opts:['Ça coûte combien ?','À quelle heure ?','Qu\'est-ce qu\'il y a ?','C\'est où ?'],ans:2},
      {q:'Afaan Oromootti "Le match" akkamiin jedha?',opts:['Ispoortii','Garee','Taphaa','Dirree'],ans:2}
    ]
  },

  // 46/48 -- Sortir le Soir -- Halkan Ala
  {
    id: 'fiesta2', level: 2, emoji: '🎉',
    name: 'Sortir le Soir', sub: 'Halkan Ala', type: 'dialog',
    situations: [
      {label:'Sit. 1',title:'Organiser une sortie',img:'🎊',dialogue:[
        {s:'Nagaasaa',et:'Akkam! Halkan kana bahuun?',fr:'Salut ! On sort ce soir ?',side:'left'},
        {s:'Lea',et:'Eeyyeen! Eessa deemna?',fr:'Oui ! On va où ?',side:'right'},
        {s:'Nagaasaa',et:'Magaalaa gidduu kaafee baay\'ee bareedduu jira.',fr:'Il y a un café très sympa au centre.',side:'left'},
        {s:'Lea',et:'Gaarii! Sa\'aatii meeqatti?',fr:'Super ! À quelle heure ?',side:'right'},
        {s:'Nagaasaa',et:'Sa\'aatii kudha. Oromiyaatti halkan bahu.',fr:'À dix heures. En Oromia on sort tard.',side:'left'},
        {s:'Lea',et:'Tolee! Haga wal arginu!',fr:'D\'accord ! À plus tard !',side:'right'}
      ]},
      {label:'Sit. 2',title:'Au café le soir',img:'🍺',dialogue:[
        {s:'Marc',et:'Muuziiqaan kun baay\'ee gaariidha! Sirbina?',fr:'Cette musique est super ! On danse ?',side:'left'},
        {s:'Gimbii',et:'Eeyyeen! Sirbuu baay\'ee jaalladha.',fr:'Oui ! J\'adore danser.',side:'right'},
        {s:'Marc',et:'Waa dhugachuu barbaaddaa?',fr:'Tu veux quelque chose à boire ?',side:'left'},
        {s:'Gimbii',et:'Eeyyeen, bishaan, maaloo. Ho\'aa dhabe.',fr:'Oui, une eau, s\'il te plaît. J\'ai chaud.',side:'right'},
        {s:'Marc',et:'Amma deebii\'a!',fr:'Je reviens tout de suite !',side:'left'},
        {s:'Gimbii',et:'Tolee!',fr:'D\'accord !',side:'right'}
      ]},
      {label:'Sit. 3',title:'Le lendemain',img:'😴',dialogue:[
        {s:'Biyyee',et:'Akkam! Fayyaan jirtaa? Gara manaa sa\'aatii baay\'ee boodaa dhufe!',fr:'Salut ! Tu vas bien ? Je suis rentré tard à la maison !',side:'left'},
        {s:'Tom',et:'Anaanis! Garuu halkan gaariidha ture.',fr:'Moi aussi ! Mais c\'était une très bonne soirée.',side:'right'},
        {s:'Biyyee',et:'Eeyyeen, namooti baay\'ee gaarii turan.',fr:'Oui, les gens étaient très sympas.',side:'left'},
        {s:'Tom',et:'Har\'a waliin nyaanna?',fr:'On mange ensemble aujourd\'hui ?',side:'right'},
        {s:'Biyyee',et:'Eeyyeen! Nyaachuu barbaada. Baay\'ee beela\'ee jira.',fr:'Oui ! J\'ai besoin de manger. J\'ai très faim.',side:'left'},
        {s:'Tom',et:'Anaanis! Obsi booda ta\'a!',fr:'Moi aussi ! La sieste c\'est pour après !',side:'right'}
      ]}
    ],
    vocab: [
      'Bahuun! = On sort !', 'Eessa deemna? = On va où ?', 'Oromiyaatti halkan bahu = En Oromia on sort tard',
      'Tolee! = D\'accord !', 'Ho\'aa dhabe = J\'ai chaud', 'Beela\'ee jira = J\'ai faim', 'Obsi = La sieste'
    ],
    quiz: [
      {q:'Jechuun "Tolee!" Oromiyaatti maal jechuudha?',opts:['Au revoir !','Allons-y !','D\'accord !','C\'est nul !'],ans:2},
      {q:'Afaan Oromootti "J\'ai faim" akkamiin jedha?',opts:['Dheebuu dhabe','Rafuu barbaada','Qorraa dhabe','Beela\'ee jira'],ans:3},
      {q:'Jechuun "Oromiyaatti halkan bahu" maal jechuudha?',opts:['En Oromia on rentre tard','En Oromia on travaille tard','En Oromia on sort tard','En Oromia on mange tard'],ans:2}
    ]
  },

  // 47/48 -- À la Pharmacie -- Mana Qorichaa
 {
    id: 'farmacia2', level: 2, emoji: '💊',
    name: 'À la Pharmacie', sub: 'Mana Qorichaa', type: 'dialog',
    situations: [
      {label:'Sit. 1',title:'Mal de tête',img:'🤕',dialogue:[
        {s:'Maamilaa',et:'Akkam. Mataan natti dhukkuba. Waa qabduu?',fr:'Bonjour. J\'ai mal à la tête. Qu\'est-ce que vous avez ?',side:'left'},
        {s:'Farmaasiistuu',et:'Qorichatti waan dhukkubsan qabdaa?',fr:'Vous êtes allergique à un médicament ?',side:'right'},
        {s:'Maamilaa',et:'Lakki, waan dhukkubsamu hin qabu.',fr:'Non, je ne suis pas allergique.',side:'left'},
        {s:'Farmaasiistuu',et:'Ayibuprofen siif kennaa. Nyaata wajjin tokko fudhu.',fr:'Je vous donne un ibuprofène. Prenez-en un avec de la nourriture.',side:'right'},
        {s:'Maamilaa',et:'Guyyaatti si\'a meeqa?',fr:'Combien de fois par jour ?',side:'left'},
        {s:'Farmaasiistuu',et:'Guyyaatti si\'a sadii, hanga ol.',fr:'Trois fois par jour, maximum.',side:'right'}
      ]},
      {label:'Sit. 2',title:'Trouver la pharmacie de garde',img:'🌙',dialogue:[
        {s:'Daawwataa',et:'Dhiifama, farmaasinni amma banama jiruudha?',fr:'Pardon, il y a une pharmacie ouverte maintenant ?',side:'left'},
        {s:'Ollittuu',et:'Farmaasiileen cufamaniiru. Farmaasiitti kutaa waardiyaa deemuu qabda.',fr:'Les pharmacies sont fermées. Tu as besoin de la pharmacie de garde.',side:'right'},
        {s:'Daawwataa',et:'Eessa jira?',fr:'Elle est où ?',side:'left'},
        {s:'Ollittuu',et:'Farmaasiitti maxxanfame ilaaladhu. Isa banama jiru ibsa.',fr:'Regarde l\'affiche de cette pharmacie. Elle indique laquelle est ouverte.',side:'right'},
        {s:'Daawwataa',et:'Aah, gadi fageenyaan! Galatoomi.',fr:'Ah, je comprends ! Merci.',side:'left'},
        {s:'Ollittuu',et:'Nagaan!',fr:'De rien !',side:'right'}
      ]},
      {label:'Sit. 3',title:'Acheter un médicament',img:'💉',dialogue:[
        {s:'Maamilaa',et:'Akkam. Qufaaf waa qabduu?',fr:'Bonjour. Vous avez quelque chose pour la toux ?',side:'left'},
        {s:'Farmaasiistuu',et:'Eeyyeen. Gurraachaa moo daa\'imaaf?',fr:'Oui. C\'est pour un adulte ou un enfant ?',side:'right'},
        {s:'Maamilaa',et:'Gurraachaaf.',fr:'Pour un adulte.',side:'left'},
        {s:'Farmaasiistuu',et:'Siiraabii kana fudhu. Saanikoo lama, guyyaatti si\'a sadii.',fr:'Prenez ce sirop. Deux cuillères, trois fois par jour.',side:'right'},
        {s:'Maamilaa',et:'Meeqadha?',fr:'Ça coûte combien ?',side:'left'},
        {s:'Farmaasiistuu',et:'Birraa shan fi saddet.',fr:'Cinq euros quatre-vingt.',side:'right'}
      ]}
    ],
    vocab: [
      'Mataan natti dhukkuba = J\'ai mal à la tête', 'Qoonqoon natti dhukkuba = J\'ai mal à la gorge',
      'Farmaasiitti waardiyaa = La pharmacie de garde', 'Waan dhukkubsamu hin qabu = Je ne suis pas allergique',
      'Siiraabii = Le sirop', 'Guyyaatti si\'a sadii = Trois fois par jour', 'Maxxanfame = L\'affiche'
    ],
    quiz: [
      {q:'Afaan Oromootti "J\'ai mal à la tête" akkamiin jedha?',opts:['Ho\'a qaba','Garaan natti dhukkuba','Mataan natti dhukkuba','Dadhabee jira'],ans:2},
      {q:'"Farmaasiitti waardiyaa" maal jechuudha?',opts:['La grande pharmacie','La pharmacie de garde ouverte la nuit','La pharmacie de l\'hôpital','La pharmacie pour touristes'],ans:1},
      {q:'Afaan Oromootti "Trois fois par jour" akkamiin jedha?',opts:['Guyyaatti si\'a lama','Guyyaatti si\'a tokko','Guyyaatti si\'a sadii','Guyyaatti si\'a afur'],ans:2}
    ]
  },

  // 48/48 -- Chez le Médecin -- Bakka Doktoraatti
  {
    id: 'medico2', level: 2, emoji: '🩺',
    name: 'Chez le Médecin', sub: 'Bakka Doktoraatti', type: 'dialog',
    situations: [
      {label:'Sit. 1',title:'Expliquer ses symptômes',img:'🤒',dialogue:[
        {s:'Doktora',et:'Nagaan bulte! Maal sitti dhiphise?',fr:'Bonjour ! Qu\'est-ce qui ne va pas ?',side:'right'},
        {s:'Dhukkubsataa',et:'Ho\'a qabaa qoonqoos natti dhukkuba.',fr:'J\'ai de la fièvre et j\'ai mal à la gorge.',side:'left'},
        {s:'Doktora',et:'Yoomii irraa?',fr:'Depuis quand ?',side:'right'},
        {s:'Dhukkubsataa',et:'Kaleessa irraa.',fr:'Depuis hier.',side:'left'},
        {s:'Doktora',et:'Qufas qabdaa?',fr:'Vous avez aussi de la toux ?',side:'right'},
        {s:'Dhukkubsataa',et:'Eeyyeen, xiqqoo.',fr:'Oui, un peu.',side:'left'}
      ]},
      {label:'Sit. 2',title:'Comprendre le médecin',img:'💊',dialogue:[
        {s:'Doktora',et:'Infekshinii qabda. Antibaayootiki siif barreessa.',fr:'Vous avez une infection. Je vous prescris un antibiotique.',side:'right'},
        {s:'Dhukkubsataa',et:'Qoricha yoom fudha?',fr:'Quand est-ce que je prends le médicament ?',side:'left'},
        {s:'Doktora',et:'Tokkoo ganamaatti fi tokkoo halkan.',fr:'Un le matin et un le soir.',side:'right'},
        {s:'Dhukkubsataa',et:'Guyyaa meeqa?',fr:'Pendant combien de jours ?',side:'left'},
        {s:'Doktora',et:'Guyyaa torba. Bishaan baay\'ee dhugi.',fr:'Sept jours. Et buvez beaucoup d\'eau.',side:'right'},
        {s:'Dhukkubsataa',et:'Galatoomi, doktera.',fr:'Merci, docteur.',side:'left'}
      ]},
      {label:'Sit. 3',title:'Appeler le médecin',img:'📞',dialogue:[
        {s:'Dhukkubsataa',et:'Akkam, doktora beellama barbaada.',fr:'Bonjour, je veux un rendez-vous avec le médecin.',side:'left'},
        {s:'Simataa',et:'Yoom?',fr:'Pour quand ?',side:'right'},
        {s:'Dhukkubsataa',et:'Har\'a yoo danda\'ame. Baay\'ee dhukkubsadha.',fr:'Pour aujourd\'hui si c\'est possible. Je suis très malade.',side:'left'},
        {s:'Simataa',et:'Ho\'a qabduu?',fr:'Vous avez de la fièvre ?',side:'right'},
        {s:'Dhukkubsataa',et:'Eeyyeen, digdama sagal digrii.',fr:'Oui, trente-neuf degrés.',side:'left'},
        {s:'Simataa',et:'Sa\'aatii afuritti kottaa. Paaspoortii fidadhu.',fr:'Venez à seize heures. Apportez votre passeport.',side:'right'}
      ]}
    ],
    vocab: [
      'Maal sitti dhiphise? = Qu\'est-ce qui ne va pas ?', 'Ho\'a qabaa = J\'ai de la fièvre',
      'Qoonqoon natti dhukkuba = J\'ai mal à la gorge', 'Kaleessa irraa = Depuis hier', 'Qufa = La toux',
      'Beellama = Un rendez-vous', 'Baay\'ee dhukkubsadha = Je suis très malade'
    ],
    quiz: [
      {q:'Afaan Oromootti "J\'ai de la fièvre" akkamiin jedha?',opts:['Qorraan natti dhiphise','Ho\'a qabaa','Qufaa qabaa','Dhukkuba qabaa'],ans:1},
      {q:'Jechuun "Qoonqoon natti dhukkuba" maal jechuudha?',opts:['J\'ai mal à la tête','J\'ai mal au ventre','J\'ai mal à la gorge','J\'ai mal au dos'],ans:2},
      {q:'Afaan Oromootti "Un rendez-vous" akkamiin jedha?',opts:['Dirqama','Beellama','Mootummaa','Daawwannaa'],ans:1}
    ]
  }

];

/* ══════════════════════════════════════════════════════════════════
   Tableau fusionné — consommé directement par app.js
   ══════════════════════════════════════════════════════════════════ */

const ALL_THEMES_FR = LEVEL1_THEMES_FR.concat(LEVEL2_THEMES_FR);