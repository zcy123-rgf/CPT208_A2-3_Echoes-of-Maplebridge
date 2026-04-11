import { ArrowLeft, Heart, Bookmark, Upload, MessageCircle, Filter } from 'lucide-react';
import { useState } from 'react';

interface CommunityPhotoWallScreenProps {
  onBack: () => void;
  onUpload: () => void;
}

export function CommunityPhotoWallScreen({ onBack, onUpload }: CommunityPhotoWallScreenProps) {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const storyPoints = [
    { id: 'all', name: 'All Points' },
    { id: '1', name: 'Turning Point' },
    { id: '2', name: 'Sealed Bridge' },
    { id: '3', name: 'Night Mooring' },
    { id: '4', name: 'Past & Present' }
  ];

  const photos = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1763336323425-8c9ba61fc3e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDaGluZXNlJTIwYnJpZGdlJTIwd2F0ZXIlMjByZWZsZWN0aW9ufGVufDF8fHx8MTc3NDgwODM2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      user: 'Poetry Traveler',
      caption: 'The bridge at golden hour — just as timeless as in the poems',
      storyPoint: 'Sealed Bridge at Night',
      likes: 24,
      time: '2 hours ago'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1761813378459-7ab89bc3345c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9uZSUyMGJyaWRnZSUyMHN1bnNldCUyMHBlYWNlZnVsfGVufDF8fHx8MTc3NDgwODM2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      user: 'Local Memory',
      caption: 'Peaceful evening reflection. You can almost hear the temple bell',
      storyPoint: 'Night Mooring at Maple Bridge',
      likes: 31,
      time: '5 hours ago'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1749888197235-259de414f349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGJvYXQlMjB3YXRlciUyMENoaW5hfGVufDF8fHx8MTc3NDgwODM2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      user: 'Wandering Soul',
      caption: 'Following the ancient canal route where history flows',
      storyPoint: 'The Turning Point of the Grand Canal',
      likes: 18,
      time: '1 day ago'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1766953597804-893f1993b8af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodCUyMHJpdmVyJTIwdHJhZGl0aW9uYWwlMjBicmlkZ2UlMjByZWZsZWN0aW9ufGVufDF8fHx8MTc3NDgwODM2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      user: 'Cultural Explorer',
      caption: 'Night falls on Maple Bridge, a moment frozen in time and poetry',
      storyPoint: 'Maple Bridge: Past and Present',
      likes: 42,
      time: '2 days ago'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1763336323425-8c9ba61fc3e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDaGluZXNlJTIwYnJpZGdlJTIwd2F0ZXIlMjByZWZsZWN0aW9ufGVufDF8fHx8MTc3NDgwODM2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      user: 'Anonymous',
      caption: 'The view that inspired a thousand years of longing',
      storyPoint: 'Sealed Bridge at Night',
      likes: 27,
      time: '3 days ago'
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1761813378459-7ab89bc3345c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9uZSUyMGJyaWRnZSUyMHN1bnNldCUyMHBlYWNlZnVsfGVufDF8fHx8MTc3NDgwODM2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      user: 'Heritage Keeper',
      caption: 'Every stone tells a story at this sacred crossing',
      storyPoint: 'Night Mooring at Maple Bridge',
      likes: 35,
      time: '4 days ago'
    }
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-stone-50 to-amber-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-stone-200/50 pt-14 pb-4 px-5">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-stone-700" />
          </button>
          <h1 className="text-xl font-light text-stone-800">Maple Bridge Moments</h1>
          <div className="w-10"></div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {storyPoints.map(point => (
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

      {/* Section Title */}
      <div className="px-6 pt-6 pb-3">
        <h2 className="text-base font-light text-stone-700 mb-1">See how others captured Maple Bridge</h2>
        <p className="text-sm font-light text-stone-500">
          {photos.length} moments shared by fellow explorers
        </p>
      </div>

      {/* Photo Grid */}
      <div className="flex-1 overflow-auto px-6 pb-24">
        <div className="space-y-5">
          {photos.map(photo => (
            <div key={photo.id} className="bg-white rounded-3xl overflow-hidden shadow-md border border-stone-200/50">
              {/* User Info Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-light">
                    {photo.user.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-light text-stone-800">{photo.user}</p>
                    <p className="text-xs font-light text-stone-500">{photo.time}</p>
                  </div>
                </div>
                <div className="text-xs font-light text-stone-500 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/50">
                  {photo.storyPoint}
                </div>
              </div>

              {/* Photo */}
              <div className="relative aspect-[4/3]">
                <img 
                  src={photo.image}
                  alt={photo.caption}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Caption & Actions */}
              <div className="p-4">
                <p className="text-sm font-light text-stone-700 leading-relaxed mb-3">
                  {photo.caption}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-stone-200">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1.5 text-stone-600 hover:text-amber-600 transition-colors">
                      <Heart className="w-5 h-5" />
                      <span className="text-sm font-light">{photo.likes}</span>
                    </button>
                    <button className="text-stone-600 hover:text-amber-600 transition-colors">
                      <Bookmark className="w-5 h-5" />
                    </button>
                  </div>
                  <span className="text-xs font-light text-stone-400">Maple Bridge, Suzhou</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Button - Fixed at bottom */}
      <div className="absolute bottom-6 left-6 right-6 z-10">
        <button 
          onClick={onUpload}
          className="w-full bg-gradient-to-r from-stone-800 to-stone-700 text-white py-4 rounded-full font-light text-base tracking-wide shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Upload className="w-5 h-5" />
          Share Your Maple Bridge Moment
        </button>
      </div>

      {/* Floating AI Assistant */}
      <div className="absolute bottom-24 right-6 z-20">
        <button className="w-14 h-14 rounded-full bg-gradient-to-br from-stone-800 to-stone-700 shadow-2xl flex items-center justify-center hover:shadow-xl transition-all hover:scale-105 active:scale-95 border-2 border-amber-200/30">
          <MessageCircle className="w-6 h-6 text-amber-100" />
        </button>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white animate-pulse"></div>
      </div>

      {/* Hide scrollbar */}
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
