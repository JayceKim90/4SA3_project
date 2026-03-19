"use client";

import type { SessionParticipant } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, X, Clock } from "lucide-react";

interface JoinRequestCardProps {
  participant: SessionParticipant;
  onApprove?: (participantId: string) => void;
  onReject?: (participantId: string) => void;
}

export function JoinRequestCard({
  participant,
  onApprove,
  onReject,
}: JoinRequestCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getStatusBadge = () => {
    switch (participant.status) {
      case "approved":
        return <Badge className="bg-blue-600">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  return (
    <Card className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {participant.user ? getInitials(participant.user.name) : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">
                {participant.user?.name || "Unknown User"}
              </p>
              <p className="text-sm text-muted-foreground">
                Account: {participant.user?.email || "—"}
              </p>
              {(participant.contactEmail || participant.contactPhone) && (
                <p className="text-xs text-muted-foreground mt-1 space-y-0.5">
                  {participant.contactEmail && (
                    <span className="block">
                      Join email: {participant.contactEmail}
                    </span>
                  )}
                  {participant.contactPhone && (
                    <span className="block">
                      Join phone: {participant.contactPhone}
                    </span>
                  )}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Requested{" "}
                {new Date(participant.requestedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {participant.status === "pending" && onApprove && onReject && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onApprove(participant.id)}
                  className="border-blue-500/50 hover:bg-blue-500/10 hover:border-blue-500 transition-all"
                >
                  <Check className="h-4 w-4 text-blue-600" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onReject(participant.id)}
                  className="border-red-500/50 hover:bg-red-500/10 hover:border-red-500 transition-all"
                >
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
