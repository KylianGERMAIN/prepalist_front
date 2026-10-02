import { beforeEach, describe, expect, it, vi } from "vitest";

const setTag = vi.fn();
vi.mock("@sentry/nextjs", () => ({ getIsolationScope: () => ({ setTag }) }));

import { requestId } from "./request-id";

type Hook = (args: never) => unknown;
const send = (url: string) =>
  (requestId.onRequest as Hook)({ request: new Request(url) } as never) as Request;
const answer = (request: Request, status: number) =>
  (requestId.onResponse as Hook)({ request, response: new Response(null, { status }) } as never);

describe("requestId", () => {
  beforeEach(() => setTag.mockClear());

  it("pose un UUID par requête", () => {
    const first = send("http://api/plan").headers.get("x-request-id");

    expect(first).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(send("http://api/meals").headers.get("x-request-id")).not.toBe(first);
  });

  it("ne marque le scope Sentry qu'avec l'appel en échec", () => {
    const failed = send("http://api/meals");
    answer(send("http://api/plan"), 200);
    answer(failed, 500);

    expect(setTag).toHaveBeenCalledTimes(1);
    expect(setTag).toHaveBeenCalledWith("requestId", failed.headers.get("x-request-id"));
  });
});
