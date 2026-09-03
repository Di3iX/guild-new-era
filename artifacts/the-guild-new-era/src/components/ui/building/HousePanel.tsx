import { useInventory } from '@/hooks/useInventory';
import { useFamily } from '@/hooks/useFamily';
import { useProfession } from '@/hooks/useProfession';
import { ITEMS } from '@/data/items';
import type { ItemId } from '@/types/items';

interface HousePanelProps {
  onNotice: (message: string) => void;
}

export function HousePanel({ onNotice }: HousePanelProps) {
  const { getAmount } = useInventory();
  const { headName, spouseName, children } = useFamily();
  const { learned, professions } = useProfession();
  const professionLabel =
    learned.length > 0
      ? learned.map((id) => professions[id].name).join(', ')
      : 'Без профессии';

  const entries = (Object.keys(ITEMS) as ItemId[])
    .map((id) => ({
      def: ITEMS[id],
      amount: getAmount(id),
    }))
    .filter((entry) => entry.amount > 0);

  return (
    <div className="mt-4 space-y-3">
      {/* Профиль */}
      <div className="rounded-xl border border-[#d1c293] bg-white/60 px-3 py-2.5">
        <div className="font-mono text-[9px] uppercase tracking-[.18em] text-[#9b7440]">
          Профиль
        </div>
        <div className="mt-1 text-sm font-bold text-[#3d2b1f]">{headName}</div>
        <div className="text-[11px] text-[#6b5b4f]">
          Профессия: <strong>{professionLabel}</strong>
        </div>
        <div className="mt-1 text-[11px] text-[#79684d]">
          Позже здесь появятся навыки и опыт профессии.
        </div>
      </div>

      {/* Сундук / инвентарь */}
      <div className="rounded-xl border border-[#d1c293] bg-white/60 px-3 py-2.5">
        <div className="mb-2 font-mono text-[9px] uppercase tracking-[.18em] text-[#9b7440]">
          Сундук
        </div>
        {entries.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[#d1c293] px-2 py-3 text-center text-xs text-[#6c5a42]">
            Сундук пуст.
          </p>
        ) : (
          <ul className="max-h-[28vh] space-y-1.5 overflow-y-auto">
            {entries.map(({ def, amount }) => (
              <li
                key={def.id}
                className="flex items-center justify-between rounded-lg border border-[#e0d5c3] bg-[#f7efd4]/80 px-2.5 py-1.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-[#3d2b1f]">{def.name}</div>
                </div>
                <div className="ml-2 shrink-0 text-sm font-semibold text-[#5c4033]">{amount}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Семья */}
      <div className="rounded-xl border border-[#d1c293] bg-white/60 px-3 py-2.5">
        <div className="font-mono text-[9px] uppercase tracking-[.18em] text-[#9b7440]">
          Семья
        </div>
        <p className="mt-1 text-xs text-[#6b5b4f]">
          {spouseName
            ? 'Супруг(а): ' + spouseName + '. Детей: ' + children.length + '.'
            : 'Пока вы одна. Найди партию во вкладке «Семья».'}
        </p>
        <button
          type="button"
          onClick={() => onNotice('Открой вкладку «Семья» внизу экрана')}
          className="mt-2 w-full rounded-lg border border-[#d1c293] bg-[#e8dbb6]/60 px-3 py-2 text-xs font-bold text-[#5c4b38]"
        >
          Открыть раздел «Семья»
        </button>
      </div>

      {/* Улучшения дома */}
      <div className="rounded-xl border border-[#d1c293] bg-white/60 px-3 py-2.5">
        <div className="font-mono text-[9px] uppercase tracking-[.18em] text-[#9b7440]">
          Улучшения дома
        </div>
        <div className="mt-1 flex items-center justify-between text-xs text-[#5c4b38]">
          <span>Уровень дома</span>
          <strong>1 / 3</strong>
        </div>
        <p className="mt-1 text-[11px] text-[#79684d]">
          Улучшения дадут больше места в сундуке и престиж.
        </p>
        <button
          type="button"
          onClick={() => onNotice('Улучшения дома — скоро')}
          className="mt-2 w-full rounded-lg bg-[#36564b] px-3 py-2 text-xs font-bold text-[#f5edcf] opacity-70"
        >
          Улучшить (скоро)
        </button>
      </div>
    </div>
  );
}
