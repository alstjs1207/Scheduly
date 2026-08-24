/**
 * Instructor Update API
 */
import type { Json } from "database.types";

import type { Route } from "./+types/update";

import { data, redirect } from "react-router";

import { requireMethod } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";
import { updateInstructor } from "~/features/instructors/queries";

import { requireAdminRole } from "../../guards.server";

const BUCKET_NAME = "instructors";

export async function action({ request, params }: Route.ActionArgs) {
  requireMethod("POST")(request);

  const [client] = makeServerClient(request);
  await requireAdminRole(client);

  const instructorId = parseInt(params.instructorId);
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

  // 프로필 사진 처리
  let photoUrl: string | null = null;
  const photoFile = formData.get("photo") as File | null;
  const existingPhotoUrl = formData.get("existing_photo_url") as string | null;

  if (photoFile && photoFile.size > 0) {
    // 새 이미지 업로드
    const ext = photoFile.name.split(".").pop() || "jpg";
    const path = `${instructorId}/photo.${ext}`;

    const { error: uploadError } = await client.storage
      .from(BUCKET_NAME)
      .upload(path, photoFile, { upsert: true });

    if (!uploadError) {
      const { data: urlData } = client.storage
        .from(BUCKET_NAME)
        .getPublicUrl(path);
      photoUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    }
  } else if (existingPhotoUrl) {
    // 기존 이미지 유지
    photoUrl = existingPhotoUrl;
  }

  try {
    await updateInstructor(client, {
      instructorId,
      updates: {
        name,
        info: info || null,
        photo_url: photoUrl,
        career,
        sns: Object.keys(sns).length > 0 ? sns : {},
      },
    });
  } catch (error) {
    console.error("Failed to update instructor", error);
    return data(
      {
        error: "강사 정보를 수정하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: 500 },
    );
  }

  return redirect("/admin/instructors");
}
