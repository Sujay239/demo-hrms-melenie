# End-to-End Test Journeys

## Purpose
Define browser/client-level critical paths required before Phase 1 release.

## E2E-01 Super Admin Creates Tenant
1. Log in as Super Admin.
2. Create Tenant A.
3. Configure basic tenant identity/logo.
4. Activate tenant.
5. Verify tenant appears in platform list.
6. Verify audit event.

## E2E-02 Consultant Isolation
1. Assign Consultant C to Tenant A only.
2. Log in as C.
3. Open Tenant A permitted information.
4. Attempt UI URL/API route for Tenant B.
5. Verify access denied and Tenant B never appears in selector/search.

## E2E-03 Tenant Admin Builds Organization
1. Login to Tenant A.
2. Create region.
3. Create department/designation.
4. Create manager employee.
5. Create employee reporting to manager.
6. Open employee directory/profile.
7. Attempt manager cycle and verify validation.

## E2E-04 New Hire Onboarding
1. HR creates/initiates New Hire case and offer association.
2. New Hire activates/logs in.
3. Confirm onboarding-only shell.
4. Enter employee details and fun fact.
5. Review/download offer.
6. Upload required documents.
7. Complete acknowledgement Name/Place/Date.
8. Download required document.
9. Sign externally (test uses fixture file; no in-app signature).
10. Upload signed copy.
11. HR verifies.
12. HR converts to Employee.
13. Verify no duplicate conversion and employee access/lifecycle.

## E2E-05 Secure Documents
1. Upload normal employee document.
2. Employee with permission downloads.
3. Another employee without resource access attempts direct URL/ID access.
4. Verify denial.
5. Upload sensitive-category fixture.
6. Verify ordinary document permission alone is insufficient if sensitive entitlement is required.
7. Verify audit.

## E2E-06 Leave
1. Admin configures leave type/policy.
2. Employee sees balance.
3. Employee applies.
4. Manager reviews and approves.
5. Balance changes once.
6. Duplicate approval does not double-change balance.

## E2E-07 Attendance and Overtime
1. Employee clocks in.
2. Attempt duplicate clock-in and see safe error.
3. Clock out.
4. Request correction.
5. Manager approves.
6. Request overtime.
7. Manager approves/rejects as test case specifies.

## E2E-08 Announcements and KB
1. Admin publishes tenant-wide article/announcement.
2. Admin publishes department-scoped item.
3. Correct employee sees both where eligible.
4. Other department does not see restricted item.
5. Read state persists for announcement.

## E2E-09 Ticket
1. Employee creates department ticket with attachment.
2. Agent sees queue item.
3. Assign and transition `OPEN` → `IN_PROGRESS` → `RESOLVED` → `CLOSED`.
4. Comment/activity remains visible by policy.
5. Unauthorized department user is denied.

## E2E-10 Meeting Room
1. Admin creates building/floor/room.
2. Employee checks availability.
3. Reserves free interval.
4. Second user attempts overlap and receives conflict.
5. First user sees upcoming reservation and cancels.
6. Slot becomes bookable according to cancellation status policy.

## E2E-11 Dashboard
1. Log in as each role.
2. Verify predefined role-appropriate dashboard.
3. Verify tenant aggregates never include Tenant B fixtures.
4. Inject optional metric failure in controlled environment and verify partial section error.
5. Verify no Phase 1 dashboard layout customization control.

## E2E Quality
Run critical E2Es against a production-like deployed test environment in CI/CD where feasible, with deterministic fixtures and no production secrets.
