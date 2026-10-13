# EventFlow AWS handover

## Current application boundary

- Prisma is configured for PostgreSQL and source review found the checked-in `20261012_init` migration aligned with the current `User`, `Event`, and `Registration` schema by table, enum, index, and relation definitions. The migration lock provider is `postgresql`. An automated migrations-directory diff was not possible locally because Prisma requires a shadow database URL for that operation.
- `GET /api/events` and `GET /api/events/[id]` use Prisma and only return published events. The API reports configuration/server errors without returning database details.
- Login and student signup use bcrypt password hashes and an 8-hour signed HttpOnly `SameSite=Strict` cookie session. Session subject and role are looked up from PostgreSQL on each protected request. Unsafe auth and API requests require a same-origin `Origin` header. Public signup always creates `STUDENT`; provision organizer roles through a trusted admin process. Existing users without a password hash cannot use password login until securely enrolled/reset.
- `POST /api/events` and `PATCH /api/events/[id]` require organizer/admin session and enforce ownership (admin can manage all). Public event reads are available. The event editor is connected for create/update. Other dashboard and discovery panels still use sample/mock records.
- `POST /api/events/[id]/registrations` books for the authenticated student only. It locks the event row while checking capacity and relies on the existing unique `(userId,eventId)` constraint. Full events return `409`; the schema/UI has no waitlist storage. Users can list/cancel their own registrations. Organizers can list attendees and check attendees in.
- Poster upload signing verifies organizer ownership, accepts JPEG/PNG/WebP up to 5 MB, signs a five-minute private S3 PUT, and the event update verifies stored metadata and image magic bytes before linking the object. Poster retrieval uses a five-minute signed GET. The current UI still renders its illustration fallback rather than loading the signed poster URL. Bucket remains private; no AWS resources were changed. The browser upload requires suitable bucket CORS for the application origin and `PUT`.

## Deployment checklist

1. Confirm the existing bucket in `eu-north-1` via AWS console/CLI before deciding whether a bucket is needed. Keep Block Public Access enabled, Object Ownership set to bucket-owner-enforced, and encryption enabled. Configure CORS narrowly for the deployed app origin and `PUT` only if browser uploads are used.
2. Attach least-privilege permissions to the existing `EventFlow-EC2-SSM-Role`: `s3:PutObject` and `s3:GetObject` only for the chosen bucket's `events/*` prefix. No ACL or bucket-public permissions.
3. Store the database URL in SSM Parameter Store as a SecureString (for example `/eventflow/prod/database-url`). Grant the role only `ssm:GetParameter` for that exact ARN and `kms:Decrypt` only for the key used by that parameter. SSM retrieval/bootstrap is not implemented or verified; arrange for the deployment service to inject `DATABASE_URL` without logging it.
4. Set `DATABASE_URL`, `AWS_REGION=eu-north-1`, `S3_BUCKET_NAME`, and a random `SESSION_SECRET` (at least 32 characters) in the EC2 app process environment. Use the EC2 role for AWS credentials; do not add static credentials. `.env.example` contains placeholders only.
5. Verify the EC2 security group remains the source allowed by the RDS security group on TCP 5432. Keep RDS private; no NAT gateway or public rule is needed for EC2-to-RDS in the same VPC.
6. From EC2, inspect `prisma migrate status` and `_prisma_migrations` before deployment. Compare the recorded migration name and checksum with this exact checked-in `20261012_init` migration. Do not rename it or run reset/db-push. Apply future migrations only after an explicit deployment review.
7. Organizer roles must be assigned by a trusted process; public signup cannot select one. Add production rate limiting and account recovery/email verification before broad public use. Then deploy through the existing deployment path and smoke-test signup/login/logout, role checks, event create/update, duplicate/full registration, cancellation, attendee check-in, signed upload/view, and app health.

## Verification status

AWS CLI read-only bucket inspection was attempted but failed because the configured token was invalid. Bucket existence, IAM policies, Parameter Store contents, security-group rules, EC2 connectivity, and deployed migration history are unverified. Local Windows access to the private RDS endpoint is not expected. No schema migration is required by this application work; the existing schema already has `passwordHash`, roles, and the registration uniqueness constraint.
