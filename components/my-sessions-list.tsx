"use client";

import { hobbyTitle, type Hobby } from "@/lib/types";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Settings,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface MySessionsListProps {
  sessions: Hobby[];
  onDelete?: (sessionId: string) => void;
}

export function MySessionsList({ sessions, onDelete }: MySessionsListProps) {

  const isSessionPast = (session: Hobby): boolean => {
    const sessionDate = new Date(session.date);
    const [hours, minutes] = session.endTime.split(":").map(Number);
    const endDateTime = new Date(sessionDate);
    endDateTime.setHours(hours, minutes, 0, 0);

    const now = new Date();
    return endDateTime < now;
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          You haven&apos;t created any hobby meetups yet
        </p>
        <Link href="/create">
          <Button className="mt-4 bg-primary hover:bg-primary/90">
            Host your first hobby meetup
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {sessions.map((session, index) => {
        const sessionDate = new Date(session.date);
        const pendingCount =
          session.participants?.filter((p) => p.status === "pending").length ||
          0;
        const approvedCount =
          session.participants?.filter((p) => p.status === "approved").length ||
          0;
        const isPast = isSessionPast(session);

        return (
          <Card
            key={session.id}
            className={`border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg hover:-translate-y-1 animate-in fade-in slide-in-from-bottom duration-500 ${
              isPast ? "opacity-75" : ""
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-balance text-primary">
                      {hobbyTitle(session)}
                    </CardTitle>
                    {isPast && (
                      <Badge className="bg-blue-500/20 text-blue-800 border-blue-500/30">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="mt-1">
                    {session.description || "No description"}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {!isPast ? (
                    <Link href={`/hobbies/${session.id}/manage`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="border-muted text-muted-foreground cursor-not-allowed"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  )}
                  {onDelete && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500/50 hover:bg-red-500/10 hover:border-red-500 text-red-600 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete meetup</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{hobbyTitle(session)}"?
                            This action cannot be undone. All participants will
                            be notified.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(session.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {session.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="border-primary/20"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{format(sessionDate, "EEEE, MMMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>
                    {session.startTime} - {session.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-pretty">
                    {session.location.address}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">
                    {approvedCount} / {session.capacity} participants
                  </span>
                  {pendingCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-primary/10 text-primary border-primary/20"
                    >
                      {pendingCount} pending
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
