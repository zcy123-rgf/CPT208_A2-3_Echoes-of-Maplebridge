import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Navigation, MapPin, Clock, Footprints, LocateFixed, ExternalLink } from 'lucide-react';
import {
  STORY_POINT_COORDINATES,
  STORY_POINT_FALLBACK_DISTANCES,
  estimateWalkingMinutes,
  formatDistance,
  haversineDistanceMeters,
  parseDistanceTextToMeters,
} from '../lib/location';

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

const FALLBACK_DESCRIPTIONS = [
  'Where the ancient waterway bends through history',
  'A crossing once defined by regulation and nightfall',
  'Trade, streets, and everyday life along the canal',
  'The poem that turned this place into cultural memory',
];

const MAP_POINT_MARKERS = [
  { x: 195, y: 350 },
  { x: 210, y: 280 },
  { x: 195, y: 200 },
  { x: 180, y: 140 },
];

const USER_MARKER = { x: 195, y: 480 };

function amapMarkerUrl(destination: { lng: number; lat: number; name: string }) {
  return `https://uri.amap.com/marker?position=${destination.lng},${destination.lat}&name=${encodeURIComponent(destination.name)}&src=echoes-maplebridge&coordinate=gaode&callnative=0`;
}

function amapNavigationUrl(
  destination: { lng: number; lat: number; name: string },
  origin?: { lng: number; lat: number } | null
) {
  const to = encodeURIComponent(`${destination.lng},${destination.lat},${destination.name}`);
  if (origin) {
    const from = encodeURIComponent(`${origin.lng},${origin.lat},Visitor Location`);
    return `https://uri.amap.com/navigation?from=${from}&to=${to}&mode=walk&src=echoes-maplebridge&coordinate=gaode&callnative=0`;
  }
  return amapMarkerUrl(destination);
}

function StaticNavigationView({
  destination,
  distance,
  estimatedMinutes,
  origin,
  onClose,
  onStartStory,
}: {
  destination: { lng: number; lat: number; name: string };
  distance: string;
  estimatedMinutes: number;
  origin?: { lng: number; lat: number } | null;
  onClose: () => void;
  onStartStory: () => void;
}) {
  const externalUrl = useMemo(() => amapNavigationUrl(destination, origin), [destination, origin]);

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-stone-950 text-white">
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(251,191,36,0.22),transparent_34%),linear-gradient(180deg,#4b3c30_0%,#292524_42%,#111111_100%)]">
          <svg className="absolute inset-0 h-full w-full opacity-90" viewBox="0 0 390 844" fill="none">
            <path
              d="M 88 690 C 118 614, 100 536, 170 492 C 232 453, 208 364, 278 296"
              stroke="#fde68a"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="18 18"
              opacity="0.85"
            />
            <path
              d="M 88 690 C 118 614, 100 536, 170 492 C 232 453, 208 364, 278 296"
              stroke="#f97316"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.65"
            />
            <circle cx="88" cy="690" r="18" fill="#fb923c" opacity="0.22" />
            <circle cx="88" cy="690" r="8" fill="#fb923c" />
            <circle cx="278" cy="296" r="22" fill="#fde68a" opacity="0.2" />
            <circle cx="278" cy="296" r="10" fill="#fde68a" />
          </svg>

          <div className="absolute left-9 top-[17rem] rounded-full border border-amber-200/25 bg-black/28 px-3 py-1.5 backdrop-blur-md">
            <p className="text-xs font-light text-amber-100">Start: Visitor Location</p>
          </div>
          <div className="absolute right-7 top-[12.5rem] max-w-[10rem] rounded-2xl border border-amber-200/28 bg-black/30 px-3 py-2 backdrop-blur-md">
            <p className="text-[11px] uppercase tracking-[0.16em] text-amber-100/80">Destination</p>
            <p className="mt-1 text-sm font-light leading-5 text-white">{destination.name}</p>
          </div>
          <div className="absolute left-1/2 top-[24.5rem] -translate-x-1/2">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-200/35 bg-black/30 backdrop-blur-md">
              <Navigation className="h-8 w-8 text-amber-200" />
            </div>
          </div>
        </div>

        <div className="absolute left-0 right-0 top-0 z-10 px-5 pt-14">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-4 py-3 backdrop-blur-md"
            >
              <ArrowLeft className="h-4 w-4 text-white" />
              <span className="text-xs font-light text-white">Back</span>
            </button>
            <div className="rounded-full border border-amber-200/20 bg-black/35 px-3.5 py-2 backdrop-blur-md shadow-lg">
              <span className="text-[11px] uppercase tracking-[0.16em] text-amber-100/90">Guided Route</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 rounded-t-[2rem] border-t border-white/12 bg-white text-stone-900 shadow-2xl">
          <div className="p-5">
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-stone-300" />
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md">
                <LocateFixed className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Navigate To</p>
                <h3 className="mt-1 text-lg font-light leading-snug text-stone-900">{destination.name}</h3>
                <p className="mt-1 text-sm font-light text-stone-500">
                  Follow the highlighted walking route to the next story point.
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                <p className="text-xs font-light text-amber-700">Distance</p>
                <p className="mt-1 text-lg font-light text-amber-950">{distance}</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                <p className="text-xs font-light text-amber-700">Time</p>
                <p className="mt-1 text-lg font-light text-amber-950">{estimatedMinutes} min walk</p>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-light leading-5 text-stone-600">
              Walk along the canal path, keep the bridge on your right, and stop when the story marker appears.
            </div>

            <div className="mt-4 flex gap-2">
              <a
                href={externalUrl}
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-stone-300 bg-white py-3 text-sm font-light text-stone-800"
              >
                <ExternalLink className="h-4 w-4" />
                Open in AMap
              </a>
              <button
                onClick={onStartStory}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-stone-900 py-3 text-sm font-light text-white"
              >
                Start Story
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MapNavigationScreen({
  onBack,
  onStartNavigation,
  storyPoints,
  currentStoryPointIndex,
  completedCount,
}: MapNavigationScreenProps) {
  const sheetDragStartYRef = useRef<number | null>(null);
  const sheetPointerIdRef = useRef<number | null>(null);
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<'compact' | 'expanded'>('compact');
  const [origin, setOrigin] = useState<{ lng: number; lat: number } | null>(null);
  const safeIndex = Math.min(currentStoryPointIndex, Math.max(storyPoints.length - 1, 0));
  const nextPoint = storyPoints[safeIndex];
  const destination = STORY_POINT_COORDINATES[safeIndex] ?? STORY_POINT_COORDINATES[0];
  const currentMapMarker = MAP_POINT_MARKERS[safeIndex] ?? MAP_POINT_MARKERS[0];

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setOrigin({
          lng: position.coords.longitude,
          lat: position.coords.latitude,
        });
      },
      () => {
        setOrigin(null);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30_000,
        timeout: 10_000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const getDistance = (index: number) => {
    if (origin) {
      const point = STORY_POINT_COORDINATES[index] ?? STORY_POINT_COORDINATES[0];
      return formatDistance(haversineDistanceMeters(origin, point));
    }
    return storyPoints[index]?.distance ?? STORY_POINT_FALLBACK_DISTANCES[index] ?? '120m';
  };

  const getEstimatedMinutes = (index: number) => {
    if (origin) {
      const point = STORY_POINT_COORDINATES[index] ?? STORY_POINT_COORDINATES[0];
      return estimateWalkingMinutes(haversineDistanceMeters(origin, point));
    }

    const fallbackDistanceText = storyPoints[index]?.distance ?? STORY_POINT_FALLBACK_DISTANCES[index] ?? '120m';
    return estimateWalkingMinutes(parseDistanceTextToMeters(fallbackDistanceText));
  };

  const getDescription = (index: number) => {
    return storyPoints[index]?.description ?? FALLBACK_DESCRIPTIONS[index] ?? 'Explore the next story point.';
  };

  const openNavigation = () => {
    setIsNavigationOpen(true);
  };

  const toggleSheetMode = () => {
    setSheetMode((current) => (current === 'compact' ? 'expanded' : 'compact'));
  };

  const handleSheetDragStart = (event: React.PointerEvent<HTMLButtonElement>) => {
    sheetDragStartYRef.current = event.clientY;
    sheetPointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleSheetDragEnd = (event: React.PointerEvent<HTMLButtonElement>) => {
    const startY = sheetDragStartYRef.current;
    sheetDragStartYRef.current = null;
    if (sheetPointerIdRef.current !== event.pointerId) {
      return;
    }
    sheetPointerIdRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (startY === null) {
      return;
    }

    const deltaY = event.clientY - startY;
    if (deltaY < -28) {
      setSheetMode('expanded');
      return;
    }

    if (deltaY > 28) {
      setSheetMode('compact');
      return;
    }

    toggleSheetMode();
  };

  return (
    <div className="h-full flex flex-col relative bg-stone-100">
      {isNavigationOpen && (
        <StaticNavigationView
          destination={destination}
          distance={getDistance(safeIndex)}
          estimatedMinutes={getEstimatedMinutes(safeIndex)}
          origin={origin}
          onClose={() => setIsNavigationOpen(false)}
          onStartStory={onStartNavigation}
        />
      )}

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
              const point = MAP_POINT_MARKERS[index];
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

            <circle cx={USER_MARKER.x} cy={USER_MARKER.y} r="28" fill="#3B82F6" opacity="0.15">
              <animate attributeName="r" from="28" to="36" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.15" to="0" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx={USER_MARKER.x} cy={USER_MARKER.y} r="18" fill="#3B82F6" />
            <circle cx={USER_MARKER.x} cy={USER_MARKER.y} r="6" fill="white" />
          </svg>

          <div
            className="absolute"
            style={{
              top: `${USER_MARKER.y - 14}px`,
              left: `${USER_MARKER.x + 38}px`,
            }}
          >
            <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md border border-stone-200">
              <p className="text-xs font-light text-stone-700">You</p>
            </div>
          </div>

          <div
            className="absolute"
            style={{
              top: `${currentMapMarker.y - 12}px`,
              left: `${currentMapMarker.x + 38}px`,
            }}
          >
            <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
              <p className="text-xs font-light text-stone-600">Point {safeIndex + 1}</p>
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

            <button
              onClick={openNavigation}
              className="w-11 h-11 rounded-full bg-white/95 backdrop-blur-sm shadow-lg flex items-center justify-center border border-stone-200/50 hover:bg-white transition-colors"
            >
              <Navigation className="w-5 h-5 text-stone-700" />
            </button>
          </div>
        </div>

      </div>

      <div
        className={`bg-white rounded-t-[2rem] shadow-2xl border-t border-stone-200/50 overflow-hidden transition-[height] duration-300 ease-out ${
          sheetMode === 'expanded' ? 'h-[62%]' : 'h-[38%]'
        }`}
      >
        <div className="h-full overflow-y-auto p-6">
          <button
            type="button"
            onClick={toggleSheetMode}
            onPointerDown={handleSheetDragStart}
            onPointerUp={handleSheetDragEnd}
            className="mx-auto mb-5 flex h-5 w-24 items-center justify-center touch-none"
            aria-label={sheetMode === 'expanded' ? 'Collapse story points panel' : 'Expand story points panel'}
          >
            <span className="h-1 w-12 rounded-full bg-stone-300 transition-colors hover:bg-stone-400" />
          </button>

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
                <span className="text-sm font-light text-amber-900">{getEstimatedMinutes(safeIndex)} min walk</span>
              </div>
              <div className="w-px h-4 bg-amber-300" />
              <span className="text-xs font-light text-amber-700">Story + Task</span>
            </div>
          </div>

          <button
            onClick={openNavigation}
            disabled={safeIndex >= storyPoints.length}
            className="w-full bg-gradient-to-r from-stone-800 to-stone-700 text-white py-4 rounded-full font-light text-base tracking-wide shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Navigation className="w-5 h-5" />
            {safeIndex >= storyPoints.length ? 'Journey Complete' : 'Preview Route'}
          </button>

          <button
            onClick={onStartNavigation}
            disabled={safeIndex >= storyPoints.length}
            className="mt-3 w-full rounded-full border border-stone-300 bg-white py-3.5 font-light text-sm text-stone-800 disabled:opacity-50"
          >
            {safeIndex >= storyPoints.length ? 'No More Story Points' : `Start Point ${Math.min(safeIndex + 1, storyPoints.length)}`}
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
