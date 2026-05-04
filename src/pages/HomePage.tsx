import { useEffect, useState } from 'react';
import { Search, MapPin, Loader2, Compass, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, TripLog } from '../lib/supabase';
import TripCard from '../components/TripCard';

export default function HomePage() {
  const [trips, setTrips] = useState<TripLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchTrips() {
      const { data, error } = await supabase
        .from('trip_logs')
        .select('*, profiles(id, full_name, avatar_url), trip_likes(user_id)')
        .order('created_at', { ascending: false });

      if (!error && data) setTrips(data as TripLog[]);
      setLoading(false);
    }
    fetchTrips();
  }, []);

  const filtered = trips.filter((t) =>
    t.destination_name.toLowerCase().includes(search.toLowerCase()) ||
    t.state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main>
      {/* Hero Section */}
      <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <div
          className="absolute inset-0 parallax-hero"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=compress&cs=tinysrgb&w=1920')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A2E]/70 via-[#1A1A2E]/40 to-[#1A1A2E]/80" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-[#EAF3FB] text-sm font-medium mb-4 animate-slide-up">
              <Compass className="w-4 h-4" />
              Real trips. Real experiences.
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-5 animate-slide-up stagger-1">
              Discover India<br />
              <span className="text-[#7CB9E8]">Through Fellow Travelers</span>
            </h1>
            <p className="text-gray-300 text-lg sm:text-xl mb-8 leading-relaxed animate-slide-up stagger-2">
              Your friend who went there first — honest trip logs with costs, routes, and insider tips.
            </p>

            <div className="relative max-w-lg animate-slide-up stagger-3">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search destination or state..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur-sm border-0 rounded-2xl text-[#1A1A2E] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/50 shadow-xl text-sm"
              />
            </div>

            <div className="flex items-center gap-4 mt-6 animate-slide-up stagger-4">
              <Link
                to="/post-trip"
                className="flex items-center gap-2 bg-[#1B6CA8] text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-[#155a8a] transition-colors shadow-lg"
              >
                Share Your Trip
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/destinations"
                className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors"
              >
                Browse Destinations
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center pt-2">
            <div className="w-1 h-2 bg-white/60 rounded-full" />
          </div>
        </div>
      </div>

      {/* Explore Section */}
      <div id="explore-section" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E]">Explore Trip Logs</h2>
            <p className="text-gray-500 text-sm mt-1">
              {filtered.length} trip{filtered.length !== 1 ? 's' : ''} from fellow travelers
              {search && <span className="text-[#1B6CA8] font-medium"> matching "{search}"</span>}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-[#1B6CA8] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <MapPin className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-medium">No trips found</p>
            {search && (
              <p className="text-gray-400 text-sm mt-1">Try a different destination or state name</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
