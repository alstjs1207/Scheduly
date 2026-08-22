import type { Route } from "./+types/update";

import { data, redirect } from "react-router";

import { requireMethod } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";
import { updateSetting } from "~/features/app-settings/queries";
import { SETTING_KEYS } from "~/features/app-settings/schema";

import { requireAdminRole } from "../../guards.server";

export async function action({ request }: Route.ActionArgs) {
  requireMethod("POST")(request);

  const [client] = makeServerClient(request);
  const { organizationId } = await requireAdminRole(client);

  const formData = await request.formData();

  const maxConcurrentStudents = parseInt(
    formData.get("max_concurrent_students") as string,
  );
  const scheduleDurationHours = parseInt(
    formData.get("schedule_duration_hours") as string,
  );
  const timeSlotIntervalMinutes = parseInt(
    formData.get("time_slot_interval_minutes") as string,
  );

  if (
    !Number.isInteger(maxConcurrentStudents) ||
    maxConcurrentStudents < 1 ||
    maxConcurrentStudents > 100 ||
    !Number.isInteger(scheduleDurationHours) ||
    scheduleDurationHours < 1 ||
    scheduleDurationHours > 8 ||
    ![15, 30, 45, 60].includes(timeSlotIntervalMinutes)
  ) {
    return data(
      { error: "설정값의 허용 범위를 확인해 주세요." },
      { status: 400 },
    );
  }

  // Update settings
  try {
    await Promise.all([
      updateSetting(client, {
        organizationId,
        key: SETTING_KEYS.MAX_CONCURRENT_STUDENTS,
        value: { value: maxConcurrentStudents },
      }),
      updateSetting(client, {
        organizationId,
        key: SETTING_KEYS.SCHEDULE_DURATION_HOURS,
        value: { value: scheduleDurationHours },
      }),
      updateSetting(client, {
        organizationId,
        key: SETTING_KEYS.TIME_SLOT_INTERVAL_MINUTES,
        value: { value: timeSlotIntervalMinutes },
      }),
    ]);
  } catch (error) {
    console.error("Failed to update settings", error);
    return data(
      {
        error: "설정을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: 500 },
    );
  }

  return redirect("/admin/settings");
}
