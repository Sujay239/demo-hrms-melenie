# API v1 — Employees

## Purpose
Define employee directory, profile, hierarchy, create/update, and employment-status contracts.

## Authentication
All endpoints in this document require authentication unless an endpoint explicitly states otherwise. Authentication follows `../authentication-api.md`.

## Tenant Requirements
Employees are tenant-owned. Consultant access additionally requires assignment to the tenant and explicit employee-information permission. Employee self-view is limited by field-level policy.

Client-provided tenant identifiers are never sufficient authorization. The service validates tenant access before repository operations.

## Authorization
Permissions shown below are canonical Phase 1 permissions from `../../security/permissions-catalog.md`. Resource policies (self, manager, assignment, sensitivity, audience) apply in addition to named permissions.

## Endpoint Contracts
| Method | Endpoint | Purpose | Authorization | Path / Query / Request Body | Success |
|---|---|---|---|---|---|
| `GET` | `/api/v1/employees` | List directory employees. | `employee.view`. | Query: page, pageSize, search, status, departmentId, designationId, regionId, managerId, sort/order. | 200 paginated. |
| `POST` | `/api/v1/employees` | Create employee. | `employee.create`. | Body: employeeId, name, work email, contact fields, department/designation/region IDs, managerId, joiningDate, employmentStatus, profileImageDocumentId where permitted. | 201. |
| `GET` | `/api/v1/employees/{employeeId}` | Read profile. | `employee.view` or `employee.view_self` for own record. | Path: employeeId. | 200. |
| `PATCH` | `/api/v1/employees/{employeeId}` | Update employee. | `employee.update`; self-editable subset may use `employee.update_self`. | Body: allow-listed editable fields. | 200. |
| `DELETE` | `/api/v1/employees/{employeeId}` | Soft-delete/archive employee when policy permits. | `employee.delete`. | Path: employeeId; reason may be required. | 204. |
| `GET` | `/api/v1/employees/{employeeId}/reports` | List direct reports. | `employee.view`. | Pagination and status filter. | 200 paginated. |
| `GET` | `/api/v1/employees/{employeeId}/reporting-chain` | Read manager ancestry. | `employee.view`. | Path: employeeId; bounded depth. | 200. |

## Path Parameters
Opaque resource IDs are used where paths contain `{id}`-style values. IDs must be syntactically valid and the resource must be available inside the trusted access scope. An ID from another tenant must not bypass scope.

## Query Parameters
Collection endpoints use only documented, allow-listed query parameters. Growing collections support `page` and `pageSize` as defined in `../pagination-filtering.md`.

## Request Body
Mutation bodies are JSON unless the document endpoint defines a file-upload workflow. Fields not relevant to the operation must not be mass-assigned. Server-controlled fields such as tenant ownership, audit actor, and computed status are derived server-side.

## Validation
Employee identifier uniqueness is per tenant. Referenced department, designation, region, manager, and profile document must belong to the same tenant. Joining date is a valid date. Manager assignment cannot create self-reference or a hierarchy cycle.

Validation failure uses the standard `400`/`422` error envelope. Business-state conflicts generally use `409`.

## Business Rules
Employee and New Hire are distinct lifecycle entities. Conversion from New Hire occurs through onboarding, not by mutating a type flag. Deleting/deactivating an employee must preserve audit/history and must not physically erase protected records.

## Pagination
All potentially growing list endpoints are paginated. Small controlled reference lists may return a bounded collection if the implementation documents and enforces a safe maximum.

## Filtering
Allow-list status, departmentId, designationId, regionId, managerId, and bounded directory search.

## Sorting
Allow-list name, employee identifier, joining date, and other indexed fields.

## Success Response
Responses follow `../api-standards.md`; sensitive fields are omitted unless authorized.

## Error Responses
Relevant errors include:
- `401` unauthenticated or expired credential;
- `403` permission/scope denial;
- `404` resource unavailable in the effective access scope;
- `409` state/uniqueness/concurrency conflict where applicable;
- `422` semantic validation failure;
- `429` rate-limit breach on sensitive endpoints;
- `500` unexpected server error;
- module-specific errors documented through stable machine codes.

Errors never disclose cross-tenant existence, SQL/storage internals, secrets, or stack traces.

## Example Request
```json
{"employeeId":"EMP-1001","name":"Asha Rao","email":"asha@example.com","departmentId":"dept-id","designationId":"desig-id","regionId":"region-id","managerId":"mgr-id","joiningDate":"2026-09-01","employmentStatus":"ACTIVE"}
```

## Example Response
```json
{"data":{"id":"employee-id","employeeId":"EMP-1001","name":"Asha Rao","employmentStatus":"ACTIVE"},"meta":{"requestId":"request-id"}}
```

## Security and Audit
State-changing actions and sensitive reads follow `../../security/security.md`. Where the module is auditable, the actor, tenant, action, resource, resource ID, request ID, timestamp, and appropriate state change are recorded.



## Related Documents
- `../api-standards.md`
- `../error-handling.md`
- `../pagination-filtering.md`
- `../../architecture/multi-tenancy.md`
- `../../security/permissions-catalog.md`
