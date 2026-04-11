import { useMemo, useState } from 'react';
import { ArrowLeft, Crown, Heart, Info, Medal, Trophy, X } from 'lucide-react';

interface CommunityLeaderboardScreenProps {
  onBack: () => void;
  onBackHome: () => void;
}

const leaderboardEntries = [
  {
    id: 1,
    user: 'Canal Story Hunter',
    totalLikes: 428,
    reward: 'Suzhou sachet',
    photos: [
      'https://images.unsplash.com/photo-1763336323425-8c9ba61fc3e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDaGluZXNlJTIwYnJpZGdlJTIwd2F0ZXIlMjByZWZsZWN0aW9ufGVufDF8fHx8MTc3NDgwODM2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1761813378459-7ab89bc3345c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9uZSUyMGJyaWRnZSUyMHN1bnNldCUyMHBlYWNlZnVsfGVufDF8fHx8MTc3NDgwODM2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1749888197235-259de414f349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGJvYXQlMjB3YXRlciUyMENoaW5hfGVufDF8fHx8MTc3NDgwODM2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1766953597804-893f1993b8af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodCUyMHJpdmVyJTIwdHJhZGl0aW9uYWwlMjBicmlkZ2UlMjByZWZsZWN0aW9ufGVufDF8fHx8MTc3NDgwODM2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    ],
  },
  {
    id: 2,
    user: 'Suzhou Echo Walker',
    totalLikes: 386,
    reward: 'Suzhou fan',
    photos: [
      'https://images.unsplash.com/photo-1761813378459-7ab89bc3345c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9uZSUyMGJyaWRnZSUyMHN1bnNldCUyMHBlYWNlZnVsfGVufDF8fHx8MTc3NDgwODM2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1763336323425-8c9ba61fc3e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDaGluZXNlJTIwYnJpZGdlJTIwd2F0ZXIlMjByZWZsZWN0aW9ufGVufDF8fHx8MTc3NDgwODM2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1766953597804-893f1993b8af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodCUyMHJpdmVyJTIwdHJhZGl0aW9uYWwlMjBicmlkZ2UlMjByZWZsZWN0aW9ufGVufDF8fHx8MTc3NDgwODM2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1749888197235-259de414f349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGJvYXQlMjB3YXRlciUyMENoaW5hfGVufDF8fHx8MTc3NDgwODM2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    ],
  },
  {
    id: 3,
    user: 'Moon Bell Collector',
    totalLikes: 341,
    reward: 'Suzhou hairpin',
    photos: [
      'https://images.unsplash.com/photo-1749888197235-259de414f349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGJvYXQlMjB3YXRlciUyMENoaW5hfGVufDF8fHx8MTc3NDgwODM2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1766953597804-893f1993b8af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodCUyMHJpdmVyJTIwdHJhZGl0aW9uYWwlMjBicmlkZ2UlMjByZWZsZWN0aW9ufGVufDF8fHx8MTc3NDgwODM2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1763336323425-8c9ba61fc3e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDaGluZXNlJTIwYnJpZGdlJTIwd2F0ZXIlMjByZWZsZWN0aW9ufGVufDF8fHx8MTc3NDgwODM2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1761813378459-7ab89bc3345c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9uZSUyMGJyaWRnZSUyMHN1bnNldCUyMHBlYWNlZnVsfGVufDF8fHx8MTc3NDgwODM2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    ],
  },
  {
    id: 4,
    user: 'Bridge Sketchbook',
    totalLikes: 266,
    photos: [
      'https://images.unsplash.com/photo-1761813378459-7ab89bc3345c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9uZSUyMGJyaWRnZSUyMHN1bnNldCUyMHBlYWNlZnVsfGVufDF8fHx8MTc3NDgwODM2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1749888197235-259de414f349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGJvYXQlMjB3YXRlciUyMENoaW5hfGVufDF8fHx8MTc3NDgwODM2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1763336323425-8c9ba61fc3e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDaGluZXNlJTIwYnJpZGdlJTIwd2F0ZXIlMjByZWZsZWN0aW9ufGVufDF8fHx8MTc3NDgwODM2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1766953597804-893f1993b8af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodCUyMHJpdmVyJTIwdHJhZGl0aW9uYWwlMjBicmlkZ2UlMjByZWZsZWN0aW9ufGVufDF8fHx8MTc3NDgwODM2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    ],
  },
  {
    id: 5,
    user: 'You',
    totalLikes: 232,
    photos: [
      'https://images.unsplash.com/photo-1763336323425-8c9ba61fc3e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDaGluZXNlJTIwYnJpZGdlJTIwd2F0ZXIlMjByZWZsZWN0aW9ufGVufDF8fHx8MTc3NDgwODM2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1761813378459-7ab89bc3345c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9uZSUyMGJyaWRnZSUyMHN1bnNldCUyMHBlYWNlZnVsfGVufDF8fHx8MTc3NDgwODM2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1749888197235-259de414f349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGJvYXQlMjB3YXRlciUyMENoaW5hfGVufDF8fHx8MTc3NDgwODM2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1766953597804-893f1993b8af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodCUyMHJpdmVyJTIwdHJhZGl0aW9uYWwlMjBicmlkZ2UlMjByZWZsZWN0aW9ufGVufDF8fHx8MTc3NDgwODM2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    ],
  },
  {
    id: 6,
    user: 'Lantern Path Diary',
    totalLikes: 219,
    photos: [
      'https://images.unsplash.com/photo-1763336323425-8c9ba61fc3e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDaGluZXNlJTIwYnJpZGdlJTIwd2F0ZXIlMjByZWZsZWN0aW9ufGVufDF8fHx8MTc3NDgwODM2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1766953597804-893f1993b8af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodCUyMHJpdmVyJTIwdHJhZGl0aW9uYWwlMjBicmlkZ2UlMjByZWZsZWN0aW9ufGVufDF8fHx8MTc3NDgwODM2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1749888197235-259de414f349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGJvYXQlMjB3YXRlciUyMENoaW5hfGVufDF8fHx8MTc3NDgwODM2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1761813378459-7ab89bc3345c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9uZSUyMGJyaWRnZSUyMHN1bnNldCUyMHBlYWNlZnVsfGVufDF8fHx8MTc3NDgwODM2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    ],
  },
].sort((a, b) => b.totalLikes - a.totalLikes);

const rewardIcons = [Trophy, Medal, Crown];

export function CommunityLeaderboardScreen({ onBack, onBackHome }: CommunityLeaderboardScreenProps) {
  const [selectedRewardEntryId, setSelectedRewardEntryId] = useState<number | null>(null);
  const topThree = leaderboardEntries.slice(0, 3);
  const selectedRewardEntry = useMemo(
    () => leaderboardEntries.find((entry) => entry.id === selectedRewardEntryId) ?? null,
    [selectedRewardEntryId]
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
            {[topThree[1], topThree[0], topThree[2]].map((entry, slotIndex) => {
              if (!entry) return null;
              const actualIndex = leaderboardEntries.findIndex((item) => item.id === entry.id);
              const icon =
                actualIndex === 0 ? Trophy :
                actualIndex === 1 ? Medal :
                Crown;
              const Icon = icon;
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

        {leaderboardEntries.map((entry, index) => {
          const isTopThree = index < 3;
          const RewardIcon = rewardIcons[index] ?? Trophy;
          const isCurrentUser = entry.user === 'You';

          return (
            <div
              key={entry.id}
              className={`rounded-[28px] border p-4 shadow-sm ${
                isCurrentUser
                  ? 'bg-gradient-to-br from-sky-50 to-cyan-50 border-sky-200/80'
                  : 
                isTopThree
                  ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/70'
                  : 'bg-white border-stone-200/60'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-medium ${
                    isCurrentUser ? 'bg-gradient-to-br from-sky-500 to-cyan-600' :
                    index === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                    index === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-600' :
                    index === 2 ? 'bg-gradient-to-br from-orange-500 to-amber-700' :
                    'bg-gradient-to-br from-stone-500 to-stone-700'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-light text-stone-900 truncate">{entry.user}</p>
                      {isCurrentUser && (
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

                {isTopThree && (
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
                    <img src={photo} alt={`${entry.user} check-in ${photoIndex + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              {isTopThree && (
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
                <h3 className="text-2xl font-light text-stone-900 mt-2">Top 3 Reward</h3>
              </div>
              <button
                onClick={() => setSelectedRewardEntryId(null)}
                className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 rounded-[24px] bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/70 p-5">
              <p className="text-sm font-light text-stone-700 leading-6">
                <span className="font-medium text-stone-900">{selectedRewardEntry.user}</span> is currently in the Top 3 community ranking.
              </p>
              <p className="mt-3 text-sm font-light text-stone-700 leading-6">
                Prize preview: <span className="font-medium text-amber-900">{selectedRewardEntry.reward}</span>
              </p>
              <p className="mt-3 text-sm font-light text-stone-600 leading-6">
                Top 1 receives a Suzhou sachet, Top 2 receives a Suzhou fan, and Top 3 receives a Suzhou hairpin.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
