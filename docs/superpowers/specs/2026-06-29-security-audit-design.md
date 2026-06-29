# TicketAPP Security Audit — Design

**Tarix:** 2026-06-29
**Status:** APPROVED
**Repo:** `Ticket-Backend` (test mühiti: localhost:5000)
**Növ:** Investigation / Audit (yeni feature deyil)

---

## 1. Xülasə

Tam təhlükəsizlik auditi — 32 test, 12 kateqoriya. Real HTTP sorğularla (PowerShell `Invoke-RestMethod`) backend davranışı yoxlanılır. Nəticələr `docs/superpowers/reports/2026-06-29-security-audit.md` hesabatında sənədləşdirilir.

| Prioritet | Kateqoriya | Test sayı | Severity (max) |
|-----------|------------|-----------|----------------|
| A | Cross-role access (user↔admin) | 8 | Critical |
| B | Anonymous access | 3 | Critical |
| C | Invalid/expired token | 2 | High |
| D | Token manipulation (alg:none, cross-secret) | 2 | Critical |
| E | IDOR (başqasının resurslarına giriş) | 4 | Critical |
| F | NoSQL injection | 2 | Critical |
| G | File upload | 3 | High |
| H | CORS misconfig | 1 | Medium |
| I | Rate limiting | 2 | Medium |
| J | Auth state bugs | 3 | Medium |
| K | HTTP method tampering | 1 | Low |
| L | Info disclosure | 1 | Medium |
| **Cəmi** | | **32** | |

---

## 2. Test Kataloqu (Detallı)

### A. Cross-Role Access (8 test)

| # | Test | Ssenari | Gözlənilən | Severity |
|---|------|---------|------------|----------|
| A1 | User token → `GET /api/companies` | Şirkətlər siyahısı | 401/403 | Critical |
| A2 | User token → `GET /api/stats/admin` | Admin stats | 401/403 | Critical |
| A3 | User token → `GET /api/admin/profile` | Admin profil | 401/403 | Critical |
| A4 | User token → `PUT /api/admin/profile/password` | Admin şifrə dəyiş | 401/403 | Critical |
| A5 | User token → `DELETE /api/companies/:id` | Şirkət sil | 401/403 | Critical |
| A6 | Admin token → `GET /api/profile` | User profil | 401/403 | High |
| A7 | Admin token → `GET /api/stats/user` | User stats | 401/403 | High |
| A8 | Admin token → `PUT /api/profile/password` | User şifrə dəyiş | 401/403 | High |

### B. Anonymous Access (3 test)

| # | Test | Gözlənilən | Severity |
|---|------|------------|----------|
| B1 | No token → `GET /api/companies` | 401 | Critical |
| B2 | No token → `GET /api/profile` | 401 | Critical |
| B3 | No token → `GET /api/tickets` | 401 | Critical |

### C. Invalid/Expired Token (2 test)

| # | Test | Gözlənilən | Severity |
|---|------|------------|----------|
| C1 | Random string → `GET /api/companies` | 401 | High |
| C2 | Expired token → `GET /api/profile` | 401 | High |

### D. Token Manipulation (2 test)

| # | Test | Gözlənilən | Severity |
|---|------|------------|----------|
| D1 | `alg: "none"` forged token | 401 (jwt.verify reject) | Critical |
| D2 | User token signed with admin secret | 401 (different secret) | Critical |

### E. IDOR (4 test)

| # | Test | Gözlənilən | Severity |
|---|------|------------|----------|
| E1 | User A token → başqa user-in ticket `GET /api/tickets/:id` | 403/404 (ownership check) | Critical |
| E2 | User A token → öz profil `GET /api/profile` | 200 (control test) | — |
| E3 | User A token → başqa user-in şərhinə PUT | 403/404 | High |
| E4 | User A token → başqa user-in ticket-ini DELETE | 403/404 | High |

### F. NoSQL Injection (2 test)

| # | Test | Gözlənilən | Severity |
|---|------|------------|----------|
| F1 | Login `{"email":{"$ne":null},"password":{"$ne":null}}` | 400/401 (no bypass) | Critical |
| F2 | Query param `?companyId[$ne]=` | Sanitize/400 | High |

### G. File Upload (3 test)

| # | Test | Gözlənilən | Severity |
|---|------|------------|----------|
| G1 | `.exe` upload image MIME ilə | 400 (mime check) | High |
| G2 | Filename path traversal `../../etc/passwd` | Sanitize | High |
| G3 | Başqa user-in upload-ına URL girişi | Allowed (public by design) | Informational |

### H. CORS Misconfig (1 test)

| # | Test | Gözlənilən | Severity |
|---|------|------------|----------|
| H1 | `Origin: http://evil.com` preflight | No ACAO wildcard, yaxud restrict origin | Medium |

### I. Rate Limiting (2 test)

| # | Test | Gözlənilən | Severity |
|---|------|------------|----------|
| I1 | 10 rapid login attempts | Rate limit 429 (yoxdursa → fail) | Medium |
| I2 | 100 rapid OTP requests | Rate limit 429 (yoxdursa → fail) | Medium |

### J. Auth State Bugs (3 test)

| # | Test | Gözlənilən | Severity |
|---|------|------------|----------|
| J1 | Mövcud email ilə register | 400 | Medium |
| J2 | Səhv current password ilə change-password | 401 (not 500) | Medium |
| J3 | Mövcud olmayan user ilə forgot-password | 200 (no user enumeration) | Medium |

### K. HTTP Method Tampering (1 test)

| # | Test | Gözlənilən | Severity |
|---|------|------------|----------|
| K1 | `DELETE /api/auth/login` | 404/405 | Low |

### L. Info Disclosure (1 test)

| # | Test | Gözlənilən | Severity |
|---|------|------------|----------|
| L1 | Production mode error response | No stack trace | Medium |

---

## 3. Test İcra Metodologiyası

**Tool:** PowerShell `Invoke-RestMethod` (cross-platform curl alternativi, JSON parse dəstəyi ilə)

**Test data setup (real DB-yə):**
```powershell
# Auditor user yarat
$body = @{
  firstName = "Auditor"
  lastName = "User"
  email = "auditor@test.com"
  password = "AuditorPass123!"
  companyName = "Audit Co"
  companyOriginalName = "Audit Co"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $body -ContentType "application/json"
```

**Login flow:**
```powershell
$userLogin = @{
  email = "auditor@test.com"
  password = "AuditorPass123!"
} | ConvertTo-Json
$userResp = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $userLogin -ContentType "application/json"
$userToken = $userResp.token

# Admin login (default admin yoxdursa, register + manual role yaradılmalı)
$adminLogin = @{
  username = "admin"
  password = "admin123"
} | ConvertTo-Json
$adminResp = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/auth/login" -Method Post -Body $adminLogin -ContentType "application/json"
$adminToken = $adminResp.token
```

**Test invocation pattern:**
```powershell
$headers = @{ Authorization = "Bearer $userToken" }
try {
  $resp = Invoke-RestMethod -Uri "http://localhost:5000/api/companies" -Method Get -Headers $headers
  Write-Output "FAIL: Got $($resp | ConvertTo-Json -Compress)"
} catch {
  $statusCode = $_.Exception.Response.StatusCode.value__
  $body = $_.ErrorDetails.Message
  Write-Output "PASS: Status=$statusCode Body=$body"
}
```

---

## 4. Hesabat Strukturu

`docs/superpowers/reports/2026-06-29-security-audit.md`:

```markdown
# Security Audit Report — TicketAPP

**Tarix:** 2026-06-29
**Test sayı:** 32
**Pass/Fail:** X / Y
**Severity breakdown:** Critical=X, High=Y, Medium=Z, Low=W

## Test Nəticələri
[32 test, hər biri üçün status + detallar]

## Tapılan Problemler
[Yalnız uğursuz testlər, severity ilə sıralanmış]

## Tövsiyələr
[Hər problem üçün remediation kodu ilə]

## Yaxşı Tərəflər
[Keçən testlərdəki pozitiv tapıntılar]
```

---

## 5. Məhdudiyyətlər

- **Yalnız backend API testləri** — frontend XSS, clickjacking, və s. üçün browser test tələb olardı
- **Real DB ilə** — test mühiti yoxdur, real Atlas DB-yə auditor user yaradılır
- **Yalnız API səviyyəsi** — file upload-da path traversal yalnız filename hissəsində yoxlanılır, disk səviyyəsində deyil
- **Manual execution** — CI/CD-ya inteqrasiya olunmur, sadəcə bir dəfəlik audit

---

## 6. Uğur Meyarları

- [ ] Bütün 32 test icra olunur
- [ ] Hər test üçün PASS/FAIL status
- [ ] Failed testlər üçün severity + remediation
- [ ] Hesabat `docs/superpowers/reports/2026-06-29-security-audit.md` faylında
- [ ] Hesabat commit olunur

---

**Son:** Bu sənəd 32 testli tam təhlükəsizlik auditinin planıdır. Manual curl/PowerShell ilə icra olunur, hesabat faylı tərtib olunur. Fix-lər istifadəçinin qərarından asılıdır (bu task scope xaricindədir).