import { ArrowDown } from 'lucide-react';
import { BUILDINGS } from '@/config/cityData';
import { useResourceChain } from '@/hooks/useResourceChain';
import { useTrueCost } from '@/hooks/useTrueCost';

interface ChainPanelProps {
  itemId: string;
  onClose: () => void;
}

const TIER_LABEL: Record<number, string> = {
  0: 'Сырьё',
  1: 'Полуфабрикат',
  2: 'Готовый товар',
};

function buildingName(id: string): string {
  return BUILDINGS.find((b) => b.id === id)?.name ?? id;
}

export function ChainPanel({ itemId, onClose }: ChainPanelProps) {
  const steps = useResourceChain(itemId);
  const trueCost = useTrueCost(itemId);

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
        Цепочка производства
      </div>
      <h2 className="mt-1 pr-5 font-serif text-lg font-bold">
        {steps ? steps[steps.length - 1].node.name : itemId}
      </h2>

      {!steps ? (
        <p className="mt-3 rounded-xl border border-dashed border-[#d1c293] bg-[#f0e6c8]/50 px-3 py-4 text-center text-sm text-[#6c5a42]">
          Для этого предмета цепочка производства не задана.
        </p>
      ) : (
        <div className="mt-4 space-y-1">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const stepCost = trueCost?.breakdown[index];
            return (
              <div key={step.node.itemId}>
                <div className="rounded-xl border border-[#e0d5c3] bg-white/60 px-3 py-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-[#3d2b1f]">
                        {step.node.name}
                        {step.outputAmount && step.outputAmount > 1 && (
                          <span className="ml-1 font-normal text-[#6b5b4f]">
                            ×{step.outputAmount}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#6b5b4f]">
                        {step.node.producedAt.map(buildingName).join(', ')}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-md bg-[#e8dbb6] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#67563f]">
                      {TIER_LABEL[step.node.tier]}
                    </span>
                  </div>

                  {step.actionName && (
                    <div className="mt-1.5 text-[11px] text-[#6b5b4f]">
                      Рецепт: {step.actionName}
                      {step.inputAmount && (
                        <> · нужно {step.inputAmount} {index > 0 ? steps[index - 1].node.name.toLowerCase() : ''}</>
                      )}
                      {step.extra && (
                        <> · + {step.extra.amount} {step.extra.name}</>
                      )}
                    </div>
                  )}

                  {stepCost && (
                    <div className="mt-1.5 text-[11px] font-medium text-[#9b7440]">
                      Себестоимость: {stepCost.unitCost} зол./шт.
                    </div>
                  )}
                </div>

                {!isLast && (
                  <div className="flex justify-center py-1 text-[#9b7440]">
                    <ArrowDown size={16} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {trueCost && trueCost.sellPrice > 0 && (
        <div className="mt-3 rounded-xl border border-[#d1c293] bg-[#e8dbb6]/60 px-3 py-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#6b5b4f]">Себестоимость</span>
            <span className="font-bold text-[#3d2b1f]">{trueCost.unitCost} зол.</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-[#6b5b4f]">Цена продажи</span>
            <span className="font-bold text-[#3d2b1f]">{trueCost.sellPrice} зол.</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between border-t border-[#d1c293] pt-1.5 text-xs">
            <span className="font-bold text-[#6b5b4f]">
              {trueCost.margin >= 0 ? 'Прибыль' : 'Убыток'}
            </span>
            <span
              className={
                'font-bold ' + (trueCost.margin >= 0 ? 'text-[#36564b]' : 'text-[#a84a3f]')
              }
            >
              {trueCost.margin >= 0 ? '+' : ''}
              {trueCost.margin} зол.
              {trueCost.marginPercent !== null && (
                <> ({trueCost.marginPercent >= 0 ? '+' : ''}{trueCost.marginPercent}%)</>
              )}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
