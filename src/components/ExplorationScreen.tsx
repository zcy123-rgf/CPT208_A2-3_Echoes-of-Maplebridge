import { ArrowLeft, MapPin, Camera, Info, CheckCircle2 } from 'lucide-react';
import { Fragment } from '../App';

interface ExplorationScreenProps {
  onCompleteTask: (fragment: Fragment) => void;
}

export function ExplorationScreen({ onCompleteTask }: ExplorationScreenProps) {
  const handleComplete = () => {
    const fragment: Fragment = {
      id: '1',
      title: 'Night Mooring at Maple Bridge',
      content: 'Outside the city of Gusu, the temple of Cold Mountain; Rings at midnight its bell and reaches my boat.',
      poet: 'Zhang Ji, Tang Dynasty',
      location: 'Ancient Bell Tower'
    };
    onCompleteTask(fragment);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-stone-50 to-amber-50/30">
      {/* Header with Background */}
      <div className="relative">
        {/* Background Image */}
        <div className="h-56 relative overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1689659336446-d16d64aa3625?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmNpZW50JTIwQ2hpbmVzZSUyMHRlbXBsZSUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NzQ4MDY1NjR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Bell Tower"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-transparent"></div>
          
          {/* Status Bar & Back Button */}
          <div className="absolute top-12 left-0 right-0 px-6 flex justify-between items-center">
            <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <ArrowLeft className="w-5 h-5 text-stone-800" />
            </button>
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              <span className="text-stone-800 text-sm font-light">Story Point 1/12</span>
            </div>
          </div>
        </div>

        {/* Location Card - Overlapping */}
        <div className="absolute -bottom-16 left-6 right-6">
          <div className="bg-white rounded-3xl shadow-xl p-5 border border-stone-200/50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h2 className="text-xl font-light text-stone-800 mb-1">Ancient Bell Tower</h2>
                <div className="flex items-center gap-2 text-stone-500 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span className="font-light">Hanshan Temple Complex</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-full inline-flex">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-emerald-700 text-xs font-light">You're at the location • 0m away</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto pt-20 px-6 pb-6">
        {/* Story Card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 mb-5 border border-amber-200/50 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center">
              <span className="text-sm">📖</span>
            </div>
            <h3 className="text-stone-800 font-light">Story Fragment</h3>
          </div>
          
          <div className="space-y-4">
            <p className="text-stone-700 leading-relaxed font-light text-base">
              月落乌啼霜满天，<br />
              江枫渔火对愁眠。
            </p>
            <p className="text-stone-600 leading-relaxed font-light italic text-sm">
              Outside the city of Gusu, the temple of Cold Mountain;<br />
              Rings at midnight its bell and reaches my boat.
            </p>
            <p className="text-stone-500 text-xs font-light">
              — From "Night Mooring at Maple Bridge" by Zhang Ji
            </p>
          </div>
        </div>

        {/* Task Card */}
        <div className="bg-white rounded-3xl p-6 mb-5 shadow-sm border border-stone-200/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-stone-800 font-light text-lg">Interactive Task</h3>
            <div className="px-3 py-1 bg-blue-100 rounded-full flex items-center gap-1">
              <Camera className="w-3 h-3 text-blue-700" />
              <span className="text-blue-700 text-xs font-light">Photo</span>
            </div>
          </div>
          
          <p className="text-stone-600 text-sm leading-relaxed mb-4 font-light">
            Capture the ancient bell tower from the viewing platform. Stand still and listen — can you hear the echoes of bells that rang for over a thousand years?
          </p>

          {/* Camera Preview */}
          <div className="relative h-48 bg-gradient-to-br from-stone-200 to-stone-300 rounded-2xl overflow-hidden mb-4">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-12 h-12 text-stone-400 mx-auto mb-2" />
                <p className="text-stone-500 text-sm font-light">Camera Viewfinder</p>
              </div>
            </div>
            {/* Camera Frame Guides */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-white/60"></div>
            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-white/60"></div>
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-white/60"></div>
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-white/60"></div>
          </div>

          <button className="w-full py-3 bg-stone-100 text-stone-700 rounded-full font-light hover:bg-stone-200 transition-colors flex items-center justify-center gap-2">
            <Camera className="w-4 h-4" />
            Open Camera
          </button>
        </div>

        {/* Cultural Context */}
        <div className="bg-gradient-to-br from-stone-700 to-stone-800 rounded-3xl p-5 shadow-lg mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-amber-200" />
            <h4 className="text-amber-100 text-sm font-light">Cultural Context</h4>
          </div>
          <p className="text-white/90 text-sm leading-relaxed font-light">
            The bell at Hanshan Temple has been ringing for over 1,400 years. Zhang Ji's poem, written during the Tang Dynasty, immortalized the sound of this bell, making it one of the most famous in Chinese literary history.
          </p>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="p-6 bg-white/80 backdrop-blur-sm border-t border-stone-200/50">
        <button 
          onClick={handleComplete}
          className="w-full bg-gradient-to-r from-stone-800 to-stone-700 text-white py-4 rounded-full font-light text-base tracking-wide shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Complete Task & Unlock Fragment
        </button>
      </div>
    </div>
  );
}
