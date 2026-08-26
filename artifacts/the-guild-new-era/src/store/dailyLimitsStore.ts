type Listener = () => void;

interface DailyLimitsState {
  date: string;
  mineDigsUsed: number;
  forgeActionsUsed: number;
  forestChopsUsed: number;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function load(): DailyLimitsState {
  try {
    const raw = localStorage.getItem('guild-daily-limits');
    if (!raw) {
      return { date: todayKey(), mineDigsUsed: 0, forgeActionsUsed: 0, forestChopsUsed: 0 };
    }
    const parsed = JSON.parse(raw) as Partial<DailyLimitsState>;
    if (parsed.date !== todayKey()) {
      return { date: todayKey(), mineDigsUsed: 0, forgeActionsUsed: 0, forestChopsUsed: 0 };
    }
    return {
      date: parsed.date ?? todayKey(),
      mineDigsUsed: parsed.mineDigsUsed ?? 0,
      forgeActionsUsed: parsed.forgeActionsUsed ?? 0,
      forestChopsUsed: parsed.forestChopsUsed ?? 0,
    };
  } catch {
    return { date: todayKey(), mineDigsUsed: 0, forgeActionsUsed: 0, forestChopsUsed: 0 };
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
    state = { date: todayKey(), mineDigsUsed: 0, forgeActionsUsed: 0, forestChopsUsed: 0 };
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

  useForestChop() {
    ensureToday();
    state = { ...state, forestChopsUsed: state.forestChopsUsed + 1 };
    save();
    emit();
  },
};