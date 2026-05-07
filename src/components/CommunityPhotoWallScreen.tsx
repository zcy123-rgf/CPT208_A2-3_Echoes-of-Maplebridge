import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Bookmark, Heart, ImagePlus, MessageCircle, Send, Upload, X } from 'lucide-react';
import type { AuthUser, CommunityPhoto } from '../lib/api';
import { askZhangJi } from '../lib/doubaoGuide';

interface CommunityPhotoWallScreenProps {
  onBack: () => void;
  onOpenBookmarks: () => void;
  onUpload: (payload: { caption: string; file: File }) => Promise<void>;
  onLikePhoto: (photoId: string) => Promise<void> | void;
  onBookmarkPhoto: (photoId: string) => Promise<void> | void;
  storyPoints: Array<{ id: string; name: string }>;
  currentStoryPoint: { id: string; title: string; shortTitle: string };
  currentUser: AuthUser;
  photos: CommunityPhoto[];
  isLoading: boolean;
  isSubmitting: boolean;
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

export function CommunityPhotoWallScreen({
  onBack,
  onOpenBookmarks,
  onUpload,
  onLikePhoto,
  onBookmarkPhoto,
  storyPoints,
  currentStoryPoint,
  currentUser,
  photos,
  isLoading,
  isSubmitting,
}: CommunityPhotoWallScreenProps) {
  const screenRef = useRef<HTMLDivElement | null>(null);
  const dragPointerIdRef = useRef<number | null>(null);
  const dragStartRef = useRef<{ pointerX: number; pointerY: number; left: number; top: number } | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatError, setChatError] = useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [bubblePosition, setBubblePosition] = useState({ left: 314, top: 660 });
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; role: 'assistant' | 'user'; text: string }>>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `I can help you connect ${currentStoryPoint.shortTitle} with the wider Maple Bridge story. Ask about the canal, the poem, or what to notice here.`,
    },
  ]);

  const visiblePhotos = useMemo(
    () => photos.filter((photo) => selectedFilter === 'all' || photo.storyPointId === selectedFilter),
    [photos, selectedFilter]
  );

  useEffect(() => {
    if (!previewUrl) {
      return;
    }

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    const screen = screenRef.current;
    if (!screen) {
      return;
    }

    const syncBubblePosition = () => {
      const bubbleSize = 56;
      const margin = 20;
      const maxLeft = Math.max(margin, screen.clientWidth - bubbleSize - margin);
      const maxTop = Math.max(140, screen.clientHeight - bubbleSize - 124);
      setBubblePosition((current) => ({
        left: Math.min(Math.max(current.left, margin), maxLeft),
        top: Math.min(Math.max(current.top, 140), maxTop),
      }));
    };

    syncBubblePosition();
    window.addEventListener('resize', syncBubblePosition);
    return () => window.removeEventListener('resize', syncBubblePosition);
  }, []);

  const submitPhoto = async () => {
    if (caption.trim().length < 6) {
      setFormError('Please add a caption with at least 6 characters.');
      return;
    }

    if (!selectedFile) {
      setFormError('Please choose an image file before uploading.');
      return;
    }

    try {
      setFormError(null);
      await onUpload({
        caption: caption.trim(),
        file: selectedFile,
      });
      setCaption('');
      setSelectedFile(null);
      setPreviewUrl('');
      setIsComposerOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to share this photo.');
    }
  };

  const submitChat = async (prefilledQuestion?: string) => {
    const question = (prefilledQuestion ?? chatInput).trim();
    if (!question || isChatLoading) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      text: question,
    };

    setChatMessages((current) => [...current, userMessage]);
    setChatInput('');
    setChatError(null);
    setIsChatLoading(true);

    try {
      const response = await askZhangJi(question);
      setChatMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: response.answer,
        },
      ]);
    } catch (error) {
      setChatError(error instanceof Error ? error.message : 'The guide is unavailable right now.');
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleBubblePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    const screen = screenRef.current;
    if (!screen) {
      return;
    }

    dragPointerIdRef.current = event.pointerId;
    dragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      left: bubblePosition.left,
      top: bubblePosition.top,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleBubblePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const screen = screenRef.current;
    const dragStart = dragStartRef.current;
    if (!screen || !dragStart || dragPointerIdRef.current !== event.pointerId) {
      return;
    }

    const bubbleSize = 56;
    const margin = 12;
    const deltaX = event.clientX - dragStart.pointerX;
    const deltaY = event.clientY - dragStart.pointerY;
    const nextLeft = dragStart.left + deltaX;
    const nextTop = dragStart.top + deltaY;
    const maxLeft = Math.max(margin, screen.clientWidth - bubbleSize - margin);
    const maxTop = Math.max(100, screen.clientHeight - bubbleSize - 92);

    setBubblePosition({
      left: Math.min(Math.max(nextLeft, margin), maxLeft),
      top: Math.min(Math.max(nextTop, 100), maxTop),
    });
  };

  const handleBubblePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    const dragStart = dragStartRef.current;
    if (dragPointerIdRef.current !== event.pointerId || !dragStart) {
      return;
    }

    const distance = Math.hypot(event.clientX - dragStart.pointerX, event.clientY - dragStart.pointerY);
    dragPointerIdRef.current = null;
    dragStartRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (distance < 8) {
      setIsChatOpen(true);
      setChatError(null);
    }
  };

  return (
    <div ref={screenRef} className="h-full flex flex-col bg-gradient-to-b from-stone-50 to-amber-50/30 relative overflow-hidden">
      <div className="bg-white/80 backdrop-blur-sm border-b border-stone-200/50 pt-14 pb-4 px-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-stone-700" />
          </button>
          <h1 className="flex-1 min-w-0 text-center text-xl font-light text-stone-800 truncate px-2">Maple Bridge Moments</h1>
          <button
            onClick={onOpenBookmarks}
            className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
            aria-label="Open saved moments"
          >
            <Bookmark className="w-5 h-5 text-stone-700" />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {storyPoints.map((point) => (
            <button
              key={point.id}
              onClick={() => setSelectedFilter(point.id)}
              className={`px-4 py-2 rounded-full text-sm font-light whitespace-nowrap transition-all flex-shrink-0 ${
                selectedFilter === point.id
                  ? 'bg-gradient-to-r from-stone-800 to-stone-700 text-white shadow-md'
                  : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'
              }`}
            >
              {point.name}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 pt-6 pb-3">
        <h2 className="text-base font-light text-stone-700 mb-1">See how others captured Maple Bridge</h2>
        <p className="text-sm font-light text-stone-500">{visiblePhotos.length} moments shared by fellow explorers</p>
      </div>

      <div className="flex-1 overflow-auto px-6 pb-24">
        {isLoading ? (
          <div className="bg-white rounded-3xl p-6 border border-stone-200/60 shadow-sm text-center text-stone-500 text-sm font-light">
            Loading community moments...
          </div>
        ) : (
          <div className="space-y-5">
            {visiblePhotos.map((photo) => (
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
                  {photo.optimizedSizeBytes && photo.originalSizeBytes && (
                    <p className="text-xs font-light text-stone-400 mb-3">
                      Optimized upload · {Math.round((1 - photo.optimizedSizeBytes / photo.originalSizeBytes) * 100)}% smaller
                    </p>
                  )}
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
                        className={`transition-colors ${
                          photo.isBookmarked ? 'text-amber-600' : 'text-stone-600 hover:text-amber-600'
                        }`}
                        aria-label={photo.isBookmarked ? 'Remove bookmark' : 'Save bookmark'}
                      >
                        <Bookmark className="w-5 h-5" fill={photo.isBookmarked ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <span className="text-xs font-light text-stone-400">Maple Bridge, Suzhou</span>
                  </div>
                </div>
              </div>
            ))}

            {visiblePhotos.length === 0 && (
              <div className="bg-white rounded-3xl p-6 border border-dashed border-stone-300 text-center">
                <p className="text-stone-800 text-base font-light">No moments yet for this story point.</p>
                <p className="text-stone-500 text-sm font-light mt-2">Share the first one and unlock your fragment.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="absolute bottom-6 left-6 right-6 z-10">
        <button
          onClick={() => {
            setIsComposerOpen(true);
            setFormError(null);
          }}
          className="w-full bg-gradient-to-r from-stone-800 to-stone-700 text-white py-4 rounded-full font-light text-base tracking-wide shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Upload className="w-5 h-5" />
          Share Your Maple Bridge Moment
        </button>
      </div>

      <div
        className="absolute z-20"
        style={{
          left: bubblePosition.left,
          top: bubblePosition.top,
        }}
      >
        <button
          onPointerDown={handleBubblePointerDown}
          onPointerMove={handleBubblePointerMove}
          onPointerUp={handleBubblePointerUp}
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-stone-800 via-stone-700 to-stone-900 shadow-2xl flex items-center justify-center hover:shadow-xl transition-all border-2 border-amber-200/30 touch-none"
          aria-label="Open AI guide"
        >
          <MessageCircle className="w-6 h-6 text-amber-100" />
          <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-light text-white">
            AI Guide
          </span>
        </button>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white animate-pulse"></div>
      </div>

      {isComposerOpen && (
        <div className="absolute inset-0 z-40 bg-black/45 backdrop-blur-sm px-5 py-10">
          <div className="bg-white rounded-[28px] p-5 border border-stone-200 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Community Upload</p>
                <h3 className="text-xl font-light text-stone-900 mt-1">Share a check-in for {currentStoryPoint.shortTitle}</h3>
                <p className="text-sm font-light text-stone-500 mt-2">Posting as {currentUser.displayName}</p>
              </div>
              <button
                onClick={() => setIsComposerOpen(false)}
                className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-stone-700" />
              </button>
            </div>

            <div className="space-y-4 mt-5">
              <div>
                <label className="block text-sm font-light text-stone-700 mb-2">Caption</label>
                <textarea
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-amber-500 min-h-28 resize-none"
                  placeholder="Describe what you noticed at Maple Bridge..."
                />
              </div>

              <div>
                <label className="block text-sm font-light text-stone-700 mb-2">Image file</label>
                <label className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-stone-300 px-4 py-5 text-sm text-stone-600 cursor-pointer hover:border-amber-400 hover:text-amber-700 transition-colors">
                  <ImagePlus className="w-4 h-4" />
                  {selectedFile ? selectedFile.name : 'Choose a JPG, PNG, or WEBP image'}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      setSelectedFile(file);
                      setPreviewUrl(file ? URL.createObjectURL(file) : '');
                    }}
                  />
                </label>
              </div>

              {previewUrl && (
                <div className="rounded-3xl overflow-hidden border border-stone-200 bg-stone-100">
                  <img src={previewUrl} alt="Upload preview" className="w-full aspect-[4/3] object-cover" />
                </div>
              )}

              {formError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {formError}
                </div>
              )}

              <button
                onClick={submitPhoto}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-stone-800 to-stone-700 text-white py-4 rounded-full font-light text-base disabled:opacity-60"
              >
                {isSubmitting ? 'Sharing...' : 'Upload and Complete Check-in'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isChatOpen && (
        <div className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm px-4 py-8">
          <div className="h-full rounded-[2rem] border border-stone-200 bg-white shadow-2xl flex flex-col overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-stone-200 bg-gradient-to-r from-stone-900 to-stone-700 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-amber-100/90">AI Heritage Guide</p>
                  <h3 className="mt-1 text-xl font-light">Ask about Maple Bridge</h3>
                  <p className="mt-2 text-sm font-light text-stone-200">
                    Drag the floating button anywhere, then tap it again whenever you want a quick explanation.
                  </p>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="px-5 py-4 border-b border-stone-200 bg-stone-50">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {[
                  `What should I notice at ${currentStoryPoint.shortTitle}?`,
                  'Why is Maple Bridge historically important?',
                  'How does the poem connect to this place?',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => void submitChat(prompt)}
                    className="shrink-0 rounded-full border border-amber-200 bg-white px-3 py-2 text-xs font-light text-stone-700 hover:border-amber-400 hover:text-amber-700"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.10),transparent_28%),linear-gradient(180deg,#fafaf9_0%,#ffffff_100%)]">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[86%] rounded-[1.4rem] px-4 py-3 text-sm font-light leading-6 shadow-sm ${
                    message.role === 'assistant'
                      ? 'bg-white border border-stone-200 text-stone-700'
                      : 'ml-auto bg-stone-900 text-white'
                  }`}
                >
                  {message.text}
                </div>
              ))}

              {isChatLoading && (
                <div className="max-w-[80%] rounded-[1.4rem] px-4 py-3 text-sm font-light leading-6 shadow-sm bg-white border border-stone-200 text-stone-500">
                  The guide is thinking...
                </div>
              )}
            </div>

            <div className="border-t border-stone-200 bg-white px-5 py-4">
              {chatError && (
                <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {chatError}
                </div>
              )}

              <div className="flex items-end gap-3">
                <textarea
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  className="min-h-[52px] flex-1 rounded-[1.4rem] border border-stone-300 px-4 py-3 text-sm outline-none resize-none focus:border-amber-500"
                  placeholder="Ask about this place, the canal, or the poem..."
                />
                <button
                  onClick={() => void submitChat()}
                  disabled={!chatInput.trim() || isChatLoading}
                  className="h-[52px] w-[52px] shrink-0 rounded-full bg-stone-900 text-white flex items-center justify-center disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
