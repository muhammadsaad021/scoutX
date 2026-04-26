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
- **Database**: MS SQL Server (via Prisma ORM)
- **Authentication**: NextAuth.js (Credentials Provider and JWT)

---

## Local Development Guide

### Prerequisites

- Node.js (v24 LTS recommended)
- MS SQL Server (or Azure SQL Database)

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
# Database connection (Update with your SQL Server credentials)
DATABASE_URL="sqlserver://localhost:1433;database=scoutx;user=sa;password=your_password;encrypt=true;trustServerCertificate=true;"

# NextAuth secret key (Generate via `openssl rand -base64 32`)
NEXTAUTH_SECRET="your-secure-random-string"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Initialization

Push the Prisma schema to your SQL Server to establish the tables:

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

### Database Hosting (Azure SQL)

1. Provision a new Azure SQL Database via the Azure Portal.
2. In the Networking settings, enable "Allow Azure services and resources to access this server" and add your local IP address.
3. Update your local `DATABASE_URL` with the Azure Connection String.
4. Execute `npx prisma db push` to initialize the tables on the cloud infrastructure.

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
