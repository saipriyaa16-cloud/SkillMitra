# Skill Mitra Matching and Scoring Logic

## Design principle

Every score in Skill Mitra must be understandable.

Students, recruiters, faculty, and institutions should be able to see:

- Which skills were considered
- What level was required
- What level the student has demonstrated
- Which evidence supports that score
- Which skills are met, partly met, or missing
- Why a candidate or opportunity was recommended

Skill Mitra uses deliberately simple, explainable formulas for the prototype.

## Skill score

Each assessed skill receives a score from 0 to 100.

### Prototype formula

```text
Skill Score = 40% Theory Score + 60% Code Score
```

The ratio is configurable in the full version.

### Assessment components

| Component | Purpose |
|---|---|
| Theory questions | Check conceptual understanding |
| Code-reading questions | Check ability to reason about code and identify output or bugs |
| Coding challenge | Check practical implementation ability |

## Verification hierarchy

Evidence has four verification levels.

| Level | Verification type | Example |
|---|---|---|
| 1 | Self-declared | Student lists a skill or project without external validation |
| 2 | Assessment-verified | Skill score generated through a Skill Mitra assessment |
| 3 | College-verified | Faculty member verifies a project, lab activity, or academic work |
| 4 | Industry-verified | Company verifies an industry challenge, internship, or work sample |

### Evidence principle

- The Skill Passport displays the strongest verified evidence available for a skill.
- Verified evidence is given full influence in matching.
- Self-declared evidence has half influence in matching.
- The platform displays the source of each score so users understand why it is credible.

## Candidate-to-role match score

A company defines a role using required skills.

For every skill \(i\):

- \(w_i\) = importance weight
- \(m_i\) = minimum skill level required
- \(L_i\) = student’s demonstrated skill level

### Skill importance weights

```text
Must-have skill = 2
Nice-to-have skill = 1
```

### Coverage per skill

\[
Coverage_i = min(L_i / m_i, 1)
\]

Coverage cannot exceed 1. A student who exceeds the required level receives full coverage for that skill, not an inflated score.

### Overall match score

\[
Match\ Percentage = \frac{\sum (w_i \times Coverage_i)}{\sum w_i} \times 100
\]

### Missing must-have rule

If any must-have skill is below its required minimum:

- Show a **Missing must-have** flag.
- Cap the final match score at **60%**.

This avoids presenting a candidate as highly matched when a critical requirement is missing.

## Requirement explanation

Each requirement is displayed as one of the following:

| Status | Condition |
|---|---|
| Met | Student level is equal to or above the required level |
| Partly met | Student has some demonstrated level but remains below the required level |
| Missing | Student has no relevant evidence or is substantially below the required level |

## Example: candidate match

### Role requirements

| Skill | Required level | Importance |
|---|---:|---|
| JavaScript | 70 | Must-have |
| Data Structures | 60 | Must-have |
| SQL | 50 | Nice-to-have |

### Student evidence

| Skill | Student level | Evidence source |
|---|---:|---|
| JavaScript | 80 | Industry-verified challenge |
| Data Structures | 45 | Assessment-verified |
| SQL | 55 | College-verified project |

### Calculation

```text
JavaScript coverage = min(80 / 70, 1) = 1.00
Data Structures coverage = min(45 / 60, 1) = 0.75
SQL coverage = min(55 / 50, 1) = 1.00

Weighted total = (2 × 1.00) + (2 × 0.75) + (1 × 1.00)
               = 2.00 + 1.50 + 1.00
               = 4.50

Maximum weighted score = 2 + 2 + 1 = 5

Match percentage = (4.50 / 5) × 100 = 90%
```

However, Data Structures is a must-have skill and is below the required level of 60.

```text
Final displayed match = 60%
Flag = Missing must-have: Data Structures
```

### Explanation shown to recruiter

- JavaScript: **Met** — 80/70, industry-verified
- Data Structures: **Partly met** — 45/60, assessment-verified
- SQL: **Met** — 55/50, college-verified
- Missing must-have: **Data Structures**
- Final match: **60%**, capped because a must-have skill is below the required level

## Career readiness score

Career readiness uses the same formula as candidate-to-role matching.

The difference is only the reference profile:

- Candidate matching compares a student to a company role requirement.
- Career readiness compares a student to a selected target-role profile.

### Example target roles

- Full-Stack Developer
- Backend Engineer
- Data Analyst
- Machine Learning Engineer
- Cloud Engineer

### Readiness output

The Career Path view shows:

- Overall readiness score
- Skills already meeting the role profile
- Skills partly meeting the role profile
- Missing skills
- Suggested next-best action
- Suggested projects, challenges, certifications, or internships
- Readiness progress over time

## Evidence update logic

The displayed skill score uses the strongest verified evidence.

```text
New assessment completed
        ↓
Assessment evidence added
        ↓
Skill Passport recomputes displayed skill score
        ↓
Career readiness recomputes
        ↓
Candidate search match recomputes where visibility allows
        ↓
Institution aggregates recompute
```

## Why this approach is suitable

This logic is intentionally simple because it is:

- Transparent to students and recruiters
- Easy to demonstrate in a hackathon prototype
- Easy to audit and improve
- Less opaque than black-box matching
- Compatible with future extensions such as richer evidence, role-specific rubrics, and fairness monitoring
