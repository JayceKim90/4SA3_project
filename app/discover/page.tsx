"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SessionFilters } from "@/components/session-filters";
import { SessionList } from "@/components/session-list";
import { SessionMap } from "@/components/session-map";
import { LogoutButton } from "@/components/logout-button";
import { ArrowLeft, MapPin, Sparkles } from "lucide-react";
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
    mediator.registerComponent("discover-page", (event) => {
      if (
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
    const hobbyIdForNotify = pendingHobbyId;
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
          hobbyId: hobbyIdForNotify,
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
      mediator.notifyParticipantStatusChanged(
        hobbyIdForNotify,
        userId,
        "pending"
      );
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
    requestAnimationFrame(() => {
      document
        .getElementById(`discover-meetup-${sessionId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/[0.08] via-transparent to-primary/[0.06]"
        aria-hidden
      />

      <header className="shrink-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/65">
        <div className="mx-auto flex h-14 max-w-[1920px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 rounded-full text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="hidden h-8 w-px bg-border sm:block" />
            <div className="flex min-w-0 items-center gap-3">
              <img
                src="/logo.svg"
                alt=""
                className="h-8 w-8 shrink-0 drop-shadow-sm"
              />
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">
                  Discover
                </h1>
                <p className="truncate text-xs text-muted-foreground sm:text-sm">
                  Map + meetups near you
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isLoading && sessions.length > 0 && (
              <span className="hidden items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:inline-flex">
                <Sparkles className="h-3.5 w-3.5" />
                {sessions.length} near you
              </span>
            )}
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col lg:h-[calc(100dvh-3.5rem)] lg:max-h-[calc(100dvh-3.5rem)] lg:flex-row">
        {/* Left: map */}
        <section className="relative flex min-h-[300px] flex-col border-border/40 bg-gradient-to-b from-muted/20 to-transparent px-4 pb-4 pt-4 sm:min-h-[360px] lg:h-full lg:min-h-0 lg:w-[56%] lg:max-w-[960px] lg:flex-1 lg:border-r lg:px-6 lg:pb-6 lg:pt-5 xl:w-[58%]">
          <div className="mb-3 flex items-center justify-between gap-2 lg:mb-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <MapPin className="h-4 w-4" />
              </span>
              <span>Explore the map</span>
            </div>
            {focusedSessionId && (
              <span className="hidden truncate text-xs text-muted-foreground sm:block max-w-[12rem]">
                Focused on selected meetup
              </span>
            )}
          </div>
          <div
            className={`min-h-0 flex-1 transition-[box-shadow] duration-300 ${
              focusedSessionId
                ? "rounded-2xl ring-2 ring-primary/35 ring-offset-2 ring-offset-background"
                : ""
            }`}
          >
            <SessionMap
              sessions={sessions}
              onSessionClick={handleJoinRequest}
              focusedSessionId={focusedSessionId}
              fillHeight
              className="h-full"
            />
          </div>
        </section>

        {/* Right: filters + list rail */}
        <aside className="flex min-h-0 flex-1 flex-col bg-card/30 backdrop-blur-md lg:min-w-0 lg:max-w-none">
          <div className="shrink-0 border-b border-border/50 bg-background/60 px-4 py-4 sm:px-5">
            <div className="mx-auto max-w-xl rounded-2xl border border-border/60 bg-card/90 p-4 shadow-sm lg:max-w-none">
              <SessionFilters onFilterChange={loadSessions} />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5 [scrollbar-gutter:stable]">
            <div className="mx-auto mb-3 flex max-w-xl items-end justify-between gap-2 lg:max-w-none">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Meetups
              </h2>
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                {isLoading ? "…" : sessions.length}
              </span>
            </div>

            {isLoading ? (
              <div className="mx-auto flex max-w-xl flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 py-20 lg:max-w-none">
                <div className="relative mb-4 h-11 w-11">
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Loading meetups…
                </p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="mx-auto max-w-xl rounded-2xl border border-border/70 bg-gradient-to-b from-card to-card/80 p-8 text-center shadow-inner lg:max-w-none">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <MapPin className="h-7 w-7 opacity-90" />
                </div>
                <p className="mb-1 text-lg font-semibold text-foreground">
                  No meetups match
                </p>
                <p className="mb-6 text-sm text-muted-foreground">
                  Loosen filters or host the first one.
                </p>
                <Link href="/create">
                  <Button className="rounded-full px-6 shadow-md">
                    Host a hobby meetup
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="mx-auto max-w-xl pb-8 lg:max-w-none">
                <SessionList
                  sessions={sessions}
                  onJoinClick={handleJoinRequest}
                  onCancelClick={handleCancelRequest}
                  onSessionClick={handleSessionFocus}
                  currentUserId={userId}
                  variant="rail"
                />
              </div>
            )}
          </div>
        </aside>
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
