# iTunes Search Application

A full-stack application for searching iTunes podcasts. Built with NestJS backend and Next.js frontend.

## 🏗️ Architecture

```
itunes-search/
├── README.md
├── docker-compose.yml
├── itunes-search-api/          # NestJS Backend
└── itunes-search-ui/           # Next.js Frontend
```

## 🛠️ Tech Stack

### Backend (NestJS)
- **NestJS**: Node.js framework
- **Prisma**: Database ORM
- **PostgreSQL**: Database
- **TypeScript**: Type safety

### Frontend (Next.js)
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling

## 📋 Prerequisites

- Node.js 20+
- Docker

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/ABT099/itunes-search.git
cd itunes-search
```

### 2. Start PostgreSQL Database
```bash
docker-compose up -d
```

This will start PostgreSQL on `localhost:5432` with:
- Database: `itunes_podcasts`
- User: `postgres`
- Password: `postgres`

### 3. Setup Backend (NestJS)
```bash
cd itunes-search-api

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start development server
npm run start:dev
```

The API will be available at `http://localhost:5000`

### 4. Setup Frontend (Next.js)
```bash
cd ../itunes-search-ui

# Install dependencies
npm install

# Start development server
npm run dev
```

The UI will be available at `http://localhost:3000`
