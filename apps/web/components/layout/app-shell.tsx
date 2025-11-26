"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type ComponentType,
  type SVGProps,
  useMemo,
  useState,
} from "react";
import {
  Bell,
  ChevronRight,
  LifeBuoy,
  LineChart,
  Menu,
  MessagesSquare,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const primaryNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LineChart },
  { label: "Chat", href: "/chat", icon: MessagesSquare },
];

const secondaryNav: NavItem[] = [
  { label: "Settings", href: "#", icon: Settings },
  { label: "Help Center", href: "#", icon: LifeBuoy },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-lg">
          <Sparkles className="h-5 w-5 text-amber-300" />
          <div>
            <p className="text-sm font-semibold">Flowbit AI</p>
            <p className="text-xs text-white/70">Finance workspace</p>
          </div>
        </div>

        <nav className="mt-8 space-y-6">
          <div className="space-y-1">
            {primaryNav.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onNavigate?.()}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition hover:bg-slate-100",
                    active
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {active && (
                    <ChevronRight className="ml-auto h-4 w-4 opacity-80" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="space-y-2">
            <p className="px-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Workbench
            </p>
            {secondaryNav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onNavigate?.()}
                  className="flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm shadow-sm">
        <p className="font-medium text-slate-900">Need a walkthrough?</p>
        <p className="mt-1 text-slate-500">
          Our success team can help you configure Flowbit for your workflows.
        </p>
        <Button className="mt-3 w-full">Book a demo</Button>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const activeLabel = useMemo(() => {
    const allItems = [...primaryNav, ...secondaryNav];
    return (
      allItems.find((item) => pathname.startsWith(item.href))?.label ??
      "Dashboard"
    );
  }, [pathname]);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-[1400px] gap-6 px-4 py-6 lg:px-6">
          <aside className="hidden w-64 shrink-0 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur lg:block">
            <SidebarNav />
          </aside>

          <div className="flex min-h-screen flex-1 flex-col rounded-3xl border border-slate-200 bg-white/80 shadow-xl backdrop-blur">
            <header className="border-b border-slate-100 px-6 py-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                  <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        aria-label="Toggle navigation"
                      >
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-80">
                      <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
                    </SheetContent>
                  </Sheet>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Overview
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      {activeLabel}
                    </p>
                  </div>
                </div>

                <div className="relative ml-auto min-w-[200px] flex-1 max-w-md">
                  <Input
                    placeholder="Search reports, vendors, invoices…"
                    className="pl-10"
                    aria-label="Search"
                  />
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search className="h-4 w-4" />
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Notifications">
                        <Bell className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Notifications</TooltipContent>
                  </Tooltip>
                  <Avatar>
                    <AvatarFallback>AJ</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-x-hidden px-6 py-8">{children}</main>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
