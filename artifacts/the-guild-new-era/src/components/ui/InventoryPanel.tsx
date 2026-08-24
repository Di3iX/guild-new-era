import { useInventory } from '@/hooks/useInventory';
import { ITEMS } from '@/data/items';
import type { ItemId } from '@/types/items';

interface InventoryPanelProps {
  onClose: () => void;
}

export function InventoryPanel({ onClose }: InventoryPanelProps) {
  const { items, getAmount } = useInventory();

  const entries = (Object.keys(ITEMS) as ItemId[])
    .map((id) => ({
      def: ITEMS[id],
      amount: getAmount(id),
    }))
    .filter((entry) => entry.amount > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-md rounded-2xl bg-[#f5f0e6] shadow-xl border border-[#d4c4a8] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#e8dcc8] border-b border-[#d4c4a8]">
          <h2 className="text-lg font-semibold text-[#3d2b1f]">Инвентарь</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#d4c4a8]/60 text-[#3d2b1f] hover:bg-[#d4c4a8]"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {entries.length === 0 ? (
            <p className="text-center text-[#6b5b4f] py-8">
              Инвентарь пуст.
              <br />
              <span className="text-sm">Добудьте руду в шахте, чтобы начать.</span>
            </p>
          ) : (
            <ul className="space-y-2">
              {entries.map(({ def, amount }) => (
                <li
                  key={def.id}
                  className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2.5 border border-[#e0d5c3]"
                >
                  <div>
                    <div className="font-medium text-[#3d2b1f]">{def.name}</div>
                    <div className="text-xs text-[#6b5b4f]">{def.description}</div>
                  </div>
                  <div className="text-lg font-semibold text-[#5c4033] min-w-[2.5rem] text-right">
                    {amount}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
