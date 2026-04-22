# DivulgeAI — AI-Powered Dental Caries Detection

A production-ready React web application for AI-assisted dental diagnostics.
Upload RVG radiographs and receive instant clinical-grade caries detection reports powered by Claude Vision AI.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env and add your VITE_ANTHROPIC_KEY

# 3. Start development server
npm run dev
# → Opens at http://localhost:5173
```

---

## 📁 Project Structure

```
src/
├── assets/                 # Images, SVGs, icons
├── components/             # Reusable UI components
│   ├── Navbar.jsx          # Fixed responsive nav with auth-aware links
│   ├── Footer.jsx          # Site footer
│   ├── ServiceCard.jsx     # Service feature card
│   ├── DoctorCard.jsx      # Team member card
│   ├── PricingCard.jsx     # Pricing tier card
│   └── Loader.jsx          # Spinner (fullpage + inline)
├── sections/               # Landing page sections
│   ├── Hero.jsx
│   ├── About.jsx
│   ├── Services.jsx
│   ├── Team.jsx
│   ├── Pricing.jsx
│   └── Contact.jsx
├── pages/                  # Route-level pages
│   ├── Landing.jsx         # Home page (assembles sections)
│   ├── Login.jsx           # Sign-in page
│   ├── Register.jsx        # Registration page
│   ├── Dashboard.jsx       # User dashboard
│   ├── Check.jsx           # RVG upload + AI analysis
│   ├── Report.jsx          # Report viewer + download
│   └── Appointment.jsx     # 4-step booking flow
├── context/
│   └── AuthContext.jsx     # Global auth state (localStorage)
├── hooks/
│   └── useAuth.js          # Auth context consumer hook
├── services/
│   ├── authService.js      # Login, register, logout API calls
│   ├── appointmentService.js # Booking CRUD
│   └── aiService.js        # Claude Vision analysis
├── utils/
│   └── helpers.js          # Validation, formatting, colours, download
├── routes/
│   └── ProtectedRoute.jsx  # Auth guard HOC
├── router/
│   └── AppRouter.jsx       # All routes (React Router v6)
├── styles/
│   └── globals.css         # Design tokens + global styles
├── App.jsx
└── main.jsx
```

---

## 🔑 Environment Variables

| Variable              | Required | Description |
|-----------------------|----------|-------------|
| `VITE_API_URL`        | No       | Your backend API base URL. Leave empty to use the built-in localStorage mock. |
| `VITE_ANTHROPIC_KEY`  | Yes*     | Anthropic API key for Claude Vision. *Only required for direct browser calls (dev/demo). In production, proxy through your backend. |

---

## 🏗️ Connecting a Real Backend

All API calls are centralised in `src/services/`:

- **`authService.js`** — `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`
- **`appointmentService.js`** — `/api/appointments` (GET, POST, PATCH, DELETE), `/api/appointments/slots`
- **`aiService.js`** — `/api/ai/analyse` (POST with `{ image: base64, mimeType }`)

When `VITE_API_URL` is set, every service file switches from the localStorage mock to real `fetch()` calls automatically. No other code changes needed.

---

## 🚢 Deployment

### Vercel (recommended)
```bash
npm run build
# Upload /dist to Vercel, or connect your GitHub repo.
# Set VITE_ANTHROPIC_KEY in Vercel → Project → Settings → Environment Variables.
```

### Netlify
```bash
npm run build
# Drag and drop /dist into Netlify, or connect GitHub.
```

### Docker
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

---

## 🔒 Security Notes

- **Never** expose `VITE_ANTHROPIC_KEY` in production builds. Proxy Claude API calls through your own backend.
- The localStorage mock is for development only — replace with a real auth backend before launch.
- All protected routes (`/dashboard`, `/check`, `/report`, `/appointment`) are wrapped in `<ProtectedRoute>` which redirects unauthenticated users to `/login`.

---

## 📦 Tech Stack

| Layer      | Technology |
|------------|-----------|
| Framework  | React 18 |
| Routing    | React Router v6 |
| Styling    | Pure CSS (design tokens in `globals.css`) |
| AI         | Anthropic Claude Vision (claude-sonnet-4) |
| Build      | Vite 5 |
| Auth       | JWT-ready (localStorage mock for dev) |

---


