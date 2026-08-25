import { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { useDailyLimits } from '@/hooks/useDailyLimits';
import { FORGE_CONFIG } from '@/data/production';
import type { ItemId } from '@/types/items';
import { BusyBar } from './BusyBar';
import { QtyControl } from './QtyControl';

type ForgeActionId = keyof typeof FORGE_CONFIG.actions;

interface ForgePanelProps {
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
  return id;
}

export function ForgePanel({ gold, onSpendGold, onNotice }: ForgePanelProps) {
  const { add, remove, has, getAmount } = useInventory();
  const { forgeFreeLeft, useForgeAction } = useDailyLimits();

  const [busyId, setBusyId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [busyLabel, setBusyLabel] = useState('');
  const [forgeQty, setForgeQty] = useState<Record<string, number>>({});

  const forgeActions = Object.values(FORGE_CONFIG.actions);
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
    if (isBusy) return;

    const action = FORGE_CONFIG.actions[actionId];
    const maxQty = getForgeMaxQty(actionId);
    const rawQty = forgeQty[actionId] ?? 1;
    const qty = Math.min(Math.max(1, rawQty), maxQty);

    if (qty <= 0 || maxQty <= 0) {
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

    runTimedAction(
      actionId,
      action.durationSec * qty,
      action.name + ' x' + qty + '...',
      () => {
        add(action.output.itemId, action.output.amount * qty);
        onNotice(
          'Готово: ' + action.output.amount * qty + ' x ' + labelItem(action.output.itemId),
        );
        setForgeQty((prev) => ({ ...prev, [actionId]: 1 }));
      },
    );
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-xl bg-[#e8dbb6] px-3 py-2.5 text-xs text-[#67563f]">
        Выбери количество крафта.
      </div>
      <div className="rounded-xl border border-[#d1c293] bg-white/50 px-3 py-2 text-xs text-[#5c4b38]">
        Бесплатных действий: <strong>{forgeFreeLeft}</strong> / {FORGE_CONFIG.freeActionsPerDay}
      </div>

      <div className="space-y-3">
        {forgeActions.map((action) => {
          const maxQty = getForgeMaxQty(action.id as ForgeActionId);
          const rawQty = forgeQty[action.id] ?? 1;
          const qty = Math.min(Math.max(1, rawQty), Math.max(1, maxQty));
          const freeUsed = Math.min(qty, forgeFreeLeft);
          const paid = Math.max(0, qty - freeUsed);
          const cost = paid * action.cost;
          const thisBusy = busyId === action.id;

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
                        setForgeQty((prev) => ({ ...prev, [action.id]: v }))
                      }
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleForgeAction(action.id as ForgeActionId)}
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