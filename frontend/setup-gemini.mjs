// Script untuk setup API key di database
import { PrismaClient } from '@prisma/client';
import { createClient } from '@libsql/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { join } from 'path';

// Setup adapter
const databaseUrl = process.env.DATABASE_URL || `file:${join(process.cwd(), 'prisma', 'dev.db')}`;
const libsql = createClient({ url: databaseUrl });
const adapter = new PrismaLibSql(libsql);

const prisma = new PrismaClient({ adapter });

async function setupApiKey() {
  try {
    console.log('Setting up Gemini API key in database...');
    
    // Upsert GEMINI_API_KEY
    await prisma.siteConfig.upsert({
      where: { key: 'GEMINI_API_KEY' },
      update: { 
        value: 'AIzaSyCd-gn3vu8UTk_7AMLd1Zlkn5HZhSpDNM8',
        updatedAt: new Date()
      },
      create: { 
        key: 'GEMINI_API_KEY',
        value: 'AIzaSyCd-gn3vu8UTk_7AMLd1Zlkn5HZhSpDNM8'
      },
    });
    
    console.log('✓ GEMINI_API_KEY saved');
    
    // Upsert GEMINI_MODEL
    await prisma.siteConfig.upsert({
      where: { key: 'GEMINI_MODEL' },
      update: { 
        value: 'gemini-2.5-flash',
        updatedAt: new Date()
      },
      create: { 
        key: 'GEMINI_MODEL',
        value: 'gemini-2.5-flash'
      },
    });
    
    console.log('✓ GEMINI_MODEL saved');
    
    // Verify
    const apiKey = await prisma.siteConfig.findUnique({
      where: { key: 'GEMINI_API_KEY' }
    });
    
    const model = await prisma.siteConfig.findUnique({
      where: { key: 'GEMINI_MODEL' }
    });
    
    console.log('\n✅ Setup complete!');
    console.log('API Key:', apiKey?.value.substring(0, 10) + '...');
    console.log('Model:', model?.value);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

setupApiKey();
