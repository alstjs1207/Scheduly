import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  HomeIcon,
  RotateCwIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router";

import { Button } from "~/core/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/core/components/ui/card";

interface AppErrorProps {
  status?: number;
  title: string;
  description: string;
  technicalDetails?: string;
}

export default function AppError({
  status,
  title,
  description,
  technicalDetails,
}: AppErrorProps) {
  const location = useLocation();
  const homePath = location.pathname.startsWith("/admin") ? "/admin" : "/";

  return (
    <main className="bg-muted/30 flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-sm">
        <CardHeader className="items-center space-y-4 text-center">
          <div className="bg-destructive/10 text-destructive flex size-14 items-center justify-center rounded-full">
            <AlertTriangleIcon className="size-7" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            {status && (
              <p className="text-muted-foreground text-sm font-medium">
                오류 {status}
              </p>
            )}
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription className="text-sm leading-6">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-3">
            <Button
              variant="outline"
              onClick={() => {
                if (window.history.length > 1) window.history.back();
                else window.location.assign(homePath);
              }}
            >
              <ArrowLeftIcon className="size-4" />
              이전 화면
            </Button>
            <Button variant="outline" asChild>
              <Link to={homePath}>
                <HomeIcon className="size-4" />
                홈으로
              </Link>
            </Button>
            <Button onClick={() => window.location.reload()}>
              <RotateCwIcon className="size-4" />
              다시 시도
            </Button>
          </div>

          {technicalDetails && (
            <details className="text-muted-foreground rounded-lg border px-3 py-2 text-xs">
              <summary className="cursor-pointer font-medium">
                개발자 정보
              </summary>
              <pre className="mt-2 max-h-48 overflow-auto break-all whitespace-pre-wrap">
                {technicalDetails}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
