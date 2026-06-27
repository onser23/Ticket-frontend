# CONTEXT — Ticket Frontend

Bu fayl monorepo-dan frontend-in çıxarılması haqqında qısa məlumat verir.

**Tarixçə:** Bu frontend əvvəlcə `C:\Users\Administrator\Desktop\Ticket\` monorepo-sunun bir hissəsi idi (7 sub-project: SP1-SP7). 2026-06-27 tarixində ayrı GitHub repo-ya köçürülüb.

**Tam implementation tarixçəsi:** Monorepo-nun CONTEXT.md faylında saxlanılıb (8 session: brainstorming, design doc, SP1-SP7 implementation, final smoke test).

## Sub-Project Breakdown

| Sub-Project | Ad | Status |
|-------------|----|--------|
| SP1 | Foundation + Auth | ✅ |
| SP2 | Layout + Profile + Companies | ✅ |
| SP3 | Tickets + File Upload | ✅ |
| SP4 | Admin Tickets + Status + Email | ✅ |
| SP5 | Reply/Comment Thread | ✅ |
| SP6 | Stats Dashboards | ✅ |
| SP7 | Polish + Mobile + Final | ✅ |

## Nədir Bu Repo?

- **Frontend-only** — `backend/` və monorepo faylları bu repo-da YOXDUR
- Backend repo ayrıdır: `ticket-system-backend`
- 2 ayrı auth context (UserAuthContext + AdminAuthContext) — 2 fərqli JWT secret
- Mobile responsive (hamburger menu + drawer)
- 89 backend test + manual smoke test ilə verify edilmiş

## Texniki Stack

- React 19 + React Router 7
- Tailwind CSS 3.4
- Axios (2 instance: userApi + adminApi)
- react-hot-toast, lucide-react, date-fns
- React Scripts 5 (build tool)

## Əsas Komponentlər

- **Layout:** UserLayout + AdminLayout (Sidebar + TopBar + Outlet)
- **Sidebar:** UserSidebar + AdminSidebar (menu + logout)
- **TopBar:** UserTopBar + AdminTopBar (tarix + dropdown)
- **Mobile:** MobileDrawer (slide-in) + hamburger menu
- **Tickets:** FileUpload + ImageGallery + TicketCard + TicketTable + TicketCreateModal + CommentThread
- **Common:** ErrorBoundary + EmptyState + StatCard + OtpInput + Spinner

## Quraşdırma

README.md faylına baxın.

## Deployment

Production build (`npm run build`) → static files → serve via Nginx/Vercel/Netlify. Backend API URL-i `.env` ilə konfiqurasiya olunur.

---

**Əlaqə:** info@zootrend.az
