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

### 2.Clone the Repository

Open your terminal and run:

git clone https://github.com/saipriyaa16-cloud/SkillMitra.git

Then enter the project folder:

cd SkillMitra

### 3.Install Dependencies

Install all required packages:

npm install

### 4.Configure Environment Variables

Skill Mitra uses Supabase for authentication and database services.

Create a file named:

.env

in the root directory of the project.

Add your Supabase configuration:

VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

Replace the placeholder values with the Supabase URL and anon key from your Supabase project.

### 5.Start the Development Server

Run:

npm run dev

You should see something similar to:

Local: http://localhost:5173/

Open the displayed local URL in your browser.

### 6.Login and Explore

Once the application opens:

Select a user role.
Login using a configured account.
Open the corresponding dashboard.
Explore the available features and workflows.

The prototype includes Student and Industry workflows.
If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
