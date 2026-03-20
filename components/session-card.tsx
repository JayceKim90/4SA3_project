"use client";

import { groupTitle, type SessionSearchResult } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Check,
  X,
  CheckCircle2,
  UserCircle,
} from "lucide-react";
import { format } from "date-fns";

interface SessionCardProps {
  session: SessionSearchResult;
  onJoinClick?: (sessionId: string) => void;
  onCancelClick?: (sessionId: string) => void;
  onCardClick?: () => void;
  distance?: number;
  currentUserId?: string | null;
}

export function SessionCard({
  session,
  onJoinClick,
  onCancelClick,
  onCardClick,
  distance,
  currentUserId,
}: SessionCardProps) {
  const sessionDate = new Date(session.date);
  const participantCount =
    session.participants?.filter((p) => p.status === "approved").length || 0;


  const isMySession =
    !!currentUserId &&
    String(session.hostId) === String(currentUserId);


  const isSessionPast = (): boolean => {
    const [hours, minutes] = session.endTime.split(":").map(Number);
    const endDateTime = new Date(sessionDate);
    endDateTime.setHours(hours, minutes, 0, 0);

    const now = new Date();
    return endDateTime < now;
  };

  const isPast = isSessionPast();

  const renderActionButton = () => {
    if (!onJoinClick) return null;


    if (isMySession) {
      return (
        <Button
          disabled
          variant="outline"
          className="w-full mt-2 bg-primary/10 text-primary border-primary/30 cursor-default"
        >
          <UserCircle className="h-4 w-4 mr-2" />
          My meetup
        </Button>
      );
    }


    if (isPast) {
      return (
        <Button
          disabled
          variant="outline"
          className="w-full mt-2 bg-blue-50 text-blue-800 border-blue-200 cursor-not-allowed"
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Meetup completed
        </Button>
      );
    }

    if (session.participationStatus === "approved") {
      return (
        <Button
          disabled
          variant="outline"
          className="w-full mt-2 bg-blue-50 text-blue-800 border-blue-200"
        >
          <Check className="h-4 w-4 mr-2" />
          Joined
        </Button>
      );
    }

    if (session.participationStatus === "pending") {
      return (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onCancelClick?.(session.id);
          }}
          variant="outline"
          className="w-full mt-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel Request
        </Button>
      );
    }

    if (session.participationStatus === "rejected") {
      return (
        <Button
          disabled
          variant="outline"
          className="w-full mt-2 bg-red-50 text-red-700 border-red-200"
        >
          Request Rejected
        </Button>
      );
    }

    const isFull = participantCount >= session.capacity;

    return (
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onJoinClick(session.id);
        }}
        className="w-full mt-2 bg-primary hover:bg-primary/90 transition-all hover:-translate-y-0.5 shadow-md hover:shadow-lg"
        disabled={isFull}
      >
        {isFull ? "Meetup full" : "Request to join"}
      </Button>
    );
  };

  return (
    <Card
      onClick={onCardClick}
      className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-primary/20 hover:border-primary/40 group ${
        isPast ? "opacity-75" : ""
      } ${onCardClick ? "cursor-pointer" : ""}`}
    >
      <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary/50 group-hover:from-primary group-hover:via-primary/80 group-hover:to-primary transition-all" />
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-balance text-primary group-hover:text-primary/80 transition-colors">
                {groupTitle(session)}
              </CardTitle>
              {isMySession && (
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  <UserCircle className="h-3 w-3 mr-1" />
                  My meetup
                </Badge>
              )}
              {isPast && (
                <Badge className="bg-blue-500/20 text-blue-800 border-blue-500/30">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
            <CardDescription className="mt-1">
              {session.description || "No description provided"}
            </CardDescription>
          </div>
          {distance !== undefined && (
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20"
            >
              {distance.toFixed(1)} km
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {session.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="border-primary/20 hover:bg-primary/5 transition-colors"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">

          <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{format(sessionDate, "EEEE, MMMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            <Clock className="h-4 w-4 text-primary" />
            <span>
              {session.startTime} - {session.endTime}
            </span>
          </div>


          <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-pretty">{session.location.address}</span>
          </div>


          <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            <Users className="h-4 w-4 text-primary" />
            <span>
              {participantCount} / {session.capacity} participants
            </span>
          </div>


          {renderActionButton()}
        </div>
      </CardContent>
    </Card>
  );
}
