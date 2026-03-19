import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  MapPin,
  Users,
  Calendar,
} from "lucide-react";
import { cookies } from "next/headers";
import { LogoutButton } from "@/components/logout-button";

export default async function HomePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const isLoggedIn = !!userId;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 relative overflow-hidden flex flex-col">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[30%] h-[30%] rounded-full bg-primary/10 blur-3xl animate-float" />
        <div
          className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-accent/15 blur-3xl animate-float"
          style={{ animationDelay: "3s" }}
        />
        <div
          className="absolute top-[40%] left-[20%] w-[20%] h-[20%] rounded-full bg-blue-400/10 blur-3xl animate-float"
          style={{ animationDelay: "5s" }}
        />
        <div
          className="absolute bottom-[10%] left-[30%] w-[25%] h-[25%] rounded-full bg-sky-400/10 blur-3xl animate-float"
          style={{ animationDelay: "7s" }}
        />
      </div>

      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80 animate-in fade-in slide-in-from-top duration-500">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left duration-700">
              <img src="/logo.svg" alt="HobbyHop Logo" className="h-8 w-8" />
              <h1 className="text-xl font-semibold text-primary">
                HobbyHop
              </h1>
            </div>
            <nav className="flex gap-2 animate-in fade-in slide-in-from-right duration-700">
              {isLoggedIn ? (
                <>
                  <Link href="/discover">
                    <Button
                      variant="ghost"
                      className="hover:bg-primary/10 transition-all"
                    >
                      Discover
                    </Button>
                  </Link>
                  <Link href="/my-sessions">
                    <Button
                      variant="ghost"
                      className="hover:bg-primary/10 transition-all"
                    >
                      My Sessions
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button
                      variant="ghost"
                      className="hover:bg-primary/10 transition-all"
                    >
                      Profile
                    </Button>
                  </Link>
                  <Link href="/create">
                    <Button className="bg-primary hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl">
                      Create Session
                    </Button>
                  </Link>
                  <LogoutButton />
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="hover:bg-primary/10 transition-all"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="bg-primary hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 space-y-24">
        <section className="max-w-4xl mx-auto text-center animate-in fade-in slide-in-from-bottom duration-700">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium animate-pulse">
            HobbyHop
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-balance bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent tracking-tight">
            Find Your Perfect Study Group
          </h2>
          <p className="text-xl text-muted-foreground text-pretty leading-relaxed mb-8 max-w-2xl mx-auto">
            Connect with peers, create study sessions, and discover groups by
            subject and location. Make studying more effective and
            collaborative.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in duration-1000 delay-300">
            {isLoggedIn ? (
              <>
                <Link href="/discover">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-lg px-8"
                  >
                    Browse Sessions
                  </Button>
                </Link>
                <Link href="/create">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-primary/20 hover:bg-primary/10 transition-all hover:-translate-y-1 text-lg px-8"
                  >
                    Host a Session
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-lg px-8"
                  >
                    Get Started
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-primary/20 hover:bg-primary/10 transition-all hover:-translate-y-1 text-lg px-8"
                  >
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group animate-in fade-in slide-in-from-left duration-500 hover:shadow-lg transition-all hover:-translate-y-1 border-primary/20 hover:border-primary/40 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>By Subject</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Find study groups for your specific courses and topics
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="group animate-in fade-in slide-in-from-left duration-700 delay-100 hover:shadow-lg transition-all hover:-translate-y-1 border-primary/20 hover:border-primary/40 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Nearby</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Discover sessions close to you with map and list views
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="group animate-in fade-in slide-in-from-right duration-700 delay-100 hover:shadow-lg transition-all hover:-translate-y-1 border-primary/20 hover:border-primary/40 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Join Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Request to join sessions and get approved by hosts
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="group animate-in fade-in slide-in-from-right duration-500 hover:shadow-lg transition-all hover:-translate-y-1 border-primary/20 hover:border-primary/40 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Plan ahead with date and time filters for your availability
              </CardDescription>
            </CardContent>
          </Card>
        </section>

        <section className="animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">
              Simple steps to get started with your study journey
            </p>
          </div>

          <div className="relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-primary/20 -translate-y-1/2 hidden md:block" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="flex flex-col items-center text-center bg-background p-6 rounded-xl border border-primary/10 shadow-sm relative z-10 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/30 animate-in zoom-in-50 duration-500 delay-100">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary font-bold text-xl group-hover:bg-primary/20 transition-colors">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
                <p className="text-muted-foreground">
                  Create your account to access all features and manage your
                  sessions.
                </p>
              </div>

              <div className="flex flex-col items-center text-center bg-background p-6 rounded-xl border border-primary/10 shadow-sm relative z-10 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/30 animate-in zoom-in-50 duration-500 delay-300">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary font-bold text-xl group-hover:bg-primary/20 transition-colors">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Discover</h3>
                <p className="text-muted-foreground">
                  Browse the map or list to find study sessions that match your
                  needs.
                </p>
              </div>

              <div className="flex flex-col items-center text-center bg-background p-6 rounded-xl border border-primary/10 shadow-sm relative z-10 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/30 animate-in zoom-in-50 duration-500 delay-500">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary font-bold text-xl group-hover:bg-primary/20 transition-colors">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Join & Study</h3>
                <p className="text-muted-foreground">
                  Request to join a group, get approved, and start collaborating!
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 bg-muted/30 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h3 className="font-semibold text-lg text-primary">
                HobbyHop
              </h3>
              <p className="text-sm text-muted-foreground">
                Discover hobbies together
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm font-medium">
                Created by{" "}
                <span className="text-primary font-bold">Sungsu Kim</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Copyright © 2025 Sungsu Kim. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
