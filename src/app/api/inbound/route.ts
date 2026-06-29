// app/api/inbound/route.ts

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const event = await req.json();

  if (event.type === "email.received") {
    await resend.emails.send({
        from: "contact@anexra.com",
        to: "grvgaikwad01@gmail.com",

        subject: `New Contact: ${event.data.subject}`,

        html: `
            <h2>New Contact Message</h2>

            <p><strong>From:</strong> ${event.data.from}</p>

            <p><strong>Subject:</strong> ${event.data.subject}</p>
        `,
        });
  }

  return NextResponse.json({
    success: true,
  });
}