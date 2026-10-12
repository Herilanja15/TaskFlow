# TaskFlow

Application MERN de gestion de projets et de tâches.

## Fonctionnalités

- Inscription, connexion JWT et mots de passe hachés avec bcrypt.
- Projets avec description, échéance, édition, archivage et suppression.
- Tâches avec priorité, échéance, responsable et statut Kanban.
- Dashboard avec statistiques et échéances proches ou dépassées.
- Routes protégées et contrôle d’accès par appartenance au projet.
- Interface responsive pour ordinateur et téléphone.

Les invitations et le glisser-déposer sont prévus pour une version ultérieure. Le créateur d’un projet en est l’administrateur dans cette V1.

## Prérequis

- Node.js 20 ou supérieur
- Une instance MongoDB locale ou une URI MongoDB accessible

## Démarrage

À la racine du dépôt, crée le fichier d’environnement du serveur :

```sh
cp .env.example server/.env
```

Configure `MONGODB_URI` et remplace `JWT_SECRET` par une valeur aléatoire d’au moins 32 caractères.

Dans un terminal, démarre l’API :

```sh
cd server
npm install
npm run dev
```

Dans un autre terminal, démarre le client :

```sh
cd client
npm install
npm run dev
```

L’API écoute sur `http://localhost:5000`, et Vite affiche l’URL du client. `GET /api/health` vérifie que l’API répond.

## Routes principales

- `POST /api/auth/register`, `POST /api/auth/login`, `GET|PATCH /api/auth/me`
- `GET /api/dashboard`
- `GET|POST /api/projects`, `GET|PATCH|DELETE /api/projects/:projectId`
- `GET|POST /api/projects/:projectId/tasks`
- `PATCH|DELETE /api/tasks/:taskId`
