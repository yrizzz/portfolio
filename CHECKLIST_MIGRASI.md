# ✅ Checklist Migrasi MySQL ke MongoDB

## 📋 Pre-Migration Checklist

### Persiapan
- [ ] MongoDB terinstall
  ```bash
  mongosh --version
  ```
- [ ] MongoDB service berjalan
  ```bash
  sudo systemctl status mongodb
  ```
- [ ] File `.env` sudah ada
- [ ] `MONGODB_URI` sudah ditambahkan ke `.env`
  ```
  MONGODB_URI=mongodb://localhost:27017/porto-db
  ```
- [ ] Backup MySQL sudah dibuat
  ```bash
  mysqldump -u root -p database > backup_$(date +%Y%m%d).sql
  ```

### Dependencies
- [x] Mongoose terinstall
- [x] Semua Mongoose models sudah dibuat (16 models)
- [x] MongoDB connection file sudah dibuat
- [x] Migration scripts sudah dibuat

## 🚀 Migration Process

### Step 1: Migrasi Data
- [ ] Jalankan migration script
  ```bash
  npm run migrate:data
  ```
- [ ] Cek output - semua model berhasil?
- [ ] Tidak ada error di console?

### Step 2: Verifikasi Data
- [ ] Jalankan verification script
  ```bash
  npm run migrate:verify
  ```
- [ ] Semua model match (MySQL count = MongoDB count)?
- [ ] Sample data terlihat benar?

### Step 3: Update API Routes
- [ ] Jalankan update routes script
  ```bash
  npm run migrate:update-routes
  ```
- [ ] Review perubahan di git
  ```bash
  git diff
  ```
- [ ] Tidak ada syntax error?

## 🧪 Testing

### Manual Testing
- [ ] Start development server
  ```bash
  npm run dev
  ```
- [ ] Test homepage loading
- [ ] Test API endpoints:
  - [ ] `/api/projects` - GET
  - [ ] `/api/experiences` - GET
  - [ ] `/api/skills` - GET
  - [ ] `/api/profile` - GET
  - [ ] `/api/api-keys` - GET (with auth)
  - [ ] `/api/licenses` - GET (with auth)

### Authentication Testing
- [ ] Login berfungsi
- [ ] Logout berfungsi
- [ ] Session tersimpan
- [ ] API key validation berfungsi

### CRUD Testing
- [ ] Create - Buat project baru
- [ ] Read - Lihat list projects
- [ ] Update - Edit project
- [ ] Delete - Hapus project

### Admin Features
- [ ] Admin dashboard loading
- [ ] User management berfungsi
- [ ] Stats/analytics tampil
- [ ] API endpoint management berfungsi

## 📊 Data Verification

### MongoDB Shell Verification
```bash
mongosh
use porto-db
```

- [ ] Check collections exist
  ```javascript
  show collections
  ```
- [ ] Count documents
  ```javascript
  db.users.countDocuments()
  db.projects.countDocuments()
  db.apikeys.countDocuments()
  ```
- [ ] Sample data looks correct
  ```javascript
  db.users.findOne()
  db.projects.find().limit(3)
  ```

### Compare with MySQL
- [ ] User count matches
- [ ] Project count matches
- [ ] API key count matches
- [ ] License count matches
- [ ] All other models match

## 🔍 Code Review

### Files Updated
- [x] `/src/lib/mongodb.ts` - Created
- [x] `/src/models/*.ts` - Created (16 files)
- [x] `/src/app/api/projects/route.ts` - Updated
- [x] `/src/lib/api-auth.ts` - Updated
- [x] `/src/lib/license-validator.ts` - Updated
- [ ] `/src/app/api/messages/route.ts` - Needs update
- [ ] `/src/app/api/admin/stats/route.ts` - Needs update
- [ ] `/src/app/api/admin/users/route.ts` - Needs update
- [ ] `/src/lib/gemini.ts` - Needs update
- [ ] `/src/app/api/execute/[...path]/route.ts` - Needs update
- [ ] `/src/app/api/contact-info/route.ts` - Needs update
- [ ] `/src/app/api/experiences/route.ts` - Needs update
- [ ] `/src/app/api/skills/route.ts` - Needs update
- [ ] `/src/app/api/profile/route.ts` - Needs update
- [ ] `/src/app/api/api-keys/route.ts` - Needs update
- [ ] `/src/app/api/api-keys/toggle/route.ts` - Needs update
- [ ] `/src/app/api/licenses/route.ts` - Needs update
- [ ] `/src/app/api/licenses/toggle-renew/route.ts` - Needs update
- [ ] `/src/app/api/logs/route.ts` - Needs update
- [ ] `/src/app/api/config/route.ts` - Needs update
- [ ] `/src/app/api/endpoints/submit/route.ts` - Needs update
- [ ] `/src/app/api/endpoints/review/route.ts` - Needs update
- [ ] `/src/app/api/analytics/route.ts` - Needs update
- [ ] `/src/app/api/docs/route.ts` - Needs update

### Code Quality
- [ ] No TypeScript errors
  ```bash
  npm run build
  ```
- [ ] No ESLint errors
  ```bash
  npm run lint
  ```
- [ ] All imports correct
- [ ] No unused variables
- [ ] Proper error handling

## 🎯 Performance Check

### Response Time
- [ ] API responses < 200ms
- [ ] Page load < 2s
- [ ] No memory leaks

### Database
- [ ] Indexes created properly
  ```javascript
  db.users.getIndexes()
  db.apikeys.getIndexes()
  ```
- [ ] Query performance acceptable
  ```javascript
  db.projects.find().explain("executionStats")
  ```

## 📝 Documentation

- [x] `README_MIGRASI.md` - Created
- [x] `QUICK_START_MIGRASI.md` - Created
- [x] `PANDUAN_MIGRASI_DATA.md` - Created
- [x] `MONGODB_SETUP.md` - Created
- [x] `MONGODB_MIGRATION.md` - Created
- [ ] Update main README.md
- [ ] Update API documentation
- [ ] Update deployment guide

## 🧹 Cleanup (Optional)

### After Successful Migration
- [ ] Remove Prisma dependencies
  ```bash
  npm uninstall @prisma/client prisma @prisma/adapter-mariadb @auth/prisma-adapter
  ```
- [ ] Delete Prisma folder
  ```bash
  rm -rf prisma/
  ```
- [ ] Remove `DATABASE_URL` from `.env`
- [ ] Update `.gitignore` if needed
- [ ] Archive MySQL backup safely

## 🎉 Final Checklist

- [ ] All data migrated successfully
- [ ] All tests passing
- [ ] Application running smoothly
- [ ] No errors in console
- [ ] Performance acceptable
- [ ] Documentation updated
- [ ] Team notified (if applicable)
- [ ] Backup verified and stored safely

## 📊 Migration Summary

**Date Started:** _________________

**Date Completed:** _________________

**Total Records Migrated:** _________________

**Issues Encountered:** 
- _________________
- _________________

**Resolution:**
- _________________
- _________________

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

## ✅ Sign-off

**Migrated by:** _________________

**Verified by:** _________________

**Date:** _________________

---

## 🆘 If Something Goes Wrong

### Rollback Plan
1. Stop the application
2. Restore `.env` to use MySQL
   ```bash
   # Comment MONGODB_URI
   # Uncomment DATABASE_URL
   ```
3. Revert code changes
   ```bash
   git checkout -- src/
   ```
4. Restart application
   ```bash
   npm run dev
   ```
5. Restore MySQL from backup if needed
   ```bash
   mysql -u root -p database < backup.sql
   ```

### Get Help
- Check error logs
- Review documentation
- Check MongoDB status
- Verify connection strings
- Test database connections separately

---

**Status:** 🟡 In Progress | 🟢 Completed | 🔴 Failed

**Current Status:** 🟡 Ready to Start
