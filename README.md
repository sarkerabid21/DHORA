# DHORA — AI-Powered Personal Wardrobe & Fashion Lifestyle Mobile Application

> *"Style-ta Dhoro, Nijer Moto Cholo"*

DHORA is a complete, production-grade AI-powered personal wardrobe management and fashion lifestyle application built with **React Native (Expo Router v4, TypeScript)** on the frontend and **Node.js + Express + TypeScript + MongoDB** on the backend, featuring Google Gemini AI integration via the official `@google/genai` SDK.
link: https://dhora-dhora-mobile.vercel.app/
---

## 🌟 Key Functional Pillars

1. **Digital Wardrobe (My Closet)**
   - Upload clothes via camera/gallery.
   - Multimodal Gemini AI recognition detecting category, primary & secondary colors, patterns, and style attributes.
   - Granular status management: *Available*, *In Laundry*, and *Unavailable*.
   - Item detail pages with wear count, cost-per-wear tracking, and outfit combination history.

2. **AI Wardrobe Builder & Personal Stylist**
   - **Strict Grounding Invariant:** AI outfit combinations use **only real clothing item IDs owned and marked Available by the user**. The AI is strictly barred from hallucinating non-existent items.
   - Dhaka & regional real-time weather integration (temperature, condition, humidity, rain probability) that conditions daily recommendations.
   - 5 Occasion Collections: Casual, University, Office, Weekend, and Festive Occasion.
   - Interactive conversational stylist chat answering context-aware Bangladeshi styling questions.
   - Saved Looks library with user feedback loop (like/dislike/regenerate).

3. **Outfit Planner & Wardrobe Intelligence**
   - Interactive calendar with 7-day strip and month grid.
   - Laundry conflict detection: warns if an outfit contains an item currently in laundry.
   - "Confirm Worn Today" workflow: auto-updates item wear counter and recalculates Cost-Per-Wear (CPW = Purchase Price / Times Worn).
   - Insights dashboard: Category & color distribution breakdown, 30-day wear frequency, wardrobe gap analysis, and repetition alerts.
   - Trip Capsule Matrix Planner: builds weather-smart packing capsules with versatile cross-combination rules.

4. **Marketplace & Peer-to-Peer Clothing Rentals**
   - Direct shopping with regional Bangladeshi fashion brands (Aarong, Yellow, Sailor, Klothe) with affiliate redirects.
   - Before-You-Buy AI evaluator: checks prospective clothes against current wardrobe to calculate versatility score, new outfit combinations, and prevent duplicate purchases.
   - Peer-to-peer fashion rentals with security deposit escrow, 4-step booking stepper (`REQUESTED` → `CONFIRMED` → `PICKED_UP` → `RETURNED`), and digital condition inspection reports.

5. **Community Buy (Bulk Orders & Delivery Fee Sharing)**
   - Time-limited countdown group buys (1h, 2h, 4h, 8h, 24h) auto-locking upon expiration.
   - **Strict Invariant 1:** Thread comments ask questions only; orders are created solely via verified Join Order form submission.
   - **Strict Invariant 2:** Public safety guarantee — only verified public meetup locations (mall gates, metro exits, university campuses); never private home addresses.
   - Encrypted unique collection tokens (`DHR-XXXX-Y`) with mobile pickup verification pass.

6. **Design System & Theme Engine**
   - Premium, modern, minimal Bangladeshi fashion aesthetic.
   - Full **Light and Dark theme** engine with live toggle in user profile.
   - Reusable UI kit: `Button`, `Input`, `Card`, `Badge`, `Header`, `Skeleton`, `EmptyState`, `CountdownTimer`, `JoinOrderModal`, `PickupQrModal`, and `BookingStepper`.

---

## 🏗️ Architecture & Project Structure

```
dhoro/
├── dhora-backend/               # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── config/              # Environment config & MongoDB connection
│   │   ├── controllers/         # REST API business logic
│   │   │   ├── auth.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── clothing.controller.ts
│   │   │   ├── stylist.controller.ts
│   │   │   ├── planner.controller.ts
│   │   │   ├── insights.controller.ts
│   │   │   ├── beforeYouBuy.controller.ts
│   │   │   ├── trip.controller.ts
│   │   │   ├── shopping.controller.ts
│   │   │   ├── rental.controller.ts
│   │   │   ├── communityBuy.controller.ts
│   │   │   ├── communityComment.controller.ts
│   │   │   └── notification.controller.ts
│   │   ├── middleware/          # JWT auth, Zod validation, error handler
│   │   ├── models/              # Mongoose database models (34 schemas)
│   │   ├── routes/              # Express API route definitions
│   │   ├── services/            # Gemini AI service (@google/genai) & Weather API
│   │   └── server.ts            # Main application entry point
│   ├── package.json
│   └── tsconfig.json
│
└── dhora-mobile/                # React Native + Expo Router v4 Mobile App
    ├── app/                     # File-based navigation routes
    │   ├── _layout.tsx          # Root provider & auth gate
    │   ├── (onboarding)/index.tsx # 3-slide value-prop walkthrough
    │   ├── (auth)/              # Login, register, forgot-pwd, profile-setup
    │   ├── (tabs)/              # 5-item bottom tab navigation
    │   │   ├── index.tsx        # Personal Fashion Dashboard (Weather & Daily Look)
    │   │   ├── wardrobe.tsx     # My Digital Closet (Filter & AI Upload)
    │   │   ├── stylist.tsx      # Central AI Stylist (Builder & Chat)
    │   │   ├── planner.tsx      # Calendar, Conflict Checks & Log Worn
    │   │   └── discover/        # Shopping, Rent, Community Buy, Before-Buy
    │   ├── item/[id].tsx        # Wardrobe Item Details & Cost-Per-Wear
    │   ├── outfit/saved.tsx     # Saved AI Looks Library
    │   ├── insights/index.tsx   # Wardrobe Analytics & Gap Detector
    │   ├── trip/index.tsx       # Trip Capsule Matrix Planner
    │   ├── rental/[id].tsx      # Rental Listing & Booking Request
    │   ├── rental/manage-bookings.tsx # Condition Inspection & Stepper
    │   ├── community/[id].tsx   # Group Order Countdown & Discussion
    │   ├── community/create.tsx # Launch Community Buy Post
    │   ├── community/my-orders.tsx # Pickup Passes & Collection Tokens
    │   ├── notifications/index.tsx # Notification Center
    │   └── profile/index.tsx    # User Profile, Theme Switcher & Security
    ├── src/
    │   ├── components/          # Reusable design system & domain modals
    │   ├── constants/           # Theme colors (Light & Dark), spacing, radius
    │   ├── services/            # Axios API client with bearer token injector
    │   ├── stores/              # Zustand global state stores
    │   └── types/               # TypeScript data definitions
    ├── package.json
    └── app.json
```

---

## 📡 Complete REST API Endpoint Directory

### Authentication & User Management
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new account with password hash |
| `POST` | `/api/auth/login` | Login with email and password (returns JWT) |
| `POST` | `/api/auth/forgot-password` | Generate reset token |
| `POST` | `/api/auth/reset-password` | Set new password with verified token |
| `GET` | `/api/users/me` | Fetch user profile & style preferences |
| `PATCH` | `/api/users/profile` | Update user location, name, or phone |
| `PUT` | `/api/users/change-password` | Change password with current credential check |
| `DELETE` | `/api/users/me` | Delete user account & associated data |

### Digital Wardrobe (`/api/wardrobe`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/wardrobe/recognize` | AI clothing recognition via Gemini |
| `GET` | `/api/wardrobe` | List user wardrobe items with category filters |
| `POST` | `/api/wardrobe` | Save new confirmed clothing item |
| `GET` | `/api/wardrobe/:id` | Get item details, wear count, and combinations |
| `PUT` | `/api/wardrobe/:id` | Update item properties |
| `PATCH` | `/api/wardrobe/:id/status` | Update status (`AVAILABLE`, `IN_LAUNDRY`, `UNAVAILABLE`) |
| `PATCH` | `/api/wardrobe/:id/favorite` | Toggle favorite status |
| `DELETE` | `/api/wardrobe/:id` | Remove wardrobe item |

### AI Stylist & Outfits (`/api/stylist`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/stylist/today-outfit` | Weather-informed grounded daily recommendation |
| `POST` | `/api/stylist/generate-grounded` | Generate 5 collections from owned items |
| `POST` | `/api/stylist/chat` | Conversational styling advice grounded in closet |
| `POST` | `/api/stylist/save-look` | Bookmark generated outfit to saved looks |
| `GET` | `/api/stylist/saved-looks` | List user's saved outfit combinations |
| `DELETE` | `/api/stylist/saved-looks/:id` | Remove outfit from saved collection |
| `POST` | `/api/stylist/feedback` | Record like/dislike feedback on generated outfit |

### Planner & Wardrobe Intelligence
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/planner` | Get calendar outfit entries for date range |
| `POST` | `/api/planner` | Schedule outfit with laundry conflict validation |
| `POST` | `/api/planner/:id/confirm-worn`| Log worn today, increment wear counter, update CPW |
| `GET` | `/api/insights/stats` | Cost-per-wear stats, gap detector & repetition alerts |
| `POST` | `/api/before-you-buy/evaluate` | Versatility matrix against owned wardrobe |
| `GET` | `/api/trip/plans` | Fetch user trip capsule packing matrices |
| `POST` | `/api/trip/plans` | Create new multi-day trip packing capsule |

### Fashion Shopping & Rentals
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/shopping/products` | Browse catalog products with category filter |
| `GET` | `/api/rentals/listings` | Browse peer rental listings |
| `POST` | `/api/rentals/bookings` | Create 4-day or 7-day rental booking |
| `GET` | `/api/rentals/bookings/my` | View user's active and past rental bookings |
| `PUT` | `/api/rentals/bookings/:id/status`| Update booking stepper progress |
| `POST` | `/api/rentals/condition-reports`| Submit digital inspection checklist & photos |

### Community Buy (`/api/community-buy`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/community-buy` | Live group buy feed with auto-close check |
| `POST` | `/api/community-buy` | Launch group buy with designated public venue |
| `GET` | `/api/community-buy/my-orders` | Fetch user group orders & pickup tokens |
| `GET` | `/api/community-buy/:id` | Group buy details, progress & orders count |
| `POST` | `/api/community-buy/:id/join` | Join group order (generates unique `DHR-XXXX-Y`) |
| `POST` | `/api/community-buy/verify-code`| Host verifies token handoff upon collection |
| `GET` | `/api/community-buy/:postId/comments` | Fetch discussion comments & replies |
| `POST` | `/api/community-buy/:postId/comments` | Post question (explicit invariant notice) |

### Notifications (`/api/notifications`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/notifications` | Fetch notifications with unread counter |
| `PUT` | `/api/notifications/:id/read` | Mark single notification as read |
| `PUT` | `/api/notifications/mark-all-read` | Mark all notifications as read |
| `DELETE` | `/api/notifications/:id` | Remove notification |

---

## 🚀 Running the Project Locally

### 1. Backend (`dhora-backend`)
```bash
cd dhora-backend

# Install dependencies
npm install

# Configure environment variables in .env:
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/dhora_db
# JWT_SECRET=dhora_super_secret_jwt_key_2026
# GEMINI_API_KEY=your_google_ai_studio_gemini_api_key

# Build TypeScript
npm run build

# Start development server
npm run dev
```

### 2. Mobile App (`dhora-mobile`)
```bash
cd dhora-mobile

# Install dependencies
npm install

# Verify TypeScript types
npx tsc --noEmit

# Start Expo development server
npx expo start
```

---

## 🔒 Security & Privacy Guarantees
- **No Hallucinated Outfits:** Outfits only contain items the user has photographed and uploaded.
- **Community Safety:** Pickup points are strictly limited to designated well-lit public spots; no user addresses are collected or shared.
- **Separation of Discussion and Ordering:** Discussion comments can never be interpreted as an order commitment.
- **Credential Protection:** Gemini AI keys are isolated exclusively inside the Node.js backend.
