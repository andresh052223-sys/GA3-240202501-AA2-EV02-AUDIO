import type { ScreenView } from '../types';

interface TopBarProps {
  currentScreen: ScreenView;
  isRegistered: boolean;
  finalDeliveryUnlocked: boolean;
  onNavigate: (screen: ScreenView) => void;
  onOpenCoach: () => void;
}

export function TopBar({
  currentScreen,
  isRegistered,
  finalDeliveryUnlocked,
  onNavigate,
  onOpenCoach,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#060B17]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
        {/* Zone 1: Single-element wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('welcome')}
          className="font-display text-left text-base font-bold tracking-tight text-slate-100 transition-colors hover:text-emerald-400 whitespace-nowrap shrink-0 cursor-pointer sm:text-lg"
        >
          ENGLISH AUDIO MISSION
        </button>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            type="button"
            onClick={() => onNavigate('welcome')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentScreen === 'welcome'
                ? 'text-emerald-400 underline underline-offset-8 decoration-emerald-400/70'
                : 'hover:text-slate-100'
            }`}
          >
            Inicio
          </button>
          <button
            type="button"
            onClick={() => onNavigate(isRegistered ? 'map' : 'registration')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentScreen === 'map' || currentScreen.startsWith('mission-')
                ? 'text-sky-400 underline underline-offset-8 decoration-sky-400/70'
                : 'hover:text-slate-100'
            }`}
          >
            Mapa
          </button>
          <button
            type="button"
            onClick={() => onNavigate('registration')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentScreen === 'registration'
                ? 'text-sky-400 underline underline-offset-8 decoration-sky-400/70'
                : 'hover:text-slate-100'
            }`}
          >
            Aprendiz
          </button>
          <button
            type="button"
            onClick={() => onNavigate(finalDeliveryUnlocked ? 'final-delivery' : isRegistered ? 'map' : 'registration')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentScreen === 'final-delivery'
                ? 'text-emerald-400 underline underline-offset-8 decoration-emerald-400/70'
                : finalDeliveryUnlocked
                  ? 'hover:text-slate-100'
                  : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Entrega Final
          </button>
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenCoach}
            className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 whitespace-nowrap shrink-0 cursor-pointer sm:text-sm"
          >
            AI English Coach
          </button>
        </div>
      </div>
    </header>
  );
}
