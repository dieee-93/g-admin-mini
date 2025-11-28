# Auth Configuration Security Recommendations

**Generated**: November 17, 2025  
**Project**: G-Mini v3.1 - Restaurant Management System  
**Status**: PENDING IMPLEMENTATION (Non-Database Changes)

---

## 📋 Overview

After completing database security hardening (87 functions + 2 materialized views), the following **Supabase Auth configuration** warnings remain. These require changes in the Supabase Dashboard, not database migrations.

**Total Pending Warnings**: 3 (all WARN level, not ERROR)

---

## ⚠️ Pending Auth Warnings

### 1. 🔐 **OTP Expiry Configuration** (WARN)

**Linter Output**:
```json
{
  "name": "auth_otp_long_expiry",
  "level": "WARN",
  "detail": "OTP expiry set to more than an hour. Recommended to set to less than an hour."
}
```

**Security Risk**:
- **Impact**: Extended window for OTP interception/reuse attacks
- **Current**: >1 hour expiry
- **Recommended**: <1 hour (ideally 10-15 minutes)

**Remediation Steps**:
1. Go to **Supabase Dashboard** → Authentication → Email Templates
2. Locate **OTP Expiry** setting
3. Change from current value to **600 seconds** (10 minutes) or **900 seconds** (15 minutes)
4. Click **Save**

**Rationale**:
Shorter OTP windows reduce the attack surface for:
- Email forwarding attacks
- Session hijacking
- Social engineering attempts

---

### 2. 🛡️ **Leaked Password Protection** (WARN)

**Linter Output**:
```json
{
  "name": "auth_leaked_password_protection",
  "level": "WARN",
  "detail": "Leaked password protection is currently disabled."
}
```

**Security Risk**:
- **Impact**: Users can set compromised passwords from data breaches
- **Database**: HaveIBeenPwned.org (600M+ leaked passwords)
- **Attack Vector**: Credential stuffing, rainbow table attacks

**Remediation Steps**:
1. Go to **Supabase Dashboard** → Authentication → Policies
2. Enable **"Check against known leaked passwords"**
3. Optional: Set **minimum password strength** (default: Good)
4. Click **Save**

**Behavior After Enable**:
- Sign-up: Blocks passwords found in breach databases
- Password change: Validates against HaveIBeenPwned API
- User feedback: "This password has been compromised"

**Cost**: Zero (Supabase feature, no additional charges)

---

### 3. 🔄 **PostgreSQL Version Upgrade** (WARN)

**Linter Output**:
```json
{
  "name": "vulnerable_postgres_version",
  "level": "WARN",
  "detail": "Current version supabase-postgres-17.4.1.064 has outstanding security patches."
}
```

**Security Risk**:
- **Impact**: Missing critical security patches (CVEs)
- **Current**: PostgreSQL 17.4.1.064
- **Available**: Newer patched versions

**Remediation Steps**:

⚠️ **CRITICAL: This requires downtime planning**

1. **Pre-Upgrade Checklist**:
   - [ ] Schedule maintenance window (suggest: off-peak hours)
   - [ ] Notify users of planned downtime
   - [ ] Take full database backup via Supabase Dashboard
   - [ ] Review release notes for breaking changes

2. **Upgrade Process**:
   - Go to **Supabase Dashboard** → Settings → Infrastructure
   - Click **"Upgrade available"** banner
   - Review changes and confirm
   - Wait for upgrade completion (typically 5-15 minutes)

3. **Post-Upgrade Validation**:
   - [ ] Run `supabase db lint` again to confirm patched version
   - [ ] Test critical application flows (auth, sales, inventory)
   - [ ] Monitor error logs for 24 hours

**Frequency**: Check quarterly for new patches

---

## 📊 Priority Ranking

| Priority | Warning | Risk Level | Effort | Downtime |
|----------|---------|------------|--------|----------|
| 🔴 **HIGH** | Leaked Password Protection | Medium | 2 min | None |
| 🟡 **MEDIUM** | OTP Expiry | Low | 1 min | None |
| 🟢 **LOW** | PostgreSQL Upgrade | Low | 15 min | Yes (5-15 min) |

**Recommended Order**:
1. **Enable Leaked Password Protection** (immediate, zero downtime)
2. **Reduce OTP Expiry** (immediate, zero downtime)
3. **Schedule PostgreSQL Upgrade** (plan for next maintenance window)

---

## ✅ Implementation Checklist

### Phase 1: Immediate (No Downtime) - Est. 5 minutes
- [ ] Enable leaked password protection
- [ ] Set OTP expiry to 10-15 minutes
- [ ] Test new sign-up flow with compromised password
- [ ] Test OTP email delivery and expiry

### Phase 2: Planned Upgrade - Est. 30 minutes (includes validation)
- [ ] Schedule maintenance window (date: _______, time: _______)
- [ ] Notify team/users of downtime
- [ ] Take pre-upgrade backup
- [ ] Execute PostgreSQL upgrade
- [ ] Run post-upgrade validation tests
- [ ] Re-run `supabase db lint` to confirm 0 WARN

---

## 🔍 Validation Commands

After implementing changes, verify fixes:

```bash
# Run linter to check for remaining warnings
supabase db lint

# Expected output after full implementation:
# - auth_otp_long_expiry: 0 warnings ✅
# - auth_leaked_password_protection: 0 warnings ✅
# - vulnerable_postgres_version: 0 warnings ✅
# - function_search_path_mutable: 0 warnings ✅ (already fixed)
# - materialized_view_in_api: 0 warnings ✅ (already fixed)
```

---

## 📚 Related Documentation

- [Supabase Auth Security Best Practices](https://supabase.com/docs/guides/platform/going-into-prod#security)
- [Password Strength and Leaked Password Protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
- [PostgreSQL Version Upgrades](https://supabase.com/docs/guides/platform/upgrading)
- [HaveIBeenPwned API Documentation](https://haveibeenpwned.com/API/v3)

---

## 🎯 Expected Final Security Posture

After completing ALL recommendations (database + auth config):

| Category | Total Issues | Fixed | Remaining | Status |
|----------|--------------|-------|-----------|--------|
| **Database Functions** | 87 | 87 | 0 | ✅ Complete |
| **Materialized Views** | 2 | 2 | 0 | ✅ Complete |
| **Auth Configuration** | 3 | 0 | 3 | ⏳ Pending |
| **Total Security Warnings** | 92 | 89 | 3 | **97% Complete** |

**Status**: **🟢 PRODUCTION READY** after implementing Phase 1 auth changes.  
PostgreSQL upgrade (Phase 2) can be scheduled at next convenient maintenance window.

---

## 📝 Notes

- All database migrations (81-88) completed successfully: **100% success rate**
- Search path injection vulnerabilities eliminated across entire codebase
- Materialized views no longer exposed to anonymous/public API access
- Auth config changes are **non-breaking** and **zero-downtime**

**Last Updated**: November 17, 2025  
**Migration Range**: 81-88 (search_path fixes + materialized views)  
**Total Project Migrations**: 88
