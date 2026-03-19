import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/simple-auth"

export async function GET(request: NextRequest) {
  const userId = request.cookies.get("userId")?.value

  if (!userId) {
    return NextResponse.json({ user: null })
  }

  const user = await getCurrentUser(userId)
  return NextResponse.json({ user })
}
