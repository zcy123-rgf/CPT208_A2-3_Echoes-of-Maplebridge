import { useState } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { CompletionScreen } from './components/CompletionScreen';
import { MapNavigationScreen } from './components/MapNavigationScreen';
import { StoryPointDetailScreen } from './components/StoryPointDetailScreen';
import { ARPlacementScreen } from './components/ARPlacementScreen';
import { ARExplorationScreen } from './components/ARExplorationScreen';
import { CommunityPhotoWallScreen } from './components/CommunityPhotoWallScreen';
import { CommunityLeaderboardScreen } from './components/CommunityLeaderboardScreen';

export type Fragment = {
  id: string;
  title: string;
  content: string;
  poet: string;
  location: string;
};

export type GuideConversation = {
  visualStyle: 'canal' | 'watchman' | 'zhangji' | 'merchant';
  intro: string;
  suggestedQuestions: string[];
  sampleAnswer: string;
};

type Screen = 'home' | 'map' | 'storyPoint' | 'arPlacement' | 'ar' | 'community' | 'completion' | 'leaderboard';

type StoryPointData = {
  id: string;
  shortTitle: string;
  title: string;
  subtitle: string;
  tag: string;
  currentView: string;
  historicalMeaning: string;
  significance: string;
  taskPrompt: string;
  taskType: 'checkin' | 'ar';
  hasGuidePreview?: boolean;
  guideName: string;
  guideRoleLabel: string;
  guideConversation: GuideConversation;
  fragment: Fragment;
};

const STORY_POINTS: StoryPointData[] = [
  {
    id: '1',
    shortTitle: 'Turning Point',
    title: 'The Turning Point of the Grand Canal',
    subtitle: 'Stand where the waterway turned toward Suzhou.',
    tag: 'Canal Route',
    currentView: 'Today, Maple Bridge feels like a scenic landmark and poetic stop along the canal.',
    historicalMeaning: 'In the past, this was a crucial turning point where the Grand Canal entered Suzhou.',
    significance: 'It mattered because movement, arrival, and the first impression of the city all converged here.',
    taskPrompt: 'Capture this turning point and add your own view to the shared community memory wall.',
    taskType: 'checkin',
    hasGuidePreview: true,
    guideName: 'Canal Wayfinder',
    guideRoleLabel: 'Canal Route',
    guideConversation: {
      visualStyle: 'canal',
      intro: 'Ask how this bend in the canal shaped arrival, direction, and the first memory of Suzhou.',
      suggestedQuestions: [
        'Why was this turning point so important?',
        'What would travelers have seen first here?',
        'How did the canal guide people into the city?',
      ],
      sampleAnswer: 'This bend worked like a threshold. Boats slowed, bearings shifted, and Suzhou announced itself through water traffic, city edges, and the feeling of entering a lived urban world.',
    },
    fragment: {
      id: '1',
      title: 'The Turning Point',
      content: 'Maple Bridge marked the turning point where the Grand Canal entered Suzhou.',
      poet: 'Canal Memory',
      location: 'Maple Bridge'
    }
  },
  {
    id: '2',
    shortTitle: 'Sealed Bridge',
    title: 'The Sealed Bridge at Night',
    subtitle: 'Before Maple Bridge became poetic, it was regulated and controlled.',
    tag: 'Bridge Control',
    currentView: 'Today, visitors see a quiet landmark and a cultural site.',
    historicalMeaning: 'In earlier times, this crossing was known as a “sealed bridge,” closed at night to keep grain transport routes clear.',
    significance: 'It reveals Maple Bridge as a place of movement control, regulation, and strategic importance.',
    taskPrompt: 'Capture this place and contribute your own moment to the shared memory wall.',
    taskType: 'checkin',
    hasGuidePreview: true,
    guideName: 'Bridge Night Watch',
    guideRoleLabel: 'Bridge Control',
    guideConversation: {
      visualStyle: 'watchman',
      intro: 'Ask how closing the bridge at night changed the rhythm of transport, control, and passage.',
      suggestedQuestions: [
        'Why was the bridge sealed at night?',
        'Who benefited from this control?',
        'What mood would the crossing have had after dark?',
      ],
      sampleAnswer: 'At night the bridge became an instrument of order. Restricting passage protected grain transport and turned an ordinary crossing into a space of regulation, waiting, and authority.',
    },
    fragment: {
      id: '2',
      title: 'The Sealed Bridge at Night',
      content: 'Long before it was known as Maple Bridge, this ancient crossing bore a different name: Sealed Bridge.',
      poet: 'Historical Record',
      location: 'Maple Bridge'
    }
  },
  {
    id: '3',
    shortTitle: 'Trade and Memory',
    title: 'Trade, Streets, and Everyday Memory',
    subtitle: 'Maple Bridge was also part of a busy commercial landscape.',
    tag: 'Trade',
    currentView: 'Today, the site is remembered for heritage and atmosphere.',
    historicalMeaning: 'Historically, the Fengqiao area connected movement, trade, and market life along the canal corridor.',
    significance: 'This third layer reveals Maple Bridge not only as poetry, but also as commerce, daily life, and urban memory.',
    taskPrompt: 'Check in with a photo to document the everyday life and trade memory connected to this place.',
    taskType: 'checkin',
    hasGuidePreview: true,
    guideName: 'Market Storyteller',
    guideRoleLabel: 'Trade Memory',
    guideConversation: {
      visualStyle: 'merchant',
      intro: 'Ask how market life, trade routes, and everyday movement gave Maple Bridge a memory beyond poetry.',
      suggestedQuestions: [
        'What kinds of trade passed through here?',
        'How did ordinary life shape this place?',
        'Why does commerce matter to the story of Maple Bridge?',
      ],
      sampleAnswer: 'Trade made the bridge ordinary and essential at once. Goods, gossip, labor, and daily crossings layered the site with human routine, turning heritage into something lived rather than merely remembered.',
    },
    fragment: {
      id: '3',
      title: 'Trade and Memory',
      content: 'Beyond poetry, Maple Bridge was part of a commercial and everyday canal landscape.',
      poet: 'Urban Memory',
      location: 'Maple Bridge'
    }
  },
  {
    id: '4',
    shortTitle: 'Night Mooring',
    title: 'Night Mooring at Maple Bridge',
    subtitle: 'Poetry transformed a checkpoint into a cultural memory.',
    tag: 'Poetry',
    currentView: 'Today, many visitors know Maple Bridge through the famous poem and its nighttime imagery.',
    historicalMeaning: 'Zhang Ji’s poem turned this location into a lasting cultural symbol tied to moonlight, bells, and riverside sorrow.',
    significance: 'This final layer shows how literary memory reshaped Maple Bridge from infrastructure into imagination.',
    taskPrompt: 'Meet the virtual guide to hear how poetry transformed Maple Bridge into cultural memory.',
    taskType: 'ar',
    hasGuidePreview: true,
    guideName: 'Zhang Ji',
    guideRoleLabel: 'Poet Guide',
    guideConversation: {
      visualStyle: 'zhangji',
      intro: 'Ask Zhang Ji about the bell, the river night, and how a passing feeling became a lasting cultural memory.',
      suggestedQuestions: [
        'Why does the midnight bell matter so much?',
        'How did this night become a poem?',
        'What emotion should visitors feel here?',
      ],
      sampleAnswer: 'The bell turns distance into memory. In the stillness of the river night, one sound travels across water and gathers moonlight, fatigue, homesickness, and the quiet dignity of arrival.',
    },
    fragment: {
      id: '4',
      title: 'Night Mooring at Maple Bridge',
      content: 'Outside the city of Gusu, the temple of Cold Mountain; Rings at midnight its bell and reaches my boat.',
      poet: 'Zhang Ji, Tang Dynasty',
      location: 'Maple Bridge'
    }
  }
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [collectedFragments, setCollectedFragments] = useState<Fragment[]>([]);
  const [currentStoryPointIndex, setCurrentStoryPointIndex] = useState(0);

  const currentStoryPoint = STORY_POINTS[Math.min(currentStoryPointIndex, STORY_POINTS.length - 1)];
  const completedCount = collectedFragments.length;

  const handleStartExploration = () => {
    setCurrentScreen('map');
  };

  const handleStartNavigation = () => {
    setCurrentScreen('storyPoint');
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
  };

  const handleBackToMap = () => {
    setCurrentScreen('map');
  };

  const handleCheckIn = () => {
    setCurrentScreen('community');
  };

  const handleOpenAR = () => {
    setCurrentScreen(currentStoryPoint.taskType === 'ar' ? 'arPlacement' : 'ar');
  };

  const handleCompleteARPlacement = () => {
    if (currentStoryPoint.taskType === 'ar') {
      addFragmentAndAdvance(currentStoryPoint.fragment);
      return;
    }

    setCurrentScreen('ar');
  };

  const handleCloseAR = () => {
    setCurrentScreen('storyPoint');
  };

  const addFragmentAndAdvance = (fragment: Fragment) => {
    setCollectedFragments((prev) => {
      const exists = prev.some((item) => item.id === fragment.id);
      return exists ? prev : [...prev, fragment];
    });

    setCurrentStoryPointIndex((prev) => {
      const nextIndex = prev + 1;
      return nextIndex > 3 ? 3 : nextIndex;
    });

    setCurrentScreen('completion');
  };

  const handleCaptureAR = () => {
    if (currentStoryPoint.taskType === 'ar') {
      addFragmentAndAdvance(currentStoryPoint.fragment);
      return;
    }

    setCurrentScreen('community');
  };

  const handleOpenCommunity = () => {
    setCurrentScreen('community');
  };

  const handleUploadPhoto = () => {
    addFragmentAndAdvance(currentStoryPoint.fragment);
  };

  const handleCompleteTask = (fragment: Fragment) => {
    addFragmentAndAdvance(fragment);
  };

  const handleContinueExploring = () => {
    setCurrentScreen('map');
  };

  const handleOpenLeaderboard = () => {
    setCurrentScreen('leaderboard');
  };

  const handleBackToCompletion = () => {
    setCurrentScreen('completion');
  };

  const handleBackToStoryPointFallback = () => {
    setCurrentScreen('storyPoint');
  };

  const handleRetryTask = () => {
    setCurrentScreen(currentStoryPoint.taskType === 'ar' ? 'ar' : 'community');
  };

  const handlePreviousTask = () => {
    setCurrentStoryPointIndex((prev) => (prev > 0 ? prev - 1 : 0));
    setCurrentScreen('storyPoint');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50 to-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-[390px] h-[844px] bg-white shadow-2xl rounded-[3rem] overflow-hidden relative">
        {/* iPhone notch simulation */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-50"></div>
        
        <div className="h-full overflow-hidden">
          {currentScreen === 'home' && (
            <HomeScreen 
              onStartExploration={handleStartExploration}
              fragmentsCollected={collectedFragments.length}
              totalStoryPoints={STORY_POINTS.length}
            />
          )}
          {currentScreen === 'map' && (
            <MapNavigationScreen 
              onBack={handleBackToHome}
              onStartNavigation={handleStartNavigation}
              storyPoints={STORY_POINTS}
              currentStoryPointIndex={currentStoryPointIndex}
              completedCount={completedCount}
            />
          )}
          {currentScreen === 'storyPoint' && (
            <StoryPointDetailScreen
              onBack={handleBackToMap}
              onCheckIn={handleCheckIn}
              onOpenAR={handleOpenAR}
              onRetryTask={handleRetryTask}
              onPreviousTask={handlePreviousTask}
              storyPointIndex={Math.min(currentStoryPointIndex, 3)}
              totalStoryPoints={4}
              storyPoint={currentStoryPoint}
              journeyPoints={STORY_POINTS.map((point) => ({ id: point.id, title: point.title }))}
              hasGuidePreview={Boolean(currentStoryPoint.hasGuidePreview)}
            />
          )}
          {currentScreen === 'ar' && (
            <ARExplorationScreen
              onClose={handleCloseAR}
              onCapture={handleCaptureAR}
              onRetryTask={handleRetryTask}
              onPreviousTask={handlePreviousTask}
              guideName={currentStoryPoint.guideName}
              guideRole={currentStoryPoint.guideRoleLabel}
              guideLine1={currentStoryPoint.subtitle}
              guideLine2={currentStoryPoint.historicalMeaning}
              guideConversation={currentStoryPoint.guideConversation}
              isFullARExperience={currentStoryPoint.taskType === 'ar'}
            />
          )}
          {currentScreen === 'arPlacement' && (
            <ARPlacementScreen
              onBack={handleCloseAR}
              onPlaced={handleCompleteARPlacement}
            />
          )}
          {currentScreen === 'community' && (
            <CommunityPhotoWallScreen
              onBack={handleBackToStoryPointFallback}
              onUpload={handleUploadPhoto}
            />
          )}
          {currentScreen === 'completion' && (
            <CompletionScreen 
              fragments={collectedFragments}
              onBackToHome={handleBackToHome}
              onContinueExploring={handleContinueExploring}
              onViewLeaderboard={handleOpenLeaderboard}
              completedCount={completedCount}
              totalCount={STORY_POINTS.length}
            />
          )}
          {currentScreen === 'leaderboard' && (
            <CommunityLeaderboardScreen
              onBack={handleBackToCompletion}
              onBackHome={handleBackToHome}
            />
          )}
        </div>
      </div>
    </div>
  );
}
