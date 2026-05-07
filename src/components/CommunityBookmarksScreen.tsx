import { ArrowLeft, Bookmark, Heart } from 'lucide-react';
import type { CommunityPhoto } from '../lib/api';

interface CommunityBookmarksScreenProps {
  onBack: () => void;
  onLikePhoto: (photoId: string) => Promise<void> | void;
  onBookmarkPhoto: (photoId: string) => Promise<void> | void;
  photos: CommunityPhoto[];
  isLoading: boolean;
}

function formatRelativeTime(isoDate: string) {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffHours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export function CommunityBookmarksScreen({
  onBack,
  onLikePhoto,
  onBookmarkPhoto,
  photos,
  isLoading,
}: CommunityBookmarksScreenProps) {
  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-stone-50 to-amber-50/30">
      <div className="bg-white/80 backdrop-blur-sm border-b border-stone-200/50 pt-14 pb-4 px-5">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-stone-700" />
          </button>
          <div className="flex-1 min-w-0 text-center">
            <h1 className="text-xl font-light text-stone-800 truncate">Saved Moments</h1>
            <p className="text-xs font-light text-stone-500 mt-1">Your bookmarked Maple Bridge photos</p>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-5">
        {isLoading ? (
          <div className="bg-white rounded-3xl p-6 border border-stone-200/60 shadow-sm text-center text-stone-500 text-sm font-light">
            Loading saved moments...
          </div>
        ) : photos.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 border border-dashed border-stone-300 text-center">
            <p className="text-stone-800 text-base font-light">No saved moments yet.</p>
            <p className="text-stone-500 text-sm font-light mt-2">Tap the bookmark icon on any community photo to keep it here.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {photos.map((photo) => (
              <div key={photo.id} className="bg-white rounded-3xl overflow-hidden shadow-md border border-stone-200/50">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-light">
                      {photo.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-light text-stone-800">{photo.userName}</p>
                      <p className="text-xs font-light text-stone-500">{formatRelativeTime(photo.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-xs font-light text-stone-500 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/50">
                    {photo.storyPointTitle}
                  </div>
                </div>

                <div className="relative aspect-[4/3]">
                  <img src={photo.thumbnailUrl || photo.imageUrl} alt={photo.caption} className="w-full h-full object-cover" />
                </div>

                <div className="p-4">
                  <p className="text-sm font-light text-stone-700 leading-relaxed mb-3">{photo.caption}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-stone-200">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => onLikePhoto(photo.id)}
                        className="flex items-center gap-1.5 text-stone-600 hover:text-amber-600 transition-colors"
                      >
                        <Heart className="w-5 h-5" />
                        <span className="text-sm font-light">{photo.likes}</span>
                      </button>
                      <button
                        onClick={() => onBookmarkPhoto(photo.id)}
                        className="text-amber-600 transition-colors"
                        aria-label="Remove bookmark"
                      >
                        <Bookmark className="w-5 h-5" fill="currentColor" />
                      </button>
                    </div>
                    <span className="text-xs font-light text-stone-400">Maple Bridge, Suzhou</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
