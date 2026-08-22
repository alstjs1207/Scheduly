import assert from "node:assert/strict";
import test from "node:test";

import {
  getDateInMonth,
  getInitialCalendarDate,
} from "../app/features/admin/utils/mobile-calendar.ts";

test("month navigation moves the selected date into the displayed month", () => {
  const selected = getDateInMonth(new Date(2026, 7, 22), new Date(2026, 8, 1));

  assert.equal(selected.getFullYear(), 2026);
  assert.equal(selected.getMonth(), 8);
  assert.equal(selected.getDate(), 22);
});

test("month navigation clamps dates that do not exist in the target month", () => {
  const selected = getDateInMonth(new Date(2026, 0, 31), new Date(2026, 1, 1));

  assert.equal(selected.getMonth(), 1);
  assert.equal(selected.getDate(), 28);
});

test("a calendar opened on another month selects its first day", () => {
  const selected = getInitialCalendarDate(2026, 9, new Date(2026, 7, 22));

  assert.equal(selected.getMonth(), 8);
  assert.equal(selected.getDate(), 1);
});
