import type { Route } from "./+types/list";

import { PlusIcon } from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { Badge } from "~/core/components/ui/badge";
import { Button } from "~/core/components/ui/button";
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
import makeServerClient from "~/core/lib/supa-client.server";
import {
  countSchedulesByProgram,
  getPrograms,
} from "~/features/programs/queries";

import { requireAdminRole } from "../../guards.server";

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  const { organizationId } = await requireAdminRole(client);

  const url = new URL(request.url);
  const statusFilter = url.searchParams.get("status") as
    | "DRAFT"
    | "ACTIVE"
    | "ARCHIVED"
    | undefined;

  const [programs, scheduleCounts] = await Promise.all([
    getPrograms(client, {
      organizationId,
      statusFilter: statusFilter || undefined,
    }),
    countSchedulesByProgram(client, { organizationId }),
  ]);

  return {
    programs,
    scheduleCounts,
    totalCount: programs.length,
  };
}

const statusLabels: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  DRAFT: { label: "초안", variant: "outline" },
  ACTIVE: { label: "활성", variant: "default" },
  ARCHIVED: { label: "보관됨", variant: "secondary" },
};

const levelLabels: Record<string, string> = {
  BEGINNER: "초급",
  INTERMEDIATE: "중급",
  ADVANCED: "고급",
};

export default function ProgramListScreen({
  loaderData,
}: Route.ComponentProps) {
  const { programs, scheduleCounts, totalCount } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();

  const handleStatusFilter = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      newParams.set("status", value);
    } else {
      newParams.delete("status");
    }
    setSearchParams(newParams);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">클래스 관리</h1>
          <p className="text-muted-foreground hidden md:block">
            총 {totalCount}개의 클래스가 등록되어 있습니다.
          </p>
        </div>
        <Button className="min-h-11" asChild>
          <Link to="/admin/programs/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            <span>클래스 등록</span>
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Select
          value={searchParams.get("status") || "all"}
          onValueChange={handleStatusFilter}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 상태</SelectItem>
            <SelectItem value="DRAFT">초안</SelectItem>
            <SelectItem value="ACTIVE">활성</SelectItem>
            <SelectItem value="ARCHIVED">보관됨</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>클래스명</TableHead>
              <TableHead className="w-24">상태</TableHead>
              <TableHead className="hidden md:table-cell">강사명</TableHead>
              <TableHead className="hidden w-24 md:table-cell">
                난이도
              </TableHead>
              <TableHead className="hidden w-28 md:table-cell">가격</TableHead>
              <TableHead className="w-24">스케줄 수</TableHead>
              <TableHead className="hidden w-32 md:table-cell">
                등록일
              </TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {programs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center">
                  등록된 클래스가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              programs.map((program) => (
                <TableRow key={program.program_id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{program.title}</div>
                      {program.subtitle && (
                        <div className="text-muted-foreground text-sm">
                          {program.subtitle}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        statusLabels[program.status]?.variant || "default"
                      }
                    >
                      {statusLabels[program.status]?.label || program.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {program.instructor?.name || "-"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {program.level
                      ? levelLabels[program.level] || program.level
                      : "-"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {program.price
                      ? `${program.price.toLocaleString()}원`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {scheduleCounts[program.program_id] || 0}개
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(program.created_at).toLocaleDateString("ko-KR")}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/admin/programs/${program.program_id}`}>
                        상세
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
