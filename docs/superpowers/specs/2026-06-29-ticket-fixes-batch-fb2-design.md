# Ticket System Fixes Batch FB-2 — Design

**Tarix:** 2026-06-29
**Status:** APPROVED (brainstorming → design)
**Repo:** `Ticket-Frontend` (yalnız frontend dəyişiklikləri)
**Ad:** FB-2 (Fixes Batch 2)

---

## 1. Xülasə

İstifadəçi tərəfindən manual test zamanı aşkar edilmiş 5 bug/feature taskı. Hamısı frontend-only dəyişiklikdir (backend dəyişikliyi yoxdur).

| # | Task | Tip | Prioritet |
|---|------|-----|-----------|
| 1 | AdminTickets — "Bütün şirkətlər" filter dropdown-u şirkətləri yükləmir | Bug fix (frontend) | Critical |
| 2 | AdminTickets — "Filteri sıfırla" düyməsi | Feature | High |
| 3 | UserTickets — "Filteri sıfırla" düyməsi | Feature | High |
| 4 | UserProfile/AdminProfile — səhv current password logout-a səbəb olur | Bug fix (frontend) | Critical |
| 5 | UserProfile/AdminProfile — "Yeni şifrənin təkrarı" input-u yoxdur | Feature | High |

**Scope qərarları:**
- Tasks 4 & 5 həm User, həm Admin profile-a tətbiq olunur (eyni kod pattern)
- Task 1: Bütün şirkətlər (aktiv+passiv) göstərilir
- Tasks 2 & 3: Düymə filter kartının içində son sütun olaraq
- Task 4: Frontend skip flag istifadə olunur (backend dəyişikliyi yoxdur)

---

## 2. Motiv və Hədəflər

### Mövcud vəziyyət (bug-lar)

1. **AdminTickets filter dropdown boşdur.** İstifadəçi şirkətə görə filter etmək istəyir, amma "Bütün şirkətlər" siyahısı açılanda heç bir şirkət görünmür.

2. **Filter-i sıfırlamaq çətindir.** İstifadəçi 4 filterin hər birini ayrı-ayrılıqda default vəziyyətə qaytarmalıdır (search input-u silmək, hər select-i "Bütün..." seçmək).

3. **Eyni problem UserTickets-də də var.** 3 filter var, amma "Filteri sıfırla" yoxdur.

4. **Səhv cari şifrə yazıldıqda user logout olur.** İstifadəçi gözləyirdi ki, sadəcə "Cari şifrə yanlışdır" mesajı görsün, amma bütün session itir və login səhifəsinə yönləndirilir. Bu həm User, həm Admin üçün mövcuddur.

5. **Şifrə dəyişərkən təkrar yoxlanışı yoxdur.** İstifadəçi yeni şifrəni səhv yazıb sonra fərqli şifrə ilə login olmağa çalışa bilər (təkrar yoxlama input-u olmadığı üçün).

### Hədəflər

- AdminTickets filter **tam işlək** olsun
- Hər iki ticket səhifəsində **"Filteri sıfırla" düyməsi** olsun (1 klik ilə sıfırlama)
- Səhv current password **logout etməsin**, sadəcə error mesajı göstərsin
- Hər iki profile səhifəsində **"Yeni şifrənin təkrarı"** input-u olsun
- Mövcud **bütün SP1-SP7 + FB-1 flow** regression olmasın
- Build PASS (`npm run build`) — frontend only

---

## 3. Arxitektura

### 3.1 Dəyişən komponentlər

| Fayl | Dəyişiklik |
|------|------------|
| `src/pages/admin/AdminTickets.js` | Task 1 (companies load fix) + Task 2 (reset button) |
| `src/components/tickets/TicketFilters.js` | Task 3 (reset button) |
| `src/utils/userApi.js` | Task 4 (interceptor skip flag) |
| `src/utils/adminApi.js` | Task 4 (interceptor skip flag) |
| `src/pages/UserProfile.js` | Task 4 (skip flag call) + Task 5 (confirm field) |
| `src/pages/AdminProfile.js` | Task 4 (skip flag call) + Task 5 (confirm field) |

### 3.2 State (Task 5 — password form)

```js
const [passwordData, setPasswordData] = useState({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',  // ← YENİ
});
const [showConfirmPw, setShowConfirmPw] = useState(false);  // ← YENİ
```

### 3.3 State (Task 2 — AdminTickets filters)

Mövcud `filters` state saxlanır, yalnız `handleReset` funksiyası əlavə olunur:

```js
const handleReset = () => {
  setFilters({ search: '', status: '', priority: '', companyId: '', page: 1, limit: 20 });
};

const isFiltered =
  filters.search !== '' ||
  filters.status !== '' ||
  filters.priority !== '' ||
  filters.companyId !== '';
```

### 3.4 State (Task 3 — TicketFilters)

Komponentin daxilində:
```js
const handleReset = () => {
  onChange({ search: '', status: '', priority: '', page: 1, limit: 20 });
};

const isFiltered = filters.search || filters.status || filters.priority;
```

`onChange` prop artıq mövcuddur (`UserTickets.js:66` `onChange={setFilters}`).

---

## 4. API / Data Flow

### 4.1 Task 1 — AdminTickets companies load

**Cari kod (buggy):**
```js
// AdminTickets.js:44-51
useEffect(() => {
  (async () => {
    try {
      const res = await adminApi.list({ limit: 100 });  // ❌ adminApi.list mövcud deyil
      setCompanies(res.data.data || []);
    } catch (e) { console.error(e); }
  })();
}, []);
```

**Problem:** `adminApi` yalnız `adminTicketsAPI`, `adminCommentsAPI`, `adminStatsAPI` export edir (`adminApi.js:33-49`). `adminApi.list` undefined → TypeError console-a düşür, `companies` state boş qalır.

**Yeni kod:**
```js
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

**Response shape:** Mövcud `GET /api/companies` endpoint-i (`routes/companies.js:26-97`) `res.json({ success, data, total, page, limit, totalPages })` qaytarır. `data` array-dir, hər element `{ _id, displayName, originalName, contactEmail, contactPhone, isActive, createdAt, updatedAt, ownerUserId: { _id, firstName, lastName, email, isVerified }, ticketCount }` strukturundadır. Dropdown üçün yalnız `_id` və `displayName` istifadə olunur.

**Qərar:** Bütün şirkətlər göstərilir (aktiv+passiv), status filter param göndərilmir.

### 4.2 Task 4 — 401 skip flag

**Cari kod (buggy):**
```js
// utils/userApi.js:16-33
userApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {  // ❌ hər 401 logout edir
      localStorage.removeItem(USER_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
      const path = window.location.pathname;
      if (!path.startsWith('/login') && /* ... */) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
```

**Yeni kod:**
```js
userApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?._skipAuthRedirect) {
      // existing logout logic
    }
    return Promise.reject(error);
  },
);
```

**Call site (UserProfile.js:59):**
```js
await userApi.put('/profile/password', passwordData, { _skipAuthRedirect: true });
```

**Call site (AdminProfile.js:58):**
```js
await adminApi.put('/admin/profile/password', passwordData, { _skipAuthRedirect: true });
```

**Axios config contract:** Axios `config` object 3-cü arqument olaraq qəbul olunur. Custom flag (`_skipAuthRedirect`) Axios tərəfindən ignore edilir (tanımadığı key), amma interceptor-da `error.config._skipAuthRedirect` vasitəsilə oxunur. Bu pattern axios-un rəsmi extensibility nümunələrindəndir.

**Eyni dəyişiklik `adminApi.js:19-31`-də tətbiq olunur.**

---

## 5. UI / Component Design

### 5.1 Reset button placement (Tasks 2 & 3)

**AdminTickets (`AdminTickets.js:103` grid):**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
  {/* search input — mövcud */}
  {/* status select — mövcud */}
  {/* priority select — mövcud */}
  {/* companyId select — mövcud */}
  {/* YENİ: reset button */}
  <button
    type="button"
    onClick={handleReset}
    disabled={!isFiltered}
    className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
  >
    <RotateCcw className="w-4 h-4" />
    <span>Filteri sıfırla</span>
  </button>
</div>
```

**`RotateCcw` ikonu** `lucide-react`-dan import olunur (artıq layihədə istifadə olunur).

**TicketFilters (`TicketFilters.js:29` grid):**
```jsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-3">
  {/* search input — mövcud */}
  {/* status select — mövcud */}
  {/* priority select — mövcud */}
  {/* YENİ: reset button */}
  <button
    type="button"
    onClick={handleReset}
    disabled={!isFiltered}
    className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
  >
    <RotateCcw className="w-4 h-4" />
    <span>Filteri sıfırla</span>
  </button>
</div>
```

**State davranışı:** Reset → `onChange({ ...defaults })` çağırılır → parent state yenilənir → `useEffect` filter dependency-ə görə auto-fetch tetikler.

### 5.2 Confirm password field (Task 5)

**UserProfile.js (Yeni input, mövcud Yeni şifrə input-ından sonra):**
```jsx
<div>
  <label className="block text-sm font-medium text-slate-700 mb-1">Yeni şifrənin təkrarı</label>
  <div className="relative">
    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    <input
      type={showConfirmPw ? 'text' : 'password'}
      value={passwordData.confirmPassword}
      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
      disabled={savingPassword}
      className="w-full pl-10 pr-10 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
    />
    <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
      {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  </div>
</div>
```

**handlePasswordSubmit validation (UserProfile.js:48-67):**
```js
const handlePasswordSubmit = async (e) => {
  e.preventDefault();
  setPasswordError('');

  const currErr = validateRequired(passwordData.currentPassword, 'Cari şifrə');
  if (currErr) return setPasswordError(currErr);
  const newErr = validatePassword(passwordData.newPassword);
  if (newErr) return setPasswordError(newErr);

  // YENİ: confirm password match
  if (passwordData.newPassword !== passwordData.confirmPassword) {
    return setPasswordError('Yeni şifrə və təkrarı uyğun deyil');
  }

  setSavingPassword(true);
  try {
    await userApi.put('/profile/password', passwordData, { _skipAuthRedirect: true });
    toast.success('Şifrə uğurla dəyişdirildi');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  } catch (error) {
    setPasswordError(error.response?.data?.message || 'Şifrə dəyişdirilmədi');
  } finally {
    setSavingPassword(false);
  }
};
```

**AdminProfile.js:** Eyni dəyişiklik (state, validation, input, success reset).

**Validation sırası:**
1. `currentPassword` boş deyil
2. `newPassword` valid format (min 6 simvol)
3. `newPassword === confirmPassword`
4. Backend call

---

## 6. Error Handling

### 6.1 Task 1 — companies load fail

**Ssenari:** Backend 500 və ya network xətası.

**Mövcud davranış:** `console.error(e)` — istifadəçi heç bir feedback görmür, dropdown boş qalır.

**Yeni davranış:** Eyni (console.error). Error banner göstərmək YAGNI (filter dropdown hələ işləyir — yalnız "Bütün şirkətlər" seçimi istifadə olunur). İstifadəçi filter istifadə etməsə problem yaşamır.

### 6.2 Task 4 — skip flag diaqnostika

Əgər gələcəkdə başqa endpoint də 401 qaytarmalı olsa və logout olmamalısa, eyni pattern istifadə olunur. Comment əlavə olunur:

```js
// utils/userApi.js interceptor
// Skip flag istifadəsi: axios call-da `{ _skipAuthRedirect: true }` 3-cü argument kimi ötürülür.
// Bu, 401 qaytaran endpoint-lərdə (məs. səhv current password) logout-un qarşısını alır.
```

### 6.3 Task 5 — confirm mismatch

Əgər `newPassword !== confirmPassword`:
- `setPasswordError('Yeni şifrə və təkrarı uyğun deyil')`
- Mövcud error banner komponenti (`UserProfile.js:123-128`, `AdminProfile.js:119-124`) göstərilir
- Backend call baş vermir

---

## 7. Testing Plan

FB-2 frontend-only task olduğu üçün manual browser smoke test kifayətdir. Backend testləri dəyişmir (FB-2 scope xaricindədir).

### 7.1 Manual Smoke Test (10 ssenari)

**Setup:** Backend + frontend işə sal, həm user, həm admin hesabla login ol.

#### Admin Panel Tests

| # | Test | Gözlənilən |
|---|------|------------|
| A1 | `/admin/tickets` səhifəsi açılır → "Bütün şirkətlər" dropdown-a kliklənir | Bütün şirkətlər görsənir (aktiv+passiv) |
| A2 | Şirkət filter seçilir → table filter olunur | Yalnız həmin şirkətin müraciətləri görsənir |
| A3 | Search input + Status + Priority filterləri dəyişdirilir → "Filteri sıfırla" düyməsi | Düymə aktiv olur (disabled=false) |
| A4 | "Filteri sıfırla" kliklənir | Bütün filterlər default-a qayıdır, table bütün müraciətləri göstərir, düymə deaktiv olur |
| A5 | "Filteri sıfırla" kliklənir (filter boş ikən) | Heç bir şey baş vermir (disabled=true) |

#### User Panel Tests

| # | Test | Gözlənilən |
|---|------|------------|
| U1 | `/tickets` səhifəsi açılır → search yazılır + status seçilir → "Filteri sıfırla" düyməsi | Düymə aktiv olur |
| U2 | "Filteri sıfırla" kliklənir | Search + status sıfırlanır, table bütün müraciətləri göstərir |

#### Profile Tests (User + Admin)

| # | Test | Gözlənilən |
|---|------|------------|
| P1 | User Profile → Şifrəni dəyişdir → "Cari şifrə" səhv yazılır → submit | "Şifrə yanlışdır" (və ya backend message) göstərilir, **logout olmur**, profile səhifəsində qalır |
| P2 | Admin Profile → Şifrəni dəyişdir → "Cari şifrə" səhv yazılır → submit | Eyni P1 davranışı (admin üçün) |
| P3 | User Profile → Yeni şifrə: "abc123", Təkrar: "abc456" → submit | "Yeni şifrə və təkrarı uyğun deyil" göstərilir, backend call olmur |
| P4 | User Profile → Yeni şifrə: "abc123", Təkrar: "abc123" → submit | Şifrə uğurla dəyişdirilir, toast göstərilir, bütün input-lar sıfırlanır |
| P5 | Admin Profile → eyni P3 və P4 davranışı | Eyni (admin üçün) |

### 7.2 Build Verification

```bash
cd Ticket-Frontend
npm run build
# Expected: SUCCESS, no errors, bundle size < ~125 kB (current 124.06 kB)
```

### 7.3 Regression Check

Browser-də manual olaraq:
- Login (user + admin) → hələ işləyir
- 401 ssenari (token manually expired edib) → logout hələ işləyir (skip flag olmayan endpoint üçün)
- Pagination (AdminTickets, UserTickets, AdminCompanies) → hələ işləyir
- Mövcud bütün naviqasiya → hələ işləyir

---

## 8. Migration / Rollout

**Migration tələb olunmur.** Heç bir schema, dependency, environment variable dəyişikliyi yoxdur.

**Rollout:** Sadəcə `git pull` + `npm run build` + deploy (Vercel/Netlify/NGINX).

---

## 9. Risk və YAGNI

| Mövzu | Yanaşma |
|-------|---------|
| Companies load-u performance (100 şirkət) | Mövcud data ölçüsü ilə OK; pagination YAGNI |
| Real-time confirm password match | Submit-time validation kifayətdir; onChange validation YAGNI |
| Yeni confirm field üçün ayrı test komponenti | Mövcud pattern-lər istifadə olunur (Yeni şifrə input-ı kimi), komponentin abstraction-ı YAGNI |
| TicketFilters reset üçün yeni prop | Mövcud `onChange` prop istifadə olunur, yeni prop YAGNI |
| Toast əvəzinə inline success message | Mövcud toast pattern saxlanır (Yeni şifrə input-ı ilə eyni) |

---

## 10. Dəyişən Fayllar (Xülasə)

| Fayl | Dəyişiklik | Sətir (təxmini) |
|------|-----------|------------------|
| `src/pages/admin/AdminTickets.js` | Task 1 (1 sətir fix), Task 2 (handleReset + button + isFiltered) | +20 / -2 |
| `src/components/tickets/TicketFilters.js` | Task 3 (handleReset + button + isFiltered) | +18 / 0 |
| `src/utils/userApi.js` | Task 4 (`&& !error.config?._skipAuthRedirect`) | +1 / 0 |
| `src/utils/adminApi.js` | Task 4 (eyni) | +1 / 0 |
| `src/pages/UserProfile.js` | Task 4 (1 sətir), Task 5 (state, validation, input) | +25 / -1 |
| `src/pages/AdminProfile.js` | Task 4 (1 sətir), Task 5 (state, validation, input) | +25 / -1 |

**Cəmi:** ~6 fayl, +90 / -4 sətir (təxmini).

---

## 11. Uğur Meyarları

- [ ] `npm run build` SUCCESS
- [ ] 10 manual smoke test (Section 7.1) keçir
- [ ] Mövcud heç bir feature regression olmur (login, pagination, navigation)
- [ ] Bundle size artımı < 2 kB (cəmi 6 fayl, kiçik dəyişikliklər)

---

## 12. Əlaqəli Sənədlər

- **FB-1 spec:** `docs/superpowers/specs/2026-06-27-ticket-fixes-batch-design.md` (cascading logic üçün referans)
- **Mövcud profile testləri:** `Backend/tests/profile.test.js:81-127` (PUT /api/profile/password test pattern, dəyişmir)
- **axios skip flag pattern:** https://axios-http.com/docs/interceptors (config object extensibility)

---

**Son:** Bu sənəd 5 task-ın (1 bug fix + 2 reset button + 1 401 fix + 1 confirm password) design sənədidir. Bütün dəyişikliklər frontend-only, heç bir backend dəyişikliyi yoxdur. Implementation plan-ı writing-plans skill ilə yaradılacaq.