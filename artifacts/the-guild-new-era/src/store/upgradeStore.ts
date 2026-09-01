type Listener = () => void;

/** buildingId → level (1–3) */
type UpgradeState = Record<string, number>;

const STORAGE_KEY = 'guild-building-levels';
const MAX_LEVEL = 3;

function load(): UpgradeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as UpgradeState;
  } catch {
    return {};
  }
}

let state: UpgradeState = load();
const listeners = new Set<Listener>();

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export const upgradeStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot() {
    return state;
  },

  getLevel(buildingId: string): number {
    return state[buildingId] ?? 1;
  },

  setLevel(buildingId: string, level: number) {
    const next = Math.min(MAX_LEVEL, Math.max(1, level));
    state = { ...state, [buildingId]: next };
    save();
    emit();
  },

  upgrade(buildingId: string) {
    const current = state[buildingId] ?? 1;
    if (current >= MAX_LEVEL) return false;
    state = { ...state, [buildingId]: current + 1 };
    save();
    emit();
    return true;
  },
};

export const UPGRADE_MAX_LEVEL = MAX_LEVEL;

/** Стоимость перехода на следующий уровень */
export const UPGRADE_COSTS: Record<number, number> = {
  2: 150, // 1 → 2
  3: 350, // 2 → 3
};
