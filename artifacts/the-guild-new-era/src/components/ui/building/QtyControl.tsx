export function QtyControl(props: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const clamp = (n: number) => Math.max(props.min, Math.min(props.max, n));

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => props.onChange(clamp(props.value - 1))}
        disabled={props.value <= props.min}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8dbb6] text-sm font-bold text-[#3d2b1f] disabled:opacity-40"
      >
        -
      </button>
      <input
        type="number"
        min={props.min}
        max={props.max}
        value={props.value}
        onChange={(e) => props.onChange(clamp(Number(e.target.value) || props.min))}
        className="h-8 w-14 rounded-lg border border-[#d1c293] bg-white/80 text-center text-sm font-bold text-[#3d2b1f]"
      />
      <button
        type="button"
        onClick={() => props.onChange(clamp(props.value + 1))}
        disabled={props.value >= props.max}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8dbb6] text-sm font-bold text-[#3d2b1f] disabled:opacity-40"
      >
        +
      </button>
      <button
        type="button"
        onClick={() => props.onChange(props.max)}
        disabled={props.max <= 0 || props.value >= props.max}
        className="rounded-lg bg-[#36564b] px-2 py-1.5 text-[11px] font-bold text-[#f5edcf] disabled:opacity-40"
      >
        Макс
      </button>
    </div>
  );
}
