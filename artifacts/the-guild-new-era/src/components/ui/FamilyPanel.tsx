import { useState } from 'react';
import { useProfession } from '@/hooks/useProfession';
import { useFamily } from '@/hooks/useFamily';
import { SPOUSE_NAMES, CHILD_NAMES, pickRandom } from '@/data/familyNames';

const CHILD_COST = 60;

interface FamilyPanelProps {
  gold: number;
  onSpendGold: (amount: number) => void;
  onNotice: (message: string) => void;
  onReturn: () => void;
  onClose: () => void;
}

export function FamilyPanel({
  gold,
  onSpendGold,
  onNotice,
  onReturn,
  onClose,
}: FamilyPanelProps) {
  const { learned, professions } = useProfession();
  const { headName, spouseName, children, generation, marry, haveChild, succeed } =
    useFamily();
  const [candidates, setCandidates] = useState<string[] | null>(null);

  const professionLabel =
    learned.length > 0
      ? learned.map((id) => professions[id].name).join(', ')
      : 'Без профессии';

  const handleFindMatch = () => {
    const picked: string[] = [];
    while (picked.length < 3) {
      const name = pickRandom(SPOUSE_NAMES, picked);
      if (!picked.includes(name)) picked.push(name);
    }
    setCandidates(picked);
  };

  const handleMarry = (name: string) => {
    marry(name);
    setCandidates(null);
    onNotice('Ты обвенчалась с ' + name);
  };

  const handleHaveChild = () => {
    if (gold < CHILD_COST) {
      onNotice('Недостаточно золота');
      return;
    }
    onSpendGold(CHILD_COST);
    const name = pickRandom(CHILD_NAMES);
    haveChild(name);
    onNotice('В семье пополнение: ' + name);
  };

  const handleSucceed = (childId: string, childName: string) => {
    succeed(childId);
    onNotice('Теперь глава семьи — ' + childName);
  };

  return (
    <section className="pointer-events-auto absolute left-3 right-3 top-20 max-h-[70vh] max-w-[360px] overflow-y-auto rounded-2xl border border-[#d1c293] bg-[#f7efd4]/95 p-4 text-[#35291d] shadow-[var(--shadow-panel)] guild-enter md:left-6 md:top-24">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 rounded-md p-1 text-[#85755a] hover:bg-[#e6d9b3]"
        aria-label="Закрыть"
      >
        x
      </button>

      <div className="font-mono text-[9px] uppercase tracking-[.18em] text-[#9b7440]">
        Дом и род · Поколение {generation}
      </div>
      <h2 className="mt-1 pr-5 font-serif text-lg font-bold">Семья</h2>

      <div className="mt-4 space-y-3">
        <div className="rounded-xl border border-[#d1c293] bg-white/60 px-3 py-2.5">
          <div className="text-sm font-bold text-[#3d2b1f]">{headName}</div>
          <div className="text-[11px] text-[#6b5b4f]">Глава семьи · {professionLabel}</div>
        </div>

        {/* Супруг(а) */}
        {spouseName ? (
          <div className="rounded-xl border border-[#d1c293] bg-white/60 px-3 py-2.5">
            <div className="text-sm font-bold text-[#3d2b1f]">{spouseName}</div>
            <div className="text-[11px] text-[#6b5b4f]">Супруг(а)</div>
          </div>
        ) : candidates ? (
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#79684d]">
              Возможные партии
            </div>
            {candidates.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => handleMarry(name)}
                className="w-full rounded-xl border border-[#d1c293] bg-white/60 px-3 py-2.5 text-left text-sm font-bold text-[#3d2b1f] hover:bg-white/90"
              >
                {name}
                <span className="ml-2 text-[11px] font-normal text-[#6b5b4f]">
                  Обвенчаться
                </span>
              </button>
            ))}
          </div>
        ) : (
          <button
            type="button"
            onClick={handleFindMatch}
            className="w-full rounded-xl border border-[#d1c293] bg-[#e8dbb6]/70 px-3 py-2.5 text-xs font-bold text-[#5c4b38]"
          >
            Искать партию
          </button>
        )}

        {/* Дети */}
        {children.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#79684d]">
              Дети
            </div>
            {children.map((child) => (
              <div
                key={child.id}
                className="rounded-xl border border-[#d1c293] bg-white/60 px-3 py-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-bold text-[#3d2b1f]">{child.name}</div>
                  <button
                    type="button"
                    onClick={() => handleSucceed(child.id, child.name)}
                    className="shrink-0 rounded-lg bg-[#a84a3f] px-2.5 py-1.5 text-[10px] font-bold text-[#faeed1]"
                  >
                    Сделать главой семьи
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {spouseName && (
          <button
            type="button"
            onClick={handleHaveChild}
            disabled={gold < CHILD_COST}
            className="w-full rounded-xl bg-[#36564b] px-3 py-2.5 text-xs font-bold text-[#f5edcf] disabled:opacity-45"
          >
            {gold < CHILD_COST
              ? 'Недостаточно золота'
              : 'Завести ребёнка (' + CHILD_COST + ' зол.)'}
          </button>
        )}

        <button
          type="button"
          onClick={() => onNotice('Загляни в Дом Гильдии на карте')}
          className="w-full rounded-xl bg-[#36564b] px-3 py-2.5 text-xs font-bold text-[#f5edcf]"
        >
          Открыть дом на карте
        </button>
      </div>

      <button
        type="button"
        onClick={onReturn}
        className="mt-4 w-full rounded-lg bg-[#36564b] px-3 py-2 text-xs font-bold text-[#f5edcf]"
      >
        Вернуться в город
      </button>
    </section>
  );
}
