import assert from "node:assert/strict";
import test from "node:test";

import { getSessionUser } from "../app/core/lib/supa-client.server.ts";

test("legacy session helper verifies the user through auth.getUser", async () => {
  let getUserCalls = 0;
  const expectedUser = { id: "verified-user" };
  const client = {
    auth: {
      getUser: async () => {
        getUserCalls += 1;
        return { data: { user: expectedUser } };
      },
      getSession: async () => {
        throw new Error("getSession must not be used for server authorization");
      },
    },
  };

  const user = await getSessionUser(client as never);

  assert.equal(user?.id, expectedUser.id);
  assert.equal(getUserCalls, 1);
});
