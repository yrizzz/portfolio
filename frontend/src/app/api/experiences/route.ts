import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const experiencesFile = path.join(dataDir, 'experiences.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Default data
const defaultData = {
  experiences: [
    {
      id: "1",
      title: "Senior Full Stack Developer",
      company: "Tech Company Inc.",
      location: "Remote",
      startDate: "2023-01",
      endDate: null,
      current: true,
      description: "Leading development of scalable web applications using Next.js, Node.js, and cloud infrastructure."
    }
  ],
  education: [
    {
      id: "1",
      degree: "Bachelor of Computer Science",
      institution: "University Name",
      location: "City, State",
      startDate: "2016-09",
      endDate: "2020-06"
    }
  ]
};

export async function GET() {
  try {
    if (!fs.existsSync(experiencesFile)) {
      fs.writeFileSync(experiencesFile, JSON.stringify(defaultData, null, 2));
    }
    const data = JSON.parse(fs.readFileSync(experiencesFile, 'utf-8'));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading experiences:', error);
    return NextResponse.json(defaultData);
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    fs.writeFileSync(experiencesFile, JSON.stringify(data, null, 2));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error saving experiences:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
