import { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';
import { useOwnership } from '@/hooks/useOwnership';
import { useMarketPrices } from '@/hooks/useMarketPrices';
import { MARKET_TAX_RATE } from '@/data/production';
import { SELL_PRICES } from '@/data/prices';
import { getProcessingAdvice } from '@/lib/processingAdvice';
import type { ItemId } from '@/types/items';
import { ITEMS } from '@/data/items';
import { QtyControl } from './QtyControl';

const MARKET_BUILDING_ID = 'river-market';

const BUYABLE_ITEMS: ItemId[] = [
  'iron_ore',
  'iron',
  'coal',
  'wood',
  'nails',
  'horseshoe',
  'simple_sword',
  'reinforced_sword',
  'wooden_shield',
  'wooden_crate',
];

function labelItem(id: ItemId): string {
  if (id === 'iron_ore') return 'Руда';
  if (id === 'iron') return 'Железо';
  if (id === 'nails') return 'Гвозди';
  if (id === 'horseshoe') return 'Подкова';
  if (id === 'simple_sword') return 'Меч';
  if (id === 'reinforced_sword') return 'Укреп. меч';
  if (id === 'wood') return 'Дерево';
  if (id === 'coal') return 'Уголь';
  if (id === 'wooden_shield') return 'Щит';
  if (id === 'wooden_crate') return 'Ящик';
  return id;
}

interface MarketPanelProps {
  gold: number;
  onSpendGold: (amount: number) => void;
  onAddGold: (amount: number) => void;
  onNotice: (message: string) => void;
}

export function MarketPanel({
  gold,
  onSpendGold,
  onAddGold,
  onNotice,
}: MarketPanelProps) {
  const { add, remove, getAmount, items } = useInventory();
  const { isOwned } = useOwnership();
  const { getSellPrice, getBuyPrice, getTrend, registerSale, registerPurchase } =
    useMarketPrices();
  const owned = isOwned(MARKET_BUILDING_ID);
  const taxRate = owned ? 0 : MARKET_TAX_RATE;

  const [tab, setTab] = useState<'sell' | 'buy'>('sell');
  const [buyQty, setBuyQty] = useState<Record<string, number>>({});

  const sellableItems = (Object.keys(SELL_PRICES) as ItemId[]).filter(
    (id) => (items[id] ?? 0) > 0,
  );

  const totalSellNet = sellableItems.reduce((sum, id) => {
    const amount = getAmount(id);
    const unit = getSellPrice(id);
    const gross = unit * amount;
    const tax = Math.floor(gross * taxRate);
    return sum + (gross - tax);
  }, 0);

  const handleSell = (itemId: ItemId, amount: number) => {
    const have = getAmount(itemId);
    const count = Math.min(amount, have);
    if (count <= 0) {
      onNotice('Нет предмета для продажи');
      return;
    }

    const unitPrice = getSellPrice(itemId);
    if (unitPrice <= 0) {
      onNotice('Этот товар сейчас не принимают');
      return;
    }

    const gross = unitPrice * count;
    const tax = Math.floor(gross * taxRate);
    const net = gross - tax;

    remove(itemId, count);
    onAddGold(net);
    registerSale(itemId, count);
    onNotice(
      tax > 0
        ? 'Продано ' + count + ' шт. за ' + net + ' зол. (налог: ' + tax + ')'
        : 'Продано ' + count + ' шт. за ' + net + ' зол. (без налога)',
    );
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
      const unit = getSellPrice(id);
      const gross = unit * amount;
      const tax = Math.floor(gross * taxRate);
      remove(id, amount);
      registerSale(id, amount);
      totalNet += gross - tax;
      totalTax += tax;
    });

    onAddGold(totalNet);
    onNotice(
      totalTax > 0
        ? 'Продано всё за ' + totalNet + ' зол. (налог: ' + totalTax + ')'
        : 'Продано всё за ' + totalNet + ' зол. (без налога)',
    );
  };

  const getMaxBuyQty = (itemId: ItemId): number => {
    const price = getBuyPrice(itemId);
    if (price <= 0) return 0;
    return Math.floor(gold / price);
  };

  const handleBuy = (itemId: ItemId) => {
    const price = getBuyPrice(itemId);
    if (price <= 0) return;

    const maxQty = getMaxBuyQty(itemId);
    const raw = buyQty[itemId] ?? 1;
    const qty = Math.min(Math.max(1, raw), maxQty);

    if (qty <= 0 || maxQty <= 0) {
      onNotice('Недостаточно золота');
      return;
    }

    const total = price * qty;
    if (total > gold) {
      onNotice('Недостаточно золота');
      return;
    }

    onSpendGold(total);
    add(itemId, qty);
    registerPurchase(itemId, qty);
    onNotice('Куплено: ' + qty + ' x ' + (ITEMS[itemId]?.name ?? labelItem(itemId)));
    setBuyQty((prev) => ({ ...prev, [itemId]: 1 }));
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-xl bg-[#e8dbb6] px-3 py-2.5 text-xs text-[#67563f]">
        Рынок города: покупка и продажа товаров.
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab('sell')}
          className={
            'flex-1 rounded-xl px-3 py-2 text-sm font-bold ' +
            (tab === 'sell'
              ? 'bg-[#36564b] text-[#f5edcf]'
              : 'bg-white/60 text-[#5c4b38] border border-[#d1c293]')
          }
        >
          Продажа
        </button>
        <button
          type="button"
          onClick={() => setTab('buy')}
          className={
            'flex-1 rounded-xl px-3 py-2 text-sm font-bold ' +
            (tab === 'buy'
              ? 'bg-[#36564b] text-[#f5edcf]'
              : 'bg-white/60 text-[#5c4b38] border border-[#d1c293]')
          }
        >
          Покупка
        </button>
      </div>

      {tab === 'sell' && (
        <>
          <div className="rounded-xl border border-[#d1c293] bg-white/50 px-3 py-2 text-xs text-[#5c4b38]">
            Налог: <strong>{Math.round(taxRate * 100)}%</strong>
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
                  const unitPrice = getSellPrice(itemId);
                  const trend = getTrend(itemId);
                  const netOne = unitPrice - Math.floor(unitPrice * taxRate);
                  const def = ITEMS[itemId];
                  const advice = getProcessingAdvice(itemId);

                  return (
                    <div
                      key={itemId}
                      className="rounded-xl border border-[#d1c293] bg-white/60 px-3 py-2.5"
                    >
                      <div className="flex items-center gap-1.5 text-sm font-bold text-[#3d2b1f]">
                        {def?.name ?? labelItem(itemId)}
                        {trend === 'up' && <TrendingUp size={13} className="text-[#36564b]" />}
                        {trend === 'down' && <TrendingDown size={13} className="text-[#a84a3f]" />}
                      </div>
                      <div className="text-[11px] text-[#6b5b4f]">
                        У тебя: {amount} · цена {unitPrice} · за 1 шт. {netOne} зол.
                      </div>
                      {advice && (
                        <div className="mt-1 rounded-md bg-[#e8dbb6]/70 px-2 py-1 text-[10px] font-medium text-[#67563f]">
                          💡 Выгоднее переработать в «{advice.outputName}»: +{advice.gain} зол./ед.
                        </div>
                      )}
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
        </>
      )}

      {tab === 'buy' && (
        <div className="space-y-2">
          {BUYABLE_ITEMS.map((itemId) => {
            const price = getBuyPrice(itemId);
            const trend = getTrend(itemId);
            const maxQty = getMaxBuyQty(itemId);
            const raw = buyQty[itemId] ?? 1;
            const qty = Math.min(Math.max(1, raw), Math.max(1, maxQty));
            const total = price * qty;
            const def = ITEMS[itemId];

            return (
              <div
                key={itemId}
                className="rounded-xl border border-[#d1c293] bg-white/60 px-3 py-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm font-bold text-[#3d2b1f]">
                    {def?.name ?? labelItem(itemId)}
                    {trend === 'up' && <TrendingUp size={13} className="text-[#a84a3f]" />}
                    {trend === 'down' && <TrendingDown size={13} className="text-[#36564b]" />}
                  </span>
                  <span className="text-[11px] text-[#79684d]">{price} зол. / шт.</span>
                </div>
                <div className="mt-0.5 text-[11px] text-[#6b5b4f]">
                  У тебя: {getAmount(itemId)} · можно купить: {maxQty}
                </div>
                <div className="mt-2">
                  <QtyControl
                    value={qty}
                    min={1}
                    max={Math.max(1, maxQty)}
                    onChange={(v) => setBuyQty((prev) => ({ ...prev, [itemId]: v }))}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleBuy(itemId)}
                  disabled={maxQty <= 0}
                  className="mt-2 flex w-full items-center justify-center rounded-xl bg-[#a84a3f] px-3 py-2.5 text-sm font-bold text-[#faeed1] disabled:opacity-45"
                >
                  {maxQty <= 0
                    ? 'Недостаточно золота'
                    : 'Купить x' + qty + ' (' + total + ' зол.)'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}