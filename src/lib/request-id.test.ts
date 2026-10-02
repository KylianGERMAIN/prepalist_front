import { describe, expect, it, vi } from "vitest";

const setTag = vi.fn();
vi.mock("@sentry/nextjs", () => ({ getIsolationScope: () => ({ setTag }) }));

import { requestId } from "./request-id";

describe("requestId", () => {
  it("pose un UUID par requête, repris en tag Sentry", async () => {
    const send = (url: string) =>
      requestId.onRequest!({ request: new Request(url) } as never) as Promise<Request> | Request;

    const first = await send("http://api/plan");
    const second = await send("http://api/meals");

    const id = first.headers.get("x-request-id");
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(second.headers.get("x-request-id")).not.toBe(id);
    expect(setTag).toHaveBeenCalledWith("requestId", id);
  });
});
