import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, PenTool, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="w-full bg-deepline text-vellum border-b border-linework/20 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-3">
            <Link to="/dashboard" className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-linework rounded-sm">
              {/* Optional logo image: assuming user places it in public/logo.png */}
              <div className="w-8 h-8 rounded-sm overflow-hidden flex items-center justify-center bg-vellum/5 group-hover:bg-vellum/10 transition-colors">
                <img 
                  src="https://www.image2url.com/r2/default/images/1781709817080-6b6a72ff-ea71-48d3-bbb7-365d84ba6148.png" 
                  alt="Linework Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to icon if no image
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <PenTool className="w-5 h-5 text-linework hidden" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-vellum group-hover:text-linework transition-colors">
                LINEWORK
              </span>
            </Link>
            
            {user && (
              <div className="hidden md:flex ml-8 space-x-4 font-mono text-sm tracking-widest uppercase">
                <Link to="/dashboard" className="text-vellum/70 hover:text-linework transition-colors">Dashboard</Link>
                <Link to="/projects" className="text-vellum/70 hover:text-linework transition-colors">Projects</Link>
              </div>
            )}
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-mono tracking-wider text-vellum/50 hidden sm:block">
                {user.fullName}
              </span>
              <button
                onClick={handleLogout}
                className="hidden md:block p-2 text-vellum/70 hover:text-signal-red transition-colors group relative"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5" />
                <span className="absolute -bottom-8 right-0 bg-graphite text-vellum text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Logout
                </span>
              </button>
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden p-2 text-vellum hover:text-linework transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {user && isMenuOpen && (
        <div className="md:hidden border-t border-linework/20 bg-deepline absolute w-full left-0 z-50">
          <div className="px-4 py-4 space-y-4 font-mono text-sm tracking-widest uppercase flex flex-col">
            <Link 
              to="/dashboard" 
              className="block text-vellum/70 hover:text-linework transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/projects" 
              className="block text-vellum/70 hover:text-linework transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Projects
            </Link>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                handleLogout();
              }}
              className="text-left text-signal-red hover:text-signal-red/80 transition-colors py-2 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
