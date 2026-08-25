import { ArrowUpRight, CircleHelp, UserRound } from 'lucide-react';
import { BottomNav } from '@/components/ui/BottomNav';
import { BuildingCard } from '@/components/ui/BuildingCard';
import { CharacterPanel } from '@/components/ui/CharacterPanel';
import { BusinessPanel } from '@/components/ui/BusinessPanel';
import { TopBar } from '@/components/ui/TopBar';
import type { BuildingData, MapPoint } from '@/types/game';
import type { NavKey } from '@/types/navigation';

export type { NavKey } from '@/types/navigation';

interface GameUIProps {
  playerPoint: MapPoint;
  activeTab: NavKey;
  selectedBuilding: BuildingData | null;
  nearbyBuilding: BuildingData | null;
  onTabChange: (tab: NavKey) => void;
  onInteract: () => void;
  onClosePanel: () => void;
  onOpenHelp: () => void;
  menuOpen: boolean;
  onToggleMenu: () => void;
  gold: number;
  health: number;
  onSpendGold: (amount: number) => void;
  onAddGold: (amount: number) => void;
  onNotice: (message: string) => void;
}

export function GameUI({
  playerPoint,
  activeTab,
  selectedBuilding,
  nearbyBuilding,
  onTabChange,
  onInteract,
  onClosePanel,
  onOpenHelp,
  menuOpen,
  onToggleMenu,
  gold,
  health,
  onSpendGold,
  onAddGold,
  onNotice,
}: GameUIProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 text-[#35291d]">
      <TopBar
        name="Марта Вейл"
        location="Южные ворота"
        gold={gold}
        health={health}
        onToggleMenu={onToggleMenu}
      />
      <div className="pointer-events-none absolute left-1/2 top-5 hidden -translate-x-1/2 text-center md:block">
        <div className="font-mono text-[9px] font-bold uppercase tracking-[.34em] text-[#514532]/75">
          The Guild · New Era
        </div>
        <div className="mt-1 text-[10px] text-[#76654d]">Городской прототип · весна 1400</div>
      </div>

      <div className="pointer-events-auto absolute bottom-24 left-3 flex items-center gap-2 rounded-xl border border-[#d2c59b] bg-[#f5edcf]/90 px-3 py-2 text-[10px] text-[#72644e] shadow-[var(--shadow-soft)] backdrop-blur md:bottom-24 md:left-6">
        <CircleHelp size={13} className="text-[#a84a3f]" />
        <span className="hidden sm:inline">Кликни по земле, чтобы идти</span>
        <span className="sm:hidden">Коснись карты, чтобы идти</span>
        <span className="hidden border-l border-[#d5c9a5] pl-2 font-mono text-[9px] uppercase tracking-wider md:inline">
          WASD · стрелки
        </span>
        <button
          type="button"
          data-testid="button-open-help"
          onClick={onOpenHelp}
          className="ml-1 rounded-md p-0.5 hover:bg-[#e5d5a5]"
          aria-label="Подсказка"
        >
          <ArrowUpRight size={13} />
        </button>
      </div>

      <BuildingCard
        selectedBuilding={selectedBuilding}
        nearbyBuilding={nearbyBuilding}
        onInteract={onInteract}
        onClose={onClosePanel}
        gold={gold}
        onSpendGold={onSpendGold}
        onAddGold={onAddGold}
        onNotice={onNotice}
      />

      {activeTab === 'character' && (
        <CharacterPanel
          label="Персонаж"
          onReturn={() => onTabChange('city')}
          onClose={() => onTabChange('city')}
        />
      )}

      {activeTab === 'business' && (
        <BusinessPanel
          gold={gold}
          onSpendGold={onSpendGold}
          onNotice={onNotice}
          onReturn={() => onTabChange('city')}
          onClose={() => onTabChange('city')}
        />
      )}

      {(activeTab === 'market' || activeTab === 'family') && (
        <CharacterPanel
          label={activeTab === 'market' ? 'Рынок' : 'Семья'}
          onReturn={() => onTabChange('city')}
          onClose={() => onTabChange('city')}
        />
      )}

      {menuOpen && (
        <FieldMenu
          onTabChange={onTabChange}
          onOpenHelp={onOpenHelp}
          onToggleMenu={onToggleMenu}
        />
      )}

      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
      <div className="pointer-events-none absolute bottom-3 right-4 hidden font-mono text-[9px] uppercase tracking-[.16em] text-[#78694e]/80 lg:block">
        x {Math.round(playerPoint.x)} · y {Math.round(playerPoint.y)}
      </div>
    </div>
  );
}

function FieldMenu({
  onTabChange,
  onOpenHelp,
  onToggleMenu,
}: {
  onTabChange: (tab: NavKey) => void;
  onOpenHelp: () => void;
  onToggleMenu: () => void;
}) {
  return (
    <div className="pointer-events-auto absolute right-3 top-[72px] w-48 rounded-2xl border border-[#d1c293] bg-[#f7efd4] p-2 shadow-[var(--shadow-panel)] guild-enter">
      <div className="border-b border-[#ded1aa] px-3 py-2 font-mono text-[9px] uppercase tracking-widest text-[#9b7440]">
        Полевой журнал
      </div>
      <button
        type="button"
        data-testid="button-menu-character"
        onClick={() => {
          onTabChange('character');
          onToggleMenu();
        }}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-[#e9ddb9]"
      >
        <UserRound size={15} /> Профиль Марты
      </button>
      <button
        type="button"
        data-testid="button-menu-help"
        onClick={() => {
          onOpenHelp();
          onToggleMenu();
        }}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-[#e9ddb9]"
      >
        <CircleHelp size={15} /> Как играть
      </button>
    </div>
  );
}