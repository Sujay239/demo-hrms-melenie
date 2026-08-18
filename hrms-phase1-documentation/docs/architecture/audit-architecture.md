# Audit Architecture

## Purpose
Define append-oriented business/security audit events.

## Core fields
- id
- occurred_at
- actor_user_id or system actor
- tenant_id when applicable
- action
- resource_type
- resource_id
- request_id
- outcome

Contextual fields: IP, safe user-agent summary, reason, before/after or diff when appropriate.

## Mandatory event categories
Tenant lifecycle; consultant assignments; role/permission changes; employee lifecycle; onboarding verification/conversion; document upload/version/delete and sensitive access; leave/attendance/overtime approvals; important account/security events.

## Sensitive data
Do not copy passwords, tokens, file content, full medical records or unnecessary personal text into audit payloads.

## Integrity
Ordinary application users cannot edit/delete audit events. Corrections are append-only administrative events, not historical mutation.
