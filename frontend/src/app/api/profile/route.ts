import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { SocialMedia, SiteConfig } from '@/models';

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectDB();
  try {
    // Get profile from SiteConfig
    const configs = await SiteConfig.find();
    const configMap: Record<string, string> = {};
    configs.forEach((c: any) => { configMap[c.key] = c.value; });

    // Get social links
    const socialLinks = await SocialMedia.find({ visible: true }).sort({ order: 1 });

    const profile = {
      name: configMap['profile_name'] || 'YrizzzDev',
      title: configMap['profile_title'] || 'Full Stack Developer',
      subtitle: configMap['profile_subtitle'] || 'Full-Stack Web Specialist 🚀',
      location: configMap['profile_location'] || 'Indonesia',
      bio1: configMap['profile_bio1'] || '',
      bio2: configMap['profile_bio2'] || '',
      avatarUrl: configMap['profile_avatar'] || '/profile.jpg',
      status: configMap['profile_status'] || 'Available to be partner',
      cvUrl: configMap['profile_cv'] || '',
      socialLinks: socialLinks.map((s: any) => ({
        id: s.id,
        platform: s.platform,
        url: s.url,
        icon: s.icon || s.platform.toLowerCase(),
      })),
    };

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error('Failed to fetch profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const data = await req.json();
    const { name, title, subtitle, location, bio1, bio2, avatarUrl, status, cvUrl, socialLinks } = data;

    // Upsert profile configs
    const profileConfigs = [
      { key: 'profile_name', value: name || '' },
      { key: 'profile_title', value: title || '' },
      { key: 'profile_subtitle', value: subtitle || '' },
      { key: 'profile_location', value: location || '' },
      { key: 'profile_bio1', value: bio1 || '' },
      { key: 'profile_bio2', value: bio2 || '' },
      { key: 'profile_avatar', value: avatarUrl || '' },
      { key: 'profile_status', value: status || '' },
      { key: 'profile_cv', value: cvUrl || '' },
    ];

    for (const config of profileConfigs) {
      await SiteConfig.findOneAndUpdate(
        { key: config.key },
        { value: config.value, updatedAt: new Date() },
        { upsert: true, new: true }
      );
    }

    // Update social links
    if (socialLinks && Array.isArray(socialLinks)) {
      // Delete existing
      await SocialMedia.deleteMany({});
      
      // Create new
      for (let i = 0; i < socialLinks.length; i++) {
        const link = socialLinks[i];
        await SocialMedia.create({
          platform: link.platform || link.icon || '',
          url: link.url || '',
          icon: link.icon || link.platform?.toLowerCase() || '',
          order: i,
          visible: true,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to save profile:', error);
    return NextResponse.json(
      { error: 'Failed to save profile', details: error.message },
      { status: 500 }
    );
  }
}
