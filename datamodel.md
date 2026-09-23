# Skill Mitra Data Model

## Overview

Skill Mitra uses a connected data model so skill evidence created by one stakeholder can improve matching, opportunity access, mentoring, and institutional insight.

## Main entities

| Entity | Key fields | Purpose |
|---|---|---|
| User | id, name, email, role, status | Base identity for all platform users |
| Student Profile | user_id, department, year, target_role, visibility_settings | Student-specific profile and preferences |
| Company Profile | user_id, company_name, industry, approval_status | Company and recruiter details |
| Faculty Profile | user_id, department, institution_id | Faculty identity and affiliation |
| Institution | id, name, location, departments | Institution-level organisation record |
| Skill | id, name, category, description, level_scale | Skill catalog item |
| Role Profile | id, title, industry, description | Target job-role definition |
| Role Skill Requirement | role_id, skill_id, minimum_level, importance | Required skill for a role |
| Assessment | id, title, skill_id, difficulty, configuration | Assessment definition |
| Question | id, assessment_id, type, difficulty, language, content | Theory, code-reading, or coding question |
| Assessment Attempt | id, student_id, assessment_id, answers, score, completed_at | Student assessment record |
| Skill Evidence | id, student_id, skill_id, score, source, verifier_type, verification_level, date | Proof supporting a student skill |
| Skill Passport | student_id, summary_metrics, visibility_preferences | Aggregated student evidence profile |
| Opportunity | id, company_id, type, title, description, openings, deadline | Internship, job, apprenticeship, workshop, or programme |
| Opportunity Skill Requirement | opportunity_id, skill_id, minimum_level, importance | Skills required by an opportunity |
| Application | id, student_id, opportunity_id, current_status | Student application record |
| Application Status History | application_id, status, changed_at, changed_by | Audit trail for application progress |
| Challenge | id, company_id, title, description, difficulty, timeline, rubric, reward | Industry Challenge definition |
| Challenge Milestone | challenge_id, title, due_date, expected_output | Required progress stage |
| Challenge Submission | id, challenge_id, student_id, repository_link, report, status, score, feedback | Student response to a challenge |
| Verification Request | id, evidence_id, student_id, verifier_id, status, comments | Faculty or industry verification workflow |
| Interest Request | id, from_user_id, to_user_id, message, status | Reverse marketplace connection request |
| Notification | id, user_id, type, message, read_status | User-facing status and alert record |

## Key relationships

```text
User
 ├── Student Profile
 ├── Company Profile
 ├── Faculty Profile
 └── Institution role association

Student Profile
 ├── Skill Passport
 ├── Assessment Attempts
 ├── Skill Evidence
 ├── Applications
 ├── Challenge Submissions
 └── Interest Requests

Role Profile
 └── Role Skill Requirements
      └── Skill

Opportunity
 ├── Company Profile
 ├── Opportunity Skill Requirements
 │    └── Skill
 └── Applications
      └── Student Profile

Challenge
 ├── Company Profile
 ├── Challenge Milestones
 └── Challenge Submissions
      └── Student Profile

Skill Evidence
 ├── Student Profile
 ├── Skill
 ├── Source activity: assessment, project, challenge, internship, certification
 └── Verification Request or verifier information
```

## Evidence lifecycle

```text
Student completes activity
        ↓
Evidence item is created
        ↓
Evidence is tagged with skill, score, source, and verification level
        ↓
Faculty or industry verifies when applicable
        ↓
Skill Passport selects strongest verified evidence
        ↓
Readiness and candidate match scores recompute
        ↓
Institution aggregate metrics update
```

## Example Skill Evidence record

```json
{
  "id": "evidence_001",
  "student_id": "student_001",
  "skill_id": "javascript",
  "score": 78,
  "source": "Industry Challenge: Responsive Dashboard",
  "verifier_type": "industry",
  "verification_level": 4,
  "verified_by": "company_technova_001",
  "verified_at": "2026-09-23",
  "visibility": "shared_with_companies"
}
```

## Data privacy rule

Individual records are visible only when allowed by the relevant role and student visibility settings. Institution analytics should be aggregated by default.
