import { after } from "next/server";

/**
 * Runs slow follow-up work (like sending emails) once the response has been sent.
 * Outside a request, such as in tests or scripts, there is no response to wait for,
 * so the work simply runs right away.
 */
export function afterResponse(task: () => Promise<unknown>): void {
  try {
    after(task);
  } catch {
    void task().catch(() => {});
  }
}
