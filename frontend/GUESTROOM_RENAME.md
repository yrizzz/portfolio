# Guestbook → Guestroom Rename

## ✅ Changes Applied:

### 1. Folders Renamed:
- `src/app/guestbook/` → `src/app/guestroom/`

### 2. Files Renamed:
- `components/custom-guestbook.tsx` → `components/custom-guestroom.tsx`
- `components/waline-guestbook.tsx` → `components/waline-guestroom.tsx`

### 3. Code Updated:
- All imports updated
- All function names updated
- All text content updated
- Navigation links updated

### 4. Routes:
- Old: `/guestbook`
- New: `/guestroom`

## 🧪 Testing:

1. **Frontend Public:**
   - Visit: `http://localhost:3000/guestroom`
   - Should show "Guestroom" title
   - Form should work
   - Messages should display

2. **Admin Panel:**
   - Visit: `http://localhost:3000/admin/messages`
   - Should show "Manage guestroom messages and replies"
   - All functionality should work

3. **Navigation:**
   - Click "Guestroom" in navigation
   - Should navigate to `/guestroom`

## 📊 Summary:

- ✅ 0 occurrences of "guestbook" remaining
- ✅ 5 occurrences of "Guestroom" found (correct)
- ✅ All files renamed
- ✅ All imports updated
- ✅ All routes updated

## 🔄 Rollback (if needed):

```bash
cd frontend/src
mv app/guestroom app/guestbook
mv components/custom-guestroom.tsx components/custom-guestbook.tsx
mv components/waline-guestroom.tsx components/waline-guestbook.tsx

# Then run reverse sed
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's/guestroom/guestbook/g; s/Guestroom/Guestbook/g' {} \;
```
