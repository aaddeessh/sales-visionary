import { Bell, Search, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const { user, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-lg">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search analytics, reports..."
            className="w-80 border-secondary bg-secondary/50 pl-10 focus:border-primary focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-warning animate-pulse" />
        </Button>
        
        <div className="flex items-center gap-3 rounded-lg bg-secondary/50 px-3 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground">{user?.user_metadata?.display_name || user?.email}</p>
            <p className="text-xs text-muted-foreground">Data Analyst</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-foreground">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
