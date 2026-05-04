# Codex Checkpoints

Use this file as the handoff source of truth when continuing this project from another Codex account. It lives inside the project repo so it does not depend on hidden `.codex/sessions` files, which can fail when a different account or path tries to resume a thread.

Project path:

```powershell
C:\Users\208X1\Documents\New project\iksha-gifts-supabase-commerce
```

## Checkpoint 1 - Admin Product And Inbox Work

Status: Successful

Date: 2026-05-04

What changed:

- Admin sidebar now includes Dashboard, Inbox, and Products sections.
- Products section has Add Product and Product List flows.
- Inbox module added for customer messages.
- Product category logic added for `men` and `customized_gifts`.
- Frontend product collection fetching now filters by category through `/api/products?category=...`.
- Supabase schema includes `products.category` constraints and `inbox_messages`.
- README was updated for the new admin/product/inbox setup.

Verification:

```powershell
& 'C:\Users\208X1\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' '.\node_modules\vite\bin\vite.js' build
```

Result: Passed.

Preview deployment:

```text
https://iksha-gifts-supabase-commerce-q79whxk11.vercel.app
```

Vercel status: `READY`

Important deployment note:

- The preview URL currently shows Vercel Authentication on public access. The deployment is ready, but preview protection is enabled in Vercel.
- Apply `supabase/schema.sql` in Supabase for inbox and category functionality to work against the live database.

## Checkpoint 2 - Email OTP Auth Direction

Status: Frontend build successful, backend email sending needs SMTP env configuration before live testing.

Date: 2026-05-04

Goal:

- Replace the failing SMS/Twilio OTP flow with email OTP.
- On signup, customer enters name, email, and optional phone.
- App emails a welcome message plus six-digit OTP.
- Account is created in `customers` only after OTP verification.
- Login uses email OTP.

Files changed so far:

- `api/_lib/otp.ts`
- `api/auth/request-otp.ts`
- `api/auth/verify-otp.ts`
- `api/auth/login.ts`
- `api/_lib/session.ts`
- `src/components/site/AuthModal.tsx`
- `src/lib/commerce.tsx`
- `supabase/schema.sql`
- `package.json`

Verification:

```powershell
& 'C:\Users\208X1\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' '.\node_modules\vite\bin\vite.js' build
```

Result: Passed after fixing the auth modal JSX.

Required environment variables for personal email SMTP:

```text
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-personal-email@example.com
SMTP_PASS=your-app-password
SMTP_FROM=your-personal-email@example.com
SMTP_FROM_NAME=iksha gifts
SESSION_SECRET=use-a-long-random-secret
OTP_SECRET=use-a-different-long-random-secret
```

Important notes:

- For Gmail, use a Google App Password, not your normal Gmail password.
- `package.json` now references `nodemailer`. Local `npm` was not available in the shell PATH, so run `npm install` from a machine/account with npm before using `npm ci`.
- Phone is now optional in `customers` and `pending_signups`; run the updated `supabase/schema.sql` before testing signup.

## Checkpoint 3 - Storefront Offer Banner And Product Layout Cleanup

Status: Code changes committed locally and ready to continue from another Codex account.

Date: 2026-05-04

Goal:

- Update the top storefront offer text to the exact wording requested by the user.
- Remove the extra introductory shop text block from the product area so the cards move upward.
- Avoid touching unrelated admin, auth, database, or email-routing code.

What changed:

- Updated the top announcement bar copy in `src/components/site/Nav.tsx` to:

```text
Welcome Offer: 150 Off + Free Shipping Use Code IKSHA150
```

- Fixed the storefront collection matching regex in `src/components/site/Nav.tsx` so it includes:
  - `women`
  - `men`
  - `custom`

- Simplified `src/components/site/Shop.tsx` by removing the extra top product-section heading and descriptive copy block.
- Pulled the product grids higher by tightening the outer section spacing.

Files changed in this checkpoint:

- `src/components/site/Nav.tsx`
- `src/components/site/Shop.tsx`

Current commit for this checkpoint:

```text
c8212b1 Tighten storefront hero and product layout
```

Verification:

```powershell
& 'C:\Users\208X1\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' '.\node_modules\vite\bin\vite.js' build
```

Result: Passed.

Important scope note:

- This checkpoint intentionally changes only the storefront nav banner and the storefront product layout section.
- It does not change admin dashboard logic, SMTP setup, Cloudflare setup, Supabase schema, or inbox behavior.

## Safe Resume Steps For Another Codex Account

1. Open the project folder above.
2. Read this file first.
3. Run:

```powershell
git status --short
```

4. Run `git log --oneline --decorate -5` and confirm the latest storefront checkpoint commit is:

```text
c8212b1 Tighten storefront hero and product layout
```

5. Run the frontend build command listed above.
6. If continuing storefront work only, start from `src/components/site/Nav.tsx` and `src/components/site/Shop.tsx`.
7. If continuing auth or admin work, review Checkpoint 1 and Checkpoint 2 before editing backend code.
8. Configure SMTP and Supabase environment variables in Vercel only when resuming the email-auth track.
9. Apply `supabase/schema.sql` in Supabase only when resuming backend database work.
10. Deploy a new Vercel preview or production build only after confirming the intended track of work.

## Current Known Risks

- SMTP email cannot be tested until real mailbox credentials are configured.
- Vercel preview protection may hide preview URLs from public visitors.
- GitHub CLI is installed but not logged in, so pushing to GitHub may still need authentication.
