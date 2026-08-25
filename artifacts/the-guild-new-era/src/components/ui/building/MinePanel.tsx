import { useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';
import { useDailyLimits } from '@/hooks/useDailyLimits';
import { useOwnership } from '@/hooks/useOwnership';
import { MINE_CONFIG } from '@/data/production';
import { BusyBar } from './BusyBar';
import { QtyControl } from './QtyControl';

const MINE_BUILDING_ID = 'north-mine';

interface MinePanelProps {
  gold: number;
  onSpendGold: (amount: number) => void;
  onNotice: (message: string) => void;
}

export function MinePanel({ gold, onSpendGold, onNotice }: MinePanelProps) {
  const { add } = useInventory();
  const { mineFreeLeft, useMineDig } = useDailyLimits();
  const { isOwned } = useOwnership();
  const owned = isOwned(MINE_BUILDING_ID);

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [busyLabel, setBusyLabel] = useState('');
  const [mineQty, setMineQty] = useState(1);

  const maxMineQty = useMemo(() => {
    if (owned) return 20;
    const paidPossible = Math.floor(gold / MINE_CONFIG.digCost);
    return Math.max(0, mineFreeLeft + paidPossible);
  }, [owned, mineFreeLeft, gold]);

  const safeMineQty = Math.min(Math.max(1, mineQty), Math.max(1, maxMineQty));

  const mineCost = useMemo(() => {
    if (owned) return 0;
    const paid = Math.max(0, safeMineQty - mineFreeLeft);
    return paid * MINE_CONFIG.digCost;
  }, [owned, safeMineQty, mineFreeLeft]);

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

  const handleMineDig = () => {
    if (busy || maxMineQty <= 0) return;

    const qty = Math.min(safeMineQty, maxMineQty);
    const cost = owned ? 0 : Math.max(0, qty - mineFreeLeft) * MINE_CONFIG.digCost;

    if (cost > gold) {
      onNotice('Недостаточно золота');
      return;
    }

    if (cost > 0) onSpendGold(cost);
    if (!owned) {
      for (let i = 0; i < qty; i++) useMineDig();
    }

    runTimedAction(MINE_CONFIG.digDurationSec * qty, 'Добыча x' + qty + '...', () => {
      let totalOre = 0;
      let totalCoal = 0;
      for (let i = 0; i < qty; i++) {
        totalOre +=
          MINE_CONFIG.oreMin +
          Math.floor(Math.random() * (MINE_CONFIG.oreMax - MINE_CONFIG.oreMin + 1));
        if (Math.random() < MINE_CONFIG.coalChance) {
          totalCoal +=
            MINE_CONFIG.coalMin +
            Math.floor(Math.random() * (MINE_CONFIG.coalMax - MINE_CONFIG.coalMin + 1));
        }
      }
      add('iron_ore', totalOre);
      if (totalCoal > 0) add('coal', totalCoal);

      let msg = 'Получено: ' + totalOre + ' руды';
      if (totalCoal > 0) msg += ', ' + totalCoal + ' угля';
      msg += ' (x' + qty + ')';
      onNotice(msg);
      setMineQty(1);
    });
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-xl bg-[#e8dbb6] px-3 py-2.5 text-xs text-[#67563f]">
        {owned
          ? 'Ваша шахта. Добыча без платы. Иногда попадается уголь.'
          : 'Добыча руды. Иногда попадается уголь.'}
      </div>
      <div className="rounded-xl border border-[#d1c293] bg-white/50 px-3 py-2 text-xs text-[#5c4b38]">
        {owned ? (
          <>Своя шахта · можно до {maxMineQty} за раз</>
        ) : (
          <>
            Бесплатных: <strong>{mineFreeLeft}</strong> / {MINE_CONFIG.freeDigsPerDay}
            <br />
            Можно всего: <strong>{maxMineQty}</strong>
            {mineCost > 0 && (
              <span className="mt-0.5 block text-[#a84a3f]">Стоимость: {mineCost} зол.</span>
            )}
          </>
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
  );
}