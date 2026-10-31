# Furniture Image Editor

React + TypeScript + Vite + Tailwind furniture image branding studio for
Dewan Furniture product photos: add showroom logo, phone-number badge,
watermark, price and cards for Facebook posts / boost ads.

Modules: Hub, Daily Post Editor, Photo Card Studio, Boost Ads, Profile /
Showroom Manager.

## Run

```bash
npm ci
npm run dev        # local development
npm run build      # tsc + vite build
npm run lint       # oxlint
```

## Environment (.env, never commit real keys)

Copy `.env.example` to `.env` and fill in your own values:

- Firebase: `VITE_FIREBASE_*` — if these are missing the app runs in
  local-only mode; there is no demo project any more.
- Cloudinary: `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`
  — use an unsigned preset restricted in the Cloudinary dashboard
  (allowed formats JPG/PNG/WebP, max 10 MB, folder restriction).
  The app also validates type and size before uploading.
- Gemini: `VITE_GEMINI_API_KEY` — optional, only for AI placement.
  The key is sent in a request header, never in the URL and never stored
  in localStorage. Note: a `VITE_` key is still visible in the browser
  bundle, so production use should move Gemini behind a server proxy.

## Deploy

- `firestore.rules` and `storage.rules` in this repo must be deployed to
  Firebase (`firebase deploy --only firestore:rules,storage`) — owner-only
  access, no public writes.
- The app is an SPA; `vercel.json` contains the SPA rewrite.

## Notes

- Prices are never invented: if a filename contains no price, the price
  field is left blank for the user to type.
- A cut price is a manual/auto markup field; the app does not claim a
  "fake regular price" as a real MRP — use a real MRP field when one exists.
