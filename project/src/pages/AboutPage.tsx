import { Link } from 'react-router-dom';
import { Compass, PenLine, Search, MapPin, ArrowRight, Users, Shield, Heart } from 'lucide-react';

const steps = [
  {
    icon: PenLine,
    title: 'Share Your Trip',
    desc: 'Log your travel experience with real costs, routes, hotel info, and honest tips that help others plan better.',
  },
  {
    icon: Search,
    title: 'Discover Destinations',
    desc: 'Search by state, destination, or difficulty. Read first-hand accounts from travelers who have been there.',
  },
  {
    icon: MapPin,
    title: 'Travel Smarter',
    desc: 'Get insider precautions, best times to visit, and cost breakdowns so you can plan your trip with confidence.',
  },
];

const values = [
  { icon: Users, title: 'Community First', desc: 'Built by travelers, for travelers. Every trip log is a real experience.' },
  { icon: Shield, title: 'Honest & Transparent', desc: 'No sponsored content. Real costs, real routes, real advice.' },
  { icon: Heart, title: 'Help Fellow Travelers', desc: 'Your trip log could be the guide someone needs for their next adventure.' },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-[#EAF3FB] border-b border-[#d4e8f7]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-[#1B6CA8] rounded-xl flex items-center justify-center">
              <Compass className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1A1A2E] leading-tight mb-4">
            About Travlog
          </h1>
          <p className="text-gray-500 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Your friend who went there first. We believe the best travel advice comes from someone who has actually been there.
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] text-center mb-12">
          How Travlog Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={step.title} className="relative text-center group">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-[#EAF3FB]" />
              )}
              <div className="relative z-10 w-20 h-20 bg-[#1B6CA8] rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-[#1B6CA8]/20">
                <step.icon className="w-9 h-9 text-white" />
              </div>
              <div className="text-xs font-bold text-[#1B6CA8] mb-2">Step {i + 1}</div>
              <h3 className="text-lg font-bold text-[#1A1A2E] mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <div className="bg-[#1A1A2E] py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">Our Mission</h2>
            <p className="text-gray-400 leading-relaxed">
              To create the most honest, useful travel resource for Indian travelers — built entirely by the community, one trip log at a time.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 bg-[#1B6CA8] rounded-xl flex items-center justify-center mb-4">
                  <v.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-bold mb-2">{v.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] mb-4">
          Ready to share your journey?
        </h2>
        <p className="text-gray-500 mb-8 max-w-lg mx-auto">
          Your trip log could be the guide someone needs. Share your experience and help fellow travelers explore India with confidence.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/post-trip"
            className="flex items-center gap-2 bg-[#1B6CA8] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#155a8a] transition-colors shadow-lg shadow-[#1B6CA8]/20"
          >
            Post Your Trip
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 border border-[#EAF3FB] text-[#1A1A2E] px-6 py-3 rounded-xl font-semibold hover:bg-[#EAF3FB] transition-colors"
          >
            Explore Trips
          </Link>
        </div>
      </div>
    </div>
  );
}
