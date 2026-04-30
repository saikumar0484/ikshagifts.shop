# iksha gifts commerce handoff

This repository powers the live iksha gifts storefront and admin dashboard.

The goal of this README is not marketing. It is a working handoff so another Codex session, another engineer, or future-you can continue the project quickly if the current session hits rate limits or loses context.

## Live URLs

- Storefront: `https://ikshagifts.shop`
- Admin dashboard: `https://admin.ikshagifts.shop`
- Current production deployment alias target during the latest update: `https://iksha-gifts-supabase-commerce-clxzq6bzp.vercel.app`

## What this project is

This is a Vite + React + TypeScript ecommerce-style site for a handmade crochet brand.

It includes:

- A public storefront with product browsing, category filtering, search, cart, legal policies, and order-request flow
- A customer account system using server-side API routes and Supabase tables
- An admin dashboard on the `admin.` subdomain
- Supabase-backed products, customers, orders, sessions, pending signups, rate limits, integrations, admin users, and admin sessions
- WhatsApp and email integration settings stored in Supabase with encrypted secrets

## Current status

The store is live and usable for guest browsing, cart actions, and admin management.

What is working:

- Storefront UI and product catalog
- Cart drawer and guest checkout gate
- Customer login endpoint
- Order tracking UI and admin order status workflow
- Admin dashboard on `admin.ikshagifts.shop`
- DB-backed owner login for the admin dashboard
- Supabase-backed products, customers, orders, integration settings, and admin sessions
- Security headers via `vercel.json`

What is not fully finished yet:

- Customer signup OTP flow is blocked because automated phone or WhatsApp OTP is not configured
- Razorpay is intentionally paused until business-side verification is complete
- There is no in-app admin password change screen yet
- Image optimization can still be improved further with WebP or AVIF and possibly local font hosting

## Latest major work completed

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

- [api/_lib/session.ts](</C:/Users/208X1/Documents/New project/iksha-gifts-supabase-commerce/api/_lib/session.ts>)
- [api/_lib/admin.ts](</C:/Users/208X1/Documents/New project/iksha-gifts-supabase-commerce/api/_lib/admin.ts>)
- [api/_lib/otp.ts](</C:/Users/208X1/Documents/New project/iksha-gifts-supabase-commerce/api/_lib/otp.ts>)
- [api/_lib/integrations.ts](</C:/Users/208X1/Documents/New project/iksha-gifts-supabase-commerce/api/_lib/integrations.ts>)
- [api/_lib/security.ts](</C:/Users/208X1/Documents/New project/iksha-gifts-supabase-commerce/api/_lib/security.ts>)
- [api/_lib/db.ts](</C:/Users/208X1/Documents/New project/iksha-gifts-supabase-commerce/api/_lib/db.ts>)

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

Customer signup cannot complete yet because phone OTP sending is not configured.

Observed live API response:

- `/api/auth/request-otp` returns a `400` with a message saying automated WhatsApp OTP is not configured

What this means:

- Browsing works
- Login works for existing customers
- New customer self-service signup is blocked until a real provider is connected

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

Razorpay is intentionally skipped for now because business-side verification is still pending.

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
3. Check [api/admin.ts](</C:/Users/208X1/Documents/New project/iksha-gifts-supabase-commerce/api/admin.ts>) and [api/_lib/admin.ts](</C:/Users/208X1/Documents/New project/iksha-gifts-supabase-commerce/api/_lib/admin.ts>) for owner login behavior
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
