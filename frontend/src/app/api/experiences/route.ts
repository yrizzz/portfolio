import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Experience, Education } from '@/models';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    
    const experiences = await Experience.find().sort({ order: 1 }).lean();
    const education = await Education.find().sort({ order: 1 }).lean();


    // Helper to parse dates from period if needed
    const parsePeriod = (period: string) => {
      if (!period) return { start: '', end: '' };
      const [start, end] = period.split(' - ').map(s => s.trim());
      return { 
        start: start || '', 
        end: end === 'Present' ? null : (end || '') 
      };
    };

    const response = {
      success: true,
      experiences: experiences.map((e: any) => {
        const dates = parsePeriod(e.period);
        return {
          id: e._id?.toString() || e.id,
          title: e.title,
          company: e.company,
          location: e.location,
          startDate: e.startDate || dates.start,
          endDate: e.endDate !== undefined ? e.endDate : dates.end,
          period: e.period,
          description: e.description,
          current: e.current,
        };
      }),
      education: education.map((e: any) => {
        const dates = parsePeriod(e.period);
        return {
          id: e._id?.toString() || e.id,
          degree: e.degree,
          institution: e.institution,
          location: e.location,
          startDate: e.startDate || dates.start,
          endDate: e.endDate || dates.end,
          period: e.period,
        };
      }),
    };
    

    return NextResponse.json(response);
    
  } catch (error: any) {
    console.error('[Experiences GET] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch experiences',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const data = await req.json();
    const { experiences, education } = data;
    
    console.log('[Experiences POST] Received data:', JSON.stringify({ experiences, education }, null, 2));

    // Save experiences
    if (experiences && Array.isArray(experiences)) {
      await Experience.deleteMany();

      for (let i = 0; i < experiences.length; i++) {
        const exp = experiences[i];
        
        // Ensure dates are preserved
        const startDate = exp.startDate || '';
        const endDate = exp.current ? null : (exp.endDate || '');
        
        console.log(`[Experiences POST] Saving experience ${i}:`, { 
          title: exp.title, 
          startDate, 
          endDate,
          hasId: !!exp.id,
          id: exp.id
        });
        
        try {
          await Experience.create({
            title: exp.title,
            company: exp.company,
            location: exp.location || '',
            startDate: startDate,
            endDate: endDate,
            period: exp.period || `${startDate} - ${endDate || 'Present'}`,
            description: exp.description || '',
            current: exp.current || false,
            order: i,
            updatedAt: new Date(),
          } as any);
          console.log(`[Experiences POST] ✅ Saved experience ${i}`);
        } catch (expError: any) {
          console.error(`[Experiences POST] ❌ Failed to save experience ${i}:`, expError.message);
          throw expError;
        }
      }
    }

    // Save education
    if (education && Array.isArray(education)) {
      await Education.deleteMany();

      for (let i = 0; i < education.length; i++) {
        const edu = education[i];
        
        // Ensure dates are preserved
        const startDate = edu.startDate || '';
        const endDate = edu.endDate || '';
        
        console.log(`[Experiences POST] Saving edu: ${edu.degree}`, { startDate, endDate });
        
        await Education.create({
          id: edu.id || crypto.randomUUID(),
          degree: edu.degree,
          institution: edu.institution,
          location: edu.location || '',
          startDate: startDate,
          endDate: endDate,
          period: edu.period || `${startDate} - ${endDate}`,
          order: i,
          updatedAt: new Date(),
        } as any);
      }
    }

    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error('[Experiences POST] Error:', error);
    console.error('[Experiences POST] Error stack:', error.stack);
    console.error('[Experiences POST] Error message:', error.message);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save experiences',
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}
