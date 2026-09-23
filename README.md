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

## The problem

Students often do not know which skills their target roles require or how to prove
what they can do. Recruiters rely on resumes that reveal little about real capability.
Faculty lack visibility into industry-aligned learning opportunities, while institutions
cannot easily track skill development, internship participation, and placement readiness.


| Stakeholder | Problem |
|---|---|
| **Students** | Don't know which skills their target role needs, can't prove what they know, and struggle to find opportunities that fit. |
| **Industry** | Can't find candidates with the right skills, and resumes say little about real ability. |
| **Academicians** | Little visibility into industry internships and current practice. |
| **Institutions** | Can't monitor skill development, internship participation or placement readiness. |


## Our solution

Skill Mitra creates one shared, evidence-based picture of skills for students,
industry, faculty, and institutions.

**Industry defines requirements → students assess their skills → gaps are identified →
students complete projects or challenges → evidence is verified → Skill Passports update →
students are matched to opportunities.**

| Role | Who | Main job to be done |
|---|---|---|
| **Student** | College students | Reach a desired role by proving skills and finding fitting opportunities. |
| **Industry** | Company recruiters and mentors | Find and evaluate candidates by skill, and hire through real work. |
| **Academician** | Faculty | Verify student skills, mentor, and find industry exposure. |
| **Institution** | Placement cell, administrators | Monitor skills, participation and placements. |


Unlike a standard job portal, Skill Mitra ranks candidates using verified skill evidence, explains the match score, and helps students close their gaps before applying.


## 3. Core Features

- Four role-based portals:   Student, Industry, Academician, and Institution
- Skill assessment with theory, code-reading, and JavaScript coding challenges
- Skill Passport with evidence and verification levels
- Career Path with target-role readiness and gap roadmap
- Industry requirement builder with explainable candidate matching
- Internship/job postings and application tracking
- Industry Challenges that create industry-verified proof of skills
- Academician verification and mentorship view
- Institution skill-gap and placement analytics


## 4. SIH Mapping

| SIH Requirement | Skill Mitra Implementation |
|---|---|
| Skill assessment questionnaire | Theory, code-reading, and coding assessment modules |
| Skill profile and skill-gap analysis | Skill Passport, per-skill scores, and Career Path readiness |
| Industry requirement mapping | Role requirement builder and explained candidate match |
| Internship and job postings | Opportunity board, one-click applications, status tracking |
| Industry learning programs | Challenges, certifications, workshops, mentorship, and projects |
| Academician portal | Verification queue, mentee progress, faculty opportunities |
| Institution dashboard | Cohort gaps, department metrics, and placement funnel |



## 5. Why Skill Mitra is different

Skill Mitra does not depend only on resumes. It creates a Skill Passport where
assessments, projects, challenges, internships, and mentor feedback become verified
evidence. Companies can match candidates based on skill requirements and see why
each candidate matches or falls short.

### 🔑 Key Differentiators

- **Shared, evidence-based skill picture** across students, industry, academicians, and institutions
- **Skill Passport** with progressive verification levels: Self → Assessment → College → Industry
- **Industry Challenges** that convert demonstrated skills into opportunities such as interviews and internships
- **Explainable Match Scores** that show how candidate skills align with industry requirements
- **Readiness Roadmaps** that identify skill gaps and guide students toward target roles

### 🎓 Academia–Industry Collaboration

Faculty can view a student's skill gaps → recommend a specific industry challenge or training → verify the completed project → track mentee progress.

For institutions, the **Curriculum Insight Panel** highlights top industry-demanded skills against current student skill levels, helping identify curriculum and training gaps.



## 6. Technical Architecture

Skill Mitra follows a role-based web architecture connecting students, industry, academicians, and institutions through a shared skill and opportunity platform.

```text
                    Skill Mitra
                         │
                         ▼
              React + Vite Frontend
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
      Student         Industry      Academic /
      Portal           Portal       Institution
          │              │              │
          └──────────────┼──────────────┘
                         ▼
              Role-Based Authentication
                    (Supabase Auth)
                         │
                         ▼
              Supabase PostgreSQL
                         │
       ┌─────────────────┼─────────────────┐
       ▼                 ▼                 ▼
   Skill Data       Opportunities      Challenges
       │                 │                 │
       ▼                 ▼                 ▼
 Skill Passport     Applications      Submissions
       │
       ▼
 Skill Assessment & Skill-Gap Analysis
       │
       ▼
 Candidate Matching & Shortlisting
```

### Core Technology Layers

- **Frontend:** React + Vite
- **Authentication:** Supabase Authentication
- **Database:** Supabase PostgreSQL
- **Data Layer:** Skills, profiles, Skill Passports, opportunities, applications, challenges, and submissions
- **Assessment Layer:** Theory and coding-based skill evaluation
- **Matching Layer:** Requirement-based candidate skill matching
- **Role-Based Access:** Separate workflows for Student, Industry, Academician, and Institution

**Prototype implementation:** The current prototype uses React with Supabase authentication and database services. JavaScript coding assessment is evaluated in the browser, while core user, skill, opportunity, application, and challenge data is stored in Supabase.

**Full version:** API, secure authentication, relational database, role-based access control, and sandboxed code execution for JavaScript, Python, and Java.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React** | Frontend user interface and role-based dashboards |
| **Vite** | Development server and frontend build tool |
| **JavaScript** | Application logic and interactive functionality |
| **Supabase Auth** | User authentication and role-based access |
| **Supabase PostgreSQL** | Database for profiles, skills, opportunities, applications, and challenges |
| **Lucide React** | UI icons |
| **CSS** | Styling and responsive interface design |
| **Git & GitHub** | Version control and source-code hosting |

## 7. Product roadmap

| Phase | Prototype / roadmap modules | What it proves |
|---|---|---|
| Phase 1: Core loop | Login, assessment, Skill Passport, candidate search, opportunity applications | Verified skills can drive hiring decisions |
| Phase 2: Growth loop | Career Path, Industry Challenges, reverse internship marketplace | Students can close gaps through evidence-building work |
| Phase 3: Ecosystem loop | Academician portal, institution analytics, advanced integrations | Institutions can use skill data to improve outcomes |


## 8. 📚 Documentation

- [Architecture](architecture.md)
- [Data Model](datamodel.md)
- [Matching and Scoring](matchingandscoring.md)
- [Problem Statement Mapping](problemstatementmapping.md)
- [Product Requirements](productrequirements.md)
- [Roadmaps](roadmaps.md)
- [Security and Privacy](securityprivacy.md)
