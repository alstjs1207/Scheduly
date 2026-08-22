import type { Route } from "./+types/list";

import {
  ChevronRightIcon,
  Clock3Icon,
  MailIcon,
  PhoneIcon,
  SearchIcon,
  UserPlusIcon,
} from "lucide-react";
import { useState } from "react";
import { Link, useFetcher, useNavigate, useSearchParams } from "react-router";

import { Badge } from "~/core/components/ui/badge";
import { Button } from "~/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/core/components/ui/dialog";
import { Input } from "~/core/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/core/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/core/components/ui/table";
import adminClient from "~/core/lib/supa-admin-client.server";
import makeServerClient from "~/core/lib/supa-client.server";

import { requireAdminRole } from "../../guards.server";
import {
  getStudentEmails,
  getStudentsPaginated,
  getStudentsTotalHours,
} from "../../queries";

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  const { organizationId } = await requireAdminRole(client);

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const search = url.searchParams.get("search") || undefined;
  const stateFilter = url.searchParams.get("state") as
    | "NORMAL"
    | "GRADUATE"
    | "DELETED"
    | undefined;
  const typeFilter = url.searchParams.get("type") as
    | "EXAMINEE"
    | "DROPPER"
    | "ADULT"
    | undefined;

  const result = await getStudentsPaginated(client, {
    organizationId,
    page,
    pageSize: 20,
    search,
    stateFilter: stateFilter || undefined,
    typeFilter: typeFilter || undefined,
  });

  // 각 학생의 총 수강시간과 이메일 조회
  const studentIds = result.students.map((s) => s.profile_id);
  const [totalHours, emails] = await Promise.all([
    getStudentsTotalHours(client, { organizationId, studentIds }),
    getStudentEmails(adminClient, { studentIds }),
  ]);

  return {
    ...result,
    totalHours,
    emails,
  };
}

const stateLabels: Record<
  string,
  { label: string; variant: "success" | "secondary" | "destructive" }
> = {
  NORMAL: { label: "정상", variant: "success" },
  GRADUATE: { label: "졸업", variant: "secondary" },
  DELETED: { label: "탈퇴", variant: "destructive" },
};

const typeLabels: Record<string, string> = {
  EXAMINEE: "입시생",
  DROPPER: "재수생",
  ADULT: "성인",
};

function formatPhoneNumber(value: string | null) {
  if (!value) return "연락처 없음";
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  }
  return value;
}

export default function StudentListScreen({
  loaderData,
}: Route.ComponentProps) {
  const { students, totalCount, totalPages, currentPage, totalHours, emails } =
    loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const [inviteStudent, setInviteStudent] = useState<{
    id: string;
    name: string;
    email?: string;
  } | null>(null);
  const inviteFetcher = useFetcher<{ success: boolean; error?: string }>();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get("search") as string;
    const newParams = new URLSearchParams(searchParams);
    if (search) {
      newParams.set("search", search);
    } else {
      newParams.delete("search");
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handleStateFilter = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      newParams.set("state", value);
    } else {
      newParams.delete("state");
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handleTypeFilter = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      newParams.set("type", value);
    } else {
      newParams.delete("type");
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">수강생 관리</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            총 {totalCount}명의 수강생이 등록되어 있습니다.
          </p>
        </div>
        <Button
          className="min-h-11 shrink-0 rounded-full px-4 shadow-sm"
          asChild
        >
          <Link to="/admin/students/new">
            <UserPlusIcon className="mr-1.5 h-4 w-4" />
            <span>수강생 등록</span>
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <form onSubmit={handleSearch} className="flex gap-2 md:flex-1">
          <div className="relative min-w-0 flex-1 md:max-w-72">
            <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              name="search"
              placeholder="이름 또는 전화번호 검색"
              defaultValue={searchParams.get("search") || ""}
              className="h-11 w-full pl-9 md:h-9"
            />
          </div>
          <Button
            type="submit"
            variant="secondary"
            className="min-h-11 md:min-h-9"
          >
            검색
          </Button>
        </form>

        <div className="grid grid-cols-2 gap-2 md:flex">
          <Select
            value={searchParams.get("state") || "all"}
            onValueChange={handleStateFilter}
          >
            <SelectTrigger className="h-11 w-full md:h-9 md:w-32">
              <SelectValue placeholder="상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 상태</SelectItem>
              <SelectItem value="NORMAL">정상</SelectItem>
              <SelectItem value="GRADUATE">졸업</SelectItem>
              <SelectItem value="DELETED">탈퇴</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={searchParams.get("type") || "all"}
            onValueChange={handleTypeFilter}
          >
            <SelectTrigger className="h-11 w-full md:h-9 md:w-32">
              <SelectValue placeholder="유형" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 유형</SelectItem>
              <SelectItem value="EXAMINEE">입시생</SelectItem>
              <SelectItem value="DROPPER">재수생</SelectItem>
              <SelectItem value="ADULT">성인</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {students.length === 0 ? (
          <div className="bg-card text-muted-foreground rounded-xl border py-12 text-center text-sm">
            등록된 수강생이 없습니다.
          </div>
        ) : (
          students.map((student) => (
            <article
              key={student.profile_id}
              className="bg-card rounded-xl border p-4 shadow-sm"
            >
              <Link
                to={`/admin/students/${student.profile_id}`}
                className="group block"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="ring-background mt-1 size-3 shrink-0 rounded-full ring-2"
                    style={{ backgroundColor: student.color || "#EA580C" }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate font-semibold">{student.name}</h2>
                      <Badge
                        variant={
                          stateLabels[student.state]?.variant || "secondary"
                        }
                      >
                        {stateLabels[student.state]?.label || student.state}
                      </Badge>
                      {student.type && (
                        <Badge variant="info">
                          {typeLabels[student.type] || student.type}
                        </Badge>
                      )}
                    </div>
                    <div className="text-muted-foreground mt-2 flex items-center gap-1.5 text-sm">
                      <PhoneIcon className="size-3.5" aria-hidden="true" />
                      <span>{formatPhoneNumber(student.phone)}</span>
                    </div>
                    <div className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
                      <Clock3Icon className="size-3.5" aria-hidden="true" />
                      <span>
                        누적{" "}
                        {Math.round(
                          (totalHours[student.profile_id] || 0) * 10,
                        ) / 10}
                        시간
                      </span>
                      {emails[student.profile_id] && (
                        <span className="truncate">
                          · {emails[student.profile_id]}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRightIcon className="text-muted-foreground mt-2 size-5 shrink-0 transition-transform group-active:translate-x-0.5" />
                </div>
              </Link>
              {student.state === "NORMAL" && (
                <div className="mt-3 flex justify-end border-t pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground min-h-10"
                    onClick={() =>
                      setInviteStudent({
                        id: student.profile_id,
                        name: student.name,
                      })
                    }
                  >
                    <MailIcon className="mr-1.5 size-4" />
                    초대 메일
                  </Button>
                </div>
              )}
            </article>
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-20 md:table-cell">ID</TableHead>
              <TableHead className="w-24">상태</TableHead>
              <TableHead className="w-24">유형</TableHead>
              <TableHead>이름</TableHead>
              <TableHead className="hidden md:table-cell">이메일</TableHead>
              <TableHead className="hidden w-28 md:table-cell">
                총 수강시간
              </TableHead>
              <TableHead className="hidden w-32 md:table-cell">
                등록일
              </TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center">
                  등록된 수강생이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow
                  key={student.profile_id}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() =>
                    navigate(`/admin/students/${student.profile_id}`)
                  }
                >
                  <TableCell className="hidden font-mono text-xs md:table-cell">
                    {student.profile_id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={stateLabels[student.state]?.variant || "default"}
                    >
                      {stateLabels[student.state]?.label || student.state}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {student.type
                      ? typeLabels[student.type] || student.type
                      : "-"}
                  </TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell className="hidden text-sm md:table-cell">
                    {emails[student.profile_id] || "-"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {Math.round((totalHours[student.profile_id] || 0) * 10) /
                      10}
                    시간
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(student.created_at).toLocaleDateString("ko-KR")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {student.state === "NORMAL" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="min-h-11 min-w-11"
                          aria-label={`${student.name} 초대 이메일 발송`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setInviteStudent({
                              id: student.profile_id,
                              name: student.name,
                            });
                          }}
                        >
                          <MailIcon className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="min-h-11"
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link to={`/admin/students/${student.profile_id}`}>
                          상세
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => {
              const newParams = new URLSearchParams(searchParams);
              newParams.set("page", String(currentPage - 1));
              setSearchParams(newParams);
            }}
          >
            이전
          </Button>
          <span className="text-muted-foreground text-sm">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => {
              const newParams = new URLSearchParams(searchParams);
              newParams.set("page", String(currentPage + 1));
              setSearchParams(newParams);
            }}
          >
            다음
          </Button>
        </div>
      )}

      <Dialog
        open={!!inviteStudent}
        onOpenChange={(open) => !open && setInviteStudent(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>초대 이메일 발송</DialogTitle>
            <DialogDescription>
              {inviteStudent?.name} 수강생에게 초대 이메일을 발송하시겠습니까?
              수강생은 이메일을 통해 비밀번호를 설정하고 로그인할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          {inviteFetcher.data?.success === false && (
            <p className="text-destructive text-sm">
              {inviteFetcher.data.error}
            </p>
          )}
          {inviteFetcher.data?.success === true && (
            <p className="text-sm text-green-600">
              초대 이메일이 발송되었습니다.
            </p>
          )}
          <DialogFooter>
            <inviteFetcher.Form
              method="post"
              action={`/api/admin/students/${inviteStudent?.id}/invite`}
            >
              <Button type="submit" disabled={inviteFetcher.state !== "idle"}>
                {inviteFetcher.state !== "idle" ? "발송 중..." : "발송"}
              </Button>
            </inviteFetcher.Form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
