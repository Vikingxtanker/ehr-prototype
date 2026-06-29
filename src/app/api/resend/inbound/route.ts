// app/api/resend/inbound/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const event = await req.json();

  console.log(event);

  return NextResponse.json({
    success: true,
  });
}