import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function makeAdmin(email: string) {
  try {
    // Try to update existing user
    let user = await prisma.user.findUnique({
      where: { email }
    })

    if (user) {
      // User exists, update role
      user = await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' }
      })
      console.log('✅ User updated to ADMIN:')
    } else {
      // User doesn't exist, create as admin
      user = await prisma.user.create({
        data: {
          email,
          role: 'ADMIN',
          name: email.split('@')[0], // Use email prefix as name
        }
      })
      console.log('✅ User created as ADMIN:')
    }
    
    console.log('Email:', user.email)
    console.log('Name:', user.name)
    console.log('Role:', user.role)
    console.log('\n🎉 Done! Refresh your browser to see admin access.')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Get email from command line argument
const email = process.argv[2]

if (!email) {
  console.error('❌ Usage: npm run make-admin <email>')
  console.error('Example: npm run make-admin your-email@gmail.com')
  process.exit(1)
}

makeAdmin(email)
