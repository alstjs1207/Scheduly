/**
 * Student Creation API
 *
 * Creates a management profile and organization membership. Authentication is
 * connected later only when the administrator creates an invitation link.
 */
import type { Route } from "./+types/create";

import { redirect } from "react-router";
import { z } from "zod";

import { requireMethod } from "~/core/lib/guards.server";
import adminClient from "~/core/lib/supa-admin-client.server";
import makeServerClient from "~/core/lib/supa-client.server";

import { requireAdminRole } from "../../guards.server";

export async function action({ request }: Route.ActionArgs) {
  requireMethod("POST")(request);

  const [client] = makeServerClient(request);
  const { organizationId } = await requireAdminRole(client);

  const formData = await request.formData();

  const email = String(formData.get("email") || "").trim() || null;
  const name = String(formData.get("name") || "").trim();
  const studentType = formData.get("type") as "EXAMINEE" | "DROPPER" | "ADULT";

  if (!name) {
    throw new Response("이름은 필수입니다.", { status: 400 });
  }
  if (email && !z.string().email().safeParse(email).success) {
    throw new Response("이메일 형식을 확인해 주세요.", { status: 400 });
  }

  const profileId = crypto.randomUUID();
  const studentData = {
    profile_id: profileId,
    auth_user_id: null,
    contact_email: email,
    name,
    region: formData.get("region") as string,
    birth_date: formData.get("birth_date") as string,
    phone: formData.get("phone") as string,
    class_start_date: formData.get("class_start_date") as string,
    class_end_date: formData.get("class_end_date") as string,
    parent_name: (formData.get("parent_name") as string) || null,
    parent_phone: (formData.get("parent_phone") as string) || null,
    description: (formData.get("description") as string) || null,
    color: (formData.get("color") as string) || "#3B82F6",
    marketing_consent: false,
  };

  const { error: profileError } = await adminClient
    .from("profiles")
    .insert(studentData);

  if (profileError) {
    throw new Error(profileError.message);
  }

  // 3. organization_members에 학생 멤버십 생성
  const { error: memberError } = await adminClient
    .from("organization_members")
    .insert({
      organization_id: organizationId,
      profile_id: profileId,
      role: "STUDENT",
      state: "NORMAL",
      type: studentType,
    });

  if (memberError) {
    await adminClient.from("profiles").delete().eq("profile_id", profileId);
    throw new Error(memberError.message);
  }

  return redirect(`/admin/students/${profileId}`);
}
