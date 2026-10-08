# WellPath Ultimate V5

Mobile-first wellness education app with condition planning, WHO ICD-11 search, progress tracking, safety information, and a local doctor finder.

## Features
- Condition/disease starter library plus WHO ICD-11 2026 search
- Personalized daily wellness planning
- Local progress tracking, medication list and allergy list
- Safety center and appointment preparation
- **Find doctors**: enter a locality/address + Indian 6-digit PIN; the app maps selected conditions to relevant specialties and searches nearby healthcare providers
- PWA-ready responsive UI

## Doctor Finder setup
The doctor finder uses Google Maps Platform Places API (New) and Geocoding. Create a Google Cloud project, enable **Places API (New)** and **Geocoding API**, configure billing, and create a restricted server API key.

Add this environment variable in Vercel:

`GOOGLE_MAPS_API_KEY=...`

Do not expose this key as `NEXT_PUBLIC_*`. The app calls Google from the server route `/api/doctors/search`.

Google recommends restricting API keys to the required APIs and appropriate server application restrictions.

## WHO ICD-11
Add `WHO_ICD_CLIENT_ID` and `WHO_ICD_CLIENT_SECRET` in Vercel if you want the live WHO search.

## Medical safety
This is an educational wellness application, not a diagnostic or treatment tool. Doctor listings are third-party directory results and must be independently verified by the user. Do not rely on the app for emergency care, diagnosis, prescriptions, or medication dosing.
