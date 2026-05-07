# PRIVATE SECRET HANDOFF

This folder intentionally includes private local environment data because the owner requested a full handoff for another Codex/developer.

Important:
- Do not upload this zip publicly.
- Do not commit `.env.local` to GitHub.
- Do not share the Supabase service role key publicly.
- Razorpay keys still need to be added if they are not present in `.env.local`.

Use `.env.local` for local development and copy the same required values into Vercel/Supabase deployment settings when going live.
