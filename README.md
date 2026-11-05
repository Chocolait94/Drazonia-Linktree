# Drazonia Linktree

Page personnelle React pour centraliser les réseaux de Drazonia, afficher le statut Twitch et présenter les derniers YouTube Shorts.

## Fonctionnalités

- Design responsive avec background vidéo, néons et animations.
- Liens vers Twitch, YouTube, Instagram, TikTok, Discord et contact.
- Statut Twitch en direct/hors ligne via l'API Twitch.
- Affichage des derniers Shorts YouTube avec miniatures, titres et vues.
- Tri des Shorts par `Latest`, `Popular` ou `Oldest`.
- Intégrations Twitch et YouTube exécutées côté serveur.
- Headers HTTP de sécurité, limitation des requêtes API et timeout des services externes.

## Prérequis

- Node.js 18 ou supérieur.

## Installation

Depuis la racine du projet :

```bash
npm install
```

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
.env             Configuration locale, ignoré par Git
```

## Sécurité

- Ne jamais commiter `.env`.
- Ne jamais publier de configuration locale ou de secret.
- Le fichier `.env` reste local et est ignoré par Git.
- Les données Twitch et YouTube sont récupérées par le serveur, pas directement par le navigateur.
