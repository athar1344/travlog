import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, LogOut, User, Menu, X, PlusCircle, Home, Map, Globe, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setMenuOpen(false);
  };

  const scrollToExplore = () => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' });
    }
    setMenuOpen(false);
  };

  const navLinks = [
    { label: 'Home', icon: Home, action: () => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
    { label: 'Explore', icon: Map, action: scrollToExplore },
    { label: 'Destinations', icon: Globe, action: () => navigate('/destinations') },
    { label: 'About', icon: Info, action: () => navigate('/about') },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-[#EAF3FB]/60 shadow-sm py-2'
          : 'bg-white border-b border-[#EAF3FB] py-3'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? 'h-12' : 'h-16'}`}>
          <Link to="/" className="flex items-center gap-2 group">
            <div className={`bg-[#1B6CA8] rounded-lg flex items-center justify-center transition-all duration-300 ${scrolled ? 'w-7 h-7' : 'w-8 h-8'}`}>
              <Compass className={`text-white transition-all duration-300 ${scrolled ? 'w-4 h-4' : 'w-5 h-5'}`} />
            </div>
            <div>
              <span className={`font-bold text-[#1A1A2E] tracking-tight transition-all duration-300 ${scrolled ? 'text-lg' : 'text-xl'}`}>
                Travlog
              </span>
              <span className={`text-[10px] text-[#1B6CA8] font-medium -mt-1 leading-none transition-all duration-300 ${scrolled ? 'hidden' : 'hidden sm:block'}`}>
                Your Friend Who Went There First
              </span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={link.action}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  (link.label === 'Home' && location.pathname === '/') ||
                  (link.label === 'Destinations' && location.pathname === '/destinations') ||
                  (link.label === 'About' && location.pathname === '/about')
                    ? 'text-[#1B6CA8] bg-[#EAF3FB]'
                    : 'text-gray-600 hover:text-[#1B6CA8] hover:bg-[#EAF3FB]/50'
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/post-trip"
              className="flex items-center gap-2 bg-[#1B6CA8] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#155a8a] transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Post a Trip
            </Link>
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-[#1A1A2E] border border-[#EAF3FB] px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#EAF3FB] transition-colors"
                >
                  <User className="w-4 h-4" />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-gray-400 p-2 rounded-lg hover:text-[#1A1A2E] hover:bg-gray-50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-[#1A1A2E] border border-[#EAF3FB] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#EAF3FB] transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-[#EAF3FB] transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#EAF3FB] bg-white/95 backdrop-blur-xl px-4 pb-4 pt-3 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={link.action}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-[#1B6CA8] hover:bg-[#EAF3FB] transition-colors"
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </button>
          ))}
          <div className="border-t border-[#EAF3FB] pt-2 mt-2 space-y-1">
            <Link
              to="/post-trip"
              className="flex items-center gap-3 bg-[#1B6CA8] text-white px-4 py-2.5 rounded-lg text-sm font-medium w-full"
            >
              <PlusCircle className="w-4 h-4" />
              Post a Trip
            </Link>
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 text-[#1A1A2E] px-4 py-2.5 rounded-lg text-sm font-medium w-full hover:bg-[#EAF3FB]"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 text-gray-500 px-4 py-2.5 rounded-lg text-sm w-full hover:bg-gray-50"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-3 text-[#1A1A2E] border border-[#EAF3FB] px-4 py-2.5 rounded-lg text-sm font-medium w-full"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
