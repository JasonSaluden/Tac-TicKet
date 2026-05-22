# Tac-TicKet 🎫

Plateforme de gestion de tickets complète avec authentification OAuth, gestion des rôles, et interface multilingue (Français/Anglais).

## 📋 Table des matières

- [Caractéristiques](#-caractéristiques)
- [Stack Technologique](#-stack-technologique)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Lancer le projet](#-lancer-le-projet)
- [Configuration](#-configuration)
- [Structure du projet](#-structure-du-projet)
- [API Documentation](#-api-documentation)
- [Rôles et permissions](#-rôles-et-permissions)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Caractéristiques

✅ **Authentification**
- Connexion/Inscription locale
- OAuth2 avec Google
- JWT tokens

✅ **Gestion des tickets**
- CRUD complet (Créer, Lire, Mettre à jour, Supprimer)
- Statuts: Ouvert, En cours, Résolu, Fermé
- Priorités: Basse, Moyenne, Haute, Urgente
- Catégorisation

✅ **Gestion des rôles**
- Admin: Accès complet
- Agent: Gestion des tickets assignés
- User: Gestion de ses propres tickets

✅ **Interface**
- React 19 avec TypeScript
- Tailwind CSS
- Interface entièrement en français
- Responsive design

✅ **Backend**
- Spring Boot 4.0.6 (Java 17)
- MySQL 8.0.45
- Spring Security avec JWT

---

## 🛠 Stack Technologique

### Frontend
- **React** 19.2.6 - Bibliothèque UI
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** 7.15.1 - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **lucide-react** - Icons

### Backend
- **Spring Boot** 4.0.6 - Framework
- **Java** 17 - Language
- **MySQL** 8.0.45 - Database
- **Spring Security** - Authentication
- **JWT (jjwt)** 0.12.6 - Token management
- **Spring OAuth2 Client** - Google OAuth

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **GitHub Actions** - CI/CD Pipeline

---

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir:

### Système d'exploitation
- **Windows**, **macOS**, ou **Linux**

### Outils requis

#### 1. Docker & Docker Compose
```bash
# Windows: Téléchargez Docker Desktop
# https://www.docker.com/products/docker-desktop

# Vérifier l'installation
docker --version
docker compose version
```

#### 2. Node.js & npm
```bash
# Télécharger Node.js 20+
# https://nodejs.org/

# Vérifier l'installation
node --version
npm --version
```

#### 3. Java Development Kit (JDK) 17
```bash
# Windows: Installer depuis https://www.oracle.com/java/
# ou utiliser un gestionnaire de packages

# Vérifier l'installation
java -version
javac -version
```

#### 4. Git
```bash
# Cloner le repository
git clone https://github.com/your-repo/Tac-TicKet.git
cd Tac-TicKet
```

---

## 🚀 Installation

### 1. Cloner le projet
```bash
git clone https://github.com/your-repo/Tac-TicKet.git
cd Tac-TicKet
```

### 2. Installer les dépendances frontend
```bash
cd frontend
npm install
cd ..
```

### 3. Configuration Maven (Backend)
Maven va automatiquement télécharger les dépendances lors du premier build.

### 4. Variables d'environnement (optionnel)
Créer un fichier `.env` à la racine ou utiliser les valeurs par défaut dans `docker-compose.yml`:

```bash
# Backend
JAVA_OPTS=-Xmx512m
SPRING_JPA_HIBERNATE_DDL_AUTO=update

# Frontend
VITE_API_URL=http://localhost:8080/api
```

---

## 🎯 Lancer le projet

### Option 1: Avec Docker Compose (Recommandé)

```bash
# Lancer tous les services
docker compose up -d

# Vérifier que les services sont actifs
docker compose ps

# Accéder à l'application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080/api
# Adminer (DB GUI): http://localhost:8081
```

### Option 2: Mode développement (Sans Docker)

#### Terminal 1 - Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
# Backend accessible sur http://localhost:8080
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
# Frontend accessible sur http://localhost:5173
```

#### Terminal 3 - Database
```bash
# Démarrer MySQL (sur port 3306)
# Créer la base de données 'ticketing_db'
```

### Arrêter les services
```bash
# Arrêter et nettoyer
docker compose down -v

# Juste arrêter
docker compose stop

# Redémarrer
docker compose restart
```

---

## ⚙️ Configuration

### Base de données

La base de données est automatiquement initialisée avec Docker Compose.

**Détails de connexion:**
- Host: `localhost`
- Port: `3306`
- Database: `ticketing_db`
- User: `root`
- Password: `root`

**Tables principales:**
- `users` - Utilisateurs et authentification
- `tickets` - Tickets de support
- `categories` - Catégories de tickets
- `user_categories` - Catégories assignées aux agents

### Google OAuth (optionnel)

Pour activer Google OAuth:

1. Créer une app Google OAuth sur [Google Cloud Console](https://console.cloud.google.com/)
2. Obtenir les credentials (Client ID, Client Secret)
3. Configurer dans `application.properties`:

```properties
spring.security.oauth2.client.registration.google.client-id=YOUR_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_SECRET
spring.security.oauth2.client.registration.google.redirect-uri=http://localhost:3000/auth/callback
```

---

## 📁 Structure du projet

```
Tac-TicKet/
├── frontend/                 # React + TypeScript + Vite
│   ├── src/
│   │   ├── pages/           # Pages principales
│   │   ├── components/      # Composants réutilisables
│   │   ├── context/         # React Context (Auth)
│   │   ├── stores/          # Zustand stores (state management)
│   │   ├── api/             # API services & types
│   │   └── main.tsx         # Entrée
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/                 # Spring Boot
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/tictac/tictac/
│   │   │   │   ├── controller/
│   │   │   │   ├── service/
│   │   │   │   ├── repository/
│   │   │   │   ├── entity/
│   │   │   │   ├── config/
│   │   │   │   └── TictacApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   ├── pom.xml
│   └── mvnw
│
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI/CD
│
├── docs/
│   └── database/           # Schéma DB et scripts
│
├── docker-compose.yml      # Configuration services
└── README.md              # Ce fichier
```

---

## 📚 API Documentation

### Endpoints principaux

#### Auth
```
POST   /api/auth/register        - Créer un compte
POST   /api/auth/login           - Se connecter
POST   /api/auth/me              - Infos utilisateur actuel
POST   /api/auth/logout          - Se déconnecter
POST   /api/auth/refresh         - Rafraîchir le token
```

#### Tickets
```
GET    /api/tickets              - Lister les tickets
GET    /api/tickets/{id}         - Détails d'un ticket
POST   /api/tickets              - Créer un ticket
PUT    /api/tickets/{id}         - Mettre à jour un ticket
DELETE /api/tickets/{id}         - Supprimer un ticket
```

#### Categories
```
GET    /api/categories           - Lister les catégories
POST   /api/categories           - Créer une catégorie
PUT    /api/categories/{id}      - Mettre à jour
DELETE /api/categories/{id}      - Supprimer
```

#### Users (Admin)
```
GET    /api/users                - Lister les utilisateurs
GET    /api/users/{id}           - Détails utilisateur
PUT    /api/users/{id}           - Mettre à jour utilisateur
DELETE /api/users/{id}           - Supprimer utilisateur
```

---

## 👥 Rôles et permissions

### Admin
- ✅ Voir tous les tickets
- ✅ Gérer tous les utilisateurs
- ✅ Gérer les catégories
- ✅ Assigner des agents
- ✅ Accès complet aux rapports

### Agent
- ✅ Voir les tickets non assignés
- ✅ Voir les tickets assignés à lui
- ✅ Voir les tickets de ses catégories
- ✅ Mettre à jour les statuts

### User
- ✅ Créer des tickets
- ✅ Voir ses propres tickets
- ✅ Modifier ses propres tickets
- ✅ Mettre à jour son profil

---

## 🔄 CI/CD Pipeline

### GitHub Actions

La pipeline s'exécute automatiquement sur:
- Push vers `main`
- Création de PR vers `main`
- Push sur branches `feat/**`

**Étapes:**
1. **Lint** - ESLint + TypeScript
2. **Build** - Frontend (Vite) + Backend (Maven)
3. **Tests** - Tests unitaires Java
4. **Docker** - Build des images Docker
5. **Integration** - Lancer les services et vérifier

Consulter [`.github/workflows/ci.yml`](.github/workflows/ci.yml) pour les détails.

---

## 🐛 Troubleshooting

### Port déjà utilisé
```bash
# Voir quel processus utilise le port
lsof -i :3000    # Frontend
lsof -i :8080    # Backend
lsof -i :3306    # MySQL

# Arrêter le processus
kill -9 <PID>
```

### Docker issues
```bash
# Vérifier les logs
docker compose logs backend
docker compose logs frontend
docker compose logs mysql

# Nettoyer les volumes
docker compose down -v

# Rebuild les images
docker compose build --no-cache
```

### MySQL connection error
```bash
# Vérifier que MySQL est actif
docker compose ps mysql

# Accéder à MySQL directement
docker exec -it ticketing_mysql mysql -u root -p

# Vérifier la base de données
SHOW DATABASES;
USE ticketing_db;
SHOW TABLES;
```

### Frontend build error
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### TypeScript errors
```bash
# Vérifier la config
npm run lint

# Builder pour vérifier
npm run build
```

---

## 📞 Support

Pour des questions ou des problèmes:

1. Vérifier la section [Troubleshooting](#-troubleshooting)
2. Consulter les logs Docker
3. Vérifier que tous les prérequis sont installés
4. Créer une issue sur GitHub

---

## 📝 Développement

### Branches

- `main` - Production
- `feat/**` - Nouvelles fonctionnalités
- `fix/**` - Corrections de bugs
- `feat/language` - Localization (French translation)

### Commit convention

```
feat: Ajouter une fonctionnalité
fix: Corriger un bug
refactor: Refactoriser du code
ci: Changements CI/CD
docs: Mise à jour documentation
```

### Tests locaux avant push

```bash
# Frontend
cd frontend
npm run lint
npm run build

# Backend
cd backend
mvn clean test
mvn clean package

# Ou tout à la fois
docker compose build --no-cache
docker compose up
```

---

## 📄 Licence

[À compléter selon votre licence]

---

**Créé avec ❤️ par [Votre équipe]**