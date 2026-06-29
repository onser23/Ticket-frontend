# Ticket Fixes Batch FB-2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** İstifadəçi tərəfindən aşkar edilmiş 5 bug/feature taskı — AdminTickets companies filter yüklənmir (bug), AdminTickets/UserTickets "Filteri sıfırla" düyməsi (feature), UserProfile/AdminProfile səhv current password logout-a səbəb olur (bug), UserProfile/AdminProfile "Yeni şifrənin təkrarı" input-u yoxdur (feature).

**Architecture:** Frontend-only dəyişikliklər. Bug fix (Task 1): `adminApi.list()` → `adminApi.get('/companies')`. Feature (Tasks 2 & 3): filter kartında 5-ci/4-cü sütun olaraq "Filteri sıfırla" düyməsi, `disabled` state ilə. Bug fix (Task 4): axios request config-ə `_skipAuthRedirect: true` flag, interceptor skip edir. Feature (Task 5): 3-cü password input + submit-time validation. Tək commit per task, manual smoke test ilə verification.

**Tech Stack:** React 19, React Router 7, Axios (interceptor pattern), Tailwind 3.4, lucide-react (`RotateCcw` icon). Build: React Scripts 5 (`npm run build`).

---

## Fayl Strukturu

**Dəyişdiriləcək fayllar (6 fayl):**

| Fayl | Task | Dəyişiklik |
|------|------|------------|
| `Frontend/src/pages/admin/AdminTickets.js` | Task 1, 2 | Companies load fix + reset button |
| `Frontend/src/components/tickets/TicketFilters.js` | Task 3 | Reset button + grid breakpoint |
| `Frontend/src/utils/userApi.js` | Task 4 | Interceptor `_skipAuthRedirect` flag check |
| `Frontend/src/utils/adminApi.js` | Task 4 | Eyni dəyişiklik |
| `Frontend/src/pages/UserProfile.js` | Task 4, 5 | Skip flag call + confirm password field |
| `Frontend/src/pages/AdminProfile.js` | Task 4, 5 | Eyni dəyişiklik |

**Dəyişdirilməyəcək fayllar:**
- Heç bir backend faylı (FB-2 frontend-only)
- Heç bir test faylı (FB-2 manual smoke test ilə verify olunur, avtomatlaşdırılmış test yoxdur)
- Heç bir dependency (bütün istifadə olunan library-lar artıq mövcuddur)

---

## Task 1: AdminTickets — Companies Filter Load Fix

**Files:**
- Modify: `Frontend/src/pages/admin/AdminTickets.js:44-51`

**Goal:** `adminApi.list()` çağırışı `undefined`-dır (TypeError), şirkətlər heç vaxt yüklənmir. Düzgün API çağırışı ilə əvəz et.

**Mövcud bug:**
- `AdminTickets.js:47` — `const res = await adminApi.list({ limit: 100 });`
- `adminApi` yalnız `adminTicketsAPI`, `adminCommentsAPI`, `adminStatsAPI` export edir (`utils/adminApi.js:33-49`)
- `adminApi.list` undefined → TypeError console-a düşür, `companies` state boş qalır

- [ ] **Step 1: Buggy kodu düzəlt**

`Frontend/src/pages/admin/AdminTickets.js` faylındakı `useEffect` blokunu tap (sətir 44-51) və aşağıdakı koda dəyiş:

```jsx
  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.get('/companies', { params: { limit: 100 } });
        setCompanies(res.data.data || []);
      } catch (e) {
        console.error('Şirkətlər yüklənmədi:', e);
      }
    })();
  }, []);
```

- [ ] **Step 2: `RotateCcw` import-unu yoxla**

`AdminTickets.js:3`-dəki import sətirinə `RotateCcw` əlavə et (Task 2 üçün lazımdır, Task 1-də istifadə olunmur amma eyni fayl):

```jsx
import { Inbox, Search, Filter, Loader2, Trash2, Eye, RotateCcw } from 'lucide-react';
```

- [ ] **Step 3: Build yoxla**

```bash
cd Frontend
npm run build
```

**Gözlənilən:** SUCCESS, no errors.

- [ ] **Step 4: Commit**

```bash
git add Frontend/src/pages/admin/AdminTickets.js
git commit -m "fix(admin-tickets): load companies list via /companies endpoint"
```

---

## Task 2: AdminTickets — "Filteri sıfırla" Button

**Files:**
- Modify: `Frontend/src/pages/admin/AdminTickets.js` (3 yerə əlavə)

**Goal:** Filter kartında 5-ci sütun olaraq "Filteri sıfırla" düyməsi. Filterlər dəyişdirildikdə aktiv olur, klikləndikdə hər şeyi default-a qaytarır.

- [ ] **Step 1: `handleReset` funksiyası əlavə et**

`AdminTickets.js`-də `fetchTickets` funksiyasından sonra (sətir 71-dən sonra, sətir 73-dəki `useEffect` əvvəlinə) aşağıdakı kodu əlavə et:

```jsx
  const handleReset = () => {
    setFilters({ search: '', status: '', priority: '', companyId: '', page: 1, limit: 20 });
  };

  const isFiltered =
    filters.search !== '' ||
    filters.status !== '' ||
    filters.priority !== '' ||
    filters.companyId !== '';
```

- [ ] **Step 2: Grid breakpoint dəyiş**

`AdminTickets.js:103`-dəki `grid` class-ını tap və dəyiş:

```jsx
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
```

(`lg:grid-cols-4` → `lg:grid-cols-5`)

- [ ] **Step 3: Reset button JSX əlavə et**

`AdminTickets.js`-də 4-cü select-dən sonra (sətir 135-dən sonra, `</div>` bağlayan sətirdən əvvəl) aşağıdakı button-u əlavə et:

```jsx
          <button
            type="button"
            onClick={handleReset}
            disabled={!isFiltered}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Filteri sıfırla</span>
          </button>
```

- [ ] **Step 4: Build yoxla**

```bash
cd Frontend
npm run build
```

**Gözlənilən:** SUCCESS, no errors, bundle size artımı < 1 kB.

- [ ] **Step 5: Commit**

```bash
git add Frontend/src/pages/admin/AdminTickets.js
git commit -m "feat(admin-tickets): add Filteri sıfırla button (lg:grid-cols-5)"
```

---

## Task 3: TicketFilters — "Filteri sıfırla" Button (UserTickets)

**Files:**
- Modify: `Frontend/src/components/tickets/TicketFilters.js`

**Goal:** UserTickets üçün istifadə olunan `TicketFilters` komponentinə 4-cü sütun olaraq reset button əlavə et.

- [ ] **Step 1: `RotateCcw` import əlavə et**

`TicketFilters.js:2`-dəki import sətirini dəyiş:

```jsx
import { Search, Filter, RotateCcw } from 'lucide-react';
```

- [ ] **Step 2: `handleReset` və `isFiltered` əlavə et**

`TicketFilters.js:18-21` (komponentin başlanğıcı) hissəsini tap. `TicketFilters` komponentinə aşağıdakı kodu əlavə et (mövcud `handleChange` funksiyasından sonra):

```jsx
const TicketFilters = ({ filters, onChange }) => {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value, page: 1 });
  };

  const handleReset = () => {
    onChange({ search: '', status: '', priority: '', page: 1, limit: 20 });
  };

  const isFiltered = !!(filters.search || filters.status || filters.priority);

  return (
```

- [ ] **Step 3: Grid breakpoint dəyiş**

`TicketFilters.js:29`-dəki `grid` class-ını dəyiş:

```jsx
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
```

(`md:grid-cols-3` → `md:grid-cols-4`)

- [ ] **Step 4: Reset button JSX əlavə et**

`TicketFilters.js:53`-dəki 3-cü select-dən sonra (sətir 53-dən sonra, `</div>` bağlayan sətirdən əvvəl) button-u əlavə et:

```jsx
        <button
          type="button"
          onClick={handleReset}
          disabled={!isFiltered}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Filteri sıfırla</span>
        </button>
```

- [ ] **Step 5: Build yoxla**

```bash
cd Frontend
npm run build
```

**Gözlənilən:** SUCCESS, no errors.

- [ ] **Step 6: Commit**

```bash
git add Frontend/src/components/tickets/TicketFilters.js
git commit -m "feat(ticket-filters): add Filteri sıfırla button (md:grid-cols-4)"
```

---

## Task 4: 401 Interceptor — Skip Flag

**Files:**
- Modify: `Frontend/src/utils/userApi.js:16-33`
- Modify: `Frontend/src/utils/adminApi.js:19-31`

**Goal:** Axios response interceptor hər 401 cavabında token silir və login-ə yönləndirir. `/profile/password` səhv current password zamanı 401 qaytarır və istifadəçi logout olur. `_skipAuthRedirect` flag-i ilə bu davranışı söndürmək mümkün olsun.

- [ ] **Step 1: `userApi.js` interceptor dəyiş**

`Frontend/src/utils/userApi.js:19`-dəki `if` şərtini tap və dəyiş:

```js
    if (error.response?.status === 401 && !error.config?._skipAuthRedirect) {
```

Mövcud (sətir 19):
```js
    if (error.response?.status === 401) {
```

Yeni:
```js
    if (error.response?.status === 401 && !error.config?._skipAuthRedirect) {
```

**Şərh əlavə et** (sətir 17-dən əvvəl, hər iki fayl üçün eyni comment):

```js
// Skip flag istifadəsi: axios call-da `{ _skipAuthRedirect: true }` 3-cü argument kimi ötürülür.
// Bu, 401 qaytaran endpoint-lərdə (məs. səhv current password) logout-un qarşısını alır.
```

- [ ] **Step 2: `adminApi.js` interceptor dəyiş**

`Frontend/src/utils/adminApi.js:22`-dəki `if` şərtini tap və eyni şəkildə dəyiş:

```js
    if (error.response?.status === 401 && !error.config?._skipAuthRedirect) {
```

Eyni comment-i əlavə et (sətir 20-dən əvvəl).

- [ ] **Step 3: Build yoxla**

```bash
cd Frontend
npm run build
```

**Gözlənilən:** SUCCESS, no errors.

- [ ] **Step 4: Commit**

```bash
git add Frontend/src/utils/userApi.js Frontend/src/utils/adminApi.js
git commit -m "fix(api): skip logout on 401 when _skipAuthRedirect flag set"
```

---

## Task 5: Profile — Skip Flag Call + Confirm Password

**Files:**
- Modify: `Frontend/src/pages/UserProfile.js` (3 yerə əlavə)
- Modify: `Frontend/src/pages/AdminProfile.js` (3 yerə əlavə)

**Goal:** Hər iki profile səhifəsində:
1. `/profile/password` çağırışında `_skipAuthRedirect: true` flag ötür (Task 4 wiring)
2. Yeni "Yeni şifrənin təkrarı" input-u əlavə et (Task 5)
3. Uyğun gəlmədikdə error mesajı göstər

### 5a: UserProfile.js

- [ ] **Step 1: `passwordData` state-ə `confirmPassword` əlavə et**

`UserProfile.js:11`-dəki state-i tap:

```js
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
```

Bunu dəyiş:

```js
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
```

- [ ] **Step 2: `showConfirmPw` state əlavə et**

`UserProfile.js:13`-dən sonra (`showNewPw` state-dən sonra) əlavə et:

```js
  const [showConfirmPw, setShowConfirmPw] = useState(false);
```

- [ ] **Step 3: `handlePasswordSubmit` validation əlavə et**

`UserProfile.js:54-55` (mövcud `validatePassword` çağırışından sonra) tap. Aşağıdakı kodu həmin hissədən sonra, `setSavingPassword(true)`-dan əvvəl əlavə et:

```js
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setPasswordError('Yeni şifrə və təkrarı uyğun deyil');
    }
```

- [ ] **Step 4: Skip flag call**

`UserProfile.js:59`-dəki `userApi.put` çağırışını tap:

```js
      await userApi.put('/profile/password', passwordData);
```

Bunu dəyiş:

```js
      await userApi.put('/profile/password', passwordData, { _skipAuthRedirect: true });
```

- [ ] **Step 5: Success reset**

`UserProfile.js:61`-dəki `setPasswordData` çağırışını tap:

```js
      setPasswordData({ currentPassword: '', newPassword: '' });
```

Bunu dəyiş:

```js
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
```

- [ ] **Step 6: Confirm password input JSX əlavə et**

`UserProfile.js:151`-dəki Yeni şifrə input-unun bitdiyi yerdən sonra (`</div>` bağlayışından sonra, sətir 151), aşağıdakı YENİ input blok-unu əlavə et:

```jsx
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Yeni şifrənin təkrarı</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type={showConfirmPw ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                disabled={savingPassword}
                className="w-full pl-10 pr-10 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
              />
              <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
```

### 5b: AdminProfile.js

- [ ] **Step 7: `passwordData` state-ə `confirmPassword` əlavə et**

`AdminProfile.js:12`-dəki state-i tap:

```js
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
```

Bunu dəyiş:

```js
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
```

- [ ] **Step 8: `showConfirmPw` state əlavə et**

`AdminProfile.js:14`-dən sonra (`showNewPw` state-dən sonra) əlavə et:

```js
  const [showConfirmPw, setShowConfirmPw] = useState(false);
```

- [ ] **Step 9: `handlePasswordSubmit` validation əlavə et**

`AdminProfile.js:54-55`-dən sonra (mövcud `validatePassword` çağırışından sonra, `setSavingPassword(true)`-dan əvvəl) əlavə et:

```js
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setPasswordError('Yeni şifrə və təkrarı uyğun deyil');
    }
```

- [ ] **Step 10: Skip flag call**

`AdminProfile.js:58`-dəki `adminApi.put` çağırışını tap:

```js
      await adminApi.put('/admin/profile/password', passwordData);
```

Bunu dəyiş:

```js
      await adminApi.put('/admin/profile/password', passwordData, { _skipAuthRedirect: true });
```

- [ ] **Step 11: Success reset**

`AdminProfile.js:60`-dəki `setPasswordData` çağırışını tap:

```js
      setPasswordData({ currentPassword: '', newPassword: '' });
```

Bunu dəyiş:

```js
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
```

- [ ] **Step 12: Confirm password input JSX əlavə et**

`AdminProfile.js:147`-dəki Yeni şifrə input-unun bitdiyi yerdən sonra (`</div>` bağlayışından sonra), aşağıdakı YENİ input blok-unu əlavə et (focus rəngi `amber-500` ilə, çünki admin panel üçün):

```jsx
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Yeni şifrənin təkrarı</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type={showConfirmPw ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                disabled={savingPassword}
                className="w-full pl-10 pr-10 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-60"
              />
              <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
```

- [ ] **Step 13: Build yoxla**

```bash
cd Frontend
npm run build
```

**Gözlənilən:** SUCCESS, no errors, bundle size artımı < 2 kB.

- [ ] **Step 14: Commit**

```bash
git add Frontend/src/pages/UserProfile.js Frontend/src/pages/AdminProfile.js
git commit -m "feat(profile): confirm password field + skip flag for password change"
```

---

## Final Task: Manual Smoke Test

**Files:** Heç bir kod dəyişikliyi yoxdur.

**Goal:** Spec §7.1-dəki 10 manual test ssenarisini icra et, hər birinin keçdiyini təsdiqlə.

- [ ] **Step 1: Backend + Frontend işə sal**

```bash
# Terminal 1 — Backend
cd Ticket-Backend
npm start

# Terminal 2 — Frontend
cd Ticket-Frontend
npm start
```

- [ ] **Step 2: Admin Panel testləri (A1-A5)**

Browser-də `http://localhost:3000/admin/login` aç, admin hesabla login ol, sonra `/admin/tickets` səhifəsinə keç.

- [ ] **A1:** "Bütün şirkətlər" dropdown-a kliklə → bütün şirkətlər görsənir (aktiv+passiv)
- [ ] **A2:** Bir şirkət seç → table filter olunur, yalnız həmin şirkətin müraciətləri görsənir
- [ ] **A3:** Search input + Status + Priority filterlərini dəyiş → "Filteri sıfırla" düyməsi aktiv olur (disabled=false)
- [ ] **A4:** "Filteri sıfırla" kliklə → bütün filterlər default-a qayıdır, table bütün müraciətləri göstərir, düymə deaktiv olur
- [ ] **A5:** Filter boş ikən "Filteri sıfırla" düyməsinə kliklə → heç bir şey baş vermir (disabled=true)

- [ ] **Step 3: User Panel testləri (U1-U2)**

Browser-də `/login` aç, user hesabla login ol, sonra `/tickets` səhifəsinə keç.

- [ ] **U1:** Search yaz + Status seç → "Filteri sıfırla" düyməsi aktiv olur
- [ ] **U2:** "Filteri sıfırla" kliklə → search + status sıfırlanır, table bütün müraciətləri göstərir

- [ ] **Step 4: Profile testləri (P1-P5)**

Hər iki rol üçün Profil səhifəsinə keç, "Şifrəni dəyişdir" blokunda test et.

- [ ] **P1 (User):** Səhv "Cari şifrə" yaz → submit → backend error message göstərilir, **logout olmur**, profile səhifəsində qalır
- [ ] **P2 (Admin):** Səhv "Cari şifrə" yaz → submit → eyni P1 davranışı
- [ ] **P3 (User):** Yeni şifrə "abc123", Təkrar "abc456" → submit → "Yeni şifrə və təkrarı uyğun deyil" göstərilir, backend call olmur
- [ ] **P4 (User):** Yeni şifrə "abc123", Təkrar "abc123" → submit → şifrə dəyişdirilir, toast göstərilir, bütün input-lar sıfırlanır
- [ ] **P5 (Admin):** Eyni P3 və P4 admin üçün

- [ ] **Step 5: Regression check**

- [ ] Login (user + admin) → hələ işləyir
- [ ] Pagination (AdminTickets, UserTickets, AdminCompanies) → hələ işləyir
- [ ] Manual token expire (DevTools localStorage-də `userToken`-i sil) → hələ logout olur (skip flag olmayan endpoint üçün)
- [ ] Navigation between pages → hələ işləyir

- [ ] **Step 6: Final commit (optional — smoke test notes)**

Əgər smoke test zamanı hər hansı minor fix lazım olubsa, onu commit et:

```bash
git add <fixed-files>
git commit -m "chore(smoke-test): minor fixes from manual verification"
```

Əgər heç bir fix lazım olunmayıbsa, bu step skip olunur.

---

## Uğur Meyarları Checklist

- [ ] Task 1 commit: `fix(admin-tickets): load companies list via /companies endpoint`
- [ ] Task 2 commit: `feat(admin-tickets): add Filteri sıfırla button (lg:grid-cols-5)`
- [ ] Task 3 commit: `feat(ticket-filters): add Filteri sıfırla button (md:grid-cols-4)`
- [ ] Task 4 commit: `fix(api): skip logout on 401 when _skipAuthRedirect flag set`
- [ ] Task 5 commit: `feat(profile): confirm password field + skip flag for password change`
- [ ] 5/5 manual smoke test keçir (A1-A5, U1-U2, P1-P5)
- [ ] `npm run build` SUCCESS
- [ ] Mövcud heç bir feature regression olmur (login, pagination, navigation)

---

## Əlaqəli Sənədlər

- **Spec:** `Frontend/docs/superpowers/specs/2026-06-29-ticket-fixes-batch-fb2-design.md`
- **FB-1 spec (cascading logic context):** `Frontend/docs/superpowers/specs/2026-06-27-ticket-fixes-batch-design.md`
- **Mövcud interceptor pattern:** `Frontend/src/utils/userApi.js`, `Frontend/src/utils/adminApi.js`
- **Mövcud profile form pattern:** `Frontend/src/pages/UserProfile.js`, `Frontend/src/pages/AdminProfile.js`
- **Mövcud filter pattern:** `Frontend/src/pages/admin/AdminTickets.js`, `Frontend/src/components/tickets/TicketFilters.js`

---

**Son:** Bu plan 5 task + final smoke test-dən ibarətdir (6 commit gözlənilir). Bütün dəyişikliklər frontend-only, heç bir backend dəyişikliyi yoxdur. Təxmini icra müddəti: 30-45 dəqiqə.