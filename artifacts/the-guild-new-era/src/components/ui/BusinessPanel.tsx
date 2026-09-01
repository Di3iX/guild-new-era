import {
  Axe,
  Hammer,
  House,
  Pickaxe,
  ShoppingBasket,
  TreePine,
} from 'lucide-react';
import { BUILDINGS } from '@/config/cityData';
import { useOwnership } from '@/hooks/useOwnership';

const icons = {
  house: House,
  forge: Hammer,
  mine: Pickaxe,
  market: ShoppingBasket,
  forest: TreePine,
  carpentry: Axe,
};

const typeLabel: Record<string, string> = {
  house: 'Жильё',
  forge: 'Производство',
  mine: 'Добыча',
  market: 'Торговля',
  forest: 'Лес',
  carpentry: 'Столярка',
};

/** Только частные мастерские можно купить */
const BUY_PRICES: Record<string, number> = {
  'iron-spark': 400,
  'oak-workshop': 380,
};

/** Городская собственность — нельзя купить */
const CITY_OWNED_IDS = new Set(['river-market', 'north-mine', 'south-forest']);

interface BusinessPanelProps {
  gold: number;
  onSpendGold: (amount: number) => void;
  onNotice: (message: string) => void;
  onReturn: () => void;
  onClose: () => void;
}

export function BusinessPanel({
  gold,
  onSpendGold,
  onNotice,
  onReturn,
  onClose,
}: BusinessPanelProps) {
  const { isOwned, buy } = useOwnership();
  const businesses = BUILDINGS.filter((b) => b.type !== 'house');

  const handleBuy = (id: string, name: string) => {
    if (CITY_OWNED_IDS.has(id)) {
      onNotice('Это городская собственность');
      return;
    }
    const price = BUY_PRICES[id] ?? 0;
    if (price <= 0) {
      onNotice('Это предприятие пока нельзя купить');
      return;
    }
    if (isOwned(id)) {
      onNotice('Уже ваше');
      return;
    }
    if (gold < price) {
      onNotice('Недостаточно золота');
      return;
    }
    onSpendGold(price);
    buy(id);
    onNotice('Куплено: ' + name);
  };

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
        Мастерские можно купить. Шахта, лес и рынок — городские.
      </p>

      <div className="mt-4 space-y-2">
        {businesses.map((b) => {
          const Icon = icons[b.type] ?? House;
          const owned = isOwned(b.id);
          const price = BUY_PRICES[b.id] ?? 0;
          const isCity = CITY_OWNED_IDS.has(b.id);
          const canBuy = !owned && !isCity && price > 0 && gold >= price;

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
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    {owned ? (
                      <span className="inline-flex rounded-md bg-[#36564b] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#e8d38c]">
                        Ваше
                      </span>
                    ) : isCity ? (
                      <span className="inline-flex rounded-md bg-[#c5b896] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#4a3f2e]">
                        Городская собственность
                      </span>
                    ) : (
                      <span className="inline-flex rounded-md bg-[#e8dbb6] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#67563f]">
                        Можно купить
                      </span>
                    )}
                    {!owned && !isCity && price > 0 && (
                      <span className="text-[11px] font-medium text-[#5c4b38]">
                        {price} зол.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!owned && !isCity && price > 0 && (
                <button
                  type="button"
                  onClick={() => handleBuy(b.id, b.name)}
                  disabled={!canBuy}
                  className="mt-2 w-full rounded-xl bg-[#a84a3f] px-3 py-2 text-xs font-bold text-[#faeed1] disabled:opacity-45"
                >
                  {gold < price ? 'Недостаточно золота' : 'Купить за ' + price + ' зол.'}
                </button>
              )}
            </div>
          );
        })}
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
