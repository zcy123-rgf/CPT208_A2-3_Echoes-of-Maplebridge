import { MapPin, Sparkles, BookOpen, Clock } from 'lucide-react';

interface HomeScreenProps {
  onStartExploration: () => void;
  fragmentsCollected: number;
  totalStoryPoints?: number;
}

export function HomeScreen({ onStartExploration, fragmentsCollected, totalStoryPoints = 4 }: HomeScreenProps) {
  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-stone-50 to-amber-50/30">
      {/* Hero Section with Image */}
      <div className="relative h-[45%] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1773735968639-cfc5494254a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDaGluZXNlJTIwdHJhZGl0aW9uYWwlMjBicmlkZ2UlMjB3YXRlciUyMHJlZmxlY3Rpb258ZW58MXx8fHwxNzc0ODA2NTY0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Maple Bridge"
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-stone-50"></div>
        </div>

        {/* Status Bar */}
        <div className="relative pt-12 px-6 flex justify-between items-center text-white text-sm">
          <span>9:41</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded-full bg-white/30"></div>
            <div className="w-4 h-4 rounded-full bg-white/30"></div>
            <div className="w-4 h-4 rounded-full bg-white/60"></div>
          </div>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-amber-200" />
            <span className="text-amber-100 text-sm font-light tracking-wide">Suzhou, China</span>
          </div>
          <h1 className="text-4xl font-light text-white mb-1 tracking-wide">
            Maple Bridge
          </h1>
          <h2 className="text-2xl font-light text-white/90 tracking-wide">
            Echoes of Maplebridge
          </h2>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 px-6 pt-8 pb-6 flex flex-col">
        {/* Introduction */}
        <div className="mb-6">
          <p className="text-stone-700 text-base leading-relaxed font-light">
            Journey through time at Maple Bridge, where ancient poetry meets living culture. 
            Explore historic sites, unlock poetic fragments, and collect memories of this timeless place.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200/50">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-2">
              <BookOpen className="w-5 h-5 text-amber-700" />
            </div>
            <p className="text-xs text-stone-600 font-light">{totalStoryPoints} Story Points</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200/50">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-blue-700" />
            </div>
            <p className="text-xs text-stone-600 font-light">1-2 Hours</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200/50">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
              <Sparkles className="w-5 h-5 text-emerald-700" />
            </div>
            <p className="text-xs text-stone-600 font-light">Interactive</p>
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-gradient-to-br from-stone-800 to-stone-700 rounded-3xl p-6 mb-6 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-amber-100 text-sm font-light mb-1">Your Progress</p>
              <p className="text-white text-2xl font-light">{fragmentsCollected}<span className="text-white/60 text-lg">/{totalStoryPoints}</span></p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-2xl">📜</span>
            </div>
          </div>
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-amber-200 transition-all duration-500"
              style={{ width: `${(fragmentsCollected / totalStoryPoints) * 100}%` }}
            ></div>
          </div>
          <p className="text-white/70 text-xs mt-3 font-light">
            {fragmentsCollected === 0 ? 'Begin your journey to unlock story fragments' : `${Math.max(totalStoryPoints - fragmentsCollected, 0)} fragments remaining`}
          </p>
        </div>

        {/* CTA Button */}
        <button 
          onClick={onStartExploration}
          className="w-full bg-gradient-to-r from-stone-800 to-stone-700 text-white py-4 rounded-full font-light text-lg tracking-wide shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Start Exploration
        </button>

        {/* Quote */}
        <div className="mt-6 text-center">
          <p className="text-stone-500 text-sm italic font-light leading-relaxed">
            "The moon sets, crows cry, frost fills the sky..."
          </p>
        </div>
      </div>
    </div>
  );
}
