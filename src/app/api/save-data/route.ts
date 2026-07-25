import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'Legacy bulk save endpoint disabled. Use signed admin operations.',
    },
    { status: 410 }
  );
}
