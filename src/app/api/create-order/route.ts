import { NextResponse } from "next/server";
import Razorpay from "razorpay";

import { createClient } from "@/lib/supabase/server";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret:
    process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const {
      amount,
      courseId,
    } = await req.json();

    if (!amount || amount < 100) {
      return NextResponse.json(
        {
          error: "Invalid amount",
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
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const {
      data: existingPurchase,
    } = await supabase
      .from("course_purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();

    if (existingPurchase) {
      return NextResponse.json(
        {
          error:
            "Course already purchased",
        },
        { status: 400 }
      );
    }

    const order =
      await razorpay.orders.create({
        amount,
        currency: "INR",
        receipt: `course_${Date.now()}`,
      });

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to create order",
      },
      { status: 500 }
    );
  }
}