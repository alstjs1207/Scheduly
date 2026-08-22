import { addMonths, format, subMonths } from "date-fns";
import { ko } from "date-fns/locale";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ListIcon,
  PlusIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";

import { Button } from "~/core/components/ui/button";
import { MobileMonthGrid } from "~/features/schedules/components/mobile-month-grid";

import {
  getDateInMonth,
  getInitialCalendarDate,
} from "../utils/mobile-calendar";
import { AdminMobileDayEvents } from "./admin-mobile-day-events";

interface AdminCalendarEvent {
  id: string;
  title: string;
  start: string | Date;
  end: string | Date;
  extendedProps?: {
    scheduleId: number;
    studentName: string;
    studentRegion: string | null;
    programName: string | null;
    studentColor: string;
  };
}

interface AdminMobileCalendarProps {
  events: AdminCalendarEvent[];
  year: number;
  month: number;
}

export function AdminMobileCalendar({
  events,
  year,
  month,
}: AdminMobileCalendarProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedDate, setSelectedDate] = useState(() =>
    getInitialCalendarDate(year, month),
  );
  const [displayedMonth, setDisplayedMonth] = useState(
    () => new Date(year, month - 1, 1),
  );

  useEffect(() => {
    const nextMonth = new Date(year, month - 1, 1);
    setDisplayedMonth(nextMonth);
    setSelectedDate((current) => {
      if (current.getFullYear() === year && current.getMonth() === month - 1) {
        return current;
      }
      return getDateInMonth(current, nextMonth);
    });
  }, [month, year]);

  const eventColorsByDate = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const event of events) {
      const d = new Date(event.start);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const color = event.extendedProps?.studentColor ?? "#3B82F6";
      const existing = map.get(key) || [];
      existing.push(color);
      map.set(key, existing);
    }
    return map;
  }, [events]);

  const navigateMonth = (direction: -1 | 1) => {
    const next =
      direction === -1
        ? subMonths(displayedMonth, 1)
        : addMonths(displayedMonth, 1);
    setDisplayedMonth(next);

    // Keep the selected date in the month the administrator is viewing so
    // the agenda and add button cannot silently point at the previous month.
    setSelectedDate(getDateInMonth(selectedDate, next));

    const newYear = next.getFullYear();
    const newMonth = next.getMonth() + 1;
    setSearchParams({ year: String(newYear), month: String(newMonth) });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    if (
      date.getMonth() !== displayedMonth.getMonth() ||
      date.getFullYear() !== displayedMonth.getFullYear()
    ) {
      setDisplayedMonth(new Date(date.getFullYear(), date.getMonth(), 1));
      setSearchParams({
        year: String(date.getFullYear()),
        month: String(date.getMonth() + 1),
      });
    }
  };

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col">
      {/* Header */}
      <div className="bg-background shrink-0 border-b pb-2">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11"
              aria-label="이전 달"
              onClick={() => navigateMonth(-1)}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <h2 className="min-w-[120px] text-center text-base font-semibold">
              {format(displayedMonth, "yyyy년 M월", { locale: ko })}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11"
              aria-label="다음 달"
              onClick={() => navigateMonth(1)}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="h-11 w-11" asChild>
            <Link
              to={`/admin/schedules/list?${searchParams.toString()}`}
              aria-label="일정 목록 보기"
            >
              <ListIcon className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Month grid */}
        <MobileMonthGrid
          events={events}
          selectedDate={selectedDate}
          displayedMonth={displayedMonth}
          onDateSelect={handleDateSelect}
          onMonthChange={navigateMonth}
          eventColorsByDate={eventColorsByDate}
          disableDateRestrictions
        />
        <div className="text-muted-foreground flex items-center justify-between px-5 pt-2 text-[0.6875rem]">
          <span className="flex items-center gap-1.5">
            <span className="bg-primary size-2 rounded-full ring-1 ring-black/10 dark:ring-white/20" />
            색상 점은 수강생별 일정입니다
          </span>
          <span>날짜를 눌러 확인</span>
        </div>
      </div>

      {/* Scrollable event list */}
      <div className="flex-1 overflow-y-auto">
        {/* Selected date header */}
        <div className="px-4 pt-4 pb-2">
          <h3 className="text-muted-foreground text-sm font-medium">
            {format(selectedDate, "M월 d일 EEEE", { locale: ko })}
          </h3>
        </div>

        {/* Day events */}
        <div className="pb-20">
          <AdminMobileDayEvents events={events} selectedDate={selectedDate} />
        </div>
      </div>

      {/* FAB */}
      <Link
        to={`/admin/schedules/new?date=${selectedDateStr}`}
        aria-label={`${format(selectedDate, "M월 d일", { locale: ko })} 일정 등록`}
        className="bg-primary text-primary-foreground shadow-primary/25 fixed right-5 bottom-20 z-20 flex h-14 items-center justify-center gap-2 rounded-full px-5 font-semibold shadow-lg transition-transform active:scale-95 md:right-6 md:bottom-6"
      >
        <PlusIcon className="h-6 w-6" />
        <span>일정 등록</span>
      </Link>
    </div>
  );
}
