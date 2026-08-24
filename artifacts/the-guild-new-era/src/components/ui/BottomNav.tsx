import {
  BriefcaseBusiness,
  MapPinned,
  Store,
  UserRound,
  UsersRound,
} from 'lucide-react';
import type { NavKey } from '@/types/navigation';

interface BottomNavProps {
  activeTab: NavKey;
  onTabChange: (tab: NavKey) => void;
}

const navItems = [
  { id: 'character' as const, label: 'Персонаж', icon: UserRound },
  { id: 'city' as const, label: 'Город', icon: MapPinned },
  { id: 'business' as const, label: 'Бизнес', icon: BriefcaseBusiness },
  { id: 'market' as const, label: 'Рынок', icon: Store },
  { id: 'family' as const, label: 'Семья', icon: UsersRound },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="pointer-events-auto absolute bottom-0 left-0 right-0 border-t border-[#cbbd91] bg-[#f5edcf]/[.97] px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_28px_rgba(65,48,28,.14)] backdrop-blur md:bottom-3 md:left-1/2 md:right-auto md:w-[min(660px,calc(100%-48px))] md:-translate-x-1/2 md:rounded-2xl md:border md:px-3 md:pb-2">
      <div className="mx-auto flex max-w-2xl items-stretch justify-between">
        {navItems.map(({ id, label, icon: NavIcon }) => {
          const active = activeTab === id;
          return (
            <button type="button" data-testid={`button-nav-${id}`} key={id} onClick={() => onTabChange(id)} className={`group flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-bold transition-colors md:gap-1.5 md:text-[11px] ${active ? 'bg-[#36564b] text-[#f5edcf]' : 'text-[#79684d] hover:bg-[#e9ddb9]'}`}>
              <NavIcon size={17} strokeWidth={active ? 2.5 : 1.8} />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}