import type { Route } from "./+types/update";

import { data, redirect } from "react-router";

import { requireMethod } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";
import { updateOrganization } from "~/features/organizations/queries";

import { requireAdminRole } from "../../guards.server";

export async function action({ request }: Route.ActionArgs) {
  requireMethod("POST")(request);

  const [client] = makeServerClient(request);
  const { organizationId } = await requireAdminRole(client);

  const formData = await request.formData();

  const name = String(formData.get("name") || "").trim();
  const description = formData.get("description") as string | null;

  if (!name) {
    return data({ error: "조직 이름을 입력해 주세요." }, { status: 400 });
  }

  try {
    await updateOrganization(client, {
      organizationId,
      updates: {
        name,
        description: description || null,
      },
    });
  } catch (error) {
    console.error("Failed to update organization", error);
    return data(
      {
        error: "조직 정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: 500 },
    );
  }

  return redirect("/admin/organization");
}
