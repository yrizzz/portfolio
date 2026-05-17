import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function fix() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    
    const Experience = mongoose.connection.collection('experiences');
    const Education = mongoose.connection.collection('educations');
    
    console.log('🔧 Fixing Experience dates...\n');
    const experiences = await Experience.find({}).toArray();
    
    for (const exp of experiences) {
      // Parse period like "2022-02 - Present" or "2022-02 - 2024-05"
      const period = exp.period || '';
      const parts = period.split(' - ');
      const startDate = parts[0]?.trim() || '';
      const endDate = parts[1]?.trim() === 'Present' ? null : parts[1]?.trim() || '';
      
      await Experience.updateOne(
        { _id: exp._id },
        { 
          $set: { 
            startDate,
            endDate: endDate || ''
          } 
        }
      );
      
      console.log(`✅ Fixed: ${exp.title}`);
      console.log(`   Period: "${period}"`);
      console.log(`   → startDate: "${startDate}"`);
      console.log(`   → endDate: "${endDate}"`);
      console.log('');
    }
    
    console.log('🔧 Fixing Education dates...\n');
    const education = await Education.find({}).toArray();
    
    for (const edu of education) {
      // Parse period like "2019-09 - 2024-06"
      const period = edu.period || '';
      const parts = period.split(' - ');
      const startDate = parts[0]?.trim() || '';
      const endDate = parts[1]?.trim() || '';
      
      await Education.updateOne(
        { _id: edu._id },
        { 
          $set: { 
            startDate,
            endDate
          } 
        }
      );
      
      console.log(`✅ Fixed: ${edu.degree}`);
      console.log(`   Period: "${period}"`);
      console.log(`   → startDate: "${startDate}"`);
      console.log(`   → endDate: "${endDate}"`);
      console.log('');
    }
    
    console.log('✅ All dates fixed!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fix();
