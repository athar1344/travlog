import { Link } from 'react-router-dom';
import { Compass, MapPin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1A1A2E] text-white mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#1B6CA8] rounded-lg flex items-center justify-center">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">Travlog</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your friend who went there first. Honest trip logs with real costs, routes, and insider tips from fellow Indian travelers.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-300 mb-4">Explore</h3>
            <ul className="space-y-2.5">
              <li><Link to="/" className="text-gray-400 text-sm hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/destinations" className="text-gray-400 text-sm hover:text-white transition-colors">Destinations</Link></li>
              <li><Link to="/post-trip" className="text-gray-400 text-sm hover:text-white transition-colors">Post a Trip</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-300 mb-4">Company</h3>
            <ul className="space-y-2.5">
              <li><Link to="/about" className="text-gray-400 text-sm hover:text-white transition-colors">About</Link></li>
              <li>
                <a href="mailto:hello@travlog.in" className="text-gray-400 text-sm hover:text-white transition-colors flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Destinations */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-300 mb-4">Top States</h3>
            <ul className="space-y-2.5">
              {['Rajasthan', 'Kerala', 'Himachal Pradesh', 'Goa'].map((s) => (
                <li key={s}>
                  <Link to={`/destinations?state=${encodeURIComponent(s)}`} className="text-gray-400 text-sm hover:text-white transition-colors flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-xs">&copy; {new Date().getFullYear()} Travlog. All rights reserved.</p>
          <p className="text-gray-500 text-xs">Your Friend Who Went There First</p>
        </div>
      </div>
    </footer>
  );
}
