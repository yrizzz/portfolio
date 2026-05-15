# MySQL to MongoDB Migration - Complete Setup

## ✅ What Has Been Done

### 1. Dependencies
- ✅ Installed `mongoose` package
- ✅ All Mongoose models created (16 models)

### 2. Database Connection
- ✅ Created `/src/lib/mongodb.ts` with connection pooling
- ✅ Implements singleton pattern for Next.js

### 3. Mongoose Models Created
All 16 models converted from Prisma schema:

```
/src/models/
├── User.ts
├── ApiKey.ts
├── License.ts
├── ApiRequest.ts
├── Project.ts
├── Experience.ts
├── Education.ts
├── Skill.ts
├── Article.ts
├── SocialMedia.ts
├── SiteConfig.ts
├── Account.ts
├── Session.ts
├── VerificationToken.ts
├── Contact.ts
├── ApiEndpoint.ts
└── index.ts (exports all)
```

### 4. Files Already Updated
- ✅ `/src/app/api/projects/route.ts`
- ✅ `/src/lib/api-auth.ts`
- ✅ `/src/lib/license-validator.ts`

### 5. Helper Scripts Created
- ✅ `/scripts/update-to-mongoose.ts` - Automated migration helper
- ✅ `/MONGODB_MIGRATION.md` - Complete migration guide
- ✅ `/.env.example` - Environment template

## 🔧 Setup Instructions

### Step 1: Install MongoDB

**Option A: Local MongoDB**
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Start MongoDB
sudo systemctl start mongodb  # Linux
brew services start mongodb-community  # macOS
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string

### Step 2: Configure Environment

Create or update `.env` file:

```bash
cd /home/yrizzz/Desktop/Porto/frontend
cp .env.example .env
```

Edit `.env` and add:
```
MONGODB_URI=mongodb://localhost:27017/porto-db
# or for Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/porto-db
```

### Step 3: Update Remaining Files

**Option A: Automated (Recommended)**
```bash
cd /home/yrizzz/Desktop/Porto/frontend
npx tsx scripts/update-to-mongoose.ts
```

**Option B: Manual**
Update each file following the pattern in `MONGODB_MIGRATION.md`

### Step 4: Review Changes

After running the script, manually review these files for:
- Complex queries with `include` (need `populate()`)
- ID field references (`id` → `_id`)
- Transaction logic
- Custom query conditions

Files that need special attention:
- `/src/app/api/admin/stats/route.ts` (aggregations)
- `/src/app/api/analytics/route.ts` (complex queries)
- `/src/app/api/execute/[...path]/route.ts` (dynamic execution)

### Step 5: Migrate Data (Optional)

If you have existing MySQL data:

```bash
# Create migration script
npx tsx scripts/migrate-data.ts
```

Or manually export/import:
```bash
# Export from MySQL
mysqldump -u user -p database > backup.sql

# Import to MongoDB (write custom script)
```

### Step 6: Test

```bash
# Start development server
npm run dev

# Test endpoints:
# - http://localhost:3000/api/projects
# - http://localhost:3000/api/experiences
# - http://localhost:3000/api/skills
```

## 📝 Key Differences: Prisma vs Mongoose

### Query Syntax

| Operation | Prisma | Mongoose |
|-----------|--------|----------|
| Find all | `prisma.user.findMany()` | `User.find()` |
| Find by ID | `prisma.user.findUnique({ where: { id } })` | `User.findById(id)` |
| Find one | `prisma.user.findFirst({ where: { email } })` | `User.findOne({ email })` |
| Create | `prisma.user.create({ data })` | `User.create(data)` |
| Update | `prisma.user.update({ where: { id }, data })` | `User.findByIdAndUpdate(id, data)` |
| Delete | `prisma.user.delete({ where: { id } })` | `User.findByIdAndDelete(id)` |
| Count | `prisma.user.count()` | `User.countDocuments()` |

### Query Options

```typescript
// Prisma
const users = await prisma.user.findMany({
  where: { role: 'ADMIN' },
  orderBy: { createdAt: 'desc' },
  take: 10,
  skip: 20,
  select: { id: true, email: true }
});

// Mongoose
const users = await User.find({ role: 'ADMIN' })
  .sort({ createdAt: -1 })
  .limit(10)
  .skip(20)
  .select('email')
  .lean();
```

### Relations

```typescript
// Prisma (auto-includes)
const apiKey = await prisma.apiKey.findUnique({
  where: { key: token },
  include: { user: true }
});

// Mongoose (manual populate)
const apiKey = await ApiKey.findOne({ key: token })
  .populate('userId');

// Or fetch separately
const apiKey = await ApiKey.findOne({ key: token });
const user = await User.findById(apiKey.userId);
```

### ID Fields

```typescript
// Prisma uses 'id'
user.id

// MongoDB uses '_id'
user._id.toString()
```

## 🚨 Important Notes

1. **ID Conversion**: MongoDB uses `_id` (ObjectId), not `id` (string)
   - Convert when returning to frontend: `id: item._id.toString()`

2. **Timestamps**: Mongoose auto-manages with `timestamps: true`
   - No need to manually set `createdAt` or `updatedAt`

3. **Lean Queries**: Use `.lean()` for better performance on read-only queries
   ```typescript
   const projects = await Project.find().lean();
   ```

4. **Connection**: Always call `await connectDB()` at start of handlers

5. **Indexes**: Already defined in models, will be created automatically

## 🔄 Rollback Plan

If you need to rollback:

```bash
# 1. Restore .env
DATABASE_URL=mysql://...
# Remove or comment MONGODB_URI

# 2. Revert code changes
git checkout -- src/

# 3. Restart server
npm run dev
```

## 📋 Testing Checklist

After migration, test:

- [ ] User authentication (NextAuth)
- [ ] API key validation
- [ ] License management
- [ ] API endpoint execution
- [ ] Project CRUD operations
- [ ] Admin dashboard stats
- [ ] Analytics and logs
- [ ] Contact form submissions
- [ ] Skills and experiences
- [ ] Profile management

## 🎯 Next Steps

1. Run the migration script
2. Review and fix any errors
3. Test all endpoints
4. Migrate existing data (if any)
5. Update NextAuth adapter (if using database sessions)
6. Remove Prisma dependencies:
   ```bash
   npm uninstall @prisma/client prisma @prisma/adapter-mariadb @auth/prisma-adapter
   ```
7. Delete `/prisma` directory
8. Update documentation

## 📚 Resources

- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Migration Guide](./MONGODB_MIGRATION.md)

## 🆘 Troubleshooting

### Connection Issues
```
Error: MONGODB_URI is not defined
```
**Solution**: Add `MONGODB_URI` to `.env` file

### Model Not Found
```
Error: Model 'User' not found
```
**Solution**: Check import statement: `import { User } from '@/models'`

### ID Field Errors
```
Error: Cannot read property 'id' of undefined
```
**Solution**: Use `_id` instead of `id`, or convert: `id: item._id.toString()`

### Connection Timeout
```
Error: MongooseServerSelectionError
```
**Solution**: Check MongoDB is running and connection string is correct

## 📞 Support

If you encounter issues:
1. Check `MONGODB_MIGRATION.md` for detailed guide
2. Review error logs
3. Test MongoDB connection separately
4. Verify all imports are correct
