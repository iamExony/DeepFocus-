import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { goalsAPI, progressAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Target, Clock, TrendingUp, Award, Calendar, Plus } from 'lucide-react';

const Dashboard = () => {
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState(null);
  const [dailyProgress, setDailyProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [goalsRes, statsRes, progressRes] = await Promise.all([
        goalsAPI.getAll(),
        progressAPI.getOverallStats(),
        progressAPI.getDaily()
      ]);

      setGoals(goalsRes.data);
      setStats(statsRes.data);
      setDailyProgress(progressRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.firstName}!</h1>
          <p className="text-gray-600 mt-2">Track your focus sessions and build streaks</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Goals</p>
                <p className="text-3xl font-bold text-primary-600">{stats?.totalActiveGoals || 0}</p>
              </div>
              <Target className="w-12 h-12 text-primary-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Streaks</p>
                <p className="text-3xl font-bold text-green-600">{stats?.totalStreakDays || 0}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Minutes</p>
                <p className="text-3xl font-bold text-blue-600">{stats?.totalMinutes || 0}</p>
              </div>
              <Clock className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-3xl font-bold text-purple-600">{stats?.thisMonthCompletedDays || 0}</p>
              </div>
              <Calendar className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Goals List */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Your Goals</h2>
            <button
              onClick={() => navigate('/goals')}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </button>
          </div>
          <div className="p-6">
            {goals.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No goals yet. Create your first goal to get started!</p>
                <button
                  onClick={() => navigate('/goals')}
                  className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Create Goal
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {goals.map((goal) => (
                  <div
                    key={goal._id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 cursor-pointer transition"
                    onClick={() => navigate(`/timer/${goal._id}`)}
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{goal.name}</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>Daily Target:</span>
                        <span className="font-medium">{goal.dailyTargetMinutes} min</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Current Streak:</span>
                        <span className="font-bold text-green-600">{goal.currentStreak} days</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Best Streak:</span>
                        <span className="font-medium text-blue-600">{goal.longestStreak} days</span>
                      </div>
                    </div>
                    <button
                      className="mt-4 w-full py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/timer/${goal._id}`);
                      }}
                    >
                      Start Session
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Today's Progress */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Today's Progress</h2>
          </div>
          <div className="p-6">
            {dailyProgress.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No progress tracked today yet</p>
            ) : (
              <div className="space-y-4">
                {dailyProgress.map((progress) => (
                  <div key={progress._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{progress.goalId?.name}</h3>
                      {progress.isCompleted && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          Completed
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{progress.minutesCompleted} / {progress.targetMinutes} minutes</span>
                      <span className="font-medium text-yellow-600">+{progress.coinsEarned} coins</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min((progress.minutesCompleted / progress.targetMinutes) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
