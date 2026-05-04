import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Loader2, CheckCircle, Upload, X, IndianRupee } from 'lucide-react';
import { supabase, TripLog } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir',
  'Ladakh','Lakshadweep','Puducherry',
];

const DIFFICULTIES = ['Easy', 'Moderate', 'Difficult', 'Expert'];
const BEST_TIMES = ['October-February', 'March-June', 'July-September', 'Year Round'];

type FormData = {
  destination_name: string;
  state: string;
  trip_date: string;
  transport_cost: string;
  food_cost: string;
  hotel_name: string;
  hotel_cost: string;
  entry_fees: string;
  other_costs: string;
  route_taken: string;
  language_spoken: string;
  precautions: string;
  description: string;
  difficulty: string;
  best_time: string;
};

const initialForm: FormData = {
  destination_name: '',
  state: '',
  trip_date: '',
  transport_cost: '',
  food_cost: '',
  hotel_name: '',
  hotel_cost: '',
  entry_fees: '',
  other_costs: '',
  route_taken: '',
  language_spoken: '',
  precautions: '',
  description: '',
  difficulty: '',
  best_time: '',
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-[#1A1A2E]">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass = "w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[#1A1A2E] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] text-sm transition-all";

export default function PostTripPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [removedPhotos, setRemovedPhotos] = useState<Set<number>>(new Set());
  const [fetchingTrip, setFetchingTrip] = useState(!!editId);
  const fileRef = useRef<HTMLInputElement>(null);

  const isEditing = !!editId;

  // Load existing trip data for editing
  useEffect(() => {
    if (!editId || !user) return;
    async function fetchTrip() {
      const { data } = await supabase
        .from('trip_logs')
        .select('*')
        .eq('id', editId)
        .eq('user_id', user!.id)
        .maybeSingle();

      if (data) {
        const trip = data as TripLog;
        setForm({
          destination_name: trip.destination_name || '',
          state: trip.state || '',
          trip_date: trip.trip_date || '',
          transport_cost: trip.transport_cost?.toString() || '',
          food_cost: trip.food_cost?.toString() || '',
          hotel_name: trip.hotel_name || '',
          hotel_cost: trip.hotel_cost?.toString() || '',
          entry_fees: trip.entry_fees?.toString() || '',
          other_costs: trip.other_costs?.toString() || '',
          route_taken: trip.route_taken || '',
          language_spoken: trip.language_spoken || '',
          precautions: trip.precautions || '',
          description: trip.description || '',
          difficulty: trip.difficulty || '',
          best_time: trip.best_time || '',
        });
        if (trip.photo_urls && trip.photo_urls.length > 0) {
          setExistingPhotos(trip.photo_urls);
        }
      }
      setFetchingTrip(false);
    }
    fetchTrip();
  }, [editId, user]);

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <MapPin className="w-12 h-12 text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#1A1A2E] mb-2">Sign in to post a trip</h2>
        <p className="text-gray-500 text-sm mb-6">Share your travel experiences with the community.</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-[#1B6CA8] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#155a8a] transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (fetchingTrip) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-[#1B6CA8] animate-spin" />
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const totalCost =
    (Number(form.transport_cost) || 0) +
    (Number(form.food_cost) || 0) +
    (Number(form.hotel_cost) || 0) +
    (Number(form.entry_fees) || 0) +
    (Number(form.other_costs) || 0);

  const keptExistingCount = existingPhotos.filter((_, i) => !removedPhotos.has(i)).length;
  const totalPhotoCount = keptExistingCount + files.length;
  const canAddMore = totalPhotoCount < 5;

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const remaining = 5 - totalPhotoCount;
    const toAdd = newFiles.slice(0, remaining);
    setFiles((prev) => [...prev, ...toAdd]);
    const newPreviews = toAdd.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const removeExistingPhoto = (idx: number) => {
    setRemovedPhotos((prev) => new Set(prev).add(idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.destination_name || !form.state || !form.trip_date || !form.description) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    // Upload new images
    const newImageUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const ext = files[i].name.split('.').pop();
      const path = `${user.id}/${Date.now()}-${i}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('trip-images')
        .upload(path, files[i], { cacheControl: '3600', upsert: false });

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('trip-images').getPublicUrl(path);
        newImageUrls.push(urlData.publicUrl);
      }
    }

    // Combine kept existing photos + new uploads
    const keptPhotos = existingPhotos.filter((_, i) => !removedPhotos.has(i));
    const allPhotos = [...keptPhotos, ...newImageUrls];

    if (isEditing) {
      const { error: dbError } = await supabase
        .from('trip_logs')
        .update({
          destination_name: form.destination_name,
          state: form.state,
          trip_date: form.trip_date,
          total_cost: totalCost,
          transport_cost: Number(form.transport_cost) || 0,
          food_cost: Number(form.food_cost) || 0,
          hotel_name: form.hotel_name,
          hotel_cost: Number(form.hotel_cost) || 0,
          entry_fees: Number(form.entry_fees) || 0,
          other_costs: Number(form.other_costs) || 0,
          route_taken: form.route_taken,
          language_spoken: form.language_spoken,
          precautions: form.precautions,
          description: form.description,
          difficulty: form.difficulty,
          best_time: form.best_time,
          cover_image_url: allPhotos[0] || null,
          photo_urls: allPhotos,
        })
        .eq('id', editId);

      setLoading(false);
      if (dbError) {
        setError(dbError.message);
      } else {
        setSuccess(true);
        setTimeout(() => navigate(`/trip/${editId}`), 1500);
      }
    } else {
      const { error: dbError } = await supabase
        .from('trip_logs')
        .insert({
          user_id: user.id,
          destination_name: form.destination_name,
          state: form.state,
          trip_date: form.trip_date,
          total_cost: totalCost,
          transport_cost: Number(form.transport_cost) || 0,
          food_cost: Number(form.food_cost) || 0,
          hotel_name: form.hotel_name,
          hotel_cost: Number(form.hotel_cost) || 0,
          entry_fees: Number(form.entry_fees) || 0,
          other_costs: Number(form.other_costs) || 0,
          route_taken: form.route_taken,
          language_spoken: form.language_spoken,
          precautions: form.precautions,
          description: form.description,
          difficulty: form.difficulty,
          best_time: form.best_time,
          cover_image_url: allPhotos[0] || null,
          photo_urls: allPhotos,
        });

      setLoading(false);
      if (dbError) {
        setError(dbError.message);
      } else {
        setSuccess(true);
        setTimeout(() => navigate('/'), 2000);
      }
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2">
          {isEditing ? 'Trip Updated!' : 'Trip Posted!'}
        </h2>
        <p className="text-gray-500">
          {isEditing ? 'Redirecting to trip...' : 'Redirecting to home...'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#1A1A2E] mb-2">
          {isEditing ? 'Edit Your Trip' : 'Share Your Trip'}
        </h1>
        <p className="text-gray-500">
          {isEditing ? 'Update your trip details below' : 'Help fellow travelers with your honest experience'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Destination Details */}
        <div className="bg-white border border-[#EAF3FB] rounded-2xl p-6 space-y-5">
          <h2 className="font-bold text-[#1A1A2E] text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#1B6CA8]" />
            Destination Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Destination Name" required>
              <input name="destination_name" value={form.destination_name} onChange={handleChange} placeholder="e.g. Manali, Coorg, Jaisalmer" className={inputClass} />
            </Field>
            <Field label="State" required>
              <select name="state" value={form.state} onChange={handleChange} className={inputClass}>
                <option value="">Select State</option>
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Trip Date" required>
              <input type="date" name="trip_date" value={form.trip_date} onChange={handleChange} className={inputClass} />
            </Field>
            <Field label="Language Spoken There">
              <input name="language_spoken" value={form.language_spoken} onChange={handleChange} placeholder="e.g. Hindi, Kannada, Tamil" className={inputClass} />
            </Field>
            <Field label="Difficulty">
              <select name="difficulty" value={form.difficulty} onChange={handleChange} className={inputClass}>
                <option value="">Select Difficulty</option>
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Best Time to Visit">
              <select name="best_time" value={form.best_time} onChange={handleChange} className={inputClass}>
                <option value="">Select Best Time</option>
                {BEST_TIMES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-white border border-[#EAF3FB] rounded-2xl p-6 space-y-5">
          <h2 className="font-bold text-[#1A1A2E] text-base flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-[#1B6CA8]" />
            Cost Breakdown
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Transport Cost (₹)">
              <input type="number" name="transport_cost" value={form.transport_cost} onChange={handleChange} placeholder="e.g. 5000" min="0" className={inputClass} />
            </Field>
            <Field label="Food Cost (₹)">
              <input type="number" name="food_cost" value={form.food_cost} onChange={handleChange} placeholder="e.g. 3000" min="0" className={inputClass} />
            </Field>
            <Field label="Hotel Name">
              <input name="hotel_name" value={form.hotel_name} onChange={handleChange} placeholder="Where did you stay?" className={inputClass} />
            </Field>
            <Field label="Hotel Cost (₹)">
              <input type="number" name="hotel_cost" value={form.hotel_cost} onChange={handleChange} placeholder="e.g. 3500" min="0" className={inputClass} />
            </Field>
            <Field label="Entry Fees (₹)">
              <input type="number" name="entry_fees" value={form.entry_fees} onChange={handleChange} placeholder="e.g. 500" min="0" className={inputClass} />
            </Field>
            <Field label="Other Costs (₹)">
              <input type="number" name="other_costs" value={form.other_costs} onChange={handleChange} placeholder="e.g. 1000" min="0" className={inputClass} />
            </Field>
          </div>
          <div className="bg-[#EAF3FB] rounded-xl p-4 flex items-center justify-between">
            <span className="font-semibold text-[#1A1A2E] text-sm">Total Trip Cost</span>
            <span className="text-xl font-extrabold text-[#1B6CA8]">₹{new Intl.NumberFormat('en-IN').format(totalCost)}</span>
          </div>
        </div>

        {/* Trip Details */}
        <div className="bg-white border border-[#EAF3FB] rounded-2xl p-6 space-y-5">
          <h2 className="font-bold text-[#1A1A2E] text-base">Trip Details</h2>
          <Field label="Route Taken">
            <input name="route_taken" value={form.route_taken} onChange={handleChange} placeholder="e.g. Delhi → Chandigarh → Manali by bus" className={inputClass} />
          </Field>
          <Field label="Key Precautions">
            <textarea name="precautions" value={form.precautions} onChange={handleChange} placeholder="Tips, safety advice, things to watch out for..." rows={3} className={`${inputClass} resize-none`} />
          </Field>
          <Field label="Full Trip Description" required>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Tell us about your experience — what you loved, what you ate, what to do and avoid..." rows={6} className={`${inputClass} resize-none`} />
          </Field>
        </div>

        {/* Photo Upload */}
        <div className="bg-white border border-[#EAF3FB] rounded-2xl p-6 space-y-5">
          <h2 className="font-bold text-[#1A1A2E] text-base flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#1B6CA8]" />
            Trip Photos
            <span className="text-sm font-normal text-gray-400 ml-1">{totalPhotoCount}/5 photos</span>
          </h2>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {/* Existing photos (edit mode) */}
            {existingPhotos.map((url, i) => {
              if (removedPhotos.has(i)) return null;
              return (
                <div key={`existing-${i}`} className="relative aspect-square rounded-xl overflow-hidden bg-[#EAF3FB]">
                  <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingPhoto(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}

            {/* New file previews */}
            {previews.map((src, i) => (
              <div key={`new-${i}`} className="relative aspect-square rounded-xl overflow-hidden bg-[#EAF3FB]">
                <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Add button */}
            {canAddMore && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-[#EAF3FB] flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-[#1B6CA8] hover:border-[#1B6CA8] transition-colors"
              >
                <Upload className="w-5 h-5" />
                <span className="text-xs">Add</span>
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            className="hidden"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#1B6CA8] text-white py-3.5 rounded-xl font-semibold hover:bg-[#155a8a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          {loading
            ? (isEditing ? 'Saving...' : 'Posting...')
            : (isEditing ? 'Save Changes' : 'Post My Trip')
          }
        </button>
      </form>
    </div>
  );
}
