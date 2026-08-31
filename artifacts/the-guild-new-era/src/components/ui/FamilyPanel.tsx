interface FamilyPanelProps {
  onReturn: () => void;
  onClose: () => void;
  onNotice: (message: string) => void;
}

export function FamilyPanel({ onReturn, onClose, onNotice }: FamilyPanelProps) {
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
        Дом и род
      </div>
      <h2 className="mt-1 pr-5 font-serif text-lg font-bold">Семья</h2>
      <p className="mt-1 text-xs text-[#6b5b4f]">
        Брак, дети и родственники появятся позже. Пока вы одна в городе.
      </p>

      <div className="mt-4 space-y-3">
        <div className="rounded-xl border border-[#d1c293] bg-white/60 px-3 py-2.5">
          <div className="text-sm font-bold text-[#3d2b1f]">Марта Вейл</div>
          <div className="text-[11px] text-[#6b5b4f]">Глава семьи · Ремесленник</div>
        </div>

        <div className="rounded-xl border border-dashed border-[#d1c293] bg-white/40 px-3 py-3 text-center text-xs text-[#6c5a42]">
          Супруг(а) и дети пока недоступны.
        </div>

        <button
          type="button"
          onClick={() => onNotice('Поиск партии — в следующих обновлениях')}
          className="w-full rounded-xl border border-[#d1c293] bg-[#e8dbb6]/70 px-3 py-2.5 text-xs font-bold text-[#5c4b38]"
        >
          Искать партию (скоро)
        </button>

        <button
          type="button"
          onClick={() => onNotice('Загляни в Дом Гильдии на карте')}
          className="w-full rounded-xl bg-[#36564b] px-3 py-2.5 text-xs font-bold text-[#f5edcf]"
        >
          Открыть дом на карте
        </button>
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
