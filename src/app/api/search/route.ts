import { NextRequest, NextResponse } from 'next/server';
import { searchCourse } from '@/lib/course';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q') || '';
  const results = await searchCourse(query, 25);
  return NextResponse.json({ results });
}
