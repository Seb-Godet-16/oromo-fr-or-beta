# ✅ Plan de Tests — Taphad'Meuh
*Version Juin 2026 — À compléter par le testeur*

> **Légende :** ✅ OK · ❌ Bug · ⚠️ Partiel · ➖ Non testé

---

## 🧪 A. INSTALLATION & ACCÈS HORS-LIGNE

| # | Test | Étapes | Résultat |
|---|---|---|---|
| A1 | Chargement initial | Ouvrir l'URL depuis un navigateur Android/iOS | |
| A2 | Installable en PWA | Vérifier l'icône "Ajouter à l'écran d'accueil" Android | |
| A3 | Installable PWA iOS | Safari → Partager → "Sur l'écran d'accueil" | |
| A4 | Mode hors-ligne | Passer en mode avion après 1ère visite, recharger l'app | |
| A5 | Icône sur l'écran d'accueil | Vérifier que l'icône s'affiche correctement | |

---

## 🌍 B. LANCEUR — CHOIX DU MODE

| # | Test | Étapes | Résultat |
|---|---|---|---|
| B1 | Affichage logo | Vérifier que le logo bannière s'affiche sans erreur | |
| B2 | Mode Français | Taper "J'apprends le Français" → arriver sur l'accueil | |
| B3 | Mode Oromo | Taper "Afaan Oromoo" → thème vert-or, texte en Oromo | |
| B4 | Changement de mode | Revenir au lanceur depuis Home, choisir l'autre mode | |
| B5 | Email contact | Cliquer le bouton email → adresse copiée dans le presse-papier | |

---

## 🏠 C. ÉCRAN HOME & GUIDE

| # | Test | Étapes | Résultat |
|---|---|---|---|
| C1 | Onboarding 1ère fois | Premier lancement : guide affiché automatiquement | |
| C2 | Pas d'onboarding à 2ème visite | Relancer l'app : pas de guide (mode déjà vu) | |
| C3 | Bouton Commencer | Cliquer → arriver sur la grille Niveau 1 | |
| C4 | Cercle de progression | Après avoir complété des modules, vérifier le cercle SVG | |
| C5 | Export PDF guide | Cliquer le bouton PDF → fenêtre d'impression s'ouvre | |
| C6 | Bouton Crédits | Cliquer "Remerciements" → modale s'ouvre et se ferme | |

---

## 📚 D. ÉCRAN SECTIONS — GRILLE DES THÈMES

| # | Test | Étapes | Résultat |
|---|---|---|---|
| D1 | Affichage Niveau 1 | 32 cartes de thèmes Niveau 1 visibles | |
| D2 | Affichage Niveau 2 | Onglet Niveau 2 → 16 cartes Dialogue | |
| D3 | Navigation niveaux | Basculer Niv. 1 / Niv. 2 — scroll revient en haut | |
| D4 | Carte complétée | Après 1 quiz réussi : carte avec bordure colorée + ⭐ | |
| D5 | Étoiles affichées | ⭐ (≥50%), ⭐⭐ (≥75%), ⭐⭐⭐ (100%) sur les cartes | |
| D6 | Reset thème | Bouton reset sur une carte → modale de confirmation → étoiles effacées | |
| D7 | Navigation ← Retour | Flèche retour → revenir au Home sans rechargement | |
| D8 | Barre progression header | % et fraction X/48 mis à jour après quiz | |

---

## 🃏 E. ONGLET CARTES FLASH

| # | Test | Étapes | Résultat |
|---|---|---|---|
| E1 | Affichage carte | Ouvrir un thème Niv. 1 → carte visible avec emoji + mot | |
| E2 | Retournement | Cliquer/taper la carte → elle se retourne (CSS flip) | |
| E3 | Navigation cartes | Boutons ← → ou swipe → carte suivante/précédente | |
| E4 | TTS Français | Bouton haut-parleur 🔊 → phrase lue en français | |
| E5 | TTS Oromo | Bouton haut-parleur 🔊 → phrase lue (voix disponible) | |
| E6 | Conjugaison verbe | Sur un verbe, verso affiche les 6 formes conjuguées | |
| E7 | Thème Alphabet | Thème "Alphabet" → cartes avec sons + détail lettres | |
| E8 | Export PDF vocab | Bouton PDF → vocabulaire formaté, prêt à imprimer | |
| E9 | Navigation flèches leçon | ← / → entre modules depuis l'écran Leçon | |

---

## 🎯 F. ONGLET QUIZ

| # | Test | Étapes | Résultat |
|---|---|---|---|
| F1 | 10 questions | Quiz démarre → 10 questions QCM | |
| F2 | Options de réponse | 4 choix par question, un seul correct | |
| F3 | Feedback correct | Bonne réponse → vert + vibration courte | |
| F4 | Feedback incorrect | Mauvaise réponse → rouge + double vibration | |
| F5 | Résultat final | Fin du quiz → score + étoiles attribuées | |
| F6 | Étoiles persistantes | Relancer l'app → les étoiles du quiz sont conservées | |
| F7 | Étoiles ne régressent pas | Faire un moins bon score → les anciennes étoiles restent | |
| F8 | Reprise quiz | Changer d'onglet en cours de quiz → question conservée | |
| F9 | Confetti ⭐⭐⭐ | Score 100% → animation confetti | |
| F10 | Quiz Alphabet audio | Thème Alphabet → questions basées sur les sons | |

---

## 💬 G. ONGLET DIALOGUE (NIVEAU 2 UNIQUEMENT)

| # | Test | Étapes | Résultat |
|---|---|---|---|
| G1 | Affichage scène | Ouvrir un thème Niv. 2 → dialogue s'affiche | |
| G2 | Bulles côté gauche/droite | Personnages distincts, alignement correct | |
| G3 | Navigation situations | Onglets "Sit. 1", "Sit. 2"… → changement de scène | |
| G4 | TTS sur réplique | Cliquer une réplique → TTS lit la phrase | |
| G5 | Quiz Dialogue | Onglet Quiz (Niv. 2) → questions sur le dialogue | |
| G6 | Export PDF situation | Bouton PDF → situation imprimable | |

---

## 📖 H. ONGLET VOCABULAIRE

| # | Test | Étapes | Résultat |
|---|---|---|---|
| H1 | Liste complète | Tous les mots du thème listés | |
| H2 | Mot cliquable | Cliquer un mot → TTS le lit | |
| H3 | Affichage bilingue | Colonne Oromo + Colonne Français visibles | |

---

## 🎤 I. ONGLET RÉPÈTE (RECONNAISSANCE VOCALE)

| # | Test | Étapes | Résultat |
|---|---|---|---|
| I1 | Disponibilité micro | Sur appareils sans micro → message d'indisponibilité clair | |
| I2 | Autorisation micro | 1ère utilisation → navigateur demande l'accès micro | |
| I3 | Écoute active | Cliquer 🎤 → enregistrement démarre | |
| I4 | Bonne prononciation | Prononcer correctement → résultat vert ✅ | |
| I5 | Mauvaise prononciation | Prononcer incorrectement → résultat rouge ❌ | |
| I6 | Tolérance orthographe | Légère erreur acceptée (algorithme Levenshtein) | |
| I7 | Passer | Bouton "Passer" → mot suivant sans enregistrer | |
| I8 | Voix TTS utilisée | Badge indiquant la voix utilisée (Oromo/Somali/Amharique) | |

---

## 📱 J. INTERFACE & NAVIGATION GÉNÉRALE

| # | Test | Étapes | Résultat |
|---|---|---|---|
| J1 | Thème Français bleu-blanc-rouge | Couleurs correctes en mode Français | |
| J2 | Thème Oromo vert-or | Couleurs correctes en mode Oromo | |
| J3 | Mode sombre | Activer mode sombre OS → app s'adapte | |
| J4 | Animations de navigation | Transition gauche/droite entre écrans fluide | |
| J5 | Barre navigation basse | Boutons Accueil / Modules présents et fonctionnels | |
| J6 | Taille texte mobile | Texte lisible sur écran 5–6 pouces sans zoom | |
| J7 | Tablette | Mise en page centrée correcte sur tablette (max 480 px) | |
| J8 | Navigation clavier | Tab / Entrée / Espace fonctionnels sur desktop | |
| J9 | Rotation écran | Passer en paysage → pas de mise en page cassée | |
| J10 | Toast notifications | Messages courts apparaissent et disparaissent seuls | |

---

## 🔄 K. RÉINITIALISATION & PERSISTANCE

| # | Test | Étapes | Résultat |
|---|---|---|---|
| K1 | Reset complet mode FR | Bouton reset → modale → confirmer → progression effacée | |
| K2 | Reset complet mode OR | Même test en mode Oromo | |
| K3 | Reset indépendant | Reset mode FR ne touche pas la progression mode OR | |
| K4 | Données survie rechargement | Fermer/rouvrir → étoiles et progression toujours là | |

---

## 🌐 Appareils testés

| Appareil | OS / Navigateur | Testeur | Date | Notes |
|---|---|---|---|---|
| | | | | |
| | | | | |
| | | | | |
| | | | | |

---

*Taphad'Meuh — Plan de tests v1 · Juin 2026*
