"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MySessionsList } from "@/components/my-sessions-list";
import { LogoutButton } from "@/components/logout-button";
import { ArrowLeft, Plus } from "lucide-react";
import type { StudySession } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function MySessionsPage() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          loadMySessions(data.user.id);
        } else {
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch user:", err);
        setIsLoading(false);
      });
  }, []);

  const loadMySessions = async (userId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/groups?hostId=${userId}`);
      if (!response.ok) throw new Error("Failed to load sessions");

      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error("[v0] Error loading sessions:", error);
      toast({
        title: "Error",
        description: "Failed to load your sessions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/groups/${sessionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete session");
      }

      toast({
        title: "Session Deleted",
        description: "The session has been successfully deleted",
      });


      fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            loadMySessions(data.user.id);
          }
        })
        .catch((err) => console.error("Failed to fetch user:", err));
    } catch (error) {
      console.error("[v0] Error deleting session:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete session",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 relative overflow-hidden">

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[10%] right-[10%] w-[25%] h-[25%] rounded-full bg-primary/10 blur-3xl animate-float" />
        <div
          className="absolute bottom-[15%] left-[5%] w-[30%] h-[30%] rounded-full bg-accent/15 blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80 animate-in fade-in slide-in-from-top duration-500">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left duration-700">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/10 transition-all"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-primary">
                My Sessions
              </h1>
            </div>
            <div className="flex gap-2 animate-in fade-in slide-in-from-right duration-700">
              <Link href="/create">
                <Button className="bg-primary hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Session
                </Button>
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {isLoading ? (
          <div className="text-center py-12 animate-pulse">
            <div className="inline-block h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading your sessions...</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom duration-700">
            <MySessionsList
              sessions={sessions}
              onDelete={handleDeleteSession}
            />
          </div>
        )}
      </main>
    </div>
  );
}
