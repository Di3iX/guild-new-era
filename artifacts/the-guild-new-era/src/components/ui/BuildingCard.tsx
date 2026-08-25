import {
  ArrowUpRight,
  Hammer,
  House,
  Pickaxe,
  ShoppingBasket,
} from 'lucide-react';
import type { BuildingData } from '@/types/game';
import { MinePanel } from '@/components/ui/building/MinePanel';
import { ForgePanel } from '@/components/ui/building/ForgePanel';
import { MarketPanel } from '@/components/ui/building/MarketPanel';

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

export function BuildingCard({
  selectedBuilding,
  nearbyBuilding,
  onInteract,
  onClose,
  gold,
  onSpendGold,
  onNotice,
  onAddGold,
}: BuildingCardProps) {
  const Icon = selectedBuilding ? buildingIcons[selectedBuilding.type] : House;
  const isAtBuilding =
    !!selectedBuilding && nearbyBuilding?.id === selectedBuilding.id;

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

          {isAtBuilding && selectedBuilding.type === 'mine' && (
            <MinePanel gold={gold} onSpendGold={onSpendGold} onNotice={onNotice} />
          )}

          {isAtBuilding && selectedBuilding.type === 'forge' && (
            <ForgePanel gold={gold} onSpendGold={onSpendGold} onNotice={onNotice} />
          )}

          {isAtBuilding && selectedBuilding.type === 'market' && (
            <MarketPanel
              gold={gold}
              onSpendGold={onSpendGold}
              onAddGold={onAddGold}
              onNotice={onNotice}
            />
          )}

          {isAtBuilding &&
            selectedBuilding.type !== 'mine' &&
            selectedBuilding.type !== 'forge' &&
            selectedBuilding.type !== 'market' && (
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