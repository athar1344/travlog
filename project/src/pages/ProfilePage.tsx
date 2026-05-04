import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, MapPin, Loader2, CreditCard as Edit3, Check, X, BadgeCheck, Heart, Bookmark } from 'lucide-react';
import { supabase, TripLog, Profile } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import TripCard from '../components/TripCard';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [trips, setTrips] = useState<TripLog[]>([]);
  const [savedTrips, setSavedTrips] = useState<TripLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editCity, setEditCity] = useState('');
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'my' | 'saved'>('my');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    async function fetchData() {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .maybeSingle();

      const { data: tripsData } = await supabase
        .from('trip_logs')
        .select('*, profiles(id, full_name, avatar_url), trip_likes(user_id)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      // Fetch saved/liked trips
      const { data: likeIds } = await supabase
        .from('trip_likes')
        .select('trip_id')
        .eq('user_id', user!.id);

      let savedData: TripLog[] = [];
      if (likeIds && likeIds.length > 0) {
        const tripIds = likeIds.map((l: { trip_id: string }) => l.trip_id);
        const { data: sData } = await supabase
          .from('trip_logs')
          .select('*, profiles(id, full_name, avatar_url), trip_likes(user_id)')
          .in('id', tripIds)
          .order('created_at', { ascending: false });
        if (sData) savedData = sData as TripLog[];
      }

      if (profileData) {
        setProfile(profileData as Profile);
        setEditName(profileData.full_name || '');
        setEditBio(profileData.bio || '');
        setEditCity(profileData.city || '');
      }
      if (tripsData) setTrips(tripsData as TripLog[]);
      setSavedTrips(savedData);
      setLoading(false);
    }
    fetchData();
  }, [user, navigate]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { data } = await supabase
      .from('profiles')
      .upsert({ id: user.id, full_name: editName, bio: editBio, city: editCity })
      .select()
      .maybeSingle();
    if (data) setProfile(data as Profile);
    setSaving(false);
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-[#1B6CA8] animate-spin" />
      </div>
    );
  }

  const isVerified = trips.length >= 3;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Profile Header */}
      <div className="bg-white border border-[#EAF3FB] rounded-2xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-[#1B6CA8] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || <User />}
            </div>
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#1B6CA8] rounded-full flex items-center justify-center border-2 border-white">
                <BadgeCheck className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-3">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3 py-2 border border-[#EAF3FB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8]"
                />
                <input
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  placeholder="City"
                  className="w-full px-3 py-2 border border-[#EAF3FB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8]"
                />
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Write a short bio..."
                  rows={3}
                  className="w-full px-3 py-2 border border-[#EAF3FB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 bg-[#1B6CA8] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#155a8a] transition-colors disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center gap-1.5 border border-gray-200 text-gray-500 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 justify-between">
                  <h1 className="text-xl font-extrabold text-[#1A1A2E] flex items-center gap-2">
                    {profile?.full_name || 'Traveler'}
                    {isVerified && (
                      <span className="inline-flex items-center gap-1 text-[#1B6CA8] text-xs font-semibold bg-[#EAF3FB] px-2 py-0.5 rounded-full">
                        <BadgeCheck className="w-3.5 h-3.5" />
                        Verified Traveler
                      </span>
                    )}
                  </h1>
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 text-gray-400 hover:text-[#1B6CA8] text-sm transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                </div>
                <p className="text-gray-400 text-sm mt-0.5">{user?.email}</p>
                {profile?.city && (
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {profile.city}
                  </div>
                )}
                {profile?.bio && (
                  <p className="text-gray-600 text-sm mt-2 leading-relaxed">{profile.bio}</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 pt-6 border-t border-[#EAF3FB] grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-extrabold text-[#1B6CA8]">{trips.length}</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Trips Posted</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold text-[#1B6CA8]">
              {trips.length > 0
                ? `₹${new Intl.NumberFormat('en-IN').format(Math.round(trips.reduce((s, t) => s + t.total_cost, 0) / trips.length))}`
                : '—'}
            </p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Avg Trip Cost</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold text-[#1B6CA8]">
              {trips.length > 0 ? [...new Set(trips.map((t) => t.state))].length : '—'}
            </p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">States Visited</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold text-[#1B6CA8]">{savedTrips.length}</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Saved Trips</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#EAF3FB] rounded-xl p-1">
        <button
          onClick={() => setTab('my')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'my' ? 'bg-white text-[#1B6CA8] shadow-sm' : 'text-gray-500 hover:text-[#1A1A2E]'
          }`}
        >
          <MapPin className="w-4 h-4" />
          My Trips ({trips.length})
        </button>
        <button
          onClick={() => setTab('saved')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'saved' ? 'bg-white text-[#1B6CA8] shadow-sm' : 'text-gray-500 hover:text-[#1A1A2E]'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Saved ({savedTrips.length})
        </button>
      </div>

      {/* Trip Lists */}
      {tab === 'my' ? (
        trips.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[#EAF3FB] rounded-2xl">
            <MapPin className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No trips yet</p>
            <p className="text-gray-400 text-sm mt-1">Share your first travel experience!</p>
            <Link
              to="/post-trip"
              className="mt-5 inline-block bg-[#1B6CA8] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#155a8a] transition-colors"
            >
              Post a Trip
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )
      ) : savedTrips.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#EAF3FB] rounded-2xl">
          <Heart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No saved trips yet</p>
          <p className="text-gray-400 text-sm mt-1">Like trips to save them here!</p>
          <Link
            to="/"
            className="mt-5 inline-block bg-[#1B6CA8] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#155a8a] transition-colors"
          >
            Explore Trips
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {savedTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}
