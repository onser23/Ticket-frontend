# Security Audit Report — TicketAPP

**Tarix:** 2026-06-29
**Test sayı:** 32
**Pass:** 28 (27 PASS + 1 INFO-PASS)
**Fail:** 4
**Severity breakdown:** Critical=12/12 ✅, High=9/10 (1 fail), Medium=4/7 (3 fail), Low=1/1 ✅, Informational=1/1 ✅

---

## Xülasə

Backend API (`http://localhost:5000`, 5 node processes) üzərindən real HTTP sorğularla (PowerShell `Invoke-RestMethod` + Node.js `http` modul) 32 testlik tam təhlükəsizlik auditi icra olunub. **Bütün Critical səviyyəli testlər (12/12) keçib** — auth, cross-role access, token manipulation, IDOR və login NoSQL injection sahələrində backend möhkəm davranış göstərir. 4 uğursuz testin hamısı Medium/High səviyyəlidir və əsasən **giriş validasiyası zəifliyi**, **CORS wildcard siyasəti**, **rate limiting olmaması** və **development mühitində stack trace sızması** problemləri ilə bağlıdır.

Müsbət cəhətlər: 2 ayrı JWT secret (user/admin) düzgün tətbiq olunub, `alg:"none"` forged token rədd edilir, cross-secret signed token rədd edilir, IDOR-lar sərt ownership check-ləri ilə bloklanır, MIME-based file upload yoxlaması işləyir, OTP resend üçün cooldown rate limit mövcuddur, user enumeration mümkün deyil.

---

## Test Nəticələri

### Category A: Cross-Role Access (8 test)

| # | Test | Expected | Actual | Status | Severity |
|---|------|----------|--------|--------|----------|
| A1 | User token → `GET /api/companies` | 401/403 | 401 | ✅ PASS | Critical |
| A2 | User token → `GET /api/stats/admin` | 401/403 | 401 | ✅ PASS | Critical |
| A3 | User token → `GET /api/admin/profile` | 401/403 | 401 | ✅ PASS | Critical |
| A4 | User token → `PUT /api/admin/profile/password` | 401/403 | 401 | ✅ PASS | Critical |
| A5 | User token → `DELETE /api/companies/<id>` | 401/403 | 401 | ✅ PASS | Critical |
| A6 | Admin token → `GET /api/profile` | 401/403 | 401 | ✅ PASS | High |
| A7 | Admin token → `GET /api/stats/user` | 401/403 | 401 | ✅ PASS | High |
| A8 | Admin token → `PUT /api/profile/password` | 401/403 | 401 | ✅ PASS | High |

### Category B: Anonymous Access (3 test)

| # | Test | Expected | Actual | Status | Severity |
|---|------|----------|--------|--------|----------|
| B1 | No token → `GET /api/companies` | 401 | 401 | ✅ PASS | Critical |
| B2 | No token → `GET /api/profile` | 401 | 401 | ✅ PASS | Critical |
| B3 | No token → `GET /api/tickets` | 401 | 401 | ✅ PASS | Critical |

### Category C: Invalid/Expired Token (2 test)

| # | Test | Expected | Actual | Status | Severity |
|---|------|----------|--------|--------|----------|
| C1 | Random string token → `GET /api/companies` | 401 | 401 | ✅ PASS | High |
| C2 | Modified token (last char flipped) → `GET /api/profile` | 401 | 401 | ✅ PASS | High |

### Category D: Token Manipulation (2 test)

| # | Test | Expected | Actual | Status | Severity |
|---|------|----------|--------|--------|----------|
| D1 | `alg:"none"` forged token → `GET /api/profile` | 401 | 401 | ✅ PASS | Critical |
| D2 | Token signed with admin secret (userId payload) → `GET /api/profile` | 401 | 401 | ✅ PASS | Critical |

### Category E: IDOR (4 test)

| # | Test | Expected | Actual | Status | Severity |
|---|------|----------|--------|--------|----------|
| E1 | User A → `GET /api/tickets/<User B ticket>` | 403/404 | 403 | ✅ PASS | Critical |
| E2 | User A → `GET /api/profile` (control) | 200 | 200 | ✅ PASS | Control |
| E3 | User A → `PUT /api/comments/<User B comment>` (endpoint does not exist) | 404/405/403 | 404 | ✅ PASS | High |
| E4 | User A → `DELETE /api/tickets/<User B ticket>` | 401/403/404 | 401 | ✅ PASS | High |

### Category F: NoSQL Injection (2 test)

| # | Test | Expected | Actual | Status | Severity |
|---|------|----------|--------|--------|----------|
| F1 | Login `{"email":{"$ne":null},"password":{"$ne":null}}` | 400/401 | 400 | ✅ PASS | Critical |
| F2 | `GET /api/tickets?companyId[$ne]=null&limit=1` (admin) | 400/200 | **500** | ❌ FAIL | High |

### Category G: File Upload (3 test)

| # | Test | Expected | Actual | Status | Severity |
|---|------|----------|--------|--------|----------|
| G1 | Upload `.exe` with `image/jpeg` MIME | 400 | 400 | ✅ PASS | High |
| G2 | Filename path traversal `../../etc/passwd.png` | 400 or 201 (sanitized) | 201 (sanitized to UUID) | ✅ PASS | High |
| G3 | Access uploaded file via `/uploads/...` URL | 200 (public by design) | 200 | ✅ INFO-PASS | Informational |

### Category H: CORS Misconfig (1 test)

| # | Test | Expected | Actual | Status | Severity |
|---|------|----------|--------|--------|----------|
| H1 | Preflight `OPTIONS /api/companies` with `Origin: http://evil.com` | Restrictive ACAO | **ACAO=`*` (wildcard)** | ❌ FAIL | Medium |

### Category I: Rate Limiting (2 test)

| # | Test | Expected | Actual | Status | Severity |
|---|------|----------|--------|--------|----------|
| I1 | 10 rapid wrong-password login attempts | At least one 429 | **All 401** (no rate limit) | ❌ FAIL | Medium |
| I2 | 20 rapid OTP resend requests | At least one 429 | All 429 (after first) | ✅ PASS | Medium |

### Category J: Auth State Bugs (3 test)

| # | Test | Expected | Actual | Status | Severity |
|---|------|----------|--------|--------|----------|
| J1 | Register with existing email | 400 | 400 | ✅ PASS | Medium |
| J2 | `PUT /api/profile/password` with wrong current | 401 | 401 | ✅ PASS | Medium |
| J3 | Forgot password with non-existent email (no enumeration) | 200 (generic) | 200 | ✅ PASS | Medium |

### Category K: HTTP Method Tampering (1 test)

| # | Test | Expected | Actual | Status | Severity |
|---|------|----------|--------|--------|----------|
| K1 | `DELETE /api/auth/login` | 404/405 | 404 | ✅ PASS | Low |

### Category L: Info Disclosure (1 test)

| # | Test | Expected | Actual | Status | Severity |
|---|------|----------|--------|--------|----------|
| L1 | Malformed JSON → check stack trace | 400, no stack | **400 + stack trace leaked** | ❌ FAIL | Medium |

---

## Tapılan Problemler (Yalnız Failed Tests)

### 🟠 HIGH: F2 — NoSQL Injection via Query Param (`companyId`)

- **Endpoint:** `GET /api/tickets?companyId[$ne]=null&limit=1` (admin token)
- **Problem:** Backend `companyId` query param-ı heç bir validasiya olmadan MongoDB query-yə ötürür. Yanlış formatlı dəyər (`null`, `test`, `$ne`, etc.) MongoDB CastError atır və **HTTP 500 Internal Server Error** qaytarır. NODE_ENV=development olduğu üçün **stack trace tamamilə sızır** (file paths, line numbers, Mongoose daxili strukturu).
- **Proof of concept:**
  ```
  GET /api/tickets?companyId%5B%24ne%5D=&limit=1
  → 500 Internal Server Error
  {
    "success": false,
    "message": "Cast to ObjectId failed for value \"null\" (type string) at path \"companyId\" for model \"Ticket\"",
    "stack": "CastError: Cast to ObjectId failed for value \"null\" (type string) at path \"companyId\" for model \"Ticket\"\n    at SchemaObjectId.cast (.../node_modules/mongoose/lib/schema/objectId.js:253:11)\n    ..."
  }
  ```
- **Təsir:** (1) User enumeration və ya NoSQL injection mümkün olmasa da (CastError bypass etmir), (2) Server-side error açıq şəkildə Mongoose/mongo strukturunu sızdırır ki, bu da recon üçün istifadə oluna bilər, (3) Admin və ya user query-sini yanlış ObjectId formatı ilə çağırmaq production-da DoS yarada bilər.
- **Remediation:** `companyId` query-sini mongoose `Types.ObjectId.isValid()` ilə validate et, ya da `express-validator` middleware əlavə et. Həmçinin bütün `req.query`-i whitelist et.

```js
// routes/tickets.js (line ~127)
if (companyId) {
  if (!mongoose.Types.ObjectId.isValid(companyId)) {
    return res.status(400).json({ success: false, message: 'Yanlış companyId formatı' });
  }
  query.companyId = companyId;
}
```

---

### 🟡 MEDIUM: H1 — CORS Wildcard ACAO (Overly Permissive)

- **Endpoint:** `OPTIONS /api/companies` (preflight from any origin)
- **Problem:** Bütün origin-lərdən gələn sorğulara `Access-Control-Allow-Origin: *` qaytarılır. `server.js:23` `app.use(cors())` default wildcard istifadə edir, həm də `:26`-da explicit header əlavə olunub. Hal-hazırda API `Authorization: Bearer <token>` istifadə edir (cookie deyil), ona görə credentialed CORS riski aşağıdır, amma:
  - Browser mühitində malicious sayt production API-ni çağıra bilər (data exfiltration)
  - Production-da frontend URL-i `http://localhost:3000`-dir (.env `FRONTEND_URL`), amma cors wildcard bunu ignore edir
- **Proof of concept:**
  ```
  OPTIONS /api/companies
  Origin: http://evil.com
  Access-Control-Request-Method: GET
  
  ← 204 No Content
  ← access-control-allow-origin: *
  ← access-control-allow-methods: GET,HEAD,PUT,PATCH,POST,DELETE
  ```
- **Təsir:** CSRF-style data exfiltration mümkündür; phishing saytı user-in token-ı olmadan belə public data-ları (companies list) oxuya bilər. Authenticated endpoints üçün Bearer token tələb olunduğundan account takeover riski aşağıdır, amma endpoint enumeration və DoS surface artır.
- **Remediation:** CORS-u whitelist mode-a keçir:
  ```js
  // server.js
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  }));
  // Remove lines 26-32 (explicit Access-Control-Allow-Origin: *)
  ```

---

### 🟡 MEDIUM: I1 — No Rate Limiting on Login (Brute-Force Risk)

- **Endpoint:** `POST /api/auth/login`
- **Problem:** Login endpoint-də heç bir IP-based və ya account-based rate limiting yoxdur. 10 ardıcıl səhv şifrə cəhdi hamısı 401 qaytarır, heç bir 429 yoxdur. `bcrypt(10 rounds)` CPU cost-u yavaşladır, amma bu yetərli deyil — paralel HTTPS request-lər ilə saniyədə minlərlə cəhd mümkündür.
- **Proof of concept:**
  ```
  POST /api/auth/login × 10 (rapid)
  Body: { "email": "auditor_9777219@test.com", "password": "Wrong1!" }
  → All 10 responses: 401 Unauthorized
  → No 429, no lockout, no delay escalation
  ```
- **Təsir:** Brute-force və credential stuffing hücumları mümkündür. Ələlxüsus zəif şifrəli user-lər üçün real risk.
- **Remediation:** `express-rate-limit` middleware əlavə et:
  ```js
  // routes/auth.js (line ~161)
  const rateLimit = require('express-rate-limit');
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 10,                   // 10 attempts per IP per window
    message: { success: false, message: 'Çoxlu cəhd. 15 dəqiqə sonra yenidən yoxlayın.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  router.post('/login', loginLimiter, loginValidation, handleValidation, async (req, res, next) => { ... });
  ```
  Həmçinin `/api/auth/resend-otp` üçün artıq mövcud olan `OTP_RESEND_COOLDOWN_MS` (60s) IP-based rate limit ilə tamamlansın.

---

### 🟡 MEDIUM: L1 — Stack Trace Leak in Error Responses (Dev Mode)

- **Endpoint:** All POST endpoints that accept JSON (e.g., `POST /api/auth/login`)
- **Problem:** `.env` faylında `NODE_ENV=development` qurulub. `server.js:71` development rejimində `err.stack` response-a əlavə edir:
  ```js
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Daxili server xətası',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
  ```
  Nəticədə malformed JSON, MongoDB error, və s. zamanı **tam stack trace** (fayl yolları, Mongoose/Express daxili strukturu, server file system layout) response body-də sızır.
- **Proof of concept:**
  ```
  POST /api/auth/login
  Content-Type: application/json
  Body: '{"email":
  
  → 400 Bad Request
  {
    "success": false,
    "message": "Unexpected end of JSON input",
    "stack": "SyntaxError: Unexpected end of JSON input\n    at JSON.parse (<anonymous>)\n    at parse (.../body-parser/lib/types/json.js:92:19)\n    at .../body-parser/lib/read.js:128:18\n    at AsyncResource.runInAsyncScope (.../async_hooks:214:14)\n    ..."
  }
  ```
- **Təsir:** Production server file structure, dependency versiyaları, code paths sızdırılır — recon və targeted exploit üçün istifadə oluna bilər.
- **Remediation:** Production deployment-də `NODE_ENV=production` mütləqdir. Əlavə olaraq, hətta development-da `stack` field-i yalnız `err.statusCode >= 500` olduqda əlavə edilsin (validation error üçün stack trace göstərmək mənasızdır):
  ```js
  // server.js:66-73
  app.use((err, req, res, next) => {
    console.error(err.stack);  // həmişə server log-a yaz
    const isProd = process.env.NODE_ENV === 'production';
    res.status(err.statusCode || 500).json({
      success: false,
      message: isProd ? 'Daxili server xətası' : (err.message || 'Daxili server xətası'),
      ...((!isProd && err.statusCode >= 500) && { stack: err.stack }),
    });
  });
  ```

---

## Tövsiyələr

### Yüksək Prioritet (Production deployment əvvəli)

1. **F2 — ObjectId validation:** Bütün route-larda `req.params.id`, `req.query.companyId` və s. ObjectId qəbul edən field-ləri `mongoose.Types.ObjectId.isValid()` ilə validate et. Bu, həm 500 error-ların qarşısını alacaq, həm də stack trace sızmasını azaldacaq.

2. **H1 — CORS restrictiv et:** Production deployment əvvəli `server.js:23` və `:26-32` sətirlərini `.env`-dəki `FRONTEND_URL`-ə bağlı whitelist mode-a çevir.

3. **I1 — Login rate limiting:** `express-rate-limit` middleware `POST /api/auth/login` və `POST /api/auth/forgot-password` üçün əlavə et. Mövcud OTP cooldown-u IP-based ilə tamamla.

4. **L1 — Production mode:** `.env`-də `NODE_ENV=production` təyin et (deploy zamanı mütləq). Error response-da yalnız 5xx üçün stack trace göstər.

### Orta Prioritet

5. **Comments route-a PUT/DELETE əlavə et:** Hazırda `/api/comments/:id` endpoint-i yoxdur (E3 test 404 qaytarır). Frontend comment edit/delete UI varsa, bu endpoint-ləri **auth + ownership check** ilə əlavə et (eyni pattern tickets.js:175-200 kimi).

6. **IDOR consistency yoxlaması:** E1 və comments GET/POST-da ownership check var, amma admin üçün bərabər qorunma yoxdur (admin bilərəkdən başqasının ticket-ına baxa bilər — bu design olaraq normaldır). Production üçün admin actionları üçün audit log əlavə et.

7. **Email enumeration riski:** Register endpoint-i (`/api/auth/register`) mövcud email üçün 400 qaytarır, bu user enumeration-a imkan verir. Reset-password (`/api/auth/forgot-password`) isə J3 kimi generic 200 qaytarır. Register-i də generic 201 qaytarmalı, OTP email real cavabla göndərilməlidir (email göndərmə yalnız mövcud user üçün).

8. **JWT secret rotation:** `.env`-dəki `JWT_USER_SECRET` və `JWT_ADMIN_SECRET` "dev-...-change-in-prod" placeholder-dir. Production deploy-da `openssl rand -hex 64` ilə generate et.

9. **CORS Access-Control-Allow-Credentials yoxdur** — bu yaxşıdır (Bearer auth istifadə olunur, cookie yox), amma `Authorization` header-ı ACA-Headers-da var ki, bu da wildcard ilə birlikdə browser-lərdə credentialed-like davranış yarada bilər.

### Aşağı Prioritet

10. **HTTP method whitelist:** `DELETE /api/auth/login` 404 qaytarır (express default behavior). Method-level whitelist (yalnız allowed methods) explicit 405 qaytara bilər.

11. **Rate-limit header-lər:** Express rate-limit istifadə olunduqda `Retry-After`, `X-RateLimit-Remaining` header-ları əlavə edilsin.

12. **Security headers:** Helmet middleware əlavə et (`X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`).

---

## Yaxşı Tərəflər

- **JWT secret ayrılığı:** User və admin token-ləri tam ayrı secret-lərlə imzalanır. Cross-secret token (D2) və `alg:"none"` forged token (D1) uğurla rədd edilir.
- **auth/authOrAdmin/adminAuth middleware düzgün işləyir:** Hər 8 cross-role test (A1-A8) user/admin token-lərini düzgün ayırır, səhv rolda token göndəriləndə 401 qaytarır.
- **IDOR qorunması möhkəmdir:** Ticket GET (E1), Comment GET/POST — hər ikisində `isOwner || isAdmin` yoxlaması var (`routes/tickets.js:187-189`, `routes/comments.js:32-35,67-70`). Test user-ı başqa user-in ticket-ına baxa bilmir.
- **NoSQL injection body-də bloklanır:** Login validation `email` üçün regex yoxlaması edir (`utils/validators.js:14`), ona görə `{"email":{"$ne":null}}` payload-u validation-dan keçmir, 400 qaytarır (F1 PASS).
- **MIME-based file upload validation:** `.exe` faylı `image/jpeg` MIME ilə göndərildikdə 400 rədd edilir (G1 PASS). Mimetype + extension hər ikisi yoxlanılır (`routes/tickets.js:60-72`).
- **Path traversal filename sanitization:** `../../etc/passwd.png` filename-i multer tərəfindən UUID-ə çevrilir (`{uuid}.png`), path traversal komponenti diskə yazılmır (G2 PASS).
- **OTP resend rate limiting:** `OTP_RESEND_COOLDOWN_MS` (60 saniyə) cooldown işləyir, ikinci resend cəhdi 429 qaytarır (I2 PASS).
- **Forgot-password anti-enumeration:** Mövcud olmayan email ilə forgot-password `Əgər email mövcuddursa, reset kodu göndərildi` mesajı qaytarır — user enumeration mümkün deyil (J3 PASS).
- **Atomic register:** Register endpoint-i mongoose transaction istifadə edir, User + Company atomically yaradılır, OTP yaradılması da transaction daxilindədir (`routes/auth.js:21-61`). Crash recovery üçün etibarlıdır.
- **Cascading deactivation:** Company deaktiv edildikdə User də deaktiv olur (`routes/companies.js:125-127, 145`), orphaned active user-lar qalmır.
- **404 handler universal:** Tanınmayan route-lar `{"success":false,"message":"Route tapılmadı"}` qaytarır, server fingerprinting çətinləşir.

---

## Test İcra Qeydləri

- **Real DB (MongoDB Atlas):** Testlər real `ticket_system` database-ə qarşı icra olunub. Test user-lər `auditor_<rand>@test.com` və `victim_<rand>@test.com` formatında unique email-lərlə yaradılıb (DB-də qalırlar, manual cleanup tələb olunmur, amma arzu olunarsa `User.deleteOne({email: /^auditor_|victim_/})` ilə silinə bilər).
- **Test victim ticket:** `victim_1731182899@test.com` user-ın yaratdığı `6a4257724d249df22b5d39ad` ID-li ticket saxlanılıb, IDOR testləri üçün istifadə olunub (real data deyil, audit tərəfindən yaradılıb).
- **Token manipulation üçün:** `alg:none` token və admin secret ilə signed token Node.js ilə birbaşa generate olunub, real JWT modul istifadə edilib.
- **CORS preflight test:** Browser-də deyil, raw HTTP client (Node.js `http` modul) ilə icra olunub ki, OPTIONS response headers tam görünsün.
- **Limitations:** Yalnız API səviyyəsi test edilib (browser XSS, clickjacking, CSP headers yoxlanılmayıb). File upload yalnız filename sanitization səviyyəsində yoxlanılıb, disk-level path traversal test edilməyib (multer UUID generation-ı səbəbindən zəif nöqtə yoxdur).

---

**Hesabat:** 32 test, 28 PASS / 4 FAIL, 0 Critical fail, 1 High fail (F2), 3 Medium fail (H1, I1, L1).
**Növbəti addım:** İstifadəçi qərarı — failed testlər üçün remediation commit-ləri (ayrı task), yoxsa bu hesabatı olduğu kimi qəbul edib manual review.