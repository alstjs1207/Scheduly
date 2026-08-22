import assert from "node:assert/strict";
import test from "node:test";

import {
  STUDENT_INVITE_TTL_DAYS,
  createStudentInviteToken,
  getStudentInviteExpiry,
  hashStudentInviteToken,
} from "../app/features/admin/lib/student-invite.server.ts";

test("student invite tokens are random and stored as deterministic hashes", () => {
  const first = createStudentInviteToken();
  const second = createStudentInviteToken();

  assert.notEqual(first, second);
  assert.equal(hashStudentInviteToken(first), hashStudentInviteToken(first));
  assert.notEqual(hashStudentInviteToken(first), first);
  assert.match(hashStudentInviteToken(first), /^[a-f0-9]{64}$/);
});

test("student invite expiry uses the configured TTL", () => {
  const before = Date.now();
  const expiresAt = getStudentInviteExpiry().getTime();
  const after = Date.now();
  const ttl = STUDENT_INVITE_TTL_DAYS * 24 * 60 * 60 * 1000;

  assert.ok(expiresAt >= before + ttl);
  assert.ok(expiresAt <= after + ttl);
});
