"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SessionFilters } from "@/components/session-filters";
import { SessionList } from "@/components/session-list";
import { SessionMap } from "@/components/session-map";
import { LogoutButton } from "@/components/logout-button";
import { ArrowLeft } from "lucide-react";
import type {
  SessionSearchResult,
  SessionFilters as Filters,
} from "@/lib/types";
import type { RankingType } from "@/lib/ranking/ranking-factory";
import { useToast } from "@/hooks/use-toast";
import { getSessionMediator } from "@/lib/mediator/session-mediator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DiscoverPage() {
  const [sessions, setSessions] = useState<SessionSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<Filters>({});
  const [currentRanking, setCurrentRanking] =
    useState<RankingType>("relevance");
  const [focusedSessionId, setFocusedSessionId] = useState<string | null>(null);
  const [joinOpen, setJoinOpen] = useState(false);
  const [pendingHobbyId, setPendingHobbyId] = useState<string | null>(null);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadSessions({}, "relevance");

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUserId(data.user.id);
          setUserEmail(data.user.email || "");
        }
      })
      .catch((err) => console.error("Failed to fetch user:", err));

    const mediator = getSessionMediator();
    mediator.registerComponent("discover-page", (event, data) => {      if (
        event === "hobby:created" ||
        event === "hobby:updated" ||
        event === "session:created" ||
        event === "session:updated"
      ) {
        loadSessions({}, "relevance");
      }
    });

    return () => {
      mediator.unregisterComponent("discover-page");
    };
  }, []);

  const loadSessions = async (
    filters: Filters,
    rankingType: RankingType = "relevance"
  ) => {
    setCurrentFilters(filters);
    setCurrentRanking(rankingType);
    setIsLoading(true);
    try {
      const response = await fetch("/api/hobbies/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters, rankingType }),
      });

      if (!response.ok) throw new Error("Failed to load sessions");

      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error("[v0] Error loading sessions:", error);
      toast({
        title: "Error",
        description: "Failed to load hobby groups",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRequest = (hobbyId: string) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to join a hobby meetup",
        variant: "destructive",
      });
      return;
    }
    setPendingHobbyId(hobbyId);
    setContactEmail(userEmail || "");
    setContactPhone("");
    setJoinOpen(true);
  };

  const submitJoinRequest = async () => {
    if (!userId || !pendingHobbyId) return;
    if (!contactEmail.trim() || !contactPhone.trim()) {
      toast({
        title: "Missing contact",
        description: "Please enter both email and phone for the host.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hobbyId: pendingHobbyId,
          userId,
          contactEmail: contactEmail.trim(),
          contactPhone: contactPhone.trim(),
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to request join");
      }

      toast({
        title: "Request sent",
        description: "The host will review your contact details.",
      });

      setJoinOpen(false);
      setPendingHobbyId(null);
      loadSessions(currentFilters, currentRanking);

      const mediator = getSessionMediator();
      mediator.notifyParticipantStatusChanged(pendingHobbyId, userId, "pending");
    } catch (error) {
      console.error("[HobbyHop] Error requesting to join:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to send join request",
        variant: "destructive",
      });
    }
  };

  const handleCancelRequest = async (sessionId: string) => {
    if (!userId) return;

    try {
      const response = await fetch("/api/participants", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hobbyId: sessionId, userId }),
      });

      if (!response.ok) throw new Error("Failed to cancel request");

      toast({
        title: "Request Cancelled",
        description: "Your join request has been cancelled",
      });

      loadSessions(currentFilters, currentRanking);
    } catch (error) {
      console.error("[v0] Error cancelling request:", error);
      toast({
        title: "Error",
        description: "Failed to cancel request",
        variant: "destructive",
      });
    }
  };

  const handleSessionFocus = (sessionId: string) => {
    setFocusedSessionId(sessionId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[5%] right-[10%] w-[25%] h-[25%] rounded-full bg-primary/10 blur-3xl animate-float" />
        <div
          className="absolute bottom-[15%] left-[5%] w-[30%] h-[30%] rounded-full bg-accent/15 blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-[40%] left-[15%] w-[20%] h-[20%] rounded-full bg-blue-400/10 blur-3xl animate-float"
          style={{ animationDelay: "4s" }}
        />
        <div
          className="absolute bottom-[30%] right-[20%] w-[25%] h-[25%] rounded-full bg-sky-400/10 blur-3xl animate-float"
          style={{ animationDelay: "6s" }}
        />
      </div>

      <header className="border-b border-border/40 backdrop-blur-xl sticky top-0 z-50 bg-background/70 shadow-lg shadow-primary/5 animate-in fade-in slide-in-from-top duration-500">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left duration-700">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/10 transition-all hover:scale-110 active:scale-95"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <img 
                src="/logo.svg" 
                alt="HobbyHop Logo" 
                className="h-8 w-8 animate-in zoom-in duration-500" 
              />
              <div>
                <h1 className="text-2xl font-bold text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Discover hobby groups
                </h1>
                <p className="text-sm text-muted-foreground">
                  Find and join meetups near you
                </p>
              </div>
            </div>
            <div className="animate-in fade-in slide-in-from-right duration-700">
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="w-80 flex-shrink-0 animate-in fade-in slide-in-from-left duration-700">
            <div className="sticky top-24">
              <div className="bg-card/50 backdrop-blur-md border border-primary/20 rounded-xl shadow-lg shadow-primary/5 p-6 transition-all hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30">
                <SessionFilters onFilterChange={loadSessions} />
              </div>
            </div>
          </aside>

          <div className="flex-1 flex flex-col gap-6 animate-in fade-in slide-in-from-right duration-700">
            <div className="w-full animate-in zoom-in-95 duration-500 delay-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
                  <span className="inline-block w-1 h-6 bg-primary rounded-full animate-pulse" />
                  Map View
                </h2>
              </div>
              <div className={`transition-all duration-300 ${focusedSessionId ? 'ring-2 ring-primary/50 ring-offset-2 ring-offset-background' : ''}`}>
                <SessionMap
                  sessions={sessions}
                  onSessionClick={handleJoinRequest}
                  focusedSessionId={focusedSessionId}
                />
              </div>
            </div>

            <div className="w-full animate-in fade-in-up duration-500 delay-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
                  <span className="inline-block w-1 h-6 bg-primary rounded-full animate-pulse" />
                  Meetups ({sessions.length})
                </h2>
              </div>
              {isLoading ? (
                <div className="text-center py-16 bg-card/50 backdrop-blur-sm rounded-2xl border border-primary/20 shadow-lg">
                  <div className="relative inline-block">
                    <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                    <div className="absolute inset-0 h-12 w-12 border-4 border-transparent border-t-primary/50 rounded-full animate-spin mb-4" style={{ animationDuration: '0.75s', animationDirection: 'reverse' }}></div>
                  </div>
                  <p className="text-muted-foreground font-medium">Loading meetups...</p>
                  <p className="text-sm text-muted-foreground/70 mt-2">Finding meetups for you</p>
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm rounded-2xl border border-primary/20 shadow-lg animate-in zoom-in duration-500">
                  <div className="mb-6 relative">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 backdrop-blur-sm">
                      <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-foreground mb-2">
                    No meetups found
                  </p>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                    Try adjusting your filters or create the first meetup
                  </p>
                  <Link href="/create">
                    <Button className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 hover:scale-105 active:scale-95">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create a group
                    </Button>
                  </Link>
                </div>
              ) : (
                <SessionList
                  sessions={sessions}
                  onJoinClick={handleJoinRequest}
                  onCancelClick={handleCancelRequest}
                  onSessionClick={handleSessionFocus}
                  currentUserId={userId}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request to join</DialogTitle>
            <DialogDescription>
              Share contact details so the host can reach you (required).
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="join-email">Email</Label>
              <Input
                id="join-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="join-phone">Phone</Label>
              <Input
                id="join-phone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJoinOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void submitJoinRequest()}>Send request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
