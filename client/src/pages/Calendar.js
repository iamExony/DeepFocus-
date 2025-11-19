import React, { useState, useEffect } from 'react';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { progressAPI, goalsAPI } from '../services/api';
import { Trophy, Flame, Calendar as CalendarIcon } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <CalendarIcon className="w-8 h-8 mr-3 text-primary-600" />
            Progress Calendar
          </h1>
          <p className="text-gray-600 mt-2">Track your daily achievements and streaks</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Completed Days</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalDays}</p>
              </div>
              <Trophy className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Coins Earned</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.totalCoins}</p>
              </div>
              <div className="text-5xl">🪙</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Goals</p>
                <p className="text-3xl font-bold text-primary-600">{goals.length}</p>
              </div>
              <Flame className="w-12 h-12 text-primary-600 opacity-20" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Progress</h2>
              <div className="flex justify-center">
                <ReactCalendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  tileClassName={tileClassName}
                  tileContent={tileContent}
                  className="w-full border-0"
                />
              </div>
              <div className="mt-6 flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                  <span className="text-gray-600">Completed day</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                  <span className="text-gray-600">Incomplete</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Day Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h2>

              {selectedDateData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No activities on this day</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDateData.map((activity, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{activity.goalName}</h3>
                        <Trophy className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Minutes completed:</span>
                          <span className="font-medium">{activity.minutesCompleted}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Coins earned:</span>
                          <span className="font-bold text-yellow-600">+{activity.coinsEarned}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-gray-900">Total Coins:</span>
                      <span className="text-yellow-600 text-lg">
                        +{selectedDateData.reduce((sum, act) => sum + act.coinsEarned, 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Current Goals */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Goals</h2>
              {goals.length === 0 ? (
                <p className="text-gray-500 text-sm">No active goals</p>
              ) : (
                <div className="space-y-3">
                  {goals.map((goal) => (
                    <div key={goal._id} className="border border-gray-200 rounded p-3">
                      <div className="font-medium text-gray-900">{goal.name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Streak: <span className="font-bold text-green-600">{goal.currentStreak} days</span>
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
  );
};

export default Calendar;
