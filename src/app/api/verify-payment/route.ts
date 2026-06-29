import crypto from "crypto";

import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
      amountPaid
    } = await req.json();

    const body =
      razorpay_order_id +
      "|" +
      razorpay_payment_id;

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env
            .RAZORPAY_KEY_SECRET!
        )
        .update(body)
        .digest("hex");

    if (
      expectedSignature !==
      razorpay_signature
    ) {
      return NextResponse.json(
        {
          success: false,
        },
        { status: 400 }
      );
    }

    const supabase =
      await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
        },
        { status: 401 }
      );
    }

    console.log("Razorpay verification request");

    console.log({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
      amountPaid,
    });

    const { data: existingPurchase } =
      await supabase
        .from("course_purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .maybeSingle();

    if (existingPurchase) {
      return NextResponse.json({
        success: true,
      });
    }

    const { error } =
    await supabase
      .from("course_purchases")

      .upsert(
        {
          user_id: user.id,
          course_id: courseId,
          amount_paid: amountPaid,
          razorpay_payment_id,
          razorpay_order_id,
          purchased_at: new Date().toISOString(),
        },
        {
          onConflict:
            "user_id,course_id",
        }
      );
    
    if (error) {
      console.error(error);

      return NextResponse.json(
        {
          success: false,
        },
        { status: 500 }
      );
    }
    console.log("Course purchase saved successfully");

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
      },
      { status: 500 }
    );
  }
}