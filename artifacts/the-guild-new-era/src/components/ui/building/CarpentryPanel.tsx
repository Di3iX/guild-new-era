import { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { useDailyLimits } from '@/hooks/useDailyLimits';
import { useOwnership } from '@/hooks/useOwnership';
import { useBuildingLevel } from '@/hooks/useBuildingLevel';
import { CARPENTRY_CONFIG, craftSpeedMultiplier } from '@/data/production';
import type { ItemId } from '@/types/items';
import { BusyBar } from './BusyBar';
import { QtyControl } from './QtyControl';
import { UpgradeBlock } from './UpgradeBlock';

const CARPENTRY_BUILDING_ID = 'oak-workshop';

type CarpentryActionId = keyof typeof CARPENTRY_CONFIG.actions;

interface CarpentryPanelProps {
  gold: number;
  onSpendGold: (amount: number) => void;
  onNotice: (message: string) => void;
}

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

type ActionDef = (typeof CARPENTRY_CONFIG.actions)[CarpentryActionId];

function getExtra(action: ActionDef): { itemId: ItemId; amount: number } | null {
  if ('extra' in action && action.extra) {
    return action.extra as { itemId: ItemId; amount: number };
  }
  return null;
}

function getMinLevel(action: ActionDef): number {
  if ('minLevel' in action && typeof action.minLevel === 'number') {
    return action.minLevel;
  }
  return 1;
}

export function CarpentryPanel({ gold, onSpendGold, onNotice }: CarpentryPanelProps) {
  const { add, remove, has, getAmount } = useInventory();
  const { carpentryFreeLeft, useCarpentryAction } = useDailyLimits();
  const { isOwned } = useOwnership();
  const owned = isOwned(CARPENTRY_BUILDING_ID);
  const { level } = useBuildingLevel(CARPENTRY_BUILDING_ID);
  const effectiveLevel = owned ? level : 1;
  const speedMul = owned ? craftSpeedMultiplier(effectiveLevel) : 1;

  const [busyId, setBusyId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [busyLabel, setBusyLabel] = useState('');
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});

  const actions = Object.values(CARPENTRY_CONFIG.actions).filter(
    (a) => getMinLevel(a) <= effectiveLevel,
  );
  const isBusy = busyId !== null;

  const runTimedAction = (
    actionId: string,
    durationSec: number,
    label: string,
    onComplete: () => void,
  ) => {
    setBusyId(actionId);
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
        setBusyId(null);
        setProgress(0);
        setBusyLabel('');
        onComplete();
      }
    };
    requestAnimationFrame(tick);
  };

  const getMaxQty = (actionId: CarpentryActionId): number => {
    const action = CARPENTRY_CONFIG.actions[actionId];
    let byRes = Math.floor(getAmount(action.input.itemId) / action.input.amount);
    const extra = getExtra(action);
    if (extra) {
      byRes = Math.min(byRes, Math.floor(getAmount(extra.itemId) / extra.amount));
    }
    if (byRes <= 0) return 0;
    if (owned) return byRes;

    let max = 0;
    let freeLeft = carpentryFreeLeft;
    let goldLeft = gold;
    for (let i = 0; i < byRes; i++) {
      if (freeLeft > 0) {
        freeLeft -= 1;
        max += 1;
      } else if (goldLeft >= action.cost) {
        goldLeft -= action.cost;
        max += 1;
      } else break;
    }
    return max;
  };

  const handleCraft = (actionId: CarpentryActionId) => {
    if (isBusy) return;
    const action = CARPENTRY_CONFIG.actions[actionId];
    if (getMinLevel(action) > effectiveLevel) {
      onNotice('Нужен уровень здания ' + getMinLevel(action));
      return;
    }

    const maxQty = getMaxQty(actionId);
    const rawQty = qtyMap[actionId] ?? 1;
    const qty = Math.min(Math.max(1, rawQty), maxQty);
    const extra = getExtra(action);

    if (qty <= 0 || maxQty <= 0) {
      onNotice('Недостаточно ресурсов или золота');
      return;
    }

    let cost = 0;
    if (!owned) {
      const freeUsed = Math.min(qty, carpentryFreeLeft);
      cost = (qty - freeUsed) * action.cost;
    }

    if (cost > gold) {
      onNotice('Недостаточно золота');
      return;
    }
    if (!has(action.input.itemId, action.input.amount * qty)) {
      onNotice('Недостаточно ресурсов');
      return;
    }
    if (extra && !has(extra.itemId, extra.amount * qty)) {
      onNotice('Недостаточно ' + labelItem(extra.itemId).toLowerCase());
      return;
    }

    if (cost > 0) onSpendGold(cost);
    if (!owned) {
      for (let i = 0; i < qty; i++) useCarpentryAction();
    }
    remove(action.input.itemId, action.input.amount * qty);
    if (extra) remove(extra.itemId, extra.amount * qty);

    const duration = action.durationSec * qty * speedMul;
    runTimedAction(actionId, duration, action.name + ' x' + qty + '...', () => {
      add(action.output.itemId, action.output.amount * qty);
      onNotice(
        'Готово: ' + action.output.amount * qty + ' x ' + labelItem(action.output.itemId),
      );
      setQtyMap((prev) => ({ ...prev, [actionId]: 1 }));
    });
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-xl bg-[#e8dbb6] px-3 py-2.5 text-xs text-[#67563f]">
        {owned
          ? 'Ваша плотницкая. Крафт без платы золотом.'
          : 'Столярные изделия из дерева и железа.'}
      </div>
      <UpgradeBlock
        buildingId={CARPENTRY_BUILDING_ID}
        gold={gold}
        onSpendGold={onSpendGold}
        onNotice={onNotice}
      />
      {!owned && (
        <div className="rounded-xl border border-[#d1c293] bg-white/50 px-3 py-2 text-xs text-[#5c4b38]">
          Бесплатных действий:{' '}
          <strong>{carpentryFreeLeft}</strong> / {CARPENTRY_CONFIG.freeActionsPerDay}
        </div>
      )}

      <div className="space-y-3">
        {actions.map((action) => {
          const maxQty = getMaxQty(action.id as CarpentryActionId);
          const rawQty = qtyMap[action.id] ?? 1;
          const qty = Math.min(Math.max(1, rawQty), Math.max(1, maxQty));
          let cost = 0;
          if (!owned) {
            const freeUsed = Math.min(qty, carpentryFreeLeft);
            cost = Math.max(0, qty - freeUsed) * action.cost;
          }
          const thisBusy = busyId === action.id;
          const extra = getExtra(action);

          let needText =
            action.input.amount + ' x ' + labelItem(action.input.itemId);
          if (extra) {
            needText += ' + ' + extra.amount + ' x ' + labelItem(extra.itemId);
          }
          needText +=
            ' -> ' + action.output.amount + ' x ' + labelItem(action.output.itemId);

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
                {needText}
                {' | у тебя: '}
                {getAmount(action.input.itemId)}
                {extra ? ' / ' + getAmount(extra.itemId) : ''}
              </div>

              {thisBusy ? (
                <div className="mt-2">
                  <BusyBar label={busyLabel} progress={progress} />
                </div>
              ) : (
                <>
                  <div className="mt-2">
                    <QtyControl
                      value={qty}
                      min={1}
                      max={Math.max(1, maxQty)}
                      onChange={(v) =>
                        setQtyMap((prev) => ({ ...prev, [action.id]: v }))
                      }
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCraft(action.id as CarpentryActionId)}
                    disabled={maxQty <= 0 || isBusy}
                    className="mt-2 flex w-full items-center justify-center rounded-xl bg-[#a84a3f] px-3 py-2.5 text-sm font-bold text-[#faeed1] disabled:opacity-45"
                  >
                    {cost > 0
                      ? 'Сделать x' + qty + ' (' + cost + ' зол.)'
                      : 'Сделать x' + qty}
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}