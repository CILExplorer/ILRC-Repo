# International Law Research Collective (ILRC)

The **International Law Research Collective (ILRC)** is a professional, practitioner-oriented publication platform that automatically scrapes international law feeds, formats structured digests using Claude 3.5 Sonnet, provides a password-protected editorial dashboard with strict source-verification checks, generates print-ready PDFs, and broadcasts published issues to subscribers via Resend.

---

## Technical Stack & Architecture

- **Framework**: Next.js (App Router with TypeScript and Server Components).
- **Database**: Neon Serverless Postgres.
- **Styling**: Vanilla CSS (Tailored legal color variables, responsive grid structures, and smooth micro-animations).
- **AI Engine**: Anthropic Claude API (`claude-3-5-sonnet-20241022`).
- **Mailing List**: Resend SDK.
- **PDF Generation**: PDFKit (Vector layout engine streaming custom A4 formats).

---

## Prerequisites & Environment Variables

Create a `.env.local` file in the root directory for local development, or add these variables directly in Vercel's environment configuration dashboard:

```env
# Database connection string from Neon Console
DATABASE_URL="postgres://username:password@hostname/neondb?sslmode=require"

# Anthropic Claude API credentials
ANTHROPIC_API_KEY="sk-ant-..."

# Password to authenticate the Editor Admin panel (/admin)
ADMIN_PASSWORD="YourSecureAdminPassword123"

# Secret token protecting the cron generation endpoint (/api/generate-digest)
CRON_SECRET="YourSecretCronTokenXYZ"

# Resend API key for broadcasting digests to the mailing list
RESEND_API_KEY="re_..."
```

---

## Local Setup & Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Initialize Database Schema**:
   *The application implements automatic schema migrations.* On the very first request to the database (whether loading the website or triggering a scrape), the application will check for the existence of the tables and run `schema.sql` automatically.
   
   If you prefer to load it manually, copy the code inside [schema.sql](file:///C:/Users/Ananyaa/.gemini/antigravity/scratch/ilrc-app/schema.sql) and execute it in your Neon console SQL editor.

3. **Run Verification Scripts**:
   You can verify feed connections locally by running:
   ```bash
   node test-scraper.js
   ```

4. **Launch Dev Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to view the public site.
   Access `http://localhost:3000/admin` to log into the Editor Dashboard.

---

## Sourcing and Settle-down Requirements

The application enforces sourcing compliance at both the database and service level:
1. **Database Schema Constraints**: Every scraped segment (`arb_source_url`, `arb_source_date`, `treaty_source_url`, etc.) is marked `NOT NULL` in the SQL schema.
2. **Server-Side Validation**: The API endpoint `PUT /api/admin/digests/[id]` and `PUT /api/admin/case-notes/[id]` will reject any publishing requests (returning a `400 Bad Request`) unless the verification checkboxes are ticked, confirming that the editor checked the text against the source URL.
3. **Claude Sourcing Directives**: The system prompt given to Claude on every generation task explicitly reads:
   > *"You are a legal research assistant producing a structured digest for an international law publication. Only use information present in the provided source text. Do not add facts, names, case citations, dates, or figures that are not explicitly stated in the source material. For each item, include the exact source URL and publication date."*

---

## Deployment on Vercel

1. Push your code to a GitHub repository.
2. Link your repository in the Vercel Dashboard.
3. **Add Neon Database Integration**: Click on Vercel Integrations, select Neon Postgres, and connect it to your project (this automatically populates the `DATABASE_URL` environment variable).
4. Add the remaining variables (`ANTHROPIC_API_KEY`, `ADMIN_PASSWORD`, `CRON_SECRET`, `RESEND_API_KEY`) to the project settings.
5. Deploy.

---

## Cron Job Configuration (cron-job.org)

To automate the fortnightly generation, configure a cron execution in [cron-job.org](https://cron-job.org):
1. Create a new cron job.
2. **Target URL**: Point it to `https://your-app-domain.vercel.app/api/generate-digest`.
3. **Request Method**: Select `GET` (or `POST`).
4. **Authentication**: Choose between:
   - **Query Parameter**: Append the secret to the URL, e.g., `?secret=YourSecretCronTokenXYZ`.
   - **Authorization Header**: Select Custom Headers, and add:
     - Key: `Authorization`
     - Value: `Bearer YourSecretCronTokenXYZ`
5. **Schedule**: Set it to run every 14 days (or select the specific weekday schedule).

---

## Resend Mailing List Setup

1. Sign up on [resend.com](https://resend.com) and create an API Key.
2. By default, new Resend accounts are in the sandbox mode and can only send emails to the developer's registered account email address.
3. To send newsletters to a wider audience, verify your custom domain in the Resend Domains Dashboard and update the `from` email address header in `src/lib/email.ts` from `onboarding@resend.dev` to your verified address (e.g. `digest@yourdomain.org`).
