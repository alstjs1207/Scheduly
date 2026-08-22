import assert from "node:assert/strict";
import test from "node:test";

import {
  shiftScheduleOccurrences,
  validateScheduleCandidatesAgainstExisting,
} from "../app/features/schedules/utils/schedule-validation.ts";

const hour = 60 * 60 * 1000;

test("future recurring updates preserve occurrence spacing and use the new duration", () => {
  const occurrences = [
    {
      scheduleId: 1,
      startTime: new Date("2026-08-03T01:00:00.000Z"),
      endTime: new Date("2026-08-03T04:00:00.000Z"),
    },
    {
      scheduleId: 2,
      startTime: new Date("2026-08-10T01:00:00.000Z"),
      endTime: new Date("2026-08-10T04:00:00.000Z"),
    },
  ];

  const shifted = shiftScheduleOccurrences(occurrences, {
    originalAnchorStart: occurrences[0].startTime,
    nextAnchorStart: new Date("2026-08-04T02:00:00.000Z"),
    nextAnchorEnd: new Date("2026-08-04T08:00:00.000Z"),
    studentId: "student-a",
  });

  assert.equal(shifted[0].startTime.toISOString(), "2026-08-04T02:00:00.000Z");
  assert.equal(shifted[1].startTime.toISOString(), "2026-08-11T02:00:00.000Z");
  assert.equal(
    shifted[1].startTime.getTime() - shifted[0].startTime.getTime(),
    7 * 24 * hour,
  );
  assert.equal(
    shifted[0].endTime.getTime() - shifted[0].startTime.getTime(),
    6 * hour,
  );
  assert.equal(shifted[1].studentId, "student-a");
});

test("recurring validation catches capacity conflicts on a later occurrence", () => {
  const candidates = [
    {
      studentId: "student-a",
      startTime: new Date("2026-08-03T01:00:00.000Z"),
      endTime: new Date("2026-08-03T04:00:00.000Z"),
    },
    {
      studentId: "student-a",
      startTime: new Date("2026-08-10T01:00:00.000Z"),
      endTime: new Date("2026-08-10T04:00:00.000Z"),
    },
  ];
  const existing = [
    {
      scheduleId: 99,
      studentId: "student-b",
      startTime: new Date("2026-08-10T02:00:00.000Z"),
      endTime: new Date("2026-08-10T05:00:00.000Z"),
    },
  ];

  const result = validateScheduleCandidatesAgainstExisting(
    candidates,
    existing,
    1,
  );

  assert.equal(result.allowed, false);
  assert.equal(result.reason, "capacity");
  assert.equal(
    result.candidate?.startTime.toISOString(),
    "2026-08-10T01:00:00.000Z",
  );
});

test("batch validation prevents conflicts between rows in the same request", () => {
  const result = validateScheduleCandidatesAgainstExisting(
    [
      {
        studentId: "student-a",
        startTime: new Date("2026-08-03T01:00:00.000Z"),
        endTime: new Date("2026-08-03T04:00:00.000Z"),
      },
      {
        studentId: "student-b",
        startTime: new Date("2026-08-03T02:00:00.000Z"),
        endTime: new Date("2026-08-03T05:00:00.000Z"),
      },
    ],
    [],
    1,
  );

  assert.equal(result.allowed, false);
  assert.equal(result.reason, "capacity");
});

test("batch validation rejects an overlapping schedule for the same student", () => {
  const result = validateScheduleCandidatesAgainstExisting(
    [
      {
        studentId: "student-a",
        startTime: new Date("2026-08-03T01:00:00.000Z"),
        endTime: new Date("2026-08-03T04:00:00.000Z"),
      },
    ],
    [
      {
        scheduleId: 10,
        studentId: "student-a",
        startTime: new Date("2026-08-03T03:00:00.000Z"),
        endTime: new Date("2026-08-03T06:00:00.000Z"),
      },
    ],
    5,
  );

  assert.equal(result.allowed, false);
  assert.equal(result.reason, "student_conflict");
});
