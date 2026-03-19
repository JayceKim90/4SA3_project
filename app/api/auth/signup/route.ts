import { type NextRequest, NextResponse } from "next/server"
import { signUp } from "@/lib/auth/simple-auth"

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json()

    if (!email || !name || !password) {
      return NextResponse.json({ error: "Email, name, and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const user = await signUp(email, name, password)


    const response = NextResponse.json({ user })
    response.cookies.set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
