"use client";

import type { SessionSearchResult } from "@/lib/types";
import { SessionCard } from "./session-card";

interface SessionListProps {
  sessions: SessionSearchResult[];
  onJoinClick?: (sessionId: string) => void;
  onCancelClick?: (sessionId: string) => void;
  onSessionClick?: (sessionId: string) => void;
  currentUserId?: string | null;
}

export function SessionList({
  sessions,
  onJoinClick,
  onCancelClick,
  onSessionClick,
  currentUserId,
}: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No study sessions found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Try adjusting your filters or create a new session
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {sessions.map((session, index) => (
        <div
          key={session.id}
          className="animate-in fade-in-up duration-500"
          style={{ 
            animationDelay: `${Math.min(index * 80, 400)}ms`
          }}
        >
          <SessionCard
            session={session}
            onJoinClick={onJoinClick}
            onCancelClick={onCancelClick}
            onCardClick={() => onSessionClick?.(session.id)}
            distance={session.distance}
            currentUserId={currentUserId}
          />
        </div>
      ))}
    </div>
  );
}
