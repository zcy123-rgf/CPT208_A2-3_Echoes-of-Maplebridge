import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Camera, CheckCircle2, Cuboid, LoaderCircle, Mic, Move, Orbit, ScanSearch, Volume2 } from 'lucide-react';
import { askZhangJi, isDoubaoConfigured } from '../lib/doubaoGuide';
import zhangjiReference from '../assets/zhangji-reference.webp';
import zhangJiModelUrl from '../assets/models/zhangji-front.glb';

interface ARPlacementScreenProps {
  onBack: () => void;
  onPlaced: () => void;
}

type ModelAnimationState = 'idle' | 'speaking' | 'bow';
type VoiceStatus = 'idle' | 'listening' | 'thinking' | 'replying' | 'error';
const ModelViewer = 'model-viewer' as any;
const DIALOG_PANEL_MAX_WIDTH = 260;
const CONTROL_PANEL_MAX_WIDTH = 320;
const VOICE_PANEL_MAX_WIDTH = 300;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function panelWidth(screenWidth: number, maxWidth: number, sideSpace: number) {
  return Math.min(Math.max(screenWidth - sideSpace, 260), maxWidth);
}

export function ARPlacementScreen({ onBack, onPlaced }: ARPlacementScreenProps) {
  const screenRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const modelViewerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const dialogDragOffsetRef = useRef({ x: 0, y: 0 });
  const controlsDragOffsetRef = useRef({ x: 0, y: 0 });
  const voicePanelDragOffsetRef = useRef({ x: 0, y: 0 });
  const [cameraReady, setCameraReady] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [scanProgress, setScanProgress] = useState(8);
  const [planeDetected, setPlaneDetected] = useState(false);
  const [modelPlaced, setModelPlaced] = useState(false);
  const [placementPoint, setPlacementPoint] = useState({ x: 50, y: 72 });
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [flashVisible, setFlashVisible] = useState(false);
  const [captureComplete, setCaptureComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animationState, setAnimationState] = useState<ModelAnimationState>('idle');
  const [showEntranceLine, setShowEntranceLine] = useState(false);
  const [modelViewerReady, setModelViewerReady] = useState(false);
  const [availableAnimations, setAvailableAnimations] = useState<string[]>([]);
  const [dialogPosition, setDialogPosition] = useState({ x: 64, y: 138 });
  const [isDraggingDialog, setIsDraggingDialog] = useState(false);
  const [controlsPosition, setControlsPosition] = useState({ x: 36, y: 560 });
  const [isDraggingControls, setIsDraggingControls] = useState(false);
  const [voicePanelPosition, setVoicePanelPosition] = useState({ x: 44, y: 422 });
  const [isDraggingVoicePanel, setIsDraggingVoicePanel] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [aiResponseSource, setAiResponseSource] = useState<'doubao' | 'local'>(
    isDoubaoConfigured() ? 'doubao' : 'local'
  );
  const [voiceError, setVoiceError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setPermissionDenied(true);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        setCameraReady(true);
      } catch {
        setPermissionDenied(true);
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort?.();
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    if (customElements.get('model-viewer')) {
      setModelViewerReady(true);
      return;
    }

    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
    script.onload = () => setModelViewerReady(true);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  useEffect(() => {
    if (!cameraReady) return;

    const interval = window.setInterval(() => {
      setScanProgress((prev) => {
        const next = Math.min(prev + 6, 100);
        if (next >= 72) {
          setPlaneDetected(true);
        }
        return next;
      });
    }, 320);

    return () => window.clearInterval(interval);
  }, [cameraReady]);

  useEffect(() => {
    if (!modelViewerReady || !modelPlaced || !modelViewerRef.current) return;

    const viewer = modelViewerRef.current;
    const handleLoad = () => {
      const animations = Array.isArray(viewer.availableAnimations) ? viewer.availableAnimations : [];
      setAvailableAnimations(animations);
    };

    viewer.addEventListener('load', handleLoad);
    handleLoad();

    return () => {
      viewer.removeEventListener('load', handleLoad);
    };
  }, [modelPlaced, modelViewerReady]);

  useEffect(() => {
    if (!isDraggingDialog) return;

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = screenRef.current?.getBoundingClientRect();
      const screenWidth = bounds?.width ?? window.innerWidth;
      const screenHeight = bounds?.height ?? window.innerHeight;
      const width = panelWidth(screenWidth, DIALOG_PANEL_MAX_WIDTH, 144);
      const height = 152;
      const maxX = screenWidth - width - 12;
      const maxY = screenHeight - height - 16;
      const localX = event.clientX - (bounds?.left ?? 0);
      const localY = event.clientY - (bounds?.top ?? 0);
      const nextX = clamp(localX - dialogDragOffsetRef.current.x, 12, maxX);
      const nextY = clamp(localY - dialogDragOffsetRef.current.y, 72, maxY);
      setDialogPosition({ x: nextX, y: nextY });
    };

    const handlePointerUp = () => {
      setIsDraggingDialog(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDraggingDialog]);

  useEffect(() => {
    if (!isDraggingControls) return;

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = screenRef.current?.getBoundingClientRect();
      const screenWidth = bounds?.width ?? window.innerWidth;
      const screenHeight = bounds?.height ?? window.innerHeight;
      const width = panelWidth(screenWidth, CONTROL_PANEL_MAX_WIDTH, 72);
      const height = modelPlaced ? 250 : 190;
      const localX = event.clientX - (bounds?.left ?? 0);
      const localY = event.clientY - (bounds?.top ?? 0);
      const nextX = clamp(localX - controlsDragOffsetRef.current.x, 12, screenWidth - width - 12);
      const nextY = clamp(localY - controlsDragOffsetRef.current.y, 96, screenHeight - height - 16);
      setControlsPosition({ x: nextX, y: nextY });
    };

    const handlePointerUp = () => {
      setIsDraggingControls(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDraggingControls, modelPlaced]);

  useEffect(() => {
    if (!isDraggingVoicePanel) return;

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = screenRef.current?.getBoundingClientRect();
      const screenWidth = bounds?.width ?? window.innerWidth;
      const screenHeight = bounds?.height ?? window.innerHeight;
      const width = panelWidth(screenWidth, VOICE_PANEL_MAX_WIDTH, 96);
      const height = 140;
      const localX = event.clientX - (bounds?.left ?? 0);
      const localY = event.clientY - (bounds?.top ?? 0);
      const nextX = clamp(localX - voicePanelDragOffsetRef.current.x, 12, screenWidth - width - 12);
      const nextY = clamp(localY - voicePanelDragOffsetRef.current.y, 96, screenHeight - height - 16);
      setVoicePanelPosition({ x: nextX, y: nextY });
    };

    const handlePointerUp = () => {
      setIsDraggingVoicePanel(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDraggingVoicePanel]);

  useEffect(() => {
    const keepPanelsVisible = () => {
      const bounds = screenRef.current?.getBoundingClientRect();
      const screenWidth = bounds?.width ?? window.innerWidth;
      const screenHeight = bounds?.height ?? window.innerHeight;
      const dialogWidth = panelWidth(screenWidth, DIALOG_PANEL_MAX_WIDTH, 144);
      const controlWidth = panelWidth(screenWidth, CONTROL_PANEL_MAX_WIDTH, 72);
      const voiceWidth = panelWidth(screenWidth, VOICE_PANEL_MAX_WIDTH, 96);

      setDialogPosition((position) => ({
        x: clamp(position.x, 12, screenWidth - dialogWidth - 12),
        y: clamp(position.y, 72, screenHeight - 152 - 16),
      }));
      setControlsPosition((position) => ({
        x: clamp(position.x, 12, screenWidth - controlWidth - 12),
        y: clamp(position.y, 96, screenHeight - (modelPlaced ? 250 : 190) - 16),
      }));
      setVoicePanelPosition((position) => ({
        x: clamp(position.x, 12, screenWidth - voiceWidth - 12),
        y: clamp(position.y, 96, screenHeight - 140 - 16),
      }));
    };

    keepPanelsVisible();
    window.addEventListener('resize', keepPanelsVisible);

    return () => {
      window.removeEventListener('resize', keepPanelsVisible);
    };
  }, [modelPlaced]);

  const scanStatus = useMemo(() => {
    if (permissionDenied) {
      return 'Camera unavailable';
    }
    if (modelPlaced) {
      return 'Model placed';
    }
    if (planeDetected) {
      return 'Surface found';
    }
    return 'Scanning floor';
  }, [modelPlaced, permissionDenied, planeDetected]);

  const handlePlaneTap = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setPlacementPoint({
      x: Math.min(Math.max(x, 18), 82),
      y: Math.min(Math.max(y, 18), 82),
    });
    setShowEntranceLine(false);
    setModelPlaced(true);
    window.setTimeout(() => {
      triggerAnimationState('bow');
      setShowEntranceLine(true);
    }, 1100);
  };

  const handleCapture = () => {
    if (!modelPlaced || isSubmitting) return;

    setIsSubmitting(true);
    setFlashVisible(true);
    window.setTimeout(() => setFlashVisible(false), 220);
    window.setTimeout(() => setCaptureComplete(true), 420);
    window.setTimeout(() => {
      onPlaced();
    }, 1350);
  };

  const triggerAnimationState = (state: ModelAnimationState, options?: { autoReset?: boolean }) => {
    setAnimationState(state);

    if (state !== 'idle' && options?.autoReset !== false) {
      window.setTimeout(() => {
        setAnimationState('idle');
      }, 2400);
    }
  };

  const speakGuideReply = (text: string) => {
    if (!window.speechSynthesis || !text) {
      setVoiceStatus('idle');
      triggerAnimationState('idle', { autoReset: false });
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = /[\u4e00-\u9fff]/.test(text) ? 'zh-CN' : 'en-US';
    utterance.rate = 0.92;
    utterance.pitch = 0.82;
    utterance.onend = () => {
      setVoiceStatus('idle');
      triggerAnimationState('idle', { autoReset: false });
    };
    utterance.onerror = () => {
      setVoiceStatus('idle');
      triggerAnimationState('idle', { autoReset: false });
    };
    window.speechSynthesis.speak(utterance);
  };

  const askGuide = async (question: string) => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    setActiveQuestion(trimmedQuestion);
    setVoiceTranscript(trimmedQuestion);
    setAiReply('');
    setVoiceError(null);
    setShowEntranceLine(false);
    setVoiceStatus('thinking');
    triggerAnimationState('speaking', { autoReset: false });

    try {
      const result = await askZhangJi(trimmedQuestion);
      setAiReply(result.answer);
      setAiResponseSource(result.source);
      setVoiceStatus('replying');
      speakGuideReply(result.answer);
    } catch {
      const fallback = '豆包暂时没有连上。我先以张继的本地角色回答：请听枫桥水声与寒山钟声，它们会把这一夜带回你身边。';
      setAiReply(fallback);
      setAiResponseSource('local');
      setVoiceStatus('replying');
      speakGuideReply(fallback);
    }
  };

  const handleVoiceButtonClick = () => {
    if (voiceStatus === 'thinking' || voiceStatus === 'replying') return;

    if (voiceStatus === 'listening') {
      recognitionRef.current?.stop?.();
      return;
    }

    const SpeechRecognitionConstructor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      setVoiceStatus('error');
      setVoiceError('This browser does not support speech recognition. Try Chrome or Edge, or use the preset questions.');
      return;
    }

    const recognition = new SpeechRecognitionConstructor();
    recognitionRef.current = recognition;
    let handledError = false;
    let latestTranscript = '';
    let finalTranscript = '';

    recognition.lang = navigator.language || 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      window.speechSynthesis?.cancel();
      setVoiceStatus('listening');
      setVoiceTranscript('');
      setAiReply('');
      setVoiceError(null);
      setActiveQuestion(null);
      triggerAnimationState('speaking', { autoReset: false });
    };

    recognition.onresult = (event: any) => {
      latestTranscript = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0]?.transcript || '';
        latestTranscript += transcript;

        if (event.results[index].isFinal) {
          finalTranscript += transcript;
        }
      }

      setVoiceTranscript(finalTranscript || latestTranscript);
    };

    recognition.onerror = () => {
      handledError = true;
      setVoiceStatus('error');
      setVoiceError('I could not hear that clearly. Please tap the mic and try again.');
      triggerAnimationState('idle', { autoReset: false });
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      if (handledError) return;

      const question = (finalTranscript || latestTranscript).trim();
      if (question) {
        void askGuide(question);
        return;
      }

      setVoiceStatus('error');
      setVoiceError('No voice was detected. Tap the mic and speak to Zhang Ji.');
      triggerAnimationState('idle', { autoReset: false });
    };

    try {
      recognition.start();
    } catch {
      setVoiceStatus('error');
      setVoiceError('The microphone is already starting. Please wait a moment and try again.');
    }
  };

  const quickReplies: Record<string, string> = {
    'Who are you?': 'I am Zhang Ji, a passing poet listening to the bell and the river night.',
    'Tell me about the poem': 'This poem gathers moonlight, bells, homesickness, and the quiet sorrow of a traveler at Maple Bridge.',
  };
  const loweredAnimations = availableAnimations.map((name) => ({ raw: name, normalized: name.toLowerCase() }));
  const animationKeywords: Record<ModelAnimationState, string[]> = {
    idle: ['idle', 'stand', 'default', 'loop'],
    speaking: ['speak', 'talk', 'chat', 'conversation'],
    bow: ['bow', 'greet', 'salute'],
  };
  const selectedAnimationName = loweredAnimations.find((item) =>
    animationKeywords[animationState].some((keyword) => item.normalized.includes(keyword))
  )?.raw;
  const modelMotionClass =
    animationState === 'speaking'
      ? 'animate-model-speaking'
      : animationState === 'bow'
        ? 'animate-model-bow'
        : 'animate-model-idle';
  const activeDialogText = aiReply || (activeQuestion
    ? quickReplies[activeQuestion] || 'I am listening. Let the question settle like moonlight on the river.'
    : showEntranceLine
      ? 'I am Zhang Ji. Greetings to you. This is Fengqiao, the place of my timeless verse.'
      : null);

  const handleDialogPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = screenRef.current?.getBoundingClientRect();
    dialogDragOffsetRef.current = {
      x: event.clientX - (bounds?.left ?? 0) - dialogPosition.x,
      y: event.clientY - (bounds?.top ?? 0) - dialogPosition.y,
    };
    setIsDraggingDialog(true);
  };

  const handleControlsPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = screenRef.current?.getBoundingClientRect();
    controlsDragOffsetRef.current = {
      x: event.clientX - (bounds?.left ?? 0) - controlsPosition.x,
      y: event.clientY - (bounds?.top ?? 0) - controlsPosition.y,
    };
    setIsDraggingControls(true);
  };

  const handleVoicePanelPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = screenRef.current?.getBoundingClientRect();
    voicePanelDragOffsetRef.current = {
      x: event.clientX - (bounds?.left ?? 0) - voicePanelPosition.x,
      y: event.clientY - (bounds?.top ?? 0) - voicePanelPosition.y,
    };
    setIsDraggingVoicePanel(true);
  };

  return (
    <div ref={screenRef} className="relative h-full overflow-hidden bg-black">
      <div className="absolute inset-0">
        {permissionDenied ? (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.2),transparent_30%),linear-gradient(180deg,#111827,#0f172a)] px-10 text-center">
            <div>
              <Camera className="mx-auto h-14 w-14 text-amber-200/90" />
              <p className="mt-5 text-lg font-light text-white">Camera access is unavailable in this browser session.</p>
              <p className="mt-3 text-sm font-light leading-6 text-white/70">
                This web build can show the AR scanning flow, but true ARKit or ARCore plane tracking would require a native mobile runtime.
              </p>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.48),rgba(15,23,42,0.08)_28%,rgba(15,23,42,0.22)_58%,rgba(15,23,42,0.68))]" />
      </div>

      {flashVisible && <div className="absolute inset-0 z-40 bg-white/90 animate-camera-flash pointer-events-none" />}

      <div className="absolute inset-0 pointer-events-none">
        {!modelPlaced && (
          <div className="absolute left-1/2 top-[12.5rem] w-[84%] -translate-x-1/2 rounded-[28px] border border-white/20 bg-black/28 px-5 py-4 text-center backdrop-blur-md">
            <p className="text-sm font-light leading-6 text-white">
              Move your phone slowly to scan the ground and find a place for Mr. Zhang to stand.
            </p>
          </div>
        )}

        <div className="absolute bottom-[13.5rem] left-1/2 h-[13rem] w-[85%] -translate-x-1/2">
          <div className="absolute inset-0 rounded-[30px] border border-amber-200/30 bg-amber-100/5" />
          {planeDetected && (
            <>
              <button
                type="button"
                onClick={handlePlaneTap}
                className="pointer-events-auto absolute inset-x-5 bottom-10 h-16 rounded-[24px] border border-amber-300/60 bg-[linear-gradient(0deg,rgba(251,191,36,0.24),rgba(255,255,255,0.05))] shadow-[0_0_35px_rgba(251,191,36,0.18)]"
              />
              <div className="absolute inset-x-5 bottom-10 h-16 rounded-[24px] opacity-70" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
              {!modelPlaced && (
                <>
                  <div className="absolute left-1/2 bottom-[4.4rem] -translate-x-1/2 rounded-full border border-emerald-300/60 bg-emerald-500/20 px-3 py-1 text-xs uppercase tracking-[0.18em] text-emerald-100">
                    Tap a detected surface
                  </div>
                  <div className="absolute left-1/2 bottom-[3.1rem] -translate-x-1/2 opacity-80">
                    <img src={zhangjiReference} alt="Zhang Ji placement preview" className="h-28 w-auto object-contain" />
                  </div>
                </>
              )}
              {modelPlaced && (
                <div
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2 animate-place-model"
                  style={{ left: `${placementPoint.x}%`, top: `${placementPoint.y}%` }}
                >
                  <div className="relative">
                    <div className="absolute left-1/2 top-[-7.8rem] h-40 w-20 -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,rgba(255,250,205,0.58),rgba(255,247,200,0.26)_38%,rgba(255,244,214,0.08)_72%,transparent)] blur-[2px] opacity-0 animate-moonbeam" />
                    <div className="absolute left-1/2 bottom-1 h-12 w-32 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(254,243,199,0.62),rgba(251,191,36,0.18)_48%,transparent_72%)] blur-lg animate-ink-spread" />
                    <div className="absolute left-1/2 bottom-0 h-16 w-36 -translate-x-1/2 rounded-full border border-stone-900/30 bg-[radial-gradient(ellipse_at_center,rgba(41,37,36,0.9),rgba(28,25,23,0.62)_46%,rgba(15,23,42,0.08)_78%,transparent)] opacity-0 animate-ink-ring" />
                    <div className="absolute inset-x-2 bottom-0 h-6 rounded-full bg-amber-300/35 blur-xl" />
                    <div className={`relative h-56 w-44 ${modelMotionClass}`}>
                      {modelViewerReady ? (
                        <ModelViewer
                          ref={modelViewerRef}
                          src={zhangJiModelUrl}
                          alt="Zhang Ji AR model"
                          autoplay
                          animation-name={selectedAnimationName || undefined}
                          exposure="1"
                          shadow-intensity="1"
                          shadow-softness="0.6"
                          camera-controls={false}
                          interaction-prompt="none"
                          disable-zoom
                          disable-pan
                          touch-action="none"
                          style={{
                            width: '100%',
                            height: '100%',
                            background: 'transparent',
                            filter: 'drop-shadow(0 14px 24px rgba(15, 23, 42, 0.34))',
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-[22px] border border-amber-200/45 bg-[linear-gradient(180deg,rgba(255,251,235,0.72),rgba(255,255,255,0.16))] backdrop-blur-md">
                          <Cuboid className="h-8 w-8 text-amber-200" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-5 left-1/2 w-max -translate-x-1/2 rounded-full border border-white/10 bg-black/42 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-white/80 backdrop-blur-md">
                      {selectedAnimationName ? `${animationState}: ${selectedAnimationName}` : `State: ${animationState}`}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-2">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border border-amber-300/35" />
            <div className="absolute inset-2 rounded-full border border-amber-300/50" />
            <div className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300/14" />
          </div>
        </div>
      </div>

      <div className="absolute left-0 right-0 top-0 z-20 px-5 pt-14">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/18 bg-black/42 backdrop-blur-md"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div className="rounded-full border border-amber-200/30 bg-black/42 px-4 py-2 backdrop-blur-md">
            <span className="text-xs uppercase tracking-[0.24em] text-amber-100">AR Scan</span>
          </div>
        </div>
      </div>

      <div className="absolute left-5 right-5 top-[5.8rem] z-20">
        <div className="flex items-center justify-between rounded-full border border-white/15 bg-black/32 px-4 py-2 backdrop-blur-md">
          <div className="flex items-center gap-2">
            {planeDetected ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <ScanSearch className="h-4 w-4 text-amber-300" />}
            <span className="text-sm font-light text-white">{scanStatus}</span>
          </div>
          <span className="text-xs font-light text-white/75">{scanProgress}%</span>
        </div>
      </div>

      {modelPlaced && activeDialogText && (
        <div
          className={`absolute z-30 rounded-[24px] border border-amber-100/28 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(41,37,36,0.76))] shadow-[0_18px_40px_rgba(15,23,42,0.32)] backdrop-blur-md ${showEntranceLine && !activeQuestion ? 'animate-greeting-rise' : ''}`}
          style={{
            left: dialogPosition.x,
            top: dialogPosition.y,
            width: `min(calc(100% - 144px), ${DIALOG_PANEL_MAX_WIDTH}px)`,
          }}
          onPointerDown={handleDialogPointerDown}
        >
          <div
            className={`flex cursor-grab items-center justify-between rounded-t-[24px] border-b border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-amber-100/85 touch-none ${isDraggingDialog ? 'cursor-grabbing' : ''}`}
          >
            <span>{aiReply ? 'AI Guide Reply' : activeQuestion ? 'Guide Reply' : 'Opening Line'}</span>
            <div className="flex items-center gap-2 text-white/65">
              <Move className="h-3.5 w-3.5" />
              <span>Drag</span>
            </div>
          </div>
          <div className="px-4 py-3">
            <p className="text-sm font-light leading-6 text-amber-50">{activeDialogText}</p>
          </div>
        </div>
      )}

      <div
        className="absolute z-20"
        style={{
          left: controlsPosition.x,
          top: controlsPosition.y,
          width: `min(calc(100% - 72px), ${CONTROL_PANEL_MAX_WIDTH}px)`,
        }}
      >
        <div className="rounded-[28px] border border-white/12 bg-black/42 p-4 backdrop-blur-xl">
          <div
            onPointerDown={handleControlsPointerDown}
            className={`mb-3 flex cursor-grab items-center justify-between rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-amber-100/80 touch-none ${isDraggingControls ? 'cursor-grabbing' : ''}`}
          >
            <span>Interaction Panel</span>
            <div className="flex items-center gap-2 text-white/60">
              <Move className="h-3.5 w-3.5" />
              <span>Drag</span>
            </div>
          </div>
          {!modelPlaced ? (
            <>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-amber-200/80">Placement</p>
                  <p className="mt-1 text-sm font-light text-white/78">
                    {planeDetected
                      ? 'Tap a highlighted surface to place the model at that point.'
                      : 'Keep scanning until a stable floor surface is highlighted.'}
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-400/18">
                  <Orbit className="h-5 w-5 text-amber-200" />
                </div>
              </div>

              <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>

              <div className={`flex w-full items-center justify-center gap-2 rounded-full py-3.5 font-light transition-all ${
                planeDetected
                  ? 'bg-white text-stone-900 shadow-[0_0_28px_rgba(251,191,36,0.22)]'
                  : 'bg-white/10 text-white/45'
              }`}>
                <Orbit className="h-4 w-4" />
                {planeDetected ? 'Tap the Surface to Place the Model' : 'Scanning for a Placeable Surface'}
              </div>
            </>
          ) : (
            <>
              <div className="mb-3 flex justify-center gap-2">
                <button
                  onClick={() => void askGuide('Who are you?')}
                  className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-light text-white/90 pointer-events-auto"
                >
                  Who are you?
                </button>
                <button
                  onClick={() => void askGuide('Tell me about the poem')}
                  className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-light text-white/90 pointer-events-auto"
                >
                  Tell me about the poem
                </button>
              </div>

              <div className="relative flex items-end justify-center min-h-[5.5rem]">
                <button
                  onClick={handleCapture}
                  className="absolute right-0 bottom-0 flex h-14 w-14 items-center justify-center rounded-full border border-amber-300/35 bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_0_24px_rgba(251,191,36,0.28)] pointer-events-auto"
                >
                  <Camera className="h-6 w-6" />
                </button>

                <button
                  onClick={handleVoiceButtonClick}
                  className={`flex h-20 w-20 items-center justify-center rounded-full border text-white backdrop-blur-md pointer-events-auto transition-all ${
                    voiceStatus === 'listening'
                      ? 'border-emerald-300/70 bg-emerald-300/20 shadow-[0_0_34px_rgba(110,231,183,0.25)] scale-105'
                      : voiceStatus === 'thinking' || voiceStatus === 'replying'
                        ? 'border-amber-300/60 bg-amber-200/20 shadow-[0_0_30px_rgba(251,191,36,0.24)] scale-105'
                        : animationState === 'speaking'
                      ? 'border-amber-300/60 bg-amber-200/20 shadow-[0_0_30px_rgba(251,191,36,0.24)] scale-105'
                      : 'border-white/20 bg-white/14 shadow-[0_0_24px_rgba(255,255,255,0.12)]'
                  }`}
                  aria-label="Talk to Zhang Ji"
                >
                  {voiceStatus === 'thinking' ? (
                    <LoaderCircle className="h-8 w-8 animate-spin" />
                  ) : voiceStatus === 'replying' ? (
                    <Volume2 className="h-8 w-8" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm font-light text-white/78">
                  {captureComplete ? 'Check-in captured. Saving your AR moment...' : 'Tap the camera button any time to complete the check-in.'}
                </p>
                {captureComplete && (
                  <div className="rounded-full border border-emerald-300/40 bg-emerald-500/18 px-3 py-1 text-xs uppercase tracking-[0.18em] text-emerald-100">
                    Saved
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {modelPlaced && (
        <div
          className="absolute z-30 rounded-[24px] border border-white/12 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(28,25,23,0.78))] shadow-[0_18px_44px_rgba(0,0,0,0.28)] backdrop-blur-xl"
          style={{
            left: voicePanelPosition.x,
            top: voicePanelPosition.y,
            width: `min(calc(100% - 96px), ${VOICE_PANEL_MAX_WIDTH}px)`,
          }}
        >
          <div
            onPointerDown={handleVoicePanelPointerDown}
            className={`flex cursor-grab items-center justify-between rounded-t-[24px] border-b border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-amber-100/82 touch-none ${isDraggingVoicePanel ? 'cursor-grabbing' : ''}`}
          >
            <span>
              {voiceStatus === 'listening'
                ? 'Listening'
                : voiceStatus === 'thinking'
                  ? 'Asking Doubao'
                  : voiceStatus === 'replying'
                    ? 'Speaking Back'
                    : 'Voice AI'}
            </span>
            <div className="flex items-center gap-2 text-white/58">
              <span>{aiResponseSource === 'doubao' ? 'Doubao API' : 'Local fallback'}</span>
              <Move className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="px-4 py-3">
            <p className="min-h-10 text-xs font-light leading-5 text-white/78">
              {voiceError ||
                aiReply ||
                voiceTranscript ||
                'Tap the mic and ask Zhang Ji about Maple Bridge, the poem, or the midnight bell.'}
            </p>
          </div>
        </div>
      )}

      {captureComplete && (
        <div className="absolute right-5 top-[7.8rem] z-30 w-36 rounded-[24px] border border-white/14 bg-black/46 p-3 shadow-2xl backdrop-blur-xl">
          <p className="text-[11px] uppercase tracking-[0.18em] text-amber-200/80">AR snapshot</p>
          <div className="mt-2 overflow-hidden rounded-2xl border border-white/12 bg-stone-900/60">
            <div className="relative h-24">
              <img src={zhangjiReference} alt="AR check-in preview" className="absolute bottom-1 left-1/2 h-20 w-auto -translate-x-1/2 object-contain" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.38))]" />
            </div>
          </div>
          <p className="mt-2 text-xs font-light leading-5 text-white/70">Your check-in with Zhang Ji is being saved.</p>
        </div>
      )}

      <style>{`
        @keyframes place-model {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.3);
          }
          60% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.06);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        .animate-place-model {
          animation: place-model 1.5s ease-out forwards;
        }
        @keyframes moonbeam {
          0% {
            opacity: 0;
            transform: translate(-50%, -24px) scaleY(0.82);
          }
          32% {
            opacity: 1;
          }
          100% {
            opacity: 0.92;
            transform: translate(-50%, 0) scaleY(1);
          }
        }
        @keyframes ink-spread {
          0% {
            opacity: 0;
            transform: translateX(-50%) scale(0.22);
            filter: blur(18px);
          }
          56% {
            opacity: 0.95;
          }
          100% {
            opacity: 0.72;
            transform: translateX(-50%) scale(1);
            filter: blur(10px);
          }
        }
        @keyframes ink-ring {
          0% {
            opacity: 0;
            transform: translateX(-50%) scale(0.3);
          }
          40% {
            opacity: 0.9;
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) scale(1);
          }
        }
        .animate-moonbeam {
          animation: moonbeam 1.25s ease-out both;
        }
        .animate-ink-spread {
          animation: ink-spread 1.15s ease-out both;
        }
        .animate-ink-ring {
          animation: ink-ring 1.2s ease-out both;
        }
        @keyframes camera-flash {
          0% { opacity: 0; }
          30% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes model-idle {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-4px) scale(1.01); }
        }
        @keyframes model-speaking {
          0%, 100% { transform: translateY(0) scale(1); }
          25% { transform: translateY(-2px) scale(1.015); }
          50% { transform: translateY(0) scale(1.02); }
          75% { transform: translateY(-1px) scale(1.012); }
        }
        @keyframes model-bow {
          0%, 100% { transform: translateY(0) rotateX(0deg) scale(1); }
          40% { transform: translateY(4px) rotateX(12deg) scale(0.98); }
          70% { transform: translateY(2px) rotateX(8deg) scale(0.99); }
        }
        .animate-camera-flash {
          animation: camera-flash 220ms ease-out forwards;
        }
        .animate-model-idle {
          animation: model-idle 3.2s ease-in-out infinite;
          transform-origin: center bottom;
        }
        .animate-model-speaking {
          animation: model-speaking 1.25s ease-in-out infinite;
          transform-origin: center bottom;
        }
        .animate-model-bow {
          animation: model-bow 1.7s ease-in-out infinite;
          transform-origin: center bottom;
        }
        @keyframes greeting-rise {
          0% {
            opacity: 0;
            transform: translate(-50%, 14px) scale(0.94);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }
        .animate-greeting-rise {
          animation: greeting-rise 0.55s ease-out both;
        }
      `}</style>
    </div>
  );
}
