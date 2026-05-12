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

## Checkpoint 29 - Admin Managed Razorpay Payments

Status: Local implementation completed.

Date: 2026-05-07

Goal:

- Let the owner manage Razorpay payment credentials from Admin > Integrations.
- Enable online UPI/card payment collection through Razorpay Checkout on `ikshagifts.shop`.

What changed:

- Updated `api/_lib/integrations.ts`.
- Added `razorpay` as an encrypted integration type.
- Updated `src/admin/AdminDashboard.tsx`.
- Admin > Integrations now shows a Razorpay card with:
  - enabled toggle
  - test/live mode
  - checkout business name
  - Razorpay Key ID
  - encrypted Razorpay Key Secret
  - optional webhook secret for future webhook verification
- Updated `api/payments/verify.ts`.
- Razorpay payment creation now reads admin-saved encrypted credentials, with Vercel env vars as fallback.
- Existing checkout flow still creates a Razorpay order, opens Razorpay Checkout, and verifies payment signature server-side.
- Updated `src/lib/commerce.tsx` to display the configured business name in Razorpay Checkout.

Verification:

```powershell
node .\node_modules\typescript\bin\tsc --noEmit
node .\node_modules\eslint\bin\eslint.js api\_lib\integrations.ts api\payments\verify.ts src\admin\AdminDashboard.tsx src\lib\commerce.tsx
node .\node_modules\vite\bin\vite.js build
```

Result:

- TypeScript passed.
- Vite production build passed.
- Targeted ESLint passed with only the existing Fast Refresh warning in `src/lib/commerce.tsx`.

Live testing steps:

- Open Admin > Integrations.
- Enable Razorpay payments.
- Set mode to `test` for test card/UPI testing, or `live` only after the Razorpay account is approved.
- Paste Razorpay Key ID and Key Secret.
- Save.
- Add a product to cart on the storefront and choose `Pay With UPI / Cards`.

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

## Checkpoint 30 - Cart Drawer Scroll And Stock Limit Guard

Status: Production deployed and pushed to GitHub.

Date: 2026-05-07

Goal:

- Fix the cart drawer checkout form so fields below Mobile Number remain reachable.
- Keep the cart quantity from exceeding the product stock quantity managed in the admin dashboard.

What changed:

- Updated `src/components/site/CartDrawer.tsx`.
- Changed the cart drawer to use a fixed viewport-height panel with one internal scroll area.
- Moved subtotal, coupon, total, and checkout form into that internal scroll area so Address, Pin Code, Payment, and Place Your Order stay reachable.
- Added cart quantity stock awareness:
  - the plus button disables when the cart quantity reaches the product `stockQuantity`
  - the cart shows the available stock count for products coming from the admin catalog
  - the existing `updateQuantity` and backend checkout stock validation remain in place as the final guard

Verification:

```powershell
node .\node_modules\typescript\bin\tsc --noEmit
node .\node_modules\eslint\bin\eslint.js src\components\site\CartDrawer.tsx src\lib\commerce.tsx
node .\node_modules\vite\bin\vite.js build
```

Result:

- TypeScript passed.
- Vite production build passed.
- Targeted ESLint passed with only the existing Fast Refresh warning in `src/lib/commerce.tsx`.

Deployment:

- Production deployment completed:

```text
https://iksha-gifts-supabase-commerce-awss0346k.vercel.app
```

- Vercel aliased the deployment to:

```text
https://ikshagifts.shop
```

GitHub:

```text
d0a4e5a Fix cart drawer checkout and stock limits
```

Live smoke check:

- `https://ikshagifts.shop` returned HTTP 200.
- `https://ikshagifts.shop/api/products` returned HTTP 200 with Supabase product data.

## Checkpoint 31 - CSP And Broken Placeholder Image Fix

Status: Production deployed and pushed to GitHub.

Date: 2026-05-07

Goal:

- Fix the browser console errors reported on `https://ikshagifts.shop`.
- Stop broken `https://via.placeholder.com/300?...` product images from rendering when those URLs are stored in Supabase.
- Keep the security header strict while allowing Cloudflare's own analytics script.

What changed:

- Updated `vercel.json` Content Security Policy:
  - added `https://static.cloudflareinsights.com` to `script-src`
  - added `https://cloudflareinsights.com` to `connect-src`
- Updated `src/data/products.ts` to export the built-in local SVG placeholder generator.
- Updated `src/lib/commerce.tsx` so Supabase product rows using `via.placeholder.com` fall back to local generated placeholders before rendering.
- Updated `src/components/site/Shop.tsx` with the same image fallback for collection-specific API fetches.
- Updated `api/_lib/catalog.ts` so `/api/products` also normalizes blocked placeholder image URLs before returning product data.

Verification:

```powershell
node .\node_modules\typescript\bin\tsc --noEmit
node .\node_modules\eslint\bin\eslint.js api\_lib\catalog.ts src\data\products.ts src\lib\commerce.tsx src\components\site\Shop.tsx
node .\node_modules\vite\bin\vite.js build
```

Result:

- TypeScript passed.
- Vite production build passed.
- Targeted ESLint passed with only the existing Fast Refresh warning in `src/lib/commerce.tsx`.

Deployment:

- Production deployment completed:

```text
https://iksha-gifts-supabase-commerce-9qruqkykh.vercel.app
```

- Vercel aliased the deployment to:

```text
https://ikshagifts.shop
```

GitHub:

```text
d0990ed Fix CSP and product image fallbacks
3f103b0 Normalize product placeholders in API
```

Live smoke check:

- `https://ikshagifts.shop` returned HTTP 200.
- Live CSP includes `https://static.cloudflareinsights.com`.
- `https://ikshagifts.shop/api/products` returned HTTP 200.
- API product rows with `via.placeholder.com` after normalization: `0`.

## Checkpoint 32 - Razorpay Checkout CSP Frame Fix

Status: Production deployed and pushed to GitHub.

Date: 2026-05-07

Goal:

- Fix the `This content is blocked` browser issue that appeared after clicking `Place Your Order` when Razorpay Checkout tried to open.
- Keep the security policy tight while allowing Razorpay's checkout frame/API domains.

What changed:

- Updated `vercel.json` Content Security Policy:
  - `connect-src` now allows `https://*.razorpay.com`
  - `frame-src` now allows `https://*.razorpay.com`
  - `form-action` now allows `https://*.razorpay.com`
- Updated `Permissions-Policy` so browser payment features are allowed for this site and Razorpay checkout/API origins.

Reason:

- Razorpay's official Standard Checkout loads `https://checkout.razorpay.com/v1/checkout.js`.
- Razorpay's official API gateway uses `https://api.razorpay.com/v1`.
- The previous CSP only allowed a narrow checkout script/frame origin and could block the payment frame or network calls during checkout.

Verification:

```powershell
node .\node_modules\vite\bin\vite.js build
```

Result:

- Vite production build passed.

Deployment:

- Production deployment completed:

```text
https://iksha-gifts-supabase-commerce-3nfl43sci.vercel.app
```

- Vercel aliased the deployment to:

```text
https://ikshagifts.shop
```

GitHub:

```text
9b504d2 Allow Razorpay checkout frames in CSP
```

Live smoke check:

- `https://ikshagifts.shop` returned HTTP 200.
- Live CSP includes:
  - `connect-src ... https://*.razorpay.com`
  - `frame-src https://*.razorpay.com`
  - `form-action ... https://*.razorpay.com`
- Live Permissions-Policy includes payment permission for Razorpay checkout/API origins.

## Checkpoint 33 - Resume From Full Project Safe Zip

Status: Extracted and documented for continuation.

Date: 2026-05-08

Goal:

- Continue from the owner's newer zip archive.
- Read and preserve all project data carefully.
- Save durable memory into project files for another Codex/developer.

Source archive:

```text
C:\Users\Admin\Documents\New project 2\ikshagifts-shop-full-project-safe-20260507-214118.zip
```

Extracted folder:

```text
C:\Users\Admin\Documents\New project 2\ikshagifts-shop-full-project-safe-20260507-214118-extracted\ikshagifts-shop
```

What changed:

- Extracted the archive into a separate folder without modifying the original zip.
- Read the main project handoff docs:
  - `README.md`
  - `CODEX_CHECKPOINTS.md`
  - `DEVELOPER_HANDOFF.md`
- Inspected key setup files:
  - `package.json`
  - `vercel.json`
  - `supabase/schema.sql`
- Created `FULL_ZIP_FILE_INVENTORY.md` with file paths, byte sizes, line counts for text files, and SHA-256 hashes.
- Created `CURRENT_CODEX_MEMORY.md` with the current resume context, project understanding, owner rules, and next steps.
- Updated `README.md` with the new resume location.

Important notes:

- The zip contains `supabase-project-access.txt`, which should be treated as private.
- No passwords, API keys, service-role keys, or sensitive values were printed in chat.
- The project should continue from this extracted folder unless the owner provides a newer archive.

Verification:

- File inventory completed for the extracted project.
- Original archive remains untouched.
- `npm.cmd install` completed successfully.
- `npm.cmd run build` passed.
- `npm.cmd run lint` passed with 0 errors and 8 existing Fast Refresh warnings.

## Checkpoint 34 - Preview Links Only, No Live Publish

Status: Preview links prepared.

Date: 2026-05-08

Goal:

- Give the owner local and cloud preview links for storefront and admin dashboard.
- Do not publish/go live until the owner explicitly says go live or publish.

Links:

```text
Local storefront: http://127.0.0.1:5173/
Local admin: http://127.0.0.1:5173/admin
Cloud tunnel storefront: https://hungry-bees-work.loca.lt/
Cloud tunnel admin: https://hungry-bees-work.loca.lt/admin
Vercel preview: https://ikshagiftsshop-main-beji813tb-imashokkumarwork-sudos-projects.vercel.app
Vercel review alias: https://ikshagifts-shop-review-20260508.vercel.app
```

What changed:

- Started local Vite dev server on port `5173`.
- Linked the extracted project folder to Vercel project `ikshagifts.shop-main`.
- Added preview environment variables for Supabase/session/admin values in Vercel.
- Deployed a Vercel preview build, not production.
- Added a Vercel review alias to the preview deployment.
- Started a temporary `loca.lt` cloud tunnel to the local dev server so the owner can review without publishing production.

Important notes:

- The Vercel preview URL and review alias are protected by Vercel authentication.
- The `loca.lt` links are the usable public cloud preview links while the local tunnel remains running.
- This did not publish to `ikshagifts.shop`.
- Future website changes should be shown through preview links first, then only promoted/live after explicit owner approval.

## Checkpoint 35 - Fix Non-Opening Preview Links

Status: Public review link restored.

Date: 2026-05-08

Goal:

- Fix preview links not opening for the owner.
- Keep the real production website `ikshagifts.shop` untouched.

What changed:

- The temporary `loca.lt` tunnel was found unreliable for owner review.
- Deployed the current extracted project to the separate Vercel review project alias:

```text
https://ikshagiftsshop-main.vercel.app/
https://ikshagiftsshop-main.vercel.app/admin
```

Important:

- This did not deploy to or alias `ikshagifts.shop`.
- The owner still must explicitly say go live/publish before touching the real website.

Verification:

- Review storefront returned HTTP 200.
- Review admin route returned HTTP 200.
- Review products API returned HTTP 200 with 13 products.

## Checkpoint 36 - MSG91 Mobile OTP And Account Dashboard

Status: Superseded by Checkpoint 37 before preview deployment.

Date: 2026-05-08

Goal:

- Build mobile-only OTP login/register for iksha gifts.
- Use MSG91 OTP API for OTP delivery and verification.
- Sync verified mobile users into Supabase Auth and Supabase Database.
- Add `/account` dashboard with My Orders, Profile, and Logout.
- Remove customer-facing email/password login UX.

What changed:

- Replaced the customer auth modal with mobile-first OTP UI:
  - First Name
  - Mobile Number
  - Send OTP
  - Verify OTP
- Added MSG91 helper:
  - `api/_lib/msg91.ts`
- Added Supabase Auth helper:
  - `api/_lib/supabaseAuth.ts`
- Reworked auth endpoints:
  - `api/auth/request-otp.ts`
  - `api/auth/verify-otp.ts`
  - `api/auth/login.ts`
- Added account API:
  - `api/account.ts`
- Added account dashboard:
  - `src/components/site/AccountDashboard.tsx`
- Updated app routing so `/account` renders the dashboard.
- Updated account nav behavior.
- Added Vercel rewrite support for `/account`.
- Added requested Supabase table in `supabase/schema.sql`:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT,
  mobile_number TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

- Applied Supabase migration `add_mobile_otp_users_table` to the connected Supabase project available in this session.
- Added `.env.example` with MSG91 variables.

Important implementation note:

- Supabase's built-in phone OTP does not directly use MSG91 as a hosted SMS provider in the documented provider list.
- This implementation verifies OTP through MSG91, creates/updates the phone user in Supabase Auth using service-role admin APIs, saves profile data in Supabase Database, and keeps the browser logged in through the existing secure HttpOnly server session.

Required before live OTP testing:

```text
MSG91_AUTH_KEY
MSG91_OTP_TEMPLATE_ID
```

Verification:

```powershell
npm.cmd run build
npm.cmd run lint
```

Result:

- Build passed.
- Lint passed with 0 errors and 8 existing Fast Refresh warnings.

## Checkpoint 41 - May 12 Go-Live Handoff Applied With Razorpay Frozen

Status: Applied, pushed, migrated, and deployed to production.

Date: 2026-05-12

Goal:

- Apply the owner-provided go-live handoff zip to the live `ikshagifts.shop` repo.
- Preserve the existing working Razorpay implementation exactly where payment behavior matters.
- Push the result to GitHub and deploy the live production domain.

Source archive:

```text
C:\Users\208X1\Downloads\ikshagifts-shop-go-live-handoff-20260512-110100.zip
```

What changed:

- Imported account dashboard and `/account` route support.
- Imported Supabase email OTP UI/API changes and retry handling.
- Imported optimized/local product images and image optimization helpers.
- Imported Best Seller category support for product filtering/admin usage.
- Imported admin/email/customer communication improvements that do not affect Razorpay behavior.
- Added `@supabase/supabase-js`.
- Removed tracked private handoff file `PRIVATE_SECRET_HANDOFF_README.md`.
- Updated `vercel.json` only for `/account` rewrites while preserving the Razorpay CSP rules.

Razorpay freeze:

- `api/payments/verify.ts` was not copied from the zip and remains untouched.
- The current live `loadRazorpayCheckout`, online payment branch, payment signature verification, and checkout success behavior were preserved.
- Live CSP still allows `https://checkout.razorpay.com` and `https://*.razorpay.com` for Razorpay checkout.

Supabase:

- Planned project `itrpsxjdtvfqhgacozsm` was not accessible from this account.
- Live API usage matched project `vnqgmwvsbnaxsrxvwybb` (`iksha-gifts-commerce`), so the migration was applied there.
- Migration: `go_live_account_best_seller_images`
- Verified after migration:
  - `public.users` exists.
  - product category support includes `best_seller`.
  - placeholder product image count is `0`.
  - local product image rows were seeded.

Verification:

```powershell
node .\node_modules\typescript\bin\tsc --noEmit
node .\node_modules\eslint\bin\eslint.js .
node .\node_modules\vite\bin\vite.js build
```

Result:

- TypeScript passed.
- ESLint passed with 8 existing Fast Refresh warnings only.
- Vite build passed.
- `git diff --check` passed with line-ending warnings only.

Git and deployment:

```text
d06ff71 Apply go-live handoff without Razorpay changes
```

- Pushed to GitHub `main`.
- Production deployment: `https://iksha-gifts-supabase-commerce-5bs0hqzex.vercel.app`
- Live alias: `https://ikshagifts.shop`

Live checks:

- `https://ikshagifts.shop` returned HTTP 200.
- `https://ikshagifts.shop/account` returned HTTP 200.
- `https://admin.ikshagifts.shop/admin` returned HTTP 200.
- `https://ikshagifts.shop/api/products` returned 20 products.
- Product API had `0` `via.placeholder.com` URLs.
- CSP header still includes Razorpay domains.

Residual notes:

- Supabase security advisors still report existing RLS/no-policy and function search-path warnings. These were not changed as part of the handoff import because the requested scope was go-live import while preserving payment behavior.
- Some older products may still use inline SVG fallback images, but the broken external placeholder URLs are gone.

## Checkpoint 40 - Faster Smooth Product Image Loading

Status: Deployed to preview alias.

Date: 2026-05-12

Goal:

- Improve website image loading speed and smoothness.

What changed:

- Generated optimized responsive WebP files for all product images at 320, 640, 960, and 1280 widths.
- Added `scripts/optimize-product-images.mjs` for future regeneration.
- Added `src/lib/imageOptimization.ts`.
- Updated `SiteImage` so local product images automatically use optimized WebP `srcSet`.
- Updated hero, product cards, product detail slider, and cart thumbnails to use proper responsive sizes.

Verification:

```powershell
npm.cmd run build
npm.cmd run lint
```

Result:

- Build passed.
- Lint passed with 0 errors and 8 existing Fast Refresh warnings.
- Preview alias verified:
  - `https://ikshagiftsshop-main.vercel.app/` -> 200
  - `https://ikshagiftsshop-main.vercel.app/admin` -> 200
  - `https://ikshagiftsshop-main.vercel.app/product-images/optimized/bracelet-640.webp` -> 200 `image/webp`

## Checkpoint 42 - Missing Catalog Versions Table No Longer Breaks Save

Status: Implemented and verified locally.

Date: 2026-05-09

Problem:

- Admin Save showed:
  - `Could not find the table 'public.catalog_versions' in the schema cache`

Cause:

- `bumpCatalogVersion()` tried to upsert into optional helper table `catalog_versions`.
- Live Supabase database did not have that table.

Fix:

- Updated `api/_lib/catalog.ts`.
- Missing `catalog_versions` errors are now ignored by `bumpCatalogVersion()`.
- Product Save remains connected to Supabase `products`.
- Realtime/no-cache sync still works through direct admin save notification, products listener, and fallback reload.

Verification:

```powershell
npm.cmd run build
npm.cmd run lint
```

Result:

- Build passed.
- Lint passed with 0 errors and 8 existing Fast Refresh warnings.

## Checkpoint 41 - Admin Save Button Live Product Sync

Status: Implemented and verified locally.

Date: 2026-05-09

Goal:

- Keep only the existing Save button.
- When admin adds/edits a product and clicks Save, data saves to Supabase and website updates without manual refresh/rebuild/redeploy.
- Keep existing design unchanged.

What changed:

- `src/admin/AdminDashboard.tsx`
  - Save/Delete/quick stock/visibility updates now call `notifyCatalogChange()` after the Supabase-backed API write succeeds.
- `src/lib/catalogRealtime.ts`
  - Added stronger live sync:
    - Supabase Realtime broadcast event.
    - Supabase Realtime `products` table listener.
    - Supabase Realtime `catalog_versions` listener.
    - Same-browser/cross-tab local sync.
    - 10-second fallback poll.
- `src/lib/commerce.tsx`
  - Product fetch now uses `cache: "no-store"` and timestamp query param.
- `src/components/site/Shop.tsx`
  - Collection product fetch now uses `cache: "no-store"` and timestamp query param.

Important behavior:

- No separate Publish button was added.
- Product data remains fetched dynamically through the live API/Supabase-backed backend.
- Product name, price, description, images, category, stock, featured, and best-seller changes reload after Save.

Verification:

```powershell
npm.cmd run build
npm.cmd run lint
```

Result:

- Build passed.
- Lint passed with 0 errors and 8 existing Fast Refresh warnings.

## Checkpoint 40 - Product Image Gallery And Mobile Grid

Status: Implemented and verified locally.

Date: 2026-05-09

Goal:

- Product image/product grid changes only.
- Allow minimum 2 images per product.
- Add image viewer/gallery with swipe.
- Add admin Image 1/Image 2 upload fields.
- Show description only in product detail view.
- Mobile product grid must show 2 products per row.
- Keep current theme/layout.

What changed:

- `src/components/site/Shop.tsx`
  - Added product detail modal.
  - Added smooth image slider with previous/next buttons and mobile swipe support.
  - Product cards now open detail modal when image/name is clicked.
  - Removed homepage/card description display.
  - Mobile grid now uses 2 columns, desktop/tablet uses 3.
  - Product cards now use consistent image ratio and title height for alignment.
- `src/admin/AdminDashboard.tsx`
  - Added Image 1 URL and Image 2 URL fields.
  - Added Image 1 Upload and Image 2 Upload fields.
  - Product preview/list use image 1 cleanly.
- `api/admin.ts`, `api/_lib/catalog.ts`, `src/lib/commerce.tsx`, `src/data/products.ts`
  - Added two-image parsing/support.
  - Stored both URLs compatibly in the existing `image_url` value so no risky live DB migration is required.

Verification:

```powershell
npm.cmd run build
npm.cmd run lint
```

Result:

- Build passed.
- Lint passed with 0 errors and 8 existing Fast Refresh warnings.

## Checkpoint 38 - Admin Best Seller Product Category

Status: Preview/public cloud alias updated.

Date: 2026-05-08

Goal:

- In Admin Dashboard > Add Product, add `Best Seller` as a category option along with Women, Men, and Customized.

What changed:

- Added `best_seller` / `Best Seller` to shared product categories:
  - `src/data/products.ts`
  - `api/_lib/catalog.ts`
- Updated admin product API validation to accept Best Seller.
- Added compatibility handling in `api/admin.ts` because the live Supabase products table still has the old category check constraint:
  - Best Seller selected in admin saves safely as `customized_gifts`.
  - Best Seller products get the Best Seller tag/featured behavior.
  - Admin product listing maps Best Seller-tagged customized products back to category `Best Seller`.
  - Admin category filter supports `best_seller`.
- `supabase/schema.sql` also includes the intended future `best_seller` category allowance.

Database note:

- A live direct Supabase DB constraint migration was not applied because the database password note available locally appears to reference an older project.
- The deployed app works around the live constraint without requiring the DB change.

Verification:

```powershell
npm.cmd run build
npm.cmd run lint
```

Result:

- Build passed.
- Lint passed with 0 errors and 8 existing Fast Refresh warnings.
- Public cloud alias verified with HTTP 200:
  - `https://ikshagiftsshop-main.vercel.app/`
  - `https://ikshagiftsshop-main.vercel.app/admin`

## Checkpoint 39 - Coupon Minimum Cart Value

Status: Implemented and verified locally.

Date: 2026-05-08

Goal:

- Coupon/code must not apply when cart value is below 299.
- If the user tries on a low cart value, show a small message below the code apply area.

What changed:

- Updated cart coupon UI in `src/components/site/CartDrawer.tsx`.
- Added minimum coupon cart value:
  - 299
- Low-cart coupon attempt now shows:
  - `Add minimum ₹299 to apply coupon.`
- Small helper text under coupon apply now says:
  - `Minimum cart value ₹299 required to apply code.`
- If a coupon is already applied and the user reduces cart below 299, the coupon is removed automatically.
- Updated `api/orders.ts` so server checkout validation also blocks coupon usage below 299.

Verification:

```powershell
npm.cmd run build
npm.cmd run lint
```

Result:

- Build passed.
- Lint passed with 0 errors and 8 existing Fast Refresh warnings.

## Checkpoint 47 - OTP Spam Mail Text

Status: Implemented and verified locally.

Date: 2026-05-08

Owner request:

- Replace OTP instruction copy with spam-folder reminder.

What changed:

- `AuthModal` now shows: `Enter the OTP sent to your email address (Check In Spam Mail).`

Verification:

```powershell
npm.cmd run build
npm.cmd run lint
```

Result:

- Build passed.
- Lint passed with 0 errors and 8 existing Fast Refresh warnings.

## Checkpoint 44 - Gmail App Password Saved

Status: Confirmed in Supabase.

Date: 2026-05-08

What happened:

- Owner saved the Gmail app password in Admin -> Integrations -> Email.
- Supabase `integration_settings` for `key = email` now shows encrypted secrets for `smtpUser` and `smtpPass`.

Security note:

- Do not record the actual app password in repository files, memory notes, or final handoff text.

Current Email integration:

- Provider: SMTP
- Enabled: true
- From email: `katreddyisha@gmail.com`
- Reply-to email: `katreddyisha@gmail.com`
- SMTP host: `smtp.gmail.com`
- SMTP port: `465`
- SMTP secure: `true`

Next verification:

- Send OTP from `/account` and confirm the customer receives the OTP email.

## Checkpoint 45 - Product Catalog 4K Preview Images

Status: Implemented and verified locally.

Date: 2026-05-08

Owner request:

- List available products and generate 4K pictures for each product so the website looks fully developed for testing.

Available products:

- Stylish Bracelet
- Premium Couple Watches
- Couple Bracelets Set
- Elegant Women Watch
- Classic Men Watch
- Small Flower Bouquet
- Grand Flower Bouquet
- Small Gift Hamper
- Luxury Gift Hamper
- Customized Magazine Gift
- Women Couple Bracelet
- Men Couple Bracelet
- Women & Men Couple Watches

What changed:

- Generated 13 high-resolution 3840x2160 JPEG product preview images.
- Saved images in `public/product-images/`.
- Updated `src/data/products.ts` fallback image paths.
- Updated `supabase/schema.sql` seed image paths.
- Updated Supabase `products.image_url` rows to use `/product-images/<product-id>.jpg`.
- Added helper scripts:
  - `scripts/generate-product-images.mjs`
  - `scripts/update-product-image-urls.mjs`

Verification:

```powershell
node scripts\generate-product-images.mjs
npm.cmd run build
npm.cmd run lint
```

Result:

- All generated images verified at 3840x2160.
- Build passed.
- Lint passed with 0 errors and 8 existing Fast Refresh warnings.

Note:

- These are test/preview catalog images, not final real product photography.

## Checkpoint 46 - OTP Resend UX Cleanup

Status: Implemented and verified locally.

Date: 2026-05-08

Owner request:

- Remove `I already have an OTP`.
- Remove 1-hour wait.
- Keep 1-minute wait, then allow resend OTP.

What changed:

- Removed the `I already have an OTP` button from `AuthModal`.
- Rate-limit errors now store a 60-second retry timer instead of 60 minutes.
- Error message now says: wait 1 minute, then resend OTP.

Verification:

```powershell
npm.cmd run build
npm.cmd run lint
```

Result:

- Build passed.
- Lint passed with 0 errors and 8 existing Fast Refresh warnings.

## Checkpoint 42 - Admin Email Integration For OTP And Store Communication

Status: Implemented and verified locally.

Date: 2026-05-08

Owner direction:

- Leave Supabase built-in OTP email because it is rate-limited.
- Use Admin Dashboard -> Integrations -> Email for all store communication:
  - signup/signin OTP
  - order placed
  - payment received
  - order status updates
  - delivered notifications

What changed:

- `/api/auth/request-otp` no longer calls Supabase Auth `/otp`.
- `/api/auth/request-otp` now creates an OTP, stores a hashed pending login/signup record in `pending_signups`, and sends email through the store email integration.
- `/api/auth/verify-otp` now validates the pending OTP and creates/updates `customers` plus `users` in Supabase Database.
- `src/components/site/AuthModal.tsx` now uses the commerce API login flow instead of browser Supabase Auth.
- `api/_lib/otp.ts` now supports a centralized store email sender with SMTP or Resend.
- `api/_lib/integrations.ts` now stores SMTP public config and encrypted SMTP secrets.
- `src/admin/AdminDashboard.tsx` now shows SMTP host, port, SSL/TLS, username, and password fields under Email integration.
- `api/orders.ts`, `api/payments/verify.ts`, and `api/admin.ts` now send customer emails for order placed, payment received, and order status updates when a real customer email exists.
- `.env.example` now documents SMTP and Resend variables.

Verification:

```powershell
npm.cmd run build
npm.cmd run lint
```

Result:

- Build passed.
- Lint passed with 0 errors and 8 existing Fast Refresh warnings.

Setup needed by owner:

- In Admin -> Integrations -> Email, choose SMTP or Resend, enable it, fill credentials, and save.
- For Gmail SMTP, use an app password.

## Checkpoint 43 - Preconfigure Owner Gmail

Status: Implemented and verified.

Date: 2026-05-08

Owner request:

- Use `katreddyisha@gmail.com` as the sender email for OTP and all customer communication.

What changed:

- Code defaults for Email integration now use `katreddyisha@gmail.com`.
- Gmail SMTP defaults are set to:
  - host `smtp.gmail.com`
  - port `465`
  - secure `true`
- Applied Supabase migration `enable_katreddyisha_gmail_email_integration`.
- Supabase `integration_settings` now has Email enabled with provider `smtp` and public config for `katreddyisha@gmail.com`.
- OTP missing-credential error now explains that Gmail app password must be added.

Still required:

- Owner must add a Gmail app password in Admin -> Integrations -> Email -> SMTP password/app password.
- Gmail cannot send OTP emails from only the email address.

Verification:

```powershell
npm.cmd run build
npm.cmd run lint
```

Result:

- Build passed.
- Lint passed with 0 errors and 8 existing Fast Refresh warnings.

## Checkpoint 41 - Existing OTP Entry During Rate Limit

Status: Implemented and verified locally.

Date: 2026-05-08

Issue:

- Owner saw the friendly rate-limit message but still needed a way to continue login using the latest email already sent.

What changed:

- On Supabase rate-limit errors, `AuthModal` now switches to the OTP verification step.
- The rate-limit message now tells the customer to enter the latest OTP/code already sent or open the latest login link.
- Added an `I already have an OTP` button on the first auth step.

Verification:

```powershell
npm.cmd run build
npm.cmd run lint
```

Result:

- Build passed.
- Lint passed with 0 errors and 8 existing Fast Refresh warnings.

## Checkpoint 38 - Email OTP Delivery Troubleshooting

Status: Notes and local configuration completed.

Date: 2026-05-08

Issue:

- Owner reported that OTP was not coming by email on `/account`.

Findings:

- Local development did not originally have Vite Supabase public environment variables, so local browser OTP could not reliably call Supabase Auth.
- `.env.local` was added with the public Supabase URL and publishable anon key, and the local Vite server was restarted on port 5173.
- Supabase Auth logs for project `itrpsxjdtvfqhgacozsm` showed successful OTP requests and `mail.send` events.
- Logs used `mail_type: magic_link`, which means Supabase is sending email but the default email body may show a link instead of a visible OTP code.

Action saved:

- Added `SUPABASE_EMAIL_OTP_SETUP.md` with the exact Supabase Dashboard email template steps.

Required manual dashboard step:

- Supabase Dashboard -> Authentication -> Email Templates -> Magic Link must include `{{ .Token }}` so customers can type the OTP into the website.

## Checkpoint 39 - Supabase Email Link Fallback

Status: Implemented and verified locally.

Date: 2026-05-08

Goal:

- Make customer auth more forgiving while the Supabase Magic Link template is being changed to show `{{ .Token }}`.

What changed:

- `src/lib/supabaseClient.ts` now enables `detectSessionInUrl`.
- `src/components/site/AuthModal.tsx` now passes `emailRedirectTo: current-origin/account` when requesting OTP.
- `src/components/site/AuthModal.tsx` now tells customers they can open the email login link if the email shows a link.
- `src/lib/commerce.tsx` now syncs an existing Supabase browser session into the existing server-side session on page load and auth state changes.

Verification:

```powershell
npm.cmd run build
npm.cmd run lint
Invoke-WebRequest -Uri http://127.0.0.1:5173/account -UseBasicParsing
```

Result:

- Build passed.
- Lint passed with 0 errors and 8 existing Fast Refresh warnings.
- Local `/account` returned HTTP 200.
- Preview deployment succeeded and was aliased to `https://ikshagiftsshop-main.vercel.app/`.
- Cloud `/` and `/account` returned HTTP 200.

Still required:

- Supabase Auth Email Template must be edited through the dashboard or Management API using a Supabase access token. The currently connected Supabase plugin can read logs and apply migrations, but it does not expose Auth email template editing.

## Checkpoint 40 - Email OTP Rate Limit UX

Status: Implemented and verified locally.

Date: 2026-05-08

Issue:

- Owner reported `email rate limit exceeded` when trying to log in.

Findings:

- Supabase Auth logs showed `/otp` returning HTTP 429 with `error_code: over_email_send_rate_limit`.
- This is a Supabase email sending limit, not a React UI crash.
- Supabase docs say hosted projects have strict email send limits on the built-in email sender, and production should use a custom SMTP provider.

What changed:

- `src/components/site/AuthModal.tsx` now stores an OTP retry timer per email.
- After a successful OTP request, the customer must wait 60 seconds before requesting another OTP for the same email.
- If Supabase returns a rate-limit error, the customer sees a friendly message and a 60-minute retry timer instead of repeated raw errors.
- The Verify OTP flow remains available after an OTP has already been requested.

Verification:

```powershell
npm.cmd run build
npm.cmd run lint
```

Result:

- Build passed.
- Lint passed with 0 errors and 8 existing Fast Refresh warnings.

Preview deployment:

```text
https://ikshagiftsshop-main.vercel.app/
https://ikshagiftsshop-main.vercel.app/account
```

Preview verification:

- Review storefront returned HTTP 200.
- Review `/account` returned HTTP 200.
- Review products API returned HTTP 200 with 13 products.

Important:

- This was deployed only to the separate `ikshagiftsshop-main.vercel.app` review project alias.
- This did not publish to the real `https://ikshagifts.shop` domain.

Superseded:

- The owner changed the requirement from MSG91 mobile OTP to free Supabase Email OTP before this implementation was deployed.
- See Checkpoint 37 for the active auth direction.

## Checkpoint 37 - Free Supabase Email OTP And Account Dashboard

Status: Preview implementation completed.

Date: 2026-05-08

Goal:

- Build free Email OTP login/register using Supabase Auth only.
- Use Supabase Database for profile and order data.
- No password login.
- No SMS/mobile OTP.
- Redirect verified users to `/account`.

What changed:

- Installed `@supabase/supabase-js`.
- Added browser Supabase client:
  - `src/lib/supabaseClient.ts`
- Replaced customer auth modal with Email OTP fields:
  - First Name
  - Email Address
  - Send OTP
  - Verify OTP
- Auth modal now calls:
  - `supabase.auth.signInWithOtp({ email })`
  - `supabase.auth.verifyOtp({ email, token, type: "email" })`
- After Supabase verification, the app syncs the verified Supabase session to the existing secure server session for orders/cart APIs.
- Added/updated server auth bridge:
  - `api/auth/request-otp.ts`
  - `api/auth/verify-otp.ts`
  - `api/auth/login.ts`
- Added `/account` dashboard with:
  - My Orders
  - Profile
  - Logout
- Profile shows:
  - First Name
  - Email Address
- Profile allows editing first name only.
- Email changes are not allowed without a new OTP verification flow.
- Logout now calls Supabase sign out and clears the server session.
- Updated Supabase `users` table shape to:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT,
  email TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

- Applied Supabase migration `switch_users_table_to_email_otp` to the connected project available in this session.
- Removed MSG91 helper files from the active code path.

Required Supabase Dashboard settings:

- Authentication -> Providers -> Email -> enable Email Provider.
- Authentication -> Providers -> Email -> enable Confirm Email.
- Authentication -> Email Templates -> use an OTP template with `{{ .Token }}`.

Verification:

```powershell
npm.cmd run build
npm.cmd run lint
```

Result:

- Build passed.
- Lint passed with 0 errors and 8 existing Fast Refresh warnings.
