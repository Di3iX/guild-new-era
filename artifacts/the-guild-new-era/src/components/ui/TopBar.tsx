import { Coins, Heart, MapPinned, Menu } from 'lucide-react';

interface TopBarProps {
  name: string;
  location: string;
  gold: number;
  health: number;
  onToggleMenu: () => void;
}

export function TopBar({
  name,
  location,
  gold,
  health,
  onToggleMenu,
}: TopBarProps) {
  return (
    <header className="pointer-events-auto absolute left-3 right-3 top-3 flex flex-nowrap items-start justify-between gap-2 md:left-6 md:right-6 md:top-5 md:gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden rounded-2xl border border-[#d2c59b] bg-[#f5edcf]/95 px-3 py-2.5 shadow-[var(--shadow-panel)] backdrop-blur md:flex-none md:px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#36564b] text-[#ead696] shadow-[inset_0_0_0_1px_rgba(255,255,255,.18)]">
          <span className="font-serif text-lg font-bold">Г</span>
        </div>
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <span data-testid="text-player-name" className="truncate whitespace-nowrap font-serif text-sm font-bold md:text-base">{name}</span>
            <span className="hidden shrink-0 rounded-full bg-[#dfc878]/50 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-[#70551f] md:inline-flex">I</span>
          </div>
          <div className="mt-1 flex min-w-0 items-center gap-3 whitespace-nowrap text-[10px] font-medium text-[#76654d] md:text-xs">
            <span data-testid="text-player-location" className="flex min-w-0 items-center gap-1 truncate whitespace-nowrap">
              <MapPinned size={11} className="shrink-0" />
              <span className="truncate">{location}</span>
            </span>
            <span className="hidden text-[#b2a27d] sm:inline">День 14 · 08:40</span>
          </div>
        </div>
      </div>
      <div className="flex w-[190px] shrink-0 items-center gap-1 rounded-2xl border border-[#d2c59b] bg-[#f5edcf]/95 p-1 shadow-[var(--shadow-panel)] backdrop-blur md:w-auto md:gap-3 md:p-1.5 md:px-3">
        <div className="flex items-center gap-1 border-r border-[#d8cda8] px-1 text-right md:gap-1.5 md:px-2">
          <div>
            <div className="hidden font-mono text-[9px] uppercase tracking-widest text-[#88775e] md:block">Золото</div>
            <div data-testid="text-gold" className="whitespace-nowrap font-mono text-xs font-bold text-[#8e5e20] md:text-sm">💰 {gold}</div>
          </div>
          <Coins size={15} className="hidden text-[#b88730] md:block" />
        </div>
        <div className="flex items-center gap-1 px-1 md:gap-2 md:px-1.5">
          <Heart size={15} className="fill-[#a84a3f] text-[#a84a3f]" />
          <div className="w-[3.25rem] md:w-24">
            <div className="mb-1 flex justify-between font-mono text-[9px] text-[#88775e]">
              <span className="hidden md:inline">Здоровье</span>
              <span data-testid="text-health" className="ml-auto">{health}/100</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#dfd4af]">
              <div className="h-full rounded-full bg-[#a84a3f] transition-[width]" style={{ width: `${health}%` }} />
            </div>
          </div>
        </div>
        <button type="button" data-testid="button-open-menu" onClick={onToggleMenu} className="rounded-xl p-1.5 text-[#665540] transition-colors hover:bg-[#e6d9b1] md:hidden" aria-label="Открыть меню">
          <Menu size={18} />
        </button>
      </div>
    </header>
  );
}