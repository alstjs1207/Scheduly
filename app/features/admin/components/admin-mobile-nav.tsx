import {
  CalendarDaysIcon,
  CalendarIcon,
  HomeIcon,
  UsersIcon,
} from "lucide-react";
import { NavLink } from "react-router";

import { cn } from "~/core/lib/utils";

const items = [
  { label: "홈", to: "/admin", icon: HomeIcon, end: true },
  { label: "오늘", to: "/admin/today", icon: CalendarDaysIcon },
  { label: "일정", to: "/admin/schedules", icon: CalendarIcon },
  { label: "수강생", to: "/admin/students", icon: UsersIcon },
];

export default function AdminMobileNav() {
  return (
    <nav
      aria-label="관리자 주요 메뉴"
      className="bg-background/95 fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-4 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className="min-h-14"
        >
          {({ isActive }) => (
            <span
              className={cn(
                "text-muted-foreground flex h-full flex-col items-center justify-center gap-0.5 text-[0.6875rem] font-medium transition-colors",
                isActive && "text-primary",
              )}
            >
              <span
                className={cn(
                  "flex h-8 min-w-14 items-center justify-center rounded-full transition-colors",
                  isActive && "bg-primary/15",
                )}
              >
                <item.icon className="size-5" aria-hidden="true" />
              </span>
              <span>{item.label}</span>
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
