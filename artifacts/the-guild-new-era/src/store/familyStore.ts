type Listener = () => void;

const STORAGE_KEY = 'guild-family';

export interface Child {
  id: string;
  name: string;
}

export interface FamilyState {
  headName: string;
  spouseName: string | null;
  children: Child[];
  /** номер поколения главы семьи, растёт при наследовании */
  generation: number;
}

const DEFAULT_STATE: FamilyState = {
  headName: 'Марта Вейл',
  spouseName: null,
  children: [],
  generation: 1,
};

function load(): FamilyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

function save(next: FamilyState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

let state: FamilyState = load();
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

export const familyStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot(): FamilyState {
    return state;
  },

  marry(spouseName: string): boolean {
    if (state.spouseName) return false;
    state = { ...state, spouseName };
    save(state);
    emit();
    return true;
  },

  haveChild(childName: string): Child {
    const child: Child = {
      id: 'child-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      name: childName,
    };
    state = { ...state, children: [...state.children, child] };
    save(state);
    emit();
    return child;
  },

  /**
   * Передаёт главенство семьи выбранному ребёнку. Новый глава начинает
   * собственную семью с нуля (супруг сбрасывается, дети становятся детьми
   * нового поколения). Здания, золото и профессии не затрагиваются —
   * они привязаны не к персоне, а к "роду" в целом.
   */
  succeed(childId: string): boolean {
    const child = state.children.find((c) => c.id === childId);
    if (!child) return false;
    state = {
      headName: child.name,
      spouseName: null,
      children: state.children.filter((c) => c.id !== childId),
      generation: state.generation + 1,
    };
    save(state);
    emit();
    return true;
  },
};
