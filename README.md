# DIGIY RENCONTRE

Module public autonome de l’écosystème **DIGIYLYFE**.

**Domaine cible :** `https://rencontre.digiylyfe.com/`

## Positionnement

DIGIY RENCONTRE est un espace local de rencontres humaines, d’amitié, de connaissances, d’activités et de cercles.

Doctrine V1 :

- 18+ uniquement ;
- zone générale, jamais de GPS précis ;
- aucune coordonnée privée affichée publiquement ;
- demande de contact avant échange de coordonnées ;
- blocage et signalement disponibles ;
- première rencontre recommandée dans un lieu public ;
- pas de swipe infini ;
- le territoire et les activités passent avant la collection de profils.

## Pourquoi ce dépôt existe

RENCONTRE vivait historiquement dans :

`BEAUVILLE/digiy-hub/rencontre/`

Le HUB n’est plus la gare obligatoire de DIGIYLYFE. RENCONTRE doit donc devenir un module autonome, au même niveau que les autres portes publiques de l’écosystème.

La migration doit se faire **par copie et validation**, jamais par suppression immédiate de l’ancienne version.

## Fichiers attendus

Le dépôt autonome doit contenir au minimum :

```text
/
├── index.html
├── inscription.html
├── app.js
├── config.js
├── CNAME
└── README.md
```

Selon les besoins du module actuel, ajouter également les fichiers annexes utilisés par RENCONTRE avant bascule définitive.

### `index.html`

Accueil public du module.

La version préparée ici :

- conserve l’interface RENCONTRE actuelle ;
- conserve les chemins locaux `./inscription.html`, `./config.js` et `./app.js` ;
- remplace le retour vers l’ancien HUB par un retour direct vers `https://digiylyfe.com/` ;
- prévoit le canonical `https://rencontre.digiylyfe.com/` ;
- reste volontairement en `noindex,nofollow` pendant la phase de migration et de test ;
- utilise un nouveau numéro de cache pour les scripts locaux.

### `inscription.html`

À copier depuis la version RENCONTRE actuellement validée.

Elle doit conserver le correctif du 16 août 2026 :

- OTP par email ;
- validation du code ;
- session Supabase ;
- en mode connexion, suppression du reliquat `digiy_rencontre_pending_profile_v1` afin qu’un ancien brouillon d’inscription ne modifie jamais un profil existant.

### `app.js`

À copier depuis la version RENCONTRE actuellement validée.

Elle doit conserver le correctif du 16 août 2026 :

- détection de session ;
- chargement du profil RENCONTRE actif ;
- affichage clair `✓ CONNECTÉ · <pseudo>` ;
- bouton de déconnexion ;
- accès aux personnes, activités, cercles et proposition d’activité.

### `config.js`

Configuration publique navigateur Supabase.

Règle absolue :

- uniquement URL du projet + clé publique/publishable ou anon destinée au navigateur ;
- **jamais de `service_role`, secret serveur ou mot de passe SMTP dans ce dépôt**.

Le projet Supabase existant reste la source de données. La création de ce dépôt autonome **ne demande aucune modification du SMTP ni du schéma SQL**.

### `CNAME`

Contenu prévu :

```text
rencontre.digiylyfe.com
```

À poser uniquement quand le nouveau dépôt GitHub Pages est prêt à recevoir le domaine.

## Migration recommandée

1. Créer le nouveau dépôt du module RENCONTRE.
2. Y copier les fichiers RENCONTRE actuellement validés.
3. Poser le nouvel `index.html` autonome.
4. Ajouter `README.md`.
5. Ajouter `CNAME` avec `rencontre.digiylyfe.com`.
6. Activer GitHub Pages sur la branche `main`.
7. Configurer le DNS du sous-domaine seulement après validation du dépôt.
8. Tester sur le nouveau domaine :
   - ouverture du module ;
   - création de profil ;
   - réception du code OTP ;
   - validation OTP ;
   - retour sur l’index ;
   - affichage `✓ CONNECTÉ · pseudo` ;
   - personnes ;
   - activités ;
   - cercles ;
   - proposition d’activité ;
   - déconnexion ;
   - affichage mobile.
9. Une fois les tests réussis, modifier **un seul lien** dans l’accueil `digiylyfe.com` :
   - ancien : `https://digiy-hub.digiylyfe.com/rencontre/`
   - nouveau : `https://rencontre.digiylyfe.com/`
10. Conserver temporairement l’ancienne version du HUB comme filet de sécurité.
11. Après validation terrain, rediriger l’ancienne adresse vers la nouvelle au lieu de supprimer brutalement les fichiers.

## Supabase

Projet actuellement utilisé par RENCONTRE :

`wesqmwjjtsefyjnluosj`

La migration d’hébergement ne doit pas casser l’identité utilisateur.

À vérifier au moment de la bascule :

- URLs de redirection Auth autorisées ;
- origine `https://rencontre.digiylyfe.com` si nécessaire dans la configuration Auth ;
- politiques RLS déjà en place ;
- fonctions RPC RENCONTRE existantes ;
- aucune exposition de secrets.

## Discipline DIGIYLYFE

**Humain / DIGIYLYFE décide. ChatGPT prépare, contrôle et diagnostique. GitHub garde les sources. Le terrain valide.**

Pour cette migration :

- travailler sur le nouveau dépôt, jamais sur l’original comme première action ;
- une modification précise à la fois ;
- aucun changement DNS avant validation ;
- aucun changement SMTP sans nécessité démontrée ;
- aucun changement SQL si la migration front-end fonctionne avec l’existant ;
- ne supprimer l’ancien chemin qu’après validation complète du nouveau domaine.

## Statut

Préparation autonome : **16 août 2026**

État attendu avant bascule de l’accueil : **nouveau module testé et validé sur `rencontre.digiylyfe.com`**.
