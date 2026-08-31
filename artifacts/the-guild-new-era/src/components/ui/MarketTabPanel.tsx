import { MarketPanel } from '@/components/ui/building/MarketPanel';

interface MarketTabPanelProps {
  gold: number;
  onSpendGold: (amount: number) => void;
  onAddGold: (amount: number) => void;
  onNotice: (message: string) => void;
  onReturn: () => void;
  onClose: () => void;
}

export function MarketTabPanel({
  gold,
  onSpendGold,
  onAddGold,
  onNotice,
  onReturn,
  onClose,
}: MarketTabPanelProps) {
  return (
    <section className="pointer-events-auto absolute left-3 right-3 top-20 max-h-[70vh] max-w-[360px] overflow-y-auto rounded-2xl border border-[#d1c293] bg-[#f7efd4]/95 p-4 text-[#35291d] shadow-[var(--shadow-panel)] guild-enter md:left-6 md:top-24">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 rounded-md p-1 text-[#85755a] hover:bg-[#e6d9b3]"
        aria-label="Закрыть"
      >
        x
      </button>

      <div className="font-mono text-[9px] uppercase tracking-[.18em] text-[#9b7440]">
        Торговля
      </div>
      <h2 className="mt-1 pr-5 font-serif text-lg font-bold">Рынок</h2>
      <p className="mt-1 text-xs text-[#6b5b4f]">
        Быстрый доступ к покупке и продаже. Полный рынок — у здания «Речной рынок».
      </p>

      <MarketPanel
        gold={gold}
        onSpendGold={onSpendGold}
        onAddGold={onAddGold}
        onNotice={onNotice}
      />

      <button
        type="button"
        onClick={onReturn}
        className="mt-4 w-full rounded-lg bg-[#36564b] px-3 py-2 text-xs font-bold text-[#f5edcf]"
      >
        Вернуться в город
      </button>
    </section>
  );
}
