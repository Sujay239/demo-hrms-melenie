# Threat Model

## Purpose
Identify high-value assets, attacker goals and required mitigations.

## Assets
Credentials/tokens, tenant HR data, PII, medical/sensitive documents, offer letters, leave/attendance, permissions, consultant assignments, reservations and audit evidence.

## Major threats
| Threat | Example | Controls |
|---|---|---|
| Cross-tenant IDOR | Tenant B requests Tenant A employee | trusted tenant context + scoped repository + tests |
| Consultant escape | changes tenant selector | active assignment every context |
| Privilege escalation | Tenant Admin grants platform permission | non-delegable permissions + audit |
| Credential stuffing | repeated login | rate limit + monitoring |
| Token theft | stolen session/refresh | secure storage/transport/lifetime/revocation |
| Stored XSS | malicious KB/notice | sanitization + CSP |
| Malicious upload | polyglot/executable | validation + scanning + private serving |
| Storage bypass | guessed object URL | private bucket + authorized short-lived delivery |
| Duplicate approval | repeated leave approve | transactional state + unique ledger reference |
| Room race | simultaneous booking | DB/transaction overlap protection |
| Sensitive logs | medical content in logs | allowlisted/redacted structured logging |
