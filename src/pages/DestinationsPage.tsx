import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Loader2, ArrowLeft, Mountain, Palmtree, Landmark, Waves } from 'lucide-react';
import { supabase, TripLog } from '../lib/supabase';
import TripCard from '../components/TripCard';

type StateInfo = { name: string; count: number };

const STATE_ICONS: Record<string, React.ElementType> = {
  'Himachal Pradesh': Mountain,
  'Uttarakhand': Mountain,
  'Goa': Waves,
  'Kerala': Palmtree,
  'Rajasthan': Landmark,
};

const STATE_GRADIENTS = [
  'from-[#1B6CA8] to-[#2196F3]',
  'from-[#0D7377] to-[#14B8A6]',
  'from-[#B45309] to-[#F59E0B]',
  'from-[#7C3AED] to-[#A78BFA]',
  'from-[#DC2626] to-[#F87171]',
  'from-[#059669] to-[#34D399]',
  'from-[#D97706] to-[#FBBF24]',
  'from-[#2563EB] to-[#60A5FA]',
];

function getGradient(name: string) {
  const idx = name.charCodeAt(0) % STATE_GRADIENTS.length;
  return STATE_GRADIENTS[idx];
}

export default function DestinationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedState = searchParams.get('state') || '';
  const [states, setStates] = useState<StateInfo[]>([]);
  const [trips, setTrips] = useState<TripLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('trip_logs')
        .select('*, profiles(id, full_name, avatar_url), trip_likes(user_id)')
        .order('created_at', { ascending: false });

      if (data) {
        const allTrips = data as TripLog[];
        const stateMap = new Map<string, number>();
        allTrips.forEach((t) => {
          stateMap.set(t.state, (stateMap.get(t.state) || 0) + 1);
        });
        const stateList = Array.from(stateMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
        setStates(stateList);
        setTrips(allTrips);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredTrips = selectedState
    ? trips.filter((t) => t.state === selectedState)
    : [];

  const handleStateClick = (state: string) => {
    setSearchParams({ state });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A2E] mb-2">Destinations</h1>
        <p className="text-gray-500">Explore trips by state across India</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-[#1B6CA8] animate-spin" />
        </div>
      ) : selectedState ? (
        <div>
          <button
            onClick={() => setSearchParams({})}
            className="flex items-center gap-2 text-[#1B6CA8] text-sm font-medium mb-6 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            All Destinations
          </button>
          <h2 className="text-2xl font-bold text-[#1A1A2E] mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#1B6CA8]" />
            {selectedState}
            <span className="text-gray-400 text-base font-normal">({filteredTrips.length} trips)</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {states.map((s) => {
            const Icon = STATE_ICONS[s.name] || MapPin;
            return (
              <button
                key={s.name}
                onClick={() => handleStateClick(s.name)}
                className="group relative overflow-hidden rounded-2xl h-40 sm:h-48 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(s.name)} opacity-90 group-hover:opacity-100 transition-opacity`} />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-white p-4">
                  <Icon className="w-8 h-8 mb-3 opacity-80" />
                  <h3 className="font-bold text-base sm:text-lg text-center leading-tight">{s.name}</h3>
                  <p className="text-white/70 text-xs mt-1.5">{s.count} trip{s.count !== 1 ? 's' : ''}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {!loading && states.length === 0 && (
        <div className="text-center py-24">
          <MapPin className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 text-lg font-medium">No destinations yet</p>
          <p className="text-gray-400 text-sm mt-1">Be the first to share a trip!</p>
        </div>
      )}
    </div>
  );
}
