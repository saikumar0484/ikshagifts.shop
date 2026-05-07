# iksha gifts Developer Handoff

Date: 2026-05-07

Cloud preview:

```text
https://ikshagiftsshop-main.vercel.app
```

Local project folder:

```text
C:\Users\Admin\Documents\New project 2\ikshagifts.shop-main
```

## What Changed From First To Now

- Extracted and stabilized the original zip project into a working Vite + React + TypeScript storefront.
- Fixed the TypeScript compile blocker in commerce auth payload typing.
- Added/cleaned product categories for:
  - `men`
  - `women`
  - `customized_gifts`
- Added 13 placeholder products with title, image, description, price `₹5000`, MRP `₹6000`, and cart links.
- Homepage changes:
  - Removed `Thoughtful gifting, sorted beautifully.`
  - Changed collection line to `Gift For Men`, `Gift For Women`, `Customized Gifts`.
  - Removed `/` separators.
  - Added light/dark active style when clicking category buttons.
  - Removed order-window text.
  - Removed delivery/premium packing/custom slots badges.
  - Reduced product and hero visual sizing.
  - Removed Gallery section.
  - Removed Featured label/section and moved products into Best Sellers.
  - Kept reviews and gift-experience cards in 4-column desktop layout.
  - Removed Our Story/crafted section.
- Collection page changes:
  - Removed old custom gifting intro text.
  - Made customer-care text smaller and bolder.
  - Made legal policy text smaller.
- Cart and checkout changes:
  - Added coupon input.
  - Added coupon `IKSHA150` with `₹150` discount.
  - Changed checkout button to `Place Your Order`.
  - Added checkout form fields:
    - Name
    - Mobile Number
    - Address
    - Pin Code
    - Payment option
  - Payment option now shows `Pay With UPI / Cards` first.
  - `Cash on delivery` is last.
  - Success message is `Order Has Been Placed. Congratulations!`
- Supabase changes:
  - Connected Supabase project `itrpsxjdtvfqhgacozsm`.
  - Applied tables from `supabase/schema.sql`.
  - Seeded 13 products.
  - Added checkout/order fields:
    - `subtotal_amount`
    - `discount_amount`
    - `coupon_code`
    - `payment_method`
    - `customer_name`
    - `customer_phone`
    - `shipping_address`
    - `pin_code`
    - `razorpay_order_id`
- Admin dashboard changes:
  - Admin order cards now show checkout/customer details.
  - Added CSV export support for orders.
- Razorpay changes:
  - Implemented Razorpay order creation inside `POST /api/payments/verify?action=create-order`.
  - Implemented Razorpay signature verification inside `POST /api/payments/verify`.
  - Frontend loads Razorpay checkout and opens payment for `Pay With UPI / Cards`.
  - Order is marked paid only after signature verification.
  - Razorpay still needs real keys before payment testing:
    - `RAZORPAY_KEY_ID`
    - `RAZORPAY_KEY_SECRET`
- Deployment:
  - Vercel preview alias deployed successfully:
    - `https://ikshagiftsshop-main.vercel.app`
  - This is a preview/project alias, not guaranteed to be the real final `ikshagifts.shop` production domain.

## Important Secrets Not Included

The zip does not include `.env.local`, Vercel project metadata, or private keys.

Developer must create `.env.local` from `.env.example` and fill:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SESSION_SECRET
ADMIN_PASSWORD
ADMIN_API_KEY
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
```

Do not commit real secrets to GitHub.

## How To Run

```powershell
npm install
npm.cmd run build
npm.cmd run lint
npm.cmd run dev
```

## Important Files

- `README.md` - long project memory and setup notes.
- `CODEX_CHECKPOINTS.md` - chronological work log.
- `supabase/schema.sql` - database schema and product seed data.
- `src/lib/commerce.tsx` - cart, checkout, Razorpay frontend flow.
- `src/components/site/CartDrawer.tsx` - checkout form and payment options.
- `api/orders.ts` - non-online order creation.
- `api/payments/verify.ts` - Razorpay create-order and verify flow.
- `src/admin/AdminDashboard.tsx` - admin dashboard and order export.

## Verification Completed

```powershell
npm.cmd run build
npm.cmd run lint
```

Result:

- Build passed.
- Lint passed with 0 errors.
- Existing Fast Refresh warnings remain in UI utility files.
- Cloud homepage returned HTTP 200.
- Cloud products API returned 13 products.
