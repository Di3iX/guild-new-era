import { useCallback, useRef, useState, type ReactNode } from 'react';
import { CircleHelp, Coins, Heart, X } from 'lucide-react';
import { CityGame } from '@/components/CityGame';
import { GameUI, type NavKey } from '@/components/GameUI';
import type { GameActions, BuildingData, MapPoint } from '@/types/game';

export function GuildGameScreen() {
  const [activeTab, setActiveTab] = useState<NavKey>('city');
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingData | null>(null);
  const [nearbyBuilding, setNearbyBuilding] = useState<BuildingData | null>(null);
  const [playerPoint, setPlayerPoint] = useState<MapPoint>({ x: 11.5, y: 12 });
  const [gold, setGold] = useState(248);
  const [health] = useState(86);
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const gameActions = useRef<GameActions | null>(null);

  const showNotice = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2600);
  }, []);

  const handleTabChange = useCallback((tab: NavKey) => {
    setActiveTab(tab);
    if (tab !== 'city') setSelectedBuilding(null);
  }, []);

  return (
    <main className="guild-noise relative min-h-[100dvh] overflow-hidden bg-[#aaa277]">
      <div className="absolute inset-0">
        <CityGame
          onBuildingFocused={setSelectedBuilding}
          onInteractableChange={setNearbyBuilding}
          onPositionChange={setPlayerPoint}
          onGameReady={(actions) => { gameActions.current = actions; }}
        />
      </div>
      <GameUI
        playerPoint={playerPoint}
        activeTab={activeTab}
        selectedBuilding={selectedBuilding}
        nearbyBuilding={nearbyBuilding}
        onTabChange={handleTabChange}
        onInteract={() => gameActions.current?.interact()}
        onClosePanel={() => {
          gameActions.current?.clearFocus();
          setSelectedBuilding(null);
          setNearbyBuilding(null);
        }}
        onOpenHelp={() => setHelpOpen(true)}
        onToggleMenu={() => setMenuOpen((open) => !open)}
        menuOpen={menuOpen}
        gold={gold}
        health={health}
        onSpendGold={() => {
          showNotice('Осмотр записан в полевой журнал');
          setGold((value) => Math.max(0, value));
        }}
      />
      {notice && (
        <div data-testid="status-notice" className="pointer-events-none absolute left-1/2 top-20 z-20 -translate-x-1/2 rounded-full border border-[#d8c987] bg-[#36564b] px-4 py-2 text-xs font-bold text-[#f5edcf] shadow-[var(--shadow-panel)] guild-enter">
          {notice}
        </div>
      )}
      {helpOpen && <HelpDialog onClose={() => setHelpOpen(false)} />}
    </main>
  );
}

function HelpDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center bg-[#35291d]/25 p-4 backdrop-blur-[2px]">
      <section role="dialog" aria-modal="true" aria-labelledby="help-title" className="relative w-full max-w-sm rounded-2xl border border-[#d0c18f] bg-[#f7efd4] p-5 text-[#35291d] shadow-[0_18px_55px_rgba(46,36,23,.3)] guild-enter">
        <button type="button" data-testid="button-close-help" onClick={onClose} className="absolute right-3 top-3 rounded-lg p-1.5 text-[#79694f] hover:bg-[#e7d9b2]" aria-label="Закрыть подсказку"><X size={17} /></button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d8c370] text-[#36564b]"><CircleHelp size={20} /></div>
        <h2 id="help-title" className="mt-3 font-serif text-xl font-bold">Полевые заметки</h2>
        <p className="mt-2 text-sm leading-6 text-[#695941]">Город откликается на твой шаг. Нажми на землю, чтобы проложить путь, или выбери здание — Марта сама найдёт вход.</p>
        <div className="mt-4 space-y-2.5 border-t border-[#ddcfaa] pt-4 text-xs text-[#67563e]">
          <div className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#36564b] text-[#e8d38c]">+</span><span>Дождись золотого маркера у входа и нажми «Взаимодействовать».</span></div>
          <div className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#dfc878]/60 text-[#795522]"><Coins size={15} /></span><span>Городская казна и здоровье всегда видны в верхней строке.</span></div>
          <div className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e5d8b0] text-[#a84a3f]"><Heart size={15} /></span><span>На компьютере также работают WASD и стрелки.</span></div>
        </div>
        <button type="button" data-testid="button-dismiss-help" onClick={onClose} className="mt-5 w-full rounded-xl bg-[#a84a3f] px-3 py-3 text-sm font-bold text-[#faeed1] hover:bg-[#933d35]">Понятно</button>
      </section>
    </div>
  );
}