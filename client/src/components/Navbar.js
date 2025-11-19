import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTimer } from '../context/TimerContext';
import { LogOut, Home, Target, Clock, Calendar, User, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isRunning, currentGoal, timeLeft } = useTimer();
  const navigate = useNavigate();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">DeepFocus</span>
            </Link>
            <div className="hidden md:flex ml-10 space-x-4">
              <Link
                to="/dashboard"
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
              <Link
                to="/goals"
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              >
                <Target className="w-4 h-4 mr-2" />
                Goals
              </Link>
              <Link
                to="/calendar"
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isRunning && currentGoal && (
              <Link
                to={`/timer/${currentGoal._id}`}
                className="flex items-center space-x-2 px-3 py-2 bg-green-100 rounded-lg hover:bg-green-200 transition"
              >
                <Clock className="w-4 h-4 text-green-700 animate-pulse" />
                <span className="text-green-700 font-semibold text-sm">
                  {formatTime(timeLeft)} - {currentGoal.name}
                </span>
              </Link>
            )}

            <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-100 rounded-full">
              <span className="text-yellow-600 font-bold">{user?.totalCoins || 0}</span>
              <span className="text-yellow-600 text-sm">coins</span>
            </div>
            
            <div className="px-3 py-1 bg-primary-100 rounded-full">
              <span className="text-primary-700 font-semibold text-sm">{user?.rank || 'Novice'}</span>
            </div>

            {user?.isAdmin && (
              <Link
                to="/admin"
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </Link>
            )}

            <Link
              to="/profile"
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
