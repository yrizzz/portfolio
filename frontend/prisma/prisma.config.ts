// Prisma 7 configuration for MySQL
// This file is used by Prisma CLI commands (migrate, db push, etc.)
export default {
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'mysql://root:NewPassword123!@localhost:3306/porto_db',
    },
  },
};
