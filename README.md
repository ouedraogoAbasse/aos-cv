# AOSCV — Application de création de CV

Générateur de CV en ligne : **landing page + éditeur en temps réel + export PDF A4 multi-pages**, avec paiement mobile money (Orange Money / Telmob, 1 000 FCFA) avant téléchargement.

## Démarrage

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build      # build de production
npm start          # sert le build
npm run lint       # ESLint
npx tsc --noEmit   # vérification TypeScript
```

## Stack technique

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS 3.4, DaisyUI 4 (32 thèmes) |
| Export PDF | `html2canvas-pro` + `jspdf` |
| Langage | TypeScript strict |

## Architecture

```
app/
  page.tsx                 Composition (Header, Landing, Builder, Footer, modales)
  layout.tsx               Métadonnées + thème par défaut
  components/              Composants d'interface
  api/payments/            POST : réceptionne les preuves de paiement
  api/payments/verify/     GET  : valide un jeton de téléchargement
lib/                       Logique métier pure (partagée client/serveur)
  payment.ts               Règles de paiement + jeton
  pdf.ts                   Export PDF multi-pages
  image.ts                 Compression / conversion des images
  id.ts                    Génération d'identifiants
state/CVContext.tsx        État global + cycle de paiement + export
hooks/usePersistentState.ts  Persistance localStorage
payments/                  Preuves de paiement (jamais commitées)
```

## Fonctionnalités

- Édition complète du CV : informations personnelles, expériences, formations, langues, compétences, loisirs — **ajout, modification et suppression** de chaque entrée.
- Prévisualisation en direct avec zoom (40–150 %) et 32 thèmes DaisyUI appliqués au CV (pas au site).
- Export PDF A4 **multi-pages** : le contenu est découpé page par page, rien n'est rogné.
- Photo automatiquement compressée (dimension max + JPEG) avant stockage et export.
- **Persistance localStorage** : rafraîchir la page ne perd plus les données.

## Paiement

1. L'utilisateur choisit Orange Money ou Telmob, renseigne nom, numéro, référence et joint une capture du reçu.
2. Le formulaire est envoyé en `multipart/form-data` à `POST /api/payments`.
3. Le **serveur** re-valide tout (numéro attendu, référence, format et poids de l'image), écrit la preuve dans `payments/` avec le statut `pending` et renvoie un jeton aléatoire de 64 caractères.
4. Le jeton est stocké dans `localStorage` et vérifié à chaque téléchargement via `GET /api/payments/verify`.
5. Le PDF n'est débloqué **qu'après validation manuelle** par l'administrateur :
   - **en attente** → bannière « paiement en cours de vérification », téléchargement bloqué (la modale de paiement ne se rouvre pas) ;
   - **validé** → téléchargement possible pendant 90 jours ;
   - **refusé** → bannière d'erreur, pas de téléchargement.
6. Sans jeton valide → la modale de paiement s'ouvre, le PDF n'est pas généré.

Les preuves atterrissent dans `payments/<jeton>.jpg` + `payments/<jeton>.json` (nom, numéro, référence, montant, dates, statut).

## Administration

- **URL** : `/admin/paiements`
- **Mot de passe** : variable `ADMIN_PASSWORD` du fichier `.env.local` (généré aléatoirement à la création du projet, à votre convenance à modifier).
- **Fonctions** : liste des paiements avec filtres *En attente / Validés / Refusés*, visionnage de la preuve en grand, boutons **Valider** et **Refuser**.
- Sécurité : session en cookie `httpOnly` signé par HMAC (7 jours), tentatives de connexion limitées à 5/min/IP, API admin protégées (401 sans session), métadonnées `noindex`.

### Notification Telegram (optionnel)

Renseigner `TELEGRAM_BOT_TOKEN` et `TELEGRAM_CHAT_ID` dans `.env.local` : à chaque paiement reçu, la photo de la preuve et un récapitulatif (nom, numéro, opérateur, référence, montant, heure) sont envoyés sur Telegram, avec le rappel de l'URL de validation.

### Limites connues

- **Le stockage des preuves est disque local** : fonctionne sur un VPS / serveur dédié, **pas** sur un hébergement serverless (système de fichiers en lecture seule, ex. Vercel). Prévoir un bucket S3 ou une base de données dans ce cas.
- **Le PDF est généré côté navigateur** : un développeur déterminé peut toujours l'obtenir sans payer. La solution définitive est de générer le PDF côté serveur et de ne le servir qu'après vérification.
- Limite de débit basique sur `POST /api/payments` (10 req/min/IP) et sur la connexion admin (5/min/IP), en mémoire (remise à zéro à chaque redémarrage).

## Origine

Projet dérivé du tutoriel YouTube « Création d'une application de CV » :

- 🎥 [Voir le tuto complet](https://youtu.be/SkNNw5WeJQM)
- ❤️ [Soutenir l'auteur du tutoriel (FaizDev)](https://fr.tipeee.com/faizdev/)
