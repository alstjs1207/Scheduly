export interface ScheduleCandidate {
  studentId: string;
  startTime: Date;
  endTime: Date;
}

export interface ExistingScheduleInterval extends ScheduleCandidate {
  scheduleId: number;
}

export interface ScheduleOccurrence {
  scheduleId: number;
  startTime: Date;
  endTime: Date;
}

export interface ShiftedScheduleOccurrence extends ScheduleCandidate {
  scheduleId: number;
}

export type ScheduleBatchValidationResult = {
  allowed: boolean;
  reason: "capacity" | "student_conflict" | "invalid_interval" | null;
  currentCount: number;
  maxCount: number;
  candidate: ScheduleCandidate | null;
};

export function schedulesOverlap(
  left: Pick<ScheduleCandidate, "startTime" | "endTime">,
  right: Pick<ScheduleCandidate, "startTime" | "endTime">,
): boolean {
  return left.startTime < right.endTime && left.endTime > right.startTime;
}

/**
 * Shift a recurring series relative to the edited occurrence while preserving
 * the spacing between every occurrence. All shifted rows use the newly selected
 * duration and student.
 */
export function shiftScheduleOccurrences(
  occurrences: ScheduleOccurrence[],
  {
    originalAnchorStart,
    nextAnchorStart,
    nextAnchorEnd,
    studentId,
  }: {
    originalAnchorStart: Date;
    nextAnchorStart: Date;
    nextAnchorEnd: Date;
    studentId: string;
  },
): ShiftedScheduleOccurrence[] {
  const shiftMs = nextAnchorStart.getTime() - originalAnchorStart.getTime();
  const durationMs = nextAnchorEnd.getTime() - nextAnchorStart.getTime();

  return occurrences.map((occurrence) => {
    const startTime = new Date(occurrence.startTime.getTime() + shiftMs);
    return {
      scheduleId: occurrence.scheduleId,
      studentId,
      startTime,
      endTime: new Date(startTime.getTime() + durationMs),
    };
  });
}

/**
 * Validate a batch in order, including candidates already accepted from the
 * same request. This prevents a multi-student or recurring request from
 * bypassing capacity/conflict checks between its own rows.
 */
export function validateScheduleCandidatesAgainstExisting(
  candidates: ScheduleCandidate[],
  existingSchedules: ExistingScheduleInterval[],
  maxCount: number,
): ScheduleBatchValidationResult {
  const acceptedCandidates: ScheduleCandidate[] = [];

  for (const candidate of candidates) {
    if (
      Number.isNaN(candidate.startTime.getTime()) ||
      Number.isNaN(candidate.endTime.getTime()) ||
      candidate.endTime <= candidate.startTime
    ) {
      return {
        allowed: false,
        reason: "invalid_interval",
        currentCount: 0,
        maxCount,
        candidate,
      };
    }

    const overlappingSchedules = [
      ...existingSchedules,
      ...acceptedCandidates.map((accepted, index) => ({
        ...accepted,
        scheduleId: -(index + 1),
      })),
    ].filter((schedule) => schedulesOverlap(schedule, candidate));

    if (
      overlappingSchedules.some(
        (schedule) => schedule.studentId === candidate.studentId,
      )
    ) {
      return {
        allowed: false,
        reason: "student_conflict",
        currentCount: overlappingSchedules.length,
        maxCount,
        candidate,
      };
    }

    if (overlappingSchedules.length >= maxCount) {
      return {
        allowed: false,
        reason: "capacity",
        currentCount: overlappingSchedules.length,
        maxCount,
        candidate,
      };
    }

    acceptedCandidates.push(candidate);
  }

  return {
    allowed: true,
    reason: null,
    currentCount: 0,
    maxCount,
    candidate: null,
  };
}
