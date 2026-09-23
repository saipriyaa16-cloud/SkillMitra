# Skill Mitra Security, Privacy, and Ethics

## Principle

Skill Mitra handles student skill records, evidence, applications, and placement-related information. The platform must protect user privacy while still enabling trusted collaboration between students, industry, faculty, and institutions.

The prototype uses fictional demo data only. The full version requires legal, security, and institutional review before production deployment.

## Privacy by design

### Student control

Students control which parts of their Skill Passport are visible to companies.

Possible visibility settings include:

- Private: visible only to the student
- Faculty/mentor view: visible to authorised mentors or faculty
- Shared with companies: visible to recruiters for matching and applications
- Public share link: student chooses selected sections to share externally

### Minimum necessary access

- Recruiters should see only the passport details a student has chosen to share.
- Faculty should see students assigned to them or students requesting verification.
- Institution administrators should primarily see aggregated cohort-level analytics.
- Individual student records should require an authorised purpose and appropriate access controls.

## Role-based access

| Action | Student | Industry | Academician | Institution |
|---|---|---|---|---|
| View own passport | Yes | No | Authorised mentees only | Aggregated view only |
| Change passport visibility | Yes | No | No | No |
| Search candidates | No | Yes, only shared profiles | No | No |
| Verify college evidence | No | No | Yes | No |
| Verify industry challenge | No | Authorised company reviewer | No | No |
| View institution analytics | Own data only | Own posting data only | Mentee or department view where authorised | Full authorised analytics view |

## Prototype safeguards

The prototype:

- Uses fictional, sample data
- Displays a visible “Demo data” label
- Does not claim production authentication
- Does not collect real passwords, payment data, or sensitive documents
- Uses simulated verification and opportunity workflows
- Clearly labels Python and Java secure grading as full-version work

## Full-version safeguards

The production version should include:

- Secure authentication and password handling
- Verified company and institution accounts
- Email verification and institutional single sign-on where available
- Backend-enforced role-based access control
- Consent records for data sharing
- Audit logs for passport views, evidence verification, and status changes
- Encryption in transit using HTTPS
- Encryption at rest for sensitive data where appropriate
- Secure file handling for certificates, resumes, and submissions
- Rate limiting, input validation, and security monitoring
- Incident response and data-retention policies
- Regular vulnerability testing
- Legal review for compliance with applicable Indian privacy and data-protection obligations, including the Digital Personal Data Protection Act, 2023

## Assessment integrity

### Prototype approach

- Small controlled demo question set
- Clear explanation step for submitted challenge work
- Faculty or industry manual verification in demonstration workflows
- No claim of fully secure proctoring

### Full-version approach

- Sandboxed code execution
- Hidden test cases
- Plagiarism and similarity detection
- Question randomisation where suitable
- Time and attempt controls
- Identity and proctoring safeguards where legally and institutionally appropriate
- Manual review for suspicious attempts

## Ethical industry challenges

Industry Challenges must not be used as unpaid production labour.

Challenge safeguards include:

- Challenges should be scoped learning or evaluation tasks.
- Companies should publish expected deliverables, evaluation criteria, timeline, and reward.
- The platform should prohibit requests for live production work without fair compensation and proper agreements.
- Students should retain visibility into how their submission will be used.
- Full version should include company approval, moderation, reporting, and dispute-resolution workflows.

## Fair and explainable matching

Skill Mitra should not use opaque ranking.

Every match must show:

- Required skills
- Student skill levels
- Evidence sources
- Must-have and nice-to-have priority
- Met, partly met, and missing requirements
- Match-score calculation logic
- Missing must-have flags

Future versions should monitor for potential bias across institutions, departments, and other relevant cohorts, while ensuring fairness review does not expose sensitive personal data unnecessarily.

## Accessibility

The platform should support:

- Readable contrast
- Keyboard navigation
- Clear focus indicators
- Screen-reader labels
- Mobile-responsive layouts
- Plain-language explanations
- Low-bandwidth consideration
- Regional-language support in future versions
