import type { Route } from "./+types/delete";

import { data, redirect } from "react-router";

import { requireMethod } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";

import { requireAdminRole } from "../../guards.server";

export async function action({ request, params }: Route.ActionArgs) {
  requireMethod("POST")(request);

  const [client] = makeServerClient(request);
  const { organizationId } = await requireAdminRole(client);

  const { studentId } = params;

  // Update state in organization_members (N:N relationship)
  const { error } = await client
    .from("organization_members")
    .update({ state: "DELETED" })
    .eq("organization_id", organizationId)
    .eq("profile_id", studentId)
    .eq("role", "STUDENT");

  if (error) {
    console.error("Failed to delete student", error);
    return data(
      {
        success: false,
        error: "수강생을 탈퇴 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: 500 },
    );
  }

  return redirect("/admin/students");
}
