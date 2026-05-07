# iksha gifts commerce handoff

This repository powers the live iksha gifts storefront and admin dashboard.

The goal of this README is not marketing. It is a working handoff so another Codex session, another engineer, or future-you can continue the project quickly if the current session hits rate limits or loses context.

## Live URLs

- Storefront: `https://ikshagifts.shop`
- Admin dashboard: `https://admin.ikshagifts.shop`
- Current Codex cloud preview alias: `https://ikshagiftsshop-main.vercel.app`
- Current production deployment alias target during the latest update: `https://iksha-gifts-supabase-commerce-clxzq6bzp.vercel.app`
- Latest preview deployment for the visual-first hero refinement: `https://iksha-gifts-supabase-commerce-mwltmxaup.vercel.app`
- Latest protected preview for Admin Control Center work: `https://iksha-gifts-supabase-commerce-4bwnsg42y.vercel.app`

## What this project is

This is a Vite + React + TypeScript ecommerce-style site for a handmade crochet brand.

It includes:

- A public storefront with product browsing, category filtering, search, cart, legal policies, and order-request flow
- A customer account system using server-side API routes and Supabase tables
- An admin dashboard on the `admin.` subdomain
- Admin inbox management for customer contact messages
- Category-based product management with fixed `men` and `customized_gifts` product categories
- Supabase-backed products, customers, orders, sessions, pending signups, rate limits, integrations, admin users, and admin sessions
- WhatsApp and email integration settings stored in Supabase with encrypted secrets

## Current status

The store is live and usable for guest browsing, cart actions, and admin management.

The project code is now also pushed to GitHub here:

- Repo: `https://github.com/saikumar0484/ikshagifts.shop`
- Default branch: `main`

What is working:

- Storefront UI and product catalog
- Homepage now has a premium gifting-focused redesign preview with:
  - new welcome offer announcement bar
  - new visual-first hero with collections rail and image slider
  - men / custom collections aligned with the supported Supabase categories
  - featured and best-selling product sections
  - social proof and gift experience sections
  - floating WhatsApp CTA
- Cart drawer now scrolls inside its own panel so every checkout field remains reachable on laptop and mobile screens
- Cart quantity controls now respect admin-managed product stock and disable the plus button at the available quantity
- Cart drawer and guest checkout gate
- Customer login endpoint
- Order tracking UI and admin order status workflow
- Admin dashboard on `admin.ikshagifts.shop`
- Admin inbox with read/unread and delete actions
- Admin product workflows for adding, editing, deleting, and filtering by category
- Admin Support tab now includes a policy-compliant WhatsApp Business Platform CRM module:
  - webhook endpoint at `/api/whatsapp/webhook`
  - official Cloud API send path using phone number ID and access token
  - conversation inbox, search, status filters, assignment, templates, notes, order sidebar, and AI-style reply suggestions
  - lightweight in-dashboard polling for new messages to stay within the Vercel Hobby function limit
- Storefront collections query Supabase by category, for example `/api/products?category=men`
- DB-backed owner login for the admin dashboard
- Supabase-backed products, customers, orders, integration settings, and admin sessions
- Security headers via `vercel.json`

What is not fully finished yet:

- Automated phone or WhatsApp OTP still depends on a real provider being configured
- WhatsApp Web is not embedded or used for support automation. The admin dashboard uses the official WhatsApp Business Platform webhook/API pattern instead.
- WhatsApp Business Platform requires Meta credentials in Integrations before real sending/receiving works:
  - `Cloud API access token`
  - `Phone number ID`
  - `Webhook verify token`
  - `Meta App secret`
  - optional `WABA ID`, `Meta App ID`, and Graph API version
- Razorpay payments are managed from Admin > Integrations:
  - enable Razorpay payments
  - choose test or live mode
  - add Razorpay Key ID
  - add Razorpay Key Secret
  - checkout creates a Razorpay order and verifies the payment signature server-side before marking the order paid
- Razorpay checkout code is now wired for `Pay With UPI / Cards`; real payment testing is waiting for `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
- There is no in-app admin password change screen yet
- Image optimization can still be improved further with WebP or AVIF and possibly local font hosting

## Latest major work completed

### Admin Control Center foundation

- Added `catalog_versions` as the Supabase Realtime refresh signal for product/catalog edits
- Added Supabase Storage bucket setup for public `product-images`
- Added admin image upload API: `POST /api/admin?action=product-image`
- Product create, update, delete, stock changes, availability changes, and order stock deduction now bump the catalog version
- Storefront subscribes to `catalog_versions` using the public Supabase URL/key and refetches `/api/products` after product updates
- Storefront cart now blocks hidden/out-of-stock products and clamps cart quantity to stock
- COD/UPI orders deduct product stock after order creation; paid Razorpay orders deduct stock after signature verification
- Admin Product List now supports search, category filter, status filter, inline stock controls, and show/hide toggle
- Dashboard overview now includes active/hidden products, pending orders, unread messages, and missing-image attention cards
- Supabase production schema was updated on 2026-05-07 for `catalog_versions` and `product-images`
- Separate Vercel protected preview was deployed at `https://iksha-gifts-supabase-commerce-4bwnsg42y.vercel.app`

### Admin inbox and category-based product management

- Added a structured admin sidebar with:
  - Dashboard
  - Inbox
  - Products
  - Add Product
  - Product List
- Added an inbox module backed by the `inbox_messages` Supabase table
- Added a storefront contact form that posts customer messages to `/api/inbox`
- Added inbox actions for read/unread state and deletion
- Reworked product management around fixed categories:
  - `men`
  - `customized_gifts`
- Product add/edit now captures:
  - product name
  - description
  - price
  - image URL or uploaded image data
  - required category
  - stock, badge, delivery text, and availability
- Product list now supports category filtering and edit/delete actions
- Public product loading now supports strict category queries:
  - `/api/products?category=men`
  - `/api/products?category=customized_gifts`
- Supabase schema now includes:
  - category check constraint for `products.category`
  - category indexes for product collection queries
  - `inbox_messages` table and inbox indexes

### Setup and deployment notes

Required Vercel/Supabase environment variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SESSION_SECRET`
- `ADMIN_PASSWORD` or `ADMIN_API_KEY` for initial owner setup flows
- `RAZORPAY_KEY_ID` for Razorpay Checkout
- `RAZORPAY_KEY_SECRET` for server-side Razorpay order creation and payment signature verification
- Optional integration variables depend on the email/WhatsApp providers configured in the admin dashboard

Local build check:

```powershell
npm install
npm run build
```

Vercel deployment:

1. Link the Vercel project to this repository.
2. Add the environment variables above in Vercel Project Settings.
3. Run `supabase/schema.sql` against the Supabase project before first production use.
4. Confirm `catalog_versions` is enabled in Supabase Realtime and the `product-images` bucket exists.
5. Deploy with Vercel. The project uses Vite and the existing `vercel.json` API route setup.

### Visual-first hero refinement

- Removed the text-heavy left-side hero messaging so the homepage feels cleaner and more premium
- Replaced that content block with a lean `Collections` rail beside the hero visual
- Increased the visual dominance of the right-side hero slider
- Added subtle lightweight hero motion:
  - slow zoom loop on active imagery
  - gentle floating motion on hero badges
- Updated the top welcome offer from `Rs.250 OFF` to `Rs.150 OFF`
- Updated the free-shipping code to `EKSHA150`
- Created a new separate Vercel preview deployment for review:
  - `https://iksha-gifts-supabase-commerce-mwltmxaup.vercel.app`

### Homepage and collections refresh

- Replaced the old top strip text with the welcome-offer announcement
- Added a new premium hero with headline, subtext, urgency copy, and CTA buttons
- Added 2 main collection routes:
  - `/collections/men`
  - `/collections/custom`
- Reworked the product cards for tighter spacing, 2-up mobile layout, and direct add-to-cart / buy-now actions
- Added dedicated homepage sections for `Featured Products` and `Best Selling Products`
- Added `100+ Happy Customers` social proof and customer review cards
- Added a new gift-experience section for packaging, wrapping, and delivered presentation
- Added a floating WhatsApp button and stronger Instagram / WhatsApp conversion touchpoints
- Updated the visual system toward nude / beige backgrounds, brown text, and gold-toned accents
- Created a separate Vercel preview deployment for review before any production switch

### Repository and handoff continuity

- Installed Git on the local machine
- Initialized this local project as a Git repository
- Connected the local repo to `saikumar0484/ikshagifts.shop`
- Pushed the current project codebase to GitHub on `main`
- Updated this README so it works as the ongoing handoff file for future Codex sessions

This means a future session can continue from either:

- the local folder on this machine, or
- the GitHub repository, even from another device/account, as long as the required secrets are provided again

### Brand and frontend

- Reworked the storefront to match the soft premium handcrafted feel the user wanted
- Preserved the warm palette used in the current version instead of copying GIVA directly
- Added smoother image reveal behavior and lighter entrance motion
- Split heavy sections so the top of the page becomes interactive faster

### Performance work

- Admin dashboard is now lazy-loaded instead of shipping in the main storefront bundle
- Below-the-fold storefront sections are deferred until near viewport
- Commerce hydration for `/api/auth/me` and `/api/products` now waits until idle time
- Added a reusable `SiteImage` component for graceful image reveal
- Added a reusable `DeferredSection` component for below-the-fold loading

Result from the latest production build:

- Main storefront JS dropped from about `267 KB` to about `235 KB`
- Gzipped main storefront JS dropped from about `79.4 KB` to about `72.3 KB`

### Auth and admin

- Admin login was changed from a single env passcode to a real DB-backed owner account system
- Added `admin_users` and `admin_sessions` tables to the Supabase schema
- Admin session cookies now map to real rows in Supabase
- The admin login screen now accepts owner email and password instead of only a passcode

### Integrations

- Added admin integrations management for email and WhatsApp providers
- Integration secrets are encrypted before being stored in Supabase
- Email supports a Resend-first configuration path
- WhatsApp supports manual mode plus placeholders for Cloud API, AiSensy, and Twilio-style setups

## Conversation summary

This is the practical summary of the major requests and decisions that happened across the working sessions.

### Brand and storefront direction

- The user wanted the site to feel similar in quality and polish to `giva.co`
- The implementation followed that premium ecommerce direction while keeping the existing warm handmade color palette of the current iksha gifts version
- The storefront was reshaped around a soft luxury handmade feel instead of a generic template

### Commerce and customer account direction

- The user wanted a real backend and database security instead of a fake/demo-only flow
- Supabase was chosen as the database/backend layer
- The newer storefront direction moved customer auth to a mobile-first UX:
  - first name
  - mobile number
  - OTP verification
- The UI no longer leads with email/password for storefront customer access
- Real OTP delivery still depends on the phone/WhatsApp provider configuration

### Payments decision

- Razorpay integration was requested
- Razorpay was intentionally skipped for now because the business account verification is still pending

### Admin and business operations direction

- The user wanted a proper admin dashboard for a non-technical business owner
- The admin side was expanded to support:
  - product management
  - quantity/availability updates
  - customer analytics
  - order analytics
  - order status tracking
  - integration settings
- The user also wanted the admin side on `admin.ikshagifts.shop`
- That admin subdomain path is now live

### OTP and messaging direction

- The user asked about sending OTP to customer email and phone
- The current code supports:
  - email OTP structure through Resend-style flow
  - phone/WhatsApp OTP structure through configurable provider logic
- The business does not currently have AiSensy or Twilio
- The app currently falls back to a blocked state for automated phone OTP because a real provider is still missing

### Domain, deployment, and publishing direction

- The storefront and admin work were deployed on Vercel
- A separate deployment was created for the updated hero-slider version
- The user then asked to move that deployment onto the main custom domain
- `ikshagifts.shop` was switched to the newer deployment
- `admin.ikshagifts.shop` was also connected for admin access

### Performance direction

- The user reported slow loading and asked for smoother loading and transitions
- Performance improvements included:
  - lazy-loading admin code
  - deferring below-the-fold sections
  - delaying commerce hydration until idle
  - lighter image reveal transitions

### GitHub continuity direction

- The user wanted a README detailed enough to continue the project later with another Codex account
- The user then wanted the full code pushed to GitHub
- Git was installed locally
- The project was connected to the GitHub repo `saikumar0484/ikshagifts.shop`
- The current code and this README were pushed to that repository

## Architecture overview

### Frontend

- Entry: [src/App.tsx](</C:/Users/208X1/Documents/New project/iksha-gifts-supabase-commerce/src/App.tsx>)
- Storefront components: [src/components/site](</C:/Users/208X1/Documents/New project/iksha-gifts-supabase-commerce/src/components/site>)
- Admin dashboard UI: [src/admin/AdminDashboard.tsx](</C:/Users/208X1/Documents/New project/iksha-gifts-supabase-commerce/src/admin/AdminDashboard.tsx>)
- Commerce state and API client: [src/lib/commerce.tsx](</C:/Users/208X1/Documents/New project/iksha-gifts-supabase-commerce/src/lib/commerce.tsx>)
- Theme and animations: [src/styles.css](</C:/Users/208X1/Documents/New project/iksha-gifts-supabase-commerce/src/styles.css>)

### Backend

This project uses Vercel serverless API routes under [api](</C:/Users/208X1/Documents/New project/iksha-gifts-supabase-commerce/api>).

Important routes:

- `api/auth/login.ts`
- `api/auth/request-otp.ts`
- `api/auth/verify-otp.ts`
- `api/orders.ts`
- `api/admin.ts`

Important server helpers:

- [api/\_lib/session.ts](</C:/Users/208X1/Documents/New project/iksha-gifts-supabase-commerce/api/_lib/session.ts>)
- [api/\_lib/admin.ts](</C:/Users/208X1/Documents/New project/iksha-gifts-supabase-commerce/api/_lib/admin.ts>)
- [api/\_lib/otp.ts](</C:/Users/208X1/Documents/New project/iksha-gifts-supabase-commerce/api/_lib/otp.ts>)
- [api/\_lib/integrations.ts](</C:/Users/208X1/Documents/New project/iksha-gifts-supabase-commerce/api/_lib/integrations.ts>)
- [api/\_lib/security.ts](</C:/Users/208X1/Documents/New project/iksha-gifts-supabase-commerce/api/_lib/security.ts>)
- [api/\_lib/db.ts](</C:/Users/208X1/Documents/New project/iksha-gifts-supabase-commerce/api/_lib/db.ts>)

### Database

Main schema file:

- [supabase/schema.sql](</C:/Users/208X1/Documents/New project/iksha-gifts-supabase-commerce/supabase/schema.sql>)

Current important tables:

- `customers`
- `pending_signups`
- `customer_sessions`
- `carts`
- `orders`
- `products`
- `catalog_versions`
- `inbox_messages`
- `rate_limits`
- `integration_settings`
- `admin_users`
- `admin_sessions`

## Security and legal protections already in place

- CSP header
- HSTS
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- strict referrer policy
- restrictive permissions policy
- same-origin checks on sensitive POST routes
- JSON body enforcement on API routes
- server-side sessions for customers and owners
- rate limiting
- legal policy sections for privacy, terms, shipping, refunds, and copyright

See:

- [vercel.json](</C:/Users/208X1/Documents/New project/iksha-gifts-supabase-commerce/vercel.json>)

## Known blockers and important caveats

### OTP signup blocker

Customer mobile OTP flows cannot fully work yet because automated phone or WhatsApp OTP sending is not configured.

Observed live API response:

- `/api/auth/request-otp` returns a `400` with a message saying automated WhatsApp OTP is not configured

What this means:

- Browsing works
- The new mobile-first login and signup UI is in place
- Real customer OTP delivery is blocked until a real provider is connected

### Recommended OTP fix

Use one of these:

- WhatsApp Cloud API
- AiSensy
- Twilio
- Another approved phone OTP provider

Also note:

- Email OTP should be completed through Resend or another configured email provider
- `request-otp` currently creates pending signup rows before both channels are guaranteed to send; this should be tightened if more cleanup issues appear

### Razorpay

Razorpay checkout is implemented for the cart payment option `Pay With UPI / Cards`.

Current flow:

- Frontend loads `https://checkout.razorpay.com/v1/checkout.js`
- Frontend posts cart, coupon, and checkout details to `POST /api/payments/verify?action=create-order`
- Server creates a Razorpay order and stores a pending Supabase order with `razorpay_order_id`
- Razorpay Checkout opens for UPI / cards
- On successful payment, frontend posts the Razorpay payment ID, order ID, and signature to `POST /api/payments/verify`
- Server verifies `razorpay_order_id|razorpay_payment_id`, marks the order paid, stores `payment_id`, and shows `Order Has Been Placed. Congratulations!`

Required before real payment testing:

- Add `RAZORPAY_KEY_ID` locally and in Vercel
- Add `RAZORPAY_KEY_SECRET` locally and in Vercel
- Do not commit either value, and never publish the secret key in README/checkpoints/chat

## Admin login handoff

The live admin dashboard now uses a real owner account stored in Supabase.

Do not commit the owner credentials to GitHub.

On this machine, sensitive owner-access notes are stored locally in:

- [admin-access.txt](</C:/Users/208X1/Documents/New project/iksha-gifts-supabase-commerce/admin-access.txt>)

If another Codex session is running on the same machine, it can read that file.

## Local sensitive files

These are intentionally ignored by Git and should stay out of the repository:

- `admin-access.txt`
- `supabase-project-access.txt`
- `generated-env-to-add.json`

These files contain secrets, deployment values, or private access notes.

If another Codex session needs them and is running on the same machine, it can read them locally.

If the session is not on this machine, the user will need to provide the required secrets again.

## Deployment notes

This repo is connected to Vercel.

Useful local deployment path from this machine:

- Vercel CLI entry used in recent sessions:
  `C:\Users\208X1\Documents\New project 3\.tools\vercel-cli\node_modules\vercel\dist\vc.js`

Typical deploy command used from this repo:

```powershell
& 'C:\Users\208X1\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' 'C:\Users\208X1\Documents\New project 3\.tools\vercel-cli\node_modules\vercel\dist\vc.js' deploy --prod --yes
```

## GitHub sync notes

- Remote repo: `https://github.com/saikumar0484/ikshagifts.shop`
- Local branch: `main`
- Remote branch: `origin/main`
- Git is now installed on this machine and was used to push the current state

If another session continues the project from GitHub, this README should be updated again after each meaningful change or deployment.

## QA history summary

The project has already been tested against the live site several times.

Key confirmed passes:

- Homepage loads correctly
- Product API responds
- Search and category filters work
- Add to cart works
- Guest order creation is correctly blocked behind login
- Admin subdomain resolves
- Security headers are present
- Mobile layout has no horizontal overflow in the tested path

Known live failure during QA:

- New account OTP signup fails because automated phone or WhatsApp OTP is not configured

There is also an older QA artifact in:

- [qa-results.json](</C:/Users/208X1/Documents/New project/iksha-gifts-supabase-commerce/qa-results.json>)

That file reflects an earlier environment state before some later fixes and should not be treated as the latest truth by itself.

## Recommended next tasks

1. Finish customer signup by connecting real email and phone or WhatsApp OTP providers
2. Add owner password change flow inside admin dashboard
3. Add product image optimization with WebP or AVIF
4. Consider local font hosting to reduce external font dependency
5. Add customer address management if full checkout is planned
6. Add explicit admin analytics improvements and export tools if the business starts scaling
7. Add automated smoke tests for admin login, product API, cart, and OTP error states

## How another Codex session should resume

If a future session needs to continue this project, start with this order:

1. Read this README fully
2. Check [src/App.tsx](</C:/Users/208X1/Documents/New project/iksha-gifts-supabase-commerce/src/App.tsx>) and [src/lib/commerce.tsx](</C:/Users/208X1/Documents/New project/iksha-gifts-supabase-commerce/src/lib/commerce.tsx>) for current storefront behavior
3. Check [api/admin.ts](</C:/Users/208X1/Documents/New project/iksha-gifts-supabase-commerce/api/admin.ts>) and [api/\_lib/admin.ts](</C:/Users/208X1/Documents/New project/iksha-gifts-supabase-commerce/api/_lib/admin.ts>) for owner login behavior
4. Check [supabase/schema.sql](</C:/Users/208X1/Documents/New project/iksha-gifts-supabase-commerce/supabase/schema.sql>) for the live table model
5. Read local ignored files only if running on the same machine and only if needed
6. Test the live URLs before making risky changes

## Repo hygiene notes

- This repo currently has no committed `README` before this file
- `node_modules` is ignored
- Sensitive access files are ignored
- `.vercel` is ignored

## Last important reminder

This README is intentionally detailed, but it still does not include secrets, owner passwords, Supabase secret keys, or other sensitive values.

That is deliberate. Use the ignored local files on this machine for those values, not Git.

## Codex working memory

The owner asked Codex to treat this repository as the durable memory for the project. Future Codex sessions should not rely on hidden chat memory alone.

Whenever the owner asks for changes, fixes, deployment work, setup help, or business decisions:

- Read this README and `CODEX_CHECKPOINTS.md` first.
- After meaningful work, update this README or `CODEX_CHECKPOINTS.md` with what changed, what was verified, and any remaining risk.
- Always give the owner a preview link after changes.
- Do not publish, deploy production, or make anything live until the owner explicitly says to go live or publish.
- Keep notes short, practical, and useful for the next session.
- Do not remove older handoff notes unless they are clearly obsolete and replaced with newer truth.
- If a change affects live setup, auth, payments, database, products, admin, or deployment, record it here before finishing.
