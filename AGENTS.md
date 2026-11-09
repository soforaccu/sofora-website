# Sofora website: guide for agents

Read this first. It is kept current; `README.md` has the full human-facing detail. If you change how something works, update this file in the same change.

## What this is

- `apps/web` (`@sofora/web`, port 5173): public website for Sofora Cooperative Credit Union. A faithful copy of the old WordPress site at soforaccu.com (same menu, wording, photos, old URLs such as `/about-us/`), rebuilt in React. Services were reorganised into one `/services/` hub with a page per product (`/services/car-loan/`); `/loan-services/` and `/saving/` redirect into it.
- `apps/portal` (`@sofora/portal`, port 5174): staff portal. Edit website content (save = live, no drafts), work membership/loan applications, manage staff.
- `convex/`: one Convex backend for both apps. Dev deployment `jovial-ptarmigan-163` (see root `.env.local`). See `convex/README.md` for the backend map.

## Run and check

- `npm start` / `npm stop`: Convex + both apps in the background; logs in `.dev/logs/`. Opens the browser.
- Portal login (dev only): `admin` / `admin` (also on the Vercel test portal while it uses the dev backend; the field accepts usernames whenever `devLogins:enabled` is true). Created by `convex/devLogins.ts`, only where the Convex env var `DEV_LOGINS=true` (set on the dev deployment, never production).
- `pnpm typecheck`, `pnpm build`: both must pass. There are no automated tests. `pnpm typecheck` stops at the first failing app; `pnpm exec turbo run typecheck --continue` shows every error. The portal type-checks the web files it imports, so a web error shows up in both.
- `pnpm screenshot <path> [out.png] [width]`: screenshot a page (needs `npm start`). Use it instead of writing your own Playwright script; run it after every visual change. Flags (see the top of `scripts/screenshot.mjs`):
  - default: public page through the portal's `/preview` route with the **default** content from `copy.ts`/`content.ts`, not what's stored in Convex.
  - `--live`: the real site at :5173 with stored content.
  - `--portal`: a portal page, signed in as admin.
  - `--loading`: the loading skeleton.
  - `--widths=1440,390`: several widths in one run. It warns about horizontal overflow.
  - `--viewport` / `--selector=.css`: only the first screen, or only one element.
- **Other sessions often edit this repo at the same time** (the owner runs several in parallel). Run `git status` / `git diff <file>` before editing a file you read earlier, re-read it right before editing, and don't "fix" type errors in files you didn't touch; they're usually someone's edit in progress. Mention them instead.

## Where to change things

| To change | Edit |
| --- | --- |
| Any website text or image (defaults) | `apps/web/src/data/copy.ts`: one row per field `[page, section, label, key, default, kind]`. The portal editor is generated from these rows. |
| Loans, savings products (and their pages' text), FAQs, board, staff, partners, contact details, portal image picker | `apps/web/src/data/content.ts` (`servicePath`/`applyPath` give a product's page and Apply link) |
| Page layout | `apps/web/src/pages/*` (routes in `apps/web/src/App.tsx`) |
| Header, menu, footer | `apps/web/src/components/Layout.tsx` |
| Services hub and product pages | `apps/web/src/pages/Services.tsx` |
| Shared blocks (slider, page header, photo hero `HeroBanner`, closing `CtaBanner`, product cards, people grid, FAQ) | `apps/web/src/components/ui.tsx` |
| Colours, fonts, all public styling | `apps/web/src/styles.css` (tokens at the top) |
| Site search | `apps/web/src/data/search.ts` (client-side over live content; results at `/?s=`) |
| Ask Sofora (public English chat) | `apps/web/src/components/AskSofora.tsx` → `convex/askSofora.ts`. Uses published website content and links to forms, directions, and staff. Model and WhatsApp configuration are in `convex/README.md`. |
| Editable page list in the portal, per-page validation | `apps/portal/src/data/content.ts` (`documents`, `applyDocument`, `contentError`) |
| Portal editor UI for lists and photos | `apps/portal/src/components/ContentFields.tsx` |
| Roles and permissions (shared by portal and backend) | `apps/portal/src/data/types.ts` (`can()`) |
| Staff password changes | My profile (`apps/portal/src/pages/Profile.tsx`) calls `auth.changePassword` in `convex/auth.ts`. It verifies the current password and invalidates other sessions. |
| Content storage and server validation | `convex/content.ts` |
| Loading skeletons (shown while Convex data loads) | Website: `apps/web/src/components/Skeleton.tsx` (`SiteSkeleton`, used by `LiveWebsite` and the portal preview). Portal: `apps/portal/src/components/Skeleton.tsx` (`ShellSkeleton` for the session/workspace load, `PageSkeleton` picks one per route; add a case when you add a portal page). Styles are under "Loading skeleton" at the end of each app's `styles.css`. |
| Portal confirmations ("Saved.") and errors | `useFeedback()` in `apps/portal/src/components/ui.tsx`: `run(action, "Success message.")` shows the success as a toast (`components/Toast.tsx`, mounted in `main.tsx`) and errors inline where `{message}` is rendered. Use it for any new save/edit action. |
| Emails (confirmations, status updates, team alerts) and the portal Settings page | `convex/email.ts` (sending, templates, settings API), `apps/portal/src/data/email.ts` (template list, default wording), `apps/portal/src/pages/Settings.tsx`. Sending is skipped without `RESEND_API_KEY`; real recipients only when `EMAIL_LIVE=true` (see `convex/README.md`). |
| Error messages shown to people (both apps) | `apps/web/src/data/errors.ts` (`readableError`): shows our own `ConvexError("…")` text as is and maps sign-in codes, rate limits and network failures to plain sentences; never shows raw errors. Throw `ConvexError` with a readable sentence from server code; add a pattern there for any new library error. |
| Icons (both apps) | `apps/web/src/components/Icon.tsx`: `Icon` (names are the keys of `paths`), `ServiceIcon` (one per product), `SocialIcon`. The portal re-exports `Icon` from `components/ui.tsx`. |
| Images and fonts (both apps) | `apps/web/public/` (the portal's `publicDir` points there, so `/images/...` works in both). `public/logo.png` at the repo root is the owner's source logo, not served. Photo credits go in `docs/content-sources.md`. |
| Public application forms (incl. ID/photo uploads) | `apps/web/src/pages/Apply.tsx`, `apps/web/src/components/ApplicationUpload.tsx` → `convex/applications.ts` (Convex file storage) |
| Form "sent" animation, form errors, bot timer (every public form) | `apps/web/src/components/SubmitSuccess.tsx` (`SubmitSuccess`, `FormError`, `useFormTimer`); spam/duplicate/rate-limit rules in `convex/lib/submissions.ts`. A new public form should use all three and call `guardSubmission`. |

## Public pages

Every inner page follows one pattern the owner asked for: photo `HeroBanner` at the top, content, then `CtaBanner` before the footer. New pages should do the same. The old grey `PageHeader` remains only on search results, blog posts and the 404 page.

| Route | Component | `copy.ts` page id |
| --- | --- | --- |
| `/` (`/?s=` = search) | `pages/Home.tsx` (`pages/Search.tsx`) | `home` |
| `/about-us/`, `/history/`, `/faq/` | `pages/About.tsx` | `about`, `history`, `faq` |
| `/board-of-directors/`, `/staff/`, `/loan-team/` | `pages/About.tsx` (`Board`, `Staff`) | `board`, `staff` |
| `/board-of-directors/<slug>/`, `/staff/<slug>/` (one per person) | `pages/Person.tsx` (`PersonProfile`) | `board`, `staff` ("Profile pages" rows; the people themselves are in `content.ts`) |
| `/services/`, `/services/<product>/` | `pages/Services.tsx` (`ServicesHub`, `ServiceDetail`) | `loans`, `saving` (product text is in `content.ts`) |
| `/downloads/` | `pages/Services.tsx` (`Downloads`) | `downloads` |
| `/registration-form/` and the other three forms | `pages/Apply.tsx` | `shared.forms-*`, plus a few `downloads.*` |
| `/photo-gallery/`, `/youtube-gallery/` (tabs of one Gallery page) | `pages/Gallery.tsx` | `photos`, `videos`, plus `shared.gallery-*` |
| `/contact-us/` | `pages/Contact.tsx` | `contact` |
| `/partners/` | `pages/Partners.tsx` | `partners` |
| `/blog/`, `/<post-slug>/` | `pages/Blog.tsx` | `blog` |
| header, menu, footer, help banner | `components/Layout.tsx`, `components/ui.tsx` | `shared` |

To find a page's fields: `grep -n '"<page id>\.' apps/web/src/data/copy.ts`.

## Finding things fast

- **CSS:** both `styles.css` files have a section comment per area. `grep -n "^/\* " apps/web/src/styles.css` gives a table of contents with line numbers. In the website CSS, most mobile rules are **not** next to the component: they're in the shared `/* Responsive */` media blocks at the end, so check both places. Tokens (colours, fonts) are at the top of each file.
- **Field kinds** (last column of a `copy.ts` row): `text` (default), `image` (`/images/<name>` or an uploaded `storage:` id), `url` (http/https). Empty URLs are allowed only for keys listed in `optionalUrl` in `copy.ts`. Validation is `contentError` in `apps/portal/src/data/content.ts`.
- **Forms in the preview:** the portal preview (and `pnpm screenshot` by default) renders public pages with `preview` set. Pages that submit to Convex (`Apply`, `Contact`) take a `preview` prop and refuse to submit with it. Do the same for any new form.

## Recipes

- **Add a text/image field:** add a row to `copy.ts`, use `c["page.key"]` in the page. Nothing else; stored pages fall back to defaults for new keys.
- **Add a website page:** add its id to `pageIds` in `copy.ts`, rows for its fields, a route in `App.tsx`, an entry in `documents` (portal `data/content.ts`), and a path in `search.ts`. Then run `pnpm exec convex run setup:addMissingPages`, because the database has no row for the new page (it leaves existing pages alone).
- **Add a field to every loan/savings product:** add it to `Product` and each product in `content.ts`, and to `productFields` (portal `data/content.ts`), which drives the editor and both validations. Stored products get the default for new fields (`withProductDefaults` in `convex/content.ts`), so no reset is needed.
- **Remove or rename a text/image field:** delete or edit its `copy.ts` row and its uses. Stored values for keys that no longer exist are ignored when the site loads and dropped on that page's next save, so no migration is needed. A renamed key starts from its new default. Moving a row to another page id also resets it to the default.
- **Change a default label that is already stored:** saved pages keep their old value. Give the row a new key so the new default shows (as done for `shared.nav-forms-downloads` and `shared.topbar-welcome`).
- **Reset dev content to defaults** (wipes content edits): `pnpm exec convex run setup:resetPages`.
- **Change the Convex schema when data already exists:** a push fails if existing documents don't match. Loosen the field (optional / `v.string()`), push with `pnpm exec convex dev --once --typecheck disable` if types break, migrate the data with an internal mutation, then tighten and push again. Never use `--typecheck disable` for the final push. After adding application attachments, run `pnpm exec convex run setup:backfillApplicationAttachments` once on deployments that already had applications.
- **Board and staff people** (`Person` in `content.ts`: slug, name, role, photo, quote, bio, since, focus, email) are lists on the `board`/`staff` pages, edited in the portal like partners. New people get a slug from their name (`slugify`/`uniqueSlug`); people already on the live site keep theirs when renamed. Older saves stored `[name, role, photo]` rows; `toPeople` (used by `merge` in `convex/content.ts`) converts them on read, so no migration is needed. To add a field, add it to `Person`, `emptyPerson`, the defaults, `personLimits` in `convex/content.ts` and the editor in `ContentFields.tsx`.
- **Images:** put files in `apps/web/public/images/` with flat names (validation only accepts `/images/<name>`), compress large JPEGs, and add them to `imageLibrary` in `content.ts` so the portal offers them.

## Known pitfalls

- **Browsers launched by `pnpm screenshot` (local Chrome via playwright-core) reach Convex fine**, including `--live` and `--portal`. Some sandboxed browsers can't open the Convex websocket ("Connection closed before receiving a handshake response"); the page then stays on its loading skeleton. That's the environment, not a bug. Fall back to `ConvexHttpClient` from Node (sign in with the `auth:signIn` action using admin/admin).
- **Convex CLI network calls fail intermittently** (`fetch failed`). Retry before debugging. Don't pipe into `tail` when the exit code matters.
- **Query limits:** `.take(n)` silently truncates. Pages are read with `take(50)`; there are 16 page ids (`pageIds` in `copy.ts`). Raise limits if you add more.
- **Backend code is dense** (many one-line functions in `convex/`). Read whole functions before editing.
- **zsh:** never name a shell variable `path`; it overwrites `PATH`. Quote globs in flags: `grep -rn x apps --include='*.tsx'` (unquoted, zsh fails with "no matches found").

## Docs status

- `README.md`: current.
- `convex/README.md`: current backend map.
- `docs/content-sources.md`: where the old-site content and images came from.
- `docs/portal-design.md`: current portal and content architecture.
- `docs/portal-walkthrough.md`: current manual test walkthrough.
- `docs/deployment.md`: current Vercel + Convex production setup (`apps/*/vercel.json`, `scripts/vercel-build.sh`).

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
