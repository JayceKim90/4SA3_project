import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background flex flex-col relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-3xl animate-pulse animate-float" />
        <div
          className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-3xl animate-pulse delay-1000 animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-primary/5 blur-3xl animate-pulse delay-2000 animate-float"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium">Back to Home</span>
            </Link>
            <Link href="/signup">
              <Button variant="ghost" className="hover:bg-primary/5">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl text-primary">
              HobbyHop
            </h1>
            <p className="text-muted-foreground text-lg">
              Connect, collaborate, and succeed together.
            </p>
          </div>

          <AuthForm mode="login" />

          <p className="text-center text-sm text-muted-foreground animate-in fade-in duration-1000 delay-300">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-primary font-medium hover:underline hover:text-primary/80 transition-colors"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
