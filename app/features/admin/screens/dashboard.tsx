import type { Route } from "./+types/dashboard";

import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CalendarIcon,
  UsersIcon,
} from "lucide-react";
import { Link } from "react-router";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/core/components/ui/card";
import makeServerClient from "~/core/lib/supa-client.server";
import { getMonthlySchedules } from "~/features/schedules/queries";

import AdminCalendar from "../components/admin-calendar";
import { requireAdminRole } from "../guards.server";
import { getDashboardStats } from "../queries";

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  const { organizationId } = await requireAdminRole(client);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const nextMonthDate = new Date(year, month, 1);
  const [stats, schedules, nextMonthSchedules] = await Promise.all([
    getDashboardStats(client, { organizationId }),
    getMonthlySchedules(client, { organizationId, year, month }),
    getMonthlySchedules(client, {
      organizationId,
      year: nextMonthDate.getFullYear(),
      month: nextMonthDate.getMonth() + 1,
    }),
  ]);

  // Transform schedules to calendar events
  const events = [...schedules, ...nextMonthSchedules].map((schedule) => {
    const studentName = schedule.student?.name || "알 수 없음";
    const programName = schedule.program?.title || null;
    const studentColor = schedule.student?.color || "#3B82F6";

    return {
      id: String(schedule.schedule_id),
      title: studentName,
      start: schedule.start_time,
      end: schedule.end_time,
      backgroundColor: `${studentColor}20`,
      borderColor: studentColor,
      textColor: "inherit",
      extendedProps: {
        studentId: schedule.student_id,
        scheduleId: schedule.schedule_id,
        programId: schedule.program_id,
        studentName,
        programName,
        studentColor,
      },
    };
  });

  return { stats, events };
}

export default function AdminDashboardScreen({
  loaderData,
}: Route.ComponentProps) {
  const { stats, events } = loaderData;
  const now = new Date();
  const upcomingLimit = new Date(now);
  upcomingLimit.setDate(upcomingLimit.getDate() + 14);

  const upcomingEvents = events
    .filter((event) => {
      const start = new Date(event.start);
      return start >= now && start < upcomingLimit;
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight md:text-2xl">
          대시보드
        </h1>
        <p className="text-muted-foreground hidden text-sm md:block">
          Lestly 관리자 대시보드입니다.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 md:gap-4 lg:grid-cols-4">
        <Link to="/admin/students">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 md:pb-2">
              <CardTitle className="text-sm font-medium">전체 수강생</CardTitle>
              <UsersIcon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold md:text-2xl">
                {stats.totalStudents}명
              </div>
              <p className="text-muted-foreground hidden text-xs md:block">
                수강생 관리 →
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 md:pb-2">
            <CardTitle className="text-sm font-medium">정상 수강생</CardTitle>
            <UsersIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold md:text-2xl">
              {stats.activeStudents}명
            </div>
            <p className="text-muted-foreground hidden text-xs md:block">
              현재 수업 중인 수강생
            </p>
          </CardContent>
        </Card>

        <Link to="/admin/schedules">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 md:pb-2">
              <CardTitle className="text-sm font-medium">일정 관리</CardTitle>
              <CalendarIcon className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold md:text-2xl">
                {stats.monthlyScheduleCount}건
              </div>
              <p className="text-muted-foreground hidden text-xs md:block">
                일정 관리 →
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/today">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 md:pb-2">
              <CardTitle className="text-sm font-medium">오늘의 수업</CardTitle>
              <CalendarDaysIcon className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold md:text-2xl">
                {stats.todayScheduleCount}건
              </div>
              <p className="text-muted-foreground hidden text-xs md:block">
                오늘의 수업 보기 →
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card className="md:hidden">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarIcon className="h-5 w-5" />
            다가오는 일정
          </CardTitle>
          <Link
            to="/admin/schedules"
            className="text-primary flex min-h-11 items-center gap-1 text-sm font-medium"
          >
            전체 보기
            <ArrowRightIcon className="size-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center text-sm">
              향후 14일간 등록된 일정이 없습니다.
            </div>
          ) : (
            <div className="divide-y">
              {upcomingEvents.map((event) => {
                const start = new Date(event.start);
                const end = new Date(event.end);
                return (
                  <Link
                    key={event.id}
                    to={`/admin/schedules/${event.extendedProps.scheduleId}/edit`}
                    className="flex min-h-16 items-center gap-3 py-3"
                  >
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: event.extendedProps.studentColor,
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {event.extendedProps.studentName}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {event.extendedProps.programName || "클래스 미지정"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right text-xs">
                      <p className="font-medium">
                        {start.toLocaleDateString("ko-KR", {
                          month: "numeric",
                          day: "numeric",
                          weekday: "short",
                        })}
                      </p>
                      <p className="text-muted-foreground">
                        {start.toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" - "}
                        {end.toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            이번 달 일정
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AdminCalendar events={events} />
        </CardContent>
      </Card>
    </div>
  );
}
