import type { ThreadState } from "../types";

const m = new Map<string, ThreadState>();

export const ThreadStateStore = {
  get(id: string) {
    return m.get(id);
  },
  set(id: string, st: ThreadState) {
    m.set(id, st);
  },
  update(id: string, patch: Partial<ThreadState>) {
    const cur = m.get(id);
    if (!cur) return;
    m.set(id, { ...cur, ...patch });
  },
  has(id: string) {
    return m.has(id);
  },
};
