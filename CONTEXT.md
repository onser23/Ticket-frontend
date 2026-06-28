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
| **FB-1** | **Ticket Fixes Batch (2026-06-27)** — **✅** | ✅ |

## FB-1: Ticket Fixes Batch (2026-06-27)

**Tarix:** 2026-06-27
**Status:** ✅ Tamamlanıb (3/13 implementation task + docs)
**Təsvir:** Backend dəyişikliklərini dəstəkləyən UI yenilikləri (Tasks 1, 3, 5, 6, 2 toast).

### Dəyişikliklər

| Task | Ad | Tip | Commit |
|------|----|-----|--------|
| T8 | Spec + Plan docs | Docs | `48a6468` |
| T9 | AdminCompanies: 3-state badge + User.email sütunu + ticketCount sütunu + sort | UI | `b17b678` |
| T10 | AdminCompanies: reaktiv button (Passiv şirkətlər üçün yaşıl Power icon) | UI | `bb36b08` |
| T11 | UserResetPassword: toast text "Şifrə dəyişdirildi və email təsdiqləndi" | UI | `cfb2190` |

### Yeni UI Funksionallığı

**1. AdminCompanies Status Badge (Task 1):**
3-state badge komponenti (komponentdən kənarda constant):
```js
const STATUS_BADGES = {
  active_verified: { label: 'Təsdiqlənmiş', className: 'bg-green-100 text-green-700' },
  active_unverified: { label: 'Doğrulanmamış', className: 'bg-yellow-100 text-yellow-700' },
  passive: { label: 'Passiv', className: 'bg-slate-100 text-slate-600' },
};
function getStatusKey(company) {
  if (!company.isActive) return 'passive';
  if (company.ownerUserId?.isVerified) return 'active_verified';
  return 'active_unverified';
}
```

**2. AdminCompanies Email Column (Task 3):**
Əvvəl `Company.contactEmail` (null, "-" göstərirdi), indi `User.email` populate olunur:
```jsx
<td>{c.ownerUserId?.email || '-'}</td>
```

**3. AdminCompanies Reaktiv Button (Task 5):**
Ternary button — aktiv şirkət üçün qırmızı (deaktiv), passiv üçün yaşıl (aktivləşdir):
```jsx
{c.isActive ? (
  <button onClick={handleDeactivate} className="text-red-600">...</button>
) : (
  <button onClick={handleReactivate} className="text-green-600">...</button>
)}
```

**4. AdminCompanies Ticket Count Sortable Column (Task 6):**
- Yeni sütun: `<th onClick={() => handleSort('ticketCount')}>Müraciət sayı</th>`
- ChevronDown/ChevronUp ikonları sort göstəricisi
- `handleSort(field)` funksiyası asc/desc toggle

**5. UserResetPassword Toast (Task 2 UI):**
`'Şifrə uğurla dəyişdirildi və email təsdiqləndi. İndi login ola bilərsiniz.'` (əvvəl: `'Şifrə uğurla dəyişdirildi! İndi login ola bilərsiniz.'`)

### Build Status (FB-1 sonrası)

- ✅ `npm run build` SUCCESS (124.06 kB JS / 6.31 kB CSS)
- Mövcud bütün route-lar (Tasks 7-9 pagination) dəyişməyib

### Manual Smoke Test Status

**FB-1 manual smoke test (10 ssenari)** — İstifadəçi tərəfindən icra olunmalıdır. Detallar `docs/superpowers/specs/2026-06-27-ticket-fixes-batch-design.md` §7.2-də.

### Tasks 7-9 (Pagination) — Verify

Mövcud implementasiya artıq düzgündür (SP7 zamanı yaradılıb):
- `AdminTickets.js:192-198` — `totalPages > 1` şərti ilə pagination
- `AdminCompanies.js:147-153` — eyni pattern
- `UserTickets.js:92-110` — eyni pattern

Manual smoke test ilə təsdiqlənməlidir (limit=2 ilə browser DevTools-da test edilə bilər).

---

## Nədir Bu Repo?

- **Frontend-only** — `backend/` və monorepo faylları bu repo-da YOXDUR
- Backend repo ayrıdır: `ticket-system-backend`
- 2 ayrı auth context (UserAuthContext + AdminAuthContext) — 2 fərqli JWT secret
- Mobile responsive (hamburger menu + drawer)
- 111 backend test + manual smoke test ilə verify edilmiş (FB-1 sonrası)

## Texniki Stack

- React 19 + React Router 7
- Tailwind CSS 3.4
- Axios (2 instance: userApi + adminApi)
- react-hot-toast, lucide-react (yeni: ChevronDown, ChevronUp), date-fns
- React Scripts 5 (build tool)

## Əsas Komponentlər

- **Layout:** UserLayout + AdminLayout (Sidebar + TopBar + Outlet)
- **Sidebar:** UserSidebar + AdminSidebar (menu + logout)
- **TopBar:** UserTopBar + AdminTopBar (tarix + dropdown)
- **Mobile:** MobileDrawer (slide-in) + hamburger menu
- **Tickets:** FileUpload + ImageGallery + TicketCard + TicketTable + TicketCreateModal + CommentThread
- **Common:** ErrorBoundary + EmptyState + StatCard + OtpInput + Spinner

## FB-1 Dəyişdirilmiş Səhifələr

| Səhifə | Dəyişiklik |
|--------|------------|
| `pages/AdminCompanies.js` | Status badge, email sütun (User.email), ticketCount sütun + sort, reaktiv button |
| `pages/UserResetPassword.js` | Toast text (auto-verify mention) |

## Pagination Mövcud Səhifələri (Tasks 7-9)

| Səhifə | Pagination Statusu |
|--------|--------------------|
| `pages/admin/AdminTickets.js` | Mövcud (line 192-198) — manual verify lazımdır |
| `pages/AdminCompanies.js` | Mövcud (line 147-153) — manual verify lazımdır |
| `pages/user/UserTickets.js` | Mövcud (line 92-110) — manual verify lazımdır |

## Quraşdırma

README.md faylına baxın.

## Deployment

Production build (`npm run build`) → static files → serve via Nginx/Vercel/Netlify. Backend API URL-i `.env` ilə konfiqurasiya olunur.

## Əlaqəli Sənədlər

- `docs/superpowers/specs/2026-06-27-ticket-fixes-batch-design.md` — FB-1 design spec
- `docs/superpowers/plans/2026-06-27-ticket-fixes-batch.md` — FB-1 implementation plan

---

**Əlaqə:** info@zootrend.az
