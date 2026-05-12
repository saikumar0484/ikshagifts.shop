# Current Codex Memory

Date: 2026-05-08

Source archive received from owner:

```text
C:\Users\Admin\Documents\New project 2\ikshagifts-shop-full-project-safe-20260507-214118.zip
```

Extracted working folder:

```text
C:\Users\Admin\Documents\New project 2\ikshagifts-shop-full-project-safe-20260507-214118-extracted\ikshagifts-shop
```

## Owner Instruction

The owner wants this zip/project treated as the current source of truth for continuing the iksha gifts website.

Important standing rules:

- Read `README.md`, `CODEX_CHECKPOINTS.md`, `DEVELOPER_HANDOFF.md`, and this file before making changes.
- After every meaningful change, update the handoff files so the next Codex/developer can continue safely.
- At the end of the day or when the owner asks, create a fresh handoff zip containing all current project data.
- Keep secrets private. Do not print passwords, service-role keys, or API secrets in chat.
- Do not publish or point changes to the live site unless the owner explicitly says go live/publish.
- For website changes, give a preview link first.

## What Was Read This Session

- The source zip was inspected without modifying it.
- The zip was extracted into a new working folder.
- Main handoff docs were read:
  - `README.md`
  - `CODEX_CHECKPOINTS.md`
  - `DEVELOPER_HANDOFF.md`
- Project config and backend setup were inspected:
  - `package.json`
  - `vercel.json`
  - `supabase/schema.sql`
- The entire extracted file set was inventoried in:
  - `FULL_ZIP_FILE_INVENTORY.md`

`FULL_ZIP_FILE_INVENTORY.md` includes all extracted files with:

- path
- text/binary classification
- byte size
- line count where applicable
- SHA-256 hash

## Current Project Understanding

This is a Vite + React + TypeScript storefront and admin dashboard for iksha gifts with Vercel serverless API routes and Supabase backend.

Major implemented areas include:

- Storefront homepage and collections
- Product catalog with Women, Men, and Customized Gifts categories
- Cart drawer with coupon and checkout form
- Razorpay checkout flow and admin-managed Razorpay settings
- Supabase products, orders, customers, carts, sessions, rate limits, integrations, and admin users
- Admin dashboard with products, orders, inbox, integrations, CSV export, and support workflows
- Official WhatsApp Business Platform support module using webhook/API pattern
- Product stock limits and catalog refresh support
- Supabase Storage bucket support for product images
- CSP/security headers including Razorpay and Cloudflare allowances
- Docker support files
- Supabase Email OTP login/register flow
- `/account` dashboard with My Orders, Profile edit, and Logout

Latest documented production work in `CODEX_CHECKPOINTS.md`:

- Checkpoint 30: cart drawer scroll and stock limit guard
- Checkpoint 31: CSP and placeholder image fixes
- Checkpoint 32: Razorpay checkout CSP frame fix

Live/prod URLs documented in README:

```text
https://ikshagifts.shop
https://admin.ikshagifts.shop
```

Preview URLs documented in README/checkpoints include:

```text
https://ikshagiftsshop-main.vercel.app
https://iksha-gifts-supabase-commerce-4bwnsg42y.vercel.app
```

## Sensitive Data Note

This extracted zip contains `supabase-project-access.txt`, which appears to be a sensitive/local access note. It should be handled as private and included only in a private handoff zip if the owner explicitly wants all data shared with another trusted Codex/developer.

No secrets were printed in chat.

## Next Recommended Step

Before editing:

```powershell
npm install
npm.cmd run build
npm.cmd run lint
```

If dependencies are already present, `npm install` can be skipped.

## Verification Completed This Session

```powershell
npm.cmd install
npm.cmd run build
npm.cmd run lint
```

Result:

- Install completed.
- Build passed.
- Lint passed with 0 errors.
- Lint still reports 8 existing Fast Refresh warnings in UI/router/commerce files.

## Preview Links Created This Session

Local dev server:

```text
http://127.0.0.1:5173/
http://127.0.0.1:5173/admin
```

Temporary cloud tunnel to local dev server:

```text
https://hungry-bees-work.loca.lt/
https://hungry-bees-work.loca.lt/admin
```

Vercel preview deployment:

```text
https://ikshagiftsshop-main-beji813tb-imashokkumarwork-sudos-projects.vercel.app
```

Vercel review alias:

```text
https://ikshagifts-shop-review-20260508.vercel.app
```

Important:

- The Vercel preview/review alias is protected by Vercel authentication on this project.
- The `loca.lt` tunnel is the public cloud preview link for the current local dev server.
- The tunnel works only while the local dev server and localtunnel process are running.
- Do not deploy to production or promote to `ikshagifts.shop` until the owner explicitly says go live/publish.

## Stable Public Review Link After Tunnel Issue

The `loca.lt` tunnel was not reliably opening for the owner, so the extracted project was deployed to the separate Vercel review project alias:

```text
https://ikshagiftsshop-main.vercel.app/
https://ikshagiftsshop-main.vercel.app/admin
```

This is not the real `ikshagifts.shop` domain. It is the separate Codex/Vercel review project.

Verification:

- `https://ikshagiftsshop-main.vercel.app/` returned HTTP 200.
- `https://ikshagiftsshop-main.vercel.app/admin` returned HTTP 200.
- `https://ikshagiftsshop-main.vercel.app/api/products` returned HTTP 200 with 13 products.

## Latest Preview State

The active customer auth direction is now free Supabase Email OTP:

- No password login UI.
- No SMS/mobile OTP.
- Login/register modal asks for First Name and Email Address.
- Email OTP is sent by Supabase Auth.
- OTP verification uses `supabase.auth.verifyOtp`.
- Verified users are synced to the server session so existing orders/cart APIs still work.
- `/account` shows My Orders, Profile, and Logout.

Latest review links:

```text
https://ikshagiftsshop-main.vercel.app/
https://ikshagiftsshop-main.vercel.app/account
https://ikshagiftsshop-main.vercel.app/admin
```

This review link is separate from the real production domain. Do not publish to `ikshagifts.shop` until the owner explicitly says go live/publish.

Before deployment:

- Confirm environment variables in the target Vercel project.
- Confirm Supabase Email Provider and Email OTP template are configured before testing real OTP delivery.
- Confirm Supabase schema is applied.
- Confirm Razorpay credentials are configured in Admin > Integrations or Vercel env fallback.
- Confirm WhatsApp/Meta credentials before using Support inbox sending/receiving.

## Email OTP Delivery Note

Supabase Auth logs showed OTP requests and `mail.send` events for the connected project, which means Supabase is sending the email. If the customer receives an email without a visible code, the Supabase Magic Link email template still needs to include `{{ .Token }}` instead of only `{{ .ConfirmationURL }}`.

Setup instructions are saved in:

```text
SUPABASE_EMAIL_OTP_SETUP.md
```

Local dev was configured with the public Supabase URL and publishable anon key in `.env.local`, then Vite was restarted on `http://127.0.0.1:5173/`.

## Email OTP Fallback Code Added

Because the Supabase plugin cannot edit Auth email templates directly, the app now has a safer bridge while the template is being fixed:

- Supabase browser client now detects sessions returned in the URL.
- Email OTP requests set `emailRedirectTo` to the current `/account` page.
- If Supabase sends a magic-link email before the template is changed, clicking the link can return to `/account`.
- On load and Supabase sign-in events, the app syncs the Supabase session into the existing server session.

Files changed:

```text
src/lib/supabaseClient.ts
src/components/site/AuthModal.tsx
src/lib/commerce.tsx
```

Preview deployment after this fallback:

```text
https://ikshagiftsshop-main.vercel.app/
https://ikshagiftsshop-main.vercel.app/account
```

Both returned HTTP 200 after deployment.

## Email Rate Limit Handling

Supabase Auth logs showed `429: email rate limit exceeded` with `error_code: over_email_send_rate_limit` for `/otp`. This happens when too many OTP/magic-link emails are requested in a short time, especially on Supabase's built-in email sender.

The app now protects the login form:

- After a successful OTP request, the Send OTP button waits 60 seconds before another request for the same email.
- If Supabase returns a rate-limit error, the form shows a friendly message and stores a 60-minute retry timer for that email.
- The customer can still use the latest email link/code already sent.

For production reliability, configure a custom SMTP provider in Supabase Auth settings. Supabase's built-in email sender is intended for development and has strict limits.

## Email Rate Limit Recovery UX

After the owner saw the friendly rate-limit message, the auth modal was adjusted again:

- If Supabase returns a rate-limit error, the form now switches to the OTP entry step.
- The message tells the customer to enter the latest OTP/code already sent or open the latest login link from inbox.
- A new `I already have an OTP` button lets the customer open the OTP entry step without sending another email.

This avoids trapping customers on the Send OTP screen while Supabase is rate-limiting new emails.

## Admin Email Integration Communication Plan

The owner decided to leave Supabase Auth OTP email because of rate limits and instead send website communication through the Admin > Integrations email setup.

Implemented:

- Customer OTP login now calls `/api/auth/request-otp` and sends OTP through the store email integration instead of Supabase Auth.
- OTP verification now uses `pending_signups` in Supabase Database and creates/updates the existing `customers` and `users` records.
- Admin > Integrations > Email now supports SMTP fields:
  - SMTP host
  - SMTP port
  - SSL/TLS toggle
  - SMTP username/email
  - SMTP password/app password
- Existing Resend API key support remains.
- Store email sender is centralized in `api/_lib/otp.ts`.
- Order placed emails are sent after COD/manual order creation when the customer has a real email.
- Razorpay order placed/payment received emails are sent when the customer has a real email.
- Admin order status updates send customer email for statuses like packed, shipped, delivered.

Important:

- For Gmail, the owner must use a Gmail app password, not the normal Gmail password.
- If Email integration is disabled or credentials are missing, order emails fail silently so checkout/order management does not break.
- This is preview-only until the owner approves going live.

## Gmail Email Integration Preconfigured

Owner asked to use `katreddyisha@gmail.com` for all website communication. The connected Supabase project now has an `integration_settings` row:

```text
key: email
provider: smtp
enabled: true
fromName: iksha gifts
fromEmail: katreddyisha@gmail.com
replyTo: katreddyisha@gmail.com
smtpHost: smtp.gmail.com
smtpPort: 465
smtpSecure: true
```

Code defaults also now point to this Gmail address.

Still missing:

- Gmail SMTP app password must be entered in Admin -> Integrations -> Email -> SMTP password/app password.
- Gmail does not allow OTP sending with only the email address. It requires a Google app password or another provider such as Resend.

The OTP error now tells the owner/customer that the sender is almost ready and asks for the Gmail app password.

## Gmail App Password Saved

The owner saved the Gmail app password through Admin -> Integrations -> Email. Supabase now shows encrypted Email integration secrets for:

```text
smtpUser
smtpPass
```

Do not print or store the actual app password in notes or chat. The Email integration remains:

```text
provider: smtp
enabled: true
fromEmail: katreddyisha@gmail.com
replyTo: katreddyisha@gmail.com
smtpHost: smtp.gmail.com
smtpPort: 465
smtpSecure: true
```

Next verification step is to send a real OTP from `/account` and confirm the email arrives from the Gmail mailbox.

## Product 4K Preview Images

Generated 13 high-resolution product preview images for the current product catalog. The files are 3840x2160 JPEGs saved under:

```text
public/product-images/
```

Products/images:

```text
bracelet -> /product-images/bracelet.jpg
couple-watches -> /product-images/couple-watches.jpg
couple-bracelets -> /product-images/couple-bracelets.jpg
women-watch -> /product-images/women-watch.jpg
men-watch -> /product-images/men-watch.jpg
small-bouquet -> /product-images/small-bouquet.jpg
large-bouquet -> /product-images/large-bouquet.jpg
small-hamper -> /product-images/small-hamper.jpg
large-hamper -> /product-images/large-hamper.jpg
magazine-gift -> /product-images/magazine-gift.jpg
women-couple-bracelet -> /product-images/women-couple-bracelet.jpg
men-couple-bracelet -> /product-images/men-couple-bracelet.jpg
women-couple-watches -> /product-images/women-couple-watches.jpg
```

Also updated:

- `src/data/products.ts` fallback catalog image paths.
- `supabase/schema.sql` seed image paths.
- Supabase `products.image_url` rows through a temporary service-role script.

Security cleanup:

- Vercel env was temporarily pulled to update Supabase product image URLs, then `.env.vercel.local` was removed immediately.

Scripts added:

```text
scripts/generate-product-images.mjs
scripts/update-product-image-urls.mjs
```

## OTP UX Adjustment

Owner asked to remove the `I already have an OTP` button and change the long 1-hour retry lock to 1 minute.

Implemented in `src/components/site/AuthModal.tsx`:

- Removed `I already have an OTP` button.
- Supabase/API rate-limit style errors now set a 60-second retry timer.
- Error copy now says to wait 1 minute, then resend OTP.

## OTP Spam Message

Owner said OTP emails are coming in spam. Updated `AuthModal` OTP instruction text to:

```text
Enter the OTP sent to your email address (Check In Spam Mail).
```

## Admin Best Seller Category

Date: 2026-05-08 17:09 IST

Owner asked to add one more option in Admin Dashboard > Add Product category beside Women, Men, and Customized.

Implemented:

- Added `Best Seller` to the shared product category lists:
  - `src/data/products.ts`
  - `api/_lib/catalog.ts`
- Updated admin product validation to accept Best Seller.
- Added safe storage behavior in `api/admin.ts`:
  - Admin can select `Best Seller`.
  - The API stores it under the existing Supabase-safe `customized_gifts` category because the live database still has the old category check constraint.
  - The API automatically sets a Best Seller tag/featured flag so the admin list can still display it as `Best Seller`.
  - Admin product filters can request `best_seller` and will show matching Best Seller-tagged customized gift products.

Important note:

- The live Supabase direct DB password available on this machine appears to belong to an older project, so a direct database constraint migration was not applied.
- The app-level compatibility layer avoids the database constraint failure for now.
- `supabase/schema.sql` has the intended future schema/category allowance for `best_seller` if a developer later applies the full schema intentionally.

Verification:

```text
npm.cmd run build -> passed
npm.cmd run lint -> passed with 0 errors and 8 existing Fast Refresh warnings
```

## Supabase Product Image Upload Bucket Created

Date: 2026-05-09

Owner reported images were still not showing.

Finding:

- Supabase Storage had no buckets.
- Admin Image 1/Image 2 Upload depends on public bucket `product-images`.
- Without this bucket, image upload could not store files for website display.

Fix:

- Created Supabase Storage bucket:

```text
product-images
public: true
allowed mime types: image/jpeg, image/png, image/webp
file size limit: 5 MB
```

- Verified a JPG could upload and be publicly fetched.
- Deleted the temporary upload test file after verification.

Important:

- Product images should now be uploaded from Admin Dashboard using Image 1 Upload / Image 2 Upload.
- Existing products with `image_url: null` still need a new image uploaded and saved.
- Do not use Google Drive folder links as image URLs.

## Product Detail Modal Smoothness Fix

Date: 2026-05-09

Owner reported clicking product image/product caused a glitch.

Fix:

- Updated `src/components/site/Shop.tsx`.
- Product detail modal is now rendered once at the Shop level instead of inside each product card.
- This prevents the modal from being affected by card hover transform/overflow.
- Opening modal now locks body scroll while open.
- Image slider transition was smoothed with a longer ease-out transition and `will-change-transform`.
- Slider images are non-draggable to avoid browser drag jitter.
- Added small modal open animation.

Verification:

```text
npm.cmd run build -> passed
npm.cmd run lint -> passed with 0 errors and 8 existing Fast Refresh warnings
```

## Product Image Not Showing Fix

Date: 2026-05-09

Owner reported product image is not showing.

Finding:

- Supabase products had a product with `image_url` set to a Google Drive folder URL:
  - `https://drive.google.com/drive/folders/...`
- A Drive folder URL cannot be rendered inside an `<img>` tag.
- That caused product image display to fail/appear blank for that product.

Fix:

- `api/_lib/catalog.ts`
  - Blocks Google Drive folder URLs as invalid product images.
  - Converts supported Google Drive file links to thumbnail URLs.
  - Falls back to the visible product placeholder instead of returning a broken folder URL.
- `src/lib/commerce.tsx` and `src/components/site/Shop.tsx`
  - Same blocking/conversion logic on the browser side for safety.
- `src/components/site/SiteImage.tsx`
  - Image load errors no longer leave the image permanently invisible.

Guidance for future uploads:

- Best: upload product images through Admin Dashboard Image 1/Image 2 Upload.
- If using links, use a direct image URL or Google Drive file share link, not a Google Drive folder link.
- Preferred image size remains 1200 x 1200 px.

Verification:

```text
npm.cmd run build -> passed
npm.cmd run lint -> passed with 0 errors and 8 existing Fast Refresh warnings
```

## Catalog Versions Missing Table Fix

Date: 2026-05-09

Owner reported:

```text
Could not find the table 'public.catalog_versions' in the schema cache
```

Cause:

- Product Save calls `bumpCatalogVersion()`.
- The live Supabase project is missing the optional `catalog_versions` helper table.
- The missing helper table caused Save to fail after the product write path.

Fix:

- Updated `api/_lib/catalog.ts`.
- `bumpCatalogVersion()` now catches only missing/related `catalog_versions` errors and does not block product Save.
- Other unexpected errors still throw.

Why this is okay:

- The main product save still writes to Supabase `products`.
- Website sync still works through admin `notifyCatalogChange()`, product-table realtime, no-cache product API fetches, and fallback polling.

Verification:

```text
npm.cmd run build -> passed
npm.cmd run lint -> passed with 0 errors and 8 existing Fast Refresh warnings
```

## Admin Save Button Live Product Sync

Date: 2026-05-09

Owner asked to ensure the existing Admin Dashboard Save button updates the website immediately, with no separate Publish button.

Implemented:

- `src/admin/AdminDashboard.tsx`
  - After Save, Delete, stock change, or visibility change, admin now calls `notifyCatalogChange()`.
  - Save still writes to Supabase through `/api/admin?action=products`.
  - No Publish button was added.
- `src/lib/catalogRealtime.ts`
  - Rebuilt catalog sync helper.
  - Website now listens for:
    - Supabase Realtime product table changes.
    - Supabase Realtime `catalog_versions` changes.
    - Same-browser/cross-tab admin save notifications.
    - A short fallback polling interval so stale UI self-corrects even if realtime is unavailable.
  - Admin can broadcast a product-change event immediately after Save.
- `src/lib/commerce.tsx`
  - Product fetches use `cache: "no-store"` plus a timestamp query param.
- `src/components/site/Shop.tsx`
  - Collection product fetches also use `cache: "no-store"` plus a timestamp query param.

Result:

- Admin Dashboard -> Save -> Supabase API save -> website product state reload signal.
- Product name, price, description, images, category, stock, featured/best-seller status are fetched dynamically from the live API/database after Save.

Verification:

```text
npm.cmd run build -> passed
npm.cmd run lint -> passed with 0 errors and 8 existing Fast Refresh warnings
```

## Handoff Zip Created

Date: 2026-05-08

Created a fresh safe handoff zip for another Codex/developer:

```text
C:\Users\Admin\Documents\New project 2\ikshagifts-shop-codex-handoff-20260508-192021.zip
```

Included:

- Current source code.
- Public product images/assets.
- `README.md`, `DEVELOPER_HANDOFF.md`, `CURRENT_CODEX_MEMORY.md`, `CODEX_CHECKPOINTS.md`.
- Supabase schema/docs and package files.

Excluded:

- `node_modules`
- `dist`
- `.vercel`
- local env/secret files such as `.env.local`, `.env.vercel.local`, `supabase-project-access.txt`, and `admin-access.txt`
- log files

Note:

- The zip is safe to share as a code handoff. It intentionally does not include passwords or private keys.

## Storefront Image Speed Optimization

Date: 2026-05-12

Owner said website images were loading late and asked for smoother/faster loading.

Implemented:

- Generated responsive WebP versions for all product images:
  - `public/product-images/optimized/*-320.webp`
  - `public/product-images/optimized/*-640.webp`
  - `public/product-images/optimized/*-960.webp`
  - `public/product-images/optimized/*-1280.webp`
- Added script:
  - `scripts/optimize-product-images.mjs`
- Added image helper:
  - `src/lib/imageOptimization.ts`
- Updated image rendering:
  - `src/components/site/SiteImage.tsx` now automatically uses optimized local product WebP `srcSet`.
  - `src/components/site/Hero.tsx` passes hero image sizes.
  - `src/components/site/Shop.tsx` uses optimized images in product cards and product detail slider.
  - `src/components/site/CartDrawer.tsx` uses optimized cart thumbnails.

Verification:

```text
npm.cmd run build -> passed
npm.cmd run lint -> passed with 0 errors and 8 existing Fast Refresh warnings
https://ikshagiftsshop-main.vercel.app/ -> 200
https://ikshagiftsshop-main.vercel.app/admin -> 200
https://ikshagiftsshop-main.vercel.app/product-images/optimized/bracelet-640.webp -> 200 image/webp
```

Latest preview links:

```text
https://ikshagiftsshop-main.vercel.app/
https://ikshagiftsshop-main.vercel.app/admin
```

## Product Image Gallery And Grid Changes

Date: 2026-05-09

Owner asked for product image/product grid changes only, with no full redesign.

Implemented:

- Product cards no longer show product description on the homepage/card.
- Clicking a product image/name opens a product detail modal.
- Product detail modal shows:
  - Swipeable/sliding product image gallery with minimum two image slots.
  - Product name.
  - Price and compare price.
  - Add to Cart button.
  - Buy Now button.
  - Product description.
- Mobile product grid now uses 2 products per row instead of 3.
- Desktop/tablet product grid remains 3 per row.
- Product cards have consistent sizing/alignment with fixed image ratio and clamped title height.
- Admin Dashboard product form now has:
  - Image 1 URL
  - Image 2 URL
  - Image 1 Upload
  - Image 2 Upload
- To avoid risky live Supabase schema changes, both image URLs are stored compatibly in the existing `image_url` field using a delimiter and parsed by the API/UI.

Files changed:

- `src/components/site/Shop.tsx`
- `src/admin/AdminDashboard.tsx`
- `src/lib/commerce.tsx`
- `src/data/products.ts`
- `api/_lib/catalog.ts`
- `api/admin.ts`

Verification:

```text
npm.cmd run build -> passed
npm.cmd run lint -> passed with 0 errors and 8 existing Fast Refresh warnings
```

Cloud preview updated:

```text
https://ikshagiftsshop-main.vercel.app/
https://ikshagiftsshop-main.vercel.app/admin
```

## Coupon Minimum Cart Value

Date: 2026-05-08

Owner asked that coupon/code should not apply for low cart value. Minimum cart value must be 299.

Implemented:

- `src/components/site/CartDrawer.tsx`
  - Added `couponMinimumCartValue = 299`.
  - Coupon discount only applies when cart total is at least 299.
  - If user applies coupon below 299, the UI shows:
    `Add minimum ₹299 to apply coupon.`
  - Added a small text note under coupon apply:
    `Minimum cart value ₹299 required to apply code.`
  - If cart drops below 299 after coupon was applied, coupon is removed and message is shown.
- `api/orders.ts`
  - Server-side coupon validation also rejects `IKSHA150` below 299 so checkout requests cannot bypass the UI.

Verification:

```text
npm.cmd run build -> passed
npm.cmd run lint -> passed with 0 errors and 8 existing Fast Refresh warnings
```
