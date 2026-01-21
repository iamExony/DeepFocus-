import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { goalsAPI, progressAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Target, Clock, TrendingUp, Calendar, Plus, Play, ChevronRight } from 'lucide-react';

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
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome back, {user?.firstName}
          </h1>
          <p className="text-slate-500 mt-1">Here's your focus overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Active Goals</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.totalActiveGoals || 0}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Streak Days</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.totalStreakDays || 0}</p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Minutes</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.totalMinutes || 0}</p>
              </div>
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">This Month</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.thisMonthCompletedDays || 0}</p>
              </div>
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Goals Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Your Goals</h2>
                <button
                  onClick={() => navigate('/goals')}
                  className="flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  New Goal
                </button>
              </div>
              
              <div className="p-5">
                {goals.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Target className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-600 mb-4">No goals yet. Create your first one!</p>
                    <button
                      onClick={() => navigate('/goals')}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                    >
                      Create Goal
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {goals.slice(0, 5).map((goal) => (
                      <div
                        key={goal._id}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-slate-50 cursor-pointer transition group"
                        onClick={() => navigate(`/timer/${goal._id}`)}
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-slate-900 truncate">{goal.name}</h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500">
                            <span>{goal.dailyTargetMinutes} min/day</span>
                            <span className="text-green-600 font-medium">{goal.currentStreak} day streak</span>
                          </div>
                        </div>
                        <button
                          className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/timer/${goal._id}`);
                          }}
                        >
                          <Play className="w-4 h-4 ml-0.5" />
                        </button>
                      </div>
                    ))}
                    {goals.length > 5 && (
                      <button
                        onClick={() => navigate('/goals')}
                        className="w-full py-3 text-sm text-slate-500 hover:text-blue-600 transition flex items-center justify-center"
                      >
                        View all goals
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Today's Progress */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="px-5 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Today's Progress</h2>
              </div>
              
              <div className="p-5">
                {dailyProgress.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-8">
                    No progress today yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {dailyProgress.map((progress) => (
                      <div key={progress._id}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-900 truncate">
                            {progress.goalId?.name}
                          </span>
                          {progress.isCompleted && (
                            <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                              Done
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                          <span>{progress.minutesCompleted} / {progress.targetMinutes} min</span>
                          <span className="text-amber-600">+{progress.coinsEarned}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              progress.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                            }`}
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
      </div>
    </div>
  );
};

export default Dashboard;
