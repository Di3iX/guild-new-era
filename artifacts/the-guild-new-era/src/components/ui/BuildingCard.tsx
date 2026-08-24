import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Hammer,
  House,
  Pickaxe,
  ShoppingBasket,
} from 'lucide-react';
import type { BuildingData } from '@/types/game';
import { useInventory } from '@/hooks/useInventory';
import { useDailyLimits } from '@/hooks/useDailyLimits';
import { MINE_CONFIG, FORGE_CONFIG, MARKET_TAX_RATE } from '@/data/production';
import type { ItemId } from '@/types/items';
import { ITEMS } from '@/data/items';

interface BuildingCardProps {
  selectedBuilding: BuildingData | null;
  nearbyBuilding: BuildingData | null;
  onInteract: () => void;
  onClose: () => void;
  gold: number;
  onSpendGold: (amount: number) => void;
  onNotice: (message: string) => void;
  onAddGold: (amount: number) => void;
}

const buildingIcons = {
  house: House,
  forge: Hammer,
  mine: Pickaxe,
  market: ShoppingBasket,
};

type ForgeActionId = keyof typeof FORGE_CONFIG.actions;

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

function BusyBar(props: { label: string; progress: number }) {
  return (
    <div className="space-y-2">
      <div className="text-center text-xs font-medium text-[#5c4b38]">
        {props.label} {Math.round(props.progress * 100)}%
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#e0d5c3]">
        <div
          className="h-full rounded-full bg-[#36564b] transition-all"
          style={{ width: props.progress * 100 + '%' }}
        />
      </div>
    </div>
  );
}

function QtyControl(props: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const clamp = (n: number) => Math.max(props.min, Math.min(props.max, n));

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => props.onChange(clamp(props.value - 1))}
        disabled={props.value <= props.min}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8dbb6] text-sm font-bold text-[#3d2b1f] disabled:opacity-40"
      >
        -
      </button>
      <input
        type="number"
        min={props.min}
        max={props.max}
        value={props.value}
        onChange={(e) => props.onChange(clamp(Number(e.target.value) || props.min))}
        className="h-8 w-14 rounded-lg border border-[#d1c293] bg-white/80 text-center text-sm font-bold text-[#3d2b1f]"
      />
      <button
        type="button"
        onClick={() => props.onChange(clamp(props.value + 1))}
        disabled={props.value >= props.max}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8dbb6] text-sm font-bold text-[#3d2b1f] disabled:opacity-40"
      >
        +
      </button>
      <button
        type="button"
        onClick={() => props.onChange(props.max)}
        disabled={props.max <= 0 || props.value >= props.max}
        className="rounded-lg bg-[#36564b] px-2 py-1.5 text-[11px] font-bold text-[#f5edcf] disabled:opacity-40"
      >
        Макс
      </button>
    </div>
  );
}

export function BuildingCard(props: BuildingCardProps) {
  const {
    selectedBuilding,
    nearbyBuilding,
    onInteract,
    onClose,
    gold,
    onSpendGold,
    onNotice,
    onAddGold,
  } = props;

  const Icon = selectedBuilding ? buildingIcons[selectedBuilding.type] : House;
  const { add, remove, has, getAmount, items } = useInventory();
  const { mineFreeLeft, forgeFreeLeft, useMineDig, useForgeAction } = useDailyLimits();

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [busyLabel, setBusyLabel] = useState('');
  const [mineQty, setMineQty] = useState(1);
  const [forgeQty, setForgeQty] = useState<Record<string, number>>({});

  const isAtBuilding =
    !!selectedBuilding && nearbyBuilding?.id === selectedBuilding.id;

  const maxMineQty = useMemo(() => {
    const paidPossible = Math.floor(gold / MINE_CONFIG.digCost);
    return Math.max(0, mineFreeLeft + paidPossible);
  }, [mineFreeLeft, gold]);

  const safeMineQty = Math.min(Math.max(1, mineQty), Math.max(1, maxMineQty));

  const mineCost = useMemo(() => {
    const paid = Math.max(0, safeMineQty - mineFreeLeft);
    return paid * MINE_CONFIG.digCost;
  }, [safeMineQty, mineFreeLeft]);

  const runTimedAction = (
    durationSec: number,
    label: string,
    onComplete: () => void,
  ) => {
    setBusy(true);
    setBusyLabel(label);
    setProgress(0);
    const duration = durationSec * 1000;
    const start = Date.now();

    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(1, elapsed / duration);
      setProgress(p);
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        setBusy(false);
        setProgress(0);
        setBusyLabel('');
        onComplete();
      }
    };
    requestAnimationFrame(tick);
  };

  const handleMineDig = () => {
    if (busy || !selectedBuilding || maxMineQty <= 0) return;

    const qty = Math.min(safeMineQty, maxMineQty);
    if (qty <= 0) {
      onNotice('Недостаточно золота');
      return;
    }

    const paid = Math.max(0, qty - mineFreeLeft);
    const cost = paid * MINE_CONFIG.digCost;
    if (cost > gold) {
      onNotice('Недостаточно золота');
      return;
    }

    if (cost > 0) onSpendGold(cost);
    for (let i = 0; i < qty; i++) useMineDig();

    runTimedAction(MINE_CONFIG.digDurationSec * qty, 'Добыча x' + qty + '...', () => {
      let totalOre = 0;
      for (let i = 0; i < qty; i++) {
        totalOre +=
          MINE_CONFIG.oreMin +
          Math.floor(Math.random() * (MINE_CONFIG.oreMax - MINE_CONFIG.oreMin + 1));
      }
      add('iron_ore', totalOre);
      onNotice('Получено: ' + totalOre + ' Железной руды (x' + qty + ')');
      setMineQty(1);
    });
  };

  const getForgeMaxQty = (actionId: ForgeActionId): number => {
    const action = FORGE_CONFIG.actions[actionId];
    const byRes = Math.floor(getAmount(action.input.itemId) / action.input.amount);
    if (byRes <= 0) return 0;

    let max = 0;
    let freeLeft = forgeFreeLeft;
    let goldLeft = gold;

    for (let i = 0; i < byRes; i++) {
      if (freeLeft > 0) {
        freeLeft -= 1;
        max += 1;
      } else if (goldLeft >= action.cost) {
        goldLeft -= action.cost;
        max += 1;
      } else {
        break;
      }
    }
    return max;
  };

  const handleForgeAction = (actionId: ForgeActionId) => {
    if (busy || !selectedBuilding) return;

    const action = FORGE_CONFIG.actions[actionId];
    const maxQty = getForgeMaxQty(actionId);
    const qty = Math.min(forgeQty[actionId] ?? 1, maxQty);

    if (qty <= 0) {
      onNotice('Недостаточно ресурсов или золота');
      return;
    }

    const freeUsed = Math.min(qty, forgeFreeLeft);
    const paid = qty - freeUsed;
    const cost = paid * action.cost;

    if (cost > gold) {
      onNotice('Недостаточно золота');
      return;
    }
    if (!has(action.input.itemId, action.input.amount * qty)) {
      onNotice('Недостаточно ресурсов');
      return;
    }

    if (cost > 0) onSpendGold(cost);
    for (let i = 0; i < qty; i++) useForgeAction();
    remove(action.input.itemId, action.input.amount * qty);

    runTimedAction(action.durationSec * qty, action.name + ' x' + qty + '...', () => {
      add(action.output.itemId, action.output.amount * qty);
      onNotice(
        'Готово: ' + action.output.amount * qty + ' x ' + labelItem(action.output.itemId),
      );
      setForgeQty((prev) => ({ ...prev, [actionId]: 1 }));
    });
  };

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

  const forgeActions = Object.values(FORGE_CONFIG.actions);
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
    <>
      {nearbyBuilding && (
        <div className="pointer-events-auto absolute bottom-24 left-1/2 w-[calc(100%-24px)] max-w-[360px] -translate-x-1/2 guild-enter md:bottom-28">
          <button
            type="button"
            data-testid={'button-interact-' + nearbyBuilding.id}
            onClick={onInteract}
            className="flex w-full items-center justify-between rounded-2xl border border-[#e7cd79] bg-[#38594d] px-4 py-3 text-left text-[#f5edcf] shadow-[0_8px_26px_rgba(48,54,39,.32)]"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f1d275] text-[#38594d]">
                <Icon size={18} />
              </span>
              <span>
                <span className="block font-mono text-[9px] uppercase tracking-[.18em] text-[#d7c879]">
                  Рядом
                </span>
                <span className="font-serif text-sm font-bold">{nearbyBuilding.name}</span>
              </span>
            </span>
            <span className="flex items-center gap-1 rounded-lg bg-[#f1d275] px-2.5 py-2 text-xs font-bold text-[#3a3023]">
              Взаимодействовать <ArrowUpRight size={14} />
            </span>
          </button>
        </div>
      )}

      {selectedBuilding && (
        <section className="pointer-events-auto absolute bottom-20 right-3 max-h-[58vh] w-[calc(100%-24px)] max-w-[380px] overflow-y-auto rounded-2xl border border-[#d1c293] bg-[#f7efd4]/[.98] p-4 shadow-[var(--shadow-panel)] guild-enter md:bottom-24 md:right-6 md:p-5">
          <button
            type="button"
            data-testid="button-close-building-panel"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-lg p-1.5 text-[#85755a] hover:bg-[#e6d9b3]"
            aria-label="Закрыть окно"
          >
            x
          </button>

          <div className="flex items-start gap-3 pr-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#36564b] text-[#e8d38c]">
              <Icon size={21} />
            </div>
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[.18em] text-[#9b7440]">
                {selectedBuilding.type === 'house' ? 'Жилой квартал' : 'Городское дело'}
              </div>
              <h2 className="mt-0.5 font-serif text-lg font-bold">{selectedBuilding.name}</h2>
              <p className="text-xs text-[#81745d]">{selectedBuilding.description}</p>
            </div>
          </div>

          <div className="my-4 h-px bg-[#dccfa9]" />
          <p className="text-sm leading-6 text-[#5c4b38]">{selectedBuilding.detail}</p>

          {selectedBuilding.type === 'mine' && isAtBuilding && (
            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-[#e8dbb6] px-3 py-2.5 text-xs text-[#67563f]">
                Выбери, сколько раз добывать.
              </div>
              <div className="rounded-xl border border-[#d1c293] bg-white/50 px-3 py-2 text-xs text-[#5c4b38]">
                Бесплатных: <strong>{mineFreeLeft}</strong> / {MINE_CONFIG.freeDigsPerDay}
                <br />
                Можно всего: <strong>{maxMineQty}</strong>
                {mineCost > 0 && (
                  <span className="mt-0.5 block text-[#a84a3f]">Стоимость: {mineCost} зол.</span>
                )}
              </div>
              {busy ? (
                <BusyBar label={busyLabel} progress={progress} />
              ) : (
                <>
                  <QtyControl
                    value={safeMineQty}
                    min={1}
                    max={Math.max(1, maxMineQty)}
                    onChange={setMineQty}
                  />
                  <button
                    type="button"
                    onClick={handleMineDig}
                    disabled={maxMineQty <= 0}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#a84a3f] px-3 py-3 text-sm font-bold text-[#faeed1] disabled:opacity-50"
                  >
                    {mineCost > 0
                      ? 'Добыть x' + safeMineQty + ' (' + mineCost + ' зол.)'
                      : 'Добыть x' + safeMineQty}
                    <ArrowUpRight size={16} />
                  </button>
                </>
              )}
            </div>
          )}

          {selectedBuilding.type === 'forge' && isAtBuilding && (
            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-[#e8dbb6] px-3 py-2.5 text-xs text-[#67563f]">
                Выбери количество крафта.
              </div>
              <div className="rounded-xl border border-[#d1c293] bg-white/50 px-3 py-2 text-xs text-[#5c4b38]">
                Бесплатных действий: <strong>{forgeFreeLeft}</strong> / {FORGE_CONFIG.freeActionsPerDay}
              </div>
              {busy ? (
                <BusyBar label={busyLabel} progress={progress} />
              ) : (
                <div className="space-y-3">
                  {forgeActions.map((action) => {
                    const maxQty = getForgeMaxQty(action.id as ForgeActionId);
                    const qty = Math.min(forgeQty[action.id] ?? 1, Math.max(1, maxQty));
                    const freeUsed = Math.min(qty, forgeFreeLeft);
                    const paid = Math.max(0, qty - freeUsed);
                    const cost = paid * action.cost;

                    return (
                      <div
                        key={action.id}
                        className="rounded-xl border border-[#d1c293] bg-white/60 px-3 py-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[#3d2b1f]">{action.name}</span>
                          <span className="text-[11px] text-[#79684d]">макс. {maxQty}</span>
                        </div>
                        <div className="mt-0.5 text-[11px] text-[#6b5b4f]">
                          Нужно: {action.input.amount} x {labelItem(action.input.itemId)}
                          {' -> '}
                          {action.output.amount} x {labelItem(action.output.itemId)}
                          {' | у тебя: '}
                          {getAmount(action.input.itemId)}
                        </div>
                        <div className="mt-2">
                          <QtyControl
                            value={qty}
                            min={1}
                            max={Math.max(1, maxQty)}
                            onChange={(v) =>
                              setForgeQty((prev) => ({ ...prev, [action.id]: v }))
                            }
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleForgeAction(action.id as ForgeActionId)}
                          disabled={maxQty <= 0}
                          className="mt-2 flex w-full items-center justify-center rounded-xl bg-[#a84a3f] px-3 py-2.5 text-sm font-bold text-[#faeed1] disabled:opacity-45"
                        >
                          {cost > 0
                            ? 'Сделать x' + qty + ' (' + cost + ' зол.)'
                            : 'Сделать x' + qty}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {selectedBuilding.type === 'market' && isAtBuilding && (
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
          )}

          {selectedBuilding.type !== 'mine' &&
            selectedBuilding.type !== 'forge' &&
            selectedBuilding.type !== 'market' &&
            isAtBuilding && (
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => onSpendGold(0)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#a84a3f] px-3 py-3 text-sm font-bold text-[#faeed1]"
                >
                  Провести осмотр <ArrowUpRight size={16} />
                </button>
              </div>
            )}

          {!isAtBuilding && (
            <div className="mt-4 rounded-xl border border-dashed border-[#cdbd91] bg-[#eee3bf]/70 px-3 py-2.5 text-xs text-[#75654c]">
              Маршрут проложен. Подойди ближе, чтобы открыть действия.
            </div>
          )}
        </section>
      )}
    </>
  );
}