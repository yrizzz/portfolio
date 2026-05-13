import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const contactFile = path.join(dataDir, 'contact-info.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const defaultData = [
  {
    id: "1",
    type: "Email",
    value: "your@email.com",
    href: "mailto:your@email.com",
    icon: "mail"
  },
  {
    id: "2",
    type: "Phone",
    value: "+1 (234) 567-890",
    href: "tel:+1234567890",
    icon: "phone"
  },
  {
    id: "3",
    type: "Location",
    value: "Your City, Country",
    href: null,
    icon: "map-pin"
  }
];

export async function GET() {
  try {
    if (!fs.existsSync(contactFile)) {
      fs.writeFileSync(contactFile, JSON.stringify(defaultData, null, 2));
    }
    const data = JSON.parse(fs.readFileSync(contactFile, 'utf-8'));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(defaultData);
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    fs.writeFileSync(contactFile, JSON.stringify(data, null, 2));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
