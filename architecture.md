# Skill Mitra Architecture

## Architecture principle

Skill Mitra is designed as an evidence-based platform where actions in one role become visible, with appropriate permissions, to the other roles.

For example:

- A student completes an assessment.
- The assessment creates skill evidence.
- The Skill Passport updates.
- A recruiter sees the updated candidate match score if the student has shared that information.
- Institution analytics reflect the updated cohort-level result.
- A faculty member can review or verify additional evidence.

## Prototype architecture

```text
┌──────────────────────────────────────────────────────────┐
│                    Single-Page Web App                   │
│                                                          │
│  Student Portal | Industry Portal | Faculty | Institution │
│                                                          │
│  Shared Components | Responsive UI | Demo Data Indicator  │
└───────────────────────────┬──────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│                   Client-side Application Logic           │
│                                                          │
│ Assessment scoring | Match scoring | Readiness scoring    │
│ Passport updates   | Application status | Challenge flow  │
└───────────────────────────┬──────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│                   Shared In-Memory Demo Data              │
│                                                          │
│ Students | Skills | Evidence | Roles | Companies          │
│ Opportunities | Applications | Challenges | Analytics     │
└──────────────────────────────────────────────────────────┘
```

## Prototype implementation

The SIH prototype is a shareable web application built around a consistent sample dataset.

### Prototype capabilities

- Role-based demo access for Student, Industry, Academician, and Institution views
- Shared fictional data visible across related dashboards
- Browser-based scoring for theory, code-reading, and JavaScript coding questions
- Explainable candidate-to-role matching
- Skill Passport updates based on assessment and simulated verification workflows
- Opportunity/application status transitions
- Career-readiness calculation
- Institution analytics derived from sample data

### Prototype limitations

- No real authentication
- No production database
- No real payment system
- No secure backend execution for Python and Java code
- No production-grade data security or audit logs
- No real external integration
- No live production companies, students, or institutional data

## Full-version architecture

```text
┌──────────────────────────────────────────────────────────┐
│                      Frontend Web App                    │
│                                                          │
│ Student | Industry | Academician | Institution Portals    │
│ Responsive UI | Accessibility | Regional language support │
└───────────────────────────┬──────────────────────────────┘
                            │ HTTPS
                            ▼
┌──────────────────────────────────────────────────────────┐
│                    API and Application Layer             │
│                                                          │
│ Authentication | Role-based access | Business logic       │
│ Matching | Evidence verification | Notifications          │
│ Opportunity and application workflows | Analytics APIs    │
└───────┬─────────────────┬─────────────────┬──────────────┘
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌────────────────┐  ┌────────────────────┐
│ Relational   │  │ File Storage   │  │ Code Execution     │
│ Database     │  │                │  │ Sandbox            │
│              │  │ Certificates  │  │ JavaScript         │
│ Users        │  │ Submissions   │  │ Python             │
│ Skills       │  │ Reports       │  │ Java               │
│ Evidence     │  │ Evidence      │  │ Hidden test cases  │
│ Opportunities│  └────────────────┘  └────────────────────┘
│ Applications │
│ Challenges   │
└──────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│                       Analytics Layer                    │
│                                                          │
│ Skill gaps | Internship participation | Placement funnel │
│ Department insights | Industry-demand comparison         │
└──────────────────────────────────────────────────────────┘
```

## Major modules

| Module | Responsibility |
|---|---|
| Identity and access | Authentication, role assignment, permissions, institution association |
| Skills catalog | Stores skills, categories, levels, and role mappings |
| Assessment engine | Delivers questions, scores attempts, and creates assessment evidence |
| Skill Passport | Stores evidence, verification level, visibility setting, and displayed skill score |
| Matching engine | Calculates role match and student readiness using transparent formulas |
| Opportunity module | Supports job, internship, apprenticeship, workshop, and learning-programme postings |
| Application module | Tracks application states, shortlisting, interviews, offers, and outcomes |
| Challenge module | Manages challenge posting, milestones, submissions, rubrics, feedback, and rewards |
| Faculty module | Supports verification requests, mentees, faculty training, and industry engagement |
| Institution analytics | Aggregates cohort-level skills, demand gaps, participation, and placement outcomes |
| Notification service | Alerts users about verification, applications, shortlists, challenges, and deadlines |
| Code execution service | Securely runs coding submissions in isolated sandboxes in the full version |

## Role-based access

| Resource | Student | Industry | Academician | Institution |
|---|---|---|---|---|
| Own Skill Passport | View and edit visibility | View only when shared | View for assigned mentees | Aggregated access only |
| Candidate search | No | Yes | No | No |
| Post opportunities | No | Yes | Faculty-specific listings only | No |
| Post challenges | No | Yes | No | No |
| Verify evidence | Submit evidence | Verify challenge submissions | Verify college/lab/project evidence | No |
| Institution analytics | Own progress only | Own postings only | Mentee progress | Full authorised view |

## Data consistency principle

The prototype uses a shared sample-data store. The full version will use API-backed transactional updates.

An update should create visible downstream effects where permitted:

- Assessment completed → assessment evidence added → student score and readiness recalculated.
- Faculty verification completed → college-verified evidence added → Skill Passport and match ranking recalculated.
- Challenge scored → industry-verified evidence added → candidate ranking and readiness recalculated.
- Application status changed → student receives update → institution placement funnel updates.
- Industry requirement edited → candidate matches recompute.

## Security design direction

The production platform will use:

- HTTPS in transit
- Encryption at rest where applicable
- Secure authentication and session management
- Role-based access control enforced by the backend
- Consent-based passport visibility
- Audit logging for verification and recruiter access
- Input validation and rate limiting
- Sandboxed code execution isolated from the main application
- Regular security testing and legal/privacy review
