# ScoutX Player Evaluation Platform

ScoutX is a full-stack, modular platform designed for scouts, coaches, and managers to evaluate football talent, track performance, and generate actionable insights through rankings and comparisons.

## Key Features

- **Role-Based Access Control**: Differentiated permissions for Administrators, Managers, Coaches, and Scouts.
- **Dynamic Player Profiles**: Comprehensive tracking of statistics, metrics, and scout notes.
- **Advanced Scoring & Rankings**: Custom mathematical models to evaluate and rank players by position.
- **Side-by-Side Comparison**: Live search and statistical comparison of up to three players simultaneously.
- **Watchlists**: Personal, managed watchlists for tracking high-potential talent.
- **PDF Reporting**: Instant generation of professional scout reports and dossiers.
- **Tactical Dark Mode UI**: A highly responsive, neon-green "True Dark" aesthetic design system.

---

## Technical Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Vanilla CSS (Global Design System Tokens)
- **Backend**: Next.js API Routes (Serverless architecture)
- **Database**: PostgreSQL (hosted on Neon, accessed via Prisma ORM)
- **Authentication**: NextAuth.js (Credentials Provider and JWT)

---

## Local Development Guide

### Prerequisites

- Node.js (v24 LTS recommended)
- A Neon PostgreSQL database (free tier available at [neon.tech](https://neon.tech))

### 1. Repository Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/muhammadsaad021/scoutX.git
cd scout-x-app
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory and populate it with your specific credentials:

```env
# Neon PostgreSQL Connection String (from Neon Dashboard)
DATABASE_URL="postgresql://username:password@ep-xxxx.us-east-2.aws.neon.tech/scoutx-db?sslmode=require"

# NextAuth secret key (Generate via `openssl rand -base64 32`)
NEXTAUTH_SECRET="your-secure-random-string"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Initialization

Push the Prisma schema to your Neon PostgreSQL database to establish the tables:

```bash
npx prisma db push
```

### 4. Application Launch

Start the development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

---

## API Documentation

ScoutX provides interactive Swagger API documentation.
Once the server is running, navigate to the following URL to view the OpenAPI specifications:

**`http://localhost:3000/docs`**

---

## Deployment Procedures

### Database Hosting (Neon PostgreSQL)

1. Sign up at [neon.tech](https://neon.tech) and create a new project.
2. Copy the connection string from the Neon Dashboard (format: `postgresql://user:pass@ep-xxxx.aws.neon.tech/dbname?sslmode=require`).
3. Set the `DATABASE_URL` environment variable to the connection string.
4. Execute `npx prisma db push` to initialize the tables on the cloud database.

### Application Hosting (Vercel)

1. Import the GitHub repository into a new Vercel project.
2. Under the deployment configuration, define `DATABASE_URL` and `NEXTAUTH_SECRET` as Environment Variables.
3. Initiate the deployment. Vercel will automatically build and host the Next.js application.

---

## System Architecture

ScoutX adheres to Software Design and Architecture (SDA) principles:

- **Layered Architecture**: Strict separation of UI components, custom React hooks, and data-fetching API services.
- **Single Responsibility Principle**: Decentralized logic handling for maximum modularity and maintainability.
- **Guard Clauses**: Clean code architecture prioritizing early returns to avoid deeply nested conditionals.
