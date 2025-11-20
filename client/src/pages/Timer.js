import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { goalsAPI } from '../services/api';
import { useTimer } from '../context/TimerContext';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';

const Timer = () => {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);
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
    stopTimer,
    sessionPlan,
    currentSessionIndex,
    skipBreak
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
      startTimer(goal);
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
  };

  const handleSkipBreak = () => {
    stopTimer();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


  // Calculate progress based on current session in plan
  const currentSession = sessionPlan && sessionPlan.length > 0 ? sessionPlan[currentSessionIndex] : null;
  const sessionTotalSeconds = currentSession ? currentSession.duration * 60 : 1;
  const progress = ((sessionTotalSeconds - timeLeft) / sessionTotalSeconds) * 100;

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
                {currentSession?.type === 'break' ? (
                  <span className="flex items-center">
                    <Coffee className="w-4 h-4 mr-2" />
                    Break Time
                  </span>
                ) : (
                  'Focus Session'
                )}
              </span>
            </div>
            <div className="mb-2 text-gray-600 text-sm">
              {sessionPlan.length > 0 && (
                <>
                  Session {currentSessionIndex + 1} of {sessionPlan.length} ({currentSession?.type === 'break' ? 'Break' : 'Focus'})<br />
                  {sessionPlan.map((s, i) => (
                    <span key={i} className={`inline-block w-3 h-3 mx-0.5 rounded-full ${i === currentSessionIndex ? (s.type === 'break' ? 'bg-green-500' : 'bg-primary-600') : 'bg-gray-300'}`}></span>
                  ))}
                </>
              )}
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
                  className={currentSession?.type === 'break' ? 'text-green-500' : 'text-primary-600'}
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
                onClick={handleSkipBreak}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium"
              >
                Skip Break
              </button>
            )}
          </div>

          {/* Settings removed: session structure is now automatic based on goal */}
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
