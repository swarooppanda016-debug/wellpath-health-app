# WellPath Ultimate V4

Mobile-first wellness education app with a local starter catalog plus optional live WHO ICD-11 2026 search.

## V4 upgrades
- WHO ICD-11 API search through a server-side Next.js route (credentials never shipped to the browser).
- WHO entity lookup API route foundation.
- Persistent profile + local data storage.
- Accessible form controls and labels.
- Responsive dashboard, condition library, daily plan, tracker, medication/allergy list, safety center, and PWA manifest.
- Local catalog remains usable when WHO credentials are not configured.

## WHO API setup
Create ICD API credentials at the WHO ICD API portal, then set `WHO_ICD_CLIENT_ID` and `WHO_ICD_CLIENT_SECRET` in Vercel Project Settings → Environment Variables. The app uses OAuth client credentials and the WHO ICD API v2.

WHO documentation: https://icd.who.int/docs/icd-api/

## Important
This is an educational wellness product, not a diagnostic or treatment tool. Do not add medication dosing or emergency-care substitutions.
