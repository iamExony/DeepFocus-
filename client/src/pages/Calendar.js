import React, { useState, useEffect } from 'react';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { progressAPI, goalsAPI } from '../services/api';
import { Trophy, Flame, Target } from 'lucide-react';

const Calendar = () => {
  const [calendarData, setCalendarData] = useState({});
  const [goals, setGoals] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateData, setSelectedDateData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    updateSelectedDateData();
  }, [selectedDate, calendarData]);

  const fetchData = async () => {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
      
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const [calendarRes, goalsRes] = await Promise.all([
        progressAPI.getCalendar({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }),
        goalsAPI.getAll()
      ]);

      setCalendarData(calendarRes.data);
      setGoals(goalsRes.data);
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
    }
  };

  const updateSelectedDateData = () => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    setSelectedDateData(calendarData[dateKey] || []);
  };

  const tileClassName = ({ date }) => {
    const dateKey = date.toISOString().split('T')[0];
    if (calendarData[dateKey] && calendarData[dateKey].length > 0) {
      return 'completed-day';
    }
    return null;
  };

  const tileContent = ({ date }) => {
    const dateKey = date.toISOString().split('T')[0];
    const dayData = calendarData[dateKey];
    
    if (dayData && dayData.length > 0) {
      return (
        <div className="flex justify-center items-center mt-1">
          <Flame className="w-3 h-3 text-white" />
        </div>
      );
    }
    return null;
  };

  const getTotalStats = () => {
    const totalDays = Object.keys(calendarData).length;
    const totalCoins = Object.values(calendarData)
      .flat()
      .reduce((sum, day) => sum + day.coinsEarned, 0);
    
    return { totalDays, totalCoins };
  };

  const stats = getTotalStats();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">Calendar</h1>
          <p className="text-slate-500 mt-1">Track your daily achievements</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Completed Days</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalDays}</p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Coins Earned</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalCoins}</p>
              </div>
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="8" strokeWidth="2" />
                  <path strokeWidth="2" d="M12 8v8M9 12h6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Active Goals</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{goals.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Progress</h2>
              <div className="flex justify-center">
                <ReactCalendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  tileClassName={tileClassName}
                  tileContent={tileContent}
                  className="w-full border-0"
                />
              </div>
              <div className="mt-6 flex items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                  <span className="text-slate-600">Completed</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-slate-200 rounded mr-2"></div>
                  <span className="text-slate-600">Incomplete</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Day */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric'
                })}
              </h2>

              {selectedDateData.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">No activities</p>
              ) : (
                <div className="space-y-3">
                  {selectedDateData.map((activity, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-slate-900 text-sm">{activity.goalName}</span>
                        <Trophy className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{activity.minutesCompleted} min</span>
                        <span className="text-amber-600 font-medium">+{activity.coinsEarned}</span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">Total Coins</span>
                    <span className="text-amber-600 font-bold">
                      +{selectedDateData.reduce((sum, act) => sum + act.coinsEarned, 0)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Goals List */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Active Goals</h2>
              {goals.length === 0 ? (
                <p className="text-sm text-slate-500">No active goals</p>
              ) : (
                <div className="space-y-2">
                  {goals.map((goal) => (
                    <div key={goal._id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-900 truncate">{goal.name}</span>
                      <span className="text-xs text-green-600 font-semibold whitespace-nowrap ml-2">
                        {goal.currentStreak}d
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
