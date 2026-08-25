type Listener = () => void;

const STORAGE_KEY = 'guild-owned-buildings';

function load(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(owned: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(owned));
  } catch {
    // ignore
  }
}

let owned: string[] = load();
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

export const ownershipStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot(): string[] {
    return owned;
  },

  isOwned(buildingId: string): boolean {
    return owned.includes(buildingId);
  },

  buy(buildingId: string) {
    if (owned.includes(buildingId)) return;
    owned = [...owned, buildingId];
    save(owned);
    emit();
  },
};
