export function BusyBar(props: { label: string; progress: number }) {
  return (
    <div className="space-y-2">
      <div className="text-center text-xs font-medium text-[#5c4b38]">
        {props.label} {Math.round(props.progress * 100)}%
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#e0d5c3]">
        <div
          className="h-full rounded-full bg-[#36564b] transition-all"
          style={{ width: props.progress * 100 + '%' }}
        />
      </div>
    </div>
  );
}
