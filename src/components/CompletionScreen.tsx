import type { Fragment } from '../App';
import { Sparkles, Home, MapPin, Lock } from 'lucide-react';
import zhangjiReference from '../assets/zhangji-reference.webp';

interface CompletionScreenProps {
  fragments: Fragment[];
  onBackToHome: () => void;
  onContinueExploring: () => void;
  onViewLeaderboard: () => void;
  completedCount: number;
  totalCount: number;
}

function PuzzlePiece({
  collected,
  clipPath,
  rotation,
  delay,
}: {
  collected: boolean;
  clipPath: string;
  rotation: string;
  delay: string;
}) {
  return (
    <div
      className={`absolute inset-0 transition-all duration-700 ${collected ? 'opacity-100 scale-100' : 'opacity-20 scale-90 grayscale'}`}
      style={{ transform: rotation, transitionDelay: delay }}
    >
      <div
        className="absolute inset-0 rounded-[22px] border-2 shadow-md overflow-hidden"
        style={{
          clipPath,
          borderColor: collected ? '#b45309' : 'rgba(180, 83, 9, 0.18)',
          background: collected
            ? 'linear-gradient(135deg, rgba(251,191,36,0.28), rgba(249,115,22,0.18))'
            : 'linear-gradient(135deg, rgba(231,229,228,0.55), rgba(214,211,209,0.45))',
          boxShadow: collected ? '0 10px 22px rgba(180, 83, 9, 0.16)' : 'none',
        }}
      >
        <img
          src={zhangjiReference}
          alt="Zhang Ji puzzle fragment"
          className={`h-full w-full object-contain p-2 ${collected ? '' : 'opacity-45'}`}
        />
      </div>
    </div>
  );
}

export function CompletionScreen({ 
  fragments, 
  onBackToHome, 
  onContinueExploring,
  onViewLeaderboard,
  completedCount,
  totalCount
}: CompletionScreenProps) {
  const latestFragment = fragments[fragments.length - 1];
  const journeyComplete = completedCount >= totalCount;
  const showEasterEggCard = completedCount >= 1 && completedCount <= 3;
  const collectedPuzzlePieces = Math.min(completedCount, 3);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-amber-50 via-orange-50/30 to-stone-50">
      {/* Header with Celebration */}
      <div className="relative pt-16 pb-8 px-6 text-center">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
        <div className="absolute top-24 right-12 w-3 h-3 rounded-full bg-orange-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="absolute top-32 left-16 w-2 h-2 rounded-full bg-amber-300 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-xl">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-light text-stone-800 mb-2">Your Echoes of Maplebridge</h2>
        <p className="text-stone-600 text-sm font-light">You followed the canal, crossed the bridge, and uncovered the city beneath the poem.</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        <div className="bg-white rounded-3xl p-5 mb-5 shadow-sm border border-amber-200/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Check-in Snapshot</p>
              <p className="text-stone-800 text-base font-light">Your latest moment has been captured.</p>
            </div>
          </div>

          <div className="rounded-[24px] overflow-hidden border border-stone-200 bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 p-4">
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="text-white text-lg font-light leading-snug">{latestFragment?.title ?? 'First Echo Unlocked'}</p>
                <p className="text-white/70 text-xs font-light mt-2">{latestFragment?.location ?? 'Maple Bridge'}</p>
              </div>
              <div className="relative w-20 h-24 flex-shrink-0">
                <div className="absolute inset-0 rounded-full bg-amber-300/20 blur-2xl"></div>
                <img
                  src={zhangjiReference}
                  alt="Zhang Ji snapshot"
                  className="relative h-full w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {showEasterEggCard && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-5 mb-5 border border-amber-200/60 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 flex-shrink-0">
                <div className="absolute inset-0 rounded-[26px] bg-amber-100/60 border border-amber-200/70"></div>
                <PuzzlePiece
                  collected={collectedPuzzlePieces >= 1}
                  clipPath="polygon(10% 12%, 68% 12%, 74% 22%, 84% 22%, 92% 36%, 84% 48%, 84% 86%, 14% 86%, 14% 60%, 4% 52%, 10% 40%)"
                  rotation="rotate(-6deg)"
                  delay="0ms"
                />
                <PuzzlePiece
                  collected={collectedPuzzlePieces >= 2}
                  clipPath="polygon(44% 12%, 88% 12%, 88% 40%, 96% 48%, 88% 58%, 88% 88%, 36% 88%, 42% 74%, 32% 60%, 42% 48%, 36% 32%)"
                  rotation="rotate(7deg)"
                  delay="120ms"
                />
                <PuzzlePiece
                  collected={collectedPuzzlePieces >= 3}
                  clipPath="polygon(14% 44%, 28% 36%, 38% 44%, 54% 44%, 62% 56%, 54% 66%, 56% 88%, 10% 88%, 10% 58%, 2% 50%)"
                  rotation="rotate(3deg)"
                  delay="240ms"
                />
              </div>

              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.22em] text-amber-700">Secret Easter Egg</p>
                <p className="text-stone-900 text-lg font-light mt-1">Zhang Ji Puzzle Fragment Unlocked</p>
                <p className="text-stone-600 text-sm font-light mt-2">
                  Secret Easter Egg Collected {completedCount}/3
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Result Card */}
        <div className="rounded-[28px] bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 text-white p-6 mb-5 shadow-xl">
          <p className="text-xs uppercase tracking-[0.24em] text-amber-200/80">Result Card</p>
          <h2 className="text-2xl font-medium mt-3">{latestFragment?.title ?? 'First Echo Unlocked'}</h2>
          <p className="text-sm text-white/80 leading-6 mt-3">
            {latestFragment?.content ?? 'Begin your journey to unlock the first memory fragment.'}
          </p>
          <div className="flex items-center justify-between mt-6 text-sm text-white/80">
            <span>{completedCount}/{totalCount} echoes collected</span>
            <span>{journeyComplete ? 'Journey Complete' : 'New Fragment Added'}</span>
          </div>
        </div>

        {/* Collection Overview */}
        <div className="bg-white rounded-3xl p-6 mb-5 shadow-sm border border-stone-200/50">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-light text-stone-800">Your Collection</h3>
            <div className="text-stone-600 text-sm font-light">
              {completedCount}/{totalCount}
            </div>
          </div>

          <p className="text-stone-500 text-xs uppercase tracking-[0.2em] mb-3">Collected Fragments</p>
          <div className="space-y-3 mb-5">
            {fragments.map((fragment, index) => (
              <div 
                key={fragment.id} 
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-stone-50 to-amber-50/30 rounded-2xl border border-stone-200/50"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-light flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-stone-800 text-sm font-light truncate">{fragment.title}</p>
                  <p className="text-stone-500 text-xs font-light">{fragment.location}</p>
                </div>
              </div>
            ))}
            
            {/* Locked Fragments */}
            {[...Array(Math.min(3, Math.max(totalCount - completedCount, 0)))].map((_, index) => (
              <div 
                key={`locked-${index}`}
                className="flex items-center gap-3 p-3 bg-stone-100 rounded-2xl border border-stone-200/50 opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-stone-300 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4 text-stone-500" />
                </div>
                <div className="flex-1">
                  <p className="text-stone-500 text-sm font-light">Locked Fragment</p>
                  <p className="text-stone-400 text-xs font-light">Explore to unlock</p>
                </div>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-stone-600 font-light">
              <span>Journey Progress</span>
              <span>{Math.round((completedCount / totalCount) * 100)}%</span>
            </div>
            <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 transition-all duration-700 ease-out"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Encouragement Message */}
        <div className="bg-gradient-to-br from-stone-800 to-stone-700 rounded-3xl p-5 text-center shadow-lg">
          <p className="text-white/90 text-sm font-light leading-relaxed">
            {journeyComplete
              ? `You've completed your journey through Maple Bridge. Every echo you unlocked reveals a new layer of movement, poetry, and memory.`
              : `Continue your journey to discover ${totalCount - completedCount} more echoes of Maple Bridge.`}
          </p>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-6 bg-white/80 backdrop-blur-sm border-t border-stone-200/50 space-y-3">
        <button 
          onClick={journeyComplete ? onViewLeaderboard : onContinueExploring}
          className="w-full bg-gradient-to-r from-stone-800 to-stone-700 text-white py-4 rounded-full font-light text-base tracking-wide shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {journeyComplete ? 'View Community Ranking' : 'Continue Exploring'}
        </button>
        <button 
          onClick={onBackToHome}
          className="w-full bg-white text-stone-700 py-4 rounded-full font-light text-base border border-stone-300 hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    </div>
  );
}
