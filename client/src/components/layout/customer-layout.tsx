import React from "react";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Home, Gift, Users, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { logoutMutation } = useUser();
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      // Change redirect from /auth to /
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems = [
    { label: "Dashboard", href: "/dashboard", icon: <Home className="h-4 w-4 mr-2" /> },
    { label: "Rewards", href: "/rewards", icon: <Gift className="h-4 w-4 mr-2" /> },
    { label: "Referrals", href: "/referrals", icon: <Users className="h-4 w-4 mr-2" /> },
    { label: "Profile", href: "/profile", icon: <User className="h-4 w-4 mr-2" /> },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 right-6 z-50 lg:hidden h-10 w-10 bg-background shadow-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:relative inset-y-0 left-0 z-50",
        "w-64 lg:w-72 bg-background border-r",
        "transform transition-transform duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-4 md:p-6 border-b">
            <img 
              src="/assets/opian-logo-white.png" 
              alt="OPIAN Rewards"
              className="h-8 md:h-12 w-auto object-contain mx-auto dark:invert"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.onerror = null;
                img.src = '/logo-fallback.png';
              }}
            />
          </div>
          <div className="px-2 md:px-3 py-4 flex-1 overflow-y-auto">
            <h2 className="mb-2 px-3 md:px-4 text-base md:text-lg font-semibold text-[#1b75bc]">
              Rewards Portal
            </h2>
            <div className="space-y-1">
              {menuItems.map((item) => (
                <Button
                  key={item.href}
                  variant={location === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start text-sm md:text-base capitalize"
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                >
                  {item.icon}
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="p-3 md:p-4 border-t mt-auto">
            <Button 
              variant="outline" 
              className="w-full text-sm md:text-base" 
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
        <div className="h-full p-4 lg:p-8">
          {children}
        </div>
      </main>

      {/* Bottom Navigation Bar - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t lg:hidden">
        <div className="flex items-center justify-around h-16">
          {menuItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              className={cn(
                "flex flex-col items-center justify-center h-full w-full space-y-1 rounded-none",
                location === item.href && "bg-secondary"
              )}
              onClick={() => navigate(item.href)}
            >
              {React.cloneElement(item.icon, { className: "h-5 w-5" })}
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>
    </div>
  );
}