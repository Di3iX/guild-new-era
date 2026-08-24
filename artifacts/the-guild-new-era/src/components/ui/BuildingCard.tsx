import { useState } from 'react';
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
import { MINE_CONFIG } from '@/data/production';

interface BuildingCardProps {
  selectedBuilding: BuildingData | null;
  nearbyBuilding: BuildingData | null;
  onInteract: () => void;
  onClose: () => void;
  gold: number;
  onSpendGold: (amount: number) => void;
  onNotice: (message: string) => void;
}

const buildingIcons = {
  house: House,
  forge: Hammer,
  mine: Pickaxe,
  market: ShoppingBasket,
};

export function BuildingCard({
  selectedBuilding,
  nearbyBuilding,
  onInteract,
  onClose,
  gold,
  onSpendGold,
  onNotice,
}: BuildingCardProps) {
  const Icon = selectedBuilding ? buildingIcons[selectedBuilding.type] : House;
  const { add } = useInventory();
  const { mineFreeLeft, useMineDig } = useDailyLimits();
  const [digging, setDigging] = useState(false);
  const [progress, setProgress] = useState(0);

  const isAtBuilding =
    selectedBuilding && nearbyBuilding?.id === selectedBuilding.id;

  const handleMineDig = () => {
    if (digging || !selectedBuilding) return;

    const isFree = mineFreeLeft > 0;
    const cost = isFree ? 0 : MINE_CONFIG.digCost;

    if (!isFree && gold < cost) {
      onNotice('Недостаточно золота');
      return;
    }

    if (!isFree) {
      onSpendGold(cost);
    }

    useMineDig();
    setDigging(true);
    setProgress(0);

    const duration = MINE_CONFIG.digDurationSec * 1000;
    const start = Date.now();

    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(1, elapsed / duration);
      setProgress(p);

      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        const amount =
          MINE_CONFIG.oreMin +
          Math.floor(Math.random() * (MINE_CONFIG.oreMax - MINE_CONFIG.oreMin + 1));
        add('iron_ore', amount);
        setDigging(false);
        setProgress(0);
        onNotice(`Получено: ${amount} Железной руды`);
      }
    };

    requestAnimationFrame(tick);
  };

  return (
    <>
      {nearbyBuilding && (
        <div className="pointer-events-auto absolute bottom-24 left-1/2 w-[calc(100%-24px)] max-w-[360px] -translate-x-1/2 guild-enter md:bottom-28">
          <button
            type="button"
            data-testid={`button-interact-${nearbyBuilding.id}`}
            onClick={onInteract}
            className="flex w-full items-center justify-between rounded-2xl border border-[#e7cd79] bg-[#38594d] px-4 py-3 text-left text-[#f5edcf] shadow-[0_8px_26px_rgba(48,54,39,.32)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
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
        <section className="pointer-events-auto absolute bottom-20 right-3 max-h-[58vh] w-[calc(100%-24px)] max-w-[380px] overflow-y-auto rounded-2xl border border-[#d1c293] bg-[#f7efd4]/[.98] p-4 shadow-[var(--shadow-panel)] guild-enter guild-scrollbar md:bottom-24 md:right-6 md:p-5">
          <button
            type="button"
            data-testid="button-close-building-panel"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-lg p-1.5 text-[#85755a] hover:bg-[#e6d9b3] hover:text-[#35291d]"
            aria-label="Закрыть окно"
          >
            ×
          </button>

          <div className="flex items-start gap-3 pr-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#36564b] text-[#e8d38c]">
              <Icon size={21} />
            </div>
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[.18em] text-[#9b7440]">
                {selectedBuilding.type === 'house' ? 'Жилой квартал' : 'Городское дело'}
              </div>
              <h2
                data-testid={`text-building-name-${selectedBuilding.id}`}
                className="mt-0.5 font-serif text-lg font-bold"
              >
                {selectedBuilding.name}
              </h2>
              <p className="text-xs text-[#81745d]">{selectedBuilding.description}</p>
            </div>
          </div>

          <div className="my-4 h-px bg-[#dccfa9]" />
          <p className="text-sm leading-6 text-[#5c4b38]">{selectedBuilding.detail}</p>

          {/* Mine actions */}
          {selectedBuilding.type === 'mine' && isAtBuilding && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 rounded-xl bg-[#e8dbb6] px-3 py-2.5 text-xs text-[#67563f]">
                <span className="h-2 w-2 rounded-full bg-[#738b57]" />
                Ты у входа. Можно добывать руду.
              </div>

              <div className="rounded-xl border border-[#d1c293] bg-white/50 px-3 py-2 text-xs text-[#5c4b38]">
                Бесплатных добыч сегодня: <strong>{mineFreeLeft}</strong> / {MINE_CONFIG.freeDigsPerDay}
                {mineFreeLeft === 0 && (
                  <span className="block mt-0.5 text-[#a84a3f]">
                    Далее: {MINE_CONFIG.digCost} золота за добычу
                  </span>
                )}
              </div>

              {digging ? (
                <div className="space-y-2">
                  <div className="text-center text-xs font-medium text-[#5c4b38]">
                    Добыча... {Math.round(progress * 100)}%
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#e0d5c3]">
                    <div
                      className="h-full rounded-full bg-[#36564b] transition-all"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  data-testid="button-mine-dig"
                  onClick={handleMineDig}
                  disabled={mineFreeLeft === 0 && gold < MINE_CONFIG.digCost}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#a84a3f] px-3 py-3 text-sm font-bold text-[#faeed1] transition-colors hover:bg-[#923e36] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mineFreeLeft > 0
                    ? 'Добыть руду'
                    : `Добыть руду (${MINE_CONFIG.digCost} зол.)`}
                  <ArrowUpRight size={16} />
                </button>
              )}
            </div>
          )}

          {/* Other buildings — temporary inspect */}
          {selectedBuilding.type !== 'mine' && isAtBuilding && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 rounded-xl bg-[#e8dbb6] px-3 py-2.5 text-xs text-[#67563f]">
                <span className="h-2 w-2 rounded-full bg-[#738b57]" />
                Ты у входа. Можно начать проверку объекта.
              </div>
              <button
                type="button"
                data-testid={`button-test-${selectedBuilding.id}`}
                onClick={() => onSpendGold(0)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#a84a3f] px-3 py-3 text-sm font-bold text-[#faeed1] transition-colors hover:bg-[#923e36]"
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