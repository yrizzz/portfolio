# MySQL to MongoDB Migration Guide

## Migration Status: IN PROGRESS

This document tracks the migration from MySQL (via Prisma) to MongoDB (via Mongoose).

## Completed Steps

### 1. ✅ Dependencies Installed
- Installed `mongoose` package
- Kept Prisma packages for reference (can be removed after full migration)

### 2. ✅ MongoDB Connection Setup
- Created `/src/lib/mongodb.ts` with connection pooling
- Implements singleton pattern for Next.js
- Add `MONGODB_URI` to your `.env` file:
  ```
  MONGODB_URI=mongodb://localhost:27017/your-database-name
  # or for MongoDB Atlas:
  MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
  ```

### 3. ✅ Mongoose Models Created
All 16 models have been converted from Prisma schema to Mongoose:

- `/src/models/User.ts`
- `/src/models/ApiKey.ts`
- `/src/models/License.ts`
- `/src/models/ApiRequest.ts`
- `/src/models/Project.ts`
- `/src/models/Experience.ts`
- `/src/models/Education.ts`
- `/src/models/Skill.ts`
- `/src/models/Article.ts`
- `/src/models/SocialMedia.ts`
- `/src/models/SiteConfig.ts`
- `/src/models/Account.ts`
- `/src/models/Session.ts`
- `/src/models/VerificationToken.ts`
- `/src/models/Contact.ts`
- `/src/models/ApiEndpoint.ts`
- `/src/models/index.ts` (exports all models)

### 4. ✅ Files Updated
- ✅ `/src/app/api/projects/route.ts`
- ✅ `/src/lib/api-auth.ts`

### 5. ⏳ Files Remaining to Update

The following files still use Prisma and need to be updated:

1. `/src/app/api/messages/route.ts`
2. `/src/app/api/admin/stats/route.ts`
3. `/src/app/api/admin/users/route.ts`
4. `/src/lib/gemini.ts`
5. `/src/app/api/execute/[...path]/route.ts`
6. `/src/app/api/contact-info/route.ts`
7. `/src/app/api/experiences/route.ts`
8. `/src/app/api/skills/route.ts`
9. `/src/app/api/profile/route.ts`
10. `/src/app/api/api-keys/route.ts`
11. `/src/app/api/api-keys/toggle/route.ts`
12. `/src/app/api/licenses/route.ts`
13. `/src/app/api/licenses/toggle-renew/route.ts`
14. `/src/app/api/logs/route.ts`
15. `/src/app/api/config/route.ts`
16. `/src/app/api/endpoints/submit/route.ts`
17. `/src/app/api/endpoints/review/route.ts`
18. `/src/app/api/analytics/route.ts`
19. `/src/app/api/docs/route.ts`
20. `/src/lib/license-validator.ts`

## Prisma to Mongoose Query Conversion Reference

### Basic Operations

| Prisma | Mongoose |
|--------|----------|
| `prisma.model.findMany()` | `Model.find()` |
| `prisma.model.findUnique({ where: { id } })` | `Model.findById(id)` |
| `prisma.model.findUnique({ where: { email } })` | `Model.findOne({ email })` |
| `prisma.model.findFirst()` | `Model.findOne()` |
| `prisma.model.create({ data })` | `Model.create(data)` or `new Model(data).save()` |
| `prisma.model.update({ where, data })` | `Model.findByIdAndUpdate(id, data, { new: true })` |
| `prisma.model.delete({ where })` | `Model.findByIdAndDelete(id)` |
| `prisma.model.deleteMany({ where })` | `Model.deleteMany(filter)` |
| `prisma.model.count({ where })` | `Model.countDocuments(filter)` |

### Query Options

| Prisma | Mongoose |
|--------|----------|
| `where: { field: value }` | `{ field: value }` |
| `orderBy: { field: 'asc' }` | `.sort({ field: 1 })` |
| `orderBy: { field: 'desc' }` | `.sort({ field: -1 })` |
| `select: { field: true }` | `.select('field')` or `.select({ field: 1 })` |
| `include: { relation: true }` | `.populate('relation')` |
| `take: 10` | `.limit(10)` |
| `skip: 20` | `.skip(20)` |

### Important Differences

1. **ID Field**: Prisma uses `id`, MongoDB uses `_id`
   ```typescript
   // Prisma
   const user = await prisma.user.findUnique({ where: { id: userId } });
   
   // Mongoose
   const user = await User.findById(userId);
   // or
   const user = await User.findOne({ _id: userId });
   ```

2. **Relations**: Mongoose requires explicit population
   ```typescript
   // Prisma (auto-includes)
   const apiKey = await prisma.apiKey.findUnique({
     where: { key: token },
     include: { user: true }
   });
   
   // Mongoose (manual populate)
   const apiKey = await ApiKey.findOne({ key: token }).populate('userId');
   // or fetch separately
   const apiKey = await ApiKey.findOne({ key: token });
   const user = await User.findById(apiKey.userId);
   ```

3. **Timestamps**: Mongoose auto-manages `createdAt` and `updatedAt` when `timestamps: true`

4. **Lean Queries**: Use `.lean()` for better performance when you don't need Mongoose document methods
   ```typescript
   const projects = await Project.find({ published: true }).lean();
   ```

## Migration Steps for Each File

For each file that uses Prisma:

1. **Update imports**:
   ```typescript
   // Old
   import { prisma } from '@/lib/prisma';
   
   // New
   import { connectDB } from '@/lib/mongodb';
   import { Model1, Model2 } from '@/models';
   ```

2. **Add connection call** at the start of each handler:
   ```typescript
   export async function GET() {
     await connectDB();
     // ... rest of code
   }
   ```

3. **Convert queries** using the reference table above

4. **Update ID references**:
   ```typescript
   // Old
   id: item.id
   
   // New
   id: item._id.toString()
   ```

5. **Handle relations** explicitly if needed

## Testing Checklist

After migration, test:

- [ ] User authentication (NextAuth)
- [ ] API key validation
- [ ] License management
- [ ] API endpoint execution
- [ ] Project CRUD operations
- [ ] Admin dashboard stats
- [ ] Analytics and logs
- [ ] Contact form submissions

## Data Migration

To migrate existing data from MySQL to MongoDB:

1. Export data from MySQL using Prisma:
   ```bash
   npx prisma db pull
   # Then write a script to export data
   ```

2. Import to MongoDB:
   ```bash
   # Use mongoimport or write a Node.js script
   ```

3. Or use a migration script (create `/scripts/migrate-data.ts`)

## Rollback Plan

If issues occur:

1. Keep Prisma packages installed
2. Revert file changes using git
3. Switch back to `DATABASE_URL` in `.env`
4. Restart the application

## Next Steps

1. Update remaining 20 files listed above
2. Update NextAuth configuration to use MongoDB adapter
3. Test all API endpoints
4. Migrate existing data
5. Remove Prisma dependencies
6. Update documentation

## Notes

- MongoDB uses `_id` instead of `id`
- Mongoose models are already set up with proper indexes
- Connection pooling is handled automatically
- All timestamps are managed by Mongoose
- Use `.lean()` for read-only queries for better performance
