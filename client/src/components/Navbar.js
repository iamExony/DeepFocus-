import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTimer } from '../context/TimerContext';
import { LogOut, Home, Target, Calendar, User, Shield, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isRunning, currentGoal, timeLeft } = useTimer();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) => `
    flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
    ${isActive(path) 
      ? 'bg-blue-50 text-blue-700' 
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
  `;

  const mobileNavLinkClass = (path) => `
    flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors w-full
    ${isActive(path) 
      ? 'bg-blue-50 text-blue-700' 
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
  `;

  return (
    <>
      <nav className="bg-white border-b border-slate-200 safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14">
            {/* Logo & Nav Links */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center mr-8">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
                  <span className="text-white font-bold text-sm">DF</span>
                </div>
                <span className="text-lg font-semibold text-slate-900 hidden sm:block">DeepFocus</span>
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex space-x-1">
                <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
                <Link to="/goals" className={navLinkClass('/goals')}>
                  <Target className="w-4 h-4 mr-2" />
                  Goals
                </Link>
                <Link to="/calendar" className={navLinkClass('/calendar')}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Calendar
                </Link>
                {user?.isAdmin && (
                  <Link to="/admin" className={navLinkClass('/admin')}>
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </Link>
                )}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Active Timer Indicator */}
              {isRunning && currentGoal && (
                <Link
                  to={`/timer/${currentGoal._id}`}
                  className="flex items-center space-x-2 px-2 sm:px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 font-medium text-sm">
                    {formatTime(timeLeft)}
                  </span>
                </Link>
              )}

              {/* Stats - Hidden on smallest screens */}
              <div className="hidden sm:flex items-center space-x-2">
                <div className="flex items-center px-2.5 py-1 bg-amber-50 rounded-lg">
                  <span className="text-amber-600 font-semibold text-sm">{user?.totalCoins || 0}</span>
                </div>
                
                <div className="px-2.5 py-1 bg-slate-100 rounded-lg">
                  <span className="text-slate-700 font-medium text-sm">{user?.rank || 'Novice'}</span>
                </div>
              </div>

              {/* Profile - Desktop */}
              <Link
                to="/profile"
                className="hidden md:flex items-center justify-center w-8 h-8 bg-slate-100 rounded-full hover:bg-slate-200 transition"
              >
                <User className="w-4 h-4 text-slate-600" />
              </Link>

              {/* Logout - Desktop */}
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center justify-center w-8 h-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden flex items-center justify-center w-10 h-10 text-slate-600 hover:bg-slate-100 rounded-lg transition touch-target"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl safe-top"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <span className="font-semibold text-slate-900">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-slate-200">
              <p className="font-medium text-slate-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <div className="flex items-center space-x-3 mt-3">
                <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-sm font-medium">
                  {user?.totalCoins || 0} coins
                </span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                  {user?.rank || 'Novice'}
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="p-4 space-y-1">
              <Link 
                to="/dashboard" 
                className={mobileNavLinkClass('/dashboard')}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="w-5 h-5 mr-3" />
                Dashboard
              </Link>
              <Link 
                to="/goals" 
                className={mobileNavLinkClass('/goals')}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Target className="w-5 h-5 mr-3" />
                Goals
              </Link>
              <Link 
                to="/calendar" 
                className={mobileNavLinkClass('/calendar')}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Calendar className="w-5 h-5 mr-3" />
                Calendar
              </Link>
              <Link 
                to="/profile" 
                className={mobileNavLinkClass('/profile')}
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="w-5 h-5 mr-3" />
                Profile
              </Link>
              {user?.isAdmin && (
                <Link 
                  to="/admin" 
                  className={mobileNavLinkClass('/admin')}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Shield className="w-5 h-5 mr-3" />
                  Admin
                </Link>
              )}
            </nav>

            {/* Logout */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 safe-bottom">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
