import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/logout-button";
import { Mail, Calendar } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth/simple-auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    redirect("/login");
  }

  const user = await getCurrentUser(userId);

  if (!user) {
    redirect("/login");
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-xl font-semibold">HobbyHop</h1>
            </Link>
            <nav className="flex gap-2">
              <Link href="/discover">
                <Button variant="ghost">Discover</Button>
              </Link>
              <Link href="/my-sessions">
                <Button variant="ghost">My Sessions</Button>
              </Link>
              <Link href="/create">
                <Button variant="ghost">Create Session</Button>
              </Link>
              <LogoutButton />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl">{user.name}</CardTitle>
                  <CardDescription>Student Profile</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Profile Details */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/my-sessions" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                >
                  View My Sessions
                </Button>
              </Link>
              <Link href="/create" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                >
                  Create New Session
                </Button>
              </Link>
              <Link href="/discover" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                >
                  Discover Sessions
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
