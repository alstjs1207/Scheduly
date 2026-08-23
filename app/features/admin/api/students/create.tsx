/**
 * Student Creation API
 *
 * Creates a management profile and organization membership. Authentication is
 * connected later only when the administrator creates an invitation link.
 */
import type { Route } from "./+types/create";

import { data, redirect } from "react-router";

import { requireMethod } from "~/core/lib/guards.server";
import adminClient from "~/core/lib/supa-admin-client.server";
import makeServerClient from "~/core/lib/supa-client.server";

import { requireAdminRole } from "../../guards.server";
import {
  addYearsToDateString,
  getDefaultStudentClassDates,
} from "../../lib/student-class-dates";
import {
  findDuplicateStudentPhone,
  parseStudentForm,
} from "../../lib/student-form.server";

export async function action({ request }: Route.ActionArgs) {
  requireMethod("POST")(request);

  const [client] = makeServerClient(request);
  const { organizationId } = await requireAdminRole(client);

  const formData = await request.formData();

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
  const defaultClassDates = getDefaultStudentClassDates();
  const classStartDate =
    values.class_start_date || defaultClassDates.classStartDate;
  const classEndDate =
    values.class_end_date || addYearsToDateString(classStartDate);
  if (classEndDate < classStartDate) {
    return data(
      {
        success: false,
        fieldErrors: {
          class_end_date: ["수업 종료일은 시작일 이후여야 합니다."],
        },
      },
      { status: 400 },
    );
  }

  try {
    const duplicate = await findDuplicateStudentPhone(adminClient, {
      organizationId,
      phone: values.phone,
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

  const profileId = crypto.randomUUID();
  const studentData = {
    profile_id: profileId,
    auth_user_id: null,
    contact_email: values.email,
    name: values.name,
    region: values.region,
    birth_date: values.birth_date,
    phone: values.phone,
    class_start_date: classStartDate,
    class_end_date: classEndDate,
    parent_name: values.parent_name,
    parent_phone: values.parent_phone,
    description: values.description,
    color: values.color,
    marketing_consent: false,
  };

  const { error: profileError } = await adminClient
    .from("profiles")
    .insert(studentData);

  if (profileError) {
    console.error("Failed to create student profile", profileError);
    return data(
      {
        success: false,
        error: "수강생 정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: 500 },
    );
  }

  // 3. organization_members에 학생 멤버십 생성
  const { error: memberError } = await adminClient
    .from("organization_members")
    .insert({
      organization_id: organizationId,
      profile_id: profileId,
      role: "STUDENT",
      state: "NORMAL",
      type: values.type,
    });

  if (memberError) {
    await adminClient.from("profiles").delete().eq("profile_id", profileId);
    console.error("Failed to create student membership", memberError);
    return data(
      {
        success: false,
        error: "수강생 소속을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: 500 },
    );
  }

  return redirect(`/admin/students/${profileId}`);
}
