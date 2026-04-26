# ScoutX — Advanced Player Evaluation Platform

ScoutX is a full-stack, modular platform designed for scouts, coaches, and managers to evaluate football talent, track performance, and generate actionable insights through rankings and comparisons.

## 🚀 Key Features
- **Role-Based Access Control**: Different permissions for Admins, Managers, Coaches, and Scouts.
- **Dynamic Player Profiles**: Comprehensive statistics, metrics, and scout notes.
- **Advanced Scoring & Rankings**: Custom mathematical model to evaluate and rank players by position.
- **Side-by-Side Comparison**: Live search and statistical comparison of up to 3 players.
- **Watchlists**: Personal, managed watchlists for tracking talent.
- **PDF Reporting**: Instant generation of professional scout reports.
- **Tactical Dark Mode UI**: A highly responsive, neon-green "True Dark" aesthetic design system.

---

## 🛠️ Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Vanilla CSS (Global Design System Tokens)
- **Backend**: Next.js API Routes (Serverless)
- **Database**: MS SQL Server (via Prisma ORM)
- **Authentication**: NextAuth.js (Credentials Provider + JWT)

---

## 💻 Getting Started (Local Development)

### Prerequisites
- Node.js (v24 LTS recommended)
- MS SQL Server (or Azure SQL Database)

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/muhammadsaad021/scoutX.git
cd scout-x-app
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Environment Variables
Create a \`.env\` file in the root directory:
\`\`\`env
# Database connection (Update with your SQL Server credentials)
DATABASE_URL="sqlserver://localhost:1433;database=scoutx;user=sa;password=your_password;encrypt=true;trustServerCertificate=true;"

# NextAuth secret key (Generate via `openssl rand -base64 32`)
NEXTAUTH_SECRET="your-secure-random-string"
NEXTAUTH_URL="http://localhost:3000"
\`\`\`

### 4. Database Setup
Push the Prisma schema to your SQL Server:
\`\`\`bash
npx prisma db push
\`\`\`

### 5. Start the Application
\`\`\`bash
npm run dev
\`\`\`
The app will be running at \`http://localhost:3000\`.

---

## 📖 API Documentation
ScoutX provides interactive Swagger API documentation.
Start the server and navigate to:
**\`http://localhost:3000/docs\`**

---

## ☁️ Deployment (Vercel & Azure)

### Database (Azure SQL)
1. Create a new Azure SQL Database in the Azure Portal.
2. Under "Networking", allow "Azure services" and add your local IP.
3. Update your local \`DATABASE_URL\` to the Azure Connection String.
4. Run \`npx prisma db push\` to initialize tables on the cloud.

### Application (Vercel)
1. Import the GitHub repository into Vercel.
2. In the deployment settings, add \`DATABASE_URL\` and \`NEXTAUTH_SECRET\` as Environment Variables.
3. Click **Deploy**. Vercel will automatically build and host the Next.js application.

---

## 🏗️ Architecture
ScoutX follows Software Design and Architecture (SDA) principles:
- **Layered Architecture**: Separation of UI components, custom React hooks, and API Services.
- **Single Responsibility**: Decentralized logic handling for maximum modularity.
- **Guard Clauses**: Clean code architecture avoiding deeply nested conditionals.

*Designed with tactical precision for the modern scout.*
