import type { Route } from "./+types/update";

import { data, redirect } from "react-router";

import { requireMethod } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";

import { requireAdminRole } from "../../guards.server";
import {
  findDuplicateStudentPhone,
  parseStudentForm,
  parseStudentState,
} from "../../lib/student-form.server";

export async function action({ request, params }: Route.ActionArgs) {
  requireMethod("POST")(request);

  const [client] = makeServerClient(request);
  const { organizationId } = await requireAdminRole(client);

  const formData = await request.formData();
  const { studentId } = params;
  const parsed = parseStudentForm(formData);
  if (!parsed.success) {
    return data(
      {
        success: false,
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }
  const values = parsed.data;
  const parsedState = parseStudentState(formData.get("state"));
  if (!parsedState.success) {
    return data(
      {
        success: false,
        fieldErrors: { state: ["수강생 상태를 선택해 주세요."] },
      },
      { status: 400 },
    );
  }

  try {
    const duplicate = await findDuplicateStudentPhone(client, {
      organizationId,
      phone: values.phone,
      excludeProfileId: studentId,
    });
    if (duplicate) {
      const stateText = duplicate.state === "DELETED" ? "탈퇴 처리된 " : "";
      return data(
        {
          success: false,
          fieldErrors: {
            phone: [
              `동일한 전화번호로 ${stateText}수강생 '${duplicate.name}'님이 이미 등록되어 있습니다.`,
            ],
          },
        },
        { status: 409 },
      );
    }
  } catch (error) {
    console.error("Failed to check duplicate student phone", error);
    return data(
      {
        success: false,
        error:
          "전화번호 중복 여부를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: 500 },
    );
  }

  // Profile updates (personal info)
  const profileUpdates = {
    contact_email: values.email,
    name: values.name,
    region: values.region,
    birth_date: values.birth_date,
    phone: values.phone,
    class_start_date: values.class_start_date,
    class_end_date: values.class_end_date,
    parent_name: values.parent_name,
    parent_phone: values.parent_phone,
    description: values.description,
    color: values.color,
  };

  // Membership updates (state and type are on organization_members table)
  const membershipUpdates = {
    state: parsedState.data,
    type: values.type,
  };

  // Update profile
  const { error: profileError } = await client
    .from("profiles")
    .update(profileUpdates)
    .eq("profile_id", studentId);

  if (profileError) {
    console.error("Failed to update student profile", profileError);
    return data(
      {
        success: false,
        error: "수강생 정보를 수정하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: 500 },
    );
  }

  // Update membership (state and type)
  const { error: membershipError } = await client
    .from("organization_members")
    .update(membershipUpdates)
    .eq("organization_id", organizationId)
    .eq("profile_id", studentId);

  if (membershipError) {
    console.error("Failed to update student membership", membershipError);
    return data(
      {
        success: false,
        error: "수강생 상태를 수정하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: 500 },
    );
  }

  return redirect(`/admin/students/${studentId}`);
}
