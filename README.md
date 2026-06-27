# Ticket Sistemi — Frontend

Baxça İdarəetmə Sistemi üçün problem bildirişi (ticket/müraciət) sisteminin frontend hissəsi. React 19 + Tailwind CSS + React Router 7 + Axios + lucide-react + react-hot-toast.

**Backend repo:** [ticket-system-backend](https://github.com/<user>/ticket-system-backend)

---

## Stack

- React 19 (latest)
- React Router 7
- Tailwind CSS 3.4
- Axios 1.7
- react-hot-toast 2.4 (notifications)
- lucide-react 0.460 (icons)
- date-fns 4.1 (date utilities)
- React Scripts 5 (build tool)

---

## Xüsusiyyətlər

- ✅ **User Panel:** Login, Register (OTP), Forgot Password, Profile edit
- ✅ **Admin Panel:** Login, Dashboard, Profile edit
- ✅ **Tickets:** Create (5 images, 2MB each), List, Filter, Pagination, Detail view, ImageGallery + Lightbox
- ✅ **Comments:** User + Admin thread with role-based styling
- ✅ **Stats Dashboards:** 4 stat cards (Toplam/Gözləyən/İcradadır/Həll Edildi)
- ✅ **Sidebar + TopBar:** Logo, menu items, user dropdown
- ✅ **Mobile Responsive:** Hamburger menu + drawer
- ✅ **ErrorBoundary:** Graceful error handling
- ✅ **Accessibility:** aria-label on icon buttons
- ✅ **Modern Dizayn:** Animated gradients, glassmorphism, blob-lar (Kindergarten pattern)

---

## Pages

### Public (Authentication)
- `/login` — User login
- `/register` — User registration with OTP verification
- `/verify-otp` — Email OTP verification
- `/forgot-password` — Reset password request
- `/reset-password` — Reset password with OTP
- `/admin/login` — Admin login (default: admin / admin123)

### User Panel (Protected)
- `/` — Dashboard with stats + quick actions
- `/tickets` — My tickets list (create, filter, search, paginate)
- `/tickets/:id` — Single ticket with comments + ImageGallery
- `/profile` — Edit profile info + change password

### Admin Panel (Protected)
- `/admin` — Dashboard with stats + byCompany breakdown
- `/admin/tickets` — All tickets list (filter by company, status, priority)
- `/admin/tickets/:id` — Single ticket with status change + comments + ImageGallery
- `/admin/companies` — Companies list (search, filter, edit, deactivate)
- `/admin/profile` — Edit profile info + change password

---

## Quraşdırma

### 1. Clone

```bash
git clone https://github.com/<user>/ticket-system-frontend.git
cd ticket-system-frontend
```

### 2. Install

```bash
npm install
```

### 3. Environment

```bash
cp .env.example .env
```

**`frontend/.env`:**

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Production-da backend URL qoyun, məs:

```env
REACT_APP_API_URL=https://api.yourdomain.com/api
```

### 4. Run

```bash
# Development (port 3000)
npm start

# Production build
npm run build
# Build output: build/ directory
```

---

## Scripts

| Script | Açıqlama |
|--------|----------|
| `npm start` | React dev server (port 3000, hot reload) |
| `npm run build` | Production build (output: build/) |
| `npm test` | Run React tests (placeholder — automated tests MVP-də YAGNI) |

---

## İki Auth Context Pattern

Bu layihə iki ayrı authentication sistemi istifadə edir:

```javascript
// User Panel — UserAuthContext
const { user, login, logout } = useUserAuth();
// Token: localStorage 'userToken'

// Admin Panel — AdminAuthContext
const { admin, login, logout } = useAdminAuth();
// Token: localStorage 'adminToken'
```

**İki ayrı axios instance:**
- `utils/userApi.js` — `Authorization: Bearer ${userToken}` interceptor
- `utils/adminApi.js` — `Authorization: Bearer ${adminToken}` interceptor

**Təhlükəsizlik:** Hər axios instance öz token-i ilə işləyir. User token admin endpoint-ə, admin token user endpoint-ə keçə bilməz (backend-də iki ayrı JWT secret).

---

## Project Structure

```
frontend/
├── public/                  # Static assets (index.html, favicon, manifest)
├── src/
│   ├── components/
│   │   ├── common/         # ErrorBoundary, EmptyState, StatCard, MobileDrawer, OtpInput, Spinner
│   │   ├── user/           # UserSidebar, UserTopBar
│   │   ├── admin/          # AdminSidebar, AdminTopBar
│   │   ├── layout/         # UserLayout, AdminLayout
│   │   └── tickets/        # FileUpload, ImageGallery, TicketFilters,
│   │                       # TicketCard, TicketTable, TicketCreateModal, CommentThread
│   ├── context/            # UserAuthContext, AdminAuthContext
│   ├── pages/
│   │   ├── UserLogin, UserRegister, UserVerifyOtp, UserForgotPassword,
│   │   ├── UserResetPassword, UserDashboard, UserTickets, UserTicketDetail,
│   │   ├── UserProfile, AdminLogin, AdminDashboard, AdminTickets,
│   │   ├── AdminTicketDetail, AdminProfile, AdminCompanies
│   ├── utils/              # userApi, adminApi, validators, constants, dateUtils
│   ├── App.js              # Router + ProtectedRoutes
│   ├── index.js            # ReactDOM + ErrorBoundary + Providers
│   └── index.css           # Tailwind directives
├── docs/                   # Design doc + plans (sub-project docs)
├── tailwind.config.js
├── postcss.config.js
├── .env.example
└── package.json
```

---

## Production Deployment

### Build

```bash
npm run build
```

Output: `build/` directory with optimized static files.

### Serve (Nginx example)

```nginx
server {
  listen 80;
  server_name tickets.yourdomain.com;

  root /var/www/ticket-frontend/build;
  index index.html;

  location / {
    try_files $uri /index.html;  # SPA fallback
  }

  location /api/ {
    proxy_pass http://localhost:5000;  # backend
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

### Alternative: Static hosts
- **Vercel:** `vercel deploy` (auto-detects React)
- **Netlify:** Drag-and-drop `build/` folder
- **GitHub Pages:** Needs SPA fallback config

---

## Test

MVP-də frontend automated tests YAGNI sayılıb. Manual smoke test istifadəçi tərəfindən hər SP sonunda edilir.

---

## Lisenziya

Private / Proprietary
