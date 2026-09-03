type Listener = () => void;

const STORAGE_KEY = 'guild-market-prices';

interface PriceState {
  date: string;
  /** id товара → текущий множитель цены (1 = базовая цена) */
  multipliers: Record<string, number>;
}

const MIN_MULTIPLIER = 0.5;
const MAX_MULTIPLIER = 1.8;
/** насколько множитель сдвигается за одну проданную/купленную единицу */
const SELL_STEP = 0.03;
const BUY_STEP = 0.03;
/** насколько множитель возвращается к 1.0 при смене календарного дня */
const DAILY_RECOVERY = 0.15;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function emptyState(): PriceState {
  return { date: todayKey(), multipliers: {} };
}

function load(): PriceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<PriceState>;
    return {
      date: parsed.date ?? todayKey(),
      multipliers: parsed.multipliers ?? {},
    };
  } catch {
    return emptyState();
  }
}

function save(next: PriceState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

let state: PriceState = load();
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

function recoverTowardBaseline(multipliers: Record<string, number>): Record<string, number> {
  const next: Record<string, number> = {};
  for (const [id, mult] of Object.entries(multipliers)) {
    if (mult > 1) next[id] = Math.max(1, mult - DAILY_RECOVERY);
    else if (mult < 1) next[id] = Math.min(1, mult + DAILY_RECOVERY);
    else next[id] = 1;
  }
  return next;
}

function ensureToday() {
  const today = todayKey();
  if (state.date !== today) {
    state = { date: today, multipliers: recoverTowardBaseline(state.multipliers) };
    save(state);
  }
}

function adjust(itemId: string, delta: number) {
  ensureToday();
  const current = state.multipliers[itemId] ?? 1;
  const next = Math.min(MAX_MULTIPLIER, Math.max(MIN_MULTIPLIER, current + delta));
  state = { ...state, multipliers: { ...state.multipliers, [itemId]: next } };
  save(state);
  emit();
}

export const marketPriceStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot(): PriceState {
    ensureToday();
    return state;
  },

  getMultiplier(itemId: string): number {
    ensureToday();
    return state.multipliers[itemId] ?? 1;
  },

  /** Игрок продал товар рынку — предложение растёт, цена падает */
  registerSale(itemId: string, count: number) {
    adjust(itemId, -SELL_STEP * count);
  },

  /** Игрок купил товар у рынка — спрос растёт, цена растёт */
  registerPurchase(itemId: string, count: number) {
    adjust(itemId, BUY_STEP * count);
  },
};
