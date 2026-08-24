interface CharacterPanelProps {
  label: string;
  onReturn: () => void;
  onClose: () => void;
}

export function CharacterPanel({ label, onReturn, onClose }: CharacterPanelProps) {
  return (
    <section className="pointer-events-auto absolute left-3 right-3 top-20 max-w-[320px] rounded-2xl border border-[#d1c293] bg-[#f7efd4]/95 p-4 text-[#35291d] shadow-[var(--shadow-panel)] guild-enter md:left-6 md:top-24">
      <button type="button" data-testid="button-close-tab-stub" onClick={onClose} className="absolute right-3 top-3 rounded-md p-1 text-[#85755a] hover:bg-[#e6d9b3]" aria-label="Вернуться к городу">×</button>
      <div className="font-mono text-[9px] uppercase tracking-[.18em] text-[#9b7440]">Раздел в прототипе</div>
      <h2 className="mt-1 pr-5 font-serif text-lg font-bold">{label}</h2>
      <p className="mt-2 text-sm leading-5 text-[#6c5a42]">Этот лист пока пуст, но город уже живёт. Вернись на карту и выбери место для следующего шага.</p>
      <button type="button" data-testid="button-return-city" onClick={onReturn} className="mt-4 rounded-lg bg-[#36564b] px-3 py-2 text-xs font-bold text-[#f5edcf]">Вернуться в город</button>
    </section>
  );
}