import { useBuildingLevel } from '@/hooks/useBuildingLevel';
import { useOwnership } from '@/hooks/useOwnership';

interface UpgradeBlockProps {
  buildingId: string;
  gold: number;
  onSpendGold: (amount: number) => void;
  onNotice: (message: string) => void;
}

const LEVEL_BONUS: Record<number, string> = {
  1: 'Базовый уровень',
  2: 'Бонус: +1 к выходу ресурсов / крафта',
  3: 'Бонус: +1 бесплатное действие в день',
};

export function UpgradeBlock({
  buildingId,
  gold,
  onSpendGold,
  onNotice,
}: UpgradeBlockProps) {
  const { isOwned } = useOwnership();
  const owned = isOwned(buildingId);
  const { level, maxLevel, upgradeCost, canUpgrade, upgrade } =
    useBuildingLevel(buildingId);

  if (!owned) return null;

  const handleUpgrade = () => {
    if (!canUpgrade) {
      onNotice('Максимальный уровень');
      return;
    }
    if (gold < upgradeCost) {
      onNotice('Недостаточно золота');
      return;
    }
    onSpendGold(upgradeCost);
    upgrade();
    onNotice('Предприятие улучшено до уровня ' + (level + 1));
  };

  return (
    <div className="mt-3 rounded-xl border border-[#d1c293] bg-white/60 px-3 py-2.5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[.18em] text-[#9b7440]">
          Уровень предприятия
        </span>
        <strong className="text-sm text-[#3d2b1f]">
          {level} / {maxLevel}
        </strong>
      </div>
      <p className="mt-1 text-[11px] text-[#6b5b4f]">
        {LEVEL_BONUS[level] ?? ''}
      </p>
      {canUpgrade ? (
        <button
          type="button"
          onClick={handleUpgrade}
          disabled={gold < upgradeCost}
          className="mt-2 w-full rounded-xl bg-[#36564b] px-3 py-2 text-xs font-bold text-[#f5edcf] disabled:opacity-45"
        >
          Улучшить до {level + 1} ({upgradeCost} зол.)
        </button>
      ) : (
        <div className="mt-2 rounded-lg bg-[#e8dbb6]/70 px-2 py-1.5 text-center text-[11px] font-bold text-[#5c4b38]">
          Максимальный уровень
        </div>
      )}
    </div>
  );
}
