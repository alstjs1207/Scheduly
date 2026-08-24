/**
 * Instructor Creation API
 */
import type { Json } from "database.types";

import type { Route } from "./+types/create";

import { data, redirect } from "react-router";

import { requireMethod } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";
import { createInstructor } from "~/features/instructors/queries";

import { requireAdminRole } from "../../guards.server";

const BUCKET_NAME = "instructors";

export async function action({ request }: Route.ActionArgs) {
  requireMethod("POST")(request);

  const [client] = makeServerClient(request);
  const { organizationId } = await requireAdminRole(client);

  const formData = await request.formData();

  const name = String(formData.get("name") || "").trim();
  const info = formData.get("info") as string | null;

  if (!name) {
    return data({ error: "강사명을 입력해 주세요." }, { status: 400 });
  }

  // JSONB 필드
  const careerStr = formData.get("career") as string | null;
  let career: Json[] = [];
  if (careerStr) {
    try {
      career = JSON.parse(careerStr);
    } catch {
      return data({ error: "잘못된 경력 데이터 형식입니다." }, { status: 400 });
    }
  }

  // SNS
  const snsInstagram = formData.get("sns_instagram") as string | null;
  const snsYoutube = formData.get("sns_youtube") as string | null;
  const sns: Record<string, string> = {};
  if (snsInstagram) sns.instagram = snsInstagram;
  if (snsYoutube) sns.youtube = snsYoutube;

  // 먼저 강사 생성 (ID 획득)
  let instructor;
  try {
    instructor = await createInstructor(client, {
      organization_id: organizationId,
      name,
      info: info || null,
      photo_url: null, // 파일 업로드 후 업데이트
      career,
      sns: Object.keys(sns).length > 0 ? sns : {},
    });
  } catch (error) {
    console.error("Failed to create instructor", error);
    return data(
      {
        error: "강사 정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: 500 },
    );
  }

  // 프로필 사진 업로드
  const photoFile = formData.get("photo") as File | null;
  if (photoFile && photoFile.size > 0) {
    const ext = photoFile.name.split(".").pop() || "jpg";
    const path = `${instructor.instructor_id}/photo.${ext}`;

    const { error: uploadError } = await client.storage
      .from(BUCKET_NAME)
      .upload(path, photoFile, { upsert: true });

    if (!uploadError) {
      const { data: urlData } = client.storage
        .from(BUCKET_NAME)
        .getPublicUrl(path);

      // 프로필 사진 URL 업데이트
      await client
        .from("instructors")
        .update({ photo_url: `${urlData.publicUrl}?t=${Date.now()}` })
        .eq("instructor_id", instructor.instructor_id);
    }
  }

  return redirect("/admin/instructors");
}
