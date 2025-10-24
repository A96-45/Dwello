# Dwello — Smart Renting & Landlord Suite (Expo + TypeScript)

Dwello is a modern, mobile-first rental platform for tenants and landlords built with Expo Router and TypeScript. It focuses on delightful UX, real-world Kenya-ready flows (M‑Pesa), smart parking, and data‑driven landlord analytics.

## Highlights
- ✅ Tenant rent payments with M‑Pesa (mock STK flow)
- ✅ Landlord analytics visible by default on Home
- ✅ SmartPark: landlords register vehicles, tenants scan to access
- ✅ Tinder‑style swipe browsing for properties (infinite deck feel)
- ✅ Clean, responsive UI with haptics, badges, and rich cards

## Screens
- **Home (Tenant)**: Tinder‑like property cards, filters, save/double‑tap, map/calendar access
- **Home (Landlord)**: Instant analytics dashboard (revenue, views, inquiries, occupancy, ratings)
- **Pay Rent (Tenant)**: Select property, auto‑synced landlord payment details, M‑Pesa payment
- **SmartPark**: 
  - Landlord: Register and manage vehicles; view history
  - Tenant: Big “Scan” access button; scanning via camera
- **Property Details**: Rich media, amenities, landlord info, reviews and tours

## M‑Pesa Payments (Mock)
- Auto‑syncs landlord’s Paybill/Till + account from settings
- Validates phone input (Kenya format)
- Simulates STK push and displays a success reference

Files:
- `app/(tabs)/post.tsx` — Tenant “Pay Rent” page
- `mocks/payments.ts` — `MOCK_PAYMENT_SETTINGS`, `MOCK_PAYMENTS`

## SmartPark (Role‑Based)
- Landlords register vehicles (OCR scanner mock) and view history
- Tenants primarily scan to access
- Always‑visible floating scan button for quick entry

Files:
- `app/smartpark.tsx`
- `components/OCRScanner.tsx`

## Landlord Analytics
- Replaces landlord home with a true analytics overview
- Metrics: revenue, properties, views, inquiries, occupancy, rating

Files:
- `app/(tabs)/index.tsx`
- `components/AnalyticsCard.tsx`

## Tinder‑Style Swipe UX
- Smooth pan gestures with haptic feedback
- Like/Nope overlay labels
- Infinite feel through an extended mock dataset

Files:
- `components/PropertyCard.tsx`
- `mocks/properties.ts`

## Tech Stack
- Expo 53, Expo Router 5, React Native 0.79, TypeScript 5
- Haptics, Camera, Linear Gradient, Safe Area Context
- Lucide icons, NativeWind (optional styling), react‑native‑maps

## Run Locally
1) Install deps
```bash
npm install
```
2) Start the app
```bash
npm run start   # or: npm run start-tunnel
```
3) Open on device or emulator via Expo

## Demo Script (2–3 minutes)
1) Open app as Tenant:
   - Home: swipe through property cards (see Like/Nope overlays)
   - Pay Rent tab: select a property, confirm synced M‑Pesa details, pay (mock)
2) Switch to Landlord:
   - Home: see analytics immediately, no extra click
   - SmartPark: use scanner to register a vehicle (mock)

## Notes for Judges
- Payment flow uses mock M‑Pesa STK for a safe, offline demo
- Role awareness drives UI: tenants vs landlords
- Data is mocked for speed; the code is structured for API integration

## License
MIT
