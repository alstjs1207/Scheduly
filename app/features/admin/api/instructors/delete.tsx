/**
 * Instructor Delete API
 */
import type { Route } from "./+types/delete";

import { data, redirect } from "react-router";

import { requireMethod } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";
import { deleteInstructor } from "~/features/instructors/queries";

import { requireAdminRole } from "../../guards.server";

export async function action({ request, params }: Route.ActionArgs) {
  requireMethod("POST")(request);

  const [client] = makeServerClient(request);
  await requireAdminRole(client);

  const instructorId = parseInt(params.instructorId);

  try {
    await deleteInstructor(client, { instructorId });
  } catch (error) {
    console.error("Failed to delete instructor", error);
    return data(
      {
        success: false,
        error:
          "강사를 삭제하지 못했습니다. 연결된 일정이 있는지 확인한 뒤 다시 시도해 주세요.",
      },
      { status: 500 },
    );
  }

  return redirect("/admin/instructors");
}
