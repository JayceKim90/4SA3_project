import { type NextRequest, NextResponse } from "next/server";
import { signIn } from "@/lib/auth/simple-auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await signIn(email, password);


    const response = NextResponse.json({ user });
    response.cookies.set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 401 }
    );
  }
}
