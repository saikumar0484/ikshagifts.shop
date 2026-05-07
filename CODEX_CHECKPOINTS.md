# Codex Checkpoints

Use this file as the handoff source of truth when continuing this project from another Codex account. It lives inside the project repo so it does not depend on hidden `.codex/sessions` files, which can fail when a different account or path tries to resume a thread.

Project path:

```powershell
C:\Users\Admin\Documents\New project 2\ikshagifts.shop-main
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

## Standing Memory Instruction

The owner asked Codex to save project memory in repo files. Future sessions should read `README.md` and this checkpoint file before making changes, then update one or both files after meaningful work.

Record:

- what changed
- what commands/tests passed or failed
- what remains risky or unfinished
- any live setup, auth, payment, database, admin, product, or deployment impact

Preview rule:

- For every website change, give the owner a preview link first.
- Do not publish or deploy to production unless the owner explicitly says "go live" or "publish".

## Checkpoint 4 - Hero Collection Row Cleanup

Status: Local preview change completed.

Date: 2026-05-05

Goal:

- Remove the hero text `Thoughtful gifting, sorted beautifully.`
- Show collection labels in one compact line in this order:
  - Men
  - Women
  - Customized

What changed:

- Updated `src/components/site/Hero.tsx`.
- Replaced the large collection heading/card list with small pill links.
- Kept this as a local preview-only change. Nothing was published live.

Verification:

```powershell
npm.cmd run build
npm.cmd run lint
```

Result:

- Build passed.
- Lint passed with 0 errors and existing Fast Refresh warnings only.
- Browser preview confirmed the old text is removed and the first three hero collection labels are `Men`, `Women`, `Customized`.

Preview:

```text
http://127.0.0.1:5187
```

## Checkpoint 5 - Remove Order Window Copy

Status: Local preview change completed.

Date: 2026-05-05

Goal:

- Remove the visible hero block:
  - `Order window`
  - `Limited custom orders available today`
  - `Order before 5PM for faster dispatch`

What changed:

- Updated `src/components/site/Hero.tsx` to remove the order-window block.
- Updated duplicate matching copy in `src/components/site/Nav.tsx` and `src/components/site/Contact.tsx` so the removed wording does not appear elsewhere on the page.
- Kept this as a local preview-only change. Nothing was published live.

Verification:

```powershell
npm.cmd run build
npm.cmd run lint
```

Result:

- Build passed.
- Lint passed with 0 errors and existing Fast Refresh warnings only.
- Browser preview confirmed `Order window`, `Limited custom orders available today`, and `Order before 5PM for faster dispatch` are no longer present.

Preview:

```text
http://127.0.0.1:5187
```

## Checkpoint 6 - Remove Lower Trust And Collection Text

Status: Local preview change completed.

Date: 2026-05-05

Goal:

- Remove visible lower homepage copy requested by the owner:
  - `Delivery in 3-5 Days`
  - `Premium packaging included`
  - `Premium wrapping included`
  - `Limited custom slots today`
  - Men collection blurb text
  - Customized Gifts collection blurb text
- Keep the top hero collection row with:
  - Men
  - Women
  - Customized

What changed:

- Removed the `TrustBar` render from `src/App.tsx`.
- Removed lower collection-card rendering by removing `CollectionNav` from the homepage flow.
- Removed hidden collection blurbs from the desktop nav menu in `src/components/site/Nav.tsx`.
- Removed delivery/packaging badges from `src/components/site/Hero.tsx` and `src/components/site/Shop.tsx`.
- Kept this as a local preview-only change. Nothing was published live.

Verification:

```powershell
npm.cmd run build
npm.cmd run lint
```

Result:

- Build passed.
- Lint passed with 0 errors and existing Fast Refresh warnings only.
- Browser preview confirmed the requested phrases are no longer present and the top hero links remain `Men`, `Women`, `Customized`.

Preview:

```text
http://127.0.0.1:5187
```

## Checkpoint 7 - Simplify Top Hero Category Line

Status: Local preview change completed.

Date: 2026-05-05

Goal:

- Remove the `Collections` label from the hero category panel.
- Make the category line smaller and start-aligned.
- Show:
  - Men
  - Women
  - Customized Gifts

What changed:

- Updated `src/components/site/Hero.tsx`.
- Replaced the pill-button style with a compact text link line: `Men / Women / Customized Gifts`.
- Kept this as a local preview-only change. Nothing was published live.

Verification:

```powershell
npm.cmd run build
npm.cmd run lint
```

Result:

- Build passed.
- Lint passed with 0 errors and existing Fast Refresh warnings only.
- Browser preview confirmed hero panel text is `MEN / WOMEN / CUSTOMIZED GIFTS` and the `Collections` label is gone.

Preview:

```text
http://127.0.0.1:5187
```

## Checkpoint 8 - Reduce Moving Hero Image Height

Status: Local preview change completed.

Date: 2026-05-05

Goal:

- Reduce the moving hero image/slider height because it was taking too much of the screen.

What changed:

- Updated `src/components/site/Hero.tsx`.
- Changed the moving image area to a shorter fixed responsive height:
  - mobile: `220px`
  - tablet: `280px`
  - desktop: `320px`
- Tightened the product overlay text and add-to-cart button so the smaller image area stays clean.
- Kept this as a local preview-only change. Nothing was published live.

Verification:

```powershell
npm.cmd run build
npm.cmd run lint
```

Result:

- Build passed.
- Lint passed with 0 errors and existing Fast Refresh warnings only.
- Browser preview confirmed the moving image renders at about `320px` high on desktop with no error overlay.

Preview:

```text
http://127.0.0.1:5187
```

## Checkpoint 9 - Placeholder Products And Category Filtering

Status: Local preview change completed.

Date: 2026-05-05

Goal:

- Replace the storefront placeholder catalog with the owner-provided product list.
- Every product should show:
  - title
  - placeholder image
  - temporary description
  - price `₹5000`
  - MRP `₹6000`
  - add-to-cart behavior
- Separate products by:
  - Women
  - Men
  - Customized Gifts
- Show 3 product cards per desktop row.
- Make product cards/buttons/images smaller.
- Show product description only after clicking a product.

What changed:

- Updated `src/data/products.ts` with 13 owner-provided placeholder products and matching `/cart/add/<slug>` URLs.
- Restored Women as a supported collection/category across frontend routing and category filtering.
- Updated `src/components/site/Shop.tsx` so product cards are smaller, desktop grid is 3 columns, MRP discount is visible, and clicking a product toggles its description.
- Added direct `/cart/add/:slug` handling in `src/lib/commerce.tsx` and `vercel.json`.
- Updated `api/_lib/catalog.ts`, `api/admin.ts`, and `supabase/schema.sql` so backend fallback/admin/schema category support includes Women, Men, and Customized Gifts.
- Kept this as a local preview-only change. Nothing was published live.

Verification:

```powershell
npm.cmd run build
npm.cmd run lint
```

Result:

- Build passed.
- Lint passed with 0 errors and existing Fast Refresh warnings only.
- Browser preview confirmed:
  - product cards render in 3 columns on desktop
  - first product is `Stylish Bracelet`
  - price/MRP render as `₹5,000` and `₹6,000`
  - clicking product reveals description
  - `/collections/women`, `/collections/men`, and `/collections/custom` filter correctly
  - `/cart/add/bracelet` opens the cart with `Stylish Bracelet`

Preview:

```text
http://127.0.0.1:5187
```

## Checkpoint 10 - Local Product Images And 3-Column Small Grid

Status: Local preview change completed.

Date: 2026-05-05

Goal:

- Make product images visible for every product without depending on external placeholder image URLs.
- Force products to show 3 cards in one row.
- Make product cards/images/buttons smaller.

What changed:

- Updated `src/data/products.ts` to use built-in SVG data placeholder images for all 13 products.
- Updated `api/_lib/catalog.ts` fallback images to use the same local SVG placeholder style.
- Updated `src/components/site/Shop.tsx` so product grids use 3 columns and tighter spacing/card sizing.
- Kept this as a local preview-only change. Nothing was published live.

Verification:

```powershell
npm.cmd run build
npm.cmd run lint
```

Result:

- Build passed.
- Lint passed with 0 errors and existing Fast Refresh warnings only.
- Browser preview confirmed the first 3 product cards are on the same row and their images load from local `data:image/svg+xml` placeholders.

Preview:

```text
http://127.0.0.1:5187
```

## Checkpoint 11 - Compact Contact And Legal Text

Status: Local preview change completed.

Date: 2026-05-05

Goal:

- Remove the contact headline:
  - `Thoughtful gifting, polished presentation, and custom details that feel personal.`
- Make the WhatsApp/order-help paragraph bold.
- Remove the contact badges:
  - `Custom orders welcome`
  - `Message us for dispatch timing`
  - `Premium wrapping included`
- Show a smaller `Customer care` label.
- Make the customer policy/legal section smaller.

What changed:

- Updated `src/components/site/Contact.tsx`.
- Updated `src/components/site/LegalPolicies.tsx`.
- Kept this as a local preview-only change. Nothing was published live.

Verification:

```powershell
npm.cmd run build
npm.cmd run lint
```

Result:

- Build passed.
- Lint passed with 0 errors and existing Fast Refresh warnings only.
- Browser preview confirmed:
  - old contact headline is removed
  - contact badges are removed
  - WhatsApp/order-help paragraph renders bold
  - legal heading and policy text render smaller
  - no Vite error overlay or console errors

Preview:

```text
http://127.0.0.1:5187
```

## Checkpoint 12 - Four Review Cards In One Row

Status: Local preview change completed.

Date: 2026-05-05

Goal:

- In the `100+ Happy Customers` section, show the review image/cards as 4 items in one line.

What changed:

- Updated `src/components/site/SocialProof.tsx`.
- Changed the reviews grid to 4 columns from small/desktop preview widths.
- Tightened review card padding, image frame, stars, title, and review text sizes so the row stays clean.
- Kept this as a local preview-only change. Nothing was published live.

Verification:

```powershell
npm.cmd run build
npm.cmd run lint
```

Result:

- Build passed.
- Lint passed with 0 errors and existing Fast Refresh warnings only.
- Browser preview at `900x900` confirmed 4 review cards render in the first row with no Vite error overlay or console errors.

Preview:

```text
http://127.0.0.1:5187
```

## Checkpoint 13 - Four Gift Experience Cards And Remove Story Block

Status: Local preview change completed.

Date: 2026-05-05

Goal:

- Show the `Gift Experience` cards as 4 items in one line.
- Keep the gift experience image/card topics, including premium packaging, thoughtful wrapping, and delivered look.
- Remove the `Our Story` block and related text:
  - `Premium handmade gifting with a personal touch.`
  - `iksha gifts began with a simple idea...`
  - `Premium materials`
  - `Limited custom batches`
  - `Personalized gifting`
  - `crafted in`
  - `our cozy nook`

What changed:

- Updated `src/components/site/GiftExperience.tsx`.
- Updated `src/data/storefront.ts` to add a fourth gift-experience card.
- Updated `src/App.tsx` to remove the About/Our Story section from the homepage.
- Deleted unused `src/components/site/About.tsx` so the removed story copy is no longer kept in source.
- Kept this as a local preview-only change. Nothing was published live.

Verification:

```powershell
npm.cmd run build
npm.cmd run lint
```

Result:

- Build passed.
- Lint passed with 0 errors and existing Fast Refresh warnings only.
- Browser preview at `900x900` confirmed:
  - 4 gift-experience cards render in the first row
  - removed Our Story/About text is not visible
  - no Vite error overlay or console errors

Preview:

```text
http://127.0.0.1:5187
```

## Checkpoint 14 - Hero Gift Category Label Cleanup

Status: Local preview change completed.

Date: 2026-05-07

Goal:

- Change the hero category line from:
  - `Men / Women / Customized Gifts`
- To a cleaner one-line label set:
  - `Gift For Men`
  - `Gift For Women`
  - `Customized Gifts`
- Remove slash separators.

What changed:

- Updated `src/components/site/Hero.tsx`.
- Kept this as a local preview-only change. Nothing was published live.

Verification:

```powershell
npm.cmd run build
```

Result:

- Build passed.
- Browser preview at `900x700` confirmed the hero labels render without `/` separators and there is no Vite error overlay.

Preview:

```text
http://127.0.0.1:5173
```

## Checkpoint 15 - Gift Category Light And Dark Selected State

Status: Local preview change completed.

Date: 2026-05-07

Goal:

- Show category links with a light default style and dark selected/clicked style.
- Apply this to:
  - `Gift For Men`
  - `Gift For Women`
  - `Customized Gifts`

What changed:

- Updated `src/components/site/Hero.tsx` so hero category links become pill buttons and darken on click.
- Updated `src/components/site/Shop.tsx` so collection pages show the same category selector above products, with the active collection in dark color and the others in light color.
- Kept this as a local preview-only change. Nothing was published live.

Verification:

```powershell
npm.cmd run build
```

Result:

- Build passed.
- Browser preview confirmed `/collections/women` shows `Gift For Women` in dark color and the other category links in light color.

Preview:

```text
http://127.0.0.1:5173
```

## Checkpoint 16 - Cloud Preview Link Saved

Status: Cloud preview deployment completed.

Date: 2026-05-07

Goal:

- Give the owner a public cloud preview link with all latest local changes saved.
- Keep this separate from the real `ikshagifts.shop` production site.

What changed:

- Vercel linked this extracted local folder to a new project under the currently logged-in account:
  - `imashokkumarwork-sudos-projects/ikshagifts.shop-main`
- Added `@types/nodemailer` as a dev dependency so Vercel API TypeScript checks do not complain about Nodemailer types.
- Updated `api/products.ts` to pass a narrowed product category type into `getCatalog`.
- Kept this separate from the real `ikshagifts.shop` domain because the correct GitHub/Vercel account permissions are still not available in this session.

Verification:

```powershell
npm.cmd run build
npm.cmd run lint
vercel.cmd deploy --prod --yes
```

Result:

- Local build passed.
- Local lint passed with 0 errors and existing Fast Refresh warnings only.
- Vercel cloud build passed.
- Browser check confirmed the public cloud URL loads content, shows `Gift For Men`, and has no Vite error overlay or console errors.

Cloud preview:

```text
https://ikshagiftsshop-main.vercel.app
```

## Checkpoint 25 - Razorpay Checkout Flow Added

Status: Code completed, waiting for Razorpay keys before real payment testing.

Date: 2026-05-07

Goal:

- When customers choose `Pay With UPI / Cards`, open Razorpay directly for the cart amount.
- Save the order to Supabase and mark it paid only after Razorpay signature verification.

What changed:

- Updated `api/payments/verify.ts` to create Razorpay orders with `?action=create-order`, verify `razorpay_order_id|razorpay_payment_id`, and support guest orders.
- Updated `src/lib/commerce.tsx` to load Razorpay checkout, open payment, verify success, clear cart, and show congratulations.
- Updated `src/components/site/CartDrawer.tsx` text so online payment is no longer shown as paused.
- Added `razorpay_order_id` to `supabase/schema.sql`.
- Applied Supabase migration `add_razorpay_order_id`.
- Kept payment work inside the existing payment API route so Vercel Hobby stays under the serverless function limit.

Verification:

```powershell
npm.cmd run build
npm.cmd run lint
```

Result:

- Build passed.
- Lint passed with 0 errors and existing Fast Refresh warnings only.

Important setup needed:

- Add `RAZORPAY_KEY_ID`.
- Add `RAZORPAY_KEY_SECRET`.
- Keep the key secret private and never paste it into README or public chat.

Preview:

```text
https://ikshagiftsshop-main.vercel.app
```

## Checkpoint 27 - Admin Control Center Product/Stock Foundation

Status: Preview deployment completed.

Date: 2026-05-07

Goal:

- Make the admin dashboard the practical controller for products, stock, availability, image uploads, orders, and storefront refresh.

What changed:

- Added `catalog_versions` SQL setup for Supabase Realtime product refresh signals.
- Added public `product-images` Supabase Storage bucket setup in `supabase/schema.sql`.
- Added admin image upload endpoint: `POST /api/admin?action=product-image`.
- Product create/update/delete and inline stock/availability edits now bump `catalog_versions`.
- Storefront subscribes to the catalog version signal and refetches `/api/products` after product changes.
- Storefront cart blocks hidden/out-of-stock items and clamps quantity to available stock.
- COD/UPI orders deduct stock after order creation.
- Razorpay paid orders deduct stock after successful signature verification.
- Admin Product List now has search, category filter, status filter, inline stock controls, and show/hide toggle.
- Dashboard overview now shows active products, hidden products, pending orders, unread inbox, and needs-attention cards.
- Updated README with the new environment variables and deployment setup notes.

Verification:

```powershell
node .\node_modules\vite\bin\vite.js build
node .\node_modules\eslint\bin\eslint.js .
```

Result:

- Production build passed.
- Lint passed with 0 errors and existing Fast Refresh warnings only.
- Updated `supabase/schema.sql` was applied to the Supabase project.
- Verified `catalog_versions`, normalized product categories, and `product-images` through Supabase APIs.
- Preview deployment build completed without the earlier API upload TypeScript warning.
- Verified protected preview product APIs using `vercel curl`:
  - `/api/products?category=men`
  - `/api/products?category=customized_gifts`

Preview:

```text
https://iksha-gifts-supabase-commerce-4bwnsg42y.vercel.app
```

Important note:

- The preview is protected by Vercel Deployment Protection. Use Vercel login/bypass to open it in a browser.
- Production was not promoted.

## Checkpoint 26 - Safe WhatsApp Web Contact Manager

Status: Local admin UI change completed.

Date: 2026-05-07

Goal:

- Support WhatsApp customer management without a paid WhatsApp API provider.
- Avoid storing, scraping, or automating the owner's WhatsApp Web session.

What changed:

- Updated `src/admin/AdminDashboard.tsx`.
- Added a WhatsApp Web QR login panel inside the Integrations tab.
- The panel opens the official `https://web.whatsapp.com/` screen, where the owner can scan the QR from the WhatsApp mobile app.
- Added a customer chat manager in the Integrations tab:
  - search customer contacts by name, email, or phone
  - open a normal WhatsApp chat
  - open a prefilled order-update WhatsApp chat

Verification:

```powershell
node .\node_modules\vite\bin\vite.js build
```

Result:

- Build passed.
- No new WhatsApp API keys or provider accounts are required for the manual chat workflow.

Important note:

- The official WhatsApp Web QR is opened in a separate secure browser tab. It is not embedded inside the admin page because WhatsApp Web blocks embedding and unofficial automation can create legal/account risk.

## Checkpoint 27 - Official WhatsApp Business Support Module

Status: Local implementation completed.

Date: 2026-05-07

Goal:

- Build an official WhatsApp Business Platform integration for ecommerce support.
- Avoid reverse-engineered WhatsApp Web automation, scraping, or unofficial session hijacking.
- Give support agents a Shopify Inbox / Zendesk-style workflow inside the admin dashboard.

What changed:

- Added `api/_lib/whatsapp.ts`.
- Added webhook endpoint `api/whatsapp/webhook.ts`.
- Added realtime-like support refresh in the admin dashboard. It uses lightweight polling to stay within the Vercel Hobby function limit.
- Extended `api/admin.ts` with support REST actions:
  - `support`
  - `support-conversation`
  - `support-message`
  - `support-note`
  - `support-suggestions`
- Extended `api/_lib/integrations.ts` for official WhatsApp Cloud API config:
  - webhook URL
  - Meta App ID
  - WABA ID
  - Graph API version
  - Cloud API access token
  - phone number ID
  - webhook verify token
  - Meta App secret
- Extended `supabase/schema.sql` with:
  - `support_agents`
  - `whatsapp_conversations`
  - `whatsapp_messages`
  - `support_notes`
  - `support_message_templates`
- Added an admin Support tab in `src/admin/AdminDashboard.tsx`:
  - conversation list
  - search and status filters
  - realtime-ish polling refresh
  - message thread
  - template buttons
  - AI-style reply suggestions
  - assignment and status controls
  - customer profile sidebar
  - order history, payment status, shipping details
  - internal notes
- Added Docker support:
  - `Dockerfile`
  - `.dockerignore`
  - `docker-compose.yml`

Verification:

```powershell
node .\node_modules\typescript\bin\tsc --noEmit
node .\node_modules\eslint\bin\eslint.js src\admin\AdminDashboard.tsx src\routes\index.tsx api\_lib\whatsapp.ts api\whatsapp\webhook.ts api\support\stream.ts api\admin.ts api\_lib\integrations.ts
node .\node_modules\vite\bin\vite.js build
```

Result:

- TypeScript passed.
- Targeted ESLint passed.
- Vite production build passed.

Important deployment notes:

- Apply the new Supabase schema before using the Support tab in production.
- Configure the WhatsApp integration in Admin > Integrations with official Meta credentials.
- Set the Meta webhook callback URL to:

```text
https://ikshagifts.shop/api/whatsapp/webhook
```

- Use the same webhook verify token in Meta and in the admin integration settings.

## Checkpoint 28 - Remove Manual WhatsApp Web Panel

Status: Local admin UI cleanup completed.

Date: 2026-05-07

Goal:

- Remove the confusing WhatsApp Web QR/manual tab flow from Integrations.
- Make support happen inside the admin dashboard through the official WhatsApp Business Platform module.

What changed:

- Updated `src/admin/AdminDashboard.tsx`.
- Removed the manual "Customer chat manager" section that opened WhatsApp Web in a new tab.
- Replaced it with a direct card that opens the in-dashboard Support inbox.
- Kept Meta/WhatsApp Manager external links only for one-time official account setup, not daily customer support.
- Updated `README.md` to clarify that WhatsApp Web is not embedded or automated.

Reason:

- WhatsApp Web cannot be safely embedded in the dashboard and unofficial automation creates account/legal risk.
- The correct customer-support workflow is the Support tab backed by official Cloud API webhooks and messages.

Important note:

- This is a cloud preview/public Vercel alias, not the main `https://ikshagifts.shop` production website.

## Checkpoint 17 - Supabase Schema And Owner Admin Setup

Status: Supabase database setup completed; runtime env still needs service-role key.

Date: 2026-05-07

Goal:

- Use the connected Supabase plugin to finish the missing backend setup for admin/dashboard data.
- Fix the admin error caused by an empty Supabase project.

What changed:

- Found one Supabase project:
  - `itrpsxjdtvfqhgacozsm`
  - URL: `https://itrpsxjdtvfqhgacozsm.supabase.co`
- Applied `supabase/schema.sql` to the Supabase project.
- Created all required public tables:
  - `customers`
  - `pending_signups`
  - `customer_sessions`
  - `admin_users`
  - `admin_sessions`
  - `carts`
  - `orders`
  - `products`
  - `inbox_messages`
  - `rate_limits`
  - `integration_settings`
- Seeded 13 product rows.
- Created or reset one owner admin user:
  - email: `owner@ikshagifts.shop`
  - role: `owner`
  - active: `true`

Verification:

- Supabase table count check returned:
  - products: `13`
  - admin users: `1`
  - inbox messages: `0`
  - orders: `0`
- Supabase security advisor reports RLS enabled with no policies. This matches the current app design, which expects server-side access through `SUPABASE_SERVICE_ROLE_KEY`; do not expose anon access to these tables.

Remaining blocker:

- The Supabase plugin does not expose the private `SUPABASE_SERVICE_ROLE_KEY`, by design.
- Local admin login still needs `.env.local` with:

```text
SUPABASE_URL=https://itrpsxjdtvfqhgacozsm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<copy from Supabase dashboard API keys>
SESSION_SECRET=<long random secret>
```

Important security note:

- Do not store the service-role key in README, checkpoints, Git, or chat history.

## Checkpoint 18 - Remove Gallery Section

Status: Local preview change completed.

Date: 2026-05-07

Goal:

- Remove the homepage gallery section containing:
  - `Gallery`
  - `From the studio`
  - `See more on Instagram`
  - `Blue crochet lily`
  - `Pink crochet bow`
  - `Cream crochet bunny`
  - `Crochet sunflower`

What changed:

- Updated `src/App.tsx` to remove the Gallery render from the homepage.
- Deleted unused `src/components/site/Gallery.tsx`.
- Kept this as a local preview-only change. Nothing was published live.

Verification:

```powershell
npm.cmd run build
```

Result:

- Build passed.
- Browser preview confirmed all requested gallery text is removed and there is no Vite error overlay.

Preview:

```text
http://127.0.0.1:5173
```

## Checkpoint 19 - Move Featured Products Into Best Sellers

Status: Local preview change completed.

Date: 2026-05-07

Goal:

- Remove the `Featured` section and nav item.
- Keep all products visible by moving featured products into `Best Sellers`.

What changed:

- Updated `src/components/site/Shop.tsx`.
- Updated `src/components/site/Nav.tsx`.
- Best Sellers now renders all available products.
- Removed the `#featured-products` section render and the `Featured` nav link.

Verification:

```powershell
npm.cmd run build
```

Result:

- Build passed.
- Browser preview confirmed:
  - `#featured-products` no longer exists
  - `Featured` nav text is removed
  - `#best-selling-products` shows all 13 products
  - no Vite error overlay

Preview:

```text
https://ikshagiftsshop-main.vercel.app
```

## Checkpoint 20 - Cart Coupon Discount

Status: Local preview change completed.

Date: 2026-05-07

Goal:

- When a customer adds a product to cart, show a coupon code option.
- Let the customer type a coupon and apply it.
- Show discount on the total bill.

What changed:

- Updated `src/components/site/CartDrawer.tsx`.
- Updated `src/lib/commerce.tsx`.
- Updated `api/orders.ts`.
- Added coupon support for:
  - `IKSHA150`
  - fixed discount: `Rs.150`
- Cart now shows:
  - subtotal
  - coupon input
  - discount line after applying valid coupon
  - final total bill
- Order creation now sends the coupon code to the API and stores the discounted order amount.

Verification:

```powershell
npm.cmd run build
npm.cmd run lint
```

Result:

- Build passed.
- Lint passed with 0 errors and existing Fast Refresh warnings only.
- Browser preview confirmed:
  - product can be added to cart
  - coupon field accepts `IKSHA150`
  - discount line appears
  - total bill updates
  - no Vite error overlay

Preview:

```text
https://ikshagiftsshop-main.vercel.app
```

## Checkpoint 21 - Place Your Order Checkout Form

Status: Local preview change completed.

Date: 2026-05-07

Goal:

- Replace `Place order request` with `Place Your Order`.
- When clicked, show checkout fields:
  - name
  - mobile number
  - address
  - pin code
  - payment option
- Save these details with the order.

What changed:

- Updated `src/components/site/CartDrawer.tsx`.
- Updated `src/lib/commerce.tsx`.
- Updated `api/orders.ts`.
- Updated `supabase/schema.sql`.
- Applied Supabase migration `add_order_checkout_details`.
- Cart now opens a checkout form after clicking `Place Your Order`.
- Order API now accepts guest/customer checkout details and stores:
  - `customer_name`
  - `customer_phone`
  - `shipping_address`
  - `pin_code`
  - `payment_method`
  - `subtotal_amount`
  - `discount_amount`
  - `coupon_code`

Verification:

```powershell
npm.cmd run build
npm.cmd run lint
```

Result:

- Build passed.
- Lint passed with 0 errors and existing Fast Refresh warnings only.
- Browser preview confirmed:
  - old `Place order request` text is removed
  - `Place Your Order` appears
  - checkout form opens after click
  - name/mobile/address/pin/payment fields render
  - no Vite error overlay

Preview:

```text
https://ikshagiftsshop-main.vercel.app
```

## Checkpoint 22 - Admin Order Details And Excel Export

Status: Local preview change completed.

Date: 2026-05-07

Goal:

- Ensure checkout details are stored order-wise in Supabase.
- Show order details in the admin dashboard.
- Add an Excel-friendly sheet export for order data.

What changed:

- Verified Supabase `orders` has columns for:
  - `customer_name`
  - `customer_phone`
  - `shipping_address`
  - `pin_code`
  - `payment_method`
  - `subtotal_amount`
  - `discount_amount`
  - `coupon_code`
- Updated `src/admin/AdminDashboard.tsx`.
- Admin Orders now shows checkout name, mobile, address, pin code, payment, and coupon/discount details.
- Added `Export Excel CSV` button in Admin Orders.
- CSV export includes one row per order with order ID, date, customer details, address, payment, status, subtotal, discount, coupon, total, items, tracking, and estimated delivery.

Verification:

```powershell
npm.cmd run build
npm.cmd run lint
```

Result:

- Build passed.
- Lint passed with 0 errors and existing Fast Refresh warnings only.

Preview:

```text
https://ikshagiftsshop-main.vercel.app
```

## Checkpoint 23 - Supabase Env Connected To Cloud Preview

Status: Cloud preview Supabase connection completed.

Date: 2026-05-07

Goal:

- Fix `Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.`
- Make the cloud preview API read/write Supabase data.

What changed:

- Created local `.env.local` with Supabase URL, service-role key, session secret, and admin key.
- Added required environment variables to the Vercel preview project for:
  - production
  - preview
  - development
- Redeployed the cloud preview alias.

Verification:

- Cloud `/api/products` returns Supabase product data.
- Cloud admin summary API returns Supabase metrics using admin key.
- Supabase currently has:
  - 13 products
  - admin user configured
  - orders table ready for customer details and Excel CSV export

Cloud preview:

```text
https://ikshagiftsshop-main.vercel.app
```

Security note:

- The service-role key was not written into README or checkpoints.
- Keep `.env.local` private and do not commit it.

## Checkpoint 24 - Online Payment First And Congratulations Message

Status: Local preview change completed.

Date: 2026-05-07

Goal:

- Do not show Cash on Delivery first.
- Show online payment first so customers are encouraged to pay online.
- After placing the order, show:
  - `Order Has Been Placed. Congratulations!`

What changed:

- Updated `src/components/site/CartDrawer.tsx`.
- Updated `src/lib/commerce.tsx`.
- Updated `api/orders.ts`.
- Payment option now defaults to `Pay With UPI / Cards`.
- `Cash on delivery` is still available but moved last.
- Backend accepts `online`, `upi`, and `cod` payment methods.

Verification:

```powershell
npm.cmd run build
npm.cmd run lint
```

Result:

- Build passed.
- Lint passed with 0 errors and existing Fast Refresh warnings only.
- Browser preview confirmed payment select default is `Pay With UPI / Cards`.

Preview:

```text
https://ikshagiftsshop-main.vercel.app
```
