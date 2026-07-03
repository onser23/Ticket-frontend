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
| **FB-3** | **Security Fixes Batch (2026-06-29)** — **✅** | ✅ |
| **AS-1** | **Auto-Seed on Server Start (2026-07-02)** — **Backend dəyişikliyi** | ✅ |

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

## FB-3: Security Fixes Batch (2026-06-29)

**Tarix:** 2026-06-29
**Status:** ✅ Tamamlanıb (audit design + report + resolution docs)
**Təsvir:** Security audit (32 test, 12 category) + FB-3 fix-lərin resolution appendix. Frontend heç bir kod dəyişikliyi tələb etmirdi — backend-only task.

### Dəyişikliklər

| Task | Ad | Tip | Commit |
|------|----|-----|--------|
| T1 | Security audit design spec (12 category, 32 test) | Docs | `896548a` |
| T2 | Security audit report (28 PASS / 4 FAIL) | Docs | `3c7c3ca` |
| T3 | FB-3 resolution appendix (4 fix verified) | Docs | `a7d32a1` |

### Audit Tapıntıları (Backend)

Security audit `Backend` repo-ya qarşı real HTTP sorğularla icra olunub. **Bütün 12 Critical testlər PASS** (auth, cross-role, token manipulation, IDOR, login NoSQL injection). 4 uğursuz testin hamısı Medium/High səviyyəli və backend tərəfindən fix olunub (FB-3 commit-ləri):

| Audit Test | Status | Backend Fix |
|------------|--------|-------------|
| F2: ObjectId injection | ❌ → ✅ | `mongoose.Types.ObjectId.isValid()` (commit `1f31c08`) |
| H1: CORS wildcard | ❌ → ✅ | `cors({origin: FRONTEND_URL})` (commit `8f35892`) |
| I1: Login rate limit | ❌ → ✅ | `express-rate-limit` middleware (commit `d239771`) |
| L1: Stack trace leak | ❌ → ✅ | Error handler refactor (commit `6ff95c7`) |

### Frontend-ə Təsir

**Frontend kod dəyişikliyi tələb olunmur.** Bütün fix-lər backend-dədir:
- CORS whitelist: legitimate frontend origin (`FRONTEND_URL`) hələ də ACAO alır, sadəcə evil origin-lər bloklanır
- Rate limit: frontend-də login UX dəyişmir (cavab mesajı hələ Azərbaycan dilində)
- ObjectId validation: 400 response mesajı `'Yanlış companyId formatı'` frontend-də toast olaraq göstərilir
- Stack trace: production-da frontend heç vaxt stack field görmür (error handler sızdırmır)

### Test Status (FB-3 sonrası)

- Backend: 122 test (111 + 11 yeni), 112 PASS / 10 FAIL
- Frontend: Mövcud test infrastructure (build smoke test)
- Manual browser smoke test: əvvəlki kimi, frontend davranışı dəyişməyib

### Audit Hesabatı

`docs/superpowers/reports/2026-06-29-security-audit.md` — 308 lines + Resolution Appendix (FB-3 sonrası 87 lines əlavə).

**32/32 audit test PASS** (FB-3 sonrası). Production deployment hazırdır.

---

## Nədir Bu Repo?

- **Frontend-only** — `backend/` və monorepo faylları bu repo-da YOXDUR
- Backend repo ayrıdır: `ticket-system-backend`
- 2 ayrı auth context (UserAuthContext + AdminAuthContext) — 2 fərqli JWT secret
- Mobile responsive (hamburger menu + drawer)
- 125 backend test + manual smoke test ilə verify edilmiş (AS-1 sonrası)

---

## AS-1: Auto-Seed on Server Start (2026-07-02) — Backend Cross-Repo Qeyd

**Tarix:** 2026-07-02
**Status:** ✅ Backend-də tamamlanıb (5/5 task + 5 commit)
**Təsvir:** Backend-də default admin indi `npm start` zamanı avtomatik yaranır (development mühitdə). Production-da manual `npm run seed` tələb olunur.

### Frontend-ə Təsir

**Heç bir frontend kod dəyişikliyi tələb olunmur.** Backend davranışı dəyişib:

- **Development (local `npm start`):** DB sıfır olsa belə, default admin (`admin / admin123`) avtomatik yaranır — login problemsiz işləyir
- **Production:** Manual `npm run seed` lazımdır (deployment script-ə əlavə olunmalı)
- **Test:** Mövcud davranış qorunur (server.js xarici guard test mode-da skip edir)

### Test Status

- Backend: 125/125 PASS (122 mövcud + 3 yeni seed test)
- 5 əvvəlki FAIL testlər düzəldi (Windows mongodb-memory-server race, `readyState === 1` check sayəsində)
- Frontend build: dəyişiklik yoxdur

### Backend Commit-lər (cross-reference)

| Commit | Task |
|--------|------|
| `ddd2ab3` | test(seed): add 3 failing tests for auto-seed |
| `ac6782d` | fix(seed,db): remove disconnectDB, add URI guard + readyState |
| `e5f91d9` | feat(server): auto-seed default admin on start |
| `78eac41` | docs(spec): add auto-seed design |
| `dba7049` | docs(plan): add auto-seed implementation plan |

Manual smoke test üçün `Ticket-Backend/CONTEXT.md` §AS-1-ə baxın (5 ssenari).

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
- `docs/superpowers/reports/2026-06-29-security-audit.md` — Security audit report (32 test + Resolution Appendix)
- `docs/superpowers/specs/2026-06-29-security-audit-design.md` — Security audit design spec

---

**Əlaqə:** info@zootrend.az
