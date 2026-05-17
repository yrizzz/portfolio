import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    
    const Experience = mongoose.connection.collection('experiences');
    const Education = mongoose.connection.collection('educations');
    
    console.log('📋 Checking Experience dates...\n');
    const experiences = await Experience.find({}).toArray();
    experiences.forEach((exp: any) => {
      console.log(`Experience: ${exp.title}`);
      console.log(`  startDate: "${exp.startDate}"`);
      console.log(`  endDate: "${exp.endDate}"`);
      console.log(`  period: "${exp.period}"`);
      console.log('');
    });
    
    console.log('📋 Checking Education dates...\n');
    const education = await Education.find({}).toArray();
    education.forEach((edu: any) => {
      console.log(`Education: ${edu.degree}`);
      console.log(`  startDate: "${edu.startDate}"`);
      console.log(`  endDate: "${edu.endDate}"`);
      console.log(`  period: "${edu.period}"`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

check();
