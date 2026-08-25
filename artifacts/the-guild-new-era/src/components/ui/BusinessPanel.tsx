import { Hammer, House, Pickaxe, ShoppingBasket } from 'lucide-react';
import { BUILDINGS } from '@/config/cityData';

const icons = {
  house: House,
  forge: Hammer,
  mine: Pickaxe,
  market: ShoppingBasket,
};

const typeLabel: Record<string, string> = {
  house: 'Жильё',
  forge: 'Производство',
  mine: 'Добыча',
  market: 'Торговля',
};

interface BusinessPanelProps {
  onReturn: () => void;
  onClose: () => void;
}

export function BusinessPanel({ onReturn, onClose }: BusinessPanelProps) {
  // Для бизнеса показываем предприятия (не жилой дом)
  const businesses = BUILDINGS.filter((b) => b.type !== 'house');

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
        Дела города
      </div>
      <h2 className="mt-1 pr-5 font-serif text-lg font-bold">Бизнес</h2>
      <p className="mt-1 text-xs text-[#6b5b4f]">
        Предприятия города. Позже здесь появится покупка и управление.
      </p>

      <div className="mt-4 space-y-2">
        {businesses.map((b) => {
          const Icon = icons[b.type] ?? House;
          return (
            <div
              key={b.id}
              className="rounded-xl border border-[#e0d5c3] bg-white/60 px-3 py-2.5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#36564b] text-[#e8d38c]">
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-[#3d2b1f]">{b.name}</div>
                  <div className="text-[11px] text-[#6b5b4f]">
                    {typeLabel[b.type] ?? b.type} · {b.description}
                  </div>
                  <div className="mt-1.5 inline-flex rounded-md bg-[#e8dbb6] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#67563f]">
                    Городское
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 rounded-xl border border-dashed border-[#d1c293] bg-[#f0e6c8]/50 px-3 py-2.5 text-xs text-[#6c5a42]">
        Покупка предприятий и собственное производство — в следующих обновлениях.
      </div>

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
