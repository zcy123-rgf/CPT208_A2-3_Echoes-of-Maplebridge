import { X, Camera, MessageCircle, Sparkles, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { GuideConversation } from '../App';
import zhangjiReference from '../assets/zhangji-reference.webp';

interface ARExplorationScreenProps {
  onClose: () => void;
  onCapture: () => void;
  onRetryTask: () => void;
  onPreviousTask: () => void;
  guideName: string;
  guideRole: string;
  guideLine1: string;
  guideLine2: string;
  guideConversation: GuideConversation;
  isFullARExperience: boolean;
}

function ZhangJiFigure() {
  return (
    <div className="relative w-44 h-72 drop-shadow-[0_22px_44px_rgba(20,12,8,0.58)]">
      <div className="absolute inset-x-10 top-8 h-20 rounded-full bg-amber-300/25 blur-3xl" />
      <div className="absolute left-1/2 top-1 -translate-x-1/2 px-3 py-1 rounded-full border border-amber-200/60 bg-stone-950/70 backdrop-blur-md">
        <p className="text-[10px] uppercase tracking-[0.24em] text-amber-100">Poet</p>
      </div>
      <div className="absolute inset-x-0 bottom-0 top-8 flex items-end justify-center overflow-hidden rounded-[28px]">
        <img
          src={zhangjiReference}
          alt="Zhang Ji"
          className="h-full w-auto object-contain"
        />
      </div>
    </div>
  );
}

function GuidePortrait({ visualStyle }: { visualStyle: GuideConversation['visualStyle'] }) {
  return (
    <img
      src={zhangjiReference}
      alt="Guide portrait"
      className="h-full w-full object-contain object-center"
    />
  );
}

function GuideFigure({ visualStyle }: { visualStyle: GuideConversation['visualStyle'] }) {
  return <ZhangJiFigure />;
}

export function ARExplorationScreen({
  onClose,
  onCapture,
  onRetryTask,
  onPreviousTask,
  guideName,
  guideRole,
  guideLine1,
  guideLine2,
  guideConversation,
  isFullARExperience,
}: ARExplorationScreenProps) {
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

  useEffect(() => {
    setSelectedQuestionIndex(0);
  }, [guideName, guideConversation]);

  const activeQuestion = guideConversation.suggestedQuestions[selectedQuestionIndex] ?? guideConversation.suggestedQuestions[0];

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-stone-950">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1766953597804-893f1993b8af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodCUyMHJpdmVyJTIwdHJhZGl0aW9uYWwlMjBicmlkZ2UlMjByZWZsZWN0aW9ufGVufDF8fHx8MTc3NDgwODM2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="AR Camera View"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.15),transparent_32%),linear-gradient(180deg,rgba(12,10,9,0.28),rgba(12,10,9,0.2)_34%,rgba(12,10,9,0.62))]" />
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 right-10 animate-pulse" style={{ animationDuration: '4s' }}>
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-amber-100/15 backdrop-blur-sm border border-amber-200/30 flex items-center justify-center">
              <span className="text-3xl">🌙</span>
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
              <div className="rounded-full border border-amber-200/25 bg-black/45 px-3 py-1.5 backdrop-blur-md">
                <p className="whitespace-nowrap text-xs font-light text-amber-100">Moonset</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-8">
          <div className="rounded-full border border-white/20 bg-black/45 px-4 py-2 backdrop-blur-md">
            <p className="text-sm font-light text-white">Maple Bridge</p>
          </div>
          <div className="mx-auto h-14 w-px bg-gradient-to-b from-white/60 to-transparent" />
        </div>

        <div className="absolute bottom-48 left-8">
          <div className="rounded-full border border-sky-200/25 bg-black/45 px-3 py-1.5 backdrop-blur-md">
            <p className="text-xs font-light text-sky-100">Canal Water</p>
          </div>
        </div>

        <div className="absolute bottom-56 right-16">
          <div className="rounded-full border border-amber-200/25 bg-black/45 px-3 py-1.5 backdrop-blur-md">
            <p className="text-xs font-light text-amber-100">Night Mooring</p>
          </div>
        </div>

        <div className="absolute left-5 top-48 animate-float">
          <div className="max-w-[180px] rounded-[24px] border border-amber-200/30 bg-amber-950/35 px-4 py-3 backdrop-blur-md">
            <p className="text-sm italic leading-relaxed text-amber-50">
              Outside the city of Gusu, the temple of Cold Mountain;
            </p>
          </div>
        </div>

        <div className="absolute right-5 top-64 animate-float" style={{ animationDelay: '1.2s' }}>
          <div className="max-w-[180px] rounded-[24px] border border-white/20 bg-stone-900/38 px-4 py-3 backdrop-blur-md">
            <p className="text-sm italic leading-relaxed text-stone-50">
              Rings at midnight its bell and reaches my boat.
            </p>
          </div>
        </div>

        <svg className="absolute inset-0 h-full w-full opacity-35" viewBox="0 0 390 844">
          <path
            d="M 46 754 Q 100 656, 190 605 T 336 504"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="4 6"
            fill="none"
          />
          <circle cx="46" cy="754" r="4" fill="#f59e0b" />
          <circle cx="336" cy="504" r="4" fill="#f59e0b" />
        </svg>
      </div>

      <div className="absolute top-0 left-0 right-0 z-20 px-5 pt-14">
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/55 backdrop-blur-md transition-colors hover:bg-black/75"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      <div className="absolute left-1/2 top-[8.9rem] z-20 w-[calc(100%-2.5rem)] -translate-x-1/2 pointer-events-auto">
        <div className="rounded-[28px] border border-white/40 bg-[linear-gradient(135deg,rgba(255,249,235,0.95),rgba(248,244,237,0.92))] p-4 shadow-[0_18px_50px_rgba(15,23,42,0.25)] backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[22px] border border-amber-200/60 bg-gradient-to-br from-amber-50 to-orange-100">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.35),transparent_50%)]" />
              <GuidePortrait visualStyle={guideConversation.visualStyle} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-medium text-stone-900">{guideName}</p>
                  <p className="text-xs font-light uppercase tracking-[0.16em] text-stone-500">{guideRole}</p>
                </div>
                <div className="rounded-full border border-amber-300/60 bg-amber-100/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-amber-800">
                  AI Guide Mock
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200/50 bg-white/80 px-3.5 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-amber-700">Guide Focus</p>
                <p className="mt-1 text-sm font-light leading-6 text-stone-700">{guideConversation.intro}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            {guideConversation.suggestedQuestions.map((question, index) => {
              const isActive = index === selectedQuestionIndex;
              return (
                <button
                  key={question}
                  onClick={() => setSelectedQuestionIndex(index)}
                  className={`rounded-2xl border px-3.5 py-3 text-left transition-all ${
                    isActive
                      ? 'border-amber-300 bg-gradient-to-r from-amber-100 to-orange-50 shadow-sm'
                      : 'border-stone-200/70 bg-white/75 hover:border-amber-200 hover:bg-amber-50/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-light leading-6 text-stone-800">{question}</p>
                    <ChevronRight className={`h-4 w-4 shrink-0 ${isActive ? 'text-amber-700' : 'text-stone-400'}`} />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex justify-end">
              <div className="max-w-[82%] rounded-[22px] rounded-br-md bg-stone-900 px-4 py-3 text-sm font-light leading-6 text-white shadow-md">
                {activeQuestion}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-medium text-amber-800">
                AI
              </div>
              <div className="flex-1 rounded-[24px] rounded-tl-md border border-amber-200/60 bg-gradient-to-br from-amber-50 to-stone-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-amber-700">Sample Response</p>
                <p className="mt-1 text-sm font-light leading-6 text-stone-700">{guideConversation.sampleAnswer}</p>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-stone-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Display only for now
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-dashed border-stone-300 bg-stone-100/70 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Scene Cue</p>
            <p className="mt-1 text-sm font-light leading-6 text-stone-600">
              {guideLine1} {guideLine2}
            </p>
          </div>
        </div>
      </div>

      <div className="absolute right-1 bottom-[18.25rem] z-10 pointer-events-none animate-float-gentle">
        <GuideFigure visualStyle={guideConversation.visualStyle} />
      </div>

      <div className="absolute bottom-16 left-5 right-5 z-20 pointer-events-auto">
        <div className="rounded-[28px] border border-amber-200/35 bg-gradient-to-br from-amber-950/92 via-stone-900/94 to-stone-950/96 p-5 shadow-2xl backdrop-blur-xl">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/25">
              {isFullARExperience ? <Sparkles className="h-5 w-5 text-amber-100" /> : <Camera className="h-5 w-5 text-amber-100" />}
            </div>
            <div>
              <h4 className="font-light text-amber-50">{isFullARExperience ? 'Unlock the Echo Fragment' : 'Guide Preview'}</h4>
              <p className="text-xs font-light text-amber-200/70">
                {isFullARExperience ? 'Browse the mock AI dialogue, then continue the AR task' : 'Preview the AI interaction, then continue to the photo check-in'}
              </p>
            </div>
          </div>

          <p className="mb-4 text-sm font-light leading-relaxed text-white/90">
            {isFullARExperience
              ? 'This version focuses on display only: a richer guide persona, suggested questions, and a sample AI answer that fits the atmosphere of Maple Bridge.'
              : 'This preview shows an AI guide interaction for this story point. Visitors can choose suggested questions, read a guide response, and then continue to the photo check-in task.'}
          </p>

          <button
            onClick={onCapture}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-white py-3.5 font-light text-stone-800 shadow-lg transition-colors hover:bg-amber-50"
          >
            <Sparkles className="h-5 w-5" />
            {isFullARExperience ? 'Unlock Echo Fragment' : 'Continue to Photo Check-in'}
          </button>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                setSelectedQuestionIndex(0);
                onRetryTask();
              }}
              className="rounded-full border border-white/20 bg-white/10 py-2.5 text-sm font-light text-white transition-colors hover:bg-white/15"
            >
              Reset Chat
            </button>
            <button
              onClick={onPreviousTask}
              className="rounded-full border border-white/20 bg-white/10 py-2.5 text-sm font-light text-white transition-colors hover:bg-white/15"
            >
              Previous Task
            </button>
            <button
              onClick={onClose}
              className="rounded-full border border-white/20 bg-white/10 py-2.5 text-sm font-light text-white transition-colors hover:bg-white/15"
            >
              Back to Story
            </button>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute bottom-[14.5rem] left-1/4 right-1/4 top-1/4">
          <div className="relative h-full w-full">
            <div className="absolute left-0 top-0 h-8 w-8 border-l-2 border-t-2 border-amber-300/60" />
            <div className="absolute right-0 top-0 h-8 w-8 border-r-2 border-t-2 border-amber-300/60" />
            <div className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-amber-300/60" />
            <div className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-amber-300/60" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="h-0.5 w-6 bg-amber-300/40" />
              <div className="absolute left-1/2 top-1/2 h-6 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-amber-300/40" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 z-20 pointer-events-auto">
        <button className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-200/30 bg-gradient-to-br from-stone-800 to-stone-700 shadow-2xl transition-all hover:scale-105 hover:shadow-xl active:scale-95">
          <MessageCircle className="h-6 w-6 text-amber-100" />
        </button>
        <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-amber-500 animate-pulse" />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-gentle {
          animation: float-gentle 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
