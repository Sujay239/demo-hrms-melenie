# HRMS Phase 1 Documentation Index

## Purpose
Provide the canonical navigation and reading order for the HRMS documentation repository, identifying which documents are mandatory before coding and which are module-specific references.

## Start Here
A coding agent must read in this order:

1. `../README.md`
2. `../agent.md`
3. `00-project-overview.md`
4. `01-prd.md`
5. `02-srs.md`
6. `03-scope.md`
7. `04-user-personas.md`
8. `05-user-roles.md`
9. `06-user-stories.md`
10. `07-user-flows.md`
11. `08-acceptance-criteria.md`
12. Architecture
13. Database
14. Security
15. API
16. Relevant module documentation
17. Designs
18. Testing
19. DevOps
20. ADRs
21. `requirements-traceability.md`
22. `documentation-consistency-report.md`

The agent must then reread the specific module/API/database/security/test files affected by the task before coding.

## Mandatory Before Any Feature Coding
- `../agent.md`
- `01-prd.md`
- `02-srs.md`
- `03-scope.md`
- `architecture/system-architecture.md`
- `architecture/backend-architecture.md`
- `architecture/multi-tenancy.md`
- `architecture/authorization-architecture.md`
- `architecture/api-versioning.md`
- `architecture/database-architecture.md` plus the detailed `database/*` specifications
- `security/security.md`
- `security/permissions-catalog.md`
- `api/api-standards.md`
- `testing/testing-strategy.md`
- relevant ADRs

## Core Product Documents
| Document | Use |
|---|---|
| `00-project-overview.md` | Product/system orientation and boundaries |
| `01-prd.md` | Product vision, business objectives, journeys, scope, risks |
| `02-srs.md` | Authoritative uniquely identified functional/non-functional requirements |
| `03-scope.md` | Phase 1 vs future boundary |
| `04-user-personas.md` | User goals/context |
| `05-user-roles.md` | Canonical role capabilities and restrictions |
| `06-user-stories.md` | Story-level behavior and acceptance criteria |
| `07-user-flows.md` | End-to-end workflows/diagrams |
| `08-acceptance-criteria.md` | Cross-module acceptance gates |
| `09-development-phases.md` | Recommended implementation sub-phases |
| `10-definition-of-done.md` | Completion gate |
| `11-future-roadmap.md` | Explicit future scope only |
| `requirements-traceability.md` | SRS → module/API/data/security/test mapping |

## Architecture References
- `architecture/system-architecture.md` — top-level component/system shape
- `architecture/backend-architecture.md` — mandatory Route → Controller → Service → Repository → Database
- `architecture/frontend-architecture.md` — application/client structure
- `architecture/database-architecture.md` — persistence principles
- `architecture/multi-tenancy.md` — tenant context/isolation/consultants/IDOR
- `architecture/authorization-architecture.md` — RBAC/resource policy
- `architecture/api-versioning.md` — `/api/v1/` compatibility
- `architecture/performance-architecture.md` — performance/concurrency
- `architecture/storage-architecture.md` — private document storage
- `architecture/audit-architecture.md` — audit event model
- `architecture/eu-readiness.md` — future EU/privacy readiness, no compliance claim

## Database References
Read all `database/*` for schema/entity/relationship/index/constraint/migration decisions. `database/database-schema.md` is logical design, not migration code.

## API References
### Cross-Cutting
- `api/api-standards.md`
- `api/authentication-api.md`
- `api/authorization-api.md`
- `api/error-handling.md`
- `api/pagination-filtering.md`

### v1 Modules
`api/v1/*` is the contract catalog for auth, tenants, users, employees, onboarding, offer letters, documents, regions, departments, designations, leave, holidays, attendance, dashboards, KB, announcements, tickets, meeting rooms and audit logs.

Every Phase 1 application endpoint uses `/api/v1/`.

## Module References
Use `modules/*` as domain behavior specifications. Each module maps requirements, data, workflow, rules, API, security and tests.

## Security References
Mandatory for security-sensitive work:
- `security/security.md`
- `security/threat-model.md`
- `security/authentication-security.md`
- `security/authorization-security.md`
- `security/tenant-isolation.md`
- `security/file-security.md`
- `security/sensitive-data.md`
- `security/security-testing.md`
- `security/permissions-catalog.md`

## Performance References
- `performance/performance.md`
- `performance/promise-all-settled.md`
- `performance/database-performance.md`
- `performance/api-performance.md`
- `performance/frontend-performance.md`

`Promise.allSettled()` is a selective strategy for independent operations with intentional partial-failure handling, not a universal pattern.

## Design References
Read `design/designs.md` first, then the relevant portal/layout file. Phase 1 has tenant logo on white background and no custom theme builder or dashboard layout editor.

## Testing References
- `testing/testing-strategy.md`
- `testing/test-cases.md`
- `testing/integration-tests.md`
- `testing/e2e-tests.md`

## DevOps References
Read `devops/*` for development setup, environment/secrets, container expectations, deployment, CI/CD, monitoring and recovery.

## ADRs
- `decisions/adr-001-architecture.md`
- `decisions/adr-002-multi-tenancy.md`
- `decisions/adr-003-api-versioning.md`
- `decisions/adr-004-backend-layering.md`
- `decisions/adr-005-document-storage.md`
- `decisions/adr-006-performance-strategy.md`
- `decisions/adr-007-authentication.md`

`ADR-007` is intentionally **Proposed** and must become an Accepted concrete credential strategy before authentication implementation begins.

## Reference Catalogs
- `reference/glossary.md`
- `reference/status-enums.md`

## Future-Scope References
Future work belongs primarily in `11-future-roadmap.md` and the `Future`/`Future Extensibility` sections of relevant documents. Future Phase includes configurable / drag-and-drop dashboard widgets, advanced tenant themes, GDPR implementation, payroll, advanced reports, SSO and integrations.

## Official Consistency Report
See `documentation-consistency-report.md` for the generated repository audit and any documented open decisions.
