import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAndSetAdmin() {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    })

    console.log('\n📊 Current Users in Database:')
    console.log('================================')
    
    if (users.length === 0) {
      console.log('❌ No users found!')
      console.log('\nPlease:')
      console.log('1. Make sure you have logged in via Google OAuth')
      console.log('2. Check browser console for "User synced to database" message')
      console.log('3. Try logging out and logging in again')
      return
    }

    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.email}`)
      console.log(`   Name: ${user.name || 'N/A'}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   ID: ${user.id}`)
    })

    console.log('\n================================')
    console.log('\nTo set a user as ADMIN, run:')
    console.log('npm run make-admin <email>')
    console.log('\nExample:')
    console.log(`npm run make-admin ${users[0].email}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAndSetAdmin()
