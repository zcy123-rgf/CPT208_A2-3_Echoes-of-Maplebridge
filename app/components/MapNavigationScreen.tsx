import { ArrowLeft, Navigation, MessageCircle, MapPin, Clock, Footprints } from 'lucide-react';

type StoryPointSummary = {
  id: string;
  shortTitle: string;
  title: string;
  distance?: string;
  description?: string;
};

interface MapNavigationScreenProps {
  onBack: () => void;
  onStartNavigation: () => void;
  storyPoints: StoryPointSummary[];
  currentStoryPointIndex: number;
  completedCount: number;
}

const FALLBACK_DISTANCES = ['120m', '350m', '580m', '720m'];
const FALLBACK_DESCRIPTIONS = [
  'Where the ancient waterway bends through history',
  'A crossing once defined by regulation and nightfall',
  'Trade, streets, and everyday life along the canal',
  'The poem that turned this place into cultural memory'
];

export function MapNavigationScreen({
  onBack,
  onStartNavigation,
  storyPoints,
  currentStoryPointIndex,
  completedCount,
}: MapNavigationScreenProps) {
  const safeIndex = Math.min(currentStoryPointIndex, Math.max(storyPoints.length - 1, 0));
  const nextPoint = storyPoints[safeIndex];

  const getDistance = (index: number) => {
    return storyPoints[index]?.distance ?? FALLBACK_DISTANCES[index] ?? '120m';
  };

  const getDescription = (index: number) => {
    return storyPoints[index]?.description ?? FALLBACK_DESCRIPTIONS[index] ?? 'Explore the next story point.';
  };

  return (
    <div className="h-full flex flex-col relative bg-stone-100">
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1642019708236-942cc048bf34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBtYXAlMjBzdHJlZXQlMjB2aWV3JTIwdXJiYW58ZW58MXx8fHwxNzc0ODA3NzU2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Map"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-100/80 via-amber-50/60 to-stone-50/80" />
        </div>

        <div className="absolute inset-0">
          <svg className="w-full h-full" viewBox="0 0 390 600" fill="none">
            <path
              d="M 195 480 Q 180 400, 200 350 T 210 280 Q 215 240, 195 200 T 180 140"
              stroke="#D97706"
              strokeWidth="4"
              strokeDasharray="8 8"
              strokeLinecap="round"
              opacity="0.6"
              fill="none"
            />

            {[0, 1, 2, 3].map((index) => {
              const points = [
                { x: 195, y: 350 },
                { x: 210, y: 280 },
                { x: 195, y: 200 },
                { x: 180, y: 140 },
              ];
              const point = points[index];
              const isCurrent = index === safeIndex;
              const isCompleted = index < completedCount;
              const fill = isCurrent ? '#EA580C' : isCompleted ? '#10B981' : '#78716C';
              const rOuter = isCurrent ? 24 : 20;
              const rInner = isCurrent ? 16 : 12;
              const fontSize = isCurrent ? 14 : 12;

              return (
                <g key={index}>
                  <circle cx={point.x} cy={point.y} r={rOuter} fill={fill} opacity="0.2" />
                  <circle cx={point.x} cy={point.y} r={rInner} fill={fill} />
                  <text
                    x={point.x}
                    y={point.y + 5}
                    textAnchor="middle"
                    fill="white"
                    fontSize={fontSize}
                    fontWeight="600"
                  >
                    {index + 1}
                  </text>
                </g>
              );
            })}

            <circle cx="195" cy="480" r="28" fill="#3B82F6" opacity="0.15">
              <animate attributeName="r" from="28" to="36" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.15" to="0" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="195" cy="480" r="18" fill="#3B82F6" />
            <circle cx="195" cy="480" r="6" fill="white" />
          </svg>

          <div className="absolute" style={{ top: '320px', left: '220px' }}>
            <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md border border-stone-200">
              <p className="text-xs font-light text-stone-700">Next Point</p>
            </div>
          </div>

          <div className="absolute" style={{ top: '250px', left: '230px' }}>
            <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
              <p className="text-xs font-light text-stone-600">Point {Math.min(safeIndex + 2, storyPoints.length)}</p>
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 right-0 pt-14 px-5">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="w-11 h-11 rounded-full bg-white/95 backdrop-blur-sm shadow-lg flex items-center justify-center border border-stone-200/50 hover:bg-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-stone-700" />
            </button>

            <button className="w-11 h-11 rounded-full bg-white/95 backdrop-blur-sm shadow-lg flex items-center justify-center border border-stone-200/50 hover:bg-white transition-colors">
              <Navigation className="w-5 h-5 text-stone-700" />
            </button>
          </div>
        </div>

        <div className="absolute top-28 left-5 right-5">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-stone-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Footprints className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-stone-500 text-xs font-light">Distance to next point</p>
                  <p className="text-stone-800 text-xl font-light">{getDistance(safeIndex)}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-stone-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-light">2 min</span>
                </div>
                <p className="text-stone-400 text-xs font-light mt-0.5">walking</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 right-5">
          <button className="w-14 h-14 rounded-full bg-gradient-to-br from-stone-800 to-stone-700 shadow-xl flex items-center justify-center hover:shadow-2xl transition-all hover:scale-105 active:scale-95 border-2 border-amber-200/30">
            <MessageCircle className="w-6 h-6 text-amber-100" />
          </button>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white animate-pulse" />
        </div>
      </div>

      <div className="bg-white rounded-t-3xl shadow-2xl border-t border-stone-200/50">
        <div className="p-6">
          <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto mb-5" />

          <div className="mb-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-md">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-light text-white bg-orange-500 px-2 py-0.5 rounded-full">Next</span>
                  <span className="text-xs font-light text-stone-500">Story Point {safeIndex + 1} of {storyPoints.length}</span>
                </div>
                <h3 className="text-lg font-light text-stone-800 leading-snug mb-1">
                  {nextPoint?.title ?? 'Next Story Point'}
                </h3>
                <p className="text-sm font-light text-stone-600 leading-relaxed">
                  {getDescription(safeIndex)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 px-3 py-2 bg-amber-50 rounded-xl border border-amber-100">
              <div className="flex items-center gap-1.5">
                <Footprints className="w-4 h-4 text-amber-700" />
                <span className="text-sm font-light text-amber-900">{getDistance(safeIndex)}</span>
              </div>
              <div className="w-px h-4 bg-amber-300" />
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-700" />
                <span className="text-sm font-light text-amber-900">2 min walk</span>
              </div>
              <div className="w-px h-4 bg-amber-300" />
              <span className="text-xs font-light text-amber-700">Story + Task</span>
            </div>
          </div>

          <button
            onClick={onStartNavigation}
            disabled={safeIndex >= storyPoints.length}
            className="w-full bg-gradient-to-r from-stone-800 to-stone-700 text-white py-4 rounded-full font-light text-base tracking-wide shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Navigation className="w-5 h-5" />
            {safeIndex >= storyPoints.length ? 'Journey Complete' : `Start Point ${Math.min(safeIndex + 1, storyPoints.length)}`}
          </button>

          <div className="mt-5 pt-5 border-t border-stone-200">
            <h4 className="text-xs font-light text-stone-500 mb-3 uppercase tracking-wide">All Story Points</h4>
            <div className="space-y-2">
              {storyPoints.map((point, index) => {
                const isCompleted = index < completedCount;
                const isCurrent = index === currentStoryPointIndex;

                return (
                  <div
                    key={point.id}
                    className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${
                      isCurrent
                        ? 'bg-orange-50 border border-orange-200'
                        : isCompleted
                        ? 'bg-emerald-50 border border-emerald-200'
                        : 'bg-stone-50 border border-stone-200'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-light flex-shrink-0 ${
                        isCurrent
                          ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white'
                          : isCompleted
                          ? 'bg-emerald-500 text-white'
                          : 'bg-stone-300 text-stone-600'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-light truncate ${
                          isCurrent ? 'text-stone-800' : isCompleted ? 'text-emerald-800' : 'text-stone-600'
                        }`}
                      >
                        {point.title}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-light ${
                        isCompleted ? 'text-emerald-600' : isCurrent ? 'text-orange-600' : 'text-stone-500'
                      }`}
                    >
                      {isCompleted ? 'Done' : isCurrent ? 'Now' : 'Locked'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
