import { useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, IndianRupee, Heart, BadgeCheck } from 'lucide-react';
import { supabase, TripLog, DIFFICULTY_COLORS, getFallbackImage, formatCost, formatDate } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 text-[#1B6CA8]" title="Verified Traveler">
      <BadgeCheck className="w-3.5 h-3.5" />
    </span>
  );
}

export default function TripCard({ trip, onLikeToggle }: { trip: TripLog; onLikeToggle?: (tripId: string) => void }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);
  const [clicking, setClicking] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [likeCount, setLikeCount] = useState(trip.trip_likes?.length ?? 0);
  const [liked, setLiked] = useState(trip.trip_likes?.some((l) => l.user_id === user?.id) ?? false);
  const [likeLoading, setLikeLoading] = useState(false);

  const image = trip.cover_image_url || trip.photo_urls?.[0] || getFallbackImage(trip.id);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -8, y: x * 8 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  const handleClick = () => {
    setClicking(true);
    setTimeout(() => navigate(`/trip/${trip.id}`), 300);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || likeLoading) return;
    setLikeLoading(true);

    if (liked) {
      const { error } = await supabase
        .from('trip_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('trip_id', trip.id);
      if (!error) { setLiked(false); setLikeCount((c) => c - 1); }
    } else {
      const { error } = await supabase
        .from('trip_likes')
        .insert({ user_id: user.id, trip_id: trip.id });
      if (!error) { setLiked(true); setLikeCount((c) => c + 1); }
    }
    setLikeLoading(false);
    onLikeToggle?.(trip.id);
  };

  const diffColor = DIFFICULTY_COLORS[trip.difficulty] || '';

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`group bg-white rounded-2xl overflow-hidden border border-[#EAF3FB] hover:border-[#1B6CA8]/30 cursor-pointer card-3d ${
        clicking ? 'card-click' : ''
      }`}
      style={{ transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(0px)` }}
    >
      {/* Image */}
      <div className="relative overflow-hidden h-48">
        <img
          src={image}
          alt={trip.destination_name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* State badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="bg-white/90 text-[#1B6CA8] text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
            {trip.state}
          </span>
          {trip.difficulty && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${diffColor}`}>
              {trip.difficulty}
            </span>
          )}
        </div>

        {/* Like button */}
        <button
          onClick={handleLike}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            liked ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-500 hover:text-red-500 backdrop-blur-sm'
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[#1A1A2E] font-bold text-base leading-tight group-hover:text-[#1B6CA8] transition-colors">
            {trip.destination_name}
          </h3>
          {likeCount > 0 && (
            <span className="flex items-center gap-1 text-gray-400 text-xs shrink-0">
              <Heart className="w-3 h-3 text-red-400 fill-red-400" />
              {likeCount}
            </span>
          )}
        </div>

        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
          {trip.description}
        </p>

        <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-1">
          <div className="w-5 h-5 bg-[#1B6CA8] rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0">
            {trip.profiles?.full_name?.[0]?.toUpperCase() || 'T'}
          </div>
          <span className="truncate font-medium text-gray-600">
            {trip.profiles?.full_name || 'Traveler'}
          </span>
          {/* Verified badge placeholder — real check done at page level */}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#EAF3FB]">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <Calendar className="w-3.5 h-3.5 text-[#1B6CA8] shrink-0" />
            <span>{formatDate(trip.trip_date)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <IndianRupee className="w-3.5 h-3.5 text-[#1B6CA8] shrink-0" />
            <span className="font-semibold text-[#1A1A2E]">{formatCost(trip.total_cost)}</span>
          </div>
        </div>

        {trip.best_time && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <MapPin className="w-3 h-3 text-[#1B6CA8]" />
            Best: {trip.best_time}
          </div>
        )}
      </div>
    </div>
  );
}
