"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, User, ArrowRight } from "lucide-react";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint =
        mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }


      router.push("/discover");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-none shadow-2xl bg-white/80 dark:bg-card/80 backdrop-blur-xl animate-in zoom-in-95 duration-500">
      <CardHeader className="space-y-3 pb-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
          {mode === "login" ? (
            <Lock className="w-6 h-6 text-primary" />
          ) : (
            <User className="w-6 h-6 text-primary" />
          )}
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </CardTitle>
        <CardDescription className="text-base">
          {mode === "login"
            ? "Sign in to access your hobby meetups"
            : "Join HobbyHop and start meeting people who share your hobbies"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === "signup" && (
            <div className="space-y-2 group">
              <Label htmlFor="name" className="font-medium">
                Full Name
              </Label>
              <div className="relative transition-all duration-300 group-focus-within:scale-[1.02]">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="pl-10 h-11 bg-background/50 border-muted-foreground/20 focus:border-primary transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-2 group">
            <Label htmlFor="email" className="font-medium">
              Email
            </Label>
            <div className="relative transition-all duration-300 group-focus-within:scale-[1.02]">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 h-11 bg-background/50 border-muted-foreground/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-2 group">
            <Label htmlFor="password" className="font-medium">
              Password
            </Label>
            <div className="relative transition-all duration-300 group-focus-within:scale-[1.02]">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                id="password"
                type="password"
                placeholder={
                  mode === "signup"
                    ? "At least 6 characters"
                    : "Enter your password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={mode === "signup" ? 6 : undefined}
                className="pl-10 h-11 bg-background/50 border-muted-foreground/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {error && (
            <Alert
              variant="destructive"
              className="animate-in fade-in slide-in-from-top-2"
            >
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full h-11 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait...
              </>
            ) : (
              <>
                {mode === "login" ? "Sign In" : "Sign Up"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
