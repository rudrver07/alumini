# ILLUMINATE 2026 — Master Developer Guide & Architecture Specification

**Flagship Entrepreneurship Workshop Platform**  
**The Entrepreneurship Cell, Indian Institute of Technology Bombay (E-Cell, IIT Bombay)**

---

## 1. Executive Summary

**ILLUMINATE** is a premier, production-ready entrepreneurship workshop platform conceptualized by **The Entrepreneurship Cell, IIT Bombay**. The platform is designed to introduce collegiate innovators across India to startup ideation, the Business Model Canvas (BMC), financial modeling, Minimum Viable Product (MVP) construction, and a direct fast-track evaluation pathway to **Eureka!** — Asia's largest business model competition held at IIT Bombay.

This repository provides an enterprise-grade web application with:
- A cinematic, canvas-based, scroll-controlled sequential frame opening animation (powered by GSAP ScrollTrigger and 300 sequential HD frames).
- Complete curriculum fidelity directly matching the official E-Cell IIT Bombay workshop brochure across all 9 sessions, activities, and durations.
- A real registration engine with duplicate email/phone verification, non-restrictive input tolerance, and instant printable participant passes.
- Supabase PostgreSQL integration with an automated persistent local storage fallback.
- Real-time Google Sheets synchronization via Google Cloud Service Account API.
- Live, formatted Excel (.xlsx) and CSV roster generation using `exceljs`.
- A secure administrative operations portal at `/admin` (isolated from public navigation) with SUPER_ADMIN account management and an offline developer CLI credential recovery tool.
- A modular payment gateway adapter ready for one-flag activation.

---

## 2. Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `16.4.2` | Server & Client Components, Route Handlers, Turbopack |
| **UI Library** | React | `19.3.0` | Component composition, Hooks, Canvas management |
| **Styling** | Tailwind CSS | `v4` | Theme variables, obsidian glassmorphism, responsive grid |
| **Animation** | GSAP & ScrollTrigger | `3.15.0` | Scrubbed canvas animation (`scrub: 2.0`, `end: "+=700%"`) |
| **Icons** | Lucide React | `1.58.0` | Clean minimalist UI iconography |
| **Database** | Supabase (PostgreSQL 14+) | `@supabase/supabase-js 2.118` | Cloud relational persistence with RLS policies |
| **Local Fallback** | File-backed JSON Engine | Native Node.js | Zero-dependency local persistence in `.data/db.json` |
| **Excel Engine** | ExcelJS | `4.4.0` | Crimson-themed formatted XLSX binary generation |
| **Google Sync** | Googleapis | `186.0.0` | Google Sheets v4 API service account streaming |
| **Auth & Crypto** | BcryptJS & JsonWebToken | `3.0.3` / `9.0.3` | Salted password hashing and signed HTTP-only cookies |
| **Testing** | Vitest | `4.1.12` | Automated unit, cryptographic, and integration tests |

---

## 3. Directory Structure

```
alumini/
├── .data/                                # Local persistent JSON database store
│   └── db.json                           # Registrations, admins, and audit logs
├── migrations/
│   └── 001_initial_schema.sql            # Supabase PostgreSQL schema with RLS
├── public/
│   ├── animation-frames/                 # 300 sequential HD animation frames (1280x720)
│   ├── audio/
│   │   └── registration-success.wav      # Official one-time registration success voice recording
│   └── frames-manifest.json              # Automated frame catalog & metadata
├── scripts/
│   ├── admin-manager.mjs                 # Secure developer CLI for credential recovery
│   ├── generate-manifest.mjs             # Dynamic frame manifest generator
│   └── seed.mjs                          # Test database seeder with sample attendees
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── login/
│   │   │   │   └── page.tsx              # Secure Admin login portal
│   │   │   └── page.tsx                  # Protected Operations Dashboard (Server Component)
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   ├── export/route.ts       # Live Excel (.xlsx) & CSV streaming endpoint
│   │   │   │   ├── login/route.ts        # Admin login & JWT cookie setter
│   │   │   │   ├── logout/route.ts       # Admin session termination
│   │   │   │   ├── registrations/route.ts# Query, filter, patch status, and delete attendees
│   │   │   │   ├── session/route.ts      # Active session validator
│   │   │   │   ├── sync-sheets/route.ts  # Bulk Google Sheets sync trigger
│   │   │   │   └── users/route.ts        # SUPER_ADMIN user management endpoint
│   │   │   └── register/route.ts         # Public participant registration endpoint
│   │   ├── globals.css                   # Red-and-black design tokens and glass effects
│   │   ├── layout.tsx                    # Root HTML shell with font configuration
│   │   └── page.tsx                      # Public landing page assembling all sections
│   ├── components/
│   │   ├── admin/
│   │   │   └── AdminDashboardClient.tsx  # Rich admin UI, roster table, and KPI analytics
│   │   ├── AboutSection.tsx              # E-Cell IIT Bombay history, awards & mission
│   │   ├── BenefitsSection.tsx           # Accreditation, certificates & startup kits
│   │   ├── ContactSection.tsx            # Workshop leads (Rachit & Abhishek) & SAC HQ
│   │   ├── CurriculumSection.tsx         # Full 9-session structure from brochure
│   │   ├── FAQSection.tsx                # Interactive accordion clarifications
│   │   ├── Footer.tsx                    # Clean footer without public admin links
│   │   ├── MetricsBanner.tsx             # 18,000+ students, 200+ workshops, 15+ states
│   │   ├── Navbar.tsx                    # Glassmorphism header with E-Cell branding
│   │   ├── RegistrationForm.tsx          # Real registration form with confirmation handler
│   │   ├── RegistrationSection.tsx       # Registration container with value guarantees
│   │   ├── RegistrationSuccessModal.tsx  # Animated modal with green checkmark & voice audio
│   │   ├── RequirementsSection.tsx       # College hosting prerequisites from brochure
│   │   └── ScrollCanvasAnimation.tsx     # Canvas scroll scrubbed sequential animation
│   ├── config/
│   │   ├── animation.config.ts           # Cinematic animation scene specifications
│   │   └── event.config.ts               # Single-source-of-truth workshop fee & parameters
│   ├── data/
│   │   └── workshop.ts                   # Official brochure constants and sessions
│   ├── lib/
│   │   ├── auth.ts                       # JWT and Bcrypt session helpers
│   │   ├── db.ts                         # Unified Supabase + Local storage data layer
│   │   ├── excel.ts                      # ExcelJS workbook generation engine
│   │   ├── payment/                      # Modular payment gateway abstraction
│   │   │   ├── index.ts                  # Gateway factory and disabled adapter
│   │   │   └── types.ts                  # Payment interface contracts
│   │   ├── sheets.ts                     # Google Sheets v4 API sync engine
│   │   └── supabase.ts                   # Supabase PostgreSQL client initialization
│   └── types/
│       └── index.ts                      # Core TypeScript interfaces
├── tests/
│   ├── auth.test.ts                      # Password hashing and token validation tests
│   ├── excel.test.ts                     # XLSX buffer and signature verification tests
│   ├── manifest.test.ts                  # Frame catalog and asset integrity tests
│   └── registration.test.ts              # Duplicate check and non-strict field tests
├── .env.example                          # Complete environment variable template
├── .env.local                            # Local development configuration
├── eslint.config.mjs                     # ESLint configuration
├── next.config.ts                        # Next.js configuration
├── package.json                          # Package scripts and dependencies
├── tsconfig.json                         # TypeScript compiler configuration
└── vitest.config.mjs                     # Vitest test runner configuration
```

---

## 4. Canvas Scroll Animation Architecture

The hero sequence employs a custom, high-performance canvas engine synchronized with GSAP ScrollTrigger.

### Parameters Applied (Per Specification)
- **Scrub**: `2.0` (smooth cinematic damping).
- **End Distance**: `+=700%` (delivering a controlled multi-stage scroll journey).
- **Pinning**: `pin: true` on the canvas container.
- **Aspect Ratio Fitting**: Mathematical `"cover"` rendering ensuring no letterboxing or distortion on mobile or ultra-wide desktop monitors.

### Frame Pipeline
1. **Manifest Generation**: `scripts/generate-manifest.mjs` scans `public/animation-frames/` using natural alphanumeric sorting (`ezgif-frame-001.jpg` to `ezgif-frame-300.jpg`). It writes `public/frames-manifest.json` containing total frame count, resolution (`1280x720`), and frame URLs.
2. **Immediate First Paint**: Frame `0` is preloaded and rendered immediately upon component mount, avoiding blank screen latency.
3. **Progressive Batch Preloading**: A concurrent batch queue fetches remaining frames in chunks of 6 using standard image decode pipelines. A subtle bottom meter displays loading progress until the threshold is satisfied.
4. **HiDPI Sharpness**: The canvas coordinates automatically scale by `window.devicePixelRatio` (capped at `2x` for memory efficiency) with `ctx.scale(dpr, dpr)`.
5. **Reduced-Motion Preference**: Users with `prefers-reduced-motion: reduce` are served a static hero rendering of the final stage with direct access to the call-to-action buttons without forced scroll pinning.

### Dynamic Overlays Tied to Scroll Stages
- **Stage 1 (0% – 24%)**: E-Cell IIT Bombay badge, bold "ILLUMINATE" title, "Empowering the next generation of Changemakers".
- **Stage 2 (25% – 49%)**: "From Idea to Viable Enterprise" — 6-hour bootcamp, BMC worksheet, live pitching.
- **Stage 3 (50% – 74%)**: "Fast-Track Pathway to Eureka!" — direct evaluation to IIT Bombay campus.
- **Stage 4 (75% – 100%)**: Grand Finale reveal exposing **Learn More** (scrolls to `#curriculum`) and **Register Now** (scrolls to `#register`).

---

## 5. Official Brochure Workshop Structure

The application reproduces the complete 9-session structure directly from the official E-Cell IIT Bombay brochure:

| # | Session Topic | Duration | Category | Activity Description |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Introduction & Icebreaker | 15 Mins | Foundation | Interactive exercises designed to help participants connect with one another and become acquainted with the speaker. |
| **2** | What is Entrepreneurship | 15 Mins | Foundation | Understanding fundamental aspects of entrepreneurship, including its definition and the reasons behind its importance in today's world. |
| **3** | Team Formation | 15 Mins | Foundation | Organizing participants into teams to facilitate effective engagement and collaboration during future tasks and interactions. |
| **4** | Idea Generation & Problem Identification | 15 Mins | Ideation | Group activity focused on brainstorming and identifying problems, designed to stimulate creative thinking and collaborative problem-solving. |
| **5** | Business Model Canvas (BMC) Workshop | 30 Mins | Strategy | The speaker provides an overview of the key components of the BMC and guides participants on how to fill it for their chosen ideas. |
| **6** | Team Activity: Filling Out BMC | 30 Mins | Strategy | Teams undertake a structured process to identify challenges, devise solutions, and comprehensively complete the BMC. |
| **7** | Finance For Entrepreneurs | 30 Mins | Financials | Understanding financial principles relevant to entrepreneurship, including assessing financial viability and financial planning. |
| **8** | Insights Into Startup Development | 60 Mins | Execution | Understanding how to build startups by developing Minimum Viable Products (MVPs) and Proofs of Concept (POCs). Iterative testing and refinement. |
| **9** | Pitching Workshop & Live QnA | 60 Mins | Pitch | Present your business idea in groups and engage in a Q&A session aimed at improving pitching skills and receiving constructive feedback. |

**Total Duration**: 6 hours (11:00 AM to 6:00 PM including 1-hour lunch & networking break).  
**Participation Fee**: Configurable via `src/config/event.config.ts`, set to **₹699** with the official label **Participation Fee per Student** (marked as pending organizer confirmation; baseline brochure fee ₹799 preserved for historical reference without claiming expired NEC discounts).  
**Hosting Prerequisites**: 1-day hall (100+ seats & PA system), speaker transit pick-and-drop, 5 student coordinators + 1 faculty coordinator, confirmation letter & 50% advance 10 days prior, minimum 70 participants.

---

## 6. Database & Supabase Integration

### Hybrid Dual-Driver Architecture
The database layer (`src/lib/db.ts`) provides seamless enterprise portability:
1. **Cloud Mode (Supabase PostgreSQL)**: Active when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided in `.env.local`. Queries the live PostgreSQL instance with full Row Level Security (RLS).
2. **Local Fallback Mode**: If Supabase credentials are not configured, operations automatically fall back to `.data/db.json`. Registrations, duplicates, admin passwords, and audit logs persist locally.

### Schema (`migrations/001_initial_schema.sql`)
- **`registrations`**: Stores `id` (UUID), `registration_id` (`ILLUM-2026-XXXXXX`), `full_name`, `email`, `phone`, `college`, `department`, `year_of_study`, `city`, `state`, `expectations`, `referral_code`, `status`, `payment_status`, `synced_to_sheets`, `created_at`, `updated_at`.
- **`admins`**: Stores `id`, `email`, `username`, `password_hash` (bcrypt), `role` (`SUPER_ADMIN`, `ADMIN`, `VIEWER`), `is_active`, `last_login_at`.
- **`audit_logs`**: Records operator email, action, target, metadata JSONB, IP address, and timestamp.
- **`system_settings`**: Key-value JSONB table for global configurations.

### Running Migrations in Supabase
1. Open the [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **SQL Editor**.
3. Paste the contents of `migrations/001_initial_schema.sql` and click **Run**.
4. Retrieve your Project URL and `service_role` secret from **Project Settings → API**.

---

## 7. Registration Validation & Success Confirmation Architecture

In accordance with workshop requirements:
- **Duplicate Verification**: The server verifies that no existing record shares the same `email` or `phone`.
- **Lenient Formatting**: Email and phone strings are not subjected to restrictive regex patterns. Numbers with international prefixes (`+91`), dashes, parentheses, or spaces are normalized for duplicate checking while preserving the participant's original input format.
- **Registration ID Format**: Generated using cryptographically secure random alphanumeric characters formatted as `ILLUM-2026-XXXXXX`.
- **Database Persistence**: Registrations are persisted directly into PostgreSQL (or local fallback `.data/db.json`) and remain instantly exportable via the `/admin` Excel generator.

### Success Confirmation Modal & Voice Audio Integration (`src/components/RegistrationSuccessModal.tsx`)
Upon successful database submission and backend confirmation:
- **Audio Asset Location**: The official voice recording is stored at `public/audio/registration-success.wav` and referenced via `EVENT_CONFIG.registrationSuccessAudioPath`.
- **Trigger Condition**: Audio playback is initiated **only from the successful registration handler** in `RegistrationForm.tsx` after the API responds with `res.ok` and confirms database persistence. It is never triggered from a React `useEffect` hook to prevent duplicate or looping execution in React StrictMode.
- **One-Time Playback Guard**:
  - Configured with `audio.loop = false` so the recording finishes and remains silent.
  - Guarded by `sessionStorage.getItem('illum_audio_played_' + registrationId)` ensuring the audio plays **exactly once per successfully completed registration** and does not replay on page refresh, component re-renders, or when the modal closes.
  - Each subsequent, genuinely new registration generates a distinct registration ID and triggers its own one-time confirmation.
- **Audio Stop & Reset on Dismissal**: When the participant clicks the Close button or dismisses the modal, `stopRegistrationSuccessAudio()` immediately pauses the audio and resets `currentTime = 0`.
- **Browser Autoplay Resilience**: Autoplay block exceptions are captured gracefully (`.catch(...)`), ensuring the visual modal and checkmark render and function properly even if audio is restricted by the browser.
- **Popup Visual Elements**:
  - Smooth animated green checkmark with scale-and-fade animation (`@keyframes checkmarkScaleFade`).
  - Heading: **Registration Successful!**
  - Primary Message: **Your initial registration has been done**
  - Supporting Note: *"The ILLUMINATE team will share further details."*
  - Prominent red-gradient **Close** button.
- **Strict Anti-Receipt Policy**: In strict compliance with specifications, the system does **not** generate receipts, PDFs, QR codes, downloadable passes, or invoices, and does **not** redirect participants away from the page.
- **Strict Audio Scope Boundaries**: The confirmation voice audio is never played for validation errors, failed submissions, duplicate entries, or during the website's opening scroll sequence.

---

## 7B. Centralized Event & Fee Configuration (`src/config/event.config.ts`)

All workshop fees, labels, and event metadata are centralized in `src/config/event.config.ts`:
```typescript
export const EVENT_CONFIG: EventConfig = {
  workshopName: 'ILLUMINATE',
  organizer: 'The Entrepreneurship Cell, IIT Bombay',
  participationFee: 699,
  currencySymbol: '₹',
  feeLabel: 'Participation Fee per Student',
  feeStatusNote: 'Special updated participation fee (pending organizer confirmation; baseline brochure fee ₹799 preserved for historical reference).',
  brochureOriginalFee: 799,
  audioPath: '/audio/registration.wav',
  ...
};
```
- **Consistent Propagation**: Consumed across `MetricsBanner.tsx`, `FinalCTA.tsx`, `RegistrationForm.tsx`, `FAQSection.tsx`, `excel.ts`, and `AdminDashboardClient.tsx`.
- **Historical Accuracy**: Baseline brochure fee (₹799) is preserved for historical reference without falsely claiming expired NEC discounts.

## 8. Google Sheets Synchronization Engine

The service (`src/lib/sheets.ts`) uses Google Sheets API v4:
- **Streaming Live Sync**: When a participant registers, a background worker appends their row directly to the target sheet.
- **Bulk Catch-up Sync**: The Admin portal provides a "Trigger Google Sheets Sync" action to batch-upload all unsynced rows.
- **Graceful Failure Tolerance**: If Google Cloud credentials are not configured, registrations continue smoothly; the record is marked `synced_to_sheets = false` and logged for future sync.

### Google Sheets Configuration Steps
1. Create a Google Cloud Project in the [GCP Console](https://console.cloud.google.com).
2. Enable the **Google Sheets API**.
3. Create a **Service Account** and download its JSON key.
4. Share your Google Sheet with the Service Account email with **Editor** permissions.
5. Create a tab named `Registrations` in your sheet.
6. Populate the `.env.local` variables:
   ```env
   GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_SHEET_ID="your_spreadsheet_id_from_url"
   ```

---

## 9. Excel (.xlsx) Export Engine

Located at `src/lib/excel.ts` and triggered via `/api/admin/export?format=xlsx`:
- Built with `exceljs` to generate native binary OpenXML workbooks.
- **Design Tokens**: Styled with E-Cell IIT Bombay's Crimson Red (`#991B1B` fill, bold white text) header banner.
- **Worksheets**:
  1. `Participants`: Formatted tabular data, auto-width columns, zebra striping, frozen header pane, and status color coding (green for confirmed, amber for pending, red for cancelled).
  2. `Summary KPIs`: Calculated totals, confirmed count, unique colleges, geographic reach, and estimated registration revenue.
- Also supports raw CSV export via `?format=csv`.

---

## 10. Security & Admin Portal

### Operational Access
- **Endpoint**: `/admin` (Redirects to `/admin/login` if unauthenticated).
- **Navigation Isolation**: Kept completely out of public header and footer links.
- **Authentication**: Signed JSON Web Tokens (JWT) stored in HTTP-only, `SameSite=Strict`, `Secure` cookies (`illuminate_admin_token`).
- **Initial Super Admin**:
  - Email: `admin@ecell.in`
  - Default Password: `Illuminate@IITB2026#Secure`

### Developer-Only CLI Password Recovery (No Public Backdoor)
To prevent security vulnerabilities, there is **no public password reset endpoint**. Administrators must be managed or recovered directly through the server CLI:
```bash
# Reset password via CLI arguments
npm run admin:reset-password -- --email admin@ecell.in --password "YourNewSecurePassword2026!"

# Interactive prompt mode
npm run admin:reset-password
```
The command automatically updates the bcrypt salt and hash in the database, timestamps the change, and writes an audit log entry.

### Role-Based Access Control (RBAC)
- **`SUPER_ADMIN`**: Full permissions including participant management, exports, Google Sheets sync, and creating/deleting admin accounts.
- **`ADMIN`**: Participant roster management, status updates, and Excel exports.
- **`VIEWER`**: Read-only access to analytics and participant rosters.

---

## 11. Modular Payment Gateway Interface

The payment architecture (`src/lib/payment/`) provides a clean adapter pattern:
- **Current State**: Operating in `DISABLED` / `RESERVATION` mode with `NEXT_PUBLIC_ENABLE_PAYMENTS=false`.
- **Payment Gateway Interface (`IPaymentGateway`)**:
  - `isEnabled(): boolean`
  - `createOrder(params: CreateOrderParams): Promise<PaymentOrder>`
  - `verifyPayment(params: VerifyPaymentParams): Promise<PaymentVerificationResult>`
- **Activation Guide**: To activate Razorpay, Stripe, or Cashfree in production:
  1. Set `NEXT_PUBLIC_ENABLE_PAYMENTS=true` in `.env.local`.
  2. Provide `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
  3. The factory in `src/lib/payment/index.ts` automatically switches from `DisabledPaymentGateway` to `RazorpayPaymentGateway`.

---

## 12. Local Development & Testing Workflow

### 1. Prerequisites
- Node.js `18.18+` or `20+` (Tested on Node `25.9.0`)
- npm `9+` (Tested on npm `11.12.1`)

### 2. Environment Setup
```bash
cp .env.example .env.local
```

### 3. Generate Frame Manifest
```bash
npm run generate:manifest
```

### 4. Seed Test Data (Optional)
```bash
npm run seed
```

### 5. Run Automated Tests
```bash
npm run test
```
Runs 10 automated unit and integration tests covering duplicate detection, non-strict inputs, Excel buffer headers, JWT tokens, and frame asset existence.

### 6. Linting & Type Checking
```bash
npm run lint
```

### 7. Production Build Validation
```bash
npm run build
```

### 8. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for the public landing page, or [http://localhost:3000/admin](http://localhost:3000/admin) for the admin portal.

---

## 13. Production Deployment Guide (Vercel)

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Import the repository in [Vercel](https://vercel.com).
3. In the Vercel project settings, configure the **Environment Variables**:
   - `JWT_SECRET` (Minimum 32 characters)
   - `ADMIN_INITIAL_EMAIL` (e.g. `admin@ecell.in`)
   - `ADMIN_INITIAL_PASSWORD` (Strong administrative passphrase)
   - `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID`
   - `NEXT_PUBLIC_ENABLE_PAYMENTS` (`false`)
4. Trigger the deployment.
5. In your custom domain DNS, map your domain to Vercel (e.g. `illuminate.ecell.in`).

---

---

## 14. Audio Architecture & Voice Confirmation Engine

### 1. Dual-Engine Audio Controller (`src/lib/audio-controller.ts`)
To overcome browser autoplay policies and transient user-activation loss during asynchronous database operations, the platform implements a dual-engine audio controller combining the **Web Audio API** and **HTMLAudioElement**:
- **Synchronous Pre-Unlock**: Calling `audioController.unlockOnUserGesture()` synchronously inside the `handleSubmit` click handler immediately unlocks or resumes the browser's `AudioContext`. When the asynchronous `POST /api/register` network request completes, the `AudioContext` is already primed and active, avoiding autoplay blocks (`NotAllowedError`).
- **Exact WAV Voice Recording**: The voice confirmation audio (`/audio/registration-success.wav`) is the original 3.72-second recording stating *"Your initial registration has been done."* (24kHz mono PCM, 178,604 bytes). It is decoded into an in-memory `AudioBuffer` on page mount for instantaneous playback upon backend confirmation.
- **Strict One-Time Playback Guard**: Playback is gated by `sessionStorage.getItem('illum_audio_played_${registrationId}')` and component unmount cleanup. The audio never replays on re-renders, modal close, page refresh, or duplicate submission attempts.
- **Interactive Fallback Button**: If browser low-power mode or tab-background policy blocks the audio context, the success modal dynamically displays the interactive control: `Tap to hear confirmation`, allowing the user to trigger immediate playback with an explicit gesture.
- **Background Music Ducking**: The platform broadcasts window events `illuminate:voice-playback-start` and `illuminate:voice-playback-end`. `BackgroundAudio.tsx` ducks ambient background music by 80% (to 0.2x volume) while the voice confirmation is speaking, restoring background volume naturally once the voice ends.

---

## 15. Complete Stability & Security Audit Summary

| Check / Domain | Implementation / Fix | Status |
| :--- | :--- | :--- |
| **Registration Confirmation** | Exact copy: *"Your initial registration has been done"*, animated green checkmark, supporting copy, no receipts/PDFs/QRs | **VERIFIED & WORKING** |
| **One-Time Confirmation Audio** | Web Audio API pre-unlocking, sessionStorage idempotency, stop on modal close, no loop, no replay | **VERIFIED & WORKING** |
| **Audio Ducking Coordination** | Background music ducks volume to 20% during voice confirmation playback and restores on end | **VERIFIED & WORKING** |
| **Duplicate Submission Debounce** | Synchronous `isSubmittingRef` lock prevents duplicate network requests on rapid repeated submit clicks | **VERIFIED & WORKING** |
| **Supabase 23505 Error Handling** | Catches Postgres unique constraint violations on email/phone and prevents fallback store duplicates | **VERIFIED & WORKING** |
| **Formula Injection (CWE-1236)** | All Excel (`.xlsx`) and CSV export strings starting with `=`, `+`, `-`, `@`, `\t`, `\r` sanitized with `'` prefix | **VERIFIED & WORKING** |
| **TypeScript Validation** | `npx tsc --noEmit` executed with 0 errors | **0 ERRORS** |
| **ESLint Validation** | `npm run lint` executed with 0 errors and 0 warnings | **0 ERRORS / 0 WARNINGS** |
| **Vitest Automated Suite** | 6 test files, 23 out of 23 test scenarios passing (including 10 Phase 9 audit tests) | **23 / 23 PASSING** |
| **Production Build** | `next build` with Turbopack succeeded in 2.4s, generating all 12 routes cleanly | **BUILD CODE 0** |
| **Live Browser Verification** | End-to-end verified via browser subagent covering registration, modal, audio, and admin dashboard | **VERIFIED** |

