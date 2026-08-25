import { useInventory } from '@/hooks/useInventory';
import { MARKET_TAX_RATE } from '@/data/production';
import type { ItemId } from '@/types/items';
import { ITEMS } from '@/data/items';

const SELL_PRICES: Partial<Record<ItemId, number>> = {
  iron_ore: 3,
  iron: 12,
  nails: 4,
  horseshoe: 30,
  simple_sword: 50,
};

function labelItem(id: ItemId): string {
  if (id === 'iron_ore') return 'Руда';
  if (id === 'iron') return 'Железо';
  if (id === 'nails') return 'Гвозди';
  if (id === 'horseshoe') return 'Подкова';
  if (id === 'simple_sword') return 'Меч';
  return id;
}

interface MarketPanelProps {
  onAddGold: (amount: number) => void;
  onNotice: (message: string) => void;
}

export function MarketPanel({ onAddGold, onNotice }: MarketPanelProps) {
  const { remove, getAmount, items } = useInventory();

  const sellableItems = (Object.keys(SELL_PRICES) as ItemId[]).filter(
    (id) => (items[id] ?? 0) > 0,
  );

  const totalSellNet = sellableItems.reduce((sum, id) => {
    const amount = getAmount(id);
    const unit = SELL_PRICES[id] ?? 0;
    const gross = unit * amount;
    const tax = Math.floor(gross * MARKET_TAX_RATE);
    return sum + (gross - tax);
  }, 0);

  const handleSell = (itemId: ItemId, amount: number) => {
    const have = getAmount(itemId);
    const count = Math.min(amount, have);
    if (count <= 0) {
      onNotice('Нет предмета для продажи');
      return;
    }

    const unitPrice = SELL_PRICES[itemId] ?? 0;
    if (unitPrice <= 0) {
      onNotice('Этот товар сейчас не принимают');
      return;
    }

    const gross = unitPrice * count;
    const tax = Math.floor(gross * MARKET_TAX_RATE);
    const net = gross - tax;

    remove(itemId, count);
    onAddGold(net);
    onNotice('Продано ' + count + ' шт. за ' + net + ' зол. (налог: ' + tax + ')');
  };

  const handleSellAll = () => {
    if (sellableItems.length === 0) {
      onNotice('Нечего продавать');
      return;
    }

    let totalNet = 0;
    let totalTax = 0;

    sellableItems.forEach((id) => {
      const amount = getAmount(id);
      if (amount <= 0) return;
      const unit = SELL_PRICES[id] ?? 0;
      const gross = unit * amount;
      const tax = Math.floor(gross * MARKET_TAX_RATE);
      remove(id, amount);
      totalNet += gross - tax;
      totalTax += tax;
    });

    onAddGold(totalNet);
    onNotice('Продано всё за ' + totalNet + ' зол. (налог: ' + totalTax + ')');
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-xl bg-[#e8dbb6] px-3 py-2.5 text-xs text-[#67563f]">
        Можно продавать товар.
      </div>
      <div className="rounded-xl border border-[#d1c293] bg-white/50 px-3 py-2 text-xs text-[#5c4b38]">
        Налог города: <strong>{Math.round(MARKET_TAX_RATE * 100)}%</strong>
      </div>

      {sellableItems.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#d1c293] px-3 py-4 text-center text-sm text-[#6c5a42]">
          Нечего продавать.
        </p>
      ) : (
        <>
          <button
            type="button"
            onClick={handleSellAll}
            className="flex w-full items-center justify-center rounded-xl bg-[#36564b] px-3 py-3 text-sm font-bold text-[#f5edcf]"
          >
            Продать всё (\~{totalSellNet} зол.)
          </button>
          <div className="space-y-2">
            {sellableItems.map((itemId) => {
              const amount = getAmount(itemId);
              const unitPrice = SELL_PRICES[itemId] ?? 0;
              const netOne = unitPrice - Math.floor(unitPrice * MARKET_TAX_RATE);
              const def = ITEMS[itemId];

              return (
                <div
                  key={itemId}
                  className="rounded-xl border border-[#d1c293] bg-white/60 px-3 py-2.5"
                >
                  <div className="text-sm font-bold text-[#3d2b1f]">
                    {def?.name ?? labelItem(itemId)}
                  </div>
                  <div className="text-[11px] text-[#6b5b4f]">
                    У тебя: {amount} · цена {unitPrice} · за 1 шт. {netOne} зол.
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSell(itemId, 1)}
                      className="flex-1 rounded-lg bg-[#a84a3f] px-2 py-2 text-xs font-bold text-[#faeed1]"
                    >
                      Продать 1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSell(itemId, amount)}
                      className="flex-1 rounded-lg bg-[#36564b] px-2 py-2 text-xs font-bold text-[#f5edcf]"
                    >
                      Все ({amount})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
