# Backend map

One Convex backend serves the public website and the staff portal. Push changes with `pnpm backend:push` (or keep `npm start` running, which watches and pushes). Generated types live in `_generated/`; never edit them.

## Files

| File | Functions | Notes |
| --- | --- | --- |
| `schema.ts` | — | Tables: `staff`, `invitations`, `pages`, `applications`, `contactMessages`, `activity`, `counts`, `media`, plus Convex Auth tables. |
| `validators.ts` | — | Shared validators. `documentKey` comes from `pageIds` in `apps/web/src/data/copy.ts`. |
| `lib/access.ts` | helpers | `staffQuery` / `staffMutation` (require an active signed-in staff member), `requirePermission`, `log` (activity feed), input checks `text` / `email`, `hash`. |
| `content.ts` | `published` (public), `workspace`, `save` | Each page is one `pages` row holding its fields as JSON (`published`). `save` validates and writes straight to the live site; `revision` stops two people overwriting each other. |
| `askSofora.ts` | `answer` (public) | English chat over published website content. Uses the current page and recent turns, with links selected from Sofora's own sources. |
| `applications.ts` | `submit` (public), `add`, `list`, `detail`, `totals`, `recentActivity`, `save`, `update` | `submit` is the public form: consent, spam trap, rate limits (200/hour overall, 5/hour per email). `update` handles assign, note, review, request information, recommend, decide. |
| `contact.ts` | `submit` (public), `list`, `detail`, `totals`, `markRead` | Website contact form submissions. Same rate limits as applications. Staff with application access read messages in the portal Contact inbox. |
| `email.ts` | `settings`, `saveSettings`, `sendTest`, `recent` (admins); helpers `applicationSubmitted`, `applicationStatusChanged`, `contactSubmitted` | Emails through the Resend component (`convex.config.ts`): confirmations to applicants/senders, status emails (needs information, approved, rejected) and team alerts. Settings (team addresses per type, on/off, wording) are one JSON row in `settings`, shape and defaults in `apps/portal/src/data/email.ts`. `emailLog` lists queued emails; delivery status comes from the component via the `/resend-webhook` route in `http.ts`. The header logo is served from `/email/logo.png` (`http.ts`, bytes in `lib/emailLogo.ts`) on the deployment's `CONVEX_SITE_URL`. Env: `RESEND_API_KEY` (without it nothing is sent and forms still work), `RESEND_WEBHOOK_SECRET`, `EMAIL_FROM`, `EMAIL_LIVE=true` on production only (elsewhere every email goes to `EMAIL_TEST_TO`, default `delivered@resend.dev`). |
| `lib/submissions.ts` | `guardSubmission`, `rememberSubmission`, shared `limiter` | Protection for the public forms (`applications.submit`, `contact.submit`), on top of the honeypot field and `requestId` idempotency: forms sent under 3 s after opening are refused (`elapsedMs` arg), rate limits (200/hour overall, 5/hour and 10/day per email) with readable messages, and the same details sent again are refused with the earlier reference (7 days for applications, 1 day for messages; hashes in `submissionFingerprints`). |
| `staff.ts` | `me` (public), `list`, `save`, `profile`, `invite` | Staff records are separate from auth `users`; `invite` creates a single-use activation link. |
| `media.ts` | `uploadUrl`, `register`, `url`, `urls` | Photo uploads (PNG/JPEG/WebP, 2 MB) into Convex storage, referenced in content as `storage:<id>`. |
| `auth.ts`, `auth.config.ts`, `http.ts` | — | Convex Auth with passwords. Accounts can only be created from an invitation (or the dev login below). |
| `setup.ts` | `initialize`, `resetPages`, `addMissingPages`, `ensureContactCounts` (internal) | `initialize` creates the first admin and seeds pages once. `resetPages` replaces all pages with the defaults. `addMissingPages` adds default rows only for pages that have none. `ensureContactCounts` adds the contact counter row on older deployments. |
| `devLogins.ts` | `seed` (internal) | Creates/resets the `admin` / `admin` login. Only runs where `DEV_LOGINS=true`. Called by `npm start`. |

Internal functions run from the CLI, for example `pnpm exec convex run setup:resetPages`.

## Ask Sofora configuration

Set these variables on the Convex deployment that serves the website:

- `ASK_SOFORA_MODEL_URL`: Full HTTPS URL of a Chat Completions compatible endpoint. It must support JSON object mode and `max_completion_tokens`.
- `ASK_SOFORA_MODEL_KEY`: Bearer credential for that endpoint. Keep it on Convex.
- `ASK_SOFORA_MODEL`: Model ID available at that endpoint.
- `ASK_SOFORA_WHATSAPP`: Optional official WhatsApp number in international format, for example `+220…`. Set it only after Sofora confirms the number.

The chat sends recent turns and excerpts from published content to the configured model. It does not persist conversations or read staff data. Requests are limited to 120 per hour across the deployment with a burst capacity of 15. If the model is unconfigured, fails, or reaches the limit, the chat offers website search and contact links.

## Conventions

- Permissions are defined once in `apps/portal/src/data/types.ts` (`can()`) and checked here with `requirePermission`; the portal uses the same function to hide controls.
- Content validation is shared too: `contentError` and `applyDocument` in `apps/portal/src/data/content.ts`, plus the structural checks in `content.ts`.
- Use indexes (`withIndex`) and bounded `.take(n)` reads. `take` silently truncates, so keep limits above the real row counts.
- Changing the schema when rows already exist: see "Recipes" in the root `AGENTS.md`.
