import { Outlet, Link, useLocation } from 'react-router-dom';
import { FiHome, FiGrid, FiInfo, FiMail, FiLogIn, FiUserPlus, FiAward } from 'react-icons/fi';
import { useState, useEffect } from 'react';

const MainLayout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Header */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl py-3'
          : isHomePage 
            ? 'bg-gradient-to-r from-blue-900/70 via-indigo-900/70 to-purple-900/70 backdrop-blur-lg py-4' 
            : 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg py-4'
      }`}>
        <div className="container-custom">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-3 group"
            >
              {/* Logo Icon with Animation */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all group-hover:scale-110 group-hover:rotate-3">
                  <FiAward className="text-white" size={28} />
                </div>
              </div>
              
              {/* Logo Text */}
              <div className="flex flex-col">
                <span className={`text-2xl font-black tracking-tight transition-colors ${
                  scrolled || !isHomePage
                    ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent'
                    : 'text-white'
                }`}>
                  EXCEL
                </span>
                <span className={`text-xs font-semibold tracking-wider transition-colors ${
                  scrolled || !isHomePage
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-amber-300'
                }`}>
                  TUTORING SERVICE
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
                  scrolled || !isHomePage
                    ? location.pathname === '/'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20'
                    : location.pathname === '/'
                      ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                      : 'text-white hover:bg-white/10 hover:shadow-lg backdrop-blur-sm'
                }`}
              >
                <FiHome size={18} />
                <span className="hidden md:inline">Home</span>
              </Link>

              <a
                href="#services"
                className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
                  scrolled || !isHomePage
                    ? 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20'
                    : 'text-white hover:bg-white/10 hover:shadow-lg backdrop-blur-sm'
                }`}
              >
                <FiGrid size={18} />
                <span className="hidden md:inline">Services</span>
              </a>

              <a
                href="#about"
                className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
                  scrolled || !isHomePage
                    ? 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20'
                    : 'text-white hover:bg-white/10 hover:shadow-lg backdrop-blur-sm'
                }`}
              >
                <FiInfo size={18} />
                <span className="hidden md:inline">About</span>
              </a>

              <a
                href="#contact"
                className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
                  scrolled || !isHomePage
                    ? 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20'
                    : 'text-white hover:bg-white/10 hover:shadow-lg backdrop-blur-sm'
                }`}
              >
                <FiMail size={18} />
                <span className="hidden md:inline">Contact</span>
              </a>

              {/* Divider */}
              <div className={`h-8 w-px mx-2 ${
                scrolled || !isHomePage
                  ? 'bg-gray-300 dark:bg-gray-700'
                  : 'bg-white/20'
              }`}></div>

              <Link
                to="/login"
                className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
                  scrolled || !isHomePage
                    ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-2 border-gray-300 dark:border-gray-700'
                    : 'text-white hover:bg-white/10 border-2 border-white/30 hover:border-white/50 backdrop-blur-sm'
                }`}
              >
                <FiLogIn size={18} />
                <span className="hidden md:inline">Login</span>
              </Link>

              <Link
                to="/register"
                className="relative px-6 py-2.5 rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2 overflow-hidden group"
              >
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 transition-transform group-hover:scale-110"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                
                {/* Content */}
                <FiUserPlus className="relative z-10 text-white" size={18} />
                <span className="relative z-10 text-white hidden md:inline">Sign Up</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - No padding for home page */}
      <div className={isHomePage ? '' : 'pt-24'}>
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
