import { useInventory } from '@/hooks/useInventory';
import { ITEMS } from '@/data/items';
import type { ItemId } from '@/types/items';

interface CharacterPanelProps {
  label: string;
  onReturn: () => void;
  onClose: () => void;
}

export function CharacterPanel({ label, onReturn, onClose }: CharacterPanelProps) {
  const { getAmount } = useInventory();

  const entries = (Object.keys(ITEMS) as ItemId[])
    .map((id) => ({
      def: ITEMS[id],
      amount: getAmount(id),
    }))
    .filter((entry) => entry.amount > 0);

  return (
    <section className="pointer-events-auto absolute left-3 right-3 top-20 max-w-[340px] rounded-2xl border border-[#d1c293] bg-[#f7efd4]/95 p-4 text-[#35291d] shadow-[var(--shadow-panel)] guild-enter md:left-6 md:top-24">
      <button
        type="button"
        data-testid="button-close-tab-stub"
        onClick={onClose}
        className="absolute right-3 top-3 rounded-md p-1 text-[#85755a] hover:bg-[#e6d9b3]"
        aria-label="Вернуться к городу"
      >
        ×
      </button>

      <div className="font-mono text-[9px] uppercase tracking-[.18em] text-[#9b7440]">
        Раздел персонажа
      </div>
      <h2 className="mt-1 pr-5 font-serif text-lg font-bold">{label}</h2>

      {/* Inventory section */}
      <div className="mt-4">
        <div className="mb-2 text-xs font-bold uppercase tracking-wider text-[#79684d]">
          Инвентарь
        </div>

        {entries.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#d1c293] bg-[#f0e6c8]/50 px-3 py-4 text-center text-sm text-[#6c5a42]">
            Инвентарь пуст.
            <br />
            <span className="text-xs">Добудьте руду в шахте, чтобы начать.</span>
          </p>
        ) : (
          <ul className="max-h-[40vh] space-y-1.5 overflow-y-auto">
            {entries.map(({ def, amount }) => (
              <li
                key={def.id}
                className="flex items-center justify-between rounded-xl border border-[#e0d5c3] bg-white/60 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-[#3d2b1f]">{def.name}</div>
                  <div className="truncate text-[11px] text-[#6b5b4f]">{def.description}</div>
                </div>
                <div className="ml-3 shrink-0 text-base font-semibold text-[#5c4033]">
                  {amount}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        data-testid="button-return-city"
        onClick={onReturn}
        className="mt-4 w-full rounded-lg bg-[#36564b] px-3 py-2 text-xs font-bold text-[#f5edcf]"
      >
        Вернуться в город
      </button>
    </section>
  );
}
