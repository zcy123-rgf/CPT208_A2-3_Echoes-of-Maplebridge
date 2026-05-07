import { useMemo, useState } from 'react';
import { ArrowLeft, Crown, Heart, Info, Medal, Trophy, X } from 'lucide-react';
import type { LeaderboardEntry } from '../lib/api';

interface CommunityLeaderboardScreenProps {
  onBack: () => void;
  onBackHome: () => void;
  entries: LeaderboardEntry[];
  isLoading: boolean;
}

const rewardIcons = [Trophy, Medal, Crown];

export function CommunityLeaderboardScreen({
  onBack,
  onBackHome,
  entries,
  isLoading,
}: CommunityLeaderboardScreenProps) {
  const [selectedRewardEntryId, setSelectedRewardEntryId] = useState<string | null>(null);
  const topThree = entries.slice(0, 3);
  const selectedRewardEntry = useMemo(
    () => entries.find((entry) => entry.id === selectedRewardEntryId) ?? null,
    [entries, selectedRewardEntryId]
  );

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-stone-50 via-amber-50/40 to-stone-100">
      <div className="pt-14 px-5 pb-4 bg-white/80 backdrop-blur-sm border-b border-stone-200/60">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-stone-700" />
          </button>
          <h1 className="text-xl font-light text-stone-800">Community Ranking</h1>
          <div className="w-10" />
        </div>

        <div className="rounded-[28px] bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 p-5 text-white shadow-xl">
          <p className="text-xs uppercase tracking-[0.22em] text-amber-200/80">Final Challenge Board</p>
          <h2 className="mt-3 text-2xl font-light">Top Maple Bridge Check-in Creators</h2>
          <p className="mt-2 text-sm font-light leading-6 text-white/78">
            Users are ranked by the total likes collected across all four check-in scenes.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-5 py-5 space-y-4">
        {isLoading ? (
          <div className="rounded-[30px] border border-stone-200/70 bg-white p-6 text-center text-stone-500 text-sm font-light shadow-sm">
            Loading community ranking...
          </div>
        ) : (
          <>
            <div className="rounded-[30px] border border-amber-200/70 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Podium</p>
                  <h3 className="text-xl font-light text-stone-900 mt-1">Top 3 Community Winners</h3>
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-xs font-light text-amber-900 border border-amber-200">
                  Prize ranking
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 items-end">
                {[topThree[1], topThree[0], topThree[2]].map((entry) => {
                  if (!entry) {
                    return null;
                  }

                  const actualIndex = entries.findIndex((item) => item.id === entry.id);
                  const Icon = actualIndex === 0 ? Trophy : actualIndex === 1 ? Medal : Crown;
                  const heightClass = actualIndex === 0 ? 'h-32' : actualIndex === 1 ? 'h-24' : 'h-20';

                  return (
                    <div key={entry.id} className="text-center">
                      <div className="mb-2 flex justify-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg ${
                          actualIndex === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                          actualIndex === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-600' :
                          'bg-gradient-to-br from-orange-500 to-amber-700'
                        }`}>
                          <Icon className="w-7 h-7" />
                        </div>
                      </div>
                      <p className="text-sm font-light text-stone-900 truncate">{entry.user}</p>
                      <p className="text-xs font-light text-stone-500 mt-1">{entry.totalLikes} likes</p>
                      <div className={`mt-3 rounded-t-[22px] ${heightClass} flex items-center justify-center text-white font-medium ${
                        actualIndex === 0 ? 'bg-gradient-to-b from-amber-400 to-orange-500' :
                        actualIndex === 1 ? 'bg-gradient-to-b from-slate-400 to-slate-600' :
                        'bg-gradient-to-b from-orange-500 to-amber-700'
                      }`}>
                        #{actualIndex + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {entries.map((entry, index) => {
              const isTopThree = index < 3;
              const RewardIcon = rewardIcons[index] ?? Trophy;

              return (
                <div
                  key={entry.id}
                  className={`rounded-[28px] border p-4 shadow-sm ${
                    entry.isCurrentUser
                      ? 'bg-gradient-to-br from-sky-50 to-cyan-50 border-sky-200/80'
                      : isTopThree
                        ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/70'
                        : 'bg-white border-stone-200/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-medium ${
                        entry.isCurrentUser ? 'bg-gradient-to-br from-sky-500 to-cyan-600' :
                        index === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                        index === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-600' :
                        index === 2 ? 'bg-gradient-to-br from-orange-500 to-amber-700' :
                        'bg-gradient-to-br from-stone-500 to-stone-700'
                      }`}>
                        {entry.rank}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-light text-stone-900 truncate">{entry.user}</p>
                          {entry.isCurrentUser && (
                            <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 text-[11px] uppercase tracking-[0.14em] border border-sky-200">
                              You
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                          <span className="text-sm font-light text-stone-700">{entry.totalLikes} total likes</span>
                        </div>
                      </div>
                    </div>

                    {isTopThree && entry.reward && (
                      <div className="flex flex-col items-end gap-2">
                        <div className="px-3 py-1 rounded-full bg-white text-amber-800 border border-amber-300/60 text-xs font-medium uppercase tracking-[0.16em]">
                          Top {index + 1}
                        </div>
                        <button
                          onClick={() => setSelectedRewardEntryId(entry.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300/60 text-xs font-light"
                        >
                          <Info className="w-3.5 h-3.5" />
                          Prize Tip
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {entry.photos.map((photo, photoIndex) => (
                      <div key={photoIndex} className="aspect-square rounded-2xl overflow-hidden border border-stone-200/60 bg-stone-100">
                        <img src={photo.thumbnailUrl || photo.imageUrl} alt={`${entry.user} check-in ${photoIndex + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>

                  {isTopThree && entry.reward && (
                    <div className="rounded-2xl border border-amber-300/50 bg-white/70 px-4 py-3">
                      <div className="flex items-center gap-2 text-amber-900">
                        <RewardIcon className="w-4 h-4" />
                        <p className="text-sm font-light">
                          Top {index + 1} can receive a Suzhou keepsake: <span className="font-medium">{entry.reward}</span>.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {entries.length === 0 && (
              <div className="rounded-[28px] border border-dashed border-stone-300 bg-white p-6 text-center">
                <p className="text-stone-800 text-base font-light">No ranking data yet.</p>
                <p className="text-stone-500 text-sm font-light mt-2">Community photos will appear here after the first uploads.</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="p-5 bg-white/85 backdrop-blur-sm border-t border-stone-200/60">
        <button
          onClick={onBackHome}
          className="w-full bg-gradient-to-r from-stone-800 to-stone-700 text-white py-4 rounded-full font-light text-base tracking-wide shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Back to Home
        </button>
      </div>

      {selectedRewardEntry && (
        <div className="absolute inset-0 z-40 bg-black/45 backdrop-blur-sm flex items-center justify-center px-6">
          <div className="w-full rounded-[30px] bg-white p-6 shadow-2xl border border-stone-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Prize Tip</p>
                <h3 className="text-xl font-light text-stone-900 mt-1">{selectedRewardEntry.user}</h3>
              </div>
              <button
                onClick={() => setSelectedRewardEntryId(null)}
                className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-stone-700" />
              </button>
            </div>

            <div className="mt-5 rounded-[24px] border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
              <p className="text-sm font-light text-stone-700 leading-6">
                This creator is currently ranked <span className="font-medium">#{selectedRewardEntry.rank}</span> with{' '}
                <span className="font-medium">{selectedRewardEntry.totalLikes} likes</span>.
              </p>
              {selectedRewardEntry.reward && (
                <p className="text-sm font-light text-stone-700 leading-6 mt-3">
                  Their current keepsake tier is <span className="font-medium">{selectedRewardEntry.reward}</span>.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
