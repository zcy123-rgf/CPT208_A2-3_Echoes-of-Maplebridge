import { ArrowLeft, Camera, Sparkles, MessageCircle, Navigation2, CheckCircle2, Orbit } from 'lucide-react';

interface StoryPointDetailScreenProps {
  onBack: () => void;
  onCheckIn: () => void;
  onOpenAR: () => void;
  onRetryTask: () => void;
  onPreviousTask: () => void;
  storyPointIndex: number;
  totalStoryPoints: number;
  storyPoint: {
    title: string;
    subtitle: string;
    tag: string;
    currentView: string;
    historicalMeaning: string;
    significance: string;
    taskPrompt: string;
    taskType: 'checkin' | 'ar';
    hasGuidePreview?: boolean;
  };
  journeyPoints: Array<{
    id: string;
    title: string;
  }>;
  hasGuidePreview?: boolean;
}

export function StoryPointDetailScreen({ onBack, onCheckIn, onOpenAR, onRetryTask, onPreviousTask, storyPointIndex, totalStoryPoints, storyPoint, journeyPoints, hasGuidePreview = false }: StoryPointDetailScreenProps) {
  const isARStoryPoint = storyPoint.taskType === 'ar';
  const showGuidePreview = hasGuidePreview || Boolean(storyPoint.hasGuidePreview) || isARStoryPoint;
  const visibleJourneyPoints = journeyPoints.slice(0, totalStoryPoints);
  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-stone-50 to-amber-50/30">
      {/* Hero Image Section */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1766953597804-893f1993b8af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMENoaW5lc2UlMjBzdG9uZSUyMGJyaWRnZSUyMG5pZ2h0JTIwd2F0ZXJ8ZW58MXx8fHwxNzc0ODA4MjA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Maple Bridge at Night"
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-stone-50"></div>
        
        {/* Top Controls */}
        <div className="absolute top-12 left-5 right-5 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-stone-700" />
          </button>
          <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
            <span className="text-stone-800 text-sm font-light">Story Point {storyPointIndex + 1}/{totalStoryPoints}</span>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto -mt-8 relative">
        <div className="px-6 pb-24">
          {/* Title Card */}
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-5 border border-stone-200/50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h1 className="text-2xl font-light text-stone-800 mb-2 leading-snug">
                  {storyPoint.title}
                </h1>
                <p className="text-sm font-light text-stone-600 leading-relaxed">
                  {storyPoint.subtitle}
                </p>
              </div>
            </div>

            {/* Location Status */}
            <div className="mt-4 pt-4 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-light text-stone-800">You're at the location</p>
                    <p className="text-xs font-light text-stone-500">Maple Bridge, Suzhou</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-light text-stone-500">Distance</p>
                  <p className="text-lg font-light text-stone-800">0m</p>
                </div>
              </div>
            </div>
          </div>

          {/* Story Card */}
          <div className="bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-50 rounded-3xl p-6 mb-5 border border-amber-200/50 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                <span className="text-lg">📜</span>
              </div>
              <h3 className="text-lg font-light text-stone-800">{storyPoint.tag}</h3>
            </div>
            
            <div className="space-y-4 text-stone-700 font-light leading-relaxed">
              {showGuidePreview ? (
                <>
                  <p className="text-sm">
                    {storyPoint.currentView}
                  </p>
                  <p className="text-sm">
                    {storyPoint.significance}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm">
                    {storyPoint.currentView}
                  </p>
                  <p className="text-sm">
                    {storyPoint.historicalMeaning}
                  </p>
                  <p className="text-sm">
                    {storyPoint.significance}
                  </p>
                </>
              )}

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-amber-200/50">
                {isARStoryPoint ? (
                  <>
                    <p className="text-amber-800 font-light text-sm mb-1">Listen to the guide</p>
                    <p className="text-stone-600 text-xs font-light leading-relaxed">
                      Meet the virtual guide to hear the deeper story behind this place.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm italic text-stone-600 leading-relaxed">
                      "Outside the city of Gusu, the temple of Cold Mountain;<br />
                      Rings at midnight its bell and reaches my boat."
                    </p>
                    <p className="text-xs text-stone-500 mt-2">— Zhang Ji, Tang Dynasty</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Task Card */}
          <div className="bg-white rounded-3xl p-6 mb-5 shadow-sm border border-stone-200/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-light text-stone-800">{isARStoryPoint ? 'Full AR Guide Task' : showGuidePreview ? 'Photo Task + Guide Preview' : 'Check-in Task'}</h3>
              <div className="px-3 py-1 bg-blue-100 rounded-full flex items-center gap-1.5">
                {isARStoryPoint ? <Sparkles className="w-3.5 h-3.5 text-blue-700" /> : <Camera className="w-3.5 h-3.5 text-blue-700" />}
                <span className="text-blue-700 text-xs font-light">{isARStoryPoint ? 'AR Guide' : showGuidePreview ? 'Guide + Photo' : 'Photo'}</span>
              </div>
            </div>
            
            <p className="text-sm font-light text-stone-600 leading-relaxed mb-4">
              {storyPoint.taskPrompt}
            </p>

            {!isARStoryPoint && (
              <div className="relative h-44 bg-gradient-to-br from-stone-200 to-stone-300 rounded-2xl overflow-hidden mb-4">
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Camera className="w-10 h-10 text-stone-400 mb-2" />
                  <p className="text-stone-500 text-sm font-light">Tap to take photo</p>
                </div>
                <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-white/50"></div>
                <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-white/50"></div>
                <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-white/50"></div>
                <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-white/50"></div>
              </div>
            )}

            <button 
              onClick={storyPoint.taskType === 'ar' ? onOpenAR : onCheckIn}
              className={`w-full py-3.5 bg-gradient-to-r from-stone-800 to-stone-700 text-white rounded-full font-light hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${
                isARStoryPoint ? 'animate-breathe-button shadow-xl shadow-amber-200/30 ring-1 ring-amber-300/35' : ''
              }`}
              style={isARStoryPoint ? { boxShadow: '0 0 0 1px rgba(251, 191, 36, 0.18), 0 0 28px rgba(251, 191, 36, 0.22), 0 12px 30px rgba(28, 25, 23, 0.28)' } : undefined}
            >
              {storyPoint.taskType === 'ar' ? <Orbit className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
              {storyPoint.taskType === 'ar' ? 'Tap to summon Zhang Ji in AR' : 'Complete Check-in Task'}
            </button>

            {!isARStoryPoint && showGuidePreview && (
              <button
                onClick={onOpenAR}
                className="w-full py-3.5 mt-3 bg-amber-100 text-amber-900 rounded-full font-light hover:bg-amber-200 transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Preview with Virtual Guide
              </button>
            )}

            <div className="grid grid-cols-3 gap-3 mt-3">
              <button
                onClick={onRetryTask}
                className="w-full py-3 rounded-full border border-stone-300 text-stone-700 bg-white font-light hover:bg-stone-50 transition-colors"
              >
                Retry Task
              </button>
              <button
                onClick={onPreviousTask}
                className="w-full py-3 rounded-full border border-stone-300 text-stone-700 bg-white font-light hover:bg-stone-50 transition-colors"
              >
                Previous Task
              </button>
              <button
                onClick={onBack}
                className="w-full py-3 rounded-full border border-stone-300 text-stone-700 bg-white font-light hover:bg-stone-50 transition-colors"
              >
                Back to Map
              </button>
            </div>
          </div>

          {/* Progress Card */}
          <div className="bg-white rounded-3xl p-6 mb-5 shadow-sm border border-stone-200/50">
            <h4 className="text-base font-light text-stone-800 mb-4">Your Journey Progress</h4>
            
            <div className="space-y-3 mb-4">
              {visibleJourneyPoints.map((point, index) => {
                const pointNumber = index + 1;
                const isCurrent = index === storyPointIndex;
                const isUnlocked = index < storyPointIndex;

                if (isUnlocked) {
                  return (
                    <div key={point.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50/50 rounded-xl border border-emerald-200/50">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-xs font-light flex-shrink-0">
                        {pointNumber}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-light text-stone-800">{point.title}</p>
                        <p className="text-xs font-light text-stone-500">Unlocked</p>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                  );
                }

                if (isCurrent) {
                  return (
                    <div key={point.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50/50 rounded-xl border border-amber-200/50">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xs font-light flex-shrink-0">
                        {pointNumber}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-light text-stone-800">{point.title}</p>
                        <p className="text-xs font-light text-amber-700">Current location</p>
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 border-amber-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={point.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200/50 opacity-50">
                    <div className="w-8 h-8 rounded-full bg-stone-300 flex items-center justify-center text-white text-xs font-light flex-shrink-0">
                      {pointNumber}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-light text-stone-600">{point.title}</p>
                      <p className="text-xs font-light text-stone-500">Locked</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-stone-600 font-light">
                <span>Story Fragments</span>
                <span>{storyPointIndex + 1}/{totalStoryPoints} unlocked</span>
              </div>
              <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 transition-all duration-700"
                style={{ width: `${((storyPointIndex + 1) / totalStoryPoints) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI Assistant */}
      <div className="absolute bottom-6 right-6">
        <button className="w-14 h-14 rounded-full bg-gradient-to-br from-stone-800 to-stone-700 shadow-2xl flex items-center justify-center hover:shadow-xl transition-all hover:scale-105 active:scale-95 border-2 border-amber-200/30">
          <MessageCircle className="w-6 h-6 text-amber-100" />
        </button>
        {/* Pulse indicator */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white animate-pulse"></div>
      </div>

      {/* Bottom Navigation Hint */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-8 pb-6 px-6 pointer-events-none">
        <div className="flex items-center justify-center gap-2 text-stone-400 text-xs font-light pointer-events-auto">
          <Navigation2 className="w-3 h-3" />
          <span>Continue to next story point</span>
        </div>
      </div>

      <style>{`
        @keyframes breathe-button {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-breathe-button {
          animation: breathe-button 2.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
