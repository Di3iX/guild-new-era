type Listener = () => void;

const STORAGE_KEY = 'guild-professions';

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

function save(learned: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(learned));
  } catch {
    // ignore
  }
}

let learned: string[] = load();
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

export const professionStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot(): string[] {
    return learned;
  },

  hasProfession(id: string): boolean {
    return learned.includes(id);
  },

  learn(id: string) {
    if (learned.includes(id)) return false;
    learned = [...learned, id];
    save(learned);
    emit();
    return true;
  },
};
