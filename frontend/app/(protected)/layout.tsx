"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "@/src/components/search";
import { ThemeToggle } from "@/src/components/theme-toggle";
import { useAuthStore } from "@/src/stores/auth-store";
import { useAuth } from "@/src/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { UploadDialog } from "@/src/components/upload/upload-dialog";
import { Plus, LogOut, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const { logout } = useAuth();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="">
        <div className="container mx-auto px-4 pt-4">
          <nav className="flex items-center gap-4 relative border-b pb-6">
            <Link href="/feed" className="cursor-pointer absolute">
              <Image
                src="/nextgram-logo.png"
                alt="Nextgram"
                width={192}
                height={40}
                unoptimized
                className="h-10 w-auto object-contain"
              />
            </Link>
            <div className="flex-1 flex justify-center">
              <div className="w-full max-w-md">
                <Search token={token} showDropdown />
              </div>
            </div>
            <div className="absolute right-0 flex items-center gap-2">
              <span className="text-sm font-bold">{user?.username}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (user?.id) {
                    router.push(`/profile/${user.id}`);
                  }
                }}
                title="My Profile"
              >
                <User className="h-5 w-5" />
              </Button>
              <Button
                variant="default"
                size="icon"
                onClick={() => setUploadDialogOpen(true)}
                title="Create new post"
              >
                <Plus className="h-5 w-5" />
              </Button>
              <Button 
                variant="destructive" 
                size="icon"
                onClick={logout}
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </header>
      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSuccess={() => window.location.reload()}
      />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
