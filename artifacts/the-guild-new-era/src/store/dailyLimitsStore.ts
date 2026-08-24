/** Tracks free daily actions for city buildings (mine, forge, etc.) */

type Listener = () => void;

interface DailyLimitsState {
  /** Date string YYYY-MM-DD of the last reset */
  date: string;
  mineDigsUsed: number;
  forgeActionsUsed: number;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function load(): DailyLimitsState {
  try {
    const raw = localStorage.getItem('guild-daily-limits');
    if (!raw) return { date: todayKey(), mineDigsUsed: 0, forgeActionsUsed: 0 };
    const parsed = JSON.parse(raw) as DailyLimitsState;
    if (parsed.date !== todayKey()) {
      return { date: todayKey(), mineDigsUsed: 0, forgeActionsUsed: 0 };
    }
    return parsed;
  } catch {
    return { date: todayKey(), mineDigsUsed: 0, forgeActionsUsed: 0 };
  }
}

let state: DailyLimitsState = load();
const listeners = new Set<Listener>();

function save() {
  try {
    localStorage.setItem('guild-daily-limits', JSON.stringify(state));
  } catch {
    // ignore
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function ensureToday() {
  if (state.date !== todayKey()) {
    state = { date: todayKey(), mineDigsUsed: 0, forgeActionsUsed: 0 };
    save();
  }
}

export const dailyLimitsStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot() {
    ensureToday();
    return state;
  },

  getMineDigsUsed() {
    ensureToday();
    return state.mineDigsUsed;
  },

  getForgeActionsUsed() {
    ensureToday();
    return state.forgeActionsUsed;
  },

  useMineDig() {
    ensureToday();
    state = { ...state, mineDigsUsed: state.mineDigsUsed + 1 };
    save();
    emit();
  },

  useForgeAction() {
    ensureToday();
    state = { ...state, forgeActionsUsed: state.forgeActionsUsed + 1 };
    save();
    emit();
  },
};
