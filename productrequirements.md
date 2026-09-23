# Skill Mitra Product Requirements

## Product vision

Skill Mitra is a single platform where students, industry, academicians, and institutions work from one shared, evidence-based picture of skills.

Industry defines which skills matter. Students measure themselves against those expectations, close gaps through projects and challenges, and collect verified evidence in a Skill Passport. Companies discover and hire candidates based on demonstrated skills rather than resumes. Faculty verify and mentor. Institutions gain visibility into skill development, internship participation, and placement readiness.

## The Skill Evidence Loop

> **Industry defines skills → student is assessed → gaps are identified → student builds evidence through projects or challenges → faculty or industry verifies evidence → Skill Passport updates → opportunities match students → institutional insights improve learning.**

Each product layer supports this loop.

## Layer 0: Foundation

### Purpose

Create a consistent base for every screen, role, workflow, and demonstration.

### Prototype scope

- Shared design system: typography, colors, spacing, cards, buttons, tables, status badges, and charts
- Distinct accent color for Student, Industry, Academician, and Institution roles
- Shared fictional demo dataset for students, companies, faculty, skills, opportunities, applications, challenges, and evidence
- Visible “Demo data” indicator on all prototype screens
- Responsive mobile and desktop layout
- Keyboard-accessible controls and readable color contrast
- Computer Science skills catalog with technical and soft-skill categories
- Skill level scale from 0 to 100

### Full-version expansion

- Multi-domain skills catalog
- Skill taxonomy governance with industry and academic contributors
- Multi-institution tenant structure
- Localization and regional-language support
- Low-bandwidth experience

### Acceptance proof

All screens share a consistent design, use the same sample data, and show changes across roles.

## Layer 1: Access and four role logins

### Purpose

Clearly demonstrate role-based access and separate stakeholder workflows.

### Prototype scope

- Landing page with four role cards: Student, Industry, Academician, Institution
- Role-specific login pages with role-specific wording and color
- “Use demo account” shortcut
- Prototype accepts demo inputs and opens the selected dashboard
- Logout and role switch option
- Each role sees only its own pages in the prototype navigation

### Full-version expansion

- Secure email verification
- Company account approval
- Institution administrator approval
- Institutional single sign-on
- Role-based access control on every backend request
- Session management, password security, and audit logs

### Acceptance proof

Each of the four role logins opens a distinct dashboard and cannot access another role’s protected workflows.

## Layer 2: Student skill assessment

### Purpose

Measure student skills using theory and code-oriented evaluation.

### Prototype scope

- Assessments organized by skill and difficulty
- Example skills: programming fundamentals, data structures, databases, web development, and problem solving
- Multiple-choice theory questions with explanations after submission
- Code-reading questions in JavaScript, Python, and Java
- JavaScript coding challenges with problem statement, sample test cases, and hidden test cases
- Python and Java editors shown with the label: “Graded by backend in the full version”
- Timer, section progress, review-before-submit flow, and result page
- Skill score calculated using 40% theory and 60% code, configurable for the full version
- Per-skill strengths and gaps
- Assessment-verified evidence written to the Skill Passport

### Full-version expansion

- Sandboxed code execution for JavaScript, Python, and Java
- Adaptive difficulty
- Faculty and industry question-bank management
- Plagiarism checks, proctoring, and attempt integrity controls
- Question analytics and skill calibration

### Acceptance proof

A student completes an assessment, receives a per-skill score, sees strengths and gaps, and sees assessment-verified evidence in the Skill Passport.

## Layer 3: Skill Passport and verification

### Purpose

Provide a trusted, portable record of demonstrated skills.

### Prototype scope

- Skill Passport with per-skill score and supporting evidence
- Evidence types: assessments, projects, challenges, internships, certifications, and mentor feedback
- Verification levels:
  1. Self-declared
  2. Assessment-verified
  3. College-verified
  4. Industry-verified
- Summary of completed projects, internships, certifications, and challenges
- Student-controlled visibility settings
- Public/shareable view for selected passport information
- Displayed skill level uses the strongest verified evidence

### Full-version expansion

- Verifier identity and evidence audit trail
- Verified certificate integrations
- Cryptographically verifiable credentials where appropriate
- Expiring or renewable evidence for time-sensitive skills
- Exportable passport for student portability

### Acceptance proof

The Skill Passport reflects assessment, challenge, and faculty verification evidence, with every item labelled by source and verification level.

## Layer 4: Industry requirement builder and candidate search

### Purpose

Enable companies to find candidates based on actual role requirements and verified skill evidence.

### Prototype scope

- Requirement builder with role title and required skills
- Minimum level for each skill
- Must-have and nice-to-have importance levels
- Filters for verified skills, department, year, projects, internships, minimum match score, and keyword search
- Ranked candidate results
- Match percentage with explanation of met, partly met, and missing requirements
- Missing must-have flag
- Candidate Skill Passport view that respects student visibility settings
- Shortlist, send interest message, invite to challenge, save search, and compare candidates

### Full-version expansion

- Saved pipelines, recruiter collaboration, interview scheduling, and ATS integrations
- Company verification and recruiter permissions
- Bias monitoring and fairness review
- Candidate search analytics

### Acceptance proof

A recruiter enters role requirements, receives a ranked and explainable candidate list, opens a passport, and shortlists a candidate. The student sees the resulting status update.

## Layer 5: Opportunities and application tracking

### Purpose

Connect opportunities, applications, recruiter decisions, and outcomes.

### Prototype scope

- Industry postings for internships, jobs, apprenticeships, workshops, and learning programmes
- Required skills, openings, location or remote setting, stipend or salary, and deadline
- Student recommendations with match score and explanation
- One-click demo application
- Student status tracking:
  - Applied
  - Under review
  - Shortlisted
  - Interview
  - Offer
  - Rejected
- Recruiter applicant view ranked by skill match
- Recruiter status updates
- Status changes reflected in student view and institutional analytics

### Full-version expansion

- Notifications, interview scheduling, document collection, offer workflows, and reporting
- Employer approval and posting moderation
- Application privacy controls
- Integration with placement-cell processes

### Acceptance proof

A company posts an opportunity, a student applies, the company shortlists the student, and the updated status becomes visible to the student.

## Layer 6: Career Path

### Purpose

Give students a measurable route from their current capabilities to a chosen career role.

### Prototype scope

- Target role selection, such as Full-Stack Developer, Data Analyst, Backend Engineer, or ML Engineer
- Defined role profiles containing required skills and levels
- Readiness score based on the student’s Skill Passport
- Strengths and gaps mapped to the target role
- Ordered roadmap:
  - Take an assessment
  - Complete a gap-filling project
  - Earn a certification
  - Join an industry challenge
  - Apply to matching internships
- Next-best action on the student dashboard
- Suggested projects for the largest skill gap
- Progress history showing readiness improvement

### Full-version expansion

- Personalized learning-path recommendations
- Institution- and company-curated learning content
- Mentor intervention triggers
- Readiness benchmarking by cohort and role

### Acceptance proof

Changing a target role updates readiness, gaps, recommendations, and roadmap. Completing evidence-building steps improves the readiness score.

## Layer 7: Industry Challenges

### Purpose

Allow students to earn opportunities through structured, real-world work.

### Prototype scope

- Company-created challenge with:
  - Title
  - Description
  - Required skills
  - Difficulty
  - Timeline and milestones
  - Evaluation rubric
  - Deliverables
  - Reward, such as interview, internship, or role consideration
- Student challenge discovery based on skill gaps and career goals
- Challenge acceptance and milestone tracking
- Submission through repository link or written report
- Company scoring against a rubric
- Written feedback
- Shortlisting or offer decision
- Industry-verified Skill Passport evidence after successful evaluation
- Student explanation of approach before final acceptance
- Challenge states:
  - Open
  - Accepted
  - In progress
  - Submitted
  - Under review
  - Completed
  - Offer made

### Full-version expansion

- Approved-company workflow
- Submission originality checks
- Rich deliverable support
- Video explanations and reviewer panels
- Challenge templates by skill and industry
- Dispute-resolution and ethical-task review mechanisms

### Acceptance proof

A company posts a challenge, a student completes and submits it, the company scores it, and the student’s passport and candidate ranking update.

## Layer 8: Reverse internship marketplace

### Purpose

Start from the student’s career goal rather than making the student search through unrelated listings.

### Prototype scope

- Student-entered career goal or interest statement
- Keyword and skill-based matching to:
  - Companies
  - Internships
  - Faculty mentors
  - Industry challenges
  - Learning programmes
- Student interest request to a company or faculty member
- Company response to interest requests

### Full-version expansion

- Semantic matching
- Mentor availability and booking
- Collaborative project discovery
- Smart recommendation ranking based on verified evidence, interests, and goals

### Acceptance proof

A student enters a career goal and receives relevant companies, opportunities, mentors, and challenges from the shared sample data.

## Layer 9: Academician portal

### Purpose

Enable faculty members to verify evidence, mentor students, and engage with industry opportunities.

### Prototype scope

- Verification queue for student project, lab, and activity evidence
- Approve or comment on evidence
- College-verified evidence added to the student’s Skill Passport
- Mentee progress list
- Faculty internship, industrial training, FDP, workshop, and guest-lecture opportunities
- Industry partner interaction request

### Full-version expansion

- Mentor assignment and capacity management
- Faculty consulting and research collaboration workflows
- Department and course-level skill tracking
- Evidence review audit trail
- Faculty performance and engagement analytics

### Acceptance proof

A faculty member approves a student’s project evidence and the Skill Passport updates with college-verified evidence.

## Layer 10: Institution analytics

### Purpose

Help institutions understand skill readiness, internship participation, placement progress, and curriculum gaps.

### Prototype scope

- Overview metrics:
  - Students assessed
  - Average skill score
  - Internship participation
  - Placement rate
- Cohort skill-gap chart comparing student capability and industry demand
- Department breakdown table
- Placement funnel:
  - Applied
  - Shortlisted
  - Interview
  - Offer
- Curriculum insight panel showing the skills requested most by industry compared with student skill levels

### Full-version expansion

- Multi-cohort trend analysis
- Custom reports and exports
- Curriculum intervention recommendations
- Integration with institutional systems
- Benchmarking across departments and institutions
- Regulator and policy-level analytics where appropriate

### Acceptance proof

The institution dashboard shows how shared sample-data actions affect skill metrics, internship participation, and placement funnel counts.

## Layer 11: Future scope

### Purpose

Extend Skill Mitra beyond the hackathon prototype into a scalable, trusted ecosystem.

### Planned capabilities

- Job-specific AI mock interviews generated from role requirements and student gaps
- Detailed practice plans based on interview performance
- Structured, verified feedback on internship learning quality
- Integrations with learning platforms, certification providers, and institutional databases
- Regional-language support
- Low-bandwidth mode
- Multi-disciplinary skills catalog
- Policy-level analytics for institutions and regulators
- Advanced anti-cheating, originality, and identity-verification controls
- Company approval, moderation, and challenge quality governance

## Prototype boundaries

The hackathon prototype does not claim to provide:

- Real production user accounts
- Payments
- Production database infrastructure
- Secure Python or Java code execution
- Full academician workflows
- Full institution administration workflows
- General job-portal replacement
- Production-grade proctoring, plagiarism detection, or integrations

## Product principle

Skill Mitra is designed around a simple principle:

> **Skills should be demonstrated, verified, explainable, portable, and connected to real opportunities.**
