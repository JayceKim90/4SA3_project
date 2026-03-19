import { CreateSessionForm } from "@/components/create-session-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";

export default function CreateSessionPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-semibold">HobbyHop</h1>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <CreateSessionForm />
        </div>
      </main>
    </div>
  );
}
