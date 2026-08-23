import {
  ArrowUpRight,
  BriefcaseBusiness,
  CircleHelp,
  Coins,
  Hammer,
  Heart,
  House,
  MapPinned,
  Menu,
  Pickaxe,
  ShoppingBasket,
  Store,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import type { BuildingData, MapPoint } from '@/game/types';

export type NavKey = 'character' | 'city' | 'business' | 'market' | 'family';

interface GameUIProps {
  playerPoint: MapPoint;
  activeTab: NavKey;
  selectedBuilding: BuildingData | null;
  nearbyBuilding: BuildingData | null;
  onTabChange: (tab: NavKey) => void;
  onInteract: () => void;
  onClosePanel: () => void;
  onOpenHelp: () => void;
  onToggleMenu: () => void;
  menuOpen: boolean;
  gold: number;
  health: number;
  onSpendGold: (amount: number) => void;
}

const navItems: Array<{ id: NavKey; label: string; icon: typeof UserRound }> = [
  { id: 'character', label: 'Персонаж', icon: UserRound },
  { id: 'city', label: 'Город', icon: MapPinned },
  { id: 'business', label: 'Бизнес', icon: BriefcaseBusiness },
  { id: 'market', label: 'Рынок', icon: Store },
  { id: 'family', label: 'Семья', icon: UsersRound },
];

const buildingIcons = { house: House, forge: Hammer, mine: Pickaxe, market: ShoppingBasket };

export function GameUI({
  playerPoint,
  activeTab,
  selectedBuilding,
  nearbyBuilding,
  onTabChange,
  onInteract,
  onClosePanel,
  onOpenHelp,
  onToggleMenu,
  menuOpen,
  gold,
  health,
  onSpendGold,
}: GameUIProps) {
  const Icon = selectedBuilding ? buildingIcons[selectedBuilding.type] : House;
  const isPrototypeTab = activeTab !== 'city';

  return (
    <div className="pointer-events-none absolute inset-0 z-10 text-[#35291d]">
      <header className="pointer-events-auto absolute left-3 right-3 top-3 flex items-start justify-between gap-3 md:left-6 md:right-6 md:top-5">
        <div className="flex min-w-0 items-center gap-2.5 rounded-2xl border border-[#d2c59b] bg-[#f5edcf]/95 px-3 py-2.5 shadow-[var(--shadow-panel)] backdrop-blur md:px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#36564b] text-[#ead696] shadow-[inset_0_0_0_1px_rgba(255,255,255,.18)]">
            <span className="font-serif text-lg font-bold">Г</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span data-testid="text-player-name" className="truncate font-serif text-sm font-bold md:text-base">Марта Вейл</span>
              <span className="rounded-full bg-[#dfc878]/50 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-[#70551f]">I</span>
            </div>
            <div className="mt-1 flex items-center gap-3 text-[10px] font-medium text-[#76654d] md:text-xs">
              <span data-testid="text-player-location" className="flex items-center gap-1"><MapPinned size={11} /> Южные ворота</span>
              <span className="hidden text-[#b2a27d] sm:inline">День 14 · 08:40</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-[#d2c59b] bg-[#f5edcf]/95 p-1.5 shadow-[var(--shadow-panel)] backdrop-blur md:gap-3 md:px-3">
          <div className="hidden items-center gap-1.5 border-r border-[#d8cda8] px-2 text-right sm:flex">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-[#88775e]">Золото</div>
              <div data-testid="text-gold" className="font-mono text-sm font-bold text-[#8e5e20]">{gold} <span className="text-[10px] font-normal">лв</span></div>
            </div>
            <Coins size={16} className="text-[#b88730]" />
          </div>
          <div className="flex items-center gap-2 px-1.5">
            <Heart size={15} className="fill-[#a84a3f] text-[#a84a3f]" />
            <div className="w-16 md:w-24">
              <div className="mb-1 flex justify-between font-mono text-[9px] text-[#88775e]"><span>Здоровье</span><span data-testid="text-health">{health}/100</span></div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#dfd4af]"><div className="h-full rounded-full bg-[#a84a3f] transition-[width]" style={{ width: `${health}%` }} /></div>
            </div>
          </div>
          <button type="button" data-testid="button-open-menu" onClick={onToggleMenu} className="rounded-xl p-2 text-[#665540] transition-colors hover:bg-[#e6d9b1] md:hidden" aria-label="Открыть меню">
            <Menu size={18} />
          </button>
        </div>
      </header>
      <div className="pointer-events-none absolute left-1/2 top-5 hidden -translate-x-1/2 text-center md:block">
        <div className="font-mono text-[9px] font-bold uppercase tracking-[.34em] text-[#514532]/75">The Guild · New Era</div>
        <div className="mt-1 text-[10px] text-[#76654d]">Городской прототип · весна 1400</div>
      </div>

      <div className="pointer-events-auto absolute bottom-24 left-3 flex items-center gap-2 rounded-xl border border-[#d2c59b] bg-[#f5edcf]/90 px-3 py-2 text-[10px] text-[#72644e] shadow-[var(--shadow-soft)] backdrop-blur md:bottom-24 md:left-6">
        <CircleHelp size={13} className="text-[#a84a3f]" />
        <span className="hidden sm:inline">Кликни по земле, чтобы идти</span>
        <span className="sm:hidden">Коснись карты, чтобы идти</span>
        <span className="hidden border-l border-[#d5c9a5] pl-2 font-mono text-[9px] uppercase tracking-wider md:inline">WASD · стрелки</span>
        <button type="button" data-testid="button-open-help" onClick={onOpenHelp} className="ml-1 rounded-md p-0.5 hover:bg-[#e5d5a5]" aria-label="Подсказка"><ArrowUpRight size={13} /></button>
      </div>

      {nearbyBuilding && (
        <div className="pointer-events-auto absolute bottom-24 left-1/2 w-[calc(100%-24px)] max-w-[360px] -translate-x-1/2 guild-enter md:bottom-28">
          <button type="button" data-testid={`button-interact-${nearbyBuilding.id}`} onClick={onInteract} className="flex w-full items-center justify-between rounded-2xl border border-[#e7cd79] bg-[#38594d] px-4 py-3 text-left text-[#f5edcf] shadow-[0_8px_26px_rgba(48,54,39,.32)] transition-transform hover:-translate-y-0.5 active:translate-y-0">
            <span className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f1d275] text-[#38594d]"><Icon size={18} /></span>
              <span><span className="block font-mono text-[9px] uppercase tracking-[.18em] text-[#d7c879]">Рядом</span><span className="font-serif text-sm font-bold">{nearbyBuilding.name}</span></span>
            </span>
            <span className="flex items-center gap-1 rounded-lg bg-[#f1d275] px-2.5 py-2 text-xs font-bold text-[#3a3023]">Взаимодействовать <ArrowUpRight size={14} /></span>
          </button>
        </div>
      )}

      {selectedBuilding && (
        <section className="pointer-events-auto absolute bottom-20 right-3 max-h-[58vh] w-[calc(100%-24px)] max-w-[380px] overflow-y-auto rounded-2xl border border-[#d1c293] bg-[#f7efd4]/[.98] p-4 shadow-[var(--shadow-panel)] guild-enter guild-scrollbar md:bottom-24 md:right-6 md:p-5">
          <button type="button" data-testid="button-close-building-panel" onClick={onClosePanel} className="absolute right-3 top-3 rounded-lg p-1.5 text-[#85755a] hover:bg-[#e6d9b3] hover:text-[#35291d]" aria-label="Закрыть окно">
            <X size={17} />
          </button>
          <div className="flex items-start gap-3 pr-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#36564b] text-[#e8d38c]"><Icon size={21} /></div>
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[.18em] text-[#9b7440]">{selectedBuilding.type === 'house' ? 'Жилой квартал' : 'Городское дело'}</div>
              <h2 data-testid={`text-building-name-${selectedBuilding.id}`} className="mt-0.5 font-serif text-lg font-bold">{selectedBuilding.name}</h2>
              <p className="text-xs text-[#81745d]">{selectedBuilding.description}</p>
            </div>
          </div>
          <div className="my-4 h-px bg-[#dccfa9]" />
          <p className="text-sm leading-6 text-[#5c4b38]">{selectedBuilding.detail}</p>
          {nearbyBuilding?.id === selectedBuilding.id ? (
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 rounded-xl bg-[#e8dbb6] px-3 py-2.5 text-xs text-[#67563f]"><span className="h-2 w-2 rounded-full bg-[#738b57]" />Ты у входа. Можно начать проверку объекта.</div>
              <button type="button" data-testid={`button-test-${selectedBuilding.id}`} onClick={() => onSpendGold(0)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#a84a3f] px-3 py-3 text-sm font-bold text-[#faeed1] transition-colors hover:bg-[#923e36]">Провести осмотр <ArrowUpRight size={16} /></button>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-[#cdbd91] bg-[#eee3bf]/70 px-3 py-2.5 text-xs text-[#75654c]">Маршрут проложен. Подойди ближе, чтобы открыть действия.</div>
          )}
        </section>
      )}

      {isPrototypeTab && (
        <section className="pointer-events-auto absolute left-3 right-3 top-20 max-w-[320px] rounded-2xl border border-[#d1c293] bg-[#f7efd4]/95 p-4 shadow-[var(--shadow-panel)] guild-enter md:left-6 md:top-24">
          <button type="button" data-testid="button-close-tab-stub" onClick={() => onTabChange('city')} className="absolute right-3 top-3 rounded-md p-1 text-[#85755a] hover:bg-[#e6d9b3]" aria-label="Вернуться к городу"><X size={16} /></button>
          <div className="font-mono text-[9px] uppercase tracking-[.18em] text-[#9b7440]">Раздел в прототипе</div>
          <h2 className="mt-1 pr-5 font-serif text-lg font-bold">{navItems.find((item) => item.id === activeTab)?.label}</h2>
          <p className="mt-2 text-sm leading-5 text-[#6c5a42]">Этот лист пока пуст, но город уже живёт. Вернись на карту и выбери место для следующего шага.</p>
          <button type="button" data-testid="button-return-city" onClick={() => onTabChange('city')} className="mt-4 rounded-lg bg-[#36564b] px-3 py-2 text-xs font-bold text-[#f5edcf]">Вернуться в город</button>
        </section>
      )}

      {menuOpen && (
        <div className="pointer-events-auto absolute right-3 top-[72px] w-48 rounded-2xl border border-[#d1c293] bg-[#f7efd4] p-2 shadow-[var(--shadow-panel)] guild-enter">
          <div className="border-b border-[#ded1aa] px-3 py-2 font-mono text-[9px] uppercase tracking-widest text-[#9b7440]">Полевой журнал</div>
          <button type="button" data-testid="button-menu-character" onClick={() => { onTabChange('character'); onToggleMenu(); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-[#e9ddb9]"><UserRound size={15} /> Профиль Марты</button>
          <button type="button" data-testid="button-menu-help" onClick={() => { onOpenHelp(); onToggleMenu(); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-[#e9ddb9]"><CircleHelp size={15} /> Как играть</button>
        </div>
      )}

      <nav className="pointer-events-auto absolute bottom-0 left-0 right-0 border-t border-[#cbbd91] bg-[#f5edcf]/[.97] px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_28px_rgba(65,48,28,.14)] backdrop-blur md:bottom-3 md:left-1/2 md:right-auto md:w-[min(660px,calc(100%-48px))] md:-translate-x-1/2 md:rounded-2xl md:border md:px-3 md:pb-2">
        <div className="mx-auto flex max-w-2xl items-stretch justify-between">
          {navItems.map(({ id, label, icon: NavIcon }) => {
            const active = activeTab === id;
            return (
              <button type="button" data-testid={`button-nav-${id}`} key={id} onClick={() => onTabChange(id)} className={`group flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-bold transition-colors md:gap-1.5 md:text-[11px] ${active ? 'bg-[#36564b] text-[#f5edcf]' : 'text-[#79684d] hover:bg-[#e9ddb9]'}`}>
                <NavIcon size={17} strokeWidth={active ? 2.5 : 1.8} />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      <div className="pointer-events-none absolute bottom-3 right-4 hidden font-mono text-[9px] uppercase tracking-[.16em] text-[#78694e]/80 lg:block">x {Math.round(playerPoint.x)} · y {Math.round(playerPoint.y)}</div>
    </div>
  );
}