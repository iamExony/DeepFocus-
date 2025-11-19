import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { goalsAPI } from '../services/api';
import { useTimer } from '../context/TimerContext';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';

const Timer = () => {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);
  const [sessionLength, setSessionLength] = useState(25);
  const [breakLength, setBreakLength] = useState(5);
  const { 
    timeLeft, 
    isRunning, 
    isBreak, 
    currentGoal,
    sessionsCompleted,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    stopTimer
  } = useTimer();

  useEffect(() => {
    fetchGoal();
  }, [goalId]);

  // If timer is already running for a different goal, show warning
  useEffect(() => {
    if (currentGoal && currentGoal._id !== goalId) {
      const confirmSwitch = window.confirm(
        `You have an active session for "${currentGoal.name}". Do you want to stop it and start a new session for this goal?`
      );
      if (confirmSwitch) {
        stopTimer();
      } else {
        navigate(`/timer/${currentGoal._id}`);
      }
    }
  }, [currentGoal, goalId, navigate, stopTimer]);

  const fetchGoal = async () => {
    try {
      const response = await goalsAPI.getOne(goalId);
      setGoal(response.data);
    } catch (error) {
      console.error('Failed to fetch goal:', error);
      navigate('/goals');
    }
  };

  const handleToggleTimer = () => {
    if (!currentGoal) {
      // Start new timer
      startTimer(goal, sessionLength, breakLength);
    } else if (isRunning) {
      pauseTimer();
    } else {
      resumeTimer();
    }
  };

  const handleResetTimer = () => {
    resetTimer();
  };

  const handleStopTimer = () => {
    stopTimer();
    setSessionLength(25);
    setBreakLength(5);
  };

  const skipBreak = () => {
    stopTimer();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress based on current goal or local settings
  const currentFocusDuration = currentGoal ? currentGoal.focusDuration || sessionLength : sessionLength;
  const currentBreakDuration = currentGoal ? currentGoal.breakDuration || breakLength : breakLength;
  
  const progress = isBreak
    ? ((currentBreakDuration * 60 - timeLeft) / (currentBreakDuration * 60)) * 100
    : ((currentFocusDuration * 60 - timeLeft) / (currentFocusDuration * 60)) * 100;

  if (!goal) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Goal Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{goal.name}</h1>
          {goal.description && <p className="text-gray-600">{goal.description}</p>}
          <div className="mt-4 flex items-center space-x-6 text-sm">
            <div>
              <span className="text-gray-600">Current Streak: </span>
              <span className="font-bold text-green-600">{goal.currentStreak} days</span>
            </div>
            <div>
              <span className="text-gray-600">Daily Target: </span>
              <span className="font-semibold">{goal.dailyTargetMinutes} minutes</span>
            </div>
            <div>
              <span className="text-gray-600">Sessions Today: </span>
              <span className="font-semibold">{sessionsCompleted}</span>
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center mb-8">
            <div className="inline-block px-4 py-2 bg-primary-100 rounded-full mb-4">
              <span className="text-primary-700 font-semibold">
                {isBreak ? (
                  <span className="flex items-center">
                    <Coffee className="w-4 h-4 mr-2" />
                    Break Time
                  </span>
                ) : (
                  'Focus Session'
                )}
              </span>
            </div>
            
            <div className="relative inline-block">
              <svg className="transform -rotate-90 w-64 h-64">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 120}`}
                  strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                  className={isBreak ? 'text-green-500' : 'text-primary-600'}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl font-bold text-gray-900">{formatTime(timeLeft)}</div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <button
              onClick={handleToggleTimer}
              className={`p-4 rounded-full ${
                isRunning ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-primary-600 hover:bg-primary-700'
              } text-white transition`}
            >
              {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
            </button>
            
            <button
              onClick={handleResetTimer}
              className="p-4 rounded-full bg-gray-300 hover:bg-gray-400 text-gray-700 transition"
            >
              <RotateCcw className="w-8 h-8" />
            </button>

            {isBreak && (
              <button
                onClick={skipBreak}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium"
              >
                Skip Break
              </button>
            )}
          </div>

          {/* Settings */}
          {!currentGoal && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Focus Length (minutes)
                  </label>
                  <input
                    type="number"
                    value={sessionLength}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setSessionLength(val);
                    }}
                    min={1}
                    max={120}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Break Length (minutes)
                  </label>
                  <input
                    type="number"
                    value={breakLength}
                    onChange={(e) => setBreakLength(parseInt(e.target.value) || 1)}
                    min={1}
                    max={30}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Timer;
