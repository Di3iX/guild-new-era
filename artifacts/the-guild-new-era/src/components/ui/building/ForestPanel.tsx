import { useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';
import { useDailyLimits } from '@/hooks/useDailyLimits';
import { useOwnership } from '@/hooks/useOwnership';
import { FOREST_CONFIG } from '@/data/production';
import { BusyBar } from './BusyBar';
import { QtyControl } from './QtyControl';

const FOREST_BUILDING_ID = 'south-forest';

interface ForestPanelProps {
  gold: number;
  onSpendGold: (amount: number) => void;
  onNotice: (message: string) => void;
}

export function ForestPanel({ gold, onSpendGold, onNotice }: ForestPanelProps) {
  const { add } = useInventory();
  const { forestFreeLeft, useForestChop } = useDailyLimits();
  const { isOwned } = useOwnership();
  const owned = isOwned(FOREST_BUILDING_ID);

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [busyLabel, setBusyLabel] = useState('');
  const [chopQty, setChopQty] = useState(1);

  const maxChopQty = useMemo(() => {
    if (owned) return 20;
    const paidPossible = Math.floor(gold / FOREST_CONFIG.chopCost);
    return Math.max(0, forestFreeLeft + paidPossible);
  }, [owned, forestFreeLeft, gold]);

  const safeChopQty = Math.min(Math.max(1, chopQty), Math.max(1, maxChopQty));

  const chopCost = useMemo(() => {
    if (owned) return 0;
    const paid = Math.max(0, safeChopQty - forestFreeLeft);
    return paid * FOREST_CONFIG.chopCost;
  }, [owned, safeChopQty, forestFreeLeft]);

  const runTimedAction = (durationSec: number, label: string, onComplete: () => void) => {
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

  const handleChop = () => {
    if (busy || maxChopQty <= 0) return;

    const qty = Math.min(safeChopQty, maxChopQty);
    const cost = owned ? 0 : Math.max(0, qty - forestFreeLeft) * FOREST_CONFIG.chopCost;

    if (cost > gold) {
      onNotice('Недостаточно золота');
      return;
    }

    if (cost > 0) onSpendGold(cost);
    if (!owned) {
      for (let i = 0; i < qty; i++) useForestChop();
    }

    runTimedAction(FOREST_CONFIG.chopDurationSec * qty, 'Рубка x' + qty + '...', () => {
      let totalWood = 0;
      for (let i = 0; i < qty; i++) {
        totalWood +=
          FOREST_CONFIG.woodMin +
          Math.floor(Math.random() * (FOREST_CONFIG.woodMax - FOREST_CONFIG.woodMin + 1));
      }
      add('wood', totalWood);
      onNotice('Получено: ' + totalWood + ' Дерева (x' + qty + ')');
      setChopQty(1);
    });
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-xl bg-[#e8dbb6] px-3 py-2.5 text-xs text-[#67563f]">
        {owned
          ? 'Ваш лес. Рубка без платы золотом.'
          : 'Руби дерево для крафта и продажи.'}
      </div>
      <div className="rounded-xl border border-[#d1c293] bg-white/50 px-3 py-2 text-xs text-[#5c4b38]">
        {owned ? (
          <>Свой лес · можно до {maxChopQty} за раз</>
        ) : (
          <>
            Бесплатных: <strong>{forestFreeLeft}</strong> / {FOREST_CONFIG.freeChopsPerDay}
            <br />
            Можно всего: <strong>{maxChopQty}</strong>
            {chopCost > 0 && (
              <span className="mt-0.5 block text-[#a84a3f]">Стоимость: {chopCost} зол.</span>
            )}
          </>
        )}
      </div>
      {busy ? (
        <BusyBar label={busyLabel} progress={progress} />
      ) : (
        <>
          <QtyControl
            value={safeChopQty}
            min={1}
            max={Math.max(1, maxChopQty)}
            onChange={setChopQty}
          />
          <button
            type="button"
            onClick={handleChop}
            disabled={maxChopQty <= 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#a84a3f] px-3 py-3 text-sm font-bold text-[#faeed1] disabled:opacity-50"
          >
            {chopCost > 0
              ? 'Рубить x' + safeChopQty + ' (' + chopCost + ' зол.)'
              : 'Рубить x' + safeChopQty}
            <ArrowUpRight size={16} />
          </button>
        </>
      )}
    </div>
  );
}
