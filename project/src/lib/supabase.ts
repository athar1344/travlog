import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zjgvotxdojktjggwmkgf.supabase.co';
const supabaseAnonKey = 'sb_publishable_vcWgZ4qgTyRml1hMf2AfDQ_LvQq1Jte';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
};

export type TripLog = {
  id: string;
  user_id: string;
  destination_name: string;
  state: string;
  trip_date: string;
  total_cost: number;
  hotel_name: string;
  hotel_cost: number;
  route_taken: string;
  language_spoken: string;
  precautions: string;
  description: string;
  cover_image_url: string | null;
  transport_cost: number;
  food_cost: number;
  entry_fees: number;
  other_costs: number;
  difficulty: string;
  best_time: string;
  photo_urls: string[];
  created_at: string;
  profiles?: Profile;
  trip_likes?: { user_id: string }[];
};

export type TripLike = {
  id: string;
  user_id: string;
  trip_id: string;
  created_at: string;
};

export type Comment = {
  id: string;
  trip_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Profile;
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: 'bg-green-100 text-green-700 border-green-200',
  Moderate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Difficult: 'bg-orange-100 text-orange-700 border-orange-200',
  Expert: 'bg-red-100 text-red-700 border-red-200',
};

export const BEST_TIME_COLORS: Record<string, string> = {
  'October-February': 'bg-blue-50 text-blue-600 border-blue-200',
  'March-June': 'bg-amber-50 text-amber-600 border-amber-200',
  'July-September': 'bg-teal-50 text-teal-600 border-teal-200',
  'Year Round': 'bg-emerald-50 text-emerald-600 border-emerald-200',
};

export const PEXELS_IMAGES = [
  'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2325446/pexels-photo-2325446.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/3601425/pexels-photo-3601425.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2187605/pexels-photo-2187605.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg?auto=compress&cs=tinysrgb&w=600',
];

export function getFallbackImage(id: string) {
  const index = id.charCodeAt(0) % PEXELS_IMAGES.length;
  return PEXELS_IMAGES[index];
}

export function formatCost(cost: number) {
  return new Intl.NumberFormat('en-IN').format(cost);
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateLong(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
