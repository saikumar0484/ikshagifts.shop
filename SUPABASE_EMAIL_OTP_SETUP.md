# Supabase Email OTP Setup

This project uses free Supabase Email OTP for customer login. The frontend and API bridge are already wired for OTP codes, but Supabase must send the code in the email template.

## Required Dashboard Settings

Open the Supabase project dashboard:

```text
https://supabase.com/dashboard/project/itrpsxjdtvfqhgacozsm
```

Then check:

1. Authentication -> Providers -> Email
2. Enable Email Provider
3. Enable Confirm Email
4. Authentication -> Email Templates -> Magic Link
5. Replace link-only content with a visible OTP token.

Use this simple template body:

```html
<h2>Your iksha gifts login code</h2>
<p>Enter this code on the website:</p>
<p style="font-size: 28px; font-weight: 700; letter-spacing: 4px;">{{ .Token }}</p>
<p>This code is for logging in to iksha gifts.</p>
```

Important: if the template only uses `{{ .ConfirmationURL }}`, the customer may receive a login link but no visible OTP code to type into the website.

## Current App Behavior

- Login/register asks for First Name and Email Address.
- Send OTP calls Supabase Auth `signInWithOtp`.
- Verify OTP calls Supabase Auth `verifyOtp` with `type: "email"`.
- After verification, the app syncs the Supabase session to the existing server session and redirects to `/account`.
- `/account` shows My Orders, Profile, and Logout.

## Troubleshooting

If the customer says the OTP is not coming:

1. Check spam/promotions folder.
2. Check Supabase Auth logs for `POST /otp` and `mail.send`.
3. If logs show `mail_type: magic_link`, the email was sent by Supabase.
4. If the email arrived but has no code, update the Magic Link template to include `{{ .Token }}`.
5. Local development needs these variables in `.env.local` before starting Vite:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

