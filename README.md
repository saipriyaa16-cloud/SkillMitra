# Skill Mitra

**Skills proven, careers built.**

Skill Mitra is an evidence-based platform connecting students, academia, and industry through skill mapping, verified Skill Passports, internships, challenges, and placement opportunities.

---

## 🚀 Run Skill Mitra Locally

Follow these steps to run the project on your local machine.

### 1. Prerequisites

Make sure you have the following installed:

- Node.js (LTS version recommended)
- npm
- Git

Check your installations:

```bash
node --version
npm --version
git --version
```

### 2. Clone the Repository

Open your terminal and run:

```bash
git clone https://github.com/saipriyaa16-cloud/SkillMitra.git
```

Then enter the project folder:

```bash
cd SkillMitra
```

### 3. Install Dependencies

Install all required packages:

```bash
npm install
```

### 4. Configure Environment Variables

Skill Mitra uses Supabase for authentication and database services.

Create a file named:

```text
.env
```

in the root directory of the project.

Add your Supabase configuration:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace the placeholder values with the Supabase URL and anon key from your Supabase project.

> **Important:** Do not upload your `.env` file or private credentials to GitHub.

### 5. Start the Development Server

Run:

```bash
npm run dev
```

You should see something similar to:

```text
Local: http://localhost:5173/
```

Open the displayed local URL in your browser.

### 6. Login and Explore

Once the application opens:

1. Select a user role.
2. Login using a configured account.
3. Open the corresponding dashboard.
4. Explore the available features and workflows.

The prototype includes Student and Industry workflows.
