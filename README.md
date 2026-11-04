# Drazonia Linktree

Page personnelle React pour centraliser les réseaux de Drazonia, afficher le statut Twitch et présenter les derniers YouTube Shorts.

## Fonctionnalités

- Design responsive avec background vidéo, néons et animations.
- Liens vers Twitch, YouTube, Instagram, TikTok, Discord et contact.
- Statut Twitch en direct/hors ligne via l'API Twitch.
- Affichage des derniers Shorts YouTube avec miniatures, titres et vues.
- Tri des Shorts par `Latest`, `Popular` ou `Oldest`.
- Clés API conservées côté serveur.
- Headers HTTP de sécurité, limitation des requêtes API et timeout des services externes.

## Prérequis

- Node.js 18 ou supérieur.
- Une application Twitch avec un Client ID et un Client Secret.
- Une clé Google Cloud avec **YouTube Data API v3** activée.

## Installation

Depuis la racine du projet :

```bash
npm install
```

## Configuration des APIs

Copier `.env.example` vers `.env`, puis renseigner les valeurs :

```env
TWITCH_CLIENT_ID=ton_client_id
TWITCH_CLIENT_SECRET=ton_client_secret

YOUTUBE_API_KEY=ta_cle_youtube
YOUTUBE_CHANNEL_ID=UCxxxxxxxxxxxxxxxxxxxxxx

PORT=3001
```

### Twitch

Créer une application depuis la [Twitch Developer Console](https://dev.twitch.tv/console).

Le compte surveillé est `drazonia`. Le secret Twitch doit rester privé et ne doit jamais être publié.

### YouTube

Dans [Google Cloud Console](https://console.cloud.google.com/) :

1. Créer ou sélectionner un projet.
2. Activer **YouTube Data API v3**.
3. Créer une clé API.
4. Limiter cette clé à **YouTube Data API v3**.

`YOUTUBE_CHANNEL_ID` doit être le véritable identifiant de chaîne YouTube. Il commence généralement par `UC` et contient 24 caractères environ. `@Drazonia` n'est pas un Channel ID valide.

Pour le trouver : YouTube Studio → **Paramètres** → **Chaîne** → **Paramètres avancés** → **ID de chaîne**.

## Lancement en développement

```bash
npm run dev
```

Le site est disponible sur :

```text
http://localhost:5173
```

Le serveur API écoute sur :

```text
http://localhost:3001
```

## Vérifier les APIs

Ouvrir :

```text
http://localhost:5173/api/status
```

Exemple de réponse :

```json
{
  "twitch": {
    "online": false,
    "configured": true
  },
  "videos": []
}
```

`online: false` signifie que la chaîne Twitch n'est pas actuellement en direct. `videos: []` indique généralement que la clé YouTube ou le Channel ID est absent, invalide ou qu'aucun Short n'a été trouvé.

## Build de production

```bash
npm run build
```

Pour démarrer le serveur :

```bash
npm start
```

## Structure principale

```text
src/
  main.jsx       Interface React et appels API
  styles.css     Design, responsive et animations
server/
  index.js       Serveur Express et intégrations Twitch/YouTube
public/
  assets/        Images, vidéo et éléments décoratifs
.env             Clés locales, ignoré par Git
```

## Sécurité

- Ne jamais commiter `.env`.
- Ne jamais partager `TWITCH_CLIENT_SECRET` ou `YOUTUBE_API_KEY`.
- Régénérer une clé immédiatement si elle est exposée.
- Les données Twitch et YouTube sont récupérées par le serveur, pas directement par le navigateur.
