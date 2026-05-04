import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Calendar, IndianRupee, Hotel, Route, Languages,
  ShieldAlert, User, ArrowLeft, Loader2, MessageCircle, Send,
  Heart, ChevronLeft, ChevronRight, X, BadgeCheck, Pencil, Trash2
} from 'lucide-react';
import { supabase, TripLog, Comment, DIFFICULTY_COLORS, BEST_TIME_COLORS, formatCost, formatDateLong } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

function CountUpNumber({ value, label }: { value: number; label: string }) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 800;
          const steps = 30;
          const increment = value / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setDisplay(value);
              clearInterval(timer);
            } else {
              setDisplay(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-2xl sm:text-3xl font-extrabold text-[#1B6CA8]">₹{new Intl.NumberFormat('en-IN').format(display)}</p>
      <p className="text-xs text-gray-400 font-medium mt-1">{label}</p>
    </div>
  );
}

function Lightbox({ images, initialIndex, onClose }: { images: string[]; initialIndex: number; onClose: () => void }) {
  const [index, setIndex] = useState(initialIndex);

  const goNext = useCallback(() => setIndex((i) => (i + 1) % images.length), [images.length]);
  const goPrev = useCallback(() => setIndex((i) => (i - 1 + images.length) % images.length), [images.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, goNext, goPrev]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center lightbox-overlay" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white z-10">
        <X className="w-8 h-8" />
      </button>
      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); goPrev(); }} className="absolute left-4 text-white/70 hover:text-white z-10">
            <ChevronLeft className="w-10 h-10" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); goNext(); }} className="absolute right-4 text-white/70 hover:text-white z-10">
            <ChevronRight className="w-10 h-10" />
          </button>
        </>
      )}
      <img
        src={images[index]}
        alt={`Photo ${index + 1}`}
        className="max-h-[85vh] max-w-[90vw] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <div className="absolute bottom-4 text-white/60 text-sm">{index + 1} / {images.length}</div>
    </div>
  );
}

function DeleteConfirmDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[90] bg-black/60 flex items-center justify-center p-4" onClick={onCancel}>
      <div
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-[#1A1A2E] text-center mb-2">Delete This Trip?</h3>
        <p className="text-gray-500 text-sm text-center mb-6">
          Are you sure you want to delete this trip? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ViewTripPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<TripLog | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [userTripCount, setUserTripCount] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = user && trip && user.id === trip.user_id;

  useEffect(() => {
    if (!id) return;
    async function fetchData() {
      const { data } = await supabase
        .from('trip_logs')
        .select('*, profiles(id, full_name, avatar_url, city, state)')
        .eq('id', id)
        .maybeSingle();
      if (data) {
        setTrip(data as TripLog);

        const { data: likesData } = await supabase.from('trip_likes').select('user_id').eq('trip_id', id);
        const likes = likesData || [];
        setLikeCount(likes.length);
        setLiked(likes.some((l: { user_id: string }) => l.user_id === user?.id));

        if (data.user_id) {
          const { count } = await supabase.from('trip_logs').select('*', { count: 'exact', head: true }).eq('user_id', data.user_id);
          setUserTripCount(count || 0);
        }
      }

      const { data: cData } = await supabase
        .from('comments')
        .select('*, profiles(id, full_name, avatar_url)')
        .eq('trip_id', id)
        .order('created_at', { ascending: true });
      if (cData) setComments(cData as Comment[]);

      setLoading(false);
    }
    fetchData();
  }, [id, user]);

  const handleLike = async () => {
    if (!user || likeLoading) return;
    setLikeLoading(true);
    if (liked) {
      const { error } = await supabase.from('trip_likes').delete().eq('user_id', user.id).eq('trip_id', id!);
      if (!error) { setLiked(false); setLikeCount((c) => c - 1); }
    } else {
      const { error } = await supabase.from('trip_likes').insert({ user_id: user.id, trip_id: id! });
      if (!error) { setLiked(true); setLikeCount((c) => c + 1); }
    }
    setLikeLoading(false);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !user || !id) return;
    setPosting(true);
    const { data } = await supabase
      .from('comments')
      .insert({ trip_id: id, user_id: user.id, content: comment.trim() })
      .select('*, profiles(id, full_name, avatar_url)')
      .maybeSingle();
    if (data) setComments((prev) => [...prev, data as Comment]);
    setComment('');
    setPosting(false);
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    const { error } = await supabase.from('trip_logs').delete().eq('id', id);
    setDeleting(false);
    setShowDeleteConfirm(false);
    if (!error) {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-[#1B6CA8] animate-spin" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <MapPin className="w-12 h-12 text-gray-200 mx-auto mb-4" />
        <p className="text-gray-400 text-lg">Trip not found.</p>
        <Link to="/" className="text-[#1B6CA8] text-sm mt-4 inline-block hover:underline">Back to Home</Link>
      </div>
    );
  }

  const coverImage = trip.cover_image_url || trip.photo_urls?.[0];
  const allPhotos: string[] = trip.photo_urls?.length
    ? (coverImage && !trip.photo_urls.includes(coverImage) ? [coverImage, ...trip.photo_urls] : trip.photo_urls)
    : (coverImage ? [coverImage] : []);

  const diffColor = DIFFICULTY_COLORS[trip.difficulty] || '';
  const bestColor = BEST_TIME_COLORS[trip.best_time] || '';

  const costItems = [
    { label: 'Transport', value: trip.transport_cost },
    { label: 'Food', value: trip.food_cost },
    { label: 'Hotel', value: trip.hotel_cost },
    { label: 'Entry Fees', value: trip.entry_fees },
    { label: 'Other', value: trip.other_costs },
  ].filter((c) => c.value > 0);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {lightboxIndex !== null && allPhotos.length > 0 && (
        <Lightbox images={allPhotos} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
      {showDeleteConfirm && (
        <DeleteConfirmDialog onConfirm={handleDelete} onCancel={() => setShowDeleteConfirm(false)} />
      )}

      <div className="flex items-start justify-between gap-4 mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-gray-500 text-sm hover:text-[#1B6CA8] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to trips
        </Link>

        {isOwner && (
          <div className="flex items-center gap-2 sm:flex-row flex-col">
            <Link
              to={`/post-trip?edit=${id}`}
              className="flex items-center gap-1.5 bg-[#1B6CA8] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#155a8a] transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Hero Image */}
      <div className="rounded-2xl overflow-hidden h-64 sm:h-96 mb-8 relative animate-fade-in">
        {coverImage ? (
          <img src={coverImage} alt={trip.destination_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1B6CA8] to-[#EAF3FB] flex items-center justify-center">
            <MapPin className="w-16 h-16 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {trip.state}
            </span>
            {trip.difficulty && (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${diffColor}`}>
                {trip.difficulty}
              </span>
            )}
            {trip.best_time && (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${bestColor}`}>
                {trip.best_time}
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            {trip.destination_name}
          </h1>
        </div>

        <button
          onClick={handleLike}
          disabled={likeLoading}
          className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition-all ${
            liked ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:text-red-500 backdrop-blur-sm'
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          {likeCount > 0 && likeCount}
        </button>
      </div>

      {/* Photo Gallery */}
      {trip.photo_urls && trip.photo_urls.length > 0 && (
        <div className="mb-8 animate-slide-up stagger-1">
          <h2 className="text-lg font-bold text-[#1A1A2E] mb-3">Trip Photos</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {trip.photo_urls.map((url, i) => (
              <button
                key={i}
                onClick={() => setLightboxIndex(i)}
                className="shrink-0 w-28 h-28 sm:w-36 sm:h-36 rounded-xl overflow-hidden hover:ring-2 hover:ring-[#1B6CA8] transition-all"
              >
                <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Author + date */}
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#EAF3FB] animate-slide-up stagger-1">
        <div className="w-10 h-10 bg-[#1B6CA8] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
          {trip.profiles?.full_name?.[0]?.toUpperCase() || 'T'}
        </div>
        <div>
          <p className="font-semibold text-[#1A1A2E] text-sm flex items-center gap-1.5">
            {trip.profiles?.full_name || 'Traveler'}
            {userTripCount >= 3 && (
              <span className="inline-flex items-center gap-0.5 text-[#1B6CA8] text-xs font-semibold" title="Verified Traveler">
                <BadgeCheck className="w-4 h-4" />
                Verified
              </span>
            )}
          </p>
          <p className="text-gray-400 text-xs">Traveled on {formatDateLong(trip.trip_date)}</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 animate-slide-up stagger-2">
        <InfoCard icon={<Hotel className="w-5 h-5" />} label="Hotel" value={trip.hotel_name || '—'} />
        <InfoCard icon={<Languages className="w-5 h-5" />} label="Language Spoken" value={trip.language_spoken || '—'} />
        <InfoCard icon={<Route className="w-5 h-5" />} label="Route Taken" value={trip.route_taken || '—'} />
        <InfoCard icon={<Calendar className="w-5 h-5" />} label="Trip Date" value={formatDateLong(trip.trip_date)} />
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white border border-[#EAF3FB] rounded-2xl p-6 mb-8 animate-slide-up stagger-3">
        <h2 className="text-lg font-bold text-[#1A1A2E] mb-4 flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-[#1B6CA8]" />
          Cost Breakdown
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          <CountUpNumber value={trip.transport_cost} label="Transport" />
          <CountUpNumber value={trip.food_cost} label="Food" />
          <CountUpNumber value={trip.hotel_cost} label="Hotel" />
          <CountUpNumber value={trip.entry_fees} label="Entry Fees" />
          <CountUpNumber value={trip.other_costs} label="Other" />
          <CountUpNumber value={trip.total_cost} label="Total" />
        </div>
        {costItems.length > 0 && (
          <div className="border-t border-[#EAF3FB] pt-4 mt-2">
            <table className="w-full text-sm">
              <tbody>
                {costItems.map((item) => (
                  <tr key={item.label} className="border-b border-[#EAF3FB]/50 last:border-0">
                    <td className="py-2 text-gray-500">{item.label}</td>
                    <td className="py-2 text-right font-semibold text-[#1A1A2E]">₹{formatCost(item.value)}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-[#1B6CA8]/20">
                  <td className="py-2.5 font-bold text-[#1A1A2E]">Total</td>
                  <td className="py-2.5 text-right font-extrabold text-[#1B6CA8] text-base">₹{formatCost(trip.total_cost)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Precautions */}
      {trip.precautions && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 animate-slide-up stagger-4">
          <div className="flex items-center gap-2 text-amber-700 font-bold mb-2">
            <ShieldAlert className="w-5 h-5" />
            Key Precautions
          </div>
          <p className="text-amber-800 text-sm leading-relaxed">{trip.precautions}</p>
        </div>
      )}

      {/* Description */}
      <div className="mb-10 animate-slide-up stagger-5">
        <h2 className="text-xl font-bold text-[#1A1A2E] mb-4">Trip Experience</h2>
        <p className="text-gray-600 leading-[1.8] whitespace-pre-line">{trip.description}</p>
      </div>

      {/* Comments */}
      <div>
        <h2 className="text-xl font-bold text-[#1A1A2E] mb-5 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-[#1B6CA8]" />
          Comments ({comments.length})
        </h2>

        <div className="space-y-4 mb-6">
          {comments.length === 0 && (
            <p className="text-gray-400 text-sm">No comments yet. Be the first!</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="w-8 h-8 bg-[#EAF3FB] rounded-full flex items-center justify-center text-[#1B6CA8] font-bold text-xs shrink-0">
                {c.profiles?.full_name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
              </div>
              <div className="flex-1 bg-[#EAF3FB] rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-semibold text-[#1B6CA8]">{c.profiles?.full_name || 'Traveler'}</p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <p className="text-[#1A1A2E] text-sm">{c.content}</p>
              </div>
            </div>
          ))}
        </div>

        {user ? (
          <form onSubmit={handleComment} className="flex gap-3">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="flex-1 px-4 py-3 border border-[#EAF3FB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8]"
            />
            <button
              type="submit"
              disabled={posting || !comment.trim()}
              className="bg-[#1B6CA8] text-white px-4 py-3 rounded-xl hover:bg-[#155a8a] transition-colors disabled:opacity-50"
            >
              {posting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
        ) : (
          <p className="text-gray-400 text-sm">
            <Link to="/login" className="text-[#1B6CA8] hover:underline">Sign in</Link> to leave a comment.
          </p>
        )}
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 bg-[#EAF3FB] rounded-xl p-4">
      <div className="mt-0.5 text-[#1B6CA8] shrink-0">{icon}</div>
      <div>
        <p className="text-xs font-semibold text-[#1B6CA8] uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-[#1A1A2E] text-sm font-medium">{value || '—'}</p>
      </div>
    </div>
  );
}
